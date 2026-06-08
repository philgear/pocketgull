# COCOMO II Granular File Breakdown
**Project Architecture & Development Effort Cost Analysis**

This report details the Constructive Cost Model II (COCOMO II) estimation at the individual source file level. Effort allocation (Person-Hours) is calculated proportionally based on the total codebase size and product complexity.

## 📊 Summary Metrics

| Metric | Estimated Value | Details / Assumptions |
|---|---|---|
| **Total Lines of Code (SLOC)** | **32,783** | Source lines of code excluding comments/blanks across all scanned modules. |
| **Total Size (KSLOC)** | **32.783** | Thousands of Source Lines of Code. |
| **Exponent B** | **1.0887** | Based on scale factors: Precedentedness, Flexibility, Risk Resolution, Team Cohesion, and Process Maturity. |
| **Effort Adjustment Factor (EAF)** | **0.4033** | Based on multipliers: Reliability, Complexity, Time constraints, Personnel experience. |
| **Estimated Effort (Person-Months)** | **52.97 PM** | The total developer months required under standard velocity. |
| **Estimated Effort (Person-Hours)** | **8,052 hrs** | Based on 152 working hours per person-month. |
| **Estimated Schedule (TDEV)** | **11.97 months** | Recommended calendar schedule for a standard team size. |

---

## 📂 File-by-File Effort Distribution

The table below catalogs every analyzed TypeScript (`.ts`) source file, sorted descending by code size.

