"""Request / response models. FastAPI validates the frontend input with these."""
from typing import Dict, Literal

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    distance_km: float = Field(..., gt=0, le=100, examples=[15.0])
    weather: Literal["Clear", "Rainy", "Foggy", "Snowy", "Windy"]
    traffic_level: Literal["Low", "Medium", "High"]
    time_of_day: Literal["Morning", "Afternoon", "Evening", "Night"]
    vehicle_type: Literal["Bike", "Scooter", "Car"]
    preparation_time_min: float = Field(..., ge=0, le=180, examples=[25])
    courier_experience_yrs: float = Field(..., ge=0, le=60, examples=[1.0])


class PredictResponse(BaseModel):
    predicted_class: Literal["Fast", "On time", "Late"]
    probabilities: Dict[str, float]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
