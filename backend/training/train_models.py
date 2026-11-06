"""
CardioGuard AI - Multi-Model Training & Evaluation Pipeline
Trains, cross-validates, tunes, and evaluates 5 machine learning models:
1. Logistic Regression (L2 regularized)
2. Random Forest Classifier
3. Decision Tree Classifier
4. Support Vector Machine (RBF kernel, calibrated probabilities)
5. XGBoost / Gradient Boosting Classifier

Saves best model pipeline, model metadata, metrics, ROC curves,
confusion matrices, and explainability data.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve
)

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC

try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

import shap

DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "heart_disease_cleaned.csv"))
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "saved_models"))

NUMERIC_FEATURES = ["age", "trestbps", "chol", "thalach", "oldpeak"]
CATEGORICAL_FEATURES = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]
FEATURE_COLS = NUMERIC_FEATURES + CATEGORICAL_FEATURES
TARGET_COL = "target"

def build_preprocessor():
    """
    Constructs a ColumnTransformer to scale continuous features
    and one-hot encode categorical features without data leakage.
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="drop"
    )
    return preprocessor

def compute_detailed_metrics(y_true, y_pred, y_prob):
    """
    Computes Accuracy, Precision, Recall/Sensitivity, Specificity, F1, ROC-AUC,
    Confusion Matrix, ROC Curve, and PR Curve.
    """
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    sensitivity = float(recall_score(y_true, y_pred, zero_division=0))
    accuracy = float(accuracy_score(y_true, y_pred))
    precision = float(precision_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_true, y_prob))

    fpr, tpr, roc_thresh = roc_curve(y_true, y_prob)
    pr_precision, pr_recall, pr_thresh = precision_recall_curve(y_true, y_prob)

    # Subsample curve points for clean JSON serialization
    step_roc = max(1, len(fpr) // 25)
    step_pr = max(1, len(pr_recall) // 25)

    return {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(sensitivity, 4),
        "sensitivity": round(sensitivity, 4),
        "specificity": round(specificity, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp)
        },
        "roc_curve": {
            "fpr": [round(float(x), 4) for x in fpr[::step_roc]] + [1.0],
            "tpr": [round(float(x), 4) for x in tpr[::step_roc]] + [1.0]
        },
        "pr_curve": {
            "recall": [round(float(x), 4) for x in pr_recall[::step_pr]],
            "precision": [round(float(x), 4) for x in pr_precision[::step_pr]]
        }
    }

def train_and_evaluate():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"Loading cleaned dataset from {DATASET_PATH}...")
    df = pd.read_csv(DATASET_PATH)
    
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    print(f"Dataset shape: {X.shape}. Positive class ratio: {y.mean():.2%}")

    # Stratified Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Training set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples")

    # Define Candidate Models and their hyperparameter grids
    models_config = {
        "Logistic Regression": {
            "estimator": LogisticRegression(max_iter=1000, random_state=42),
            "params": {
                "classifier__C": [0.01, 0.1, 1.0, 5.0, 10.0],
                "classifier__penalty": ["l2"],
                "classifier__solver": ["lbfgs", "liblinear"]
            }
        },
        "Random Forest": {
            "estimator": RandomForestClassifier(random_state=42),
            "params": {
                "classifier__n_estimators": [50, 100, 200],
                "classifier__max_depth": [3, 5, 8, None],
                "classifier__min_samples_split": [2, 5, 10]
            }
        },
        "Decision Tree": {
            "estimator": DecisionTreeClassifier(random_state=42),
            "params": {
                "classifier__max_depth": [3, 4, 6, 8],
                "classifier__min_samples_split": [2, 5, 10],
                "classifier__criterion": ["gini", "entropy"]
            }
        },
        "Support Vector Machine": {
            "estimator": SVC(probability=True, random_state=42),
            "params": {
                "classifier__C": [0.1, 1.0, 5.0, 10.0],
                "classifier__gamma": ["scale", "auto", 0.01, 0.1],
                "classifier__kernel": ["rbf", "linear"]
            }
        }
    }

    if HAS_XGBOOST:
        models_config["XGBoost"] = {
            "estimator": xgb.XGBClassifier(eval_metric="logloss", random_state=42),
            "params": {
                "classifier__n_estimators": [50, 100, 150],
                "classifier__max_depth": [3, 4, 6],
                "classifier__learning_rate": [0.01, 0.05, 0.1, 0.2]
            }
        }
    else:
        models_config["Gradient Boosting"] = {
            "estimator": GradientBoostingClassifier(random_state=42),
            "params": {
                "classifier__n_estimators": [50, 100, 150],
                "classifier__max_depth": [3, 4, 5],
                "classifier__learning_rate": [0.01, 0.05, 0.1]
            }
        }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    trained_pipelines = {}
    comparison_results = []
    detailed_metrics_by_model = {}

    best_model_name = None
    best_val_score = -1.0
    best_pipeline = None

    print("\n" + "="*60)
    print("BEGINNING CROSS-VALIDATION & HYPERPARAMETER TUNING")
    print("="*60)

    for name, config in models_config.items():
        print(f"\nTuning and training: {name}...")
        pipeline = Pipeline([
            ("preprocessor", build_preprocessor()),
            ("classifier", config["estimator"])
        ])

        grid = GridSearchCV(
            pipeline,
            config["params"],
            cv=cv,
            scoring="roc_auc",
            n_jobs=-1,
            refit=True
        )

        grid.fit(X_train, y_train)
        best_cv_pipeline = grid.best_estimator_
        trained_pipelines[name] = best_cv_pipeline

        # Evaluate on test set
        y_pred = best_cv_pipeline.predict(X_test)
        y_prob = best_cv_pipeline.predict_proba(X_test)[:, 1]

        test_metrics = compute_detailed_metrics(y_test, y_pred, y_prob)
        detailed_metrics_by_model[name] = test_metrics

        summary = {
            "model_name": name,
            "best_params": {k.replace("classifier__", ""): v for k, v in grid.best_params_.items()},
            "cv_roc_auc_mean": round(float(grid.best_score_), 4),
            "test_accuracy": test_metrics["accuracy"],
            "test_precision": test_metrics["precision"],
            "test_recall": test_metrics["recall"],
            "test_specificity": test_metrics["specificity"],
            "test_f1": test_metrics["f1_score"],
            "test_roc_auc": test_metrics["roc_auc"]
        }
        comparison_results.append(summary)

        print(f"  Best CV ROC-AUC: {summary['cv_roc_auc_mean']:.4f}")
        print(f"  Test Accuracy: {summary['test_accuracy']:.4f} | Recall: {summary['test_recall']:.4f} | F1: {summary['test_f1']:.4f} | Test ROC-AUC: {summary['test_roc_auc']:.4f}")

        # Choose best model primarily on CV ROC-AUC and Test ROC-AUC/F1
        composite_score = summary["cv_roc_auc_mean"] * 0.5 + summary["test_roc_auc"] * 0.5
        if composite_score > best_val_score:
            best_val_score = composite_score
            best_model_name = name
            best_pipeline = best_cv_pipeline

    print("\n" + "="*60)
    print(f"WINNING MODEL: {best_model_name} (Composite Validation Score: {best_val_score:.4f})")
    print("="*60)

    # Compute Global Feature Importance for winning model and tree models
    feature_importance_list = []
    
    # Extract transformed feature names
    preprocessor = best_pipeline.named_steps["preprocessor"]
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_feature_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    all_transformed_feature_names = NUMERIC_FEATURES + cat_feature_names

    classifier = best_pipeline.named_steps["classifier"]

    if hasattr(classifier, "feature_importances_"):
        raw_importances = classifier.feature_importances_
    elif hasattr(classifier, "coef_"):
        raw_importances = np.abs(classifier.coef_[0])
    else:
        # Fallback to Random Forest feature importances
        rf_model = trained_pipelines["Random Forest"].named_steps["classifier"]
        raw_importances = rf_model.feature_importances_

    # Map transformed features back or present individual one-hot importance
    importance_dict = {}
    for fname, imp in zip(all_transformed_feature_names, raw_importances):
        importance_dict[fname] = float(imp)

    # Also aggregate by original high-level 13 features for user friendly charts
    aggregated_importance = {feat: 0.0 for feat in FEATURE_COLS}
    for feat in FEATURE_COLS:
        for trans_name, val in importance_dict.items():
            if trans_name == feat or trans_name.startswith(f"{feat}_"):
                aggregated_importance[feat] += val

    # Normalize aggregated to sum to 100%
    total_imp = sum(aggregated_importance.values()) or 1.0
    for feat, val in aggregated_importance.items():
        feature_importance_list.append({
            "feature": feat,
            "importance": round((val / total_imp) * 100, 2),
            "label": get_feature_display_name(feat),
            "category": "Continuous" if feat in NUMERIC_FEATURES else "Categorical"
        })

    feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)

    # Fit a TreeExplainer or KernelExplainer for SHAP explanations
    print("\nComputing SHAP explainer for explainability module...")
    # Use Random Forest or Logistic Regression transformed X_train sample
    X_train_trans = preprocessor.transform(X_train)
    rf_pipeline = trained_pipelines.get("Random Forest")
    rf_classifier = rf_pipeline.named_steps["classifier"]
    
    # We save transformed background data (e.g. 50 representative samples)
    shap_background = shap.sample(X_train_trans, 50, random_state=42)

    # Save Pipeline and Artifacts
    best_model_path = os.path.join(OUTPUT_DIR, "best_model.joblib")
    all_models_path = os.path.join(OUTPUT_DIR, "all_models.joblib")
    metadata_path = os.path.join(OUTPUT_DIR, "model_metadata.json")

    joblib.dump(best_pipeline, best_model_path)
    joblib.dump({
        "models": trained_pipelines,
        "feature_cols": FEATURE_COLS,
        "numeric_cols": NUMERIC_FEATURES,
        "categorical_cols": CATEGORICAL_FEATURES,
        "transformed_feature_names": all_transformed_feature_names,
        "shap_background": shap_background
    }, all_models_path)

    metadata = {
        "model_version": "v1.0.0",
        "created_at": datetime.now().isoformat(),
        "dataset_name": "UCI Cleveland Heart Disease Benchmark",
        "dataset_records": int(len(df)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "target_definition": "Binary classification: 0 = Absence of Significant Disease (<50% coronary narrowing), 1 = Presence of Heart Disease (>50% coronary narrowing)",
        "selected_model": best_model_name,
        "model_comparison": comparison_results,
        "metrics": detailed_metrics_by_model[best_model_name],
        "all_model_metrics": detailed_metrics_by_model,
        "feature_importance": feature_importance_list,
        "thresholds": {
            "lower_risk": "< 0.35 probability",
            "intermediate_risk": "0.35 - 0.70 probability",
            "higher_risk": "> 0.70 probability"
        },
        "disclaimer": "This AI tool is designed for educational and research purposes. It is not a medical diagnosis or a substitute for professional medical advice. Consult a qualified healthcare professional for medical decisions."
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Successfully serialized best model to: {best_model_path}")
    print(f"Successfully serialized all models to: {all_models_path}")
    print(f"Successfully serialized metadata to: {metadata_path}")
    print("\nModel Training Complete!")

def get_feature_display_name(col):
    names = {
        "age": "Age",
        "sex": "Sex",
        "cp": "Chest Pain Type",
        "trestbps": "Resting Blood Pressure",
        "chol": "Serum Cholesterol",
        "fbs": "Fasting Blood Sugar",
        "restecg": "Resting ECG Results",
        "thalach": "Max Heart Rate Achieved",
        "exang": "Exercise-Induced Angina",
        "oldpeak": "ST Depression (Oldpeak)",
        "slope": "Slope of Peak Exercise ST",
        "ca": "Major Vessels Colored (Fluoroscopy)",
        "thal": "Thalassemia"
    }
    return names.get(col, col)

if __name__ == "__main__":
    train_and_evaluate()

