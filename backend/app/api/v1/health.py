from fastapi import APIRouter
from datetime import datetime
from app.services.ml_service import ml_service

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CardioGuard AI API",
        "version": "1.0.0",
        "ml_engine_loaded": ml_service.is_ready(),
        "timestamp": datetime.utcnow().isoformat()
    }

