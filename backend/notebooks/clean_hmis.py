import pandas as pd
from pathlib import Path


input_file = Path("data/raw/hmis/hmis-item-rpt-bi-for-2019-20.csv")
output_file = Path("data/processed/cleaned/hmis_cleaned.csv")


df = pd.read_csv(input_file, encoding="cp1252")


# Clean column names
df.columns = (
    df.columns
    .str.strip()
    .str.replace(" ", "_")
    .str.replace("[", "", regex=False)
    .str.replace("]", "", regex=False)
    .str.replace("(", "", regex=False)
    .str.replace(")", "", regex=False)
)


# Clean text fields
for column in ["District", "S.No.", "Parameters", "Type"]:
    if column in df.columns:
        df[column] = df[column].astype(str).str.strip()


# Convert numeric columns
for column in df.columns:
    if column not in ["District", "S.No.", "Parameters", "Type"]:
        df[column] = pd.to_numeric(df[column], errors="coerce")


# Remove completely empty rows
df = df.dropna(how="all")


# Remove duplicate rows
df = df.drop_duplicates()


# Save cleaned dataset
df.to_csv(output_file, index=False)


print("HMIS cleaning complete.")
print("Shape:", df.shape)
print("Saved to:", output_file)