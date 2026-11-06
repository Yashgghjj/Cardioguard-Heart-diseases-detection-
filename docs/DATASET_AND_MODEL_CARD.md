# CardioGuard AI - Dataset & Model Card

## 1. Dataset Provenance & Target Definition

- **Primary Source**: UCI Machine Learning Repository - Heart Disease Dataset (Cleveland Clinic Foundation).
- **Principal Investigators**: Robert Detrano, M.D., Ph.D., Cleveland Clinic Foundation.
- **URL**: `https://archive.ics.uci.edu/dataset/45/heart+disease`
- **Total Records**: 303 patient clinical entries.
- **Target Variable (`num`)**: Angiographic disease status determined by cardiac catheterization:
  - `0`: &lt; 50% diameter narrowing (absence of significant obstructive disease)
  - `1, 2, 3, 4`: &gt; 50% diameter narrowing (presence of significant coronary artery disease)
- **Binary Conversion**: Standard clinical benchmark convention where class `0` = Absence, and class `1` (&ge; 50% stenosis) = Presence.
- **Class Balance**: 164 negative instances (54.1%), 139 positive instances (45.9%).

## 2. Feature Dictionary

| Feature | Technical Name | Clinical Meaning & Format | Normal / Typical Range |
| :--- | :--- | :--- | :--- |
| **Age** | `age` | Patient age in years | 29 – 77 years |
| **Sex** | `sex` | Biological sex (`1` = Male, `0` = Female) | Binary |
| **Chest Pain** | `cp` | 1: Typical Angina, 2: Atypical, 3: Non-anginal, 4: Asymptomatic | Categorical (1–4) |
| **Resting BP** | `trestbps` | Systolic blood pressure at admission | Normal: &lt; 120 mm Hg |
| **Cholesterol** | `chol` | Serum cholesterol level in mg/dl | Desirable: &lt; 200 mg/dl |
| **Fasting Blood Sugar** | `fbs` | Fasting blood glucose &gt; 120 mg/dl (`1` = True, `0` = False) | Binary |
| **Resting ECG** | `restecg` | 0: Normal, 1: ST-T abnormality, 2: LV hypertrophy | Categorical (0–2) |
| **Max Heart Rate** | `thalach` | Maximum heart rate achieved during exercise stress | 71 – 202 bpm |
| **Exercise Angina** | `exang` | Exercise-induced chest pain (`1` = Yes, `0` = No) | Binary |
| **ST Depression** | `oldpeak` | Exercise ST depression relative to resting baseline | 0.0 – 6.2 mm |
| **ST Slope** | `slope` | Slope of peak exercise ST segment (1: Up, 2: Flat, 3: Down) | Categorical (1–3) |
| **Major Vessels** | `ca` | Major vessels (0–3) colored by fluoroscopy | Discrete (0–3) |
| **Thalassemia** | `thal` | Nuclear perfusion scan (3: Normal, 6: Fixed, 7: Reversable) | Categorical |

## 3. Evaluated Model Benchmark Performance (Held-out Test Split)

| Algorithm | CV ROC-AUC | Test Accuracy | Sensitivity (Recall) | Specificity | F1 Score | Test ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **0.9026** | **86.89%** | **89.29%** | **84.85%** | **0.8621** | **0.9632** |
| **Support Vector Machine** | 0.8987 | 86.89% | 92.86% | 81.82% | 0.8667 | 0.9643 |
| **Random Forest** | 0.8871 | 85.25% | 82.14% | 87.88% | 0.8364 | 0.9470 |
| **XGBoost** | 0.8676 | 85.25% | 82.14% | 87.88% | 0.8364 | 0.9297 |
| **Decision Tree** | 0.7900 | 68.85% | 57.14% | 78.79% | 0.6275 | 0.7700 |

## 4. Ethical & Medical Limitations

1. **Non-Diagnostic Nature**: This software is not a Medical Device (SaMD) or clinical diagnostic tool. It evaluates statistical patterns in historical cohorts.
2. **Observational Cohort**: The Cleveland clinic cohort was collected from symptomatic patients undergoing coronary catheterization; results may not generalize to asymptomatic general screening populations without recalibration.
3. **No Direct Causality**: High SHAP attributions represent empirical correlation, not causal physiology.

