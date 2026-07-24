"""
Pocket Gull — Universal Modular Meta-Learning Foundation Engine ("Lego Brick Architecture")
Implements composable physiological data perturbation blocks, universal multi-task meta-learning,
and lightweight custom JSON model serialization for zero-dependency edge deployments.
"""

from __future__ import annotations
import json
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional


# ══════════════════════════════════════════════════════════════════════════════
# 1. COMPOSABLE PHYSIOLOGICAL LEGO BRICKS (Data Generation Perturbation Blocks)
# ══════════════════════════════════════════════════════════════════════════════

def LegoBrick_BaselineVitals(n_samples: int, rng: np.random.Generator) -> pd.DataFrame:
    """Lego Brick 1: Baseline Hemodynamic Vitals."""
    age = rng.integers(18, 90, n_samples)
    hr = rng.normal(74, 12, n_samples).clip(40, 180)
    bp_sys = rng.normal(125, 15, n_samples).clip(75, 210)
    bp_dia = rng.normal(78, 10, n_samples).clip(45, 125)
    spo2 = np.clip(rng.beta(12, 1.0, n_samples) * 100.0, 70.0, 100.0)
    shock_index = hr / np.clip(bp_sys, 1.0, None)
    
    return pd.DataFrame({
        "age": age,
        "hr": hr,
        "bp_systolic": bp_sys,
        "bp_diastolic": bp_dia,
        "spo2": spo2,
        "shock_index": shock_index
    })


def LegoBrick_SleepArchitecture(n_samples: int, rng: np.random.Generator) -> pd.DataFrame:
    """Lego Brick 2: CAISR PSG Sleep & Glymphatic Architecture."""
    n3_pct = rng.normal(16.0, 5.5, n_samples).clip(0.0, 38.0)
    oai = rng.exponential(4.0, n_samples).clip(0.0, 30.0)
    cai = rng.exponential(2.0, n_samples).clip(0.0, 20.0)
    hi = rng.normal(8.0, 4.0, n_samples).clip(0.0, 25.0)
    ahi = oai + cai + hi
    arousal_index = rng.normal(18.0, 8.0, n_samples).clip(0.0, 55.0)
    micro_arousals = arousal_index * rng.uniform(0.8, 1.2, n_samples)
    waso_mins = rng.normal(45.0, 20.0, n_samples).clip(5.0, 150.0)
    tst_hours = rng.normal(6.5, 1.2, n_samples).clip(3.0, 10.0)
    
    return pd.DataFrame({
        "n3_percentage": n3_pct,
        "apnea_hypopnea_index": ahi,
        "obstructive_apnea_index": oai,
        "central_apnea_index": cai,
        "hypopnea_index": hi,
        "arousal_index": arousal_index,
        "micro_arousal_density": micro_arousals,
        "sleep_fragmentation_index": waso_mins / (tst_hours * 60.0),
        "vagal_tone_index": (30.0 / np.clip(rng.normal(72, 10, n_samples), 30.0, None)) * (n3_pct / 20.0)
    })


def LegoBrick_MultiYearBiomarkers(n_samples: int, rng: np.random.Generator) -> pd.DataFrame:
    """Lego Brick 3: 2022-2025 Multi-Year Historical Biomarkers."""
    murmur_intensity = rng.exponential(0.3, n_samples).clip(0.0, 3.0)
    eeg_alpha_delta = rng.normal(1.4, 0.4, n_samples).clip(0.2, 3.5)
    ecg_qtc = rng.normal(420.0, 25.0, n_samples).clip(340.0, 560.0)
    serum_lactate = rng.exponential(1.2, n_samples).clip(0.4, 12.0)
    
    return pd.DataFrame({
        "murmur_intensity": murmur_intensity,
        "eeg_alpha_delta_ratio": eeg_alpha_delta,
        "ecg_qtc_ms": ecg_qtc,
        "serum_lactate": serum_lactate
    })


