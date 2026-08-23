from pathlib import Path
import numpy as np
import pandas as pd
from fastapi import APIRouter


# ============================================================
# CONFIG
# ============================================================

FEATURE_DIR = Path("data/features")
OUTPUT_DIR = Path("data/recommendations")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "recommendations.csv"

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


# ============================================================
# INVENTORY + VENDOR RECOMMENDATIONS
# ============================================================

def generate_inventory_recommendations():

    inventory_file = FEATURE_DIR / "inventory_features.csv"
    vendor_file = FEATURE_DIR / "vendor_features.csv"

    if not inventory_file.exists():
        print("Inventory feature file not found.")
        return pd.DataFrame()

    inventory = pd.read_csv(inventory_file)

    # --------------------------------------------------------
    # Load vendor information if available
    # --------------------------------------------------------

    if vendor_file.exists():

        vendors = pd.read_csv(vendor_file)

        vendor_columns = [
            col for col in [
                "vendor_id",
                "vendor_name",
                "avg_lead_time_days",
                "cost_per_item"
            ]
            if col in vendors.columns
        ]

        if "vendor_id" in inventory.columns and vendor_columns:

            inventory = inventory.merge(
                vendors[vendor_columns].drop_duplicates(
                    subset=["vendor_id"]
                ),
                on="vendor_id",
                how="left"
            )

    recommendations = []

    for _, row in inventory.iterrows():

        # ----------------------------------------------------
        # Basic inventory information
        # ----------------------------------------------------

        item_name = row.get(
            "item_name",
            "Unknown Item"
        )

        item_id = row.get(
            "item_id",
            None
        )

        vendor_id = row.get(
            "vendor_id",
            None
        )

        vendor_name = row.get(
            "vendor_name",
            "Unknown Vendor"
        )

        current_stock = float(
            row.get("current_stock", 0) or 0
        )

        min_required = float(
            row.get("min_required", 0) or 0
        )

        max_capacity = float(
            row.get("max_capacity", 0) or 0
        )

        avg_usage = float(
            row.get("avg_usage_per_day", 0) or 0
        )

        lead_time = float(
            row.get("restock_lead_time", 0) or 0
        )

        # Use vendor lead time when inventory lead time
        # isn't available.

        vendor_lead_time = row.get(
            "avg_lead_time_days",
            np.nan
        )

        if pd.notna(vendor_lead_time):

            vendor_lead_time = float(
                vendor_lead_time
            )

            if lead_time <= 0:
                lead_time = vendor_lead_time

        # ----------------------------------------------------
        # Cost
        # ----------------------------------------------------

        unit_cost = row.get(
            "unit_cost",
            np.nan
        )

        if pd.isna(unit_cost):

            unit_cost = row.get(
                "cost_per_item",
                0
            )

        unit_cost = float(
            unit_cost or 0
        )

        # ----------------------------------------------------
        # Prediction-derived values
        # ----------------------------------------------------

        stockout_risk = float(
            row.get(
                "stockout_risk",
                0
            ) or 0
        )

        days_to_stockout = float(
            row.get(
                "estimated_days_to_stockout",
                np.inf
            )
            or np.inf
        )

        reorder_quantity = float(
            row.get(
                "recommended_reorder_quantity",
                0
            )
            or 0
        )

        # ----------------------------------------------------
        # Fallback reorder quantity
        # ----------------------------------------------------

        if reorder_quantity <= 0:

            if max_capacity > 0:

                target_stock = max_capacity

            else:

                target_stock = (
                    min_required
                    +
                    (
                        avg_usage
                        * max(lead_time, 1)
                        * 2
                    )
                )

            reorder_quantity = max(
                target_stock - current_stock,
                0
            )

        reorder_quantity = round(
            reorder_quantity,
            2
        )

        # ----------------------------------------------------
        # Risk classification
        # ----------------------------------------------------

        if stockout_risk >= 1:

            risk_level = "CRITICAL"

            action = "ORDER_IMMEDIATELY"

            priority_score = 100

            reason = (
                f"{item_name} has critical "
                f"stock-out risk."
            )

        elif days_to_stockout <= lead_time:

            risk_level = "HIGH"

            action = "ORDER_SOON"

            priority_score = 80

            reason = (
                f"Projected stock-out in "
                f"{days_to_stockout:.1f} days, "
                f"before supplier lead time of "
                f"{lead_time:.1f} days."
            )

        elif days_to_stockout <= lead_time * 2:

            risk_level = "MEDIUM"

            action = "MONITOR_AND_PLAN"

            priority_score = 50

            reason = (
                f"Projected stock-out in "
                f"{days_to_stockout:.1f} days."
            )

        else:

            risk_level = "LOW"

            action = "NORMAL_MONITORING"

            priority_score = 20

            reason = (
                "Current inventory appears sufficient."
            )

        # ----------------------------------------------------
        # Reorder cost
        # ----------------------------------------------------

        estimated_reorder_cost = round(
            reorder_quantity * unit_cost,
            2
        )

        # ----------------------------------------------------
        # Priority
        # ----------------------------------------------------

        if risk_level == "CRITICAL":

            priority = "URGENT"

        elif risk_level == "HIGH":

            priority = "HIGH"

        elif risk_level == "MEDIUM":

            priority = "MEDIUM"

        else:

            priority = "LOW"

        recommendations.append({

            "item_id": item_id,

            "item_name": item_name,

            "vendor_id": vendor_id,

            "vendor_name": vendor_name,

            "current_stock": round(
                current_stock,
                2
            ),

            "minimum_required": round(
                min_required,
                2
            ),

            "average_daily_usage": round(
                avg_usage,
                2
            ),

            "lead_time_days": round(
                lead_time,
                2
            ),

            "estimated_days_to_stockout": (
                round(days_to_stockout, 2)
                if np.isfinite(days_to_stockout)
                else None
            ),

            "recommended_reorder_quantity":
                reorder_quantity,

            "unit_cost":
                round(unit_cost, 2),

            "estimated_reorder_cost":
                estimated_reorder_cost,

            "risk_level":
                risk_level,

            "priority":
                priority,

            "priority_score":
                priority_score,

            "action":
                action,

            "reason":
                reason,
        })

    result = pd.DataFrame(
        recommendations
    )

    # Highest priority first

    if not result.empty:

        result = result.sort_values(
            [
                "priority_score",
                "estimated_reorder_cost"
            ],
            ascending=[
                False,
                False
            ]
        )

    return result


