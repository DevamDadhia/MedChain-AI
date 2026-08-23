import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score
from sklearn.model_selection import train_test_split


# ============================================================
# CONFIG
# ============================================================

FEATURE_DIR = Path("data/features")
MODEL_DIR = Path("models")

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# HELPERS
# ============================================================

def rmse(y_true, y_pred):
    return np.sqrt(mean_squared_error(y_true, y_pred))


def clean_numeric_dataframe(df):
    df = df.copy()

    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.replace([np.inf, -np.inf], np.nan)

    return df


def prepare_features(df, target, exclude=None):
    exclude = exclude or []

    df = df.copy()

    if target not in df.columns:
        return None, None

    df = df.dropna(subset=[target])

    y = pd.to_numeric(df[target], errors="coerce")

    X = df.drop(
        columns=[target] + exclude,
        errors="ignore"
    )

    X = clean_numeric_dataframe(X)

    # Keep only numeric columns
    X = X.select_dtypes(include=[np.number])

    # Remove columns that contain no useful information
    X = X.dropna(axis=1, how="all")

    # Fill missing values
    X = X.fillna(X.median(numeric_only=True))
    X = X.fillna(0)

    valid = y.notna()

    X = X.loc[valid]
    y = y.loc[valid]

    return X, y


# ============================================================
# 1. MEDICINE DEMAND MODEL
# ============================================================

def train_medicine_demand_model():

    print("\n==========================================")
    print("MEDICINE DEMAND MODEL")
    print("==========================================")

    file_path = FEATURE_DIR / "pharmacy_features.csv"

    if not file_path.exists():
        print("Pharmacy feature file not found.")
        return

    df = pd.read_csv(file_path)

    # Aggregate transaction-level data
    # by medicine and month.
    if "name" not in df.columns:
        print("Medicine name column not found.")
        return

    if "sales_month" not in df.columns:
        print("Sales month column not found.")
        return

    df["total_sales_quantity"] = pd.to_numeric(
        df["total_sales_quantity"],
        errors="coerce"
    ).fillna(0)

    # Create monthly demand dataset
    grouped = (
        df.groupby(
            ["name", "sales_year", "sales_month"],
            as_index=False
        )
        ["total_sales_quantity"]
        .sum()
    )

    grouped = grouped.sort_values(
        ["name", "sales_year", "sales_month"]
    )

    # Lag features
    grouped["demand_lag_1"] = (
        grouped.groupby("name")["total_sales_quantity"]
        .shift(1)
    )

    grouped["demand_lag_2"] = (
        grouped.groupby("name")["total_sales_quantity"]
        .shift(2)
    )

    grouped["demand_lag_3"] = (
        grouped.groupby("name")["total_sales_quantity"]
        .shift(3)
    )

    grouped["demand_rolling_3"] = (
        grouped.groupby("name")["total_sales_quantity"]
        .transform(
            lambda x: x.shift(1).rolling(3).mean()
        )
    )

    grouped = grouped.dropna(
        subset=["demand_lag_1"]
    )

    if len(grouped) < 20:
        print("Not enough historical observations.")
        return

    feature_columns = [
        "sales_year",
        "sales_month",
        "demand_lag_1",
        "demand_lag_2",
        "demand_lag_3",
        "demand_rolling_3",
    ]

    X = grouped[feature_columns]
    y = grouped["total_sales_quantity"]

    X = X.replace([np.inf, -np.inf], np.nan)
    X = X.fillna(0)

    # Time-aware split
    split_index = int(len(X) * 0.8)

    X_train = X.iloc[:split_index]
    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]
    y_test = y.iloc[split_index:]

    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=3,
        random_state=42,
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    print("MAE:", mean_absolute_error(y_test, predictions))
    print("RMSE:", rmse(y_test, predictions))

    joblib.dump(
        model,
        MODEL_DIR / "medicine_demand_model.joblib"
    )

    joblib.dump(
        feature_columns,
        MODEL_DIR / "medicine_demand_features.joblib"
    )

    print("Medicine demand model saved.")


# ============================================================
# 2. STOCK-OUT MODEL
# ============================================================

def train_stockout_model():

    print("\n==========================================")
    print("STOCK-OUT MODEL")
    print("==========================================")

    file_path = FEATURE_DIR / "inventory_features.csv"

    if not file_path.exists():
        print("Inventory feature file not found.")
        return

    df = pd.read_csv(file_path)

    required = [
        "current_stock",
        "min_required",
        "avg_usage_per_day",
        "restock_lead_time",
        "stockout_risk",
    ]

    missing = [
        col for col in required
        if col not in df.columns
    ]

    if missing:
        print("Missing columns:", missing)
        return

    X, y = prepare_features(
        df,
        "stockout_risk",
        exclude=[
            "item_id",
            "item_name",
            "vendor_id",
        ]
    )

    if X is None or len(X) < 20:
        print("Not enough data.")
        return

    # Ensure classification target
    y = y.astype(int)

    # Check whether both classes exist
    if y.nunique() < 2:
        print(
            "Stock-out target contains only one class. "
            "Cannot train classifier."
        )
        return

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.05,
        max_depth=3,
        random_state=42,
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    print(
        "Accuracy:",
        accuracy_score(y_test, predictions)
    )

    joblib.dump(
        model,
        MODEL_DIR / "stockout_model.joblib"
    )

    joblib.dump(
        list(X.columns),
        MODEL_DIR / "stockout_features.joblib"
    )

    print("Stock-out model saved.")


