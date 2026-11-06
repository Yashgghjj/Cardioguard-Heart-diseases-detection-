import random
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.database.session import get_db
from app.models.patient import Patient
from app.models.assessment import Assessment
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.patient import (
    PatientCreate, PatientUpdate, PatientResponse, PatientListResponse
)
from app.api.v1.deps import get_current_user

router = APIRouter()

def generate_patient_code(db: Session) -> str:
    while True:
        code = f"PT-{random.randint(10000, 99999)}"
        exists = db.query(Patient).filter(Patient.patient_code == code).first()
        if not exists:
            return code

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    code = generate_patient_code(db)
    patient = Patient(
        patient_code=code,
        first_name=patient_in.first_name,
        last_name=patient_in.last_name,
        age=patient_in.age,
        gender=patient_in.gender.lower(),
        contact_email=patient_in.contact_email,
        contact_phone=patient_in.contact_phone,
        medical_notes=patient_in.medical_notes,
        created_by_user_id=current_user.id
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    audit = AuditLog(
        user_id=current_user.id,
        action="PATIENT_CREATED",
        resource_type="patient",
        resource_id=str(patient.id),
        details={"patient_code": patient.patient_code}
    )
    db.add(audit)
    db.commit()

    return patient

@router.get("", response_model=PatientListResponse)
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Search by name or patient code"),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Patient)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(search_filter),
                Patient.last_name.ilike(search_filter),
                Patient.patient_code.ilike(search_filter),
                Patient.contact_email.ilike(search_filter)
            )
        )

    if min_age is not None:
        query = query.filter(Patient.age >= min_age)
    if max_age is not None:
        query = query.filter(Patient.age <= max_age)
    if gender:
        query = query.filter(Patient.gender == gender.lower())

    total = query.count()
    patients = query.order_by(Patient.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    # Populate assessment count and latest risk level
    response_items = []
    for p in patients:
        p_dict = {
            "id": p.id,
            "patient_code": p.patient_code,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "age": p.age,
            "gender": p.gender,
            "contact_email": p.contact_email,
            "contact_phone": p.contact_phone,
            "medical_notes": p.medical_notes,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "assessment_count": len(p.assessments),
            "latest_risk_level": p.assessments[0].risk_level if p.assessments else None
        }
        response_items.append(p_dict)

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": response_items
    }

@router.get("/{id}")
def get_patient(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    assessments_summary = []
    for a in patient.assessments:
        assessments_summary.append({
            "id": a.id,
            "assessment_reference": a.assessment_reference,
            "created_at": a.created_at,
            "risk_level": a.risk_level,
            "predicted_label": a.predicted_label,
            "probability": a.probability,
            "model_version": a.model_version
        })

    return {
        "id": patient.id,
        "patient_code": patient.patient_code,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "age": patient.age,
        "gender": patient.gender,
        "contact_email": patient.contact_email,
        "contact_phone": patient.contact_phone,
        "medical_notes": patient.medical_notes,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "assessments": assessments_summary
    }

@router.put("/{id}", response_model=PatientResponse)
def update_patient(
    id: int,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    update_data = patient_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "gender" and value:
            value = value.lower()
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    db.delete(patient)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="PATIENT_DELETED",
        resource_type="patient",
        resource_id=str(id)
    )
    db.add(audit)
    db.commit()
    return None

