from pathlib import Path

import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


# ============================================================
# CONFIG
# ============================================================

MODEL_DIR = Path("models")
FEATURE_DIR = Path("data/features")

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"],
)


# ============================================================
# LOAD MODELS
# ============================================================

def load_model(filename):
    path = MODEL_DIR / filename

    if not path.exists():
        raise FileNotFoundError(
            f"Model not found: {path}"
        )

    return joblib.load(path)


medicine_model = load_model(
    "medicine_demand_model.joblib"
)

stockout_model = load_model(
    "stockout_model.joblib"
)

days_stockout_model = load_model(
    "days_to_stockout_model.joblib"
)

bed_model = load_model(
    "bed_occupancy_model.joblib"
)


# ============================================================
# REQUEST MODELS
# ============================================================

class MedicineDemandRequest(BaseModel):
    sales_year: int
    sales_month: int
    demand_lag_1: float
    demand_lag_2: float
    demand_lag_3: float
    demand_rolling_3: float


class StockoutRequest(BaseModel):
    current_stock: float
    min_required: float
    max_capacity: float
    unit_cost: float
    avg_usage_per_day: float
    restock_lead_time: float
    stock_coverage_days: float
    stock_capacity_ratio: float
    minimum_stock_ratio: float
    lead_time_demand: float
    stock_surplus: float
    estimated_days_to_stockout: float
    recommended_reorder_quantity: float


class DaysToStockoutRequest(BaseModel):
    current_stock: float
    min_required: float
    max_capacity: float
    unit_cost: float
    avg_usage_per_day: float
    restock_lead_time: float
    stock_coverage_days: float
    stock_capacity_ratio: float
    minimum_stock_ratio: float
    stockout_risk: float
    lead_time_demand: float
    stock_surplus: float
    recommended_reorder_quantity: float


class BedOccupancyRequest(BaseModel):
    bed_occupancy_lag_1: float
    bed_occupancy_lag_2: float
    bed_occupancy_lag_24: float
    admissions_lag_1: float
    admissions_lag_24: float
    staff_count: float
    flu_cases: float
    hour: int
    day_of_week: int
    month: int


# ============================================================
# MEDICINE DEMAND
# ============================================================

@router.post("/medicine-demand")
def predict_medicine_demand(
    request: MedicineDemandRequest
):

    data = pd.DataFrame([{
        "sales_year": request.sales_year,
        "sales_month": request.sales_month,
        "demand_lag_1": request.demand_lag_1,
        "demand_lag_2": request.demand_lag_2,
        "demand_lag_3": request.demand_lag_3,
        "demand_rolling_3": request.demand_rolling_3,
    }])

    prediction = medicine_model.predict(data)[0]

    return {
        "prediction_type": "medicine_demand",
        "predicted_demand": round(
            max(float(prediction), 0),
            2
        ),
    }


# ============================================================
# STOCK-OUT RISK
# ============================================================

@router.post("/stockout-risk")
def predict_stockout(
    request: StockoutRequest
):

    data = pd.DataFrame([request.model_dump()])

    prediction = stockout_model.predict(data)[0]

    probability = None

    if hasattr(stockout_model, "predict_proba"):
        probability = float(
            stockout_model.predict_proba(data)[0][1]
        )

    return {
        "prediction_type": "stockout_risk",
        "stockout_risk": bool(prediction),
        "risk_probability": (
            round(probability, 4)
            if probability is not None
            else None
        ),
    }


# ============================================================
# DAYS TO STOCK-OUT
# ============================================================

@router.post("/days-to-stockout")
def predict_days_to_stockout(
    request: DaysToStockoutRequest
):

    data = pd.DataFrame([request.model_dump()])

    prediction = days_stockout_model.predict(data)[0]

    return {
        "prediction_type": "days_to_stockout",
        "predicted_days": round(
            max(float(prediction), 0),
            2
        ),
    }


# ============================================================
# BED OCCUPANCY
# ============================================================

@router.post("/bed-occupancy")
def predict_bed_occupancy(
    request: BedOccupancyRequest
):

    data = pd.DataFrame([request.model_dump()])

    prediction = bed_model.predict(data)[0]

    return {
        "prediction_type": "bed_occupancy",
        "predicted_bed_occupancy": round(
            max(float(prediction), 0),
            2
        ),
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("/status")
def prediction_status():

    return {
        "status": "online",
        "models": [
            "medicine_demand",
            "stockout_risk",
            "days_to_stockout",
            "bed_occupancy",
        ],
    }