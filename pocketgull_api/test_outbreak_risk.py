from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_outbreak_risk_endpoint():
    payload = {
        "viral_copy_count": 480000.0,
        "aqi": 72,
        "pathogen": "SARS-CoV-2 (KP.3.1.1)",
        "has_respiratory_history": True
    }
    response = client.post("/ml/outbreak-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "outbreak_probability" in data
    assert "risk_level" in data
    assert data["risk_level"] in ["Low", "Moderate", "High", "Critical"]
    assert "epidemiological_recommendation" in data
    assert data["outbreak_probability"] > 0.0
