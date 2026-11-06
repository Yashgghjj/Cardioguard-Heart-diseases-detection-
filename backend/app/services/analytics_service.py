from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.models.assessment import Assessment
from app.models.patient import Patient
from app.models.model_version import ModelVersion
from app.services.ml_service import ml_service

class AnalyticsService:
    @staticmethod
    def get_overview_metrics(db: Session) -> Dict[str, Any]:
        total = db.query(Assessment).count()
        higher_risk = db.query(Assessment).filter(Assessment.risk_level == "higher").count()
        intermediate_risk = db.query(Assessment).filter(Assessment.risk_level == "intermediate").count()
        lower_risk = db.query(Assessment).filter(Assessment.risk_level == "lower").count()

        avg_conf_query = db.query(func.avg(Assessment.probability)).scalar()
        avg_confidence = round(float(avg_conf_query or 0.0) * 100, 1)

        meta = ml_service.get_metadata()
        metrics = meta.get("metrics", {})

        return {
            "total_assessments": total,
            "higher_risk_count": higher_risk,
            "intermediate_risk_count": intermediate_risk,
            "lower_risk_count": lower_risk,
            "average_confidence": avg_confidence,
            "model_accuracy": round(metrics.get("accuracy", 0.8689) * 100, 1),
            "model_roc_auc": round(metrics.get("roc_auc", 0.9632) * 100, 1),
            "active_model_name": meta.get("selected_model", "Logistic Regression"),
            "active_model_version": meta.get("model_version", "v1.0.0")
        }

    @staticmethod
    def get_risk_distribution(db: Session) -> List[Dict[str, Any]]:
        total = db.query(Assessment).count() or 1
        lower = db.query(Assessment).filter(Assessment.risk_level == "lower").count()
        intermediate = db.query(Assessment).filter(Assessment.risk_level == "intermediate").count()
        higher = db.query(Assessment).filter(Assessment.risk_level == "higher").count()

        return [
            {
                "name": "Lower Risk",
                "value": lower,
                "percentage": round((lower / total) * 100, 1),
                "color": "#10b981"
            },
            {
                "name": "Intermediate Risk",
                "value": intermediate,
                "percentage": round((intermediate / total) * 100, 1),
                "color": "#f59e0b"
            },
            {
                "name": "Higher Risk",
                "value": higher,
                "percentage": round((higher / total) * 100, 1),
                "color": "#ef4444"
            }
        ]

    @staticmethod
    def get_monthly_trends(db: Session) -> List[Dict[str, Any]]:
        # Aggregate assessments by month
        assessments = db.query(Assessment).order_by(Assessment.created_at.asc()).all()
        months_dict = {}

        if not assessments:
            # Fallback current month window
            now = datetime.utcnow()
            for i in range(5, -1, -1):
                m_date = now - timedelta(days=i * 30)
                m_str = m_date.strftime("%b %Y")
                months_dict[m_str] = {"month": m_str, "total": 0, "higher_risk": 0, "intermediate_risk": 0, "lower_risk": 0}
        else:
            for asm in assessments:
                m_str = asm.created_at.strftime("%b %Y") if asm.created_at else "Nov 2026"
                if m_str not in months_dict:
                    months_dict[m_str] = {"month": m_str, "total": 0, "higher_risk": 0, "intermediate_risk": 0, "lower_risk": 0}
                months_dict[m_str]["total"] += 1
                if asm.risk_level == "higher":
                    months_dict[m_str]["higher_risk"] += 1
                elif asm.risk_level == "intermediate":
                    months_dict[m_str]["intermediate_risk"] += 1
                else:
                    months_dict[m_str]["lower_risk"] += 1

        return list(months_dict.values())

    @staticmethod
    def get_age_group_analysis(db: Session) -> List[Dict[str, Any]]:
        groups = {
            "< 40": {"total": 0, "higher_risk": 0, "lower_risk": 0},
            "40-49": {"total": 0, "higher_risk": 0, "lower_risk": 0},
            "50-59": {"total": 0, "higher_risk": 0, "lower_risk": 0},
            "60-69": {"total": 0, "higher_risk": 0, "lower_risk": 0},
            "70+": {"total": 0, "higher_risk": 0, "lower_risk": 0},
        }

        assessments = db.query(Assessment).all()
        for asm in assessments:
            age = asm.age
            if age < 40:
                key = "< 40"
            elif age < 50:
                key = "40-49"
            elif age < 60:
                key = "50-59"
            elif age < 70:
                key = "60-69"
            else:
                key = "70+"

            groups[key]["total"] += 1
            if asm.risk_level in ["higher", "intermediate"]:
                groups[key]["higher_risk"] += 1
            else:
                groups[key]["lower_risk"] += 1

        result = []
        for grp, data in groups.items():
            result.append({
                "group": grp,
                "total": data["total"],
                "higher_risk": data["higher_risk"],
                "lower_risk": data["lower_risk"]
            })
        return result

    @staticmethod
    def get_gender_distribution(db: Session) -> List[Dict[str, Any]]:
        total = db.query(Assessment).count() or 1
        male_count = db.query(Assessment).filter(Assessment.sex == 1).count()
        female_count = db.query(Assessment).filter(Assessment.sex == 0).count()

        return [
            {"gender": "Male", "count": male_count, "percentage": round((male_count / total) * 100, 1)},
            {"gender": "Female", "count": female_count, "percentage": round((female_count / total) * 100, 1)}
        ]

    @staticmethod
    def get_chest_pain_analysis(db: Session) -> List[Dict[str, Any]]:
        cp_labels = {
            1: "Typical Angina",
            2: "Atypical Angina",
            3: "Non-anginal Pain",
            4: "Asymptomatic"
        }

        result = []
        for cp_code, label in cp_labels.items():
            total_cp = db.query(Assessment).filter(Assessment.cp == cp_code).count()
            higher_risk_cp = db.query(Assessment).filter(
                Assessment.cp == cp_code,
                Assessment.risk_level.in_(["higher", "intermediate"])
            ).count()

            risk_pct = round((higher_risk_cp / total_cp * 100), 1) if total_cp > 0 else 0.0
            result.append({
                "type": label,
                "count": total_cp,
                "risk_percentage": risk_pct
            })
        return result

    @staticmethod
    def get_feature_importance() -> List[Dict[str, Any]]:
        meta = ml_service.get_metadata()
        return meta.get("feature_importance", [])

analytics_service = AnalyticsService()

