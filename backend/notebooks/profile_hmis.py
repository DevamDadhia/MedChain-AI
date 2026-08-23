import pandas as pd
from pathlib import Path


file_path = Path("data/raw/hmis/hmis-item-rpt-bi-for-2019-20.csv")

df = pd.read_csv(file_path, encoding="cp1252")


report_path = Path("data/processed/hmis_profile.txt")


with open(report_path, "w", encoding="utf-8") as f:

    f.write("========== HMIS DATASET PROFILE ==========\n\n")

    f.write("SHAPE:\n")
    f.write(str(df.shape))
    f.write("\n\n")

    f.write("COLUMNS:\n")
    for column in df.columns:
        f.write(f"- {column}\n")

    f.write("\n\nDATA TYPES:\n")
    f.write(str(df.dtypes))
    f.write("\n\n")

    f.write("MISSING VALUES:\n")
    f.write(str(df.isnull().sum()))
    f.write("\n\n")

    f.write("FIRST 5 ROWS:\n")
    f.write(str(df.head()))
    f.write("\n\n")

    f.write("==========================================\n")


print("HMIS profiling complete.")
print(f"Report saved to: {report_path}")