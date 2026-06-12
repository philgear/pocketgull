# PocketGull Investor Pitch Script & Q&A
*Confidential - Internal Use Only*

This document provides a slide-by-slide pitch narrative and strategic talking points for investor presentations.

---

## 1. Slide-by-Slide Narrative

### Slide 1: The Status Quo — "Clinician Burnout & EHR Friction"
* **Talking Points**: 
  - Doctors spend up to 40% of their day sitting in front of a screen typing charts. 
  - Traditional transcription tools only record what happened; they don't help the doctor think.
  - The result is fatigue, billing errors, and detached patient consultations.

### Slide 2: The Solution — "PocketGull: The First Active Consult Strategy Companion"
* **Talking Points**:
  - PocketGull is not just a passive listener. It's a real-time partner powered by Gemini.
  - It handles live, multimodal audio consults, generating clinical strategy options *during* the visit.
  - Instantly translates voice findings into FHIR R4 standard structures ready for EHR export.

### Slide 3: Live Visuals — "Patient Education in 3D"
* **Talking Points**:
  - We bring patient education alive. In functional medicine, explaining biomechanics is key to plan compliance.
  - PocketGull maps voice findings instantly to interactive Three.js 3D skeletal and anatomical models.
  - The patient leaves with a personalized visual care plan, boosting plan adherence.

### Slide 4: Clinical Safety & Compliance — "The Safety Net"
* **Talking Points**:
  - We build responsibly. PocketGull integrates the Karolinska Sleepiness Scale (KSS) gate.
  - If a clinician shows signs of extreme fatigue (based on shift logs or scale scores), the system raises safeguards.
  - All data is scrubbed client-side using HIPAA-compliant sanitization before processing.

---

## 2. Hard Q&A Battle Prep

### Q: "How does PocketGull prevent clinical hallucination?"
* **A**: PocketGull operates strictly as a care plan *drafting* and consult *reasoning* companion. The clinician remains the final signer. All output is mapped to structured inputs, with a dual-verification system comparing Gemini's results against local clinical templates.

### Q: "How do you handle HIPAA and patient privacy?"
* **A**: All client-side text is purified via DOMPurify. We support isolated sandbox environments where simulated patient profiles are fully disconnected from PHI, and we do not store raw audio recordings on external databases.
