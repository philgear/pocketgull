# Security Policy

At **Pocket Gull**, security and privacy are foundational, especially given the clinical context of the application. We take vulnerabilities and data handling extremely seriously.

## Supported Versions

Only the latest `main` branch and currently deployed production versions receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Pocket Gull, please do **not** disclose it publicly. Instead, use one of the following private channels:

1.  **GitHub Private Vulnerability Reporting**: [Report a vulnerability](https://github.com/philgear/pocketgull/security/advisories/new) (preferred).
2.  **Email**: Send details to **dpo@pocketgull.app**.

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

### 5. GitHub Code Security & Google Cloud Integration
To align with HIPAA compliance and secure clinical engineering, we integrate GitHub Advanced Security (GHAS) settings in tandem with our Google Cloud Platform (GCP) setup:
- **Keyless Authentication & Secrets**: Do not store long-lived GCP Service Account JSON keys in GitHub Secrets. We authenticate strictly using keyless **Workload Identity Federation (WIF)** in our CI/CD pipelines. Application secrets (such as the `GEMINI_API_KEY`) are stored securely in **GCP Secret Manager** and bound dynamically to Cloud Run containers at runtime.
- **Push Protection**: Enforce GitHub's *Secret Scanning Push Protection* to intercept and block commits containing leaked GCP credentials or API keys before they reach the repository.
- **Continuous Container Scanning**: Dependabot alerts are utilized for early static workspace package warnings. However, the source of truth for runtime safety is **GCP Artifact Registry Container Analysis**, which performs continuous automated CVE scanning on the compiled container layers.
- **Unified Compliance Dashboard**: For production deployments, CodeQL static analysis alerts are connected to **GCP Security Command Center (SCC)** via security source integrations, presenting a unified dashboard for infrastructure, cloud compliance, and source code health.

---

## Clinical Engineering & Risk Management Guidelines

To manage the long-term lifecycle and infrastructure safety of Understory, we adhere to the following core software engineering and operational risk practices:

### 1. "Shift-Left" Risk Detection
Google’s engineering practices emphasize "Shifting Left" to identify security risks and bugs as early as possible.
- **Automated CI Scanning**: Fully integrate CodeQL code scanning and Dependabot into our GitHub Actions / CI pipeline.
- **Pre-Deployment Auditing**: Automate vulnerability checks in the Angular frontend and Express.js backend before any container deployment to Google Cloud Run.

### 2. Architect for Failure in Compute Services
Because the application runs on serverless Google Cloud Run (Compute as a Service), instances are transient and can crash or restart unexpectedly.
- **Zero Remote Database Dependency**: Data risk is minimized by relying on local browser persistence and exporting patient records as FHIR bundles rather than using a centralized database.
- **Resilient AI Interchanges**: Future roadmaps include automated Disaster Recovery and Chaos Engineering tests to ensure the UI gracefully handles dropped, throttled, or timed-out inference requests to the Google Gemini API.

### 3. Dependency Compatibility & Risk Management
Modern web applications rely heavily on a complex web of packages (e.g., Angular v21.1, Three.js, Tailwind CSS, and Google GenAI SDK).
- **Stability Over "Live at Head"**: To safeguard clinical workflows from unexpected regressions, we actively track the "Compatibility Promises" of upstream frameworks and pin critical packages rather than automatically updating to the latest head.

### 4. Mitigating the "Bus Factor"
The "Bus Factor" represents the project risk of having sole maintainers on critical systems (e.g., NIH PubMed E-utilities XML parsing, Express backend proxies, AI orchestration, and 3D anatomical body mapping).
- **Canonical Sources of Information**: Maintain rigorous, central documentation in the repository (such as this `SECURITY.md` policy).
- **Standardized Code Reviews**: Enforce pull-request reviews on orchestrators and rendering pipelines to ensure codebase familiarity is shared across contributors.

---

Thank you for helping us keep the clinical ocean safe and secure.
