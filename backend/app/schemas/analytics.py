from pydantic import BaseModel
from typing import List, Dict, Any

class OverviewMetrics(BaseModel):
    total_assessments: int
    higher_risk_count: int
    intermediate_risk_count: int
    lower_risk_count: int
    average_confidence: float
    model_accuracy: float
    model_roc_auc: float
    active_model_name: str
    active_model_version: str

class RiskDistributionItem(BaseModel):
    name: str
    value: int
    percentage: float
    color: str

class TrendItem(BaseModel):
    month: str
    total: int
    higher_risk: int
    intermediate_risk: int
    lower_risk: int

class AgeGroupItem(BaseModel):
    group: str
    total: int
    higher_risk: int
    lower_risk: int

class GenderDistributionItem(BaseModel):
    gender: str
    count: int
    percentage: float

class ChestPainDistributionItem(BaseModel):
    type: str
    count: int
    risk_percentage: float

class FeatureImportanceItem(BaseModel):
    feature: str
    label: str
    importance: float
    category: str

