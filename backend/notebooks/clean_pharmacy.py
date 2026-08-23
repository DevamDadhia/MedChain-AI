import pandas as pd
from pathlib import Path


input_dir = Path("data/raw/pharmacy/PharmacyTransactionalDataset")
output_dir = Path("data/processed/cleaned/pharmacy")

output_dir.mkdir(parents=True, exist_ok=True)


for file in sorted(input_dir.glob("*.csv")):

    df = pd.read_csv(file, encoding="cp1252")

    # Clean column names
    df.columns = (
        df.columns
        .str.strip()
        .str.replace(" ", "_")
    )

    # Clean text columns
    for column in df.select_dtypes(include=["object", "string"]).columns:
        df[column] = df[column].astype(str).str.strip()

    # Parse date/time fields if present
    if "addeddate" in df.columns:
        df["addeddate"] = pd.to_datetime(
            df["addeddate"], errors="coerce"
        )

    # Numeric fields
    for column in ["Sales_Sheet", "Sales_pack"]:
        if column in df.columns:
            df[column] = pd.to_numeric(df[column], errors="coerce")

    # Remove empty and duplicate rows
    df = df.dropna(how="all")
    df = df.drop_duplicates()

    output_file = output_dir / f"{file.stem}_cleaned.csv"
    df.to_csv(output_file, index=False)

    print(f"Cleaned: {file.name} → {output_file}")


print("\nPharmacy cleaning complete.")