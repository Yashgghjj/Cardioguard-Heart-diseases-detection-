# CardioGuard AI - System Architecture

## 1. High-Level Architectural Overview

CardioGuard AI is structured as a decoupled, production-grade Healthcare SaaS platform designed for high-availability clinical decision support.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  React 19 + TypeScript + Vite + Tailwind CSS + Lucide + UI   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / FastAPI                    │
│  • JWT Bearer Authentication & Role-Based Access Control    │
│  • Pydantic V2 Request & Response Validation                │
│  • CORS & Security Headers                                  │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  ML Engine   │       │ Database ORM │       │ Report Engine│
│ • Scikit-     │       │ • SQLAlchemy │       │ • ReportLab  │
│   learn Pipe │       │ • Alembic    │       │ • PDF Byte   │
│ • Joblib     │       │ • SQLite /   │       │   Stream     │
│ • SHAP XAI   │       │   PostgreSQL │       │ • Vector     │
└──────────────┘       └──────────────┘       └──────────────┘
```

## 2. Component Breakdown

### A. Frontend Layer (`/frontend`)
- **Framework**: React with Vite and TypeScript for type safety.
- **Styling**: Tailwind CSS with custom healthcare palette (Navy `#0f2742`, Teal `#0d9488`, Amber `#f59e0b`, Crimson `#ef4444`).
- **State & Context**: `AuthContext` managing JWT tokens, user identities, and role-based route guards.
- **Data Visualization**: Recharts for responsive ROC curves, PR curves, risk distributions, age breakdowns, and feature attributions. Custom SVG semi-circle Gauge for probability visualization.
- **Form Management**: React Hook Form with Zod schemas enforcing physiological bounds on medical features.

### B. Backend Services (`/backend/app`)
- **Framework**: FastAPI (Asynchronous Python ASGI).
- **Security**: Direct `bcrypt` password hashing with salt rounds, standard `pyjwt` HMAC-SHA256 tokens with configurable expiration.
- **Database Engine**: SQLAlchemy 2.0 ORM with unified support for SQLite and PostgreSQL.
- **Migrations**: Alembic automatic revision generation and database synchronization.
- **ReportLab PDF Engine**: Server-side binary PDF document generation with vector tables, custom typography, and prominent legal/medical disclaimers.

### C. Machine Learning Engine (`/backend/app/ml` & `/backend/saved_models`)
- **Trained Benchmark**: Genuine UCI Cleveland Clinic Heart Disease dataset (303 records, 13 features).
- **Leakage Prevention**: Feature scaling (`StandardScaler`) and encoding (`OneHotEncoder`) fitted strictly inside pipeline cross-validation folds.
- **Algorithm Comparison**: 5 candidates tuned via Stratified 5-Fold Grid Search (Logistic Regression, Random Forest, Decision Tree, Support Vector Machine, and XGBoost).
- **Explainable AI (XAI)**: Global feature importance rankings and local feature attributions calculating positive and negative risk factors.

