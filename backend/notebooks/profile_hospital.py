import pandas as pd
from pathlib import Path

file_path = Path("data/raw/hospital/hospital_insights_summary.csv")

df = pd.read_csv(file_path, encoding="cp1252")

print("\n" + "=" * 80)
print("hospital_insights_summary.csv")
print("=" * 80)

print("Shape:", df.shape)

print("\nColumns:")
for column in df.columns:
    print("-", column)

print("\nMissing values:")
print(df.isnull().sum())

print("\nFirst 5 rows:")
print(df.head())