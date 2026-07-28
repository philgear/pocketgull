"""
Pocket Gull — Historical ML Contest Training Pipeline (2022 - 2025)
This script builds, trains, and serializes machine learning models for the annual
PhysioNet / MIMIC clinical AI challenge specifications for years 2022, 2023, 2024, and 2025.

Models generated:
 - PhysioNet 2022: Heart Murmur & Pathological Cardiac Risk Classifier
 - PhysioNet 2023: Post-Cardiac Arrest Neurological Recovery Predictor
 - PhysioNet 2024: Digitized ECG Arrhythmia & Acute Event Classifier
 - PhysioNet 2025: Multimodal Sepsis & Decompensation Predictor

Usage:
    python train_historical_contests.py
"""

import json
from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, brier_score_loss
import joblib

# Paths
API_DIR = Path(__file__).parent
MODELS_DIR = API_DIR / "models"


def generate_physionet_2022_data(n_samples: int = 4000, seed: int = 2022) -> Tuple[pd.DataFrame, pd.Series]:
    """
    PhysioNet Challenge 2022: Heart Murmur Detection & Clinical Outcome.
    Features: Heart rate, Blood pressure, Phonocardiogram (PCG) acoustic features, Age.
    """
    rng = np.random.default_rng(seed)
    hr = rng.normal(78, 14, n_samples).clip(45, 170)
    bp_sys = rng.normal(124, 18, n_samples).clip(75, 200)
    bp_dia = rng.normal(80, 10, n_samples).clip(45, 120)
    pcg_spike_freq = rng.normal(1.2, 0.4, n_samples).clip(0.2, 3.5)
    murmur_intensity = rng.uniform(0.0, 5.0, n_samples)
    age = rng.integers(1, 85, n_samples)

    df = pd.DataFrame({
        "hr": hr,
        "bp_systolic": bp_sys,
        "bp_diastolic": bp_dia,
        "pcg_spike_freq": pcg_spike_freq,
        "murmur_intensity": murmur_intensity,
        "age": age,
        "map": bp_dia + (bp_sys - bp_dia) / 3.0,
        "shock_index": hr / np.clip(bp_sys, 1.0, None)
    })

    # Non-linear outcome risk
    logit = (
        0.8 * (murmur_intensity - 2.0) +
        0.4 * (pcg_spike_freq - 1.2)**2 +
        0.01 * (bp_sys - 120)**2 / 100 -
        1.2
    )
    prob = 1.0 / (1.0 + np.exp(-logit))
    y = pd.Series((prob >= 0.40).astype(int), name="outcome")
    return df, y


def generate_physionet_2023_data(n_samples: int = 4000, seed: int = 2023) -> Tuple[pd.DataFrame, pd.Series]:
    """
    PhysioNet Challenge 2023: Predicting Neurological Recovery After Cardiac Arrest.
    Features: EEG Alpha/Theta ratio, Burst suppression ratio, SpO2, Temperature, GCS Motor score, Age.
    """
    rng = np.random.default_rng(seed)
    eeg_alpha_theta = rng.lognormal(0.2, 0.5, n_samples).clip(0.1, 5.0)
    burst_suppression_ratio = rng.beta(0.5, 3.0, n_samples).clip(0.0, 1.0)
    spo2 = rng.beta(15, 1.2, n_samples) * 100.0
    spo2 = np.clip(spo2, 65.0, 100.0)
    temperature = rng.normal(36.5, 1.2, n_samples).clip(32.0, 41.0)
    gcs_motor = rng.integers(1, 7, n_samples)
    age = rng.integers(18, 90, n_samples)
    map_val = rng.normal(75, 12, n_samples).clip(40, 130)

    df = pd.DataFrame({
        "eeg_alpha_theta": eeg_alpha_theta,
        "burst_suppression_ratio": burst_suppression_ratio,
        "spo2": spo2,
        "temperature": temperature,
        "gcs_motor": gcs_motor,
        "age": age,
        "map": map_val
    })

    # Unfavorable Neurological Outcome (CPC 3-5) = 1, Favorable = 0
    logit = (
        2.5 * burst_suppression_ratio -
        1.2 * eeg_alpha_theta -
        0.6 * (gcs_motor - 3) -
        0.05 * (spo2 - 95) +
        0.02 * (age - 50) -
        0.5
    )
    prob = 1.0 / (1.0 + np.exp(-logit))
    y = pd.Series((prob >= 0.45).astype(int), name="outcome")
    return df, y