| File Path | Module | SLOC | Code Share | Effort (Hrs) | Complexity |
|---|---|---|---|---|---|
| [patient-management.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/patient-management.service.ts) | Web Client (Angular) | 2,595 | 7.92% | 637.3 hrs | High |
| [app.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/app.component.ts) | Web Client (Angular) | 2,070 | 6.31% | 508.4 hrs | High |
| [export.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/export.service.ts) | Web Client (Angular) | 1,569 | 4.79% | 385.4 hrs | High |
| [analysis-report.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/analysis-report.component.ts) | Web Client (Angular) | 1,247 | 3.80% | 306.3 hrs | High |
| [secure-splash.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/secure-splash.component.ts) | Web Client (Angular) | 1,106 | 3.37% | 271.6 hrs | High |
| [medical-summary.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/medical-summary.component.ts) | Web Client (Angular) | 1,093 | 3.33% | 268.4 hrs | High |
| [summary-node.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/summary-node.component.ts) | Web Client (Angular) | 918 | 2.80% | 225.5 hrs | High |
| [node-agent-dialog.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/node-agent-dialog.component.ts) | Web Client (Angular) | 853 | 2.60% | 209.5 hrs | High |
| [avs-therapy.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/components/avs-therapy.component.ts) | AVS Therapy Companion (Angular) | 810 | 2.47% | 198.9 hrs | High |
| [intake-form.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/intake-form.component.ts) | Web Client (Angular) | 731 | 2.23% | 179.5 hrs | High |
| [research-frame.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/research-frame.component.ts) | Web Client (Angular) | 571 | 1.74% | 140.2 hrs | High |
| [clinical-intelligence.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/clinical-intelligence.service.ts) | Web Client (Angular) | 533 | 1.63% | 130.9 hrs | High |
| [body-3d-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/body-3d-viewer.component.ts) | Web Client (Angular) | 528 | 1.61% | 129.7 hrs | High |
| [server.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/server.ts) | Web Client (Angular) | 521 | 1.59% | 128.0 hrs | High |
| [medical-3d-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/medical-3d-viewer.component.ts) | Web Client (Angular) | 470 | 1.43% | 115.4 hrs | High |
| [patient-state.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/patient-state.service.ts) | Web Client (Angular) | 455 | 1.39% | 111.7 hrs | High |
| [sentinel-triage.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/sentinel-triage.component.ts) | Web Client (Angular) | 452 | 1.38% | 111.0 hrs | High |
| [demo-data.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/demo-data.ts) | Web Client (Angular) | 452 | 1.38% | 111.0 hrs | High |
| [healthcare.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/server/healthcare.ts) | Web Client (Angular) | 427 | 1.30% | 104.9 hrs | High |
| [walkthrough-tour.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/walkthrough-tour.component.ts) | Web Client (Angular) | 424 | 1.29% | 104.1 hrs | High |
| [task-flow.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/task-flow.component.ts) | Web Client (Angular) | 420 | 1.28% | 103.2 hrs | High |
| [voice-assistant.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/voice-assistant.component.ts) | Web Client (Angular) | 411 | 1.25% | 100.9 hrs | High |
| [memory-palace.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/memory-palace.component.ts) | Web Client (Angular) | 382 | 1.17% | 93.8 hrs | High |
| [telemetry.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/server/telemetry.ts) | Web Client (Angular) | 373 | 1.14% | 91.6 hrs | Nominal |
| [aws.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/server/aws.ts) | Web Client (Angular) | 367 | 1.12% | 90.1 hrs | Nominal |
| [patient.types.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/patient.types.ts) | Web Client (Angular) | 354 | 1.08% | 86.9 hrs | Nominal |
| [patient.types.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/services/patient.types.ts) | AVS Therapy Companion (Angular) | 348 | 1.06% | 85.5 hrs | Nominal |
| [import.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/import.service.ts) | Web Client (Angular) | 341 | 1.04% | 83.8 hrs | High |
| [adk-live.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai/adk-live.service.ts) | Web Client (Angular) | 330 | 1.01% | 81.0 hrs | High |
| [medical-chart.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/medical-chart.component.ts) | Web Client (Angular) | 319 | 0.97% | 78.3 hrs | High |
| [clinical-context-avs.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/services/clinical-context-avs.service.ts) | AVS Therapy Companion (Angular) | 305 | 0.93% | 74.9 hrs | High |
| [doc-consciousness.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/doc-consciousness.component.ts) | Web Client (Angular) | 299 | 0.91% | 73.4 hrs | High |
| [body-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/body-viewer.component.ts) | Web Client (Angular) | 286 | 0.87% | 70.2 hrs | High |
| [pet-auditory.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/pet-auditory.service.ts) | Web Client (Angular) | 281 | 0.86% | 69.0 hrs | Nominal |
| [pocket-gull-button.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/shared/pocket-gull-button.component.ts) | Web Client (Angular) | 275 | 0.84% | 67.5 hrs | High |
| [biometric-history-chart.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/biometric-history-chart.component.ts) | Web Client (Angular) | 270 | 0.82% | 66.3 hrs | High |
| [genkit.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/server/genkit.ts) | Web Client (Angular) | 264 | 0.81% | 64.8 hrs | Nominal |
| [doc-protocol.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/doc-protocol.service.ts) | Web Client (Angular) | 263 | 0.80% | 64.6 hrs | Nominal |
| [lifestyle-adjunct.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/lifestyle-adjunct.service.ts) | Web Client (Angular) | 263 | 0.80% | 64.6 hrs | High |
| [lifestyle-adjunct.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/services/lifestyle-adjunct.service.ts) | AVS Therapy Companion (Angular) | 263 | 0.80% | 64.6 hrs | High |
| [global-avs.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/services/global-avs.service.ts) | AVS Therapy Companion (Angular) | 262 | 0.80% | 64.3 hrs | High |
| [patient-history-timeline.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/patient-history-timeline.component.ts) | Web Client (Angular) | 261 | 0.80% | 64.1 hrs | High |
| [gamification.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/gamification.service.ts) | Web Client (Angular) | 239 | 0.73% | 58.7 hrs | Nominal |
| [rich-media.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/rich-media.service.ts) | Web Client (Angular) | 236 | 0.72% | 58.0 hrs | High |
| [pocket-gull-input.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/shared/pocket-gull-input.component.ts) | Web Client (Angular) | 235 | 0.72% | 57.7 hrs | High |
| [circadian-sleepiness.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/circadian-sleepiness.service.ts) | Web Client (Angular) | 232 | 0.71% | 57.0 hrs | High |
| [rules-engine.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/rules-engine.service.ts) | Web Client (Angular) | 223 | 0.68% | 54.8 hrs | Nominal |
| [ai-cache.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai-cache.service.ts) | Web Client (Angular) | 205 | 0.63% | 50.3 hrs | Nominal |
| [python-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/python-bridge.service.ts) | Web Client (Angular) | 203 | 0.62% | 49.9 hrs | High |
| [patient-dropdown.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/patient-dropdown.component.ts) | Web Client (Angular) | 202 | 0.62% | 49.6 hrs | High |
| [clinical-intelligence.service.spec.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/clinical-intelligence.service.spec.ts) | Web Client (Angular) | 183 | 0.56% | 44.9 hrs | Nominal |
| [gemini.provider.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai/gemini.provider.ts) | Web Client (Angular) | 182 | 0.56% | 44.7 hrs | High |
| [dicom.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/server/dicom.ts) | Web Client (Angular) | 179 | 0.55% | 44.0 hrs | Nominal |
| [hybrid.provider.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai/hybrid.provider.ts) | Web Client (Angular) | 179 | 0.55% | 44.0 hrs | High |
| [avs-ui.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/services/avs-ui.service.ts) | AVS Therapy Companion (Angular) | 176 | 0.54% | 43.2 hrs | High |
| [analysis-container.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/analysis-container.component.ts) | Web Client (Angular) | 173 | 0.53% | 42.5 hrs | High |
| [breath-guide.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/components/breath-guide.component.ts) | AVS Therapy Companion (Angular) | 173 | 0.53% | 42.5 hrs | High |
| [dicom-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/dicom-viewer.component.ts) | Web Client (Angular) | 171 | 0.52% | 42.0 hrs | High |
| [collaboration-dock.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/collaboration-dock.component.ts) | Web Client (Angular) | 170 | 0.52% | 41.8 hrs | High |
| [pubgemma.provider.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai/pubgemma.provider.ts) | Web Client (Angular) | 170 | 0.52% | 41.8 hrs | Nominal |
| [patient-directory.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/patient-directory.component.ts) | Web Client (Angular) | 165 | 0.50% | 40.5 hrs | High |
| [biomarker-matrix.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/biomarker-matrix.component.ts) | Web Client (Angular) | 159 | 0.49% | 39.1 hrs | Nominal |
| [patient-vitals-chart.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/patient-vitals-chart.component.ts) | Web Client (Angular) | 157 | 0.48% | 38.6 hrs | High |
| [dictation-modal.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/dictation-modal.component.ts) | Web Client (Angular) | 153 | 0.47% | 37.6 hrs | High |
| [athletic-protocol.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/athletic-protocol.service.ts) | Web Client (Angular) | 139 | 0.42% | 34.1 hrs | Nominal |
| [athletic-protocol.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/services/athletic-protocol.service.ts) | AVS Therapy Companion (Angular) | 139 | 0.42% | 34.1 hrs | Nominal |
| [storage.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/storage.service.ts) | Web Client (Angular) | 137 | 0.42% | 33.6 hrs | High |
| [firestore-sync.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/firestore-sync.service.ts) | Web Client (Angular) | 130 | 0.40% | 31.9 hrs | High |
| [dictation.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/dictation.service.ts) | Web Client (Angular) | 127 | 0.39% | 31.2 hrs | High |
| [verify-ai.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/verify-ai.service.ts) | Web Client (Angular) | 120 | 0.37% | 29.5 hrs | High |
| [clinical-gauge.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/clinical-gauge.component.ts) | Web Client (Angular) | 119 | 0.36% | 29.2 hrs | Nominal |
| [fhir-callback.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/fhir-callback.component.ts) | Web Client (Angular) | 113 | 0.34% | 27.8 hrs | High |
| [live-agent-visuals.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/live-agent-visuals.component.ts) | Web Client (Angular) | 112 | 0.34% | 27.5 hrs | Nominal |
| [triage.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/pocketgull_api/src/routes/triage.ts) | Backend API (Node) | 112 | 0.34% | 27.5 hrs | Nominal |
| [nano.provider.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai/nano.provider.ts) | Web Client (Angular) | 106 | 0.32% | 26.0 hrs | Nominal |
| [veo.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/veo.service.ts) | Web Client (Angular) | 105 | 0.32% | 25.8 hrs | Nominal |
| [biometric-import.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/biometric-import.service.ts) | Web Client (Angular) | 101 | 0.31% | 24.8 hrs | High |
| [walkthrough-tour.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/walkthrough-tour.service.ts) | Web Client (Angular) | 100 | 0.31% | 24.6 hrs | High |
| [visit-review.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/visit-review.component.ts) | Web Client (Angular) | 99 | 0.30% | 24.3 hrs | High |
| [webllm.provider.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai/webllm.provider.ts) | Web Client (Angular) | 99 | 0.30% | 24.3 hrs | High |
| [clinical-trend.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/clinical-trend.component.ts) | Web Client (Angular) | 98 | 0.30% | 24.1 hrs | Nominal |
| [theme.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/theme.service.ts) | Web Client (Angular) | 95 | 0.29% | 23.3 hrs | Nominal |
| [collaboration.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/collaboration.service.ts) | Web Client (Angular) | 93 | 0.28% | 22.8 hrs | High |
| [fhir-integration.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/fhir-integration.service.ts) | Web Client (Angular) | 89 | 0.27% | 21.9 hrs | Nominal |
| [pocket-gull-badge.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/shared/pocket-gull-badge.component.ts) | Web Client (Angular) | 79 | 0.24% | 19.4 hrs | Nominal |
| [metric-card.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/shared/metric-card.component.ts) | Web Client (Angular) | 78 | 0.24% | 19.2 hrs | Nominal |
| [patient-scans.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/patient-scans.component.ts) | Web Client (Angular) | 77 | 0.23% | 18.9 hrs | High |
| [ambient-lighting.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ambient-lighting.service.ts) | Web Client (Angular) | 76 | 0.23% | 18.7 hrs | High |
| [hardware-telemetry.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/hardware-telemetry.service.ts) | Web Client (Angular) | 76 | 0.23% | 18.7 hrs | High |
| [loci-palace.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/loci-palace.service.ts) | Web Client (Angular) | 75 | 0.23% | 18.4 hrs | High |
| [dicom.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/dicom.service.ts) | Web Client (Angular) | 74 | 0.23% | 18.2 hrs | Nominal |
| [intelligence.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/pocketgull_api/src/routes/intelligence.ts) | Backend API (Node) | 69 | 0.21% | 16.9 hrs | Nominal |
| [ohif-viewer.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/ohif-viewer.component.ts) | Web Client (Angular) | 67 | 0.20% | 16.5 hrs | High |
| [world-health.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/server/world-health.ts) | Web Client (Angular) | 67 | 0.20% | 16.5 hrs | Low |
| [pocket-gull-card.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/shared/pocket-gull-card.component.ts) | Web Client (Angular) | 59 | 0.18% | 14.5 hrs | High |
| [network-state.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/network-state.service.ts) | Web Client (Angular) | 53 | 0.16% | 13.0 hrs | High |
| [patient-state.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/services/patient-state.service.ts) | AVS Therapy Companion (Angular) | 53 | 0.16% | 13.0 hrs | Nominal |
| [analysis-report.types.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/analysis-report.types.ts) | Web Client (Angular) | 52 | 0.16% | 12.8 hrs | Low |
| [reveal.directive.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/directives/reveal.directive.ts) | Web Client (Angular) | 45 | 0.14% | 11.1 hrs | Low |
| [image-optimization.service.spec.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/image-optimization.service.spec.ts) | Web Client (Angular) | 42 | 0.13% | 10.3 hrs | Nominal |
| [main.server.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/main.server.ts) | Web Client (Angular) | 40 | 0.12% | 9.8 hrs | Low |
| [session-state.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/session-state.service.ts) | Web Client (Angular) | 39 | 0.12% | 9.6 hrs | High |
| [pubmed.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/pocketgull_api/src/routes/pubmed.ts) | Backend API (Node) | 34 | 0.10% | 8.4 hrs | Low |
| [auth.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/auth.service.ts) | Web Client (Angular) | 32 | 0.10% | 7.9 hrs | Nominal |
| [stress-intervention.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/stress-intervention.service.ts) | Web Client (Angular) | 32 | 0.10% | 7.9 hrs | High |
| [notification.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/pocketgull_api/src/services/notification.ts) | Backend API (Node) | 31 | 0.09% | 7.6 hrs | Nominal |
| [safe-html-new.pipe.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/pipes/safe-html-new.pipe.ts) | Web Client (Angular) | 29 | 0.09% | 7.1 hrs | Low |
| [image-optimization.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/image-optimization.service.ts) | Web Client (Angular) | 28 | 0.09% | 6.9 hrs | Nominal |
| [live-agent.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/components/live-agent.component.ts) | Web Client (Angular) | 26 | 0.08% | 6.4 hrs | Nominal |
| [app.component.spec.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/app.component.spec.ts) | AVS Therapy Companion (Angular) | 25 | 0.08% | 6.1 hrs | Low |
| [index.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/pocketgull_api/src/index.ts) | Backend API (Node) | 23 | 0.07% | 5.6 hrs | Low |
| [test_gem.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/test_gem.ts) | Web Client (Angular) | 21 | 0.06% | 5.2 hrs | Low |
| [patients.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/pocketgull_api/src/routes/patients.ts) | Backend API (Node) | 21 | 0.06% | 5.2 hrs | Low |
| [intelligence.provider.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai/intelligence.provider.ts) | Web Client (Angular) | 20 | 0.06% | 4.9 hrs | Low |
| [audit.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/audit.service.ts) | Web Client (Angular) | 20 | 0.06% | 4.9 hrs | Nominal |
| [radiology.agent.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai/agents/radiology.agent.ts) | Web Client (Angular) | 19 | 0.06% | 4.7 hrs | Low |
| [clinical-icons.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/assets/clinical-icons.ts) | Web Client (Angular) | 18 | 0.05% | 4.4 hrs | Low |
| [ai-provider.types.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai-provider.types.ts) | Web Client (Angular) | 16 | 0.05% | 3.9 hrs | Low |
| [markdown.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/markdown.service.ts) | Web Client (Angular) | 16 | 0.05% | 3.9 hrs | Nominal |
| [globals.d.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/globals.d.ts) | Web Client (Angular) | 12 | 0.04% | 2.9 hrs | Low |
| [safe-html.pipe.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/pipes/safe-html.pipe.ts) | Web Client (Angular) | 12 | 0.04% | 2.9 hrs | Low |
| [app.component.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/app.component.ts) | AVS Therapy Companion (Angular) | 12 | 0.04% | 2.9 hrs | Nominal |
| [python-bridge.service.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/services/python-bridge.service.ts) | AVS Therapy Companion (Angular) | 12 | 0.04% | 2.9 hrs | Nominal |
| [environment.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/environments/environment.ts) | Web Client (Angular) | 11 | 0.03% | 2.7 hrs | Low |
| [image-sizes.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/constants/image-sizes.ts) | Web Client (Angular) | 8 | 0.02% | 2.0 hrs | Low |
| [empty.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/mocks/empty.ts) | Web Client (Angular) | 7 | 0.02% | 1.7 hrs | Low |
| [webllm.worker.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/workers/webllm.worker.ts) | Web Client (Angular) | 5 | 0.02% | 1.2 hrs | Low |
| [main.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/main.ts) | AVS Therapy Companion (Angular) | 5 | 0.02% | 1.2 hrs | Low |
| [app.config.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/companion-apps/avs-therapy/src/app/app.config.ts) | AVS Therapy Companion (Angular) | 4 | 0.01% | 1.0 hrs | Low |
| [intelligence.provider.token.ts](file:///C:/Users/philg/Pocketgull/pg2/pocketgull/src/services/ai/intelligence.provider.token.ts) | Web Client (Angular) | 3 | 0.01% | 0.7 hrs | Low |

---

*Report generated automatically by `scripts/estimate-effort-detailed.js`. All metrics adhere to the COCOMO II Post-Architecture Model.*
