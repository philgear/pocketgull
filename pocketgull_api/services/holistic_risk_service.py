"""
Pocket Gull — Unified Holistic Patient Risk & Multi-Modal Sleep Twin Engine
Integrates PhysioNet 2022-2026 cross-domain features with real-time passive wearable telemetry.
"""

from typing import Dict, Any, Optional
import numpy as np
from pydantic import BaseModel, Field


class WearableTelemetryInput(BaseModel):
    """Real-time passive wearable telemetry stream."""
    hrv_rmssd: float = Field(default=35.0, description="Time-domain HRV RMSSD (ms)")
    skin_temp_celsius: float = Field(default=36.6, description="Continuous peripheral skin temperature")
    actigraphy_movement_index: float = Field(default=0.15, description="Accelerometric movement density")
    sleep_efficiency_wearable: float = Field(default=85.0, description="Estimated sleep efficiency %")


class MultiModalPatientStateInput(BaseModel):
    """Cross-domain Patient State input fusing PSG, Vitals, Labs & Wearable Telemetry."""
    age: float = Field(default=65.0, description="Patient age in years")
    hr: float = Field(default=72.0, description="Heart Rate (bpm)")
    bp_systolic: float = Field(default=128.0, description="Systolic Blood Pressure (mmHg)")
    bp_diastolic: float = Field(default=80.0, description="Diastolic Blood Pressure (mmHg)")
    spo2: float = Field(default=97.0, description="Oxygen Saturation (%)")
    
    # PhysioNet 2026 PSG Features
    n3_percentage: float = Field(default=18.0, description="N3 Slow-Wave Sleep %")
    apnea_hypopnea_index: float = Field(default=12.0, description="Apnea-Hypopnea Index (AHI)")
    obstructive_apnea_index: float = Field(default=4.0, description="Obstructive Apnea Index (OAI)")
    central_apnea_index: float = Field(default=2.0, description="Central Apnea Index (CAI)")
    hypopnea_index: float = Field(default=6.0, description="Hypopnea Index (HI)")
    arousal_index: float = Field(default=16.0, description="Sleep Arousal Index")
    
    # PhysioNet 2022-2025 Multi-Year Cross-Domain Signals
    eeg_alpha_delta_ratio: float = Field(default=1.4, description="EEG Alpha/Delta ratio (2023 Neurological)")
    ecg_qtc_ms: float = Field(default=420.0, description="ECG QTc interval ms (2024 Arrhythmia)")
    serum_lactate: float = Field(default=1.2, description="Serum Lactate mmol/L (2025 Sepsis)")
    
    # Wearable Telemetry
    wearable: WearableTelemetryInput = Field(default_factory=WearableTelemetryInput)


def compute_holistic_patient_risk(data: MultiModalPatientStateInput) -> Dict[str, Any]:
    """
    Computes a Unified Holistic Patient Risk Score fusing cross-domain sleep, vitals,
    wearable telemetry, and multi-year PhysioNet biomarkers.
    """
    # 1. Hemodynamic & Vitals Baseline Sub-Risk (clinical_risk_v2)
    sys_clamped = max(data.bp_systolic, 1.0)
    shock_index = data.hr / sys_clamped
    vitals_risk = min(1.0, max(0.0, (
        0.40 * max(0.0, shock_index - 0.65) / 0.30 +
        0.35 * max(0.0, 95.0 - data.spo2) / 6.0 +
        0.25 * max(0.0, (data.hr - 85.0) / 30.0)
    )))

    # 2. Sleep Architecture & Neuro-Glymphatic Sub-Risk (physionet_2026)
    caisr_risk = min(1.0, max(0.0, (
        0.45 * max(0.0, 15.0 - data.n3_percentage) / 10.0 +
        0.35 * max(0.0, data.central_apnea_index - 2.0) / 8.0 +
        0.20 * max(0.0, data.apnea_hypopnea_index - 15.0) / 20.0
    )))

    # 3. Passive Wearable Telemetry Sub-Risk (Continuous HRV & Actigraphy)
    wearable_risk = min(1.0, max(0.0, (
        0.45 * max(0.0, 25.0 - data.wearable.hrv_rmssd) / 15.0 +
        0.35 * max(0.0, data.wearable.actigraphy_movement_index - 0.20) / 0.40 +
        0.20 * max(0.0, 80.0 - data.wearable.sleep_efficiency_wearable) / 20.0
    )))

    # 4. Multi-Year Cross-Domain Biomarkers (2022 Murmur, 2023 EEG, 2024 ECG, 2025 Sepsis)
    biomarker_risk = min(1.0, max(0.0, (
        0.35 * max(0.0, 1.2 - data.eeg_alpha_delta_ratio) / 0.8 +
        0.35 * max(0.0, data.ecg_qtc_ms - 440.0) / 40.0 +
        0.30 * max(0.0, data.serum_lactate - 1.8) / 2.5
    )))

    # 5. Cross-Domain Fusion Meta-Model ("Sleep Twin")
    holistic_score = float(np.clip(
        0.30 * vitals_risk +
        0.35 * caisr_risk +
        0.20 * wearable_risk +
        0.15 * biomarker_risk,
        0.0, 1.0
    ))

    # Triage Risk Category Classification
    if holistic_score >= 0.65:
        triage_category = "HIGH_RISK_CRITICAL"
        clinical_recommendation = "Immediate Clinical Consultation & Comprehensive EEG/PSG Inpatient Monitoring Recommended."
    elif holistic_score >= 0.35:
        triage_category = "MODERATE_ELEVATED"
        clinical_recommendation = "Continuous Passive Wearable Telemetry & Outpatient Sleep Apnea Screening Recommended."
    else:
        triage_category = "LOW_PHYSIOLOGICAL_STRESS"
        clinical_recommendation = "Routine Baseline Healthspan Monitoring."

    return {
        "holistic_risk_score": round(holistic_score, 4),
        "triage_category": triage_category,
        "clinical_recommendation": clinical_recommendation,
        "subdomain_scores": {
            "vitals_baseline_risk": round(vitals_risk, 4),
            "caisr_sleep_architecture_risk": round(caisr_risk, 4),
            "passive_wearable_risk": round(wearable_risk, 4),
            "cross_domain_biomarker_risk": round(biomarker_risk, 4)
        },
        "sleep_twin_telemetry_status": {
            "hrv_vagal_status": "NORMAL" if data.wearable.hrv_rmssd >= 25 else "VAGAL_WITHDRAWAL",
            "glymphatic_sws_status": "OPTIMAL" if data.n3_percentage >= 15 else "IMPAIRED_CLEARANCE",
            "cross_domain_synapse": "ACTIVE"
        }
    }
