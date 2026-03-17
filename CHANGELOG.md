# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
