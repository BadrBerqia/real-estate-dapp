from fastapi import FastAPI

app = FastAPI(
    title="Real Estate ML Service",
    description="ML models for rental price prediction, tenant risk scoring, and property recommendations",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"status": "ML Service running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# ============ ENDPOINTS À COMPLÉTER PAR ML ENGINEER ============

# POST /api/price-suggestion
# Input: surface, rooms, location, amenities
# Output: suggested_price_eth

# POST /api/tenant-risk
# Input: tenant_id, payment_history, disputes
# Output: risk_score (0-100)

# POST /api/recommend
# Input: user_preferences (budget, location, lifestyle)
# Output: list of matching properties

# GET /api/market-trends
# Output: price evolution data for dashboard