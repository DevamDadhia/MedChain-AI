import pandas as pd
from pathlib import Path

data_dir = Path("data/raw/phc_chc")

for file in sorted(data_dir.glob("*.csv")):
    print("\n" + "=" * 80)
    print(file.name)
    print("=" * 80)

    try:
        df = pd.read_csv(file, encoding="cp1252")

        print("Shape:", df.shape)

        print("\nColumns:")
        for column in df.columns:
            print("-", column)

        print("\nMissing values:")
        print(df.isnull().sum())

        print("\nFirst 3 rows:")
        print(df.head(3))

    except Exception as e:
        print("ERROR:", e)