import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import Base, engine, SessionLocal
from app.database.seed import seed_database

client = TestClient(app)

def setup_module():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ml_engine_loaded"] is True

def test_auth_login():
    response = client.post("/api/auth/login", json={
        "email": "doctor@cardioguard.ai",
        "password": "Doctor@123456"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "doctor@cardioguard.ai"

def test_get_model_info():
    response = client.get("/api/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_version"] == "v1.0.0"
    assert "model_comparison" in data
    assert len(data["model_comparison"]) >= 4

def test_get_patients():
    response = client.get("/api/patients")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["items"]) > 0

def test_create_prediction():
    payload = {
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
        "patient_name": "Test Clinical Patient"
    }
    response = client.post("/api/predictions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "probability" in data
    assert data["risk_level"] in ["lower", "intermediate", "higher"]
    assert len(data["feature_contributions"]) > 0
    assert len(data["recommendations"]) > 0

    # Test PDF download
    report_resp = client.get(f"/api/predictions/{data['id']}/report")
    assert report_resp.status_code == 200
    assert report_resp.headers["content-type"] == "application/pdf"
    assert len(report_resp.content) > 1000

def test_analytics_endpoints():
    r1 = client.get("/api/analytics/overview")
    assert r1.status_code == 200
    assert r1.json()["total_assessments"] > 0

    r2 = client.get("/api/analytics/risk-distribution")
    assert r2.status_code == 200
    assert len(r2.json()) == 3

    r3 = client.get("/api/analytics/trends")
    assert r3.status_code == 200
    assert len(r3.json()) > 0

if __name__ == "__main__":
    setup_module()
    test_health_check()
    test_auth_login()
    test_get_model_info()
    test_get_patients()
    test_create_prediction()
    test_analytics_endpoints()
    print("All backend tests passed successfully!")

