import numpy as np
import mne
from pathlib import Path
import os

API_DIR = Path(__file__).parent
DATA_DIR = API_DIR / "data" / "physionet_2026"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def create_dummy_psg(filename="patient_1.edf"):
    # Create 5 channels: 2 EEG, 1 EOG, 1 EMG, 1 ECG
    ch_names = ["EEG Fpz-Cz", "EEG Pz-Oz", "EOG horizontal", "EMG submental", "ECG"]
    ch_types = ["eeg", "eeg", "eog", "emg", "ecg"]
    
    # 10 seconds of data at 100 Hz
    sfreq = 100
    n_samples = 10 * sfreq
    
    # Generate random noise for channels
    rng = np.random.default_rng(42)
    data = rng.normal(size=(len(ch_names), n_samples)) * 1e-5
    
    info = mne.create_info(ch_names=ch_names, sfreq=sfreq, ch_types=ch_types)
    raw = mne.io.RawArray(data, info)
    
    # Export to EDF
    out_path = DATA_DIR / filename
    try:
        mne.export.export_raw(str(out_path), raw, fmt='edf', overwrite=True)
        print(f"Created synthetic EDF at {out_path}")
    except Exception as e:
        print(f"Failed to export EDF: {e}")

if __name__ == "__main__":
    create_dummy_psg("patient_001.edf")
    create_dummy_psg("patient_002.edf")
