"""API entry point. Run from Backend/:  uvicorn app.main:app --reload"""
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from Delivery_time_prediction.backend1.app import predict
from Delivery_time_prediction.backend1.app.config import CORS_ORIGINS, METRICS_PATH
from Delivery_time_prediction.backend1.app.schemas import HealthResponse, PredictRequest, PredictResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    predict.load_model()          # load once at startup, not per request
    yield


app = FastAPI(title="Food Delivery Time Prediction API", version="1.0.0",
              lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health():
    return {"status": "ok", "model_loaded": predict.is_loaded()}


@app.post("/predict", response_model=PredictResponse)
def predict_endpoint(req: PredictRequest):
    return predict.predict_delivery(**req.model_dump())


@app.get("/model-info")
def model_info():
    """Test scores saved by training (models/metrics.json)."""
    if not METRICS_PATH.exists():
        raise HTTPException(404, "metrics.json not found. Train the model first.")
    return json.loads(METRICS_PATH.read_text())
