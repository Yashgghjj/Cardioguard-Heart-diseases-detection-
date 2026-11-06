from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.services.ml_service import ml_service
from app.schemas.model import ModelInfoResponse, ModelComparisonItem, ModelMetricsResponse
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/info", response_model=ModelInfoResponse)
def get_model_info(current_user: User = Depends(get_current_user)):
    meta = ml_service.get_metadata()
    if not meta:
        raise HTTPException(status_code=503, detail="Model metadata not yet initialized.")
    return meta

@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics(current_user: User = Depends(get_current_user)):
    meta = ml_service.get_metadata()
    if not meta or "metrics" not in meta:
        raise HTTPException(status_code=503, detail="Model metrics unavailable.")
    return meta["metrics"]

@router.get("/comparison", response_model=List[ModelComparisonItem])
def get_model_comparison(current_user: User = Depends(get_current_user)):
    meta = ml_service.get_metadata()
    if not meta or "model_comparison" not in meta:
        raise HTTPException(status_code=503, detail="Model comparison data unavailable.")
    return meta["model_comparison"]

