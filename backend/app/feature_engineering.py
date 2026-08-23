import sqlite3
from pathlib import Path

import numpy as np
import pandas as pd


# ============================================================
# CONFIG
# ============================================================

DB_PATH = Path("healthgrid.db")
OUTPUT_DIR = Path("data/features")
OUTPUT_FILE = OUTPUT_DIR / "healthgrid_features.csv"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# DATABASE HELPER
# ============================================================

def load_table(connection, table_name):
    try:
        df = pd.read_sql_query(
            f"SELECT * FROM {table_name}",
            connection
        )
        print(f"Loaded {table_name}: {len(df)} rows")
        return df

    except Exception as e:
        print(f"Could not load {table_name}: {e}")
        return pd.DataFrame()


# ============================================================
# PHARMACY FEATURES
# ============================================================

def create_pharmacy_features(df):

    if df.empty:
        return pd.DataFrame()

    print("\nCreating pharmacy features...")

    df = df.copy()

    # Dates
    if "added_date" in df.columns:
        df["added_date"] = pd.to_datetime(
            df["added_date"],
            errors="coerce"
        )

    # Numeric fields
    for col in ["sales_sheet", "sales_pack", "sheet"]:
        if col in df.columns:
            df[col] = pd.to_numeric(
                df[col],
                errors="coerce"
            ).fillna(0)

    # Total quantity sold
    df["total_sales_quantity"] = (
        df.get("sales_sheet", 0).fillna(0)
        + df.get("sales_pack", 0).fillna(0)
    )

    # Date-based features
    if "added_date" in df.columns:

        df["sales_year"] = df["added_date"].dt.year
        df["sales_month"] = df["added_date"].dt.month
        df["sales_day"] = df["added_date"].dt.day
        df["sales_day_of_week"] = df["added_date"].dt.dayofweek

    # Product frequency
    if "name" in df.columns:
        product_counts = (
            df.groupby("name")["total_sales_quantity"]
            .transform("sum")
        )

        df["product_total_sales"] = product_counts

    # Keep useful features
    columns = [
        "name",
        "dosage_form",
        "transaction_type",
        "total_sales_quantity",
        "product_total_sales",
        "sales_year",
        "sales_month",
        "sales_day",
        "sales_day_of_week",
    ]

    columns = [
        col for col in columns
        if col in df.columns
    ]

    return df[columns]


# ============================================================
# INVENTORY FEATURES
# ============================================================

def create_inventory_features(df):

    if df.empty:
        return pd.DataFrame()

    print("\nCreating inventory features...")

    df = df.copy()

    numeric_columns = [
        "current_stock",
        "min_required",
        "max_capacity",
        "unit_cost",
        "avg_usage_per_day",
        "restock_lead_time",
    ]

    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(
                df[col],
                errors="coerce"
            ).fillna(0)

    # Stock coverage in days
    df["stock_coverage_days"] = np.where(
        df["avg_usage_per_day"] > 0,
        df["current_stock"] / df["avg_usage_per_day"],
        np.inf,
    )

    # Stock level percentage
    df["stock_capacity_ratio"] = np.where(
        df["max_capacity"] > 0,
        df["current_stock"] / df["max_capacity"],
        0,
    )

    # Minimum-stock ratio
    df["minimum_stock_ratio"] = np.where(
        df["min_required"] > 0,
        df["current_stock"] / df["min_required"],
        0,
    )

    # Stock-out risk
    df["stockout_risk"] = np.where(
        df["current_stock"] <= df["min_required"],
        1,
        0,
    )

    # Expected consumption during lead time
    df["lead_time_demand"] = (
        df["avg_usage_per_day"]
        * df["restock_lead_time"]
    )

    # Safety margin
    df["stock_surplus"] = (
        df["current_stock"]
        - df["lead_time_demand"]
    )

    # Estimated days until stockout
    df["estimated_days_to_stockout"] = np.where(
        df["avg_usage_per_day"] > 0,
        df["current_stock"] / df["avg_usage_per_day"],
        np.inf,
    )

    # Estimated reorder quantity
    df["recommended_reorder_quantity"] = np.maximum(
        df["max_capacity"] - df["current_stock"],
        0,
    )

    columns = [
        "item_id",
        "item_type",
        "item_name",
        "current_stock",
        "min_required",
        "max_capacity",
        "unit_cost",
        "avg_usage_per_day",
        "restock_lead_time",
        "vendor_id",
        "stock_coverage_days",
        "stock_capacity_ratio",
        "minimum_stock_ratio",
        "stockout_risk",
        "lead_time_demand",
        "stock_surplus",
        "estimated_days_to_stockout",
        "recommended_reorder_quantity",
    ]

    columns = [
        col for col in columns
        if col in df.columns
    ]

    return df[columns]


