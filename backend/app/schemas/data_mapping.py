DATASET_MAPPING = {
    "hmis": {
        "source": "data/processed/cleaned/hmis_cleaned.csv",
        "purpose": "healthcare demand and stock-flow indicators",
    },
    "phc_chc": {
        "source": "data/processed/cleaned/phc_chc/",
        "purpose": "PHC/CHC infrastructure and staffing",
    },
    "pharmacy": {
        "source": "data/processed/cleaned/pharmacy/",
        "purpose": "medicine transaction and consumption data",
    },
    "hospital_supply_chain": {
        "source": "data/processed/cleaned/hospital_supply_chain/",
        "purpose": "inventory, patients, staff, vendors and supply chain",
    },
    "hospital_timeseries": {
        "source": "data/processed/cleaned/hospital_timeseries_cleaned.csv",
        "purpose": "time-series admissions, beds, staff and emergency indicators",
    },
    "hospital": {
        "source": "data/processed/cleaned/hospital_cleaned.csv",
        "purpose": "hospital resource insights",
    },
}