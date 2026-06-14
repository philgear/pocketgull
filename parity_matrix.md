# Feature Parity Matrix

> **Governed by ACM Code of Ethics §2.5 (Comprehensive & Thorough) and IEEE SWEBOK Requirements KA.**
> All ✅ Parity entries must satisfy the acceptance criteria defined in the [Acceptance Criteria](#acceptance-criteria) section before being considered production-ready.

This document maps the components and services from the live Angular site to the new Flutter migration to track feature parity.

## Acceptance Criteria

Each feature is considered at ✅ **Parity** only when **all** of the following are true:

| AC ID | Criterion | IEEE SWEBOK KA |
|---|---|---|
| AC-01 | `dart analyze` reports zero issues for the file | Construction |
| AC-02 | The service is registered in `main.dart` as a `RepositoryProvider` | Architecture |
| AC-03 | At least one unit test exists covering the primary method(s) | Testing |
| AC-04 | All outbound HTTP calls use HTTPS (TLS assertion via `_assertTls` or equivalent) | Security |
| AC-05 | No PHI is written to `debugPrint`, logs, or local storage keys | Privacy / ACM §1.6 |
| AC-06 | All AI invocations are logged via `AuditService.logAiCall(...)` | ACM §1.7 |
| AC-07 | Feature is exercised by at least one e2e or integration test | Testing |

> **Note on AC-03/AC-07:** Tests are not yet required to pass CI gate (Sprint 3 introduces the gate). Features migrated before Sprint 3 must be back-filled in Sprint 4.

---

| Feature / Base Name | Angular (Live) | Flutter (Migration) | Status | AC Met |
| :--- | :--- | :--- | :--- | :--- |
| **adk live** | `src/services/ai/adk-live.service.ts` | `pocketgull_flutter/lib/services/adk_live_service.dart` | ✅ Parity |
| **ai cache** | `src/services/ai-cache.service.ts` | - | ❌ Missing in Flutter |
| **ai cache service** | - | `pocketgull_flutter/lib/services/ai_cache_service.dart` | ⚠️ Flutter Only |
| **ai provider.types** | `src/services/ai-provider.types.ts` | - | ❌ Missing in Flutter |
| **ambient lighting** | `src/services/ambient-lighting.service.ts` | - | ❌ Missing in Flutter |
| **analysis container** | `src/components/analysis-container.component.ts` | - | ❌ Missing in Flutter |
| **analysis cubit** | - | `pocketgull_flutter/lib/blocs/analysis/analysis_cubit.dart` | ⚠️ Flutter Only |
| **analysis report** | `src/components/analysis-report.component.ts` | `pocketgull_flutter/lib/widgets/analysis_report_widget.dart` | ✅ Parity |
| **analysis report.types** | `src/components/analysis-report.types.ts` | - | ❌ Missing in Flutter |
| **athletic protocol** | `src/services/athletic-protocol.service.ts` | - | ❌ Missing in Flutter |
| **audit** | `src/services/audit.service.ts` | - | ❌ Missing in Flutter |
| **auth** | `src/services/auth.service.ts` | - | ❌ Missing in Flutter |
| **biomarker matrix** | `src/components/biomarker-matrix.component.ts` | - | ❌ Missing in Flutter |
| **biometric history chart** | `src/components/biometric-history-chart.component.ts` | - | ❌ Missing in Flutter |
| **biometric import** | `src/services/biometric-import.service.ts` | - | ❌ Missing in Flutter |
| **body 3d viewer** | `src/components/body-3d-viewer.component.ts` | - | ❌ Missing in Flutter |
| **body viewer** | `src/components/body-viewer.component.ts` | `pocketgull_flutter/lib/widgets/body_viewer_widget.dart` | ✅ Parity |
| **box breathing wrapper** | - | `pocketgull_flutter/lib/widgets/box_breathing_wrapper.dart` | ⚠️ Flutter Only |
| **circadian sleepiness** | `src/services/circadian-sleepiness.service.ts` | - | ❌ Missing in Flutter |
| **clinical gauge** | `src/components/clinical-gauge.component.ts` | `pocketgull_flutter/lib/widgets/clinical_gauge_widget.dart` | ✅ Parity |
| **clinical intelligence** | `src/services/clinical-intelligence.service.ts` | - | ❌ Missing in Flutter |
| **clinical intelligence service** | - | `pocketgull_flutter/lib/services/clinical_intelligence_service.dart` | ⚠️ Flutter Only |
| **clinical trend** | `src/components/clinical-trend.component.ts` | `pocketgull_flutter/lib/widgets/clinical_trend_widget.dart` | ✅ Parity |
| **collaboration** | `src/services/collaboration.service.ts` | - | ❌ Missing in Flutter |
| **collaboration dock** | `src/components/collaboration-dock.component.ts` | - | ❌ Missing in Flutter |
| **dicom** | `src/services/dicom.service.ts` | - | ❌ Missing in Flutter |
| **dicom viewer** | `src/components/dicom-viewer.component.ts` | - | ❌ Missing in Flutter |
| **dictation** | `src/services/dictation.service.ts` | - | ❌ Missing in Flutter |
| **dictation modal** | `src/components/dictation-modal.component.ts` | `pocketgull_flutter/lib/widgets/dictation_modal_widget.dart` | ✅ Parity |
| **dictation service** | - | `pocketgull_flutter/lib/services/dictation_service.dart` | ⚠️ Flutter Only |
| **doc consciousness** | `src/components/doc-consciousness.component.ts` | - | ❌ Missing in Flutter |
| **doc protocol** | `src/services/doc-protocol.service.ts` | - | ❌ Missing in Flutter |
| **documentation** | - | `pocketgull_flutter/lib/screens/documentation_screen.dart` | ⚠️ Flutter Only |
| **documentation service** | - | `pocketgull_flutter/lib/services/documentation_service.dart` | ⚠️ Flutter Only |
| **draggable window** | - | `pocketgull_flutter/lib/widgets/draggable_window.dart` | ⚠️ Flutter Only |
| **export** | `src/services/export.service.ts` | - | ❌ Missing in Flutter |
| **export service** | - | `pocketgull_flutter/lib/services/export_service.dart` | ⚠️ Flutter Only |
| **fhir callback** | `src/components/fhir-callback.component.ts` | - | ❌ Missing in Flutter |
| **fhir integration** | `src/services/fhir-integration.service.ts` | `pocketgull_flutter/lib/services/fhir_integration_service.dart` | ✅ Parity |
| **firestore sync** | `src/services/firestore-sync.service.ts` | - | ❌ Missing in Flutter |
| **fitbit** | `src/services/fitbit.service.ts` | - | ❌ Missing in Flutter |
| **gamification** | `src/services/gamification.service.ts` | - | ❌ Missing in Flutter |
| **gemini.provider** | `src/services/ai/gemini.provider.ts` | - | ❌ Missing in Flutter |
| **hardware telemetry** | `src/services/hardware-telemetry.service.ts` | - | ❌ Missing in Flutter |
| **history timeline** | - | `pocketgull_flutter/lib/widgets/history_timeline_widget.dart` | ⚠️ Flutter Only |
| **home** | - | `pocketgull_flutter/lib/screens/home_screen.dart` | ⚠️ Flutter Only |
| **hybrid.provider** | `src/services/ai/hybrid.provider.ts` | - | ❌ Missing in Flutter |
| **image optimization** | `src/services/image-optimization.service.ts` | - | ❌ Missing in Flutter |
| **import** | `src/services/import.service.ts` | - | ❌ Missing in Flutter |
| **inline agent chat** | - | `pocketgull_flutter/lib/widgets/inline_agent_chat_widget.dart` | ⚠️ Flutter Only |
| **intake form** | `src/components/intake-form.component.ts` | `pocketgull_flutter/lib/widgets/intake_form_widget.dart` | ✅ Parity |
| **intelligence.provider** | `src/services/ai/intelligence.provider.ts` | - | ❌ Missing in Flutter |
| **intelligence.provider.token** | `src/services/ai/intelligence.provider.token.ts` | - | ❌ Missing in Flutter |
| **lifestyle adjunct** | `src/services/lifestyle-adjunct.service.ts` | - | ❌ Missing in Flutter |
| **live agent** | `src/components/live-agent.component.ts` | - | ❌ Missing in Flutter |
| **live agent visuals** | `src/components/live-agent-visuals.component.ts` | - | ❌ Missing in Flutter |
| **local intelligence service** | - | `pocketgull_flutter/lib/services/local_intelligence_service.dart` | ⚠️ Flutter Only |
| **markdown** | `src/services/markdown.service.ts` | - | ❌ Missing in Flutter |
| **medical 3d viewer** | `src/components/medical-3d-viewer.component.ts` | - | ❌ Missing in Flutter |
| **medical chart** | `src/components/medical-chart.component.ts` | `pocketgull_flutter/lib/widgets/medical_chart_widget.dart` | ✅ Parity |
| **medical summary** | `src/components/medical-summary.component.ts` | `pocketgull_flutter/lib/widgets/medical_summary_widget.dart` | ✅ Parity |
| **metric card** | `src/components/shared/metric-card.component.ts` | - | ❌ Missing in Flutter |
| **mobile local intelligence** | - | `pocketgull_flutter/lib/services/mobile_local_intelligence.dart` | ⚠️ Flutter Only |
| **nano.provider** | `src/services/ai/nano.provider.ts` | - | ❌ Missing in Flutter |
| **native body viewer** | - | `pocketgull_flutter/lib/widgets/native_body_viewer.dart` | ⚠️ Flutter Only |
| **network state** | `src/services/network-state.service.ts` | - | ❌ Missing in Flutter |
| **node agent dialog** | `src/components/node-agent-dialog.component.ts` | - | ❌ Missing in Flutter |
| **ohif viewer** | `src/components/ohif-viewer.component.ts` | - | ❌ Missing in Flutter |
| **orcid** | `src/services/orcid.service.ts` | - | ❌ Missing in Flutter |
| **orcid service** | - | `pocketgull_flutter/lib/services/orcid_service.dart` | ⚠️ Flutter Only |
| **origami seagull** | - | `pocketgull_flutter/lib/widgets/origami_seagull.dart` | ⚠️ Flutter Only |
| **patient** | - | `pocketgull_flutter/lib/blocs/patient/patient_bloc.dart` | ⚠️ Flutter Only |
| **patient directory** | `src/components/patient-directory.component.ts` | - | ❌ Missing in Flutter |
| **patient dropdown** | `src/components/patient-dropdown.component.ts` | - | ❌ Missing in Flutter |
| **patient event** | - | `pocketgull_flutter/lib/blocs/patient/patient_event.dart` | ⚠️ Flutter Only |
| **patient history timeline** | `src/components/patient-history-timeline.component.ts` | `pocketgull_flutter/lib/widgets/patient_history_timeline_widget.dart` | ✅ Parity |
| **patient management** | `src/services/patient-management.service.ts` | - | ❌ Missing in Flutter |
| **patient management service** | - | `pocketgull_flutter/lib/services/patient_management_service.dart` | ⚠️ Flutter Only |
| **patient scans** | `src/components/patient-scans.component.ts` | `pocketgull_flutter/lib/widgets/patient_scans_widget.dart` | ✅ Parity |
| **patient state** | `src/services/patient-state.service.ts` | `pocketgull_flutter/lib/services/patient_state_service.dart` | ✅ Parity |
| **patient vitals chart** | `src/components/patient-vitals-chart.component.ts` | - | ❌ Missing in Flutter |
| **patient.types** | `src/services/patient.types.ts` | - | ❌ Missing in Flutter |
| **pet auditory** | `src/services/pet-auditory.service.ts` | - | ❌ Missing in Flutter |
| **pocket gull badge** | `src/components/shared/pocket-gull-badge.component.ts` | - | ❌ Missing in Flutter |
| **pocket gull button** | `src/components/shared/pocket-gull-button.component.ts` | - | ❌ Missing in Flutter |
| **pocket gull card** | `src/components/shared/pocket-gull-card.component.ts` | - | ❌ Missing in Flutter |
| **pocket gull input** | `src/components/shared/pocket-gull-input.component.ts` | - | ❌ Missing in Flutter |
| **pubgemma.provider** | `src/services/ai/pubgemma.provider.ts` | - | ❌ Missing in Flutter |
| **python bridge** | `src/services/python-bridge.service.ts` | - | ❌ Missing in Flutter |
| **radiology.agent** | `src/services/ai/agents/radiology.agent.ts` | - | ❌ Missing in Flutter |
| **report tabs** | - | `pocketgull_flutter/lib/widgets/report_tabs_widget.dart` | ⚠️ Flutter Only |
| **research frame** | `src/components/research-frame.component.ts` | `pocketgull_flutter/lib/widgets/research_frame_widget.dart` | ✅ Parity |
| **reveal** | `src/directives/reveal.directive.ts` | - | ❌ Missing in Flutter |
| **rich media** | `src/services/rich-media.service.ts` | - | ❌ Missing in Flutter |
| **rules engine** | `src/services/rules-engine.service.ts` | - | ❌ Missing in Flutter |
| **safe html** | `src/pipes/safe-html.pipe.ts` | - | ❌ Missing in Flutter |
| **safe html new** | `src/pipes/safe-html-new.pipe.ts` | - | ❌ Missing in Flutter |
| **secure splash** | `src/components/secure-splash.component.ts` | - | ❌ Missing in Flutter |
| **sentinel triage** | `src/components/sentinel-triage.component.ts` | - | ❌ Missing in Flutter |
| **session state** | `src/services/session-state.service.ts` | - | ❌ Missing in Flutter |
| **splash** | - | `pocketgull_flutter/lib/screens/splash_screen.dart` | ⚠️ Flutter Only |
| **storage** | `src/services/storage.service.ts` | - | ❌ Missing in Flutter |
| **stress intervention** | `src/services/stress-intervention.service.ts` | - | ❌ Missing in Flutter |
| **summary node** | `src/components/summary-node.component.ts` | `pocketgull_flutter/lib/widgets/summary_node_widget.dart` | ✅ Parity |
| **task flow** | `src/components/task-flow.component.ts` | `pocketgull_flutter/lib/widgets/task_flow_widget.dart` | ✅ Parity |
| **theme** | `src/services/theme.service.ts` | - | ❌ Missing in Flutter |
| **triage board** | - | `pocketgull_flutter/lib/screens/triage_board_screen.dart` | ⚠️ Flutter Only |
| **veo** | `src/services/veo.service.ts` | - | ❌ Missing in Flutter |
| **verify ai** | `src/services/verify-ai.service.ts` | - | ❌ Missing in Flutter |
| **verify ai service** | - | `pocketgull_flutter/lib/services/verify_ai_service.dart` | ⚠️ Flutter Only |
| **visit review** | `src/components/visit-review.component.ts` | `pocketgull_flutter/lib/widgets/visit_review_widget.dart` | ✅ Parity |
| **voice assistant** | `src/components/voice-assistant.component.ts` | `pocketgull_flutter/lib/widgets/voice_assistant_widget.dart` | ✅ Parity |
| **walkthrough tour** | `src/components/walkthrough-tour.component.ts`<br>`src/services/walkthrough-tour.service.ts` | - | ❌ Missing in Flutter |
| **web local intelligence** | - | `pocketgull_flutter/lib/services/web_local_intelligence.dart` | ⚠️ Flutter Only |
| **webllm.provider** | `src/services/ai/webllm.provider.ts` | - | ❌ Missing in Flutter |

## Summary
- **Matched Features**: 21
- **Missing in Flutter (Needs Migration)**: 69
- **Flutter Only (New Features/Architecture)**: 28

## Sprint Log
| Sprint | Date | Items Shipped | New Match Count |
|---|---|---|---|
| Sprint 1 | 2026-06-14 | `PatientStateService`, `FhirIntegrationService`, `AdkLiveService` (+ `Patient.copyWith`, AI proxy unlock) | 15 → 18 |
| Sprint 2 | 2026-06-14 | `ThemeService`, `PatientSelectorWidget`, `LiveConsultScreen`, `HomeScreen` AppBar wiring | 18 → 21 |