# ============================================================
# HOSPITAL TIME-SERIES FEATURES
# ============================================================

def create_timeseries_features(df):

    if df.empty:
        return pd.DataFrame()

    print("\nCreating hospital time-series features...")

    df = df.copy()

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    numeric_columns = [
        "admissions",
        "discharges",
        "staff_count",
        "flu_cases",
        "bed_occupancy",
    ]

    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(
                df[col],
                errors="coerce"
            )

    df = df.sort_values("timestamp")

    # Calendar features
    df["hour"] = df["timestamp"].dt.hour
    df["day"] = df["timestamp"].dt.day
    df["month"] = df["timestamp"].dt.month
    df["day_of_week"] = df["timestamp"].dt.dayofweek

    # Patient flow
    df["net_patient_flow"] = (
        df["admissions"] - df["discharges"]
    )

    # Staff-to-admission ratio
    df["staff_per_admission"] = np.where(
        df["admissions"] > 0,
        df["staff_count"] / df["admissions"],
        0,
    )

    # Rolling demand
    df["admissions_24h_avg"] = (
        df["admissions"]
        .rolling(24, min_periods=1)
        .mean()
    )

    df["admissions_7d_avg"] = (
        df["admissions"]
        .rolling(24 * 7, min_periods=1)
        .mean()
    )

    # Rolling flu cases
    df["flu_cases_24h_avg"] = (
        df["flu_cases"]
        .rolling(24, min_periods=1)
        .mean()
    )

    # Bed pressure
    df["bed_pressure"] = (
        df["bed_occupancy"] / 100
    )

    df["high_bed_occupancy"] = np.where(
        df["bed_occupancy"] >= 85,
        1,
        0,
    )

    return df


# ============================================================
# STAFF FEATURES
# ============================================================

def create_staff_features(df):

    if df.empty:
        return pd.DataFrame()

    print("\nCreating staff features...")

    df = df.copy()

    numeric_columns = [
        "hours_worked",
        "patients_assigned",
        "overtime_hours",
    ]

    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(
                df[col],
                errors="coerce"
            ).fillna(0)

    # Patients handled per working hour
    df["patients_per_hour"] = np.where(
        df["hours_worked"] > 0,
        df["patients_assigned"]
        / df["hours_worked"],
        0,
    )

    # Overtime ratio
    df["overtime_ratio"] = np.where(
        df["hours_worked"] > 0,
        df["overtime_hours"]
        / df["hours_worked"],
        0,
    )

    # Workload indicator
    df["staff_workload_score"] = (
        df["patients_assigned"]
        + df["overtime_hours"]
    )

    columns = [
        "staff_id",
        "staff_type",
        "shift_date",
        "hours_worked",
        "patients_assigned",
        "overtime_hours",
        "patients_per_hour",
        "overtime_ratio",
        "staff_workload_score",
    ]

    columns = [
        col for col in columns
        if col in df.columns
    ]

    return df[columns]


# ============================================================
# PATIENT FEATURES
# ============================================================

def create_patient_features(df):

    if df.empty:
        return pd.DataFrame()

    print("\nCreating patient features...")

    df = df.copy()

    df["admission_date"] = pd.to_datetime(
        df["admission_date"],
        errors="coerce"
    )

    df["discharge_date"] = pd.to_datetime(
        df["discharge_date"],
        errors="coerce"
    )

    df["bed_days"] = pd.to_numeric(
        df["bed_days"],
        errors="coerce"
    ).fillna(0)

    # Length of stay
    df["length_of_stay"] = (
        df["discharge_date"]
        - df["admission_date"]
    ).dt.total_seconds() / 86400

    df["length_of_stay"] = (
        df["length_of_stay"]
        .fillna(df["bed_days"])
    )

    # Admission calendar features
    df["admission_month"] = (
        df["admission_date"].dt.month
    )

    df["admission_day_of_week"] = (
        df["admission_date"].dt.dayofweek
    )

    return df


# ============================================================
# VENDOR FEATURES
# ============================================================

def create_vendor_features(df):

    if df.empty:
        return pd.DataFrame()

    print("\nCreating vendor features...")

    df = df.copy()

    df["avg_lead_time_days"] = pd.to_numeric(
        df["avg_lead_time_days"],
        errors="coerce"
    ).fillna(0)

    df["cost_per_item"] = pd.to_numeric(
        df["cost_per_item"],
        errors="coerce"
    ).fillna(0)

    df["last_order_date"] = pd.to_datetime(
        df["last_order_date"],
        errors="coerce"
    )

    df["next_delivery_date"] = pd.to_datetime(
        df["next_delivery_date"],
        errors="coerce"
    )

    # Planned delivery gap
    df["delivery_gap_days"] = (
        df["next_delivery_date"]
        - df["last_order_date"]
    ).dt.days

    return df


