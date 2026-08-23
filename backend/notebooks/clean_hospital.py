import pandas as pd
from pathlib import Path


input_file = Path("data/raw/hospital/hospital_insights_summary.csv")
output_file = Path("data/processed/cleaned/hospital_cleaned.csv")

df = pd.read_csv(input_file, encoding="cp1252")

# Clean column names
df.columns = (
    df.columns
    .str.strip()
    .str.replace(" ", "_")
    .str.replace("(", "", regex=False)
    .str.replace(")", "", regex=False)
)

# Clean text columns
for column in df.select_dtypes(include=["object", "string"]).columns:
    df[column] = df[column].astype(str).str.strip()

# Convert date columns where applicable
for column in df.columns:
    if "date" in column.lower():
        df[column] = pd.to_datetime(df[column], errors="coerce")

# Remove empty and duplicate rows
df = df.dropna(how="all")
df = df.drop_duplicates()

df.to_csv(output_file, index=False)

print("Hospital cleaning complete.")
print("Shape:", df.shape)
print("Saved to:", output_file)