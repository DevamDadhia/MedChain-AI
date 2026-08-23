import logging
import sqlite3

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.prediction_api import router as prediction_router
from app.system_api import router as system_router

from app.config import (
    APP_ENV,
    APP_NAME,
    API_VERSION,
    DATABASE,
    CORS_ORIGINS,
)


from app.decision_engine import (
    router as recommendation_router,
    generate_recommendations,
)

from app.ai_engine import (
    router as ai_router,
    analyze_healthcare_context,
)

from app.schemas.api import (
    AIStatusResponse,
    DataResponse,
    DashboardResponse,
    HealthResponse,
    ReadinessResponse,
)


# ============================================================
# LOGGING
# ============================================================

logger = logging.getLogger("healthgrid")


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title=APP_NAME,
    description=(
        "AI-powered healthcare resource, inventory, "
        "demand forecasting, prediction, and "
        "decision-support API."
    ),
    version=API_VERSION,
)


# ============================================================
# CORS
# ============================================================

cors_origins = [
    origin.strip()
    for origin in CORS_ORIGINS.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GLOBAL ERROR HANDLER
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):

    logger.exception(
        "Unhandled error on %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error.",
            "path": request.url.path,
        },
    )


# ============================================================
# ROUTERS
# ============================================================

app.include_router(prediction_router)
app.include_router(system_router)
app.include_router(system_router)
app.include_router(system_router)
app.include_router(recommendation_router)
app.include_router(ai_router)


# ============================================================
# DATABASE HELPER
# ============================================================

def get_table_data(
    table_name: str,
    limit: int = 100,
):

    allowed_tables = {
        "inventory": "hospital_inventory",
        "staff": "hospital_staff",
        "patients": "patient_data",
        "vendors": "vendors",
        "financial": "financial_data",
        "timeseries": "hospital_timeseries",
        "medicines": "medicine_transactions",
    }

    if table_name not in allowed_tables:

        raise HTTPException(
            status_code=404,
            detail="Unknown data resource.",
        )

    actual_table = allowed_tables[
        table_name
    ]

    limit = min(
        max(limit, 1),
        1000,
    )

    connection = None

    try:

        connection = sqlite3.connect(
            str(DATABASE)
        )

        connection.row_factory = sqlite3.Row

        cursor = connection.cursor()

        cursor.execute(
            f'SELECT * FROM "{actual_table}" LIMIT ?',
            (limit,),
        )

        rows = cursor.fetchall()

        return [
            dict(row)
            for row in rows
        ]

    except Exception as exc:

        logger.exception(
            "Database query failed: %s",
            actual_table,
        )

        raise HTTPException(
            status_code=500,
            detail="Database operation failed.",
        ) from exc

    finally:

        if connection:
            connection.close()


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "application": APP_NAME,
        "status": "online",
        "environment": APP_ENV,
        "version": API_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get(
    "/health",
    response_model=HealthResponse,
)
def health_check():

    return {
        "status": "healthy",
        "service": "healthgrid-backend",
        "environment": APP_ENV,
    }


# ============================================================
# READINESS
# ============================================================

@app.get(
    "/ready",
    response_model=ReadinessResponse,
)
def readiness_check():

    try:

        if not DATABASE.exists():

            return JSONResponse(
                status_code=503,
                content={
                    "status": "not_ready",
                    "database": "missing",
                },
            )

        connection = sqlite3.connect(
            str(DATABASE)
        )

        connection.execute(
            "SELECT 1"
        )

        connection.close()

        return {
            "status": "ready",
            "database": "available",
        }

    except Exception:

        logger.exception(
            "Readiness check failed."
        )

        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "database": "unavailable",
            },
        )


# ============================================================
# API INFORMATION
# ============================================================

@app.get("/api-info")
def api_info():

    return {
        "application": APP_NAME,
        "version": API_VERSION,

        "prediction_endpoints": [
            "/predictions/status",
            "/predictions/medicine-demand",
            "/predictions/stockout-risk",
            "/predictions/days-to-stockout",
            "/predictions/bed-occupancy",
        ],

        "recommendation_endpoints": [
            "/recommendations",
        ],

        "ai_endpoints": [
            "/ai/status",
            "/ai/analyze",
        ],

        "data_endpoints": [
            "/data/inventory",
            "/data/staff",
            "/data/patients",
            "/data/vendors",
            "/data/financial",
            "/data/timeseries",
            "/data/medicines",
        ],

        "system_endpoints": [
            "/",
            "/health",
            "/ready",
            "/api-info",
            "/dashboard",
        ],

        "dashboard_endpoint": "/dashboard",
    }


