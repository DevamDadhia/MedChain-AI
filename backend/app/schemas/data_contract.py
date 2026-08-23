from pydantic import BaseModel
from typing import Optional


class Facility(BaseModel):
    facility_id: str
    facility_name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    facility_type: Optional[str] = None


class Inventory(BaseModel):
    facility_id: Optional[str] = None
    item_name: str
    quantity: float
    unit: Optional[str] = None
    record_date: Optional[str] = None


class Demand(BaseModel):
    facility_id: Optional[str] = None
    item_name: Optional[str] = None
    timestamp: str
    demand: float
    admissions: Optional[float] = None
    discharges: Optional[float] = None
    flu_cases: Optional[float] = None


class Resources(BaseModel):
    facility_id: Optional[str] = None
    beds_available: Optional[float] = None
    bed_occupancy: Optional[float] = None
    staff_count: Optional[float] = None
    patients_assigned: Optional[float] = None


class Staff(BaseModel):
    facility_id: Optional[str] = None
    staff_id: Optional[str] = None
    staff_type: Optional[str] = None
    shift_date: Optional[str] = None
    hours_worked: Optional[float] = None
    patients_assigned: Optional[float] = None
    overtime_hours: Optional[float] = None


class Vendor(BaseModel):
    vendor_id: str
    vendor_name: Optional[str] = None
    item_supplied: Optional[str] = None
    lead_time_days: Optional[float] = None
    cost_per_item: Optional[float] = None


class DemandPrediction(BaseModel):
    facility_id: Optional[str] = None
    item_name: Optional[str] = None
    predicted_demand: float
    forecast_horizon_days: int


class StockoutPrediction(BaseModel):
    facility_id: Optional[str] = None
    item_name: Optional[str] = None
    current_stock: Optional[float] = None
    predicted_demand: float
    days_to_stockout: Optional[float] = None
    risk_level: str


class RedistributionRecommendation(BaseModel):
    source_facility_id: str
    destination_facility_id: str
    item_name: str
    quantity: float
    reason: str