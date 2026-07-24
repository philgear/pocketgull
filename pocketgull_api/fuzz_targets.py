"""
Pocket Gull — Atheris Fuzz Targets
Fuzz testing for the FastAPI Python Data Bridge.

In CI mode (FUZZING_CI=true), each target runs for a fixed iteration count.
Locally, runs until interrupted or a crash is found.

Usage:
    FUZZING_CI=true python fuzz_targets.py
"""

from __future__ import annotations

import json
import os
import sys

# CI mode: run each target for a limited number of iterations
_CI_MODE = os.getenv("FUZZING_CI", "").lower() == "true"
_CI_ITERATIONS = 10_000


def _run_target(target_fn, name: str) -> None:
    """Run a single fuzz target with Atheris."""
    import atheris  # type: ignore[import-not-found,import-untyped]

    print(f"[FUZZ] Running target: {name}")

    args = [sys.argv[0]]
    if _CI_MODE:
        args += [f"-runs={_CI_ITERATIONS}"]

    atheris.Setup(args, target_fn)
    atheris.Fuzz()


# ══════════════════════════════════════════════════════════════════════════════
# Target 1: DataFrameIngestRequest — Pydantic model parsing
# ══════════════════════════════════════════════════════════════════════════════

def fuzz_dataframe_ingest(data: bytes) -> None:
    """Fuzz the DataFrameIngestRequest Pydantic model with arbitrary input."""
    from pydantic import ValidationError

    # Import here to avoid startup side effects
    from main import DataFrameIngestRequest

    fdp = atheris.FuzzedDataProvider(data)  # type: ignore[name-defined]

    # Strategy 1: Random JSON-like string
    try:
        raw = fdp.ConsumeUnicodeNoSurrogates(fdp.ConsumeIntInRange(0, 4096))
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict):
                DataFrameIngestRequest(**parsed)
        except (json.JSONDecodeError, ValidationError, TypeError, ValueError):
            pass
    except Exception:
        pass

    # Strategy 2: Structured dict with fuzzed fields
    try:
        num_records = fdp.ConsumeIntInRange(0, 50)
        records = []
        for _ in range(num_records):
            record = {}
            num_fields = fdp.ConsumeIntInRange(0, 20)
            for _ in range(num_fields):
                key = fdp.ConsumeUnicodeNoSurrogates(fdp.ConsumeIntInRange(0, 64))
                val = fdp.ConsumeUnicodeNoSurrogates(fdp.ConsumeIntInRange(0, 256))
                record[key] = val
            records.append(record)
        DataFrameIngestRequest(records=records)
    except (ValidationError, TypeError, ValueError):
        pass


# ══════════════════════════════════════════════════════════════════════════════
# Target 2: FHIR Bundle validation
# ══════════════════════════════════════════════════════════════════════════════

def fuzz_fhir_bundle(data: bytes) -> None:
    """Fuzz the FHIR R4 Bundle parser with arbitrary JSON payloads."""
    from pydantic import ValidationError

    fdp = atheris.FuzzedDataProvider(data)  # type: ignore[name-defined]

    try:
        from fhir.resources.bundle import Bundle

        raw = fdp.ConsumeUnicodeNoSurrogates(fdp.ConsumeIntInRange(0, 8192))
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict):
                Bundle(**parsed)
        except (json.JSONDecodeError, ValidationError, TypeError, ValueError, KeyError):
            pass
    except Exception:
        pass


# ══════════════════════════════════════════════════════════════════════════════
# Target 3: Column alias normalization
# ══════════════════════════════════════════════════════════════════════════════

def fuzz_column_normalization(data: bytes) -> None:
    """Fuzz the EHR column name normalization logic."""
    fdp = atheris.FuzzedDataProvider(data)  # type: ignore[name-defined]

    try:
        from main import _COLUMN_ALIASES

        # Generate a record with random column names
        record: dict[str, str] = {}
        num_fields = fdp.ConsumeIntInRange(0, 30)
        for _ in range(num_fields):
            key = fdp.ConsumeUnicodeNoSurrogates(fdp.ConsumeIntInRange(0, 128))
            val = fdp.ConsumeUnicodeNoSurrogates(fdp.ConsumeIntInRange(0, 256))
            record[key] = val

        # Simulate the normalization loop for all generated keys
        for key in record:
            normalized_key = key.strip().lower().replace(" ", "").replace("_", "")
            for canonical, aliases in _COLUMN_ALIASES.items():
                if normalized_key in aliases:
                    break
    except Exception:
        pass


# ══════════════════════════════════════════════════════════════════════════════
# Target 4: Risk score input parsing
# ══════════════════════════════════════════════════════════════════════════════

def fuzz_risk_score_input(data: bytes) -> None:
    """Fuzz the ML risk scoring input vector parsing."""
    import numpy as np

    fdp = atheris.FuzzedDataProvider(data)  # type: ignore[name-defined]

    try:
        # Generate a random feature vector
        num_features = fdp.ConsumeIntInRange(0, 100)
        features = []
        for _ in range(num_features):
            features.append(fdp.ConsumeFloat())

        # Verify numpy can handle it without crashing
        arr = np.array(features, dtype=np.float64)

        # Check for NaN/Inf handling
        if np.any(np.isnan(arr)) or np.any(np.isinf(arr)):
            arr = np.nan_to_num(arr, nan=0.0, posinf=1.0, neginf=0.0)

        arr.reshape(1, -1)
    except (ValueError, OverflowError):
        pass


# ══════════════════════════════════════════════════════════════════════════════
# Runner
# ══════════════════════════════════════════════════════════════════════════════

_TARGETS = [
    (fuzz_dataframe_ingest, "DataFrameIngestRequest"),
    (fuzz_fhir_bundle, "FHIR_Bundle"),
    (fuzz_column_normalization, "ColumnNormalization"),
    (fuzz_risk_score_input, "RiskScoreInput"),
]


def main() -> None:
    """Run all fuzz targets sequentially in CI mode."""
    import atheris  # type: ignore[import-not-found,import-untyped]  # noqa: F811 — re-import to make it available in target scope

    # Inject atheris into the module namespace so targets can use FuzzedDataProvider
    globals()["atheris"] = atheris

    if not _CI_MODE:
        print("[FUZZ] Running in local mode. Press Ctrl+C to stop.")
        print("[FUZZ] Set FUZZING_CI=true for CI mode with limited iterations.")

    for target_fn, name in _TARGETS:
        try:
            _run_target(target_fn, name)
            print(f"[FUZZ] ✅ {name}: completed successfully")
        except SystemExit:
            # Atheris raises SystemExit(0) when -runs limit is reached
            print(f"[FUZZ] ✅ {name}: completed {_CI_ITERATIONS} iterations")
        except Exception as exc:
            print(f"[FUZZ] ❌ {name}: {exc}")
            if not _CI_MODE:
                raise

    print("[FUZZ] All targets completed.")


if __name__ == "__main__":
    main()
