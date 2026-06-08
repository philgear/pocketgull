# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
