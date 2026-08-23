from pydantic import BaseModel
from typing import Optional


# -------------------------
# Health / HMIS
# -------------------------

class HealthRecord(BaseModel):
    district: str
    parameter: str
    record_type: str
    month: Optional[str] = None
    value: Optional[float] = None


# -------------------------
# Inventory
# -------------------------

class InventoryRecord(BaseModel):
    facility_id: Optional[str] = None
    facility_name: Optional[str] = None
    item_name: str
    quantity: float
    unit: Optional[str] = None
    record_date: Optional[str] = None


# -------------------------
# Demand
# -------------------------

class DemandRecord(BaseModel):
    facility_id: Optional[str] = None
    item_name: Optional[str] = None
    timestamp: str
    demand: float
    admissions: Optional[float] = None
    patients: Optional[float] = None


# -------------------------
# Resources
# -------------------------

class ResourceAvailability(BaseModel):
    facility_id: Optional[str] = None
    beds_available: Optional[float] = None
    bed_occupancy: Optional[float] = None
    staff_count: Optional[float] = None
    patients_assigned: Optional[float] = None


# -------------------------
# Predictions
# -------------------------

class StockoutPrediction(BaseModel):
    facility_id: Optional[str] = None
    item_name: Optional[str] = None
    predicted_demand: float
    current_stock: Optional[float] = None
    days_to_stockout: Optional[float] = None
    risk_level: str


class DemandPrediction(BaseModel):
    facility_id: Optional[str] = None
    item_name: Optional[str] = None
    predicted_demand: float
    forecast_horizon_days: int