def generate_physionet_2024_data(n_samples: int = 4000, seed: int = 2024) -> Tuple[pd.DataFrame, pd.Series]:
    """
    PhysioNet Challenge 2024: Digitized ECG Arrhythmia & Acute Event Detection.
    Features: QTc interval, PR interval, ST elevation (mm), QRS duration, Heart Rate, SpO2, Age.
    """
    rng = np.random.default_rng(seed)
    qtc = rng.normal(420, 35, n_samples).clip(340, 600)
    pr = rng.normal(160, 25, n_samples).clip(100, 300)
    st_elevation = rng.exponential(0.5, n_samples).clip(0.0, 6.0)
    qrs = rng.normal(90, 18, n_samples).clip(60, 200)
    hr = rng.normal(76, 16, n_samples).clip(40, 180)
    spo2 = rng.beta(16, 0.8, n_samples) * 100.0
    spo2 = np.clip(spo2, 70.0, 100.0)
    age = rng.integers(18, 92, n_samples)

    df = pd.DataFrame({
        "qtc": qtc,
        "pr": pr,
        "st_elevation": st_elevation,
        "qrs": qrs,
        "hr": hr,
        "spo2": spo2,
        "age": age
    })

    # Acute Cardiac Event / Arrhythmia Outcome
    logit = (
        0.015 * np.clip(qtc - 440, 0, None) +
        1.2 * st_elevation +
        0.02 * np.clip(qrs - 110, 0, None) +
        0.02 * (hr - 80)**2 / 100 -
        0.1 * (spo2 - 98) -
        1.8
    )
    prob = 1.0 / (1.0 + np.exp(-logit))
    y = pd.Series((prob >= 0.38).astype(int), name="outcome")
    return df, y


def generate_physionet_2025_data(n_samples: int = 4000, seed: int = 2025) -> Tuple[pd.DataFrame, pd.Series]:
    """
    PhysioNet Challenge 2025: Multimodal Sepsis & Acute Decompensation Prediction.
    Features: White Blood Cell count (WBC), Serum Lactate, Creatinine, HR, Systolic BP, SpO2, Temp, Age.
    """
    rng = np.random.default_rng(seed)
    wbc = rng.lognormal(2.1, 0.4, n_samples).clip(2.0, 40.0)
    lactate = rng.exponential(1.5, n_samples).clip(0.5, 15.0)
    creatinine = rng.lognormal(0.1, 0.5, n_samples).clip(0.4, 10.0)
    hr = rng.normal(88, 20, n_samples).clip(45, 190)
    bp_sys = rng.normal(115, 22, n_samples).clip(65, 200)
    spo2 = rng.beta(12, 1.0, n_samples) * 100.0
    spo2 = np.clip(spo2, 65.0, 100.0)
    temp = rng.normal(37.2, 1.1, n_samples).clip(34.0, 41.5)
    age = rng.integers(18, 95, n_samples)

    df = pd.DataFrame({
        "wbc": wbc,
        "lactate": lactate,
        "creatinine": creatinine,
        "hr": hr,
        "bp_systolic": bp_sys,
        "spo2": spo2,
        "temperature": temp,
        "age": age,
        "shock_index": hr / np.clip(bp_sys, 1.0, None)
    })

    # Decompensation / ICU Admission Risk
    logit = (
        0.5 * np.clip(lactate - 2.0, 0, None) +
        0.15 * np.clip(wbc - 12.0, 0, None) +
        0.4 * np.clip(creatinine - 1.2, 0, None) +
        0.02 * (hr - 90)**2 / 100 -
        0.02 * (bp_sys - 100) -
        0.15 * (spo2 - 98) -
        2.0
    )
    prob = 1.0 / (1.0 + np.exp(-logit))
    y = pd.Series((prob >= 0.35).astype(int), name="outcome")
    return df, y


def generate_physionet_2026_data(n_samples: int = 5000, seed: int = 2026) -> Tuple[pd.DataFrame, pd.Series]:
    """
    PhysioNet Challenge 2026: Screening for Cognitive Impairment During Sleep Studies.
    First Principles Feature Architecture:
      - Raw AHI Components: Obstructive Apnea Index (OAI), Central Apnea Index (CAI), Hypopnea Index (HI).
      - Micro-Arousal Density & Sleep Fragmentation Ratio (WASO / TST).
      - Vagal Autonomic Tone & Rate Pressure Product.
    """
    rng = np.random.default_rng(seed)
    age = rng.integers(50, 90, n_samples)
    n3_pct = rng.normal(16.0, 5.5, n_samples).clip(0.0, 38.0)
    
    # Deconstructed AHI components (First Principles)
    oai = rng.exponential(4.0, n_samples).clip(0.0, 30.0)
    cai = rng.exponential(2.0, n_samples).clip(0.0, 20.0)
    hi = rng.normal(8.0, 4.0, n_samples).clip(0.0, 25.0)
    ahi = oai + cai + hi
    
    arousal_index = rng.normal(18.0, 8.0, n_samples).clip(0.0, 55.0)
    micro_arousal_density = arousal_index * rng.uniform(0.8, 1.2, n_samples)
    waso_mins = rng.normal(45.0, 20.0, n_samples).clip(5.0, 150.0)
    tst_hours = rng.normal(6.5, 1.2, n_samples).clip(3.0, 10.0)
    sleep_fragmentation_index = waso_mins / (tst_hours * 60.0)
    
    hr = rng.normal(72, 11, n_samples).clip(45, 140)
    bp_sys = rng.normal(126, 14, n_samples).clip(85, 190)
    bp_dia = rng.normal(78, 10, n_samples).clip(55, 120)
    shock_index = hr / np.clip(bp_sys, 1.0, None)
    vagal_tone_index = (30.0 / np.clip(hr, 30.0, None)) * (n3_pct / 20.0)

    df = pd.DataFrame({
        "age": age,
        "n3_percentage": n3_pct,
        "apnea_hypopnea_index": ahi,
        "obstructive_apnea_index": oai,
        "central_apnea_index": cai,
        "hypopnea_index": hi,
        "arousal_index": arousal_index,
        "micro_arousal_density": micro_arousal_density,
        "sleep_fragmentation_index": sleep_fragmentation_index,
        "vagal_tone_index": vagal_tone_index,
        "hr": hr,
        "bp_systolic": bp_sys,
        "bp_diastolic": bp_dia,
        "shock_index": shock_index
    })

    # High-Fidelity Biological State Model (First Principles Risk Function)
    logit = (
        0.040 * (age - 65) +
        -0.12 * (n3_pct - 15) +
        0.06 * (cai - 2.0) +          # Central Apneas carry higher neurological impact
        0.04 * (oai - 4.0) +
        0.035 * (micro_arousal_density - 15) +
        1.5 * (sleep_fragmentation_index - 0.12) -
        0.8 * (vagal_tone_index - 1.0) -
        1.6
    )
    prob = 1.0 / (1.0 + np.exp(-logit))
    y = pd.Series((prob >= 0.40).astype(int), name="outcome")
    return df, y


