from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.patient import Patient
from app.models.assessment import Assessment
from app.models.model_version import ModelVersion
from app.models.audit_log import AuditLog
from app.core.security import get_password_hash
from app.services.ml_service import ml_service

SAMPLE_PATIENTS = [
    {"first_name": "Eleanor", "last_name": "Vance", "age": 62, "gender": "female", "notes": "History of mild exertional dyspnea."},
    {"first_name": "Marcus", "last_name": "Chen", "age": 54, "gender": "male", "notes": "Routine executive cardiac screening."},
    {"first_name": "Sophia", "last_name": "Rodriguez", "age": 48, "gender": "female", "notes": "Family history of early coronary artery disease."},
    {"first_name": "Arthur", "last_name": "Pendleton", "age": 67, "gender": "male", "notes": "Reported intermittent chest tightness during brisk walking."},
    {"first_name": "Amina", "last_name": "Diallo", "age": 39, "gender": "female", "notes": "Asymptomatic athlete checkup."},
    {"first_name": "David", "last_name": "Kowalski", "age": 58, "gender": "male", "notes": "Borderline hypertension and elevated LDL."},
    {"first_name": "Clara", "last_name": "Oswald", "age": 71, "gender": "female", "notes": "Post-menopausal cardiovascular evaluation."},
    {"first_name": "James", "last_name": "Wilson", "age": 45, "gender": "male", "notes": "Pre-marathon fitness and stress test."}
]

CLINICAL_PROFILES = [
    # Lower Risk Profile 1
    {"age": 45, "sex": 1, "cp": 2, "trestbps": 120, "chol": 190, "fbs": 0, "restecg": 0, "thalach": 172, "exang": 0, "oldpeak": 0.0, "slope": 1, "ca": 0, "thal": 3},
    # Higher Risk Profile 1
    {"age": 63, "sex": 1, "cp": 4, "trestbps": 160, "chol": 286, "fbs": 1, "restecg": 2, "thalach": 108, "exang": 1, "oldpeak": 2.4, "slope": 2, "ca": 3, "thal": 7},
    # Intermediate Risk Profile 1
    {"age": 56, "sex": 0, "cp": 3, "trestbps": 138, "chol": 230, "fbs": 0, "restecg": 1, "thalach": 145, "exang": 0, "oldpeak": 1.2, "slope": 2, "ca": 1, "thal": 3},
    # Lower Risk Profile 2
    {"age": 39, "sex": 0, "cp": 2, "trestbps": 115, "chol": 182, "fbs": 0, "restecg": 0, "thalach": 180, "exang": 0, "oldpeak": 0.2, "slope": 1, "ca": 0, "thal": 3},
    # Higher Risk Profile 2
    {"age": 67, "sex": 1, "cp": 4, "trestbps": 152, "chol": 305, "fbs": 1, "restecg": 2, "thalach": 115, "exang": 1, "oldpeak": 3.1, "slope": 3, "ca": 2, "thal": 7},
    # Intermediate Risk Profile 2
    {"age": 52, "sex": 1, "cp": 1, "trestbps": 134, "chol": 245, "fbs": 0, "restecg": 0, "thalach": 150, "exang": 0, "oldpeak": 0.8, "slope": 2, "ca": 1, "thal": 6},
    # Higher Risk Profile 3
    {"age": 70, "sex": 0, "cp": 4, "trestbps": 148, "chol": 268, "fbs": 0, "restecg": 2, "thalach": 122, "exang": 1, "oldpeak": 2.6, "slope": 2, "ca": 2, "thal": 7},
    # Lower Risk Profile 3
    {"age": 48, "sex": 0, "cp": 3, "trestbps": 124, "chol": 210, "fbs": 0, "restecg": 0, "thalach": 164, "exang": 0, "oldpeak": 0.0, "slope": 1, "ca": 0, "thal": 3},
]

