# PocketGull Competitor Battlecard
*Confidential - Internal Use Only*

This document provides a competitive teardown of ambient AI medical scribes and maps out PocketGull's product differentiation and sales strategies.

---

## 1. Competitor Landscape

### A. Abridge / Nabla Copilot
* **Overview**: Market leaders in passive ambient clinical transcription. They listen to the consultation and generate structured summaries after the encounter finishes.
* **Funding/Scale**: Series B/C scale. Deeply integrated into major institutional EHR systems (Epic, Cerner).
* **Limitations**: 
  - **Passive Only**: Do not offer real-time consultative reasoning or live multimodal interaction.
  - **No Patient-Facing Engagement**: No visual aids or patient-education interfaces.
  - **High Enterprise Friction**: Long integration cycles, not optimized for individual functional medicine clinics.
* **Our Counter-Strategy**: Position PocketGull as an **Active Consult Strategy Companion**. Demonstrate our real-time voice consult features and interactive 3D Three.js patient education tools.

### B. Heidi Health / Freed AI
* **Overview**: Self-serve AI scribes targeting solo practitioners and small-to-medium clinics.
* **Limitations**:
  - Rely on standard transcription APIs with significant post-processing lag.
  - Minimal integration with standard FHIR structures (mostly copy-paste text generators).
  - Lack safety protocols like alertness check gates (KSS).
* **Our Counter-Strategy**: Highlight PocketGull's instant FHIR R4 Bundle generation, HIPAA-compliant client-side sanitization, and built-in clinician fatigue metrics.

---

## 2. PocketGull's Secret Weapons (Win Themes)

1. **Multimodal Live Consultations**:
   * *The Gap*: Competitors require you to finish speaking, click "done", and wait for a transcript block.
   * *Our Solution*: Powered by Gemini Multimodal Live, PocketGull analyzes vocal tone and clinical reasoning dynamically as the consult occurs, acting as a real-time sounding board.
2. **Clinical Safety Safeguards (Fatigue Checks)**:
   * *The Gap*: Burned-out clinicians are prone to missing clinical nuances when validating AI outputs.
   * *Our Solution*: Integrating the Karolinska Sleepiness Scale (KSS) gate and circadian tracking ensures that the co-pilot acts as an active safety net during high-fatigue hours.
3. **Interactive Visual Education (Three.js)**:
   * *The Gap*: AI summaries are sent to a portal as wall-of-text instructions that patients rarely read.
   * *Our Solution*: Instant procedural rendering of 3D skeletal/anatomical models. The practitioner can visually map physiological systems in real-time, boosting patient trust and plan adherence.
4. **EHR-Neutral Data Portability (FHIR R4)**:
   * *The Gap*: Lock-in to proprietary portals.
   * *Our Solution*: Standardized, structured FHIR R4 exports out of the box, allowing simple mapping to any database.
