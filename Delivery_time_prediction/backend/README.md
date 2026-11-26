# Food Delivery Time Classification - Backend

Predicts Fast / On time / Late. Structure follows the ML life cycle
(monitoring will be added later).

## Run
```bash
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
# put Food_Delivery_Times.csv in data/raw/
python -m training.train
```
Outputs: `models/delivery_model.joblib`, `models/metrics.json`, `figures/05-07_*.png`.

## Run the API (after training)
```bash
uvicorn app.main:app --reload
```
Docs and test form: http://127.0.0.1:8000/docs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API and model status |
| POST | `/predict` | Predict Fast / On time / Late |
| GET | `/model-info` | Test scores from `models/metrics.json` |

Example body for `/predict`:
```json
{"distance_km": 15, "weather": "Rainy", "traffic_level": "High",
 "time_of_day": "Evening", "vehicle_type": "Bike",
 "preparation_time_min": 25, "courier_experience_yrs": 1}
```
Frontend origins are set in `app/config.py` (`CORS_ORIGINS`).

## Life cycle map
| Stage | Location |
|---|---|
| Problem definition | `docs/problem_definition.md` |
| Data collection | `data/raw/`, `training/data_loader.py` |
| EDA | `notebooks/`, `figures/` |
| Preprocessing | `training/features.py` |
| Training | `training/train.py`, `training/configs/config.yaml` |
| Evaluation | `training/evaluate.py`, `models/metrics.json` |
| Deployment | `app/` |