CONTEST_CONFIGS: Dict[str, Dict[str, Any]] = {
    "physionet_2022": {
        "generator": generate_physionet_2022_data,
        "filename": "physionet_2022_model.joblib",
        "description": "Heart Murmur & Pathological Cardiac Risk Classifier",
        "challenge_year": 2022
    },
    "physionet_2023": {
        "generator": generate_physionet_2023_data,
        "filename": "physionet_2023_model.joblib",
        "description": "Post-Cardiac Arrest Neurological Outcome Predictor",
        "challenge_year": 2023
    },
    "physionet_2024": {
        "generator": generate_physionet_2024_data,
        "filename": "physionet_2024_model.joblib",
        "description": "Digitized ECG Arrhythmia & Acute Event Classifier",
        "challenge_year": 2024
    },
    "physionet_2025": {
        "generator": generate_physionet_2025_data,
        "filename": "physionet_2025_model.joblib",
        "description": "Multimodal Sepsis & Decompensation Predictor",
        "challenge_year": 2025
    },
    "physionet_2026": {
        "generator": generate_physionet_2026_data,
        "filename": "physionet_2026_model.joblib",
        "description": "Age-Conditioned Sleep PSG Cognitive Risk Classifier",
        "challenge_year": 2026
    }
}


def train_historical_models() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print("==========================================================")
    print("  Pocket Gull — Historical Contest Models Training Suite  ")
    print("==========================================================\n")

    summary_results = []

    for contest_key, config in CONTEST_CONFIGS.items():
        year = config["challenge_year"]
        desc = config["description"]
        filename = config["filename"]
        model_path = MODELS_DIR / filename
        meta_path = MODELS_DIR / filename.replace(".joblib", ".metadata.json")

        print(f"--- Training {year} Model ({contest_key}): {desc} ---")
        
        # 1. Generate synthetic challenge data
        df, y = config["generator"](n_samples=5000, seed=year)
        
        # 2. Train-test split (Strict featurization & split ordering)
        X_train, X_test, y_train, y_test = train_test_split(
            df, y, test_size=0.25, random_state=year, stratify=y
        )

        # 3. Fit calibrated gradient boosting classifier
        base_clf = HistGradientBoostingClassifier(
            max_iter=150,
            learning_rate=0.08,
            max_depth=5,
            random_state=year
        )
        calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method="sigmoid", cv=5)
        calibrated_clf.fit(X_train, y_train)

        # 4. Evaluate performance
        y_prob = calibrated_clf.predict_proba(X_test)[:, 1]
        
        roc_auc = float(roc_auc_score(y_test, y_prob))
        brier = float(brier_score_loss(y_test, y_prob))
        
        print(f"  Samples: Train = {len(X_train)}, Test = {len(X_test)}")
        print(f"  Test ROC-AUC: {roc_auc:.4f}")
        print(f"  Test Brier Score: {brier:.4f}")

        # 5. Serialize model & metadata sidecar
        joblib.dump(calibrated_clf, model_path)
        
        metadata = {
            "contest": contest_key,
            "year": year,
            "description": desc,
            "model_type": "Calibrated HistGradientBoostingClassifier",
            "num_features": len(df.columns),
            "features": list(df.columns),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "test_roc_auc": round(roc_auc, 4),
            "test_brier_score": round(brier, 4)
        }
        
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        print(f"  Saved model -> {model_path}")
        print(f"  Saved metadata -> {meta_path}\n")

        summary_results.append({
            "Year": year,
            "Contest": contest_key,
            "ROC-AUC": f"{roc_auc:.4f}",
            "Brier Score": f"{brier:.4f}",
            "Features": len(df.columns)
        })

    print("==========================================================")
    print("             Historical Training Complete                 ")
    print("==========================================================")
    summary_df = pd.DataFrame(summary_results)
    print(summary_df.to_string(index=False))


if __name__ == "__main__":
    train_historical_models()
