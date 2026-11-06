import random
import io
import csv
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.database.session import get_db
from app.models.assessment import Assessment
from app.models.patient import Patient
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.assessment import (
    AssessmentInput, AssessmentResponse, AssessmentListResponse, PredictionResult
)
from app.services.ml_service import ml_service
from app.services.pdf_service import PDFReportService
from app.api.v1.deps import get_current_user

router = APIRouter()

def generate_assessment_ref(db: Session) -> str:
    while True:
        ref = f"ASM-{random.randint(10000, 99999)}"
        exists = db.query(Assessment).filter(Assessment.assessment_reference == ref).first()
        if not exists:
            return ref

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_prediction(
    input_data: AssessmentInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Determine Patient
    patient = None
    if input_data.patient_id:
        patient = db.query(Patient).filter(Patient.id == input_data.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Specified patient does not exist.")
    else:
        # Create an anonymous/quick patient record if not pre-existing
        code = f"PT-{random.randint(10000, 99999)}"
        name_parts = (input_data.patient_name or "Anonymous Patient").split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else "Case"
        patient = Patient(
            patient_code=code,
            first_name=first_name,
            last_name=last_name,
            age=int(input_data.age),
            gender="male" if input_data.sex == 1 else "female",
            created_by_user_id=current_user.id
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)

    # Run ML Prediction & Explainability
    ml_result = ml_service.predict(input_data.dict())

    # Generate Reference Code
    asm_ref = generate_assessment_ref(db)

    # Persist Assessment Record
    assessment = Assessment(
        assessment_reference=asm_ref,
        patient_id=patient.id,
        user_id=current_user.id,
        age=input_data.age,
        sex=input_data.sex,
        cp=input_data.cp,
        trestbps=input_data.trestbps,
        chol=input_data.chol,
        fbs=input_data.fbs,
        restecg=input_data.restecg,
        thalach=input_data.thalach,
        exang=input_data.exang,
        oldpeak=input_data.oldpeak,
        slope=input_data.slope,
        ca=input_data.ca,
        thal=input_data.thal,
        predicted_class=ml_result["predicted_class"],
        predicted_label=ml_result["predicted_label"],
        probability=ml_result["probability"],
        risk_level=ml_result["risk_level"],
        model_version=ml_result["model_version"],
        model_name=ml_result["model_name"],
        feature_contributions=ml_result["top_contributions"],
        recommendations=ml_result["recommendations"],
        clinical_notes=input_data.clinical_notes
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="ASSESSMENT_CREATED",
        resource_type="assessment",
        resource_id=str(assessment.id),
        details={
            "assessment_reference": asm_ref,
            "patient_code": patient.patient_code,
            "probability": ml_result["probability"],
            "risk_level": ml_result["risk_level"]
        }
    )
    db.add(audit)
    db.commit()

    return _format_assessment_response(assessment, patient, current_user)

@router.get("", response_model=AssessmentListResponse)
def list_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    patient_id: Optional[int] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Assessment).join(Patient, Assessment.patient_id == Patient.id)

    if patient_id:
        query = query.filter(Assessment.patient_id == patient_id)

    if risk_level:
        query = query.filter(Assessment.risk_level == risk_level.lower())

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Assessment.assessment_reference.ilike(search_filter),
                Patient.patient_code.ilike(search_filter),
                Patient.first_name.ilike(search_filter),
                Patient.last_name.ilike(search_filter)
            )
        )

    # Sorting
    if sort_by == "probability":
        order_col = Assessment.probability.desc() if order == "desc" else Assessment.probability.asc()
    elif sort_by == "age":
        order_col = Assessment.age.desc() if order == "desc" else Assessment.age.asc()
    else:
        order_col = Assessment.created_at.desc() if order == "desc" else Assessment.created_at.asc()

    total = query.count()
    assessments = query.order_by(order_col).offset((page - 1) * limit).limit(limit).all()

    items = [_format_assessment_response(a, a.patient, a.assessed_by) for a in assessments]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": items
    }

