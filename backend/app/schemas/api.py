from typing import Any

from pydantic import BaseModel, Field


# ============================================================
# GENERIC API RESPONSE
# ============================================================

class APIStatusResponse(BaseModel):
    status: str


# ============================================================
# HEALTH RESPONSE
# ============================================================

class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str


# ============================================================
# READINESS RESPONSE
# ============================================================

class ReadinessResponse(BaseModel):
    status: str
    database: str


# ============================================================
# DATA RESPONSE
# ============================================================

class DataResponse(BaseModel):
    status: str
    count: int
    data: list[dict[str, Any]]


# ============================================================
# AI STATUS
# ============================================================

class AIStatusResponse(BaseModel):
    status: str
    model: str


# ============================================================
# AI ANALYSIS
# ============================================================

class AIAnalysisResponse(BaseModel):
    summary: str
    key_risks: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(
        default_factory=list
    )
    priority: str


# ============================================================
# AI ANALYSIS API RESPONSE
# ============================================================

class AIAnalysisAPIResponse(BaseModel):
    status: str
    ai_analysis: AIAnalysisResponse


# ============================================================
# INVENTORY SUMMARY
# ============================================================

class InventorySummary(BaseModel):
    total_items: int
    critical_items: int
    high_risk_items: int
    medium_risk_items: int
    low_risk_items: int


# ============================================================
# DASHBOARD RESPONSE
# ============================================================

class DashboardResponse(BaseModel):
    status: str
    inventory_summary: InventorySummary
    top_inventory_risks: list[dict[str, Any]]
    bed: Any
    staff: Any
    ai_analysis: AIAnalysisResponse | dict[str, Any] | None