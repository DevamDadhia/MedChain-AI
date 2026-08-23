import os
from pathlib import Path

from dotenv import load_dotenv


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# APPLICATION CONFIGURATION
# ============================================================

APP_ENV = os.getenv(
    "APP_ENV",
    "development",
)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DATABASE_PATH = os.getenv(
    "DATABASE_PATH",
    "healthgrid.db",
)

DATABASE = BASE_DIR / DATABASE_PATH


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY",
)


# ============================================================
# AI MODEL
# ============================================================

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)


# ============================================================
# API CONFIGURATION
# ============================================================

API_VERSION = "1.0.0"
APP_NAME = "HEALTHGRID API"