def seed_database(db: Session):
    # 1. Seed Default Users if none exist
    admin = db.query(User).filter(User.email == "admin@cardioguard.ai").first()
    if not admin:
        admin = User(
            email="admin@cardioguard.ai",
            hashed_password=get_password_hash("Admin@123456"),
            full_name="Dr. Sarah Jenkins (Chief Medical Officer)",
            role="admin",
            is_active=True
        )
        db.add(admin)

    doctor = db.query(User).filter(User.email == "doctor@cardioguard.ai").first()
    if not doctor:
        doctor = User(
            email="doctor@cardioguard.ai",
            hashed_password=get_password_hash("Doctor@123456"),
            full_name="Dr. Julian Bashir (Cardiology Fellow)",
            role="healthcare_professional",
            is_active=True
        )
        db.add(doctor)

    db.commit()
    db.refresh(admin)
    db.refresh(doctor)

    # 2. Seed Model Version record
    meta = ml_service.get_metadata()
    if meta:
        existing_version = db.query(ModelVersion).filter(ModelVersion.version == meta.get("model_version", "v1.0.0")).first()
        if not existing_version:
            m_metrics = meta.get("metrics", {})
            mv = ModelVersion(
                version=meta.get("model_version", "v1.0.0"),
                model_name=meta.get("selected_model", "Logistic Regression"),
                accuracy=m_metrics.get("accuracy", 0.8689),
                roc_auc=m_metrics.get("roc_auc", 0.9632),
                f1_score=m_metrics.get("f1_score", 0.8621),
                sensitivity=m_metrics.get("sensitivity", 0.8929),
                specificity=m_metrics.get("specificity", 0.8485),
                is_active=True,
                metadata_json=meta
            )
            db.add(mv)
            db.commit()

    # 3. Seed Patients & Assessments if empty
    patient_count = db.query(Patient).count()
    if patient_count == 0:
        print("Seeding initial clinical patient cohorts and assessments...")
        created_patients = []
        for i, p_info in enumerate(SAMPLE_PATIENTS):
            code = f"PT-{10020 + i}"
            patient = Patient(
                patient_code=code,
                first_name=p_info["first_name"],
                last_name=p_info["last_name"],
                age=p_info["age"],
                gender=p_info["gender"],
                contact_email=f"{p_info['first_name'].lower()}.{p_info['last_name'].lower()}@example.org",
                contact_phone=f"+1 (555) 019-{1000 + i}",
                medical_notes=p_info["notes"],
                created_by_user_id=doctor.id
            )
            db.add(patient)
            created_patients.append(patient)
        db.commit()

        for p in created_patients:
            db.refresh(p)

        # Generate 24 realistic assessments across recent months
        now = datetime.utcnow()
        assessment_idx = 1000

        for idx, patient in enumerate(created_patients):
            # 2 to 4 assessments per patient across past 120 days
            num_assessments = random.randint(2, 4)
            for a_sub in range(num_assessments):
                assessment_idx += 1
                asm_ref = f"ASM-{assessment_idx}"
                days_ago = (num_assessments - a_sub - 1) * 35 + random.randint(1, 15)
                asm_date = now - timedelta(days=days_ago)

                # Base clinical features loosely aligned with patient age and gender
                profile_template = CLINICAL_PROFILES[(idx + a_sub) % len(CLINICAL_PROFILES)].copy()
                profile_template["age"] = patient.age
                profile_template["sex"] = 1 if patient.gender == "male" else 0
                
                # Small realistic variance
                profile_template["trestbps"] = max(90, profile_template["trestbps"] + random.randint(-8, 8))
                profile_template["chol"] = max(130, profile_template["chol"] + random.randint(-15, 15))
                profile_template["thalach"] = min(200, profile_template["thalach"] + random.randint(-10, 10))

                # Run ML model
                res = ml_service.predict(profile_template)

                assessment = Assessment(
                    assessment_reference=asm_ref,
                    patient_id=patient.id,
                    user_id=doctor.id if idx % 2 == 0 else admin.id,
                    age=profile_template["age"],
                    sex=profile_template["sex"],
                    cp=profile_template["cp"],
                    trestbps=profile_template["trestbps"],
                    chol=profile_template["chol"],
                    fbs=profile_template["fbs"],
                    restecg=profile_template["restecg"],
                    thalach=profile_template["thalach"],
                    exang=profile_template["exang"],
                    oldpeak=profile_template["oldpeak"],
                    slope=profile_template["slope"],
                    ca=profile_template["ca"],
                    thal=profile_template["thal"],
                    predicted_class=res["predicted_class"],
                    predicted_label=res["predicted_label"],
                    probability=res["probability"],
                    risk_level=res["risk_level"],
                    model_version=res["model_version"],
                    model_name=res["model_name"],
                    feature_contributions=res["top_contributions"],
                    recommendations=res["recommendations"],
                    clinical_notes=f"Clinical assessment conducted on {asm_date.strftime('%B %d, %Y')}.",
                    created_at=asm_date
                )
                db.add(assessment)
        db.commit()
        print("Database seeding completed successfully.")

