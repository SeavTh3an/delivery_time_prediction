"""Stage 4 - Data preprocessing: labels, feature lists, sklearn pipeline."""
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler

LABELS = ["Fast", "On time", "Late"]

NUM_FEATURES = ["Distance_km", "Preparation_Time_min", "Courier_Experience_yrs"]
ORD_FEATURES = ["Traffic_Level"]
NOM_FEATURES = ["Weather", "Time_of_Day", "Vehicle_Type"]
DROP_COLUMNS = ["Order_ID", "Delivery_Time_min", "Delivery_Class"]  # ID + leakage


def make_label(minutes, fast_below=40, late_above=60):
    """Fast < fast_below, On time between (inclusive), Late > late_above."""
    return pd.cut(minutes, bins=[-np.inf, fast_below - 0.001, late_above, np.inf],
                  labels=LABELS)


def split_xy(df, fast_below=40, late_above=60):
    """Create labels and remove the target source (leakage) from the features."""
    df = df.copy()
    df["Delivery_Class"] = make_label(df["Delivery_Time_min"], fast_below, late_above)
    y = df["Delivery_Class"].astype(str)
    X = df.drop(columns=DROP_COLUMNS)
    return X, y


def build_preprocessor(scale=True):
    num = [("imp", SimpleImputer(strategy="median"))] + (
        [("sc", StandardScaler())] if scale else [])
    ordi = [("imp", SimpleImputer(strategy="most_frequent")),
            ("enc", OrdinalEncoder(categories=[["Low", "Medium", "High"]]))] + (
        [("sc", StandardScaler())] if scale else [])
    nom = [("imp", SimpleImputer(strategy="most_frequent")),
           ("enc", OneHotEncoder(handle_unknown="ignore"))]
    return ColumnTransformer([
        ("num", Pipeline(num), NUM_FEATURES),
        ("ord", Pipeline(ordi), ORD_FEATURES),
        ("nom", Pipeline(nom), NOM_FEATURES),
    ])


def make_model(clf, scale=True, k=None):
    steps = [("prep", build_preprocessor(scale))]
    if k:
        steps.append(("select", SelectKBest(f_classif, k=k)))
    steps.append(("clf", clf))
    return Pipeline(steps)
