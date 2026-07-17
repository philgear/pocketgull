# Privacy Policy

At **Pocket Gull**, clinical privacy and data security are our highest priorities. This policy outlines how patient data is handled, processed, and protected.

---

## 1. Local-First Persistence (No Remote Database)
We do not persist Patient Health Information (PHI) or Personally Identifiable Information (PII) to any remote database. All patient data, vitals, history details, and clinical reports reside strictly in your browser's local storage or IndexedDB. Clearing browser storage will delete all active records.

## 2. Ephemeral AI Transit Processing
To provide clinical consults, intake summaries, and care plan strategies, transient patient details are processed via the Google Gemini API or Vertex AI Enterprise endpoints:
*   All data transmitted to API endpoints is ephemeral.
*   Data is processed strictly in transit and is **never** used to train, optimize, or refine foundation models.
*   We utilize safety settings to intercept and filter out inappropriate content.

## 3. Zero Third-Party Telemetry
We do not utilize third-party analytics trackers, cookies, or telemetry tools. Your patient list, clinical interactions, and diagnosis sessions are completely isolated and private.

---

## 4. Contact Information
For privacy questions, audits, or feedback, contact **dpo@pocketgull.app**.
