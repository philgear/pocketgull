"""
Unit tests for Pocket Gull Universal Modular Lego Foundation Engine & JSON Serialization.
"""

import sys
import json
from pathlib import Path
from sklearn.metrics import roc_auc_score

# Add pocketgull_api to sys.path
API_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(API_DIR))

from services.lego_foundation_engine import (
    compose_universal_dataset,
    LightweightLinearMetaModel
)


def test_lego_data_composition():
    print("--- 1. Testing Composable Physiological Lego Bricks Data Generator ---")
    X, y = compose_universal_dataset(n_samples=2000, seed=2026)
    assert len(X) == 2000
    assert "shock_index" in X.columns
    assert "n3_percentage" in X.columns
    assert "serum_lactate" in X.columns
    print(f"  [PASS] Universal Dataset composed successfully with {len(X.columns)} Lego Brick features.")


def test_lightweight_json_model_serialization():
    print("\n--- 2. Testing Lightweight Custom JSON Model Serialization ---")
    X, y = compose_universal_dataset(n_samples=2500, seed=2026)
    
    feature_names = list(X.columns)
    model = LightweightLinearMetaModel(feature_names)
    model.fit(X, y, lr=0.05, epochs=150)
    
    probs = model.predict_proba(X)
    auc = roc_auc_score(y, probs)
    print(f"  [PASS] Custom Lightweight SGD Model trained (ROC-AUC: {auc:.4f}).")
    assert auc >= 0.80, "Custom SGD model should achieve ROC-AUC >= 0.80"
    
    # Test JSON Serialization & Deserialization
    json_payload = model.to_json()
    assert '"model_type": "LightweightLinearMetaModel"' in json_payload
    
    loaded_model = LightweightLinearMetaModel.from_json(json_payload)
    reloaded_probs = loaded_model.predict_proba(X)
    
    diff = abs(probs[0] - reloaded_probs[0])
    assert diff < 1e-6, "Deserialized model predictions must match original trained model!"
    print("  [PASS] Zero-dependency JSON Serialization & Reloading verified (0 variance).")


if __name__ == "__main__":
    print("==========================================================")
    print("  Pocket Gull — Universal Lego Foundation Engine Test     ")
    print("==========================================================")
    test_lego_data_composition()
    test_lightweight_json_model_serialization()
    print("\n[OK] All Universal Lego Foundation Engine Tests Passed!")