# ============================================================
# FINANCIAL FEATURES
# ============================================================

def create_financial_features(df):

    if df.empty:
        return pd.DataFrame()

    print("\nCreating financial features...")

    df = df.copy()

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    ).fillna(0)

    df["month"] = df["date"].dt.month
    df["year"] = df["date"].dt.year

    return df


# ============================================================
# BUILD MASTER FEATURE DATASET
# ============================================================

def build_features():

    connection = sqlite3.connect(DB_PATH)

    pharmacy = load_table(
        connection,
        "medicine_transactions"
    )

    inventory = load_table(
        connection,
        "hospital_inventory"
    )

    timeseries = load_table(
        connection,
        "hospital_timeseries"
    )

    staff = load_table(
        connection,
        "hospital_staff"
    )

    patients = load_table(
        connection,
        "patient_data"
    )

    vendors = load_table(
        connection,
        "vendors"
    )

    financial = load_table(
        connection,
        "financial_data"
    )

    connection.close()

    # Create individual feature groups
    pharmacy_features = create_pharmacy_features(
        pharmacy
    )

    inventory_features = create_inventory_features(
        inventory
    )

    timeseries_features = create_timeseries_features(
        timeseries
    )

    staff_features = create_staff_features(
        staff
    )

    patient_features = create_patient_features(
        patients
    )

    vendor_features = create_vendor_features(
        vendors
    )

    financial_features = create_financial_features(
        financial
    )

    # ========================================================
    # SAVE INDIVIDUAL FEATURE GROUPS
    # ========================================================

    feature_groups = {
        "pharmacy_features": pharmacy_features,
        "inventory_features": inventory_features,
        "timeseries_features": timeseries_features,
        "staff_features": staff_features,
        "patient_features": patient_features,
        "vendor_features": vendor_features,
        "financial_features": financial_features,
    }

    for name, dataframe in feature_groups.items():

        if not dataframe.empty:

            path = OUTPUT_DIR / f"{name}.csv"

            dataframe.to_csv(
                path,
                index=False
            )

            print(
                f"Saved {name}: "
                f"{dataframe.shape}"
            )

    # ========================================================
    # MASTER FEATURE SUMMARY
    # ========================================================

    summary = []

    for name, dataframe in feature_groups.items():

        if dataframe.empty:
            continue

        summary.append({
            "feature_group": name,
            "rows": len(dataframe),
            "features": len(dataframe.columns),
        })

    summary_df = pd.DataFrame(summary)

    summary_df.to_csv(
        OUTPUT_DIR / "feature_summary.csv",
        index=False
    )

    # ========================================================
    # MASTER FEATURE FILE
    # ========================================================
    #
    # We don't blindly merge unrelated datasets.
    # Instead, create a compact master feature table from
    # inventory + latest time-series information.
    #

    if not inventory_features.empty:

        master = inventory_features.copy()

        # Latest hospital conditions
        if not timeseries_features.empty:

            latest_ts = (
                timeseries_features
                .sort_values("timestamp")
                .iloc[-1]
            )

            master["latest_admissions"] = (
                latest_ts.get("admissions", np.nan)
            )

            master["latest_discharges"] = (
                latest_ts.get("discharges", np.nan)
            )

            master["latest_staff_count"] = (
                latest_ts.get("staff_count", np.nan)
            )

            master["latest_flu_cases"] = (
                latest_ts.get("flu_cases", np.nan)
            )

            master["latest_bed_occupancy"] = (
                latest_ts.get("bed_occupancy", np.nan)
            )

            master["latest_bed_pressure"] = (
                latest_ts.get("bed_pressure", np.nan)
            )

        # Inventory-based prediction targets/features
        master["demand_pressure"] = (
            master["avg_usage_per_day"]
            * (
                1
                + master["stockout_risk"]
            )
        )

        master["inventory_risk_score"] = (
            master["stockout_risk"] * 0.5
            + (
                1
                / master["minimum_stock_ratio"]
                .replace(0, np.nan)
            ).fillna(1) * 0.5
        )

        master.to_csv(
            OUTPUT_FILE,
            index=False
        )

        print(
            f"\nMASTER FEATURES SAVED: "
            f"{OUTPUT_FILE}"
        )

        print(
            f"Master shape: {master.shape}"
        )

    print("\n==========================================")
    print("FEATURE ENGINEERING COMPLETE")
    print("==========================================")


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    build_features()