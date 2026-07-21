# COCOMO II Granular File Breakdown
**Project Architecture & Development Effort Cost Analysis**

This report details the Constructive Cost Model II (COCOMO II) estimation at the individual source file level. Effort allocation (Person-Hours) is calculated proportionally based on the total codebase size and product complexity.

## 📊 Summary Metrics

| Metric | Estimated Value | Details / Assumptions |
|---|---|---|
| **Total Lines of Code (SLOC)** | **41,807** | Source lines of code excluding comments/blanks across all scanned modules. |
| **Total Size (KSLOC)** | **41.807** | Thousands of Source Lines of Code. |
| **Exponent B** | **1.0887** | Based on scale factors: Precedentedness, Flexibility, Risk Resolution, Team Cohesion, and Process Maturity. |
| **Effort Adjustment Factor (EAF)** | **0.4033** | Based on multipliers: Reliability, Complexity, Time constraints, Personnel experience. |
| **Estimated Effort (Person-Months)** | **69.02 PM** | The total developer months required under standard velocity. |
| **Estimated Effort (Person-Hours)** | **10,492 hrs** | Based on 152 working hours per person-month. |
| **Estimated Schedule (TDEV)** | **12.96 months** | Recommended calendar schedule for a standard team size. |

---

## 📂 File-by-File Effort Distribution

The table below catalogs every analyzed TypeScript (`.ts`) source file, sorted descending by code size.

