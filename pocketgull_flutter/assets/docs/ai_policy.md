# 🛡️ Pocket Gull — Responsible AI Policy & Clinical Guardrails

> **Effective Date:** August 2026  
> **Target Systems:** Pocket Gull Angular Web Engine, Python FastAPI Sidecar, Flutter Mobile Suite  
> **Scope:** Google Gemini 2.5 Flash, ADK Live, BioBERT-Lite ONNX SLM, and On-Device Chrome Nano (`window.ai`)

---

## 1. Executive Summary & Purpose

Pocket Gull is designed as a **voice-first clinical co-pilot and real-time medical care plan strategy engine**. The platform operates under a strict **Human-in-the-Loop (HITL)** paradigm: AI recommendations are strictly advisory, serving to streamline clinical documentation, automate FHIR R4 interoperability, and synthesize multi-paradigm health data for licensed medical practitioners.

---

## 2. Core Safety & Ethical Principles

### 2.1 Human-in-the-Loop (HITL) Task Bracketing
- **Vetting Requirement**: All AI-generated diagnostic observations, care plan proposals, and SOAP notes must be explicitly reviewed and vetted by a licensed clinician before clinical execution.
- **Double-Click State Machine**: Interactive Task Bracketing in the UI requires clinicians to manually transition AI suggestions from `Unvetted` → `Approved` or `Rejected`.

### 2.2 HIPAA Safe Harbor & De-Identification Policy
- **Zero Remote Storage**: Patient session data resides in browser `localStorage` or device-local encrypted cache. No PII is stored on remote servers or used for LLM fine-tuning.
- **Automatic Sanitization**: All clinical payloads are sanitized using `DOMPurify` before being serialized into FHIR R4 Bundles or passed to LLM model contexts.
- **Demographic Archetypes**: Test and mock profiles strictly follow HIPAA §164.514 Safe Harbor standards or preserve historic scientific luminaries.

### 2.3 Multi-Tier Fallback & Edge Resilience
If network egress is lost or cloud models are unreachable, Pocket Gull gracefully degrades across a 3-tier fallback architecture:
1. **Tier 1 (Cloud Multimodal)**: Google Gemini 2.5 Flash & ADK Live streaming (sub-200ms audio/visual synthesis).
2. **Tier 2 (On-Device SLM / WebGPU)**: BioBERT-Lite ONNX SLM & Gemma 2 WebGPU execution for local SBAR report generation.
3. **Tier 3 (Client Rule Engine)**: Deterministic client-side rules engine generating baseline safety guardrails.

---

## 3. Governance, Evaluation & Security Fuzzing

- **Evaluation Harness**: Automated testing via `eval_agent.py` and `evaluate_model.py` continually benchmark diagnostic accuracy against standardized clinical datasets.
- **Adversarial Fuzzing**: Continuous execution of `fuzz_targets.py` tests LLM prompt boundaries against prompt injection, jailbreak attempts, and corrupted telemetry payloads.
- **No Non-Deterministic Hallucinations**: Clinical guidelines, botanical TCM formulas, and lab range boundaries are validated against grounded medical codices (LOINC, SNOMED CT, FHIR R4).

---

## 4. Operational Boundaries

> [!IMPORTANT]
> **Clinical Disclaimer**: Pocket Gull is an intelligent clinical productivity and documentation platform, not a standalone diagnostic medical device. It does not replace independent clinical judgment, emergency triage protocols, or direct physical examination by a qualified healthcare professional.
