# CardioGuard AI - REST API Documentation

Base URL: `http://localhost:8000/api`
Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new clinician account.
- **Request Body**:
  ```json
  {
    "email": "dr.smith@hospital.org",
    "password": "SecurePassword123!",
    "full_name": "Dr. Smith",
    "role": "healthcare_professional"
  }
  ```
- **Response**: `201 Created` with JWT access token.

### `POST /api/auth/login`
Authenticates user and returns JWT bearer token.
- **Request Body**:
  ```json
  {
    "email": "doctor@cardioguard.ai",
    "password": "Doctor@123456"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

### `GET /api/auth/me`
Returns authenticated user profile. Requires `Authorization: Bearer <token>`.

---

## 2. Patients (`/api/patients`)

### `GET /api/patients`
List patients with filtering, search, and pagination.
- **Query Parameters**:
  - `search` (optional): Query name, patient code, email
  - `gender` (optional): `male`, `female`
  - `page` (default `1`)
  - `limit` (default `10`)

### `POST /api/patients`
Registers a new patient. Auto-generates unique `PT-XXXXX` identifier.

### `GET /api/patients/{id}`
Retrieves patient profile with full chronological history of past risk assessments.

### `PUT /api/patients/{id}`
Updates patient demographics or baseline clinical notes.

### `DELETE /api/patients/{id}`
Deletes patient record and associated assessments.

---

## 3. Predictions & Risk Assessments (`/api/predictions`)

### `POST /api/predictions`
Evaluates a patient's 13 clinical parameters through the trained ML pipeline.
- **Request Body**:
  ```json
  {
    "patient_id": 1,
    "age": 58,
    "sex": 1,
    "cp": 4,
    "trestbps": 150,
    "chol": 270,
    "fbs": 0,
    "restecg": 1,
    "thalach": 125,
    "exang": 1,
    "oldpeak": 2.2,
    "slope": 2,
    "ca": 2,
    "thal": 7,
    "clinical_notes": "Exertional dyspnea noted."
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 105,
    "assessment_reference": "ASM-84920",
    "probability": 0.842,
    "risk_level": "higher",
    "predicted_label": "Higher Estimated Model Risk",
    "feature_contributions": [ ... ],
    "recommendations": [ ... ],
    "created_at": "2026-11-02T14:30:00"
  }
  ```

### `GET /api/predictions/{id}/report`
Streams the officially formatted, branded PDF report document generated on-the-fly with ReportLab.
- **Response**: `application/pdf` binary stream.

### `GET /api/predictions/export/csv`
Downloads full historical records as CSV.

---

## 4. Analytics & Machine Learning

- `GET /api/analytics/overview`: High-level metrics, active model accuracy, and total assessment count.
- `GET /api/analytics/risk-distribution`: Distribution breakdown of Lower, Intermediate, and Higher risk cases.
- `GET /api/analytics/trends`: Monthly volume and risk trajectory.
- `GET /api/analytics/feature-importance`: Global SHAP/weight importance percentages.
- `GET /api/model/info`: Complete model metadata, versioning, and candidate metrics.
- `GET /api/model/metrics`: Confusion matrix, ROC curve, and PR curve coordinates.
- `GET /api/health`: Health status and engine loading state.

