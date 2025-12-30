# FastAPI entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(
    title="Real Estate ML Service",
    description="ML microservice for pricing, tenant risk scoring, and recommendations",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Load ML models
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

price_model = joblib.load(os.path.join(MODELS_DIR, "price_model.pkl"))
risk_model = joblib.load(os.path.join(MODELS_DIR, "risk_model.pkl"))
recommend_model = joblib.load(os.path.join(MODELS_DIR, "recommend_model.pkl"))
recommend_scaler = joblib.load(os.path.join(MODELS_DIR, "recommend_scaler.pkl"))

# ==============================
# Health check
# ==============================
@app.get("/")
def health_check():
    return {"status": "ML Service is running"}

@app.get("/health")
def health():
    return {"status": "UP", "service": "ai-service"}

# ==============================
# Request Schemas
# ==============================
class PriceRequest(BaseModel):
    surface: float
    rooms: int
    location_score: float
    distance_center: float
    season_index: float = 1.0

class RiskRequest(BaseModel):
    late_payments: int
    disputes: int
    rental_duration: int

class RecommendRequest(BaseModel):
    price: float
    surface: float
    rooms: int
    location_score: float
    lifestyle_score: float

# ==============================
# 1. Price Prediction
# ==============================
@app.post("/predict/price")
def predict_price(request: PriceRequest):
    X = np.array([[
        request.surface,
        request.rooms,
        request.location_score,
        request.distance_center,
        request.season_index
    ]])

    predicted_price = price_model.predict(X)[0]

    return {
        "suggested_price": round(float(predicted_price), 2),
        "currency": "EUR",
        "input": {
            "surface": request.surface,
            "rooms": request.rooms,
            "location_score": request.location_score,
            "distance_center": request.distance_center,
            "season_index": request.season_index
        }
    }

# ==============================
# 2. Tenant Risk Scoring
# ==============================
@app.post("/predict/risk")
def predict_risk(request: RiskRequest):
    X = np.array([[
        request.late_payments,
        request.disputes,
        request.rental_duration
    ]])

    risk_probability = risk_model.predict_proba(X)[0][1]
    risk_level = "LOW" if risk_probability < 0.3 else "MEDIUM" if risk_probability < 0.7 else "HIGH"

    return {
        "risk_score": round(risk_probability * 100, 2),
        "risk_level": risk_level,
        "input": {
            "late_payments": request.late_payments,
            "disputes": request.disputes,
            "rental_duration": request.rental_duration
        }
    }

# ==============================
# 3. Property Recommendation
# ==============================
@app.post("/recommend")
def recommend_property(request: RecommendRequest):
    X = np.array([[
        request.price,
        request.surface,
        request.rooms,
        request.location_score,
        request.lifestyle_score
    ]])

    X_scaled = recommend_scaler.transform(X)
    cluster = recommend_model.predict(X_scaled)[0]
    
    cluster_names = {
        0: "Budget-Friendly",
        1: "Mid-Range Comfort",
        2: "Premium Luxury"
    }

    return {
        "recommended_cluster": int(cluster),
        "cluster_name": cluster_names.get(int(cluster), "Standard"),
        "input": {
            "price": request.price,
            "surface": request.surface,
            "rooms": request.rooms,
            "location_score": request.location_score,
            "lifestyle_score": request.lifestyle_score
        }
    }
