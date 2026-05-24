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
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, brier_score_loss
import joblib

# Set paths dynamically relative to this script
MODELS_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODELS_DIR / "clinical_risk_v2.joblib"

def generate_synthetic_clinical_data(n_samples: int = 2000, seed: int = 42) -> pd.DataFrame:
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
    print("--- Step 1: Loading Dataset ---")
    data = generate_synthetic_clinical_data(n_samples=5000)
    
    features = ["hr", "bp_systolic", "bp_diastolic", "spo2", "age"]
    X = data[features]
    y = data["outcome"]
    
    # 2. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 3. Model Training
    print("\n--- Step 2: Training RandomForest Classifier ---")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        class_weight="balanced",
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # 4. Evaluation
    print("\n--- Step 3: Evaluating Model Performance ---")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    auc = roc_auc_score(y_test, y_prob)
    brier = brier_score_loss(y_test, y_prob)
    print(f"ROC-AUC Score: {auc:.4f}")
    print(f"Brier Score (Calibration): {brier:.4f}")
    
    # 5. Serialization
    print(f"\n--- Step 4: Exporting Model to {MODEL_PATH} ---")
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print("Model serialized successfully!")
    
    # 6. Verify predictions
    print("\n--- Step 5: Verification of Loaded Model ---")
    loaded_model = joblib.load(MODEL_PATH)
    sample_features = [[78.0, 135.0, 85.0, 96.5, 68]]  # Stable but slightly hypertensive senior
    prob_class_1 = loaded_model.predict_proba(sample_features)[0][1]
    print(f"Inference Test: Patient vitals {sample_features[0]}")
    print(f"Calculated Clinical Risk Score: {prob_class_1:.3f}")

if __name__ == "__main__":
    train_pipeline()
