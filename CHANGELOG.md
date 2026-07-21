# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-rc11] - 2026-07-21

**Neuro-Consciousness & Mood Optimization Matrix, Care Plan Print Studio, Mobile QR Code Engine & Emergency Bypass Triage**

### Added
- **[Mind-State / AVS] Neuro-Consciousness & Mood Optimization Matrix (`mood-consciousness-matrix.component.ts`)**: Multimodal mind-state calibration engine organizing interventions into 5 states of consciousness (`⚡ Hyper-Focus & Flow`, `🧘 Meditative Calm`, `🌙 Deep Rest & Sleep`, `🎨 Creative Reverie`, `🛡️ Anxiolytic Grounding`). Single-click state prescriptions synchronize AVS brainwave frequencies (Gamma, Alpha, Theta, Delta), vagal breathing cadences (4–6 BPM), botanical micro-doses, and Gemini bi-directional voice consultation modes.
- **[Print / Export] Care Plan Print Studio & Document Carousel (`care-plan-print-preview.component.ts` & `export.service.ts`)**: Replaced raw code/FHIR dumps with a compact inline note editor and an interactive 4-page print thumbnail carousel with live page previews. Supports section toggle switches (`Vitals`, `Side-by-Side Comparison`, `AVS Protocols`, `Chrono-Nutrition`, `GCN Genomics`) and renders a 3-column side-by-side comparative table (`🔵 Western Allopathic` vs `🟢 Eastern TCM` vs `🟡 Ayurvedic Medicine`) in printed PDFs.
- **[Mobile / QR] Mobile Menu QR Code Engine & Smartphone View (`mobile-menu-qr-modal.component.ts`)**: Encodes patient clinical parameters into a high-contrast QR Code matrix for mobile camera scanning. Features an interactive smartphone mockup with 1-tap meal prescriptions for on-the-fly patient exploration.
- **[Emergency / Telemetry] Emergency Bypass Rapid Nutritional Triage (`emergency-nutritional-bypass.component.ts`)**: Real-time osmotic hydration and botanical triage recommendations calculated from vitals readouts ($\text{BP} \ge 130/80$, $\text{HR} \ge 85$, $\text{SpO}_2 < 95\%$), active conditions, and live GPS location telemetry (e.g. Oregon Pacific Coast Buoy 46050) with 1-click triage logging.
- **[UI / Visualization] Living Patient Health Fruit Tree (`patient-fruit-tree.component.ts`)**: Interactive visual clinical metaphor rendering patient health as a living procedural fruit tree on the **Summary Overview** screen. Renders soil roots for preexisting conditions (*Type 2 Diabetes*, *Hypertension*), major clinical domain boughs, procedural fruit nodes (`🍎 Blood Pressure`, `🫐 Glycemic HbA1c`, `🍋 Vagal HRV`, `🍊 CYP2D6 Clearance`), and live ripeness growth ($0\% \to 100\%$) tied to patient note additions.
- **[Clinical / Research] Lens Innovation Shield & Insight Sparks Engine (`lens-insight-spark-shield.component.ts`)**: Lens-tailored protection engine and translational research hypothesis generator. Dynamically renders active lens shields and provides an interactive drill-down modal proposing cutting-edge clinical research sparks (*0.1 Hz Vagal Breathing & Telomere Epigenetics*, *Chrono-Nutrition & GLUT4 Clearance*, *Anthocyanin Glymphatic Clearance*) with 1-click PubMed launches.
- **[Docs] Feature & Architecture Documentation Update**: Updated `docs/study/src/pages/features.mdx` and `docs/study/src/pages/clinical-paradigms.mdx` to reflect all 4 new clinical systems and the Multimodal Side-by-Side Philosophy Comparison framework.



## [1.0.0-rc10] - 2026-07-21


**PhysioNet Electrophysiology Lens, 7-Sec Origami Unfolding Animation, Brand Icon Standardization & Pacific Coast Viewport**