# ══════════════════════════════════════════════════════════════════════════════
# 2. UNIVERSAL COMPOSABLE SYNTHETIC PIPELINE & MULTI-TASK META LEARNER
# ══════════════════════════════════════════════════════════════════════════════

def compose_universal_dataset(n_samples: int = 4000, seed: int = 2026) -> Tuple[pd.DataFrame, pd.Series]:
    """Composes all physiological Lego Bricks into a unified universal multi-task feature space."""
    rng = np.random.default_rng(seed)
    
    df_vitals = LegoBrick_BaselineVitals(n_samples, rng)
    df_sleep = LegoBrick_SleepArchitecture(n_samples, rng)
    df_bio = LegoBrick_MultiYearBiomarkers(n_samples, rng)
    
    X = pd.concat([df_vitals, df_sleep, df_bio], axis=1)
    
    # Universal Target Function
    logit = (
        0.035 * (X["age"] - 65) +
        0.40 * np.maximum(0.0, X["shock_index"] - 0.70) +
        -0.12 * (X["n3_percentage"] - 15) +
        0.05 * (X["central_apnea_index"] - 2) +
        0.30 * np.maximum(0.0, X["serum_lactate"] - 2.0) +
        0.25 * np.maximum(0.0, X["ecg_qtc_ms"] - 450) / 40.0 -
        1.8
    )
    prob = 1.0 / (1.0 + np.exp(-logit))
    y = pd.Series((prob >= 0.38).astype(int), name="outcome")
    return X, y


# ══════════════════════════════════════════════════════════════════════════════
# 3. LIGHTWEIGHT CUSTOM JSON MODEL SERIALIZATION (Zero-Dependency Edge Model)
# ══════════════════════════════════════════════════════════════════════════════

class LightweightLinearMetaModel:
    """Lightweight custom model serialized strictly in human-readable JSON."""
    def __init__(self, feature_names: List[str]):
        self.feature_names = feature_names
        self.weights = {feat: 0.0 for feat in feature_names}
        self.bias = 0.0

    def fit(self, X: pd.DataFrame, y: pd.Series, lr: float = 0.05, epochs: int = 100) -> None:
        """Trains a lightweight logistic regression via SGD."""
        X_mat = X[self.feature_names].values
        # Standardize features
        self.means = np.mean(X_mat, axis=0)
        self.stds = np.std(X_mat, axis=0)
        self.stds[self.stds == 0] = 1.0
        
        X_norm = (X_mat - self.means) / self.stds
        w = np.zeros(X_norm.shape[1])
        b = 0.0
        
        y_arr = y.values
        for _ in range(epochs):
            logits = np.dot(X_norm, w) + b
            probs = 1.0 / (1.0 + np.exp(-np.clip(logits, -20, 20)))
            errors = probs - y_arr
            
            w_grad = np.dot(X_norm.T, errors) / len(y_arr)
            b_grad = np.mean(errors)
            
            w -= lr * w_grad
            b -= lr * b_grad
            
        for idx, feat in enumerate(self.feature_names):
            self.weights[feat] = float(w[idx])
        self.bias = float(b)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Predicts risk probabilities."""
        X_mat = X[self.feature_names].values
        X_norm = (X_mat - self.means) / self.stds
        w_vec = np.array([self.weights[feat] for feat in self.feature_names])
        logits = np.dot(X_norm, w_vec) + self.bias
        return 1.0 / (1.0 + np.exp(-np.clip(logits, -20, 20)))

    def to_json(self) -> str:
        """Serializes weights into zero-dependency JSON string."""
        return json.dumps({
            "model_type": "LightweightLinearMetaModel",
            "feature_names": self.feature_names,
            "weights": self.weights,
            "bias": self.bias,
            "means": self.means.tolist(),
            "stds": self.stds.tolist()
        }, indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> LightweightLinearMetaModel:
        """Loads model from JSON string."""
        data = json.loads(json_str)
        model = cls(data["feature_names"])
        model.weights = data["weights"]
        model.bias = data["bias"]
        model.means = np.array(data["means"])
        model.stds = np.array(data["stds"])
        return model