# ============================================================
# DATA ENDPOINTS
# ============================================================

@app.get(
    "/data/inventory",
    response_model=DataResponse,
)
def get_inventory(
    limit: int = 100,
):

    data = get_table_data(
        "inventory",
        limit,
    )

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    }


@app.get(
    "/data/staff",
    response_model=DataResponse,
)
def get_staff(
    limit: int = 100,
):

    data = get_table_data(
        "staff",
        limit,
    )

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    }


@app.get(
    "/data/patients",
    response_model=DataResponse,
)
def get_patients(
    limit: int = 100,
):

    data = get_table_data(
        "patients",
        limit,
    )

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    }


@app.get(
    "/data/vendors",
    response_model=DataResponse,
)
def get_vendors(
    limit: int = 100,
):

    data = get_table_data(
        "vendors",
        limit,
    )

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    }


@app.get(
    "/data/financial",
    response_model=DataResponse,
)
def get_financial(
    limit: int = 100,
):

    data = get_table_data(
        "financial",
        limit,
    )

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    }


@app.get(
    "/data/timeseries",
    response_model=DataResponse,
)
def get_timeseries(
    limit: int = 100,
):

    data = get_table_data(
        "timeseries",
        limit,
    )

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    }


@app.get(
    "/data/medicines",
    response_model=DataResponse,
)
def get_medicines(
    limit: int = 100,
):

    data = get_table_data(
        "medicines",
        limit,
    )

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    }


# ============================================================
# UNIFIED DASHBOARD
# ============================================================

@app.get(
    "/dashboard",
    response_model=DashboardResponse,
)
def dashboard():

    try:

        result = generate_recommendations()

        inventory = result.get(
            "inventory"
        )

        # ----------------------------------------------------
        # INVENTORY SUMMARY
        # ----------------------------------------------------

        if (
            inventory is None
            or inventory.empty
        ):

            inventory_summary = {
                "total_items": 0,
                "critical_items": 0,
                "high_risk_items": 0,
                "medium_risk_items": 0,
                "low_risk_items": 0,
            }

            top_risks = []

        else:

            inventory_summary = {
                "total_items": len(
                    inventory
                ),

                "critical_items": int(
                    (
                        inventory[
                            "risk_level"
                        ]
                        == "CRITICAL"
                    ).sum()
                ),

                "high_risk_items": int(
                    (
                        inventory[
                            "risk_level"
                        ]
                        == "HIGH"
                    ).sum()
                ),

                "medium_risk_items": int(
                    (
                        inventory[
                            "risk_level"
                        ]
                        == "MEDIUM"
                    ).sum()
                ),

                "low_risk_items": int(
                    (
                        inventory[
                            "risk_level"
                        ]
                        == "LOW"
                    ).sum()
                ),
            }

            top_risks = (
                inventory[
                    inventory[
                        "risk_level"
                    ].isin(
                        [
                            "CRITICAL",
                            "HIGH",
                        ]
                    )
                ]
                .head(10)
                .to_dict(
                    orient="records"
                )
            )

        # ----------------------------------------------------
        # AI CONTEXT
        # ----------------------------------------------------

        ai_context = {
            "inventory_summary":
                inventory_summary,

            "top_inventory_risks":
                top_risks,

            "bed":
                result.get("bed"),

            "staff":
                result.get("staff"),
        }

        # ----------------------------------------------------
        # AI ANALYSIS
        # ----------------------------------------------------

        try:

            ai_analysis = (
                analyze_healthcare_context(
                    ai_context
                )
            )

        except Exception as ai_error:

            logger.exception(
                "AI analysis failed."
            )

            ai_analysis = {
                "summary": (
                    "AI analysis is "
                    "temporarily unavailable."
                ),
                "key_risks": [],
                "recommended_actions": [],
                "priority": "UNKNOWN",
                "error": str(
                    ai_error
                ),
            }

        # ----------------------------------------------------
        # FINAL RESPONSE
        # ----------------------------------------------------

        return {
            "status": "success",
            "inventory_summary":
                inventory_summary,
            "top_inventory_risks":
                top_risks,
            "bed":
                result.get("bed"),
            "staff":
                result.get("staff"),
            "ai_analysis":
                ai_analysis,
        }

    except HTTPException:
        raise

    except Exception as exc:

        logger.exception(
            "Dashboard generation failed."
        )

        raise HTTPException(
            status_code=500,
            detail="Dashboard generation failed.",
        ) from exc