# ============================================================
# 3. DAYS-TO-STOCKOUT MODEL
# ============================================================

def train_days_to_stockout_model():

    print("\n==========================================")
    print("DAYS-TO-STOCKOUT MODEL")
    print("==========================================")

    file_path = FEATURE_DIR / "inventory_features.csv"

    if not file_path.exists():
        print("Inventory feature file not found.")
        return

    df = pd.read_csv(file_path)

    target = "estimated_days_to_stockout"

    if target not in df.columns:
        print("Target not found.")
        return

    X, y = prepare_features(
        df,
        target,
        exclude=[
            "item_id",
            "item_name",
            "vendor_id",
        ]
    )

    if X is None or len(X) < 20:
        print("Not enough data.")
        return

    # Remove extreme values
    valid = (
        np.isfinite(y)
        & (y >= 0)
        & (y <= 3650)
    )

    X = X.loc[valid]
    y = y.loc[valid]

    if len(X) < 20:
        print("Not enough valid observations.")
        return

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    model = GradientBoostingRegressor(
        n_estimators=150,
        learning_rate=0.05,
        max_depth=3,
        random_state=42,
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    print("MAE:", mean_absolute_error(y_test, predictions))
    print("RMSE:", rmse(y_test, predictions))

    joblib.dump(
        model,
        MODEL_DIR / "days_to_stockout_model.joblib"
    )

    joblib.dump(
        list(X.columns),
        MODEL_DIR / "days_to_stockout_features.joblib"
    )

    print("Days-to-stockout model saved.")


# ============================================================
# 4. BED OCCUPANCY MODEL
# ============================================================

def train_bed_occupancy_model():

    print("\n==========================================")
    print("BED OCCUPANCY MODEL")
    print("==========================================")

    file_path = FEATURE_DIR / "timeseries_features.csv"

    if not file_path.exists():
        print("Timeseries feature file not found.")
        return

    df = pd.read_csv(file_path)

    if "bed_occupancy" not in df.columns:
        print("bed_occupancy target not found.")
        return

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    df = df.sort_values("timestamp")

    # Future occupancy becomes the prediction target
    df["future_bed_occupancy"] = (
        df["bed_occupancy"].shift(-1)
    )

    # Lag features
    df["bed_occupancy_lag_1"] = (
        df["bed_occupancy"].shift(1)
    )

    df["bed_occupancy_lag_2"] = (
        df["bed_occupancy"].shift(2)
    )

    df["bed_occupancy_lag_24"] = (
        df["bed_occupancy"].shift(24)
    )

    df["admissions_lag_1"] = (
        df["admissions"].shift(1)
    )

    df["admissions_lag_24"] = (
        df["admissions"].shift(24)
    )

    df = df.dropna(
        subset=["future_bed_occupancy"]
    )

    feature_columns = [
        "bed_occupancy_lag_1",
        "bed_occupancy_lag_2",
        "bed_occupancy_lag_24",
        "admissions_lag_1",
        "admissions_lag_24",
        "staff_count",
        "flu_cases",
        "hour",
        "day_of_week",
        "month",
    ]

    feature_columns = [
        col for col in feature_columns
        if col in df.columns
    ]

    X = df[feature_columns]
    y = df["future_bed_occupancy"]

    X = clean_numeric_dataframe(X)
    X = X.fillna(X.median(numeric_only=True))
    X = X.fillna(0)

    split_index = int(len(X) * 0.8)

    X_train = X.iloc[:split_index]
    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]
    y_test = y.iloc[split_index:]

    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=3,
        random_state=42,
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    print("MAE:", mean_absolute_error(y_test, predictions))
    print("RMSE:", rmse(y_test, predictions))

    joblib.dump(
        model,
        MODEL_DIR / "bed_occupancy_model.joblib"
    )

    joblib.dump(
        feature_columns,
        MODEL_DIR / "bed_occupancy_features.joblib"
    )

    print("Bed occupancy model saved.")


# ============================================================
# 5. LOAD MODELS
# ============================================================

def load_models():

    models = {}

    model_files = {
        "medicine_demand":
            "medicine_demand_model.joblib",

        "stockout":
            "stockout_model.joblib",

        "days_to_stockout":
            "days_to_stockout_model.joblib",

        "bed_occupancy":
            "bed_occupancy_model.joblib",
    }

    for name, filename in model_files.items():

        path = MODEL_DIR / filename

        if path.exists():
            models[name] = joblib.load(path)

    return models


# ============================================================
# MAIN
# ============================================================

def main():

    print("\n==========================================")
    print("HEALTHGRID AI - PREDICTION ENGINE")
    print("==========================================")

    train_medicine_demand_model()

    train_stockout_model()

    train_days_to_stockout_model()

    train_bed_occupancy_model()

    models = load_models()

    print("\n==========================================")
    print("TRAINING COMPLETE")
    print("==========================================")

    print("Models available:")

    for model_name in models:
        print("-", model_name)


if __name__ == "__main__":
    main()