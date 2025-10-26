from typing import Dict

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field


class RiskPredictionRequest(BaseModel):
    attendance: float = Field(ge=0, le=100)
    gpa: float = Field(ge=0, le=4)
    assignments_on_time: float = Field(ge=0, le=1)
    quiz_avg: float = Field(ge=0, le=100)
    lms_activity: float = Field(ge=0, le=1)


class RiskPredictionResponse(BaseModel):
    riskScore: float
    factors: Dict[str, float]


class ExplainResponse(BaseModel):
    riskScore: float
    contributions: Dict[str, float]


class RetrainResponse(BaseModel):
    status: str
    samplesIngested: int


app = FastAPI(
    title="EduBloom AI Service",
    version="1.0.0",
    description="FastAPI microservice providing risk prediction utilities for EduBloom."
)


FEATURE_WEIGHTS = {
    "attendance": 0.3,
    "gpa": 0.25,
    "assignments_on_time": 0.2,
    "quiz_avg": 0.15,
    "lms_activity": 0.1,
}


def calculate_risk_score(payload: RiskPredictionRequest) -> RiskPredictionResponse:
    normalized = {
        "attendance": payload.attendance / 100,
        "gpa": payload.gpa / 4,
        "assignments_on_time": payload.assignments_on_time,
        "quiz_avg": payload.quiz_avg / 100,
        "lms_activity": payload.lms_activity,
    }

    weighted_sum = sum(FEATURE_WEIGHTS[key] * normalized[key] for key in FEATURE_WEIGHTS)
    risk_score = max(0.0, min(1.0, 1 - weighted_sum))

    factors = {
        key: round(FEATURE_WEIGHTS[key] * (normalized[key] - 0.5), 4)
        for key in FEATURE_WEIGHTS
    }

    return RiskPredictionResponse(riskScore=round(risk_score, 4), factors=factors)


@app.post("/predict", response_model=RiskPredictionResponse)
async def predict(request: RiskPredictionRequest):
    """Return a simple heuristic-based risk score."""
    return calculate_risk_score(request)


@app.post("/explain", response_model=ExplainResponse)
async def explain(request: RiskPredictionRequest):
    prediction = calculate_risk_score(request)
    contributions = {
        feature: round(-value * 2, 4) for feature, value in prediction.factors.items()
    }
    return ExplainResponse(riskScore=prediction.riskScore, contributions=contributions)


@app.post("/retrain", response_model=RetrainResponse, status_code=202)
async def retrain(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for retraining")

    contents = await file.read()
    lines = contents.decode("utf-8", errors="ignore").splitlines()
    sample_count = max(0, len(lines) - 1)

    return RetrainResponse(status="Retraining scheduled", samplesIngested=sample_count)
