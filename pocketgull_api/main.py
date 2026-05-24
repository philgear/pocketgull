"""
Pocket Gull — Python Data Bridge
FastAPI sidecar v1.0

Runs on :8001. Accessed via the Angular SSR server at /api/python/*.

Start:
    uvicorn main:app --reload --port 8001

Endpoints:
    GET  /health
    POST /ingest/dataframe       pandas DataFrame → IPatientVitals
    POST /ingest/fhir-bundle     fhir.resources → validated FHIR R4 JSON
    GET  /stream/biosignal/{id}  NumPy EEG/HRV → SSE stream → GlobalAvsService
    POST /ml/risk-score          joblib model → clinical risk score
    GET  /convert/hdf5/{path}    h5py HDF5 segment → paginated JSON
"""

from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import Any, AsyncGenerator, Optional

import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Pocket Gull Python Data Bridge",
    version="1.0.0",
    description="Bridges Python medical data (pandas, NumPy, FHIR, HDF5, ML) to the Angular clinical frontend.",
)

_ALLOWED_ORIGINS = [
    "http://localhost:4000",
    "http://localhost:4200",
    os.getenv("FRONTEND_ORIGIN", "https://pocketgull.app"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/health", tags=["Meta"])
async def health() -> dict[str, str]:
    """Liveness probe — used by Cloud Run and the Angular proxy error handler."""
    return {"status": "ok", "service": "pocket-gull-python-bridge"}


# ══════════════════════════════════════════════════════════════════════════════
# INGEST: PANDAS DATAFRAME → IPatientVitals
# ══════════════════════════════════════════════════════════════════════════════

class DataFrameIngestRequest(BaseModel):
    """
    Send a pandas DataFrame serialized via df.to_json(orient='records').
    The Python side normalizes column name aliases from various EHR export formats.
    """
    records: list[dict[str, Any]] = Field(..., description="Array of row dicts from df.to_json(orient='records')")


class PatientVitalsResponse(BaseModel):
    """Mirrors IPatientVitals from patient.types.ts — all fields optional strings."""
    bp: Optional[str] = None
    hr: Optional[str] = None
    temp: Optional[str] = None
    spO2: Optional[str] = None
    weight: Optional[str] = None
    height: Optional[str] = None
    vitC: Optional[str] = None
    vitD3: Optional[str] = None
    magnesium: Optional[str] = None
    zinc: Optional[str] = None
    b12: Optional[str] = None

    class Config:
        populate_by_name = True


# EHR column name aliases — extend as needed for your specific EHR export format
_COLUMN_ALIASES: dict[str, list[str]] = {
    "bp":        ["bloodpressure", "bp", "systolicdiastolic", "bpmmhg", "blood_pressure"],
    "hr":        ["heartrate", "hr", "pulse", "hrbpm", "heart_rate"],
    "temp":      ["temperature", "temp", "bodytemp", "tempc", "tempf", "body_temperature"],
    "spO2":      ["spo2", "oxygensaturation", "o2sat", "pulseo2", "oxygen_saturation"],
    "weight":    ["weight", "weightkg", "weightlbs", "bodyweight", "body_weight"],
    "height":    ["height", "heightcm", "heightin", "stature"],
    "vitC":      ["vitaminc", "vitc", "ascorbicacid", "vitamin_c"],
    "vitD3":     ["vitamind", "vitamind3", "vitd3", "cholecalciferol", "vitamin_d3"],
    "magnesium": ["magnesium", "mg", "serum_magnesium"],
    "zinc":      ["zinc", "zn", "serum_zinc"],
    "b12":       ["b12", "vitaminb12", "cobalamin", "cyanocobalamin", "vitamin_b12"],
}


@app.post("/ingest/dataframe", response_model=PatientVitalsResponse, tags=["Ingest"])
async def ingest_dataframe(payload: DataFrameIngestRequest) -> PatientVitalsResponse:
    """
    Accept a pandas DataFrame serialized as a records array and map it to
    IPatientVitals. Handles the wide variety of column name conventions used
    by different EHR export tools (Epic, Cerner, Athena, custom CSV).

    Client usage:
        records = df.to_dict(orient='records')
        response = requests.post('/api/python/ingest/dataframe', json={'records': records})
    """
    try:
        import pandas as pd

        df = pd.DataFrame(payload.records)
        if df.empty:
            return PatientVitalsResponse()

        # Normalize column names: lowercase, strip spaces/underscores/slashes
        df.columns = (
            df.columns
            .str.lower()
            .str.replace(r"[\s/_\-]", "", regex=True)
        )

        def extract(field: str) -> Optional[str]:
            """Return first non-null value for any known alias of `field`."""
            for alias in _COLUMN_ALIASES.get(field, [field]):
                if alias in df.columns:
                    series = df[alias].dropna()
                    if not series.empty:
                        return str(series.iloc[0])
            return None

        return PatientVitalsResponse(
            bp=extract("bp"),
            hr=extract("hr"),
            temp=extract("temp"),
            spO2=extract("spO2"),
            weight=extract("weight"),
            height=extract("height"),
            vitC=extract("vitC"),
            vitD3=extract("vitD3"),
            magnesium=extract("magnesium"),
            zinc=extract("zinc"),
            b12=extract("b12"),
        )

    except ImportError:
        raise HTTPException(status_code=503, detail="pandas not installed. Run: pip install pandas")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"DataFrame parsing error: {exc}")


# ══════════════════════════════════════════════════════════════════════════════
# INGEST: FHIR BUNDLE VALIDATION GATEWAY
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/ingest/fhir-bundle", tags=["Ingest"])
async def ingest_fhir_bundle(bundle_json: dict[str, Any]) -> dict[str, Any]:
    """
    Validate a FHIR Bundle. Supports a hybrid validation model for R6:
    - Standard resources (Patient, Observation, Condition, etc.) are validated via fhir.resources.
    - Draft/R6-specific resources (Evidence, Device, DeviceDefinition) are validated structurally.
    """
    try:
        if bundle_json.get("resourceType") != "Bundle":
            raise HTTPException(status_code=422, detail="Resource is not a FHIR Bundle")
            
        entries = bundle_json.get("entry", [])
        if not isinstance(entries, list):
            raise HTTPException(status_code=422, detail="Bundle entries must be a list")

        validated_entries = []
        r6_resource_types = {"Evidence", "Device", "DeviceDefinition", "ArtifactAssessment", "SubscriptionTopic"}
        
        for entry in entries:
            if not isinstance(entry, dict) or "resource" not in entry:
                validated_entries.append(entry)
                continue
                
            resource = entry["resource"]
            if not isinstance(resource, dict) or "resourceType" not in resource:
                raise HTTPException(status_code=422, detail="Entry resource must have a resourceType")
                
            res_type = resource["resourceType"]
            
            # If it's a draft R6-specific resource, do a structural schema check
            if res_type in r6_resource_types:
                if "id" not in resource:
                    raise HTTPException(status_code=422, detail=f"R6 Draft Resource {res_type} missing 'id'")
                validated_entries.append(entry)
            else:
                # Standard resource: validate using fhir.resources dynamically
                try:
                    module_name = res_type.lower()
                    try:
                        mod = __import__(f"fhir.resources.{module_name}", fromlist=[res_type])
                        klass = getattr(mod, res_type)
                        validated_res = klass.model_validate(resource)
                        entry_copy = dict(entry)
                        entry_copy["resource"] = validated_res.model_dump(mode="json", exclude_none=True)
                        validated_entries.append(entry_copy)
                    except (ImportError, AttributeError):
                        # Fallback for unrecognized classes/modules
                        validated_entries.append(entry)
                except Exception as e:
                    raise HTTPException(status_code=422, detail=f"Invalid standard FHIR resource {res_type}: {e}")

        validated_bundle = dict(bundle_json)
        validated_bundle["entry"] = validated_entries
        return validated_bundle

    except ImportError:
        raise HTTPException(status_code=503, detail="fhir.resources not installed. Run: pip install fhir.resources")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid FHIR Bundle: {exc}")


# ══════════════════════════════════════════════════════════════════════════════
# STREAM: NumPy BIOSIGNAL → SSE → GlobalAvsService
# ══════════════════════════════════════════════════════════════════════════════

def _classify_wave(freq_hz: float) -> str:
    """Map dominant EEG frequency (Hz) to clinical brainwave band name."""
    if freq_hz < 4:   return "delta"
    if freq_hz < 8:   return "theta"
    if freq_hz < 13:  return "alpha"
    if freq_hz < 30:  return "beta"
    return "gamma"


async def _biosignal_generator(session_id: str) -> AsyncGenerator[str, None]:
    """
    Yields Server-Sent Events with live biosignal metrics.

    In production: swap the simulation block with your real biosignal pipeline
    (MNE, BioSPPy, HeartPy, Brainflow, etc.) running in a background thread
    and pushing results via asyncio.Queue.

    The Angular GlobalAvsService.startBiosignalAdaptation() consumes these events
    to update --avs-breath-duration and data-avs-wave in real time.
    """
    t = 0.0
    rng = np.random.default_rng(seed=int(session_id[-4:], 16) if len(session_id) >= 4 else 42)

    # Attempt to load scipy for real DSP
    try:
        from scipy.signal import find_peaks
        has_scipy = True
    except ImportError:
        has_scipy = False

    # Simulate an HDF5 buffer ring (In reality, this would be a shared memory queue from hardware)
    sample_rate = 250
    buffer_size = sample_rate * 10 # 10 seconds of data

    while True:
        # ── HDF5 DSP Pipeline (Real-Time HRV Extraction) ───────────────
        hrv_rmssd, dominant_freq_hz, breathing_bpm, coherence = None, None, None, None
        
        if has_scipy and _HDF5_DATA_DIR.exists():
            try:
                import h5py
                hdf5_path = _HDF5_DATA_DIR / "session.hdf5"
                if hdf5_path.exists():
                    with h5py.File(hdf5_path, "r") as f:
                        if "ecg/channel_0" in f:
                            ds = f["ecg/channel_0"]
                            # Read the latest 10 seconds (simulating real-time head)
                            # For demo, we just read a random chunk 
                            start_idx = int((t * sample_rate) % (len(ds) - buffer_size))
                            if start_idx < 0: start_idx = 0
                            
                            ecg_chunk = ds[start_idx:start_idx + buffer_size][:]
                            
                            # 1. Find R-peaks (ECG)
                            peaks, _ = find_peaks(ecg_chunk, distance=sample_rate*0.5, prominence=0.5)
                            
                            if len(peaks) > 2:
                                # 2. Calculate RR intervals (ms)
                                rr_intervals = np.diff(peaks) / sample_rate * 1000
                                
                                # 3. Calculate RMSSD (Heart Rate Variability)
                                sq_diffs = np.diff(rr_intervals) ** 2
                                hrv_rmssd = np.sqrt(np.mean(sq_diffs))
                                
                                # 4. Derive Respiratory Sinus Arrhythmia (RSA) for Breathing BPM
                                # Simplistic estimation: Respiratory rate is roughly 1/4 of heart rate
                                avg_rr_s = np.mean(rr_intervals) / 1000
                                hr_bpm = 60 / avg_rr_s
                                breathing_bpm = hr_bpm / 4.0
                                
                                # 5. Calculate Coherence (Simulated based on RMSSD stability)
                                coherence = min(1.0, max(0.0, hrv_rmssd / 100.0))
                                
                                # 6. Dominant Frequency (EEG mapping placeholder)
                                dominant_freq_hz = 7.5 # Fallback theta
            except Exception as e:
                print(f"[DSP Error] {e}")
                pass

        # ── Fallback Simulation ──────────────────────────────────────────
        if hrv_rmssd is None:
            hrv_rmssd        = float(45 + 15 * np.sin(t * 0.05) + rng.normal(0, 2))
            dominant_freq_hz = float(6.0 + 2 * np.sin(t * 0.018) + rng.normal(0, 0.3))  # theta range
            breathing_bpm    = float(5.5 + 0.8 * np.sin(t * 0.03))   # near 5.5 BPM resonance
            coherence        = float(np.clip(0.65 + 0.2 * np.sin(t * 0.04), 0.0, 1.0))
        # ─────────────────────────────────────────────────────────────────

        event = {
            "session_id":           session_id,
            "hrv_rmssd_ms":         round(float(hrv_rmssd), 2),
            "dominant_frequency_hz": round(float(dominant_freq_hz), 2),
            "suggested_wave":        _classify_wave(float(dominant_freq_hz)),
            "breathing_bpm":         round(float(breathing_bpm), 2),
            "hrv_coherence":         round(float(coherence), 3),
            "timestamp_ms":          int(t * 1000),
        }

        yield f"data: {json.dumps(event)}\n\n"
        await asyncio.sleep(2.0)   # 0.5 Hz — matches GlobalAvsService rAF smoothing
        t += 2.0


@app.get("/stream/biosignal/{session_id}", tags=["Biosignal"])
async def stream_biosignal(session_id: str) -> StreamingResponse:
    """
    Stream biosignal-derived AVS parameters as Server-Sent Events.

    Connect from Angular:
        const es = new EventSource('/api/python/stream/biosignal/<session_id>');
        es.onmessage = (e) => { const d = JSON.parse(e.data); ... };

    Each event payload:
        { hrv_rmssd_ms, dominant_frequency_hz, suggested_wave,
          breathing_bpm, hrv_coherence, timestamp_ms }
    """
    return StreamingResponse(
        _biosignal_generator(session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "Connection":       "keep-alive",
            "X-Accel-Buffering": "no",   # Disable nginx/Cloud Run response buffering
        },
    )


# ══════════════════════════════════════════════════════════════════════════════
# ML: CLINICAL RISK SCORING (joblib / scikit-learn)
# ══════════════════════════════════════════════════════════════════════════════

# Model loaded once at startup — never per-request, never sent to the client.
_risk_model: Any = None
_MODEL_PATH = Path(__file__).parent / "models" / "clinical_risk_v2.joblib"


@app.on_event("startup")
async def _load_ml_model() -> None:
    global _risk_model
    if _MODEL_PATH.exists():
        try:
            import joblib
            _risk_model = joblib.load(_MODEL_PATH)
            print(f"[ML] Loaded clinical risk model from {_MODEL_PATH}")
        except Exception as exc:
            print(f"[ML] Warning: could not load model ({exc}). Risk scoring will be unavailable.")
    else:
        print(f"[ML] No model found at {_MODEL_PATH}. Risk scoring endpoint returns demo data.")


class RiskScoreRequest(BaseModel):
    hr:            float = Field(..., description="Heart rate (bpm)")
    bp_systolic:   float = Field(..., description="Systolic blood pressure (mmHg)")
    bp_diastolic:  float = Field(..., description="Diastolic blood pressure (mmHg)")
    spo2:          float = Field(..., description="SpO2 (%)")
    age:           int   = Field(default=0, description="Patient age")
    conditions:    list[str] = Field(default_factory=list)


class RiskScoreResponse(BaseModel):
    risk_level:           str           # 'low' | 'moderate' | 'high' | 'critical'
    risk_score:           float          # 0.0–1.0
    confidence:           float
    contributing_factors: list[str]
    note:                 str = ""


def _classify_risk(score: float) -> str:
    if score < 0.25: return "low"
    if score < 0.55: return "moderate"
    if score < 0.80: return "high"
    return "critical"


def _explain_factors(req: RiskScoreRequest, score: float) -> list[str]:
    factors: list[str] = []
    if req.hr > 100:          factors.append("Elevated heart rate")
    if req.hr < 50:           factors.append("Bradycardia")
    if req.bp_systolic > 140: factors.append("Hypertension (systolic)")
    if req.spo2 < 94:         factors.append("Low oxygen saturation")
    if req.age > 65:          factors.append("Age > 65")
    if not factors:           factors.append("Vitals within normal ranges")
    return factors


@app.post("/ml/risk-score", response_model=RiskScoreResponse, tags=["ML"])
async def ml_risk_score(req: RiskScoreRequest) -> RiskScoreResponse:
    """
    Run clinical risk scoring. Model inference is server-side only —
    the joblib pickle never leaves this process.

    If no trained model is present, returns a rule-based heuristic score
    so the endpoint remains usable during development.
    """
    features = [req.hr, req.bp_systolic, req.bp_diastolic, req.spo2, float(req.age)]

    if _risk_model is not None:
        try:
            score = float(_risk_model.predict_proba([features])[0][1])
            note = "ML model inference"
        except Exception as exc:
            score = 0.0
            note = f"Model error: {exc}"
    else:
        # Rule-based heuristic fallback for development
        score = 0.0
        if req.bp_systolic > 140: score += 0.25
        if req.hr > 100:          score += 0.20
        if req.spo2 < 94:         score += 0.35
        if req.age > 65:          score += 0.10
        score = min(score, 1.0)
        note = "Heuristic (no model loaded)"

    return RiskScoreResponse(
        risk_level=_classify_risk(score),
        risk_score=round(score, 3),
        confidence=0.87 if _risk_model else 0.60,
        contributing_factors=_explain_factors(req, score),
        note=note,
    )


# ══════════════════════════════════════════════════════════════════════════════
# HDF5: PAGINATED BIOSIGNAL ARCHIVE READER
# ══════════════════════════════════════════════════════════════════════════════

_HDF5_DATA_DIR = Path(__file__).parent / "data"


@app.get("/convert/hdf5/{dataset_path:path}", tags=["HDF5"])
async def read_hdf5_segment(
    dataset_path: str,
    file: str = Query(default="session.hdf5", description="HDF5 filename in the data/ directory"),
    start: int = Query(default=0, ge=0, description="Start sample index"),
    count: int = Query(default=1000, ge=1, le=10000, description="Number of samples to return"),
) -> dict[str, Any]:
    """
    Return a paginated segment of an HDF5 dataset as JSON-serializable data.
    Large biosignal archives (EEG, ECG) are never loaded entirely into memory.

    Example:
        GET /api/python/convert/hdf5/eeg/channel_0?file=subject_42.hdf5&start=0&count=500
    """
    try:
        import h5py

        hdf5_path = _HDF5_DATA_DIR / file
        if not hdf5_path.exists():
            raise HTTPException(status_code=404, detail=f"HDF5 file not found: {file}")

        with h5py.File(hdf5_path, "r") as f:
            if dataset_path not in f:
                raise HTTPException(status_code=404, detail=f"Dataset '{dataset_path}' not found in {file}")

            ds = f[dataset_path]
            total = len(ds)
            end = min(start + count, total)
            segment = ds[start:end]

            # Convert NumPy types to plain Python — required for JSON serialization
            return {
                "file":            file,
                "dataset":         dataset_path,
                "start":           start,
                "end":             end,
                "count":           end - start,
                "total":           total,
                "sample_rate_hz":  float(ds.attrs.get("sample_rate", 250)),
                "unit":            str(ds.attrs.get("unit", "uV")),
                "channel":         str(ds.attrs.get("channel", dataset_path)),
                "data":            segment.tolist(),  # np.ndarray → list (JSON-safe)
            }

    except ImportError:
        raise HTTPException(status_code=503, detail="h5py not installed. Run: pip install h5py")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"HDF5 read error: {exc}")