| File Path | Module | SLOC | Code Share | Effort (Hrs) | Complexity |
|---|---|---|---|---|---|
| [app.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/app.component.ts) | Web Client (Angular) | 2,283 | 5.46% | 572.9 hrs | High |
| [secure-splash.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/secure-splash.component.ts) | Web Client (Angular) | 1,809 | 4.33% | 454.0 hrs | High |
| [export.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/export.service.ts) | Web Client (Angular) | 1,765 | 4.22% | 442.9 hrs | High |
| [analysis-report.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report.component.ts) | Web Client (Angular) | 1,745 | 4.17% | 437.9 hrs | High |
| [medical-summary.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/medical-summary.component.ts) | Web Client (Angular) | 1,223 | 2.93% | 306.9 hrs | High |
| [server.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server.ts) | Web Client (Angular) | 1,040 | 2.49% | 261.0 hrs | High |
| [avs-therapy.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-therapy.component.ts) | AVS Therapy Companion (Angular) | 1,019 | 2.44% | 255.7 hrs | High |
| [intake-form.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/intake-form.component.ts) | Web Client (Angular) | 1,018 | 2.43% | 255.5 hrs | High |
| [body-3d-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/body-3d-viewer.component.ts) | Web Client (Angular) | 939 | 2.25% | 235.6 hrs | High |
| [summary-node.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/summary-node.component.ts) | Web Client (Angular) | 938 | 2.24% | 235.4 hrs | High |
| [node-agent-dialog.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/node-agent-dialog.component.ts) | Web Client (Angular) | 854 | 2.04% | 214.3 hrs | High |
| [cost-benefit-analysis.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/cost-benefit-analysis.component.ts) | Web Client (Angular) | 683 | 1.63% | 171.4 hrs | High |
| [patient-state.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient-state.service.ts) | Web Client (Angular) | 681 | 1.63% | 170.9 hrs | High |
| [patient-management.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient-management.service.ts) | Web Client (Angular) | 654 | 1.56% | 164.1 hrs | High |
| [research-frame.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/research-frame.component.ts) | Web Client (Angular) | 610 | 1.46% | 153.1 hrs | High |
| [data.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ybocs/data.ts) | Web Client (Angular) | 604 | 1.44% | 151.6 hrs | High |
| [clinical-intelligence.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-intelligence.service.ts) | Web Client (Angular) | 601 | 1.44% | 150.8 hrs | High |
| [voice-assistant.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/voice-assistant.component.ts) | Web Client (Angular) | 537 | 1.28% | 134.8 hrs | High |
| [medical-3d-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/medical-3d-viewer.component.ts) | Web Client (Angular) | 497 | 1.19% | 124.7 hrs | High |
| [walkthrough-tour.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/walkthrough-tour.component.ts) | Web Client (Angular) | 472 | 1.13% | 118.5 hrs | High |
| [sentinel-triage.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/sentinel-triage.component.ts) | Web Client (Angular) | 452 | 1.08% | 113.4 hrs | High |
| [healthcare.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/healthcare.ts) | Web Client (Angular) | 451 | 1.08% | 113.2 hrs | High |
| [task-flow.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/task-flow.component.ts) | Web Client (Angular) | 421 | 1.01% | 105.7 hrs | High |
| [genkit.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/genkit.ts) | Web Client (Angular) | 417 | 1.00% | 104.6 hrs | High |
| [demo-data.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/demo-data.ts) | Web Client (Angular) | 412 | 0.99% | 103.4 hrs | High |
| [fitbit.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/fitbit.ts) | Web Client (Angular) | 400 | 0.96% | 100.4 hrs | Nominal |
| [patient.types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient.types.ts) | Web Client (Angular) | 392 | 0.94% | 98.4 hrs | Nominal |
| [body-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/body-viewer.component.ts) | Web Client (Angular) | 385 | 0.92% | 96.6 hrs | High |
| [aws.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/aws.ts) | Web Client (Angular) | 377 | 0.90% | 94.6 hrs | Nominal |
| [telemetry.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/telemetry.ts) | Web Client (Angular) | 373 | 0.89% | 93.6 hrs | Nominal |
| [pet-auditory.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/pet-auditory.service.ts) | Web Client (Angular) | 350 | 0.84% | 87.8 hrs | Nominal |
| [patient.types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/patient.types.ts) | AVS Therapy Companion (Angular) | 348 | 0.83% | 87.3 hrs | Nominal |
| [adk-live.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/adk-live.service.ts) | Web Client (Angular) | 339 | 0.81% | 85.1 hrs | High |
| [import.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/import.service.ts) | Web Client (Angular) | 336 | 0.80% | 84.3 hrs | High |
| [biometric-history-chart.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/biometric-history-chart.component.ts) | Web Client (Angular) | 333 | 0.80% | 83.6 hrs | High |
| [medical-chart.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/medical-chart.component.ts) | Web Client (Angular) | 320 | 0.77% | 80.3 hrs | High |
| [clinical-context-avs.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/clinical-context-avs.service.ts) | AVS Therapy Companion (Angular) | 305 | 0.73% | 76.5 hrs | High |
| [doc-consciousness.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/doc-consciousness.component.ts) | Web Client (Angular) | 299 | 0.72% | 75.0 hrs | High |
| [p_mara_santos.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_mara_santos.ts) | Web Client (Angular) | 297 | 0.71% | 74.5 hrs | Nominal |
| [python-bridge.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/python-bridge.service.ts) | Web Client (Angular) | 283 | 0.68% | 71.0 hrs | High |
| [global-avs.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/global-avs.service.ts) | AVS Therapy Companion (Angular) | 278 | 0.66% | 69.8 hrs | High |
| [pocket-gull-button.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-button.component.ts) | Web Client (Angular) | 277 | 0.66% | 69.5 hrs | High |
| [doc-protocol.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/doc-protocol.service.ts) | Web Client (Angular) | 263 | 0.63% | 66.0 hrs | Nominal |
| [lifestyle-adjunct.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/lifestyle-adjunct.service.ts) | Web Client (Angular) | 263 | 0.63% | 66.0 hrs | High |
| [lifestyle-adjunct.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/lifestyle-adjunct.service.ts) | AVS Therapy Companion (Angular) | 263 | 0.63% | 66.0 hrs | High |
| [patient-history-timeline.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-history-timeline.component.ts) | Web Client (Angular) | 261 | 0.62% | 65.5 hrs | High |
| [clinical-prompts.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-prompts.ts) | Web Client (Angular) | 249 | 0.60% | 62.5 hrs | Nominal |
| [p008.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p008.ts) | Web Client (Angular) | 248 | 0.59% | 62.2 hrs | Nominal |
| [patient-state.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/patient-state.spec.ts) | Web Client (Angular) | 248 | 0.59% | 62.2 hrs | Nominal |
| [storage.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/storage.service.ts) | Web Client (Angular) | 244 | 0.58% | 61.2 hrs | High |
| [rich-media.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/rich-media.service.ts) | Web Client (Angular) | 242 | 0.58% | 60.7 hrs | High |
| [zamecznik-canvas.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/zamecznik-canvas.component.ts) | Web Client (Angular) | 240 | 0.57% | 60.2 hrs | Nominal |
| [gamification.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/gamification.service.ts) | Web Client (Angular) | 239 | 0.57% | 60.0 hrs | Nominal |
| [pocket-gull-input.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-input.component.ts) | Web Client (Angular) | 236 | 0.56% | 59.2 hrs | High |
| [patient-dropdown.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-dropdown.component.ts) | Web Client (Angular) | 234 | 0.56% | 58.7 hrs | High |
| [circadian-sleepiness.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/circadian-sleepiness.service.ts) | Web Client (Angular) | 232 | 0.55% | 58.2 hrs | High |
| [nano.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/nano.provider.ts) | Web Client (Angular) | 224 | 0.54% | 56.2 hrs | High |
| [rules-engine.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/rules-engine.service.ts) | Web Client (Angular) | 223 | 0.53% | 56.0 hrs | Nominal |
| [fitbit.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/fitbit.service.ts) | Web Client (Angular) | 222 | 0.53% | 55.7 hrs | High |
| [breath-guide.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/breath-guide.component.ts) | AVS Therapy Companion (Angular) | 221 | 0.53% | 55.5 hrs | High |
| [gemini.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/gemini.provider.ts) | Web Client (Angular) | 217 | 0.52% | 54.5 hrs | High |
| [ybocs-screener.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/ybocs-screener.component.ts) | Web Client (Angular) | 213 | 0.51% | 53.5 hrs | High |
| [dicom.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/dicom.ts) | Web Client (Angular) | 212 | 0.51% | 53.2 hrs | Nominal |
| [ai-cache.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai-cache.service.ts) | Web Client (Angular) | 212 | 0.51% | 53.2 hrs | Nominal |
| [dicom-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/dicom-viewer.component.ts) | Web Client (Angular) | 206 | 0.49% | 51.7 hrs | High |
| [hybrid.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/hybrid.provider.ts) | Web Client (Angular) | 199 | 0.48% | 49.9 hrs | High |
| [p002.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p002.ts) | Web Client (Angular) | 198 | 0.47% | 49.7 hrs | Nominal |
| [patient-directory.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-directory.component.ts) | Web Client (Angular) | 190 | 0.45% | 47.7 hrs | High |
| [biomarker-matrix.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/biomarker-matrix.component.ts) | Web Client (Angular) | 185 | 0.44% | 46.4 hrs | Nominal |
| [p003.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p003.ts) | Web Client (Angular) | 184 | 0.44% | 46.2 hrs | Nominal |
| [clinical-intelligence.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-intelligence.service.spec.ts) | Web Client (Angular) | 181 | 0.43% | 45.4 hrs | Nominal |
| [pubgemma.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/pubgemma.provider.ts) | Web Client (Angular) | 178 | 0.43% | 44.7 hrs | Nominal |
| [avs-ui.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/avs-ui.service.ts) | AVS Therapy Companion (Angular) | 176 | 0.42% | 44.2 hrs | High |
| [collaboration-dock.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/collaboration-dock.component.ts) | Web Client (Angular) | 171 | 0.41% | 42.9 hrs | High |
| [firestore-sync.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/firestore-sync.service.ts) | Web Client (Angular) | 171 | 0.41% | 42.9 hrs | High |
| [p001.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p001.ts) | Web Client (Angular) | 166 | 0.40% | 41.7 hrs | Nominal |
| [analysis-container.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-container.component.ts) | Web Client (Angular) | 161 | 0.39% | 40.4 hrs | High |
| [walkthrough-tour.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/walkthrough-tour.service.ts) | Web Client (Angular) | 161 | 0.39% | 40.4 hrs | High |
| [synthesis-dashboard.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/synthesis-dashboard.component.ts) | Web Client (Angular) | 160 | 0.38% | 40.2 hrs | High |
| [patient-vitals-chart.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-vitals-chart.component.ts) | Web Client (Angular) | 157 | 0.38% | 39.4 hrs | High |
| [index.d.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/lib/dataconnect/index.d.ts) | Web Client (Angular) | 157 | 0.38% | 39.4 hrs | Nominal |
| [dictation-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/dictation-modal.component.ts) | Web Client (Angular) | 153 | 0.37% | 38.4 hrs | High |
| [dictation.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/dictation.service.ts) | Web Client (Angular) | 148 | 0.35% | 37.1 hrs | High |
| [ybocs.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ybocs/ybocs.service.ts) | Web Client (Angular) | 140 | 0.33% | 35.1 hrs | High |
| [athletic-protocol.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/athletic-protocol.service.ts) | Web Client (Angular) | 139 | 0.33% | 34.9 hrs | Nominal |
| [athletic-protocol.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/athletic-protocol.service.ts) | AVS Therapy Companion (Angular) | 139 | 0.33% | 34.9 hrs | Nominal |
| [p004.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p004.ts) | Web Client (Angular) | 128 | 0.31% | 32.1 hrs | Nominal |
| [p005.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p005.ts) | Web Client (Angular) | 127 | 0.30% | 31.9 hrs | Nominal |
| [dicom.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/dicom.service.ts) | Web Client (Angular) | 127 | 0.30% | 31.9 hrs | High |
| [companion-sync-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/companion-sync-modal.component.ts) | Web Client (Angular) | 124 | 0.30% | 31.1 hrs | High |
| [verify-ai.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/verify-ai.service.ts) | Web Client (Angular) | 122 | 0.29% | 30.6 hrs | High |
| [clinical-gauge.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-gauge.component.ts) | Web Client (Angular) | 119 | 0.28% | 29.9 hrs | Nominal |
| [p006.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p006.ts) | Web Client (Angular) | 119 | 0.28% | 29.9 hrs | Nominal |
| [fhir-callback.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/fhir-callback.component.ts) | Web Client (Angular) | 113 | 0.27% | 28.4 hrs | High |
| [live-agent-visuals.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/live-agent-visuals.component.ts) | Web Client (Angular) | 112 | 0.27% | 28.1 hrs | Nominal |
| [p_charles_darwin.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_charles_darwin.ts) | Web Client (Angular) | 112 | 0.27% | 28.1 hrs | Nominal |
| [webllm.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/webllm.provider.ts) | Web Client (Angular) | 112 | 0.27% | 28.1 hrs | High |
| [triage.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/triage.ts) | Backend API (Node) | 112 | 0.27% | 28.1 hrs | Nominal |
| [theme.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/theme.service.ts) | Web Client (Angular) | 111 | 0.27% | 27.9 hrs | High |
| [consent-modal.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/consent-modal.component.ts) | Web Client (Angular) | 110 | 0.26% | 27.6 hrs | High |
| [python-bridge.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/python-bridge.service.spec.ts) | Web Client (Angular) | 108 | 0.26% | 27.1 hrs | Nominal |
| [veo.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/veo.service.ts) | Web Client (Angular) | 105 | 0.25% | 26.4 hrs | Nominal |
| [orcid.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/orcid.service.ts) | Web Client (Angular) | 104 | 0.25% | 26.1 hrs | High |
| [p007.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p007.ts) | Web Client (Angular) | 102 | 0.24% | 25.6 hrs | Nominal |
| [biometric-import.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/biometric-import.service.ts) | Web Client (Angular) | 101 | 0.24% | 25.3 hrs | High |
| [clinical-trend.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/clinical-trend.component.ts) | Web Client (Angular) | 98 | 0.23% | 24.6 hrs | Nominal |
| [visit-review.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/visit-review.component.ts) | Web Client (Angular) | 98 | 0.23% | 24.6 hrs | High |
| [orcid.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/orcid.ts) | Backend API (Node) | 96 | 0.23% | 24.1 hrs | Low |
| [collaboration.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/collaboration.service.ts) | Web Client (Angular) | 93 | 0.22% | 23.3 hrs | High |
| [fhir-integration.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/fhir-integration.service.ts) | Web Client (Angular) | 89 | 0.21% | 22.3 hrs | Nominal |
| [p_frida_kahlo.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_frida_kahlo.ts) | Web Client (Angular) | 86 | 0.21% | 21.6 hrs | Low |
| [ble-wearables.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ble-wearables.service.ts) | Web Client (Angular) | 85 | 0.20% | 21.3 hrs | High |
| [pocket-gull-badge.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-badge.component.ts) | Web Client (Angular) | 79 | 0.19% | 19.8 hrs | Nominal |
| [metric-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/metric-card.component.ts) | Web Client (Angular) | 78 | 0.19% | 19.6 hrs | Nominal |
| [fhir-r5-telemetry.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/fhir-r5-telemetry.service.ts) | Web Client (Angular) | 78 | 0.19% | 19.6 hrs | High |
| [patient-scans.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/patient-scans.component.ts) | Web Client (Angular) | 77 | 0.18% | 19.3 hrs | High |
| [hardware-telemetry.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/hardware-telemetry.service.ts) | Web Client (Angular) | 77 | 0.18% | 19.3 hrs | High |
| [ambient-lighting.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ambient-lighting.service.ts) | Web Client (Angular) | 76 | 0.18% | 19.1 hrs | High |
| [intelligence.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/intelligence.ts) | Backend API (Node) | 69 | 0.17% | 17.3 hrs | Nominal |
| [ohif-viewer.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/ohif-viewer.component.ts) | Web Client (Angular) | 67 | 0.16% | 16.8 hrs | High |
| [p_edwin_smith_3.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_edwin_smith_3.ts) | Web Client (Angular) | 67 | 0.16% | 16.8 hrs | Low |
| [world-health.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/server/world-health.ts) | Web Client (Angular) | 67 | 0.16% | 16.8 hrs | Low |
| [research-tab.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/research-tab.component.ts) | Web Client (Angular) | 66 | 0.16% | 16.6 hrs | Nominal |
| [agent-personas.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/agent-personas.ts) | Web Client (Angular) | 65 | 0.16% | 16.3 hrs | Low |
| [p_phil_gear.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients/p_phil_gear.ts) | Web Client (Angular) | 62 | 0.15% | 15.6 hrs | Low |
| [pocket-gull-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/shared/pocket-gull-card.component.ts) | Web Client (Angular) | 59 | 0.14% | 14.8 hrs | High |
| [network-state.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/network-state.service.ts) | Web Client (Angular) | 59 | 0.14% | 14.8 hrs | High |
| [fhir-r5-telemetry.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/fhir-r5-telemetry.service.spec.ts) | Web Client (Angular) | 57 | 0.14% | 14.3 hrs | Nominal |
| [session-state.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/session-state.service.ts) | Web Client (Angular) | 57 | 0.14% | 14.3 hrs | High |
| [consent.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/consent.service.ts) | Web Client (Angular) | 56 | 0.13% | 14.1 hrs | High |
| [patient-state.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/patient-state.service.ts) | AVS Therapy Companion (Angular) | 54 | 0.13% | 13.6 hrs | Nominal |
| [analysis-report.types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/analysis-report.types.ts) | Web Client (Angular) | 52 | 0.12% | 13.0 hrs | Low |
| [reveal.directive.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/directives/reveal.directive.ts) | Web Client (Angular) | 47 | 0.11% | 11.8 hrs | Low |
| [types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ybocs/types.ts) | Web Client (Angular) | 46 | 0.11% | 11.5 hrs | Low |
| [serene-intake.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/serene-intake.component.ts) | Web Client (Angular) | 42 | 0.10% | 10.5 hrs | Nominal |
| [image-optimization.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/image-optimization.service.spec.ts) | Web Client (Angular) | 42 | 0.10% | 10.5 hrs | Nominal |
| [knowledge-synthesis.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/knowledge-synthesis.service.ts) | Web Client (Angular) | 41 | 0.10% | 10.3 hrs | High |
| [main.server.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/main.server.ts) | Web Client (Angular) | 40 | 0.10% | 10.0 hrs | Low |
| [pubmed.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/pubmed.ts) | Backend API (Node) | 34 | 0.08% | 8.5 hrs | Low |
| [image-optimization.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/image-optimization.service.ts) | Web Client (Angular) | 33 | 0.08% | 8.3 hrs | Nominal |
| [auth.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/auth.service.ts) | Web Client (Angular) | 32 | 0.08% | 8.0 hrs | Nominal |
| [stress-intervention.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/stress-intervention.service.ts) | Web Client (Angular) | 32 | 0.08% | 8.0 hrs | High |
| [insight-card.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/insight-card.component.ts) | Web Client (Angular) | 31 | 0.07% | 7.8 hrs | Nominal |
| [safe-html-new.pipe.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/pipes/safe-html-new.pipe.ts) | Web Client (Angular) | 31 | 0.07% | 7.8 hrs | High |
| [notification.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/services/notification.ts) | Backend API (Node) | 31 | 0.07% | 7.8 hrs | Nominal |
| [mock-patients.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mock-patients.ts) | Web Client (Angular) | 29 | 0.07% | 7.3 hrs | Low |
| [live-agent.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/live-agent.component.ts) | Web Client (Angular) | 26 | 0.06% | 6.5 hrs | Nominal |
| [intelligence.provider.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/intelligence.provider.ts) | Web Client (Angular) | 26 | 0.06% | 6.5 hrs | Low |
| [audit.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/audit.service.ts) | Web Client (Angular) | 26 | 0.06% | 6.5 hrs | High |
| [index.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/index.ts) | Backend API (Node) | 25 | 0.06% | 6.3 hrs | Low |
| [app.component.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.component.spec.ts) | AVS Therapy Companion (Angular) | 25 | 0.06% | 6.3 hrs | Low |
| [secure-key.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/secure-key.ts) | Web Client (Angular) | 22 | 0.05% | 5.5 hrs | Low |
| [test_gem.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/test_gem.ts) | Web Client (Angular) | 21 | 0.05% | 5.3 hrs | Low |
| [patients.ts](file:///c:/Users/philg/Pocketgull/pocketgull/pocketgull_api/src/routes/patients.ts) | Backend API (Node) | 21 | 0.05% | 5.3 hrs | Low |
| [radiology.agent.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/agents/radiology.agent.ts) | Web Client (Angular) | 19 | 0.05% | 4.8 hrs | Low |
| [clinical-icons.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/assets/clinical-icons.ts) | Web Client (Angular) | 18 | 0.04% | 4.5 hrs | Low |
| [adk-live.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/adk-live.service.spec.ts) | Web Client (Angular) | 18 | 0.04% | 4.5 hrs | Nominal |
| [ble-wearables.service.spec.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ble-wearables.service.spec.ts) | Web Client (Angular) | 18 | 0.04% | 4.5 hrs | Nominal |
| [insight-grid.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/components/synthesis/insight-grid.component.ts) | Web Client (Angular) | 16 | 0.04% | 4.0 hrs | Nominal |
| [ai-provider.types.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai-provider.types.ts) | Web Client (Angular) | 16 | 0.04% | 4.0 hrs | Low |
| [markdown.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/markdown.service.ts) | Web Client (Angular) | 16 | 0.04% | 4.0 hrs | Nominal |
| [firebase.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/lib/firebase.ts) | Web Client (Angular) | 13 | 0.03% | 3.3 hrs | Low |
| [environment.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/environments/environment.ts) | Web Client (Angular) | 12 | 0.03% | 3.0 hrs | Low |
| [globals.d.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/globals.d.ts) | Web Client (Angular) | 12 | 0.03% | 3.0 hrs | Low |
| [safe-html.pipe.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/pipes/safe-html.pipe.ts) | Web Client (Angular) | 12 | 0.03% | 3.0 hrs | Low |
| [app.component.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.component.ts) | AVS Therapy Companion (Angular) | 12 | 0.03% | 3.0 hrs | Nominal |
| [python-bridge.service.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/services/python-bridge.service.ts) | AVS Therapy Companion (Angular) | 12 | 0.03% | 3.0 hrs | Nominal |
| [image-sizes.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/constants/image-sizes.ts) | Web Client (Angular) | 8 | 0.02% | 2.0 hrs | Low |
| [empty.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/mocks/empty.ts) | Web Client (Angular) | 7 | 0.02% | 1.8 hrs | Low |
| [webllm.worker.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/workers/webllm.worker.ts) | Web Client (Angular) | 5 | 0.01% | 1.3 hrs | Low |
| [main.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/main.ts) | AVS Therapy Companion (Angular) | 5 | 0.01% | 1.3 hrs | Low |
| [app.config.ts](file:///c:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/app.config.ts) | AVS Therapy Companion (Angular) | 4 | 0.01% | 1.0 hrs | Low |
| [intelligence.provider.token.ts](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/ai/intelligence.provider.token.ts) | Web Client (Angular) | 3 | 0.01% | 0.8 hrs | Low |

---

*Report generated automatically by `scripts/estimate-effort-detailed.js`. All metrics adhere to the COCOMO II Post-Architecture Model.*
