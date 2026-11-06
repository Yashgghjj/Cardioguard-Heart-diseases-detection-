from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    assessment_reference = Column(String(50), unique=True, index=True, nullable=False) # e.g. ASM-92841
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Clinical Features (The 13 UCI features)
    age = Column(Float, nullable=False)
    sex = Column(Integer, nullable=False)          # 1: Male, 0: Female
    cp = Column(Integer, nullable=False)           # 1: Typical Angina, 2: Atypical Angina, 3: Non-anginal, 4: Asymptomatic
    trestbps = Column(Float, nullable=False)       # mm Hg
    chol = Column(Float, nullable=False)           # mg/dl
    fbs = Column(Integer, nullable=False)          # 1: >120 mg/dl, 0: <=120 mg/dl
    restecg = Column(Integer, nullable=False)      # 0: normal, 1: ST-T wave abnormality, 2: LV hypertrophy
    thalach = Column(Float, nullable=False)        # Maximum heart rate achieved
    exang = Column(Integer, nullable=False)        # 1: Yes, 0: No
    oldpeak = Column(Float, nullable=False)        # ST depression
    slope = Column(Integer, nullable=False)        # 1: Upsloping, 2: Flat, 3: Downsloping
    ca = Column(Float, nullable=False)             # 0 to 3
    thal = Column(Float, nullable=False)           # 3: Normal, 6: Fixed defect, 7: Reversable defect

    # Prediction Outputs
    predicted_class = Column(Integer, nullable=False) # 0: Lower Risk, 1: Higher Risk
    predicted_label = Column(String(100), nullable=False)
    probability = Column(Float, nullable=False)       # Model probability [0.0 - 1.0]
    risk_level = Column(String(50), nullable=False)   # "lower", "intermediate", "higher"
    model_version = Column(String(50), default="v1.0.0")
    model_name = Column(String(100), default="Logistic Regression")

    # Explainability & Recommendations
    feature_contributions = Column(JSON, nullable=True) # list of top positive/negative contributing factors
    recommendations = Column(JSON, nullable=True)       # list of lifestyle & clinical education recommendations
    clinical_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    patient = relationship("Patient", back_populates="assessments")
    assessed_by = relationship("User", back_populates="assessments")

