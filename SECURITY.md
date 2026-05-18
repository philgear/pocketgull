# Security Policy

At **Pocket Gull**, security and privacy are foundational, especially given the clinical context of the application. We take vulnerabilities and data handling extremely seriously.

## Supported Versions

Only the latest `main` branch and currently deployed production versions receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Pocket Gull, please do not disclose it publicly. Instead, contact the repository owner/lead developer directly via the channels provided in the developer profile or through private GitHub vulnerability reporting.

We will review the submission within 48 hours and work with you to patch the vulnerability safely before public disclosure.

---

## Architecture & Security Best Practices

As a clinical co-pilot, Pocket Gull operates under strict security and data-handling best practices to ensure patient safety and data integrity.

### 1. Transient Data & No PHI Persistence
- **No Remote Database**: Pocket Gull does **not** persist Protected Health Information (PHI) to any centralized database.
- **Local Storage**: All patient state is stored locally within the browser (`localStorage` or IndexedDB) and is strictly constrained to the clinician's current device profile.
- **Transient Inference**: Payloads sent to the Google Gemini API or other external AI inference engines are ephemeral. We strictly rely on enterprise or opt-out tiers to ensure data is **not** used to train foundation models.

### 2. Generative AI Safeguards (Google Responsible AI)
- **Safety Filters**: All interactions with Genkit and the Gemini API use strict `safetySettings` bounded to `BLOCK_MEDIUM_AND_ABOVE`. This actively filters out hate speech, dangerous content (e.g., weapon synthesis instructions), and harassment.
- **Adversarial Testing**: The repository contains active adversarial test suites (`tests/safety.spec.ts`) to simulate prompt injection and ensure safety layers do not degrade.
- **Human-in-the-Loop**: The architecture enforces manual clinician vetting ("Task Bracketing") before any AI suggestion can be saved or executed.

### 3. Application Security (AppSec)
- **Content Security Policy (CSP)**: Strict CSP headers are configured to prevent XSS (Cross-Site Scripting) and unauthorized data exfiltration.
- **Sandboxing**: External research surfaces (such as the Google Programmable Search Frame) are executed within heavily restricted `<iframe>` sandboxes (`sandbox="allow-scripts allow-same-origin"`).
- **Dependency Auditing**: Critical dependencies (Vite, Genkit, Angular) are subject to automated vulnerability tracking. Transient vulnerabilities must be overridden explicitly via `package.json` resolutions.

### 4. Development Environment
- **Secrets Management**: API keys (e.g., `GEMINI_API_KEY`) must never be committed to version control. They are injected strictly via Google Cloud Secret Manager at runtime or via local `.env` files.
- **No Unsigned Binaries**: The build pipeline only permits verified and audited Node modules.

Thank you for helping us keep the clinical ocean safe and secure.
