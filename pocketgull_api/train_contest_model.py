"""
Pocket Gull — ML Contest Training & Evaluation Pipeline
This script trains a machine learning model on patient vitals
(mimicking challenges like MIMIC-IV clinical risk prediction or PhysioNet)
and serializes it to `models/clinical_risk_v2.joblib` to replace the heuristic fallback.

Usage:
    python train_contest_model.py
"""

import os
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import classification_report, roc_auc_score, brier_score_loss
import joblib
import json
from datetime import datetime

# Set paths dynamically relative to this script
MODELS_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODELS_DIR / "clinical_risk_v2.joblib"
METADATA_PATH = MODELS_DIR / "clinical_risk_v2.metadata.json"

def add_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes derived clinical indicators from raw vitals.
    """
    df = df.copy()
    df["map"] = df["bp_diastolic"] + (df["bp_systolic"] - df["bp_diastolic"]) / 3.0
    df["pulse_pressure"] = df["bp_systolic"] - df["bp_diastolic"]
    df["shock_index"] = df["hr"] / df["bp_systolic"].clip(lower=1.0)
    return df

def generate_synthetic_clinical_data(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """
    Generates synthetic clinical data representing physiological vitals 
    and associated clinical outcomes (e.g., ICU admission or adverse events).
    """
    rng = np.random.default_rng(seed)
    
    # Generate feature distributions
    hr = rng.normal(75, 15, n_samples)          # Heart rate (bpm)
    bp_systolic = rng.normal(120, 18, n_samples) # Systolic BP (mmHg)
    bp_diastolic = rng.normal(80, 10, n_samples)  # Diastolic BP (mmHg)
    spo2 = rng.beta(15, 0.5, n_samples) * 100    # SpO2 (%) - skewed towards high 90s
    age = rng.integers(18, 90, n_samples)        # Age
    
    # Create DataFrame
    df = pd.DataFrame({
        "hr": hr,
        "bp_systolic": bp_systolic,
        "bp_diastolic": bp_diastolic,
        "spo2": spo2,
        "age": age
    })
    
    # Clip parameters to clinical bounds
    df["hr"] = df["hr"].clip(40, 180)
    df["bp_systolic"] = df["bp_systolic"].clip(70, 200)
    df["bp_diastolic"] = df["bp_diastolic"].clip(40, 120)
    df["spo2"] = df["spo2"].clip(70, 100)
    
    # Calculate a non-linear risk probability (latent variable)
    # Higher HR, extreme BP, lower SpO2, and advanced age increase risk
    logit = (
        0.02 * (df["hr"] - 75)**2 / 100 +        # Quadratic penalty for extreme HR
        0.015 * (df["bp_systolic"] - 120)**2 / 100 + # Quadratic penalty for high/low systolic BP
        -0.25 * (df["spo2"] - 98) +              # Linear penalty for hypoxia
        0.03 * (df["age"] - 40) -                # Age risk factor
        2.5                                      # Baseline offset
    )
    
    prob = 1 / (1 + np.exp(-logit))
    
    # Binarize label based on probability (critical event: 1, stable: 0)
    df["outcome"] = rng.binomial(1, prob)
    
    print(f"Generated {n_samples} synthetic patient records.")
    print(f"Outcome distribution: Stable = {np.sum(df['outcome'] == 0)}, Critical Event = {np.sum(df['outcome'] == 1)}")
    return df

def train_pipeline() -> None:
    # 1. Generate or load data
    print("--- Step 1: Loading & Engineering Dataset ---")
    raw_data = generate_synthetic_clinical_data(n_samples=5000)
    data = add_derived_features(raw_data)
    
    features = ["hr", "bp_systolic", "bp_diastolic", "spo2", "age", "map", "pulse_pressure", "shock_index"]
    X = data[features]
    y = data["outcome"]
    
    # 2. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 3. Hyperparameter Optimization via Grid Search
    print("\n--- Step 2: Running GridSearchCV for RandomForest ---")
    rf_base = RandomForestClassifier(class_weight="balanced", random_state=42)
    param_grid = {
        "n_estimators": [50, 100],
        "max_depth": [4, 6, 8],
        "min_samples_split": [2, 5]
    }
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    grid_search = GridSearchCV(
        estimator=rf_base,
        param_grid=param_grid,
        scoring="roc_auc",
        cv=cv,
        n_jobs=-1
    )
    grid_search.fit(X_train, y_train)
    best_rf = grid_search.best_estimator_
    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best CV ROC-AUC: {grid_search.best_score_:.4f}")
    
    # 4. Probability Calibration
    print("\n--- Step 3: Calibrating Classifier Probabilities ---")
    calibrated_clf = CalibratedClassifierCV(
        estimator=best_rf,
        method="isotonic",
        cv="prefit"
    )
    # Fit calibration on the same training set (prefit RF)
    calibrated_clf.fit(X_train, y_train)
    
    # 5. Evaluation
    print("\n--- Step 4: Evaluating Calibrated Model Performance ---")
    y_pred = calibrated_clf.predict(X_test)
    y_prob = calibrated_clf.predict_proba(X_test)[:, 1]
    
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    auc = roc_auc_score(y_test, y_prob)
    brier = brier_score_loss(y_test, y_prob)
    print(f"ROC-AUC Score: {auc:.4f}")
    print(f"Brier Score (Calibration): {brier:.4f}")
    
    # 6. Serialization
    print(f"\n--- Step 5: Exporting Calibrated Model & Metadata ---")
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Save Model
    joblib.dump(calibrated_clf, MODEL_PATH)
    print(f"Calibrated model serialized to {MODEL_PATH}")
    
    # Save Metadata sidecar
    metadata = {
        "model_type": "CalibratedClassifierCV(RandomForestClassifier)",
        "version": "2.0.0",
        "training_date": datetime.utcnow().isoformat() + "Z",
        "features": features,
        "metrics": {
            "roc_auc": round(float(auc), 4),
            "brier_score": round(float(brier), 4),
            "best_cv_auc": round(float(grid_search.best_score_), 4)
        },
        "best_hyperparameters": grid_search.best_params_
    }
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Model metadata card written to {METADATA_PATH}")
    
    # 7. Verify predictions
    print("\n--- Step 6: Verification of Loaded Model ---")
    loaded_model = joblib.load(MODEL_PATH)
    # Sample features including derived ones: [hr, bp_systolic, bp_diastolic, spo2, age, map, pulse_pressure, shock_index]
    # SBP = 135, DBP = 85, HR = 78
    # map_val = 85 + (135 - 85)/3 = 101.67
    # pulse_press = 135 - 85 = 50
    # shock_index = 78 / 135 = 0.578
    sample_features = [[78.0, 135.0, 85.0, 96.5, 68.0, 101.67, 50.0, 0.578]]
    prob_class_1 = loaded_model.predict_proba(sample_features)[0][1]
    print(f"Inference Test: Patient vitals {sample_features[0]}")
    print(f"Calculated Clinical Risk Score: {prob_class_1:.3f}")

if __name__ == "__main__":
    train_pipeline()
