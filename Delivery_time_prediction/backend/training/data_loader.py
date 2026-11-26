"""Stage 2 - Data collection: load and inspect the raw data."""
import pandas as pd


def load_data(path):
    df = pd.read_csv(path)
    print("Shape:", df.shape)
    missing = df.isna().sum()
    print("Missing values:\n", missing[missing > 0])
    print("Duplicate rows:", df.duplicated().sum())
    return df
