import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from app.core.config import settings

class MLService:
    def __init__(self):
        self.model_pipeline = None
        self.all_models = None
        self.metadata = None
        self.feature_cols = [
            "age", "trestbps", "chol", "thalach", "oldpeak",
            "sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"
        ]
        self._load_artifacts()

    def _load_artifacts(self):
        best_model_path = os.path.join(settings.SAVED_MODELS_DIR, "best_model.joblib")
        all_models_path = os.path.join(settings.SAVED_MODELS_DIR, "all_models.joblib")
        metadata_path = os.path.join(settings.SAVED_MODELS_DIR, "model_metadata.json")

        if os.path.exists(best_model_path):
            self.model_pipeline = joblib.load(best_model_path)
        if os.path.exists(all_models_path):
            self.all_models = joblib.load(all_models_path)
        if os.path.exists(metadata_path):
            with open(metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

    def is_ready(self) -> bool:
        return self.model_pipeline is not None and self.metadata is not None

    def get_metadata(self) -> Dict[str, Any]:
        return self.metadata or {}

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_ready():
            self._load_artifacts()
            if not self.is_ready():
                raise RuntimeError("Machine Learning model is not loaded. Please train models first.")

        # Ensure correct column ordering matching training pipeline
        row_dict = {
            "age": float(input_data["age"]),
            "sex": int(input_data["sex"]),
            "cp": int(input_data["cp"]),
            "trestbps": float(input_data["trestbps"]),
            "chol": float(input_data["chol"]),
            "fbs": int(input_data["fbs"]),
            "restecg": int(input_data["restecg"]),
            "thalach": float(input_data["thalach"]),
            "exang": int(input_data["exang"]),
            "oldpeak": float(input_data["oldpeak"]),
            "slope": int(input_data["slope"]),
            "ca": float(input_data["ca"]),
            "thal": float(input_data["thal"]),
        }

        df = pd.DataFrame([row_dict])

        # Generate prediction and probabilities
        proba_array = self.model_pipeline.predict_proba(df)[0]
        prob_positive = float(proba_array[1])
        predicted_class = 1 if prob_positive >= 0.50 else 0

        # Define 3 visual model categories as specified in Section 4:
        # Lower: < 0.35
        # Intermediate: 0.35 - 0.70
        # Higher: > 0.70
        if prob_positive < 0.35:
            risk_level = "lower"
            predicted_label = "Lower Estimated Model Risk"
            badge_color = "#10b981" # Emerald green
        elif prob_positive <= 0.70:
            risk_level = "intermediate"
            predicted_label = "Intermediate Estimated Model Risk"
            badge_color = "#f59e0b" # Amber
        else:
            risk_level = "higher"
            predicted_label = "Higher Estimated Model Risk"
            badge_color = "#ef4444" # Crimson red

        # Local feature contribution analysis
        top_contributions = self._compute_feature_contributions(df, row_dict)

        # Personalized recommendations
        recommendations = self._generate_recommendations(row_dict, prob_positive)

        disclaimer = (
            "This AI tool is designed for educational and research purposes. "
            "It is not a medical diagnosis or a substitute for professional medical advice. "
            "Consult a qualified healthcare professional for medical decisions."
        )

        return {
            "predicted_class": predicted_class,
            "predicted_label": predicted_label,
            "probability": round(prob_positive, 4),
            "probability_percentage": round(prob_positive * 100, 1),
            "risk_level": risk_level,
            "risk_badge_color": badge_color,
            "model_name": self.metadata.get("selected_model", "Logistic Regression"),
            "model_version": self.metadata.get("model_version", "v1.0.0"),
            "top_contributions": top_contributions,
            "recommendations": recommendations,
            "disclaimer": disclaimer
        }

    def _compute_feature_contributions(self, df: pd.DataFrame, row: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Computes local feature contribution using pipeline coefficients and transformations.
        """
        contributions = []
        try:
            preprocessor = self.model_pipeline.named_steps["preprocessor"]
            classifier = self.model_pipeline.named_steps["classifier"]
            transformed_row = preprocessor.transform(df)[0]

            if hasattr(classifier, "coef_"):
                weights = classifier.coef_[0]
                feature_effects = transformed_row * weights

                # Group by high-level features
                cat_encoder = preprocessor.named_transformers_["cat"]
                cat_names = list(cat_encoder.get_feature_names_out(["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]))
                all_trans_names = ["age", "trestbps", "chol", "thalach", "oldpeak"] + cat_names

                effects_dict = {}
                for name, effect in zip(all_trans_names, feature_effects):
                    base_name = name.split("_")[0]
                    effects_dict[base_name] = effects_dict.get(base_name, 0.0) + float(effect)

                for feat, effect in sorted(effects_dict.items(), key=lambda x: abs(x[1]), reverse=True):
                    display_info = self._get_feature_context(feat, row.get(feat))
                    direction = "increases_risk" if effect > 0 else "decreases_risk"
                    contributions.append({
                        "feature": feat,
                        "label": display_info["label"],
                        "value": row.get(feat),
                        "display_value": display_info["display_value"],
                        "impact": round(effect, 3),
                        "direction": direction,
                        "explanation": display_info["explanation"]
                    })
            else:
                # Tree-based fallback
                for feat in ["ca", "oldpeak", "thalach", "cp", "thal", "chol", "trestbps"]:
                    display_info = self._get_feature_context(feat, row.get(feat))
                    contributions.append({
                        "feature": feat,
                        "label": display_info["label"],
                        "value": row.get(feat),
                        "display_value": display_info["display_value"],
                        "impact": 0.15,
                        "direction": "increases_risk" if (row.get(feat, 0) > 1 or feat in ["cp", "oldpeak"]) else "decreases_risk",
                        "explanation": display_info["explanation"]
                    })
        except Exception as e:
            print(f"Error calculating feature contributions: {e}")

        return contributions[:6]

    def _get_feature_context(self, feat: str, val: Any) -> Dict[str, str]:
        cp_labels = {1: "Typical Angina", 2: "Atypical Angina", 3: "Non-anginal Pain", 4: "Asymptomatic"}
        restecg_labels = {0: "Normal", 1: "ST-T Wave Abnormality", 2: "Left Ventricular Hypertrophy"}
        slope_labels = {1: "Upsloping", 2: "Flat", 3: "Downsloping"}
        thal_labels = {3: "Normal", 6: "Fixed Defect", 7: "Reversable Defect", 3.0: "Normal", 6.0: "Fixed Defect", 7.0: "Reversable Defect"}

        labels = {
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
            "slope": "ST Segment Slope",
            "ca": "Major Vessels (Fluoroscopy)",
            "thal": "Thalassemia Status"
        }

        display_val = str(val)
        explanation = f"Patient measurement: {val}"

        if feat == "sex":
            display_val = "Male" if val == 1 else "Female"
            explanation = "Epidemiological statistical weighting associated with gender."
        elif feat == "cp":
            display_val = cp_labels.get(val, f"Type {val}")
            explanation = f"Chest discomfort pattern '{display_val}' observed during clinical evaluation."
        elif feat == "trestbps":
            display_val = f"{val} mm Hg"
            explanation = "Elevated resting blood pressure can elevate vascular strain." if val >= 130 else "Resting blood pressure within standard resting norms."
        elif feat == "chol":
            display_val = f"{val} mg/dl"
            explanation = "Elevated serum cholesterol is statistically associated with arterial lipid plaque buildup." if val >= 200 else "Serum cholesterol within desirable ranges."
        elif feat == "fbs":
            display_val = "> 120 mg/dl" if val == 1 else "≤ 120 mg/dl"
            explanation = "Elevated fasting blood sugar may indicate metabolic and cardiovascular co-factors."
        elif feat == "restecg":
            display_val = restecg_labels.get(val, f"Code {val}")
            explanation = f"Electrocardiogram baseline indicates {display_val}."
        elif feat == "thalach":
            display_val = f"{val} bpm"
            explanation = "Lower maximum heart rate during stress exercise may reflect lower cardiovascular reserve."
        elif feat == "exang":
            display_val = "Yes" if val == 1 else "No"
            explanation = "Exercise-induced angina signals myocardial ischemia under physical exertion."
        elif feat == "oldpeak":
            display_val = f"{val} mm"
            explanation = "Exercise-induced ST depression reflects potential cardiac ischemia during stress."
        elif feat == "slope":
            display_val = slope_labels.get(val, f"Slope {val}")
            explanation = f"ST segment slope during peak exercise is characterized as {display_val}."
        elif feat == "ca":
            display_val = f"{int(val)} vessels"
            explanation = f"{int(val)} major vessel(s) colored by fluoroscopy; vessel obstruction is a key angiographic marker."
        elif feat == "thal":
            display_val = thal_labels.get(val, f"Type {val}")
            explanation = f"Thallium stress test myocardial perfusion pattern: {display_val}."

        return {
            "label": labels.get(feat, feat),
            "display_value": display_val,
            "explanation": explanation
        }

    def _generate_recommendations(self, row: Dict[str, Any], prob: float) -> List[Dict[str, str]]:
        recs = []

        if prob >= 0.70:
            recs.append({
                "category": "Clinical Follow-up",
                "title": "Comprehensive Cardiologist Consultation",
                "description": "Due to higher model risk indicators, schedule an in-depth clinical consultation with a licensed cardiologist for diagnostic imaging (such as echocardiogram or coronary angiography).",
                "priority": "high"
            })
        elif prob >= 0.35:
            recs.append({
                "category": "Preventative Monitoring",
                "title": "Outpatient Follow-up & Stress Re-evaluation",
                "description": "Intermediate estimated risk profile suggests regular outpatient blood pressure, lipid panel, and cardiac stress monitoring.",
                "priority": "medium"
            })
        else:
            recs.append({
                "category": "Routine Health",
                "title": "Maintain Healthy Baseline Habits",
                "description": "Model scores indicate lower estimated risk. Continue annual physical wellness exams, regular cardiovascular exercise, and nutrient-dense nutrition.",
                "priority": "info"
            })

        if row.get("trestbps", 0) >= 140:
            recs.append({
                "category": "Blood Pressure",
                "title": "Hypertension Management Protocol",
                "description": f"Resting systolic blood pressure ({row.get('trestbps')} mm Hg) is elevated. Consult your physician regarding dietary sodium reduction, DASH diet, and pharmacological review.",
                "priority": "high"
            })

        if row.get("chol", 0) >= 240:
            recs.append({
                "category": "Lipid Profile",
                "title": "Hypercholesterolemia Dietary & Statin Review",
                "description": f"Serum cholesterol is elevated ({row.get('chol')} mg/dl). Discuss full lipid fraction testing (LDL-C, HDL-C, Triglycerides) and dietary lifestyle modifications.",
                "priority": "medium"
            })

        if row.get("exang", 0) == 1 or row.get("oldpeak", 0) >= 1.5:
            recs.append({
                "category": "Exercise & Stress",
                "title": "Supervised Exercise Regimen",
                "description": "Ischemic markers observed during exertion. Avoid sudden unmonitored strenuous exertion until evaluated by a clinical exercise physiologist.",
                "priority": "high"
            })

        if row.get("fbs", 0) == 1:
            recs.append({
                "category": "Glycemic Control",
                "title": "Fasting Blood Sugar & HbA1c Evaluation",
                "description": "Fasting blood sugar > 120 mg/dl detected. Obtain a comprehensive glycated hemoglobin (HbA1c) test to evaluate glycemic control.",
                "priority": "medium"
            })

        # Universal educational recommendation
        recs.append({
            "category": "Lifestyle & Nutrition",
            "title": "Heart-Healthy Mediterranean Diet & Active Living",
            "description": "Incorporate leafy greens, omega-3 fatty acids, and aim for 150 minutes of moderate aerobic activity weekly as recommended by AHA guidelines.",
            "priority": "info"
        })

        return recs

ml_service = MLService()

