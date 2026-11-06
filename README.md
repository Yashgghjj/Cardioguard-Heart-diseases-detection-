# CardioGuard AI – Advanced Heart Disease Detection & Risk Assessment Platform

![Version](https://img.shields.io/badge/version-1.0.0-teal.svg)
![Python](https://img.shields.io/badge/python-3.11%20%7C%203.14-blue.svg)
![React](https://img.shields.io/badge/react-19%20%2B%20vite-61dafb.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688.svg)
![ROC--AUC](https://img.shields.io/badge/ROC--AUC-0.9632-brightgreen.svg)
![Test--Accuracy](https://img.shields.io/badge/Accuracy-86.89%25-success.svg)

CardioGuard AI is an end-to-end, production-style, AI-powered healthcare SaaS platform for cardiovascular disease risk stratification. Designed with a clinical-grade user experience, it features a real-time machine learning inference engine, explainable AI factor attributions (SHAP/coefficients), interactive epidemiology dashboards, patient cohort management, and automated binary PDF report generation.

---

## 🌟 Key Highlights & Capabilities

- **Real Machine Learning Pipeline**: Trained on the authentic **UCI Cleveland Heart Disease benchmark dataset** (303 records, 13 clinical variables).
- **Multi-Algorithm Comparison**: 5 candidate models cross-validated & tuned: Logistic Regression, Random Forest, Decision Tree, Support Vector Machine, and XGBoost.
- **Top Validation Performance**: Composite ROC-AUC of **0.9632**, Sensitivity of **89.29%**, Specificity of **84.85%**, and Test Accuracy of **86.89%**.
- **AI Explainability (XAI)**: Global feature importance rankings and local per-patient factor attribution (isolating factors that increase or decrease risk).
- **Three-Tier Risk Stratification**:
  - 🟢 **Lower Estimated Model Risk** (&lt; 35% probability)
  - 🟡 **Intermediate Estimated Model Risk** (35% – 70% probability)
  - 🔴 **Higher Estimated Model Risk** (&gt; 70% probability)
- **Dynamic Downloadable PDF Reports**: Automated, pixel-perfect clinical reports generated on-the-fly using ReportLab, containing risk gauges, measurement tables, factor breakdowns, and medical disclaimers.
- **Interactive Analytics Dashboard**: Live metrics computed directly from database records (risk distribution pie charts, monthly longitudinal trends, age bracket analysis, and symptom breakdown).
- **Patient Management (CRM)**: Add, edit, search, and view historical assessment timelines for patients with de-identified codes (`PT-XXXXX`).
- **Security & RBAC**: JWT Bearer authentication, salted Bcrypt password hashing, role-based protection (Admin / Healthcare Professional), and audit logging.
- **Prominent Medical Disclaimers**: Clarifies that AI output provides statistical correlation for research and decision support, not an unassisted medical diagnosis.

---

## 🏗️ Architecture & Technology Stack

```
cardioguard-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # REST API endpoints (auth, patients, predictions, analytics, model, health)
│   │   ├── core/           # Security, password hashing, JWT, configuration
│   │   ├── database/       # SQLAlchemy session, engine, database seeders
│   │   ├── models/         # SQLAlchemy DB models (User, Patient, Assessment, ModelVersion, AuditLog)
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── services/       # ML inference, ReportLab PDF generation, Analytics, Audit
│   │   └── main.py         # FastAPI application entrypoint
│   ├── training/           # Dataset downloading & multi-model training pipelines
│   ├── saved_models/       # Serialized models (.joblib) and benchmark metadata (.json)
│   ├── tests/              # Pytest backend API & model verification tests
│   ├── alembic/            # Database schema migration scripts
│   ├── alembic.ini         # Alembic configuration
│   ├── Dockerfile          # Backend container specification
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # RiskGauge, StatCard, AssessmentForm, PredictionReportModal, Modals
│   │   ├── context/        # AuthContext & Session management
│   │   ├── layouts/        # Dashboard responsive sidebar & navbar shell
│   │   ├── pages/          # Landing, Auth, Overview, Assessment, Patients, History, Model Benchmark, Settings
│   │   ├── services/       # Axios API client integrations
│   │   └── types/          # TypeScript interface definitions
│   ├── Dockerfile          # Multi-stage production container build
│   └── nginx.conf          # Nginx reverse proxy configuration
├── dataset/                # Raw UCI Cleveland data and preprocessed CSV
├── notebooks/              # Jupyter exploratory data analysis & evaluation notebook
├── docs/                   # Architecture, Dataset/Model Card, API Documentation
├── docker-compose.yml      # Multi-container orchestration (DB, Backend, Frontend)
└── README.md
```

---

## 🩺 The 13 Clinical Input Features (UCI Cleveland Standard)

| # | Feature | Field Name | Type / Units | Description & Clinical Norm |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Age** | `age` | Years (18–110) | Patient chronological age |
| 2 | **Sex** | `sex` | Binary (0 / 1) | Biological sex (1 = Male, 0 = Female) |
| 3 | **Chest Pain Type** | `cp` | Categorical (1–4) | 1: Typical Angina, 2: Atypical, 3: Non-anginal, 4: Asymptomatic |
| 4 | **Resting Blood Pressure**| `trestbps` | mm Hg | Resting systolic pressure upon hospital admission (Normal &lt; 120) |
| 5 | **Serum Cholesterol** | `chol` | mg/dl | Serum cholesterol level (Desirable &lt; 200, Borderline 200–239) |
| 6 | **Fasting Blood Sugar** | `fbs` | Binary (0 / 1) | Fasting blood sugar &gt; 120 mg/dl (1 = True, 0 = False) |
| 7 | **Resting ECG** | `restecg` | Categorical (0–2) | 0: Normal, 1: ST-T wave abnormality, 2: LV hypertrophy |
| 8 | **Max Heart Rate** | `thalach` | bpm | Maximum heart rate achieved during exercise stress test |
| 9 | **Exercise-Induced Angina**| `exang` | Binary (0 / 1) | Exertional chest tightness during stress test (1 = Yes, 0 = No) |
| 10 | **ST Depression** | `oldpeak` | mm (0.0–8.0) | ST depression induced by exercise relative to resting baseline |
| 11 | **Peak ST Slope** | `slope` | Categorical (1–3) | 1: Upsloping (normal), 2: Flat (ischemic), 3: Downsloping (severe) |
| 12 | **Major Vessels** | `ca` | Discrete (0–3) | Number of major coronary vessels colored by fluoroscopy |
| 13 | **Thalassemia Perfusion** | `thal` | Categorical (3/6/7)| 3: Normal perfusion, 6: Fixed defect (scar), 7: Reversable defect |

---

## 📊 Machine Learning Model Benchmarks

Evaluation performed on held-out 20% stratified test split (61 samples):

| Model | 5-Fold CV ROC-AUC | Test Accuracy | Sensitivity (Recall) | Specificity | F1 Score | Test ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression (Selected)** | **0.9026** | **86.89%** | **89.29%** | **84.85%** | **0.8621** | **0.9632** |
| **Support Vector Machine (RBF/Linear)**| 0.8987 | 86.89% | 92.86% | 81.82% | 0.8667 | 0.9643 |
| **Random Forest Classifier** | 0.8871 | 85.25% | 82.14% | 87.88% | 0.8364 | 0.9470 |
| **XGBoost Classifier** | 0.8676 | 85.25% | 82.14% | 87.88% | 0.8364 | 0.9297 |
| **Decision Tree Classifier** | 0.7900 | 68.85% | 57.14% | 78.79% | 0.6275 | 0.7700 |

---

## 🚀 Quick Start Guide (Native Local Running)

### 1. Prerequisites
- Python 3.10+ (Verified on Python 3.11 – 3.14)
- Node.js 18+ and npm

### 2. Backend Setup & Startup
```bash
# Navigate to backend directory
cd cardioguard-ai/backend

# Install python dependencies
pip install -r requirements.txt

# (Optional) Re-run dataset download and model training
python training/download_dataset.py
python training/train_models.py

# Launch FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The database automatically creates tables and seeds default doctor, admin, and patient assessment records.*

- Interactive API Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 3. Frontend Setup & Startup
```bash
# In a second terminal, navigate to frontend directory
cd cardioguard-ai/frontend

# Install dependencies (if not already done)
npm install

# Start Vite React development server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔑 Default Clinical Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Cardiologist / Doctor** | `doctor@cardioguard.ai` | `Doctor@123456` | Full assessment, patient CRM, report export |
| **Chief Medical Officer (Admin)** | `admin@cardioguard.ai` | `Admin@123456` | Complete administrative and clinical access |

*Note: The login page includes convenient **1-Click Demo Buttons** to automatically fill credentials and log in instantly.*

---

## 🐳 Docker & Docker Compose Deployment

To deploy all three services (PostgreSQL 15, FastAPI backend, and Nginx frontend) with a single command:

```bash
docker-compose up --build
```

- Web Interface: `http://localhost` (or `http://localhost:3000`)
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🧪 Automated Testing

Run the automated backend test suite:
```bash
cd cardioguard-ai/backend
pytest tests/test_api.py -v
```
All test suites verify:
- Healthcheck endpoint
- JWT Authentication and session persistence
- Model metadata & candidate retrieval
- Patient CRM listing & filtering
- Real ML inference, database record saving, and binary ReportLab PDF generation
- Aggregated database analytics

---

## 📜 Legal & Medical Disclaimer

> **IMPORTANT MEDICAL NOTICE**: CardioGuard AI is designed strictly for educational, observational research, and clinical decision-support demonstration. It is not an FDA-cleared or CE-marked medical device and does not provide formal medical diagnoses. Machine learning predictions are based on statistical correlations within historical datasets and must never replace clinical judgment by a licensed medical practitioner.

