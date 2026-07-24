import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_predict_readmission_risk_default():
    payload = {
        "age": 68,
        "primary_diagnosis": "Heart Failure",
        "charlson_comorbidity_index": 3,
        "prior_admissions_12m": 2,
        "length_of_stay_days": 5.0,
        "vitals_stability_score": 0.65,
        "adherence_score": 0.55,
        "social_support_index": 0.45
    }
    response = client.post("/ml/predict/readmission", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert len(data["entry"]) > 0
    obs = data["entry"][0]["resource"]
    assert obs["resourceType"] == "Observation"
    assert "interpretation" in obs
    assert len(obs["interpretation"]) > 0
