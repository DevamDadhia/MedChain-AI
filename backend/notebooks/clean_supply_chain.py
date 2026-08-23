import pandas as pd
from pathlib import Path


input_dir = Path("data/raw/hospital_supply_chain")
output_dir = Path("data/processed/cleaned/hospital_supply_chain")

output_dir.mkdir(parents=True, exist_ok=True)


for file in sorted(input_dir.glob("*.csv")):

    df = pd.read_csv(file, encoding="cp1252")

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

    # Convert likely date columns
    for column in df.columns:
        if "date" in column.lower():
            df[column] = pd.to_datetime(df[column], errors="coerce")

    # Remove empty rows and duplicates
    df = df.dropna(how="all")
    df = df.drop_duplicates()

    output_file = output_dir / f"{file.stem}_cleaned.csv"
    df.to_csv(output_file, index=False)

    print(f"Cleaned: {file.name}")


print("\nHospital Supply Chain cleaning complete.")