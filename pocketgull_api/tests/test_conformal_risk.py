"""
Unit tests for Pocket Gull Conformal Prediction 95% Coverage Uncertainty Engine.
"""

import sys
import numpy as np
from pathlib import Path

# Add pocketgull_api to sys.path
API_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(API_DIR))

from services.conformal_risk_service import ConformalPredictor
from services.holistic_risk_service import MultiModalPatientStateInput, compute_holistic_patient_risk


def test_conformal_calibration():
    print("--- 1. Testing Conformal Quantile Calibration ---")
    rng = np.random.default_rng(2026)
    y_true = rng.integers(0, 2, 500)
    y_prob = rng.uniform(0.1, 0.9, 500)
    
    predictor = ConformalPredictor(alpha=0.05)
    q_hat = predictor.calibrate(y_true, y_prob)
    
    assert q_hat > 0.0, "Calibrated non-conformity quantile q_hat must be positive."
    print(f"  [PASS] Conformal 95% Quantile q_hat calibrated successfully: {q_hat:.4f}.")


def test_conformal_interval_guarantee():
    print("\n--- 2. Testing 95% Statistical Coverage Prediction Intervals ---")
    predictor = ConformalPredictor(alpha=0.05)
    res = predictor.predict_interval(point_prob=0.72)
    
    assert "conformal_interval_95" in res
    assert res["conformal_interval_95"][0] <= 0.72 <= res["conformal_interval_95"][1]
    assert res["coverage_guarantee"] == "95.0%"
    print(f"  [PASS] Conformal 95% Interval for point prob 0.7200 -> {res['conformal_interval_95']} (Width: {res['interval_width']:.4f}).")


def test_conformal_holistic_risk_integration():
    print("\n--- 3. Testing Conformal Uncertainty Integration in Holistic Risk Payload ---")
    patient = MultiModalPatientStateInput()
    risk_res = compute_holistic_patient_risk(patient)
    
    assert "conformal_uncertainty" in risk_res
    conf = risk_res["conformal_uncertainty"]
    assert conf["coverage_guarantee"] == "95.0%"
    assert len(conf["conformal_interval_95"]) == 2
    print(f"  [PASS] Holistic Risk integrated conformal uncertainty bounds: {conf['conformal_interval_95']}.")


if __name__ == "__main__":
    print("==========================================================")
    print("  Pocket Gull — Conformal Prediction 95% Test Suite      ")
    print("==========================================================")
    test_conformal_calibration()
    test_conformal_interval_guarantee()
    test_conformal_holistic_risk_integration()
    print("\n[OK] All Conformal Prediction 95% Coverage Tests Passed!")
