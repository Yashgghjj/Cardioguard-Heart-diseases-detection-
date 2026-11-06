from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    age: int
    gender: str
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    medical_notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    medical_notes: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    patient_code: str
    created_at: datetime
    updated_at: datetime
    assessment_count: Optional[int] = 0
    latest_risk_level: Optional[str] = None

    class Config:
        from_attributes = True

class PatientListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[PatientResponse]

