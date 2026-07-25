"""
Unit tests for Pocket Gull Holistic Patient Risk & Wearable Sleep Twin Engine.
"""

import sys
from pathlib import Path

# Add pocketgull_api to sys.path
API_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(API_DIR))

from services.holistic_risk_service import (
    MultiModalPatientStateInput,
    WearableTelemetryInput,
    compute_holistic_patient_risk
)


def test_holistic_patient_risk_normal():
    patient = MultiModalPatientStateInput(
        age=45.0,
        hr=68.0,
        bp_systolic=120.0,
        bp_diastolic=78.0,
        spo2=98.0,
        n3_percentage=22.0,
        apnea_hypopnea_index=4.0,
        central_apnea_index=0.5,
        arousal_index=10.0,
        wearable=WearableTelemetryInput(
            hrv_rmssd=42.0,
            skin_temp_celsius=36.6,
            actigraphy_movement_index=0.10,
            sleep_efficiency_wearable=92.0
        )
    )
    res = compute_holistic_patient_risk(patient)
    assert "holistic_risk_score" in res
    assert res["triage_category"] == "LOW_PHYSIOLOGICAL_STRESS"
    assert res["holistic_risk_score"] < 0.35
    print("  [PASS] Normal patient state correctly classified as LOW_PHYSIOLOGICAL_STRESS.")


def test_holistic_patient_risk_critical():
    critical_patient = MultiModalPatientStateInput(
        age=78.0,
        hr=105.0,
        bp_systolic=155.0,
        bp_diastolic=95.0,
        spo2=91.0,
        n3_percentage=5.0,              # Severe SWS impairment
        apnea_hypopnea_index=38.0,      # Severe Sleep Apnea
        central_apnea_index=12.0,       # High Central Apnea
        arousal_index=35.0,             # High Fragmentation
        eeg_alpha_delta_ratio=0.5,      # High EEG slowing
        ecg_qtc_ms=480.0,               # Prolonged QTc
        serum_lactate=4.2,              # Elevated Sepsis Lactate
        wearable=WearableTelemetryInput(
            hrv_rmssd=12.0,             # Vagal withdrawal
            skin_temp_celsius=37.8,
            actigraphy_movement_index=0.65,
            sleep_efficiency_wearable=55.0
        )
    )
    res = compute_holistic_patient_risk(critical_patient)
    assert "holistic_risk_score" in res
    assert res["triage_category"] == "HIGH_RISK_CRITICAL"
    assert res["holistic_risk_score"] >= 0.65
    assert res["sleep_twin_telemetry_status"]["glymphatic_sws_status"] == "IMPAIRED_CLEARANCE"
    assert res["sleep_twin_telemetry_status"]["hrv_vagal_status"] == "VAGAL_WITHDRAWAL"
    print(f"  [PASS] Critical patient state correctly classified as HIGH_RISK_CRITICAL (Score: {res['holistic_risk_score']}) with Sleep Twin telemetry alerts.")


if __name__ == "__main__":
    print("==========================================================")
    print("  Pocket Gull — Holistic Patient Risk Unit Test Suite    ")
    print("==========================================================")
    test_holistic_patient_risk_normal()
    test_holistic_patient_risk_critical()
    print("\n[OK] All Holistic Patient Risk & Sleep Twin Tests Passed!")