# ============================================================
# BED RECOMMENDATION
# ============================================================

def generate_bed_recommendation():

    file_path = FEATURE_DIR / "timeseries_features.csv"

    if not file_path.exists():
        return {}

    df = pd.read_csv(file_path)

    if df.empty:
        return {}

    latest = (
        df.sort_values("timestamp")
        .iloc[-1]
    )

    occupancy = float(
        latest.get(
            "bed_occupancy",
            0
        ) or 0
    )

    admissions = float(
        latest.get(
            "admissions",
            0
        ) or 0
    )

    staff_count = float(
        latest.get(
            "staff_count",
            0
        ) or 0
    )

    if occupancy >= 90:

        risk = "CRITICAL"

        action = "URGENT_CAPACITY_MANAGEMENT"

        reason = (
            "Bed occupancy is critically high. "
            "Consider urgent capacity expansion, "
            "patient flow management, or transfers."
        )

    elif occupancy >= 85:

        risk = "HIGH"

        action = "PREPARE_CAPACITY"

        reason = (
            "Bed occupancy is high. "
            "Prepare additional capacity."
        )

    elif occupancy >= 75:

        risk = "MEDIUM"

        action = "MONITOR_CAPACITY"

        reason = (
            "Bed occupancy is approaching "
            "high utilization."
        )

    else:

        risk = "LOW"

        action = "NORMAL_MONITORING"

        reason = (
            "Bed occupancy is currently manageable."
        )

    return {

        "timestamp":
            str(latest.get("timestamp")),

        "bed_occupancy":
            round(occupancy, 2),

        "admissions":
            admissions,

        "staff_count":
            staff_count,

        "risk_level":
            risk,

        "action":
            action,

        "reason":
            reason,
    }


