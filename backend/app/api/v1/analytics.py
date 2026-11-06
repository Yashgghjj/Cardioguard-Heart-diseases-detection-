from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.services.analytics_service import analytics_service
from app.schemas.analytics import OverviewMetrics, RiskDistributionItem, TrendItem, FeatureImportanceItem
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/overview", response_model=OverviewMetrics)
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_overview_metrics(db)

@router.get("/risk-distribution", response_model=List[RiskDistributionItem])
def get_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_risk_distribution(db)

@router.get("/trends", response_model=List[TrendItem])
def get_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_monthly_trends(db)

@router.get("/age-groups")
def get_age_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_age_group_analysis(db)

@router.get("/gender-distribution")
def get_gender_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_gender_distribution(db)

@router.get("/chest-pain")
def get_chest_pain_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_chest_pain_analysis(db)

@router.get("/feature-importance", response_model=List[FeatureImportanceItem])
def get_feature_importance(
    current_user: User = Depends(get_current_user)
):
    return analytics_service.get_feature_importance()

