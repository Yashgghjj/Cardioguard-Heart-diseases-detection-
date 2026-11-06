export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'healthcare_professional' | 'cardiologist';
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: number;
  patient_code: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact_email?: string;
  contact_phone?: string;
  medical_notes?: string;
  created_at: string;
  updated_at: string;
  assessment_count?: number;
  latest_risk_level?: 'lower' | 'intermediate' | 'higher';
}

export interface FeatureContribution {
  feature: string;
  label: string;
  value: any;
  display_value: string;
  impact: number;
  direction: 'increases_risk' | 'decreases_risk';
  explanation: string;
}

export interface RecommendationItem {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'info';
}

export interface Assessment {
  id: number;
  assessment_reference: string;
  patient_id: number;
  patient_code?: string;
  patient_name?: string;
  user_id: number;
  assessed_by_name?: string;
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
  predicted_class: number;
  predicted_label: string;
  probability: number;
  risk_level: 'lower' | 'intermediate' | 'higher';
  model_version: string;
  model_name: string;
  feature_contributions?: FeatureContribution[];
  recommendations?: RecommendationItem[];
  clinical_notes?: string;
  created_at: string;
}

export interface OverviewMetrics {
  total_assessments: number;
  higher_risk_count: number;
  intermediate_risk_count: number;
  lower_risk_count: number;
  average_confidence: number;
  model_accuracy: number;
  model_roc_auc: number;
  active_model_name: string;
  active_model_version: string;
}

export interface RiskDistributionItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TrendItem {
  month: string;
  total: number;
  higher_risk: number;
  intermediate_risk: number;
  lower_risk: number;
}

export interface AgeGroupItem {
  group: string;
  total: number;
  higher_risk: number;
  lower_risk: number;
}

export interface GenderDistributionItem {
  gender: string;
  count: number;
  percentage: number;
}

export interface ChestPainItem {
  type: string;
  count: number;
  risk_percentage: number;
}

export interface ModelComparisonItem {
  model_name: string;
  best_params: Record<string, any>;
  cv_roc_auc_mean: number;
  test_accuracy: number;
  test_precision: number;
  test_recall: number;
  test_specificity: number;
  test_f1: number;
  test_roc_auc: number;
}

export interface ModelMetadata {
  model_version: string;
  created_at: string;
  dataset_name: string;
  dataset_records: number;
  train_samples: number;
  test_samples: number;
  target_definition: string;
  selected_model: string;
  model_comparison: ModelComparisonItem[];
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    sensitivity: number;
    specificity: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: {
      tn: number;
      fp: number;
      fn: number;
      tp: number;
    };
    roc_curve?: {
      fpr: number[];
      tpr: number[];
    };
    pr_curve?: {
      recall: number[];
      precision: number[];
    };
  };
  feature_importance: Array<{
    feature: string;
    label: string;
    importance: number;
    category: string;
  }>;
  thresholds: Record<string, string>;
  disclaimer: string;
}

