"""Run from Backend/ after training:  pytest"""
from fastapi.testclient import TestClient

from Delivery_time_prediction.backend1.app.main import app

GOOD = {"distance_km": 15, "weather": "Rainy", "traffic_level": "High",
        "time_of_day": "Evening", "vehicle_type": "Bike",
        "preparation_time_min": 25, "courier_experience_yrs": 1}


def test_health():
    with TestClient(app) as c:
        assert c.get("/health").json() == {"status": "ok", "model_loaded": True}


def test_predict_ok():
    with TestClient(app) as c:
        r = c.post("/predict", json=GOOD)
        assert r.status_code == 200
        body = r.json()
        assert body["predicted_class"] in ["Fast", "On time", "Late"]
        assert abs(sum(body["probabilities"].values()) - 1) < 0.01


def test_predict_bad_input():
    with TestClient(app) as c:
        assert c.post("/predict", json={**GOOD, "weather": "Sunny"}).status_code == 422
