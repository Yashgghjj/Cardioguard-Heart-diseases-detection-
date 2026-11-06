"""
CardioGuard AI - Dataset Downloader & Validator
Fetches the official UCI Heart Disease dataset (Cleveland clinic).
Also documents feature definitions, provenance, and statistics.
"""

import os
import urllib.request
import pandas as pd
import numpy as np

UCI_CLEVELAND_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset"))
RAW_DATA_PATH = os.path.join(DATASET_DIR, "processed.cleveland.data")
CLEAN_CSV_PATH = os.path.join(DATASET_DIR, "heart_disease_cleaned.csv")

FEATURE_NAMES = [
    "age",        # Age in years
    "sex",        # 1 = male, 0 = female
    "cp",         # Chest pain type (1: typical angina, 2: atypical angina, 3: non-anginal pain, 4: asymptomatic)
    "trestbps",   # Resting blood pressure in mm Hg
    "chol",       # Serum cholesterol in mg/dl
    "fbs",        # Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)
    "restecg",    # Resting ECG results (0: normal, 1: ST-T wave abnormality, 2: left ventricular hypertrophy)
    "thalach",    # Maximum heart rate achieved (bpm)
    "exang",      # Exercise induced angina (1 = yes, 0 = no)
    "oldpeak",    # ST depression induced by exercise relative to rest
    "slope",      # Slope of peak exercise ST segment (1: upsloping, 2: flat, 3: downsloping)
    "ca",         # Number of major vessels (0-3) colored by flourosopy
    "thal",       # Thalassemia (3: normal, 6: fixed defect, 7: reversable defect)
    "target"      # Heart disease diagnosis: 0 = absent, 1,2,3,4 = present
]

def download_and_preprocess():
    os.makedirs(DATASET_DIR, exist_ok=True)
    
    print(f"Downloading UCI Cleveland dataset from {UCI_CLEVELAND_URL}...")
    try:
        urllib.request.urlretrieve(UCI_CLEVELAND_URL, RAW_DATA_PATH)
        print(f"Saved raw data to {RAW_DATA_PATH}")
    except Exception as e:
        print(f"Download failed: {e}. Checking if local copy exists...")
        if not os.path.exists(RAW_DATA_PATH):
            raise RuntimeError(f"Could not retrieve dataset: {e}")

    # Read data with '?' treated as NaN
    df = pd.read_csv(RAW_DATA_PATH, names=FEATURE_NAMES, na_values="?", skipinitialspace=True)
    print(f"Loaded raw dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    # Missing value analysis
    missing = df.isnull().sum()
    print("Missing values per feature:")
    for col, count in missing.items():
        if count > 0:
            print(f"  - {col}: {count} missing values ({count/len(df)*100:.2f}%)")

    # Handle missing values:
    # ca has 4 missing, thal has 2 missing.
    # Impute ca with median (0.0) and thal with mode (3.0 normal)
    df["ca"] = df["ca"].fillna(df["ca"].median())
    df["thal"] = df["thal"].fillna(df["thal"].mode()[0])

    # Convert multiclass target (0, 1, 2, 3, 4) to binary target:
    # 0 = absence of heart disease (<50% stenosis)
    # 1 = presence of heart disease (>50% stenosis)
    raw_target_dist = df["target"].value_counts().sort_index().to_dict()
    print(f"Raw angiographic disease status distribution (0=none, 1-4=severity stages): {raw_target_dist}")
    
    df["target"] = (df["target"] > 0).astype(int)
    binary_dist = df["target"].value_counts().to_dict()
    print(f"Binary target distribution: 0 (No Disease)={binary_dist.get(0, 0)}, 1 (Disease)={binary_dist.get(1, 0)}")

    # Remove duplicates if any
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        print(f"Found {duplicates} duplicates, removing...")
        df = df.drop_duplicates()

    # Save clean dataset
    df.to_csv(CLEAN_CSV_PATH, index=False)
    print(f"Successfully preprocessed and saved clean dataset to {CLEAN_CSV_PATH}")
    print("Summary statistics:")
    print(df.describe().T[["mean", "std", "min", "50%", "max"]])
    return df

if __name__ == "__main__":
    download_and_preprocess()

