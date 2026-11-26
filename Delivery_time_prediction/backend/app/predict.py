"""Loads the trained pipeline once and runs inference."""
import joblib
import pandas as pd

from Delivery_time_prediction.backend1.app.config import MODEL_PATH

_model = None


def load_model():
    """Load the model once (called at API startup)."""
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run: python -m training.train")
        _model = joblib.load(MODEL_PATH)
    return _model


def is_loaded() -> bool:
    return _model is not None


def predict_delivery(distance_km, weather, traffic_level, time_of_day,
                     vehicle_type, preparation_time_min, courier_experience_yrs):
    """Same function name as the notebook demo, so it works in both places."""
    model = load_model()
    row = pd.DataFrame([{
        "Distance_km": distance_km,
        "Weather": weather,
        "Traffic_Level": traffic_level,
        "Time_of_Day": time_of_day,
        "Vehicle_Type": vehicle_type,
        "Preparation_Time_min": preparation_time_min,
        "Courier_Experience_yrs": courier_experience_yrs,
    }])
    proba = model.predict_proba(row)[0]
    probs = {c: round(float(p), 4) for c, p in zip(model.classes_, proba)}
    return {"predicted_class": max(probs, key=probs.get), "probabilities": probs}