### Added
- **[Clinical / Telemetry] PhysioNet 2026 Digital Signal & Electrophysiology Lens (`📡 PhysioNet Waveforms`)**: Added a 7th clinical lens in `clinical-intelligence.service.ts`, `analysis-report.component.ts`, `clinical-prompts.ts`, and `demo-data.ts`. Ingests high-frequency EDF/PhysioNet waveform metrics: QRS interval duration (92 ms), neutral ST-segment deviation (+0.04 mV), Fridericia QTc prolongation risk (418 ms), and HRV spectral power density (LF/HF ratio 1.08).
- **[UI / Animation] 7-Second Origami Unfolding & Glowing Papercraft Heart**: Added a 7-second traditional origami unfolding animation sequence to `secure-splash.component.ts` featuring staggered paper crease rotations and a glowing papercraft heart emergence with radiant warm aura at the 4.5s mark.
- **[Design / Branding] Signature Origami Seagull Icon Standardization**: Standardized the signature origami seagull logo in full brand color palette (Teal `#3ebc9e`, Coral `#ef6658`, White paper `#ffffff`, Amber beak `#faa63b`) across `index.html` favicons, Docs portal (`DocsLayout.astro`), guided walkthrough tour modal (`walkthrough-tour.component.ts`), and PDF stationery letterheads (`export.service.ts`).
- **[UI / UX] Pacific Coast 56% Sandy Beach & Breezy Sand Gusts**: Re-proportioned splash dune height to 56%, bound daily SVG beach gesture guides (`todayBeachItem().svgGuide`) using `DomSanitizer.bypassSecurityTrustHtml()`, added horizontal sand particle gust animations (`@keyframes breezy-sand`), and mimicked local time-of-day sky gradients.
- **[UI / UX] Walkthrough Tour Real-time Window Scroll & Spotlight Tracking**: Added passive `scroll` event listeners to `window` and multi-frame post-scroll re-measurements (`150ms`, `400ms`) in `walkthrough-tour.component.ts` to ensure spotlight masks remain anchored accurately during smooth scroll transitions.
- **[Audio] Default Muted Audio Entrainment**: Removed automatic AVS soundscape autostart triggers from splash drawing gestures to ensure audio is strictly off by default until explicitly toggled.
- **[Security / Repo] Trained Model & Physio Dataset Git Exclusions**: Added PhysioNet dataset formats (`*.edf`, `*.mat`, `*.dat`, `*.hea`, `*.atr`, `*.rec`) and trained model weights (`*.onnx`, `*.safetensors`, `*.pt`, `*.pth`, `*.pkl`, `*.joblib`, `*.h5`, `*.ckpt`) to `.gitignore` and `.gcloudignore`.

## [1.0.0-rc9] - 2026-07-21

**3D Anatomical Search, Viewport-Contextual CMP Telemetry, Global Multilingual Research Alignment & FHIR 7 Architecture**

### Added
- **[3D Anatomy / UI] Anatomical Search & Auto-Camera Tracking**: Top-left search bar with quick system filter pills (`Head/Neuro`, `Organs`, `Limbs/Spine`). Selecting search results triggers smooth `focusOnPart(id)` camera target interpolation onto 3D organ meshes.
- **[Clinical / Telemetry] Viewport-Contextual CMP Lab Panels**: Isolated organ-specific metabolic panels (`ICmpLabs`: Troponin, ALT/AST, eGFR, Creatinine, Fasting Glucose) and one-tap symptom shortcuts tailored to the currently targeted organ system.
- **[Docs / Architecture] HL7 FHIR Evolution Strategy (R4 → R5 → R6 → FHIR 7)**: Comprehensive roadmap for event-driven telemetry (FHIR R5 `SubscriptionTopic`), AI inference provenance (FHIR R6 `DeviceMetric`), and multi-agent AI co-pilot traces with zero-copy federated graphs (FHIR 7).
- **[Internationalization] Global Clinical & Research Language Alignment**: Realigned care plan exports to focus on global medical research exchanges (**Spanish, German, French, Japanese, Hindi**). Replaced Mandarin button and provider types across all AI engines.

## [1.0.0-rc8] - 2026-07-16

**Dynamic Mock Assessments & Fallback Roster Synchronization**

### Added
- **[Demo Mode] Dynamic Mock Clinical Assessments**: Tailored mock clinical western, TCM, and Ayurvedic reports dynamically to demographics, vitals, issues, and goals.
- **[Demo Mode] Fallback Mock Patient Synchronization**: Unified the frontend `MOCK_PATIENTS` fallback list with the backend `data/patients.json` database, ensuring William Henderson and all other patients load with complete clinical profiles offline or during database seeding.
- **[UI / UX] Double-Click Task Bracketing**: Cyclic validation state machine (`Normal` -> `Added` -> `Removed` -> `Normal`) implemented on care plan summary nodes with immediate visual highlighting (green checkmarks for approved, red crosses for excluded).
- **[Sentinel Integration] Active Roster Outbreak Highlighting**: High-priority amber outlines, custom Initials Avatar overrides, and dedicated `🔦 Sentinel` tags added for outbreak/epidemiological threat patient profiles.
- **[Sentinel Integration] Split-Screen Cost-Benefit Matrix**: Introduced a dynamic split-screen containment paradigm (`👤 Individual Health` vs `🔦 Community Containment`) for Sentinel patients, allowing a clean contrast of individual treatments against quarantine and prophylaxis strategies.
- **[Demo Mode] Chat Mock Fallbacks**: Local intercept of voice/text consult queries when in Demo Mode to return high-fidelity mock clinical responses and resolve API key authentication failures.
- **[Theme & UI] Theme Query Parameter**: Added `?theme=` URL query parameter check on app startup (e.g., `?theme=dark`) to facilitate automation audits, E2E testing, and direct theme linking in `src/services/theme.service.ts`.
- **[CI/CD] Security Audit Artifacts**: Configured the GitHub Actions workflow to export NPM audit results to a JSON file and upload them as workflow artifacts instead of letting minor warnings fail build runs.

