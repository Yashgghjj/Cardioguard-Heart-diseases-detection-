from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ModelComparisonItem(BaseModel):
    model_name: str
    best_params: Dict[str, Any]
    cv_roc_auc_mean: float
    test_accuracy: float
    test_precision: float
    test_recall: float
    test_specificity: float
    test_f1: float
    test_roc_auc: float

class ConfusionMatrixData(BaseModel):
    tn: int
    fp: int
    fn: int
    tp: int

class CurveData(BaseModel):
    fpr: Optional[List[float]] = None
    tpr: Optional[List[float]] = None
    recall: Optional[List[float]] = None
    precision: Optional[List[float]] = None

class ModelMetricsResponse(BaseModel):
    accuracy: float
    precision: float
    recall: float
    sensitivity: float
    specificity: float
    f1_score: float
    roc_auc: float
    confusion_matrix: ConfusionMatrixData
    roc_curve: Optional[Dict[str, List[float]]] = None
    pr_curve: Optional[Dict[str, List[float]]] = None

class ModelInfoResponse(BaseModel):
    model_version: str
    created_at: str
    dataset_name: str
    dataset_records: int
    train_samples: int
    test_samples: int
    target_definition: str
    selected_model: str
    model_comparison: List[ModelComparisonItem]
    metrics: ModelMetricsResponse
    all_model_metrics: Dict[str, Any]
    feature_importance: List[Dict[str, Any]]
    thresholds: Dict[str, str]
    disclaimer: str