@router.get("/export/csv")
def export_predictions_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessments = db.query(Assessment).join(Patient).order_by(Assessment.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Assessment Reference", "Patient Code", "Patient Name", "Age", "Sex",
        "Resting BP (mm Hg)", "Cholesterol (mg/dl)", "Max Heart Rate (bpm)",
        "ST Depression", "Vessels Colored", "Probability", "Risk Level",
        "Model Version", "Assessment Date"
    ])

    for a in assessments:
        writer.writerow([
            a.assessment_reference,
            a.patient.patient_code if a.patient else "N/A",
            f"{a.patient.first_name} {a.patient.last_name}" if a.patient else "Anonymous",
            a.age,
            "Male" if a.sex == 1 else "Female",
            a.trestbps,
            a.chol,
            a.thalach,
            a.oldpeak,
            a.ca,
            f"{a.probability * 100:.1f}%",
            a.risk_level.capitalize(),
            a.model_version,
            a.created_at.strftime("%Y-%m-%d %H:%M:%S") if a.created_at else ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cardioguard_assessments_export.csv"}
    )

@router.get("/{id}", response_model=AssessmentResponse)
def get_prediction(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    return _format_assessment_response(assessment, assessment.patient, assessment.assessed_by)

@router.get("/{id}/report")
def download_prediction_report(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment record not found.")

    patient = assessment.patient
    assessment_dict = {
        "id": assessment.id,
        "assessment_reference": assessment.assessment_reference,
        "age": assessment.age,
        "sex": assessment.sex,
        "cp": assessment.cp,
        "trestbps": assessment.trestbps,
        "chol": assessment.chol,
        "fbs": assessment.fbs,
        "restecg": assessment.restecg,
        "thalach": assessment.thalach,
        "exang": assessment.exang,
        "oldpeak": assessment.oldpeak,
        "slope": assessment.slope,
        "ca": assessment.ca,
        "thal": assessment.thal,
        "probability": assessment.probability,
        "risk_level": assessment.risk_level,
        "model_version": assessment.model_version,
        "model_name": assessment.model_name,
        "assessed_by_name": assessment.assessed_by.full_name if assessment.assessed_by else "CardioGuard Staff",
        "feature_contributions": assessment.feature_contributions,
        "recommendations": assessment.recommendations,
    }
    patient_dict = {
        "patient_code": patient.patient_code if patient else "PT-UNKNOWN",
        "first_name": patient.first_name if patient else "Anonymous",
        "last_name": patient.last_name if patient else "Patient"
    }

    pdf_buffer = PDFReportService.generate_assessment_pdf(assessment_dict, patient_dict)

    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        action="REPORT_DOWNLOADED",
        resource_type="assessment",
        resource_id=str(assessment.id),
        details={"reference": assessment.assessment_reference}
    )
    db.add(audit)
    db.commit()

    filename = f"CardioGuard_Report_{assessment.assessment_reference}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def _format_assessment_response(a: Assessment, p: Optional[Patient], u: Optional[User]) -> AssessmentResponse:
    return AssessmentResponse(
        id=a.id,
        assessment_reference=a.assessment_reference,
        patient_id=a.patient_id,
        patient_code=p.patient_code if p else None,
        patient_name=f"{p.first_name} {p.last_name}" if p else None,
        user_id=a.user_id,
        assessed_by_name=u.full_name if u else None,
        age=a.age,
        sex=a.sex,
        cp=a.cp,
        trestbps=a.trestbps,
        chol=a.chol,
        fbs=a.fbs,
        restecg=a.restecg,
        thalach=a.thalach,
        exang=a.exang,
        oldpeak=a.oldpeak,
        slope=a.slope,
        ca=a.ca,
        thal=a.thal,
        predicted_class=a.predicted_class,
        predicted_label=a.predicted_label,
        probability=a.probability,
        risk_level=a.risk_level,
        model_version=a.model_version,
        model_name=a.model_name,
        feature_contributions=a.feature_contributions,
        recommendations=a.recommendations,
        clinical_notes=a.clinical_notes,
        created_at=a.created_at
    )

