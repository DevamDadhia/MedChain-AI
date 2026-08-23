from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pathlib import Path
import pandas as pd


DATABASE_URL = "sqlite:///./healthgrid.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# ============================================================
# TABLES
# ============================================================

class MedicineTransaction(Base):
    __tablename__ = "medicine_transactions"

    id = Column(Integer, primary_key=True)
    invoice = Column(String)
    barcode = Column(String)
    name = Column(String)
    dosage_form = Column(String)
    sheet = Column(Float)
    sales_sheet = Column(Float)
    sales_pack = Column(Float)
    added_date = Column(String)
    time = Column(String)
    transaction_type = Column(String)


class HospitalTimeSeries(Base):
    __tablename__ = "hospital_timeseries"

    id = Column(Integer, primary_key=True)
    timestamp = Column(String)
    admissions = Column(Float)
    discharges = Column(Float)
    staff_count = Column(Float)
    flu_cases = Column(Float)
    bed_occupancy = Column(Float)


class HospitalInventory(Base):
    __tablename__ = "hospital_inventory"

    id = Column(Integer, primary_key=True)
    date = Column(String)
    item_id = Column(String)
    item_type = Column(String)
    item_name = Column(String)
    current_stock = Column(Float)
    min_required = Column(Float)
    max_capacity = Column(Float)
    unit_cost = Column(Float)
    avg_usage_per_day = Column(Float)
    restock_lead_time = Column(Float)
    vendor_id = Column(String)


class HospitalStaff(Base):
    __tablename__ = "hospital_staff"

    id = Column(Integer, primary_key=True)
    staff_id = Column(String)
    staff_type = Column(String)
    shift_date = Column(String)
    shift_start_time = Column(String)
    shift_end_time = Column(String)
    current_assignment = Column(String)
    hours_worked = Column(Float)
    patients_assigned = Column(Float)
    overtime_hours = Column(Float)


class PatientData(Base):
    __tablename__ = "patient_data"

    id = Column(Integer, primary_key=True)
    patient_id = Column(String)
    admission_date = Column(String)
    discharge_date = Column(String)
    primary_diagnosis = Column(String)
    procedure_performed = Column(String)
    room_type = Column(String)
    bed_days = Column(Float)
    supplies_used = Column(String)
    equipment_used = Column(String)
    staff_needed = Column(String)


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True)
    vendor_id = Column(String)
    vendor_name = Column(String)
    item_supplied = Column(String)
    avg_lead_time_days = Column(Float)
    cost_per_item = Column(Float)
    last_order_date = Column(String)
    next_delivery_date = Column(String)


class FinancialData(Base):
    __tablename__ = "financial_data"

    id = Column(Integer, primary_key=True)
    date = Column(String)
    expense_category = Column(String)
    amount = Column(Float)
    description = Column(String)


# ============================================================
# CREATE TABLES
# ============================================================

Base.metadata.create_all(engine)


# ============================================================
# LOAD CSV
# ============================================================

def load_csv(file_path, table_name):

    file_path = Path(file_path)

    if not file_path.exists():
        print(f"SKIPPED: {file_path}")
        return

    df = pd.read_csv(file_path, encoding="cp1252")

    if df.empty:
        print(f"SKIPPED EMPTY: {file_path.name}")
        return

    # Match CSV column names to SQLAlchemy column names
    column_mapping = {
        "Invoice": "invoice",
        "barcode": "barcode",
        "name": "name",
        "dosage_form": "dosage_form",
        "Sheet": "sheet",
        "Sales_Sheet": "sales_sheet",
        "Sales_pack": "sales_pack",
        "addeddate": "added_date",
        "time_": "time",
        "type": "transaction_type",

        "timestamp": "timestamp",
        "admissions": "admissions",
        "discharges": "discharges",
        "staff_count": "staff_count",
        "flu_cases": "flu_cases",
        "bed_occupancy": "bed_occupancy",

        "Date": "date",
        "Item_ID": "item_id",
        "Item_Type": "item_type",
        "Item_Name": "item_name",
        "Current_Stock": "current_stock",
        "Min_Required": "min_required",
        "Max_Capacity": "max_capacity",
        "Unit_Cost": "unit_cost",
        "Avg_Usage_Per_Day": "avg_usage_per_day",
        "Restock_Lead_Time": "restock_lead_time",
        "Vendor_ID": "vendor_id",

        "Staff_ID": "staff_id",
        "Staff_Type": "staff_type",
        "Shift_Date": "shift_date",
        "Shift_Start_Time": "shift_start_time",
        "Shift_End_Time": "shift_end_time",
        "Current_Assignment": "current_assignment",
        "Hours_Worked": "hours_worked",
        "Patients_Assigned": "patients_assigned",
        "Overtime_Hours": "overtime_hours",

        "Patient_ID": "patient_id",
        "Admission_Date": "admission_date",
        "Discharge_Date": "discharge_date",
        "Primary_Diagnosis": "primary_diagnosis",
        "Procedure_Performed": "procedure_performed",
        "Room_Type": "room_type",
        "Bed_Days": "bed_days",
        "Supplies_Used": "supplies_used",
        "Equipment_Used": "equipment_used",
        "Staff_Needed": "staff_needed",

        "Vendor_Name": "vendor_name",
        "Item_Supplied": "item_supplied",
        "Avg_Lead_Time_days": "avg_lead_time_days",
        "Cost_Per_Item": "cost_per_item",
        "Last_Order_Date": "last_order_date",
        "Next_Delivery_Date": "next_delivery_date",

        "Expense_Category": "expense_category",
        "Amount": "amount",
        "Description": "description",
    }

    df = df.rename(columns=column_mapping)

    # Keep only columns that exist in the destination table
    table_columns = {
        column.name
        for column in Base.metadata.tables[table_name].columns
        if column.name != "id"
    }

    df = df[[c for c in df.columns if c in table_columns]]

    df.to_sql(
        table_name,
        engine,
        if_exists="append",
        index=False,
    )

    print(f"LOADED: {table_name} -> {len(df)} records")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("\n==========================================")
    print("HEALTHGRID DATABASE INGESTION")
    print("==========================================\n")

    load_csv(
        "data/processed/cleaned/pharmacy/global_test_set_cleaned.csv",
        "medicine_transactions",
    )

    load_csv(
        "data/processed/cleaned/hospital_timeseries_cleaned.csv",
        "hospital_timeseries",
    )

    load_csv(
        "data/processed/cleaned/hospital_supply_chain/inventory_data_cleaned.csv",
        "hospital_inventory",
    )

    load_csv(
        "data/processed/cleaned/hospital_supply_chain/staff_data_cleaned.csv",
        "hospital_staff",
    )

    load_csv(
        "data/processed/cleaned/hospital_supply_chain/patient_data_cleaned.csv",
        "patient_data",
    )

    load_csv(
        "data/processed/cleaned/hospital_supply_chain/vendor_data_cleaned.csv",
        "vendors",
    )

    load_csv(
        "data/processed/cleaned/hospital_supply_chain/financial_data_cleaned.csv",
        "financial_data",
    )

    print("\n==========================================")
    print("DATABASE INGESTION COMPLETE")
    print("==========================================")