# ============================================================
# STAFF RECOMMENDATION
# ============================================================

def generate_staff_recommendation():

    file_path = FEATURE_DIR / "staff_features.csv"

    if not file_path.exists():
        return {}

    df = pd.read_csv(file_path)

    if df.empty:
        return {}

    overtime = pd.to_numeric(
        df.get(
            "overtime_hours",
            0
        ),
        errors="coerce"
    )

    patients_per_hour = pd.to_numeric(
        df.get(
            "patients_per_hour",
            0
        ),
        errors="coerce"
    )

    avg_overtime = overtime.mean()

    avg_patients_per_hour = (
        patients_per_hour.mean()
    )

    if pd.isna(avg_overtime):
        avg_overtime = 0

    if pd.isna(avg_patients_per_hour):
        avg_patients_per_hour = 0

    if avg_overtime >= 3:

        risk = "HIGH"

        action = "REDISTRIBUTE_STAFF"

        reason = (
            "Average staff overtime is high. "
            "Consider redistributing workload."
        )

    elif avg_overtime >= 1.5:

        risk = "MEDIUM"

        action = "MONITOR_STAFF_WORKLOAD"

        reason = (
            "Staff overtime is elevated."
        )

    else:

        risk = "LOW"

        action = "NORMAL_MONITORING"

        reason = (
            "Staff workload appears manageable."
        )

    return {

        "average_overtime_hours":
            round(
                float(avg_overtime),
                2
            ),

        "average_patients_per_hour":
            round(
                float(avg_patients_per_hour),
                2
            ),

        "risk_level":
            risk,

        "action":
            action,

        "reason":
            reason,
    }


# ============================================================
# MASTER ENGINE
# ============================================================

def generate_recommendations():

    inventory = (
        generate_inventory_recommendations()
    )

    if not inventory.empty:

        inventory.to_csv(
            OUTPUT_FILE,
            index=False
        )

    bed = (
        generate_bed_recommendation()
    )

    staff = (
        generate_staff_recommendation()
    )

    return {

        "inventory":
            inventory,

        "bed":
            bed,

        "staff":
            staff,
    }


# ============================================================
# FASTAPI ENDPOINT
# ============================================================

@router.get("")
def get_recommendations():

    result = (
        generate_recommendations()
    )

    inventory = result["inventory"]

    return {

        "status":
            "success",

        "inventory":
            inventory.to_dict(
                orient="records"
            ),

        "bed":
            result["bed"],

        "staff":
            result["staff"],
    }


# ============================================================
# DIRECT EXECUTION
# ============================================================

if __name__ == "__main__":

    print(
        "\n=========================================="
    )

    print(
        "HEALTHGRID DECISION ENGINE"
    )

    print(
        "=========================================="
    )

    result = (
        generate_recommendations()
    )

    inventory = result["inventory"]

    print(
        "\n------------------------------------------"
    )

    print(
        "TOP INVENTORY RECOMMENDATIONS"
    )

    print(
        "------------------------------------------"
    )

    if not inventory.empty:

        print(
            inventory[
                [
                    "item_name",
                    "vendor_name",
                    "risk_level",
                    "priority",
                    "action",
                    "recommended_reorder_quantity",
                    "estimated_reorder_cost",
                ]
            ]
            .head(10)
            .to_string(index=False)
        )

    print(
        "\n------------------------------------------"
    )

    print(
        "BED RECOMMENDATION"
    )

    print(
        "------------------------------------------"
    )

    print(
        result["bed"]
    )

    print(
        "\n------------------------------------------"
    )

    print(
        "STAFF RECOMMENDATION"
    )

    print(
        "------------------------------------------"
    )

    print(
        result["staff"]
    )

    print(
        "\n=========================================="
    )

    print(
        "DECISION ENGINE COMPLETE"
    )

    print(
        "=========================================="
    )