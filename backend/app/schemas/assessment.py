from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class AssessmentInput(BaseModel):
    patient_id: Optional[int] = None
    # If patient_id is not provided, optional quick patient details can be supplied
    patient_name: Optional[str] = None
    age: float = Field(..., ge=18, le=110, description="Age of the patient in years")
    sex: int = Field(..., ge=0, le=1, description="Biological sex (1 = Male, 0 = Female)")
    cp: int = Field(..., ge=1, le=4, description="Chest Pain Type (1: Typical Angina, 2: Atypical Angina, 3: Non-anginal, 4: Asymptomatic)")
    trestbps: float = Field(..., ge=70, le=240, description="Resting Blood Pressure in mm Hg on admission")
    chol: float = Field(..., ge=100, le=600, description="Serum Cholesterol in mg/dl")
    fbs: int = Field(..., ge=0, le=1, description="Fasting Blood Sugar > 120 mg/dl (1 = True, 0 = False)")
    restecg: int = Field(..., ge=0, le=2, description="Resting ECG Results (0: Normal, 1: ST-T wave abnormality, 2: LV hypertrophy)")
    thalach: float = Field(..., ge=50, le=230, description="Maximum Heart Rate Achieved (bpm)")
    exang: int = Field(..., ge=0, le=1, description="Exercise-Induced Angina (1 = Yes, 0 = No)")
    oldpeak: float = Field(..., ge=0.0, le=8.0, description="ST Depression induced by exercise relative to rest")
    slope: int = Field(..., ge=1, le=3, description="Slope of the peak exercise ST segment (1: Upsloping, 2: Flat, 3: Downsloping)")
    ca: float = Field(..., ge=0.0, le=3.0, description="Number of major vessels (0-3) colored by fluoroscopy")
    thal: float = Field(..., description="Thalassemia status (3 = Normal, 6 = Fixed Defect, 7 = Reversable Defect)")
    clinical_notes: Optional[str] = None

class FeatureContribution(BaseModel):
    feature: str
    label: str
    value: Any
    display_value: str
    impact: float # positive increases risk, negative decreases risk
    direction: str # "increases_risk" or "decreases_risk"
    explanation: str

class RecommendationItem(BaseModel):
    category: str
    title: str
    description: str
    priority: str # "high", "medium", "info"

class PredictionResult(BaseModel):
    predicted_class: int
    predicted_label: str
    probability: float
    probability_percentage: float
    risk_level: str # "lower", "intermediate", "higher"
    risk_badge_color: str
    model_name: str
    model_version: str
    top_contributions: List[FeatureContribution]
    recommendations: List[RecommendationItem]
    disclaimer: str

class AssessmentResponse(BaseModel):
    id: int
    assessment_reference: str
    patient_id: int
    patient_code: Optional[str] = None
    patient_name: Optional[str] = None
    user_id: int
    assessed_by_name: Optional[str] = None
    age: float
    sex: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalach: float
    exang: int
    oldpeak: float
    slope: int
    ca: float
    thal: float
    predicted_class: int
    predicted_label: str
    probability: float
    risk_level: str
    model_version: str
    model_name: str
    feature_contributions: Optional[List[Dict[str, Any]]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None
    clinical_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AssessmentListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[AssessmentResponse]

