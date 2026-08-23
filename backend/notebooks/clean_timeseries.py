import pandas as pd
from pathlib import Path


input_file = Path("data/raw/hospital_timeseries/dataset3.csv")
output_file = Path("data/processed/cleaned/hospital_timeseries_cleaned.csv")


df = pd.read_csv(input_file, encoding="cp1252")

# Clean column names
df.columns = (
    df.columns
    .str.strip()
    .str.replace(" ", "_")
)

# Parse timestamp
if "timestamp" in df.columns:
    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

# Convert remaining columns to numeric
for column in df.columns:
    if column != "timestamp":
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

# Remove empty rows and duplicates
df = df.dropna(how="all")
df = df.drop_duplicates()

# Sort chronologically
if "timestamp" in df.columns:
    df = df.sort_values("timestamp")

df.to_csv(output_file, index=False)

print("Hospital time-series cleaning complete.")
print("Shape:", df.shape)
print("Saved to:", output_file)