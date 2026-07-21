import os
from pathlib import Path
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
import joblib

from src.data_pipeline.edf_parser import load_psg_data, extract_psg_features

API_DIR = Path(__file__).parent
DATA_DIR = API_DIR / "data" / "physionet_2026"
MODELS_DIR = API_DIR / "models"

def load_dataset():
    """
    Loads all EDF files from the PhysioNet 2026 dataset, extracts features, 
    and appends basic demographic mock data for training.
    """
    features_list = []
    
    if not DATA_DIR.exists():
        print(f"Data directory {DATA_DIR} does not exist.")
        return pd.DataFrame()
        
    edf_files = list(DATA_DIR.glob("*.edf"))
    if not edf_files:
        print(f"No EDF files found in {DATA_DIR}.")
        return pd.DataFrame()
        
    print(f"Found {len(edf_files)} EDF files. Extracting features...")
    for idx, edf_file in enumerate(edf_files):
        try:
            raw = load_psg_data(str(edf_file))
            feats = extract_psg_features(raw)
            
            # Mock demographic data and target outcome
            feats["age"] = 65 + (idx % 15)  # Mock age
            feats["sex"] = idx % 2  # 0 for Female, 1 for Male
            feats["cognitive_impairment"] = 1 if (idx % 2 == 0) else 0  # Mock target
            
            features_list.append(feats)
        except Exception as e:
            print(f"Error processing {edf_file}: {e}")
            
    return pd.DataFrame(features_list)

def train_model():
    print("--- Starting PhysioNet 2026 Model Training ---")
    df = load_dataset()
    
    if df.empty:
        print("Dataset is empty. Run create_dummy_edf.py first.")
        return
        
    X = df.drop(columns=["cognitive_impairment"])
    y = df["cognitive_impairment"]
    
    # Very small synthetic dataset just for verifying pipeline execution
    print(f"Training on {len(X)} samples with {X.shape[1]} features.")
    model = HistGradientBoostingClassifier(random_state=42)
    model.fit(X, y)
    
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / "physionet_2026_model.joblib"
    joblib.dump(model, model_path)
    
    print(f"Training complete. Model saved to {model_path}.")

if __name__ == "__main__":
    train_model()
