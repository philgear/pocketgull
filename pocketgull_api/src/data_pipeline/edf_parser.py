import numpy as np
import os
try:
    import mne
    MNE_AVAILABLE = True
except ImportError:
    MNE_AVAILABLE = False

def load_psg_data(file_path: str):
    """
    Loads PSG data from an EDF file.
    """
    if not MNE_AVAILABLE:
        raise ImportError("mne is not installed. Please install it using 'pip install mne'.")
        
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"EDF file not found at {file_path}")
        
    # Preload the raw data into memory for feature extraction
    raw = mne.io.read_raw_edf(file_path, preload=True, verbose=False)
    return raw

def extract_psg_features(raw) -> dict:
    """
    Extracts statistical features from the continuous PSG time series data.
    In a real clinical pipeline, we would compute spectral power (alpha, beta, delta, theta)
    for EEG channels, but for this starter pipeline, we compute basic stats across channels.
    """
    features = {}
    data = raw.get_data()
    ch_names = raw.ch_names
    
    # Extract standard deviation and mean for each channel
    for idx, ch_name in enumerate(ch_names):
        channel_data = data[idx, :]
        features[f"{ch_name}_mean"] = float(np.mean(channel_data))
        features[f"{ch_name}_std"] = float(np.std(channel_data))
        features[f"{ch_name}_min"] = float(np.min(channel_data))
        features[f"{ch_name}_max"] = float(np.max(channel_data))
        
    return features
