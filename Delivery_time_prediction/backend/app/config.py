"""Settings for the API. Override with environment variables if needed."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent          # Backend/
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE_DIR / "models" / "delivery_model.joblib"))
METRICS_PATH = Path(os.getenv("METRICS_PATH", BASE_DIR / "models" / "metrics.json"))

# Frontend origins allowed to call the API (comma separated in CORS_ORIGINS)
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4200",
).split(",")
