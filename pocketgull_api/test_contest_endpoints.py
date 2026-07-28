"""
Pocket Gull — Unit Tests for Contest Model Prediction Endpoints
"""

import os
from pathlib import Path
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_predict_physionet_2022_endpoint():
    payload = {
        "hr": 110.0,
        "bp_systolic": 145.0,
        "bp_diastolic": 90.0,
        "pcg_spike_freq": 2.1,
        "murmur_intensity": 3.8,
        "age": 62
    }
    response = client.post("/ml/predict/physionet-2022", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert "entry" in data
    assert len(data["entry"]) > 0


def test_predict_physionet_2023_endpoint():
    payload = {
        "eeg_alpha_theta": 0.3,
        "burst_suppression_ratio": 0.45,
        "spo2": 88.0,
        "temperature": 35.8,
        "gcs_motor": 2,
        "age": 68,
        "map": 65.0
    }
    response = client.post("/ml/predict/physionet-2023", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"


def test_predict_physionet_2024_endpoint():
    payload = {
        "qtc": 485.0,
        "pr": 210.0,
        "st_elevation": 2.2,
        "qrs": 130.0,
        "hr": 115.0,
        "spo2": 91.0,
        "age": 58
    }
    response = client.post("/ml/predict/physionet-2024", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"


def test_predict_physionet_2025_endpoint():
    payload = {
        "wbc": 18.5,
        "lactate": 4.2,
        "creatinine": 2.8,
        "hr": 125.0,
        "bp_systolic": 85.0,
        "spo2": 89.0,
        "temperature": 38.9,
        "age": 72
    }
    response = client.post("/ml/predict/physionet-2025", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"


def test_predict_physionet_2026_endpoint():
    payload = {
        "spo2": 88.0,
        "hr": 92.0,
        "eeg_delta_power": 0.3,
        "age": 70,
        "sex": 1
    }
    response = client.post("/ml/predict/physionet-2026", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
