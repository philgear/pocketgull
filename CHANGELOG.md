# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-18

### Added
- **Interactive Walkthrough Tour**: Expanded from 7 to 9 steps, adding AVS Therapy and Circadian/KSS panels to the guided tour. Reordered for a more natural first-run flow (patient → body chart → intake → generate → lenses → evidence → AVS → circadian → finalize).
- **Split View Entrance Animation**: New `split-view-enter` CSS keyframe gives the analysis panel a spring-feel slide-in when the split view opens. Panel now animates with `opacity/max-width` instead of toggling `display:none`.
- **`isSplitting` Signal**: Drives the one-shot entrance animation class on the analysis column, auto-clearing after 600ms.

### Changed
- **`showSplitView()` Layout Measurement**: Now uses `requestAnimationFrame` + actual container `offsetWidth` to compute a true 50/50 split, accounting for padding, gap, and resizer width. Previously used raw `window.innerWidth / 2`.
- **Permissions-Policy Header**: Removed 6 deprecated features (`ambient-light-sensor`, `battery`, `document-domain`, `execution-while-not-rendered`, `execution-while-out-of-viewport`, `web-share`) that Chrome 120+ no longer recognizes, eliminating console warnings on every request.
- **Walkthrough Tour**: Updated step bodies to reference Gemini 2.5 Flash, multilingual export, and Evidence Focus inline agent by name.
- **Documentation**: Updated `getting-started.mdx` with current project structure (shims/, workers/, url-shim), Workload Identity Federation CI/CD, and security hardening summary. Updated `features.mdx` with full AVS Therapy, Circadian UI, KSS, Hue lighting, DSP sidecar, and Gemini Nano sections.

### Fixed
- **`GlobalAvsService` AudioNode Crash**: `ChannelMergerNode` was declared as a class field but never instantiated in `buildGraph()`, causing `TypeError: parameter 1 is not of type 'AudioNode'` on every AVS session start. Fixed by calling `this.ctx.createChannelMerger(2)` before oscillator connections; also corrected the gain routing so each channel's oscillators merge correctly into the stereo field.
- **Angular NG5002 Template Errors**: Resolved `Opening tag "div" not terminated` caused by a missing `>` on the chart panel's opening tag after the CSS transition refactor. Also removed the invalid `[class.ease-[cubic-bezier(...)]]` binding (bracket chars in class bindings are rejected by the Angular 19 strict template parser).
- **Split View Panel Collapse Animation**: Replaced `[class.hidden]` (Tailwind `display:none`) on both chart and analysis columns with `max-width/opacity/overflow/pointer-events` inline styles so `transition-all duration-500` can interpolate the collapse — previously the transition was short-circuited.
- **`CollaborationService` Socket.io Dev Noise**: Service was connecting to socket.io immediately on construction, flooding the dev console with 404 reconnection attempts since the Angular dev server doesn't mount socket.io. Added a `probeAndConnect()` preflight fetch: if the handshake endpoint 404s, the service silently skips connecting. Also added `isPlatformBrowser` guard to prevent SSR from attempting socket connections.

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
