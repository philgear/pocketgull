# Feature Parity Matrix

This document maps the components and services from the live Angular site to the new Flutter migration to track feature parity.

| Feature / Base Name | Angular (Live) | Flutter (Migration) | Status |
| :--- | :--- | :--- | :--- |
| **ai cache** | `src/services/ai-cache.service.ts` | - | ❌ Missing in Flutter |
| **ai cache service** | - | `pocketgull_flutter/lib/services/ai_cache_service.dart` | ⚠️ Flutter Only |
| **ai provider.types** | `src/services/ai-provider.types.ts` | - | ❌ Missing in Flutter |
| **analysis container** | `src/components/analysis-container.component.ts` | - | ❌ Missing in Flutter |
| **analysis cubit** | - | `pocketgull_flutter/lib/blocs/analysis/analysis_cubit.dart` | ⚠️ Flutter Only |
| **analysis report** | `src/components/analysis-report.component.ts` | `pocketgull_flutter/lib/widgets/analysis_report_widget.dart` | ✅ Parity |
| **analysis report.types** | `src/components/analysis-report.types.ts` | - | ❌ Missing in Flutter |
| **biometric import** | `src/services/biometric-import.service.ts` | - | ❌ Missing in Flutter |
| **body 3d viewer** | `src/components/body-3d-viewer.component.ts` | - | ❌ Missing in Flutter |
| **body viewer** | `src/components/body-viewer.component.ts` | `pocketgull_flutter/lib/widgets/body_viewer_widget.dart` | ✅ Parity |
| **box breathing wrapper** | - | `pocketgull_flutter/lib/widgets/box_breathing_wrapper.dart` | ⚠️ Flutter Only |
| **clinical gauge** | `src/components/clinical-gauge.component.ts` | `pocketgull_flutter/lib/widgets/clinical_gauge_widget.dart` | ✅ Parity |
| **clinical intelligence** | `src/services/clinical-intelligence.service.ts` | - | ❌ Missing in Flutter |
| **clinical intelligence service** | - | `pocketgull_flutter/lib/services/clinical_intelligence_service.dart` | ⚠️ Flutter Only |
| **clinical trend** | `src/components/clinical-trend.component.ts` | `pocketgull_flutter/lib/widgets/clinical_trend_widget.dart` | ✅ Parity |
| **dictation** | `src/services/dictation.service.ts` | - | ❌ Missing in Flutter |
| **dictation modal** | `src/components/dictation-modal.component.ts` | `pocketgull_flutter/lib/widgets/dictation_modal_widget.dart` | ✅ Parity |
| **dictation service** | - | `pocketgull_flutter/lib/services/dictation_service.dart` | ⚠️ Flutter Only |
| **documentation** | - | `pocketgull_flutter/lib/screens/documentation_screen.dart` | ⚠️ Flutter Only |
| **documentation service** | - | `pocketgull_flutter/lib/services/documentation_service.dart` | ⚠️ Flutter Only |
| **draggable window** | - | `pocketgull_flutter/lib/widgets/draggable_window.dart` | ⚠️ Flutter Only |
| **export** | `src/services/export.service.ts` | - | ❌ Missing in Flutter |
| **export service** | - | `pocketgull_flutter/lib/services/export_service.dart` | ⚠️ Flutter Only |
| **gemini.provider** | `src/services/ai/gemini.provider.ts` | - | ❌ Missing in Flutter |
| **history timeline** | - | `pocketgull_flutter/lib/widgets/history_timeline_widget.dart` | ⚠️ Flutter Only |
| **home** | - | `pocketgull_flutter/lib/screens/home_screen.dart` | ⚠️ Flutter Only |
| **inline agent chat** | - | `pocketgull_flutter/lib/widgets/inline_agent_chat_widget.dart` | ⚠️ Flutter Only |
| **intake form** | `src/components/intake-form.component.ts` | `pocketgull_flutter/lib/widgets/intake_form_widget.dart` | ✅ Parity |
| **intelligence.provider** | `src/services/ai/intelligence.provider.ts` | - | ❌ Missing in Flutter |
| **intelligence.provider.token** | `src/services/ai/intelligence.provider.token.ts` | - | ❌ Missing in Flutter |
| **live agent** | `src/components/live-agent.component.ts` | - | ❌ Missing in Flutter |
| **local intelligence service** | - | `pocketgull_flutter/lib/services/local_intelligence_service.dart` | ⚠️ Flutter Only |
| **markdown** | `src/services/markdown.service.ts` | - | ❌ Missing in Flutter |
| **medical 3d viewer** | `src/components/medical-3d-viewer.component.ts` | - | ❌ Missing in Flutter |
| **medical chart** | `src/components/medical-chart.component.ts` | `pocketgull_flutter/lib/widgets/medical_chart_widget.dart` | ✅ Parity |
| **medical summary** | `src/components/medical-summary.component.ts` | `pocketgull_flutter/lib/widgets/medical_summary_widget.dart` | ✅ Parity |
| **mobile local intelligence** | - | `pocketgull_flutter/lib/services/mobile_local_intelligence.dart` | ⚠️ Flutter Only |
| **native body viewer** | - | `pocketgull_flutter/lib/widgets/native_body_viewer.dart` | ⚠️ Flutter Only |
| **node agent dialog** | `src/components/node-agent-dialog.component.ts` | - | ❌ Missing in Flutter |
| **origami seagull** | - | `pocketgull_flutter/lib/widgets/origami_seagull.dart` | ⚠️ Flutter Only |
| **patient** | - | `pocketgull_flutter/lib/blocs/patient/patient_bloc.dart` | ⚠️ Flutter Only |
| **patient dropdown** | `src/components/patient-dropdown.component.ts` | - | ❌ Missing in Flutter |
| **patient event** | - | `pocketgull_flutter/lib/blocs/patient/patient_event.dart` | ⚠️ Flutter Only |
| **patient history timeline** | `src/components/patient-history-timeline.component.ts` | `pocketgull_flutter/lib/widgets/patient_history_timeline_widget.dart` | ✅ Parity |
| **patient management** | `src/services/patient-management.service.ts` | - | ❌ Missing in Flutter |
| **patient management service** | - | `pocketgull_flutter/lib/services/patient_management_service.dart` | ⚠️ Flutter Only |
| **patient scans** | `src/components/patient-scans.component.ts` | `pocketgull_flutter/lib/widgets/patient_scans_widget.dart` | ✅ Parity |
| **patient state** | `src/services/patient-state.service.ts` | - | ❌ Missing in Flutter |
| **patient.types** | `src/services/patient.types.ts` | - | ❌ Missing in Flutter |
| **pocket gull badge** | `src/components/shared/pocket-gull-badge.component.ts` | - | ❌ Missing in Flutter |
| **pocket gull button** | `src/components/shared/pocket-gull-button.component.ts` | - | ❌ Missing in Flutter |
| **pocket gull card** | `src/components/shared/pocket-gull-card.component.ts` | - | ❌ Missing in Flutter |
| **pocket gull input** | `src/components/shared/pocket-gull-input.component.ts` | - | ❌ Missing in Flutter |
| **report tabs** | - | `pocketgull_flutter/lib/widgets/report_tabs_widget.dart` | ⚠️ Flutter Only |
| **research frame** | `src/components/research-frame.component.ts` | `pocketgull_flutter/lib/widgets/research_frame_widget.dart` | ✅ Parity |
| **reveal** | `src/directives/reveal.directive.ts` | - | ❌ Missing in Flutter |
| **rich media** | `src/services/rich-media.service.ts` | - | ❌ Missing in Flutter |
| **safe html** | `src/pipes/safe-html.pipe.ts` | - | ❌ Missing in Flutter |
| **splash** | - | `pocketgull_flutter/lib/screens/splash_screen.dart` | ⚠️ Flutter Only |
| **summary node** | `src/components/summary-node.component.ts` | `pocketgull_flutter/lib/widgets/summary_node_widget.dart` | ✅ Parity |
| **task flow** | `src/components/task-flow.component.ts` | `pocketgull_flutter/lib/widgets/task_flow_widget.dart` | ✅ Parity |
| **triage board** | - | `pocketgull_flutter/lib/screens/triage_board_screen.dart` | ⚠️ Flutter Only |
| **veo** | `src/services/veo.service.ts` | - | ❌ Missing in Flutter |
| **verify ai** | `src/services/verify-ai.service.ts` | - | ❌ Missing in Flutter |
| **verify ai service** | - | `pocketgull_flutter/lib/services/verify_ai_service.dart` | ⚠️ Flutter Only |
| **visit review** | `src/components/visit-review.component.ts` | `pocketgull_flutter/lib/widgets/visit_review_widget.dart` | ✅ Parity |
| **voice assistant** | `src/components/voice-assistant.component.ts` | `pocketgull_flutter/lib/widgets/voice_assistant_widget.dart` | ✅ Parity |
| **web local intelligence** | - | `pocketgull_flutter/lib/services/web_local_intelligence.dart` | ⚠️ Flutter Only |

## Summary
- **Matched Features**: 15
- **Missing in Flutter (Needs Migration)**: 29
- **Flutter Only (New Features/Architecture)**: 24