### Changed
- **[Typography] App-Wide 12px Font Normalization**: Normalised all templates and styles globally, replacing all sub-12px typography overrides (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`) with a minimum of `text-[12px]` across 29 component files.
- **[UI / Print] High-Fidelity Print Exports**: Enhanced print CSS (`@media print`) using `print-color-adjust: exact !important` to force the preservation of clinical branding colors, highlights, and borders.

### Changed
- **[Infrastructure] Unified Cloud Region & Spec**: Shifted the default deploy target region in deploy scripts to `us-central1` and optimized server resources to 2 CPU / 2Gi memory configuration with min 0 and max 2 instances.
- **[Build] Docker Multi-Stage Optimization**: Enhanced `Dockerfile` caching by copying workspace `package.json` files prior to dependency installation, and secured the final step by adding `--ignore-scripts` to production installation.
- **[Security] Content Security Policy (CSP) Updates**: Whitelisted `raw.githubusercontent.com` in CSP `connect-src` headers for both dev and production Node/Express servers.

### Fixed
- **[UI / Layout] Panel Resizer Snapping Resiliency**: Guarded resizer snap calculation in `src/app.component.ts` against undefined container widths to improve component stability.
- **[Clinical Intelligence] Intake Form Key Alignment**: Synced `src/components/intake-form.component.ts` to query `Summary Overview` instead of `Care Plan Overview` to resolve mismatch in generated medical care reports.
- **[Types] Markdown Parser Types**: Added explicit types for markdown parser token loops in `src/components/analysis-report.component.ts` to enforce strict type checking and avoid type compiler failures.
- **[Types] Monorepo IDE Type Resolution**: Restricted implicit type-loading in `pocketgull_api/tsconfig.json` to `["node"]` to resolve implicit monorepo type resolution warnings/errors in the IDE.
- **[Testing] Patient App Widget Test Mocking**: Wrapped `patient_app` widget tests in `http.runWithClient` with a mock server and switched from `pumpAndSettle` to `pump` to bypass infinite seagull flight animation timeouts.

---

## [1.0.0-rc7] - 2026-06-28

**Companion App Lint Hardening & Mocked Widget Test Suite**

### Fixed
- **[Linter] Unnecessary Underscores (provider_dashboard.dart)**: Fixed unnecessary multiple underscores (`__`) in `separatorBuilder` for `ListView.separated` to satisfy the `unnecessary_underscores` lint rule.

### Added
- **[Testing] Mocked Widget Test Suite (provider_app)**: Replaced the boilerplate counter widget test with a fully mocked, robust integration test in `widget_test.dart` using `package:http/testing` and `http.runWithClient` to mock API responses and verify patient directory loading and detail screen navigation.

### Changed
- **[Safety] Safety Threshold Hardening**: Upgraded safety settings filters in `src/server.ts`, `src/server/genkit.ts`, and `src/services/verify-ai.service.ts` from `BLOCK_MEDIUM_AND_ABOVE` to `BLOCK_LOW_AND_ABOVE` across harassment, hate speech, sexual content, and dangerous content categories, enforcing the highest safety standard for clinical apps.

### Fixed
- **[CodeQL] SSRF Critical × 5 (dicom.ts)**: Added `sanitiseDicomParam()` (allowlist: `[a-zA-Z0-9._-]`) and `validateDicomUid()` (digits and dots only, per DICOM standard) helpers. All five route handlers (`/studies`, `/rendered`, `/store`, `/raw`, `/delete`) now sanitise every user-provided query param before URL construction — no raw `req.query` value reaches `fetch()`.
- **[CodeQL] SSRF (server.ts)**: Sanitised `projectId` + `location` Vertex AI URL construction with char-allowlist regex; `rawModel` is strictly allowlisted via `normalizeAndValidateModel()`.
- **[CodeQL] Missing Rate Limiting × 4 (server.ts)**: Replaced custom in-memory `rateLimiter()` with `express-rate-limit`'s `rateLimit()` on all flagged routes (`GET/POST /api/patients`, `PUT /api/patients/:id`, `/docs/study`).
- **[CodeQL] Path Traversal × 2 (server.ts `/docs/study`)**: Removed custom `resolve()`-based path handler entirely. `/docs/study` now served exclusively via `express.static(studyDocsRoot)` — no user-controlled value reaches any file path computation.
- **[CodeQL] Clear-Text Logging (phi_compliance_scanner.py)**: Discarded the tainted tuple element with `_` and removed it from the `print()` format string entirely. Only violation type, file path, line number, and description are logged — no regex match data reaches any log sink.
- **[Pre-emptive] Rate Limiting on DICOM + Healthcare Routers**: Applied `express-rate-limit` to all routes in `dicom.ts` (60 req/min) and `healthcare.ts` (30 req/min) before CodeQL flags them in a subsequent scan.

## [1.0.0-rc5] - 2026-06-14

### Added
- **`angular.json` CommonJS Allowlist**: Added `@google-cloud/vertexai` and `@google-cloud/vertexai/build/src/resources/index.js` to `allowedCommonJsDependencies` to suppress recurring build-time optimization warnings from `@genkit-ai/vertexai`.

### Changed
- **Documentation Sync**: Rewrote `README.md` with categorized features (Security, AI, Clinical UX, Data), updated architecture diagram to show Vertex AI Enterprise and WebSocket proxy, corrected `pocketgall.app` URL typo, and synced all `docs/study/` MDX pages (`architecture.mdx`, `features.mdx`, `changelog.mdx`) with the rc4 state.
- **`DESIGN.md` Squadron Expansion**: Added three new Gull Squadron personas — `Stratosphere` (Vertex AI Enterprise layer), `Relay` (WebSocket live proxy), and `Samaritan` (Good Samaritan emergency care mode).
- **`angular.json` Host Cleanup**: Removed three stale Cloud Run hostnames (`pocket-gall-444980566010`, `understory-315235665910`, `pocket-gall-315235665910`) from `allowedHosts`.

### Fixed
- **`qs` Security Patch**: Pinned `qs` transitive dependency to `>=6.15.2` via `package.json` overrides, patching GHSA-q8mj-m7cp-5q26 (DoS via `qs.stringify` on null entries in comma-format arrays).
- **`package.json` Version**: Bumped from `0.10.0` to `1.0.0-rc4` to align with CHANGELOG release state.

---

## [1.0.0-rc4] - 2026-06-14

### Added
- **[2026-06-14] Vertex AI Enterprise Migration**: Upgraded the AI intelligence layer from the developer Gemini API to regional Google Cloud Vertex AI Enterprise, implementing automatic Google Application Default Credentials (ADC) token resolution, regional endpoints, and custom safety thresholds.
- **[2026-06-14] Bidirectional WebSocket Live Proxy**: Implemented a secure WebSocket proxy route (`/ws/gemini-live`) featuring recursive camelCase to snake_case translations and setup model resource path rewrites to support full-duplex live audio streaming over Vertex AI.
- **[2026-06-14] Lightweight API Rate Limiting**: Built a custom, in-memory IP-based rate limiter middleware (`rateLimiter`) to mitigate denial-of-service and resource exhaustion on file-accessing routes.

### Changed
- **[2026-06-14] Improved Custom Search Engine**: Updated the Google Custom/Programmable Search Engine (CSE) script config in `search.html` to load a new instance (`648e5d0ad53ae49a6`) providing wider clinical and medical school domain indexing.

### Security / Fixed
- **[2026-06-14] CodeQL SSRF Remediation**: Patched Server-Side Request Forgery vulnerabilities in stream/chat endpoints by adding strict model selection validation (`normalizeAndValidateModel`).
- **[2026-06-14] CodeQL Path Traversal Protection**: Guarded the study docs static router against directory escape by using `path.resolve` and strict parent-directory containment verification.
- **[2026-06-14] CodeQL Clear-Text Logging Fix**: Redacted matching secrets and PII values in `phi_compliance_scanner.py` console logs to prevent exposure in CI workflows.

## [1.0.0-rc3] - 2026-06-08

### Added
- **[2026-06-08] Porkbun DNS Automation**: Integrated automated Porkbun API sync helper (`scripts/update-porkbun-dns.js`) to handle lifecycle mapping of the live Cloud Run custom domains (`pocketgull.app` and subdomains).
- **[2026-06-08] Scaling & Valuation Architectural Blueprints**: Added complete operational manuals and diagrams for hospital-grade deployment (`docs/valuation_and_positioning.md` and `docs/study/src/pages/positioning.mdx`), detailing BigQuery telemetry partitioning/clustering strategies, Vertex AI context caching/cost management, and OpenEMR/OpenMRS FHIR database bridging.
- **[2026-06-08] Custom JSON Security Auditing CLI**: Built `scripts/security-audit.mjs` to automatically verify sub-dependency vulnerability status during build/CI checkpoints.

### Fixed
- **[2026-06-08] Windows Unicode Pre-Commit Compatibility**: Modified `scripts/phi_compliance_scanner.py` to suppress non-ASCII console emojis, resolving execution and file check crashes on Windows environments using default CP1252 shell encodings.
- **[2026-06-08] Doc Path Resolution**: Corrected file path references in husky pre-commit check tasks (`scripts/pre-commit-check.cjs`).

### Security
- **[2026-06-08] Sub-Project Dependency Remediation**: Resolved 11 medium/high risk vulnerabilities in `pocketgull_api` sub-project lockfile, applying strict version overrides for `uuid` and `protobufjs`.

## [1.0.0-rc2] - 2026-05-22

### Added
- **[2026-05-22] Client-Side Speech & Interruption Barge-in**: Implemented local `onspeechstart` barge-in interruption tuning across the clinical dialog and main voice assistant panels, allowing instant audio muting and queue clearing when the clinician begins speaking or typing.
- **[2026-05-22] Real-Time Voice Consult**: Integrated the `AdkLiveService` directly into the focused recommendations/claims dialog (`NodeAgentDialogComponent`) with amplitude-responsive recording visualizers, local Speech-to-Text feedback, and graceful lifecycle teardowns.
- **[2026-05-22] Multi-Paradigm Philosophy Dashboards**: Added full system support for selecting Western, Eastern, Ayurvedic, or "Grow Thy Self" longevity medicine paradigms. Includes automated report regeneration and a secular translation engine mapping 13 world philosophies into psychological and physiological domains.
- **[2026-05-22] Good Samaritan Emergency Care**: Engineered an offline emergency override mode featuring a 110 BPM chest-compression metronome, basic life support (BLS) safety-gated Gemini Nano local routing (`window.ai`), local FHIR-compliant EMT QR code serialization (`lean-qr`), and global telemetry (OTel) suppression.
- **[2026-05-22] Draw-to-Unlock Secure Gateway**: Replaced the legacy numeric PIN code screen with a premium Canvas drawing pad verifying a smiley face gesture pattern, with multi-stroke verification windows and an invisible E2E test bypass hook.
- **[2026-05-22] Shift-Left Pre-Commit hook**: Introduced a husky pre-commit pipeline that checks TypeScript types, runs Vitest unit tests, scans markdown image file references, and blocks staged commits containing credential or API key leaks.
- **[2026-05-22] Multi-Vendor GPU Telemetry**: Implemented Windows CIM/WMI adapters querying AMD/Intel/NVIDIA graphics, macOS system profiles, unified memory estimation, and dynamic WebGPU routing recommendations.

## [0.10.0] - 2026-05-20

### Added
- **[2026-05-20] Secure Delegation Access Codes**: Replaced the public patient dropdown menu in the companion `patient_app` with a secure access code text field, preventing HIPAA/privacy exposure of the patient directory.
- **[2026-05-20] Practitioner Delegation Display**: Added a dedicated `DELEGATION CODE` label on the provider's `patient_detail_screen` so practitioners can securely communicate delegation credentials to patients.
- **[2026-05-20] Gesture-Based Clinical Unlock**: Designed and implemented a canvas-based draw-unlock mechanism using a gesture recognizer (smiley face template matching) to replace legacy PIN code fields with an elegant gesture gateway on the Secure Splash screen.
- **[2026-05-20] Expanded Animal Comfort Protocols**: Integrated additional high-fidelity auditory protocols for Orca Whales/Dolphins, Parrots/Crows, and Peregrine Falcons, along with dedicated custom SVG visual icons, custom binaural pulse sweeps, and responsive clinical warnings.

### Fixed
- **[2026-05-20] CommonJS Build Warnings**: Configured `angular.json` to allow CommonJS sub-dependencies of `@google-cloud/bigquery` (`@google-cloud/common`, `@google-cloud/paginator`, `@google-cloud/promisify`, `@google-cloud/precise-date`, `big.js`, `extend`, `stream-events`, and `duplexify`), eliminating build-time optimization warnings.
- **[2026-05-20] Contrast and Contrast Accessibility Specificity**: Strengthened light-mode text readability and color contrast metrics, removed visual text shadows, and stabilized post-animation text styling to fully comply with WCAG AA guidelines.
- **[2026-05-20] CSS String Escape Warning**: Corrected unescaped slash characters within CSS selectors inside the component template string to resolve the Angular compiler syntax warnings.

## [1.0.0-rc1] - 2026-05-19

### Added
- **[2026-05-19] Security Hardening & MFA Gateways**: Added robust Firebase Google Login flow configurations including domain whitelists and multi-factor authentication (MFA) parameters.
- **[2026-05-19] Tink Envelope Cryptography & PQC**: Integrated Google Tink AEAD cryptographic envelopment for local patient records and added Quantum-Safe Cryptography Kyber/Dilithium transport protocol fallbacks for HIPAA transit compliance.
- **[2026-05-19] WebMCP Schema Mapping**: Registered WebMCP (Model Context Protocol) standards schemas to allow seamless integrations of external clinical knowledge databases.
- **[2026-05-19] 3D Anatomical Extensions**: Enabled pluggable mesh loaders (GLTF, USDZ, OBJ) on the Three.js viewport for customized skeletal modeling.
- **[2026-05-19] Multi-Cloud Enterprise Connectors**: Documented and verified identity sync wrappers for Windows Active Directory (AD FS) and envelope encryption bridges for AWS KMS.
- **[2026-05-19] Sentinel Gamification & Cognitive Triage**: Integrated a clinician alertness and fatigue-tracking dashboard to monitor practitioner cognitive load in high-stress triage environments.

## [0.9.0] - 2026-05-18

### Added
- **[2026-05-18] Multilingual & Pediatric Care Plans**: Expanded the `translateReadingLevel` infrastructure across all providers to support Spanish, German, French, Mandarin, Dyslexia, and Pediatric formats.
- **[2026-05-18] Security & Red Teaming Framework**: Implemented `SECURITY.md` and a Vitest automated red-teaming suite (`tests/safety.spec.ts`) to actively verify Gemini `BLOCK_MEDIUM_AND_ABOVE` safety boundaries.
- **[2026-05-18] Transparency Metadata**: Added `humans.txt`, `robots.txt`, `llms.txt`, and `sources.txt` to the public directory for AI indexing and human attribution.
- **[2026-05-18] Cloud Build Integration**: Created `cloudbuild.yaml` to automate Docker builds and Google Cloud Run deployment pipelines.
- **[2026-05-18] Advanced Clinical Mock Data**: Expanded `MOCK_PATIENTS` with updated 2026 timestamps, Orthomolecular Biomarkers, and dedicated Pediatric and Multilingual test profiles.
- **[2026-05-18] Animal Comfort Protocols**: Engineered a Web Audio API synthesizer (`PetAuditoryService`) within the Care Plan Export module to generate species-specific soothing frequencies (Feline Purr at 25Hz, Canine Heartbeat at 60 BPM) for pets left home during hospitalizations.

## [0.8.0] - 2026-05-18

### Added
- **[2026-05-18] Multi-Layer Hemi-Sync Audio Engine**: Upgraded `GlobalAvsService` to a high-fidelity 4-oscillator engine supporting phase-locked frequency entrainment and a clinical-grade Pink Noise synthesizer.
- **[2026-05-18] Athletic Enhancement AVS**: Implemented `AthleticProtocolService` and UI toggles to provide specialized AVS protocols (Priming, Flow, Recovery, Phase-Shift) for athletic performance and recovery.
- **[2026-05-18] Real-Time DSP Pipeline**: Fleshed out the FastAPI sidecar to process real-time HDF5 ECG streams using SciPy to extract HRV (RMSSD) and respiratory frequency metrics.
- **[2026-05-18] Philips Hue Local Relay Proxy**: Added a local `hue-relay.js` Node proxy to resolve HTTPS mixed-content restrictions when the PWA communicates with local Philips Hue hubs.

## [0.7.0] - 2026-05-17

### Added
- **[2026-05-17] Circadian UI & AVS Coregulation**: Replaced static UI themes with a continuous, hardware-accelerated circadian CSS variable system (`CircadianSleepinessService`) that smoothly transitions ambient UI colors based on the time of day.
- **[2026-05-17] KSS Readiness Gateway**: Integrated the 9-point Karolinska Sleepiness Scale (KSS) into the secure splash screen, allowing manual readiness overrides of the circadian theme.
- **[2026-05-17] DOC Stimulation Protocols**: Implemented `DocProtocolService` to provide structured auditory and vibroacoustic stimulation guidelines for Disorders of Consciousness (Coma, VS/UWS, MCS).
- **[2026-05-17] PWA Gemini Nano Integration**: Upgraded `HybridProvider` to route chat and conversational queries to Chrome's on-device `window.ai` Nano model when offline or for token-saving local execution.
- **[2026-05-17] Philips Hue & Ambient Lighting Sync**: Created `AmbientLightingService` to mathematically sync the application's real-time circadian HSL themes with physical Philips Hue smart lights via the local network.

## [0.6.0] - 2026-05-17

### Added
- **[2026-05-17] Monorepo Env Fallback**: Server-side `fetchGeminiApiKey()` now searches `pocketgull_api/.env.local` and `pocketgull_api/.env` as fallback sources, eliminating the need for a separate `.env.local` in the Angular root during local development.

### Changed
- **[2026-05-17] THREE.Clock → THREE.Timer**: Migrated `Body3DViewerComponent` from deprecated `THREE.Clock` to `THREE.Timer` (`timer.update()` + `timer.getElapsed()`), resolving the Three.js r183 deprecation warning.
- **[2026-05-17] OHIF Viewer**: Replaced non-functional OHIF iframe (blocked by `X-Frame-Options: DENY` on `viewer.ohif.org`) with a polished launch card that opens OHIF in a new tab, preserving the `StudyInstanceUIDs` deep-link query param.
- **[2026-05-17] Production Source Maps**: Set `sourceMap: false` in the `production` Angular build config to eliminate build-time warnings caused by malformed control characters in `@angular/platform-server`'s `init.mjs.map` (upstream Angular packaging bug).

### Fixed
- **[2026-05-17] Schema Validation**: Removed unsupported `server` property from `angular.json` `sourceMap` object, resolving `SchemaValidationException` on `npm run build`.
- **[2026-05-17] Debug Log Noise**: Removed verbose `console.log` pointerdown/pointerup events from `Body3DViewerComponent` interaction handlers.

## [0.5.0] - 2026-03-16

### Added
- **[2026-03-16] Branding Update**: Replaced application logos with the new origami seagull design in the header and splash screen.
- **[2026-03-16] Domain Configuration**: Mapped custom domains `pocketgull.app` and `www.pocketgull.app` to the live Cloud Run service.
- **[2026-03-16] COCOMO II Estimation**: Updated the effort estimation script to calculate KSLOC dynamically and added an `estimate-effort` npm script.
- **[2026-03-16] Lighthouse Audit Script**: Added an npm script to easily run Lighthouse accessibility and performance audits.

### Changed
- **[2026-03-16] Print Preview Refactoring**: Implemented a modular print strategy allowing user-selected inclusions (analysis, original text), improved translation error handling, and updated the UI controls for cognitive levels.
- **[2026-03-16] Codebase Cleanup**: Removed remaining references to legacy internal terms ("Cerebella" and "Orthomolecular").

### Fixed
- **[2026-03-16] Translation Reversion**: Fixed a bug where textual translations were reverting unexpectedly in the print preview modal.
- **[2026-03-16] Security Headers**: Improved server security headers by explicitly setting Strict-Transport-Security, Cross-Origin-Opener-Policy, and X-Frame-Options.

## [0.4.0] - 2026-03-12

### Added
- **[2026-03-12] Genkit Integration**: Introduced Genkit capabilities and mock data generation for enhanced clinical intelligence features.
- **[2026-03-11] Core Medical Services**: Implemented core services for PocketGall, including patient state management and clinical intelligence.
- **[2026-03-09] SSR Deployment Architecture**: Established Angular SSR server with PubMed API proxies, Gemini API key management, and Docker/GCP Cloud Run deployment configurations.
- **[2026-03-09] Lighthouse Performance Auditing**: Integrated automated performance benchmarking and reporting.
- **[2026-03-06] Research Tools**: Registered research and bookmark tools.
- **[2026-03-06] Expanded Patient Data**: Added a new global sentinel patient to the default dataset.
- **[2026-03-05] AI Reading Level Translation**: Introduced medical summary translation controls for simplified and dyslexia-friendly text.
- **[2026-03-04] Origami Splash Screen**: Added a new animated Pocket splash screen.
- **[2026-03-03] LLM Discoverability File**: Added `llms.txt` to help AI agents consume project documentation.
- **[2026-03-03] Pocket Gull UI Components**: Created new core shared components (`Badge`, `Button`, `Card`, `Input`) aligned with the new branding.
- **[2026-03-03] New Medical Components**: Added `Medical3DViewerComponent` and `PatientScansComponent` to handle advanced clinical imagery.

### Changed
- **[2026-03-09] UI & Layout Refinements**: Expanded assessment panel width and enforced `pocketgull.app` domain redirection.
- **[2026-03-06] Rebranding**: Officially renamed the application from Understory to **Pocket Gull**.
- **[2026-03-06] Mobile Responsiveness**: Upgraded to `dvh` (dynamic viewport height) units for robust mobile layout calculation and refined rich media card parsing.
- **[2026-03-06] Voice Assistant Redesign**: Redesigned the voice assistant transcript display with new model message bubbles and rich media card styling.
- **[2026-03-06] Removed Legacy Features**: Removed old "philosophical export modes".
- **[2026-03-04] Domain Redirection**: Implemented legacy domain redirection.

### Fixed
- **[2026-03-12] WebGL SSR Crash**: Safeguarded `Body3DViewerComponent` from crashing during Server-Side Rendering (SSR) by verifying `window` execution context before WebGL initialization.
- **[2026-03-09] 2D SVG Interactivity**: Recovered 2D SVG layer interactivity and purged unused typography footprint.
- **[2026-03-09] 3D Viewer Anatomy Views**: Restored missing skin, muscle, skeleton, and mind multi-layer anatomy views.
- **[2026-03-09] Dark Mode Persistence**: Restored SSR `ThemeService` for reliable dark mode state management.
- **[2026-03-06] Layout Rendering**: Resolved vertical frame split issues.
- **[2026-03-03] Markdown Rendering**: Fixed mermaid node label rendering issues for GitHub by quoting slashes correctly.
- **[2026-03-03] Live Agent Bug**: Fixed bug to auto-send live agent prompt.

## [0.3.0] - 2026-03-03

### Added
- **Context-Aware AI Chat**: Integrated recent node-specific discussions directly into the AI's conversational memory, enhancing the relevance of "Live Consult" responses.
- **Inline Node Agent Queries**: Added ability to seamlessly launch AI inquiries directly from individual paragraphs and list items within the analysis report.
- **3D Medical Interactive Viewer**: Integrated a robust ThreeJS-powered 3D model viewer for enhanced anatomical visualization.
- **Scans & Diagnostics Library**: Added a visual gallery component to the patient history for managing and displaying diagnostic imagery like MRIs and X-Rays.
- **Evidence Focus Iconography**: Introduced a custom "Interrobang" clinical icon for the Evidence Focus feature, replacing generic indicators.

### Changed
- **Application Rename**: Renamed the application from Understory to Pocket Gull across the entire codebase.
- **Node Toolbar Accessibility**: Increased touch target padding and visual persistence delays on the summary node toolbar to dramatically improve mobile and touch interactions.

## [0.2.0] - 2026-02-28

### Added
- **Offline Printable Stationery**: CSS Grid-optimized, multi-page physical printouts featuring Halftone body maps for visual pain hotspot diagnosis.
- **Smartwatch Optimization**: Responsive UI scaling down to extremely constrained viewports (e.g., Pixel Watch 2 at 286px width).
- **Box Breathing UX**: 16-second box breathing visual animations integrated into primary intake text areas to promote practitioner mindfulness.

### Changed
- **Server-Side Rendering (SSR)**: Transitioned architecture to Angular SSR for performance optimization.
- **Mobile Navigation**: Implemented tabbed view-switching (Tasks / Analysis) optimized for constrained mobile environments.

### Fixed
- **SSR Build Stability**: Resolved "no exports" optimization bailouts caused by unresolved TypeScript properties in `PatientStateService`.
- **Mobile Scrolling**: Fixed mobile page scrolling flow by removing forced height constraints.
- **UI Clipping**: Fixed horizontal/vertical clipping of action buttons and contents in the analysis report.
- **Type Safety**: Ensured strict type checking and proper exports for patient history and summary models across services.

## [0.1.0] - 2026-02-22

### Added
- **Care Plan Recommendation Engine**: A structured AI analysis module categorizing recommendations into Overview, Interventions, Monitoring, and Education.
- **Task Bracketing System**: Interactive UI allowing clinicians to Accept, Reject, or Modify AI-generated interventions before finalizing.
- **Live Voice Consult (Aura)**: An integrated voice assistant agent for real-time collaboration on patient strategies. Includes a dedicated chat interface with speech-to-text integration.
- **3D Body Viewer Integration**: Visual anatomical mapping tools to correlate physical symptoms with digital chart records.
- **Automated Clinical Task Extraction**: Parses unstructured clinical notes into actionable checklist items.
- **Biometric Telemetry Visualization**: Chart.js integration providing retrospective trend analysis for patient blood pressure and pain metrics.
- **Preview & Print Final Care Plan**: A dedicated modal to review, edit, and print the finalized patient care strategy before charting.

### Changed
- Re-architected core layouts for a responsive 3-column split view (Medical Chart, Intake Flow, and Analysis/Voice Assistant).
- Optimized client-side payload delivery via Express compression (Gzip/Brotli) and structural font preconnections.
- Upgraded UI interactions with modern tailwind aesthetics, smooth transitions, and dynamic hover states across all components.

### Fixed
- Addressed infinite reactivity loops within the Intake Form component upon body part selection.
- Corrected Voice Assistant triggering bugs preventing the component from rendering on mobile and desktop viewports.
- Handled improper API Key rejection formatting from the Gemini API service, surfacing graceful UI alerts instead of silent failures.
