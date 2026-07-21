# Feature Parity Matrix

This document maps the components and services from the live Angular site to the new Flutter migration to track feature parity.

| Feature / Base Name | Angular (Live) | Flutter (Migration) | Status |
| :--- | :--- | :--- | :--- |
| **adk live** | `src\services\ai\adk-live.service.ts` | - | ❌ Missing in Flutter |
| **agent personas** | `src\services\agent-personas.ts` | - | ❌ Missing in Flutter |
| **ai cache** | `src\services\ai-cache.service.ts` | `pocketgull_flutter\lib\services\ai_cache_service.dart` | ✅ Parity |
| **ai provider** | - | `pocketgull_flutter\lib\models\ai_provider_types.dart` | ⚠️ Flutter Only |
| **ai provider.types** | `src\services\ai-provider.types.ts` | - | ❌ Missing in Flutter |
| **ambient lighting** | `src\services\ambient-lighting.service.ts` | `pocketgull_flutter\lib\services\ambient_lighting_service.dart` | ✅ Parity |
| **analysis** | - | `pocketgull_flutter\lib\providers\analysis_provider.dart` | ⚠️ Flutter Only |
| **analysis container** | `src\components\analysis-container.component.ts` | - | ❌ Missing in Flutter |
| **analysis report** | `src\components\analysis-report.component.ts` | `pocketgull_flutter\lib\widgets\analysis_report_widget.dart`<br>`pocketgull_flutter\lib\models\analysis_report_types.dart` | ✅ Parity |
| **analysis report.types** | `src\components\analysis-report.types.ts` | - | ❌ Missing in Flutter |
| **app colors** | - | `pocketgull_flutter\lib\theme\app_colors.dart` | ⚠️ Flutter Only |
| **app theme** | - | `pocketgull_flutter\lib\theme\app_theme.dart` | ⚠️ Flutter Only |
| **athletic protocol** | `src\services\athletic-protocol.service.ts` | - | ❌ Missing in Flutter |
| **audit** | `src\services\audit.service.ts` | `pocketgull_flutter\lib\services\audit_service.dart` | ✅ Parity |
| **auth** | `src\services\auth.service.ts` | `pocketgull_flutter\lib\services\auth_service.dart` | ✅ Parity |
| **biomarker matrix** | `src\components\biomarker-matrix.component.ts` | - | ❌ Missing in Flutter |
| **biometric history chart** | `src\components\biometric-history-chart.component.ts` | - | ❌ Missing in Flutter |
| **biometric import** | `src\services\biometric-import.service.ts` | - | ❌ Missing in Flutter |
| **body 3d viewer** | `src\components\body-3d-viewer.component.ts` | - | ❌ Missing in Flutter |
| **body part geometry** | - | `pocketgull_flutter\lib\models\body_part_geometry.dart` | ⚠️ Flutter Only |
| **body viewer** | `src\components\body-viewer.component.ts` | `pocketgull_flutter\lib\widgets\body_viewer_widget.dart` | ✅ Parity |
| **box breathing wrapper** | - | `pocketgull_flutter\lib\widgets\box_breathing_wrapper.dart` | ⚠️ Flutter Only |
| **chat message** | - | `pocketgull_flutter\lib\models\chat_message.dart` | ⚠️ Flutter Only |
| **circadian** | - | `pocketgull_flutter\lib\models\circadian_types.dart` | ⚠️ Flutter Only |
| **circadian sleepiness** | `src\services\circadian-sleepiness.service.ts` | `pocketgull_flutter\lib\services\circadian_sleepiness_service.dart` | ✅ Parity |
| **clinical gauge** | `src\components\clinical-gauge.component.ts` | `pocketgull_flutter\lib\widgets\clinical_gauge_widget.dart` | ✅ Parity |
| **clinical intelligence** | `src\services\clinical-intelligence.service.ts` | `pocketgull_flutter\lib\services\clinical_intelligence_service.dart` | ✅ Parity |
| **clinical prompts** | `src\services\clinical-prompts.ts` | `pocketgull_flutter\lib\services\clinical_prompts.dart` | ✅ Parity |
| **clinical risk calculator** | - | `pocketgull_flutter\lib\services\clinical_risk_calculator.dart` | ⚠️ Flutter Only |
| **clinical trend** | `src\components\clinical-trend.component.ts` | `pocketgull_flutter\lib\widgets\clinical_trend_widget.dart` | ✅ Parity |
| **collaboration** | `src\services\collaboration.service.ts` | - | ❌ Missing in Flutter |
| **collaboration dock** | `src\components\collaboration-dock.component.ts` | - | ❌ Missing in Flutter |
| **consent** | `src\services\consent.service.ts` | - | ❌ Missing in Flutter |
| **consent modal** | `src\components\consent-modal.component.ts` | - | ❌ Missing in Flutter |
| **cost benefit analysis** | `src\components\cost-benefit-analysis.component.ts` | - | ❌ Missing in Flutter |
| **dashboard** | - | `pocketgull_flutter\lib\screens\dashboard_screen.dart` | ⚠️ Flutter Only |
| **data** | `src\services\ybocs\data.ts` | - | ❌ Missing in Flutter |
| **dicom** | `src\services\dicom.service.ts` | - | ❌ Missing in Flutter |
| **dicom viewer** | `src\components\dicom-viewer.component.ts` | - | ❌ Missing in Flutter |
| **dictation** | `src\services\dictation.service.ts` | `pocketgull_flutter\lib\services\dictation_service.dart` | ✅ Parity |
| **dictation modal** | `src\components\dictation-modal.component.ts` | `pocketgull_flutter\lib\widgets\dictation_modal_widget.dart` | ✅ Parity |
| **doc consciousness** | `src\components\doc-consciousness.component.ts` | - | ❌ Missing in Flutter |
| **doc protocol** | `src\services\doc-protocol.service.ts` | - | ❌ Missing in Flutter |
| **documentation** | - | `pocketgull_flutter\lib\screens\documentation_screen.dart`<br>`pocketgull_flutter\lib\services\documentation_service.dart` | ⚠️ Flutter Only |
| **draggable window** | - | `pocketgull_flutter\lib\widgets\draggable_window.dart` | ⚠️ Flutter Only |
| **export** | `src\services\export.service.ts` | `pocketgull_flutter\lib\services\export_service.dart` | ✅ Parity |
| **fhir callback** | `src\components\fhir-callback.component.ts` | - | ❌ Missing in Flutter |
| **fhir integration** | `src\services\fhir-integration.service.ts` | `pocketgull_flutter\lib\services\fhir_integration_service.dart` | ✅ Parity |
| **firestore sync** | `src\services\firestore-sync.service.ts` | - | ❌ Missing in Flutter |
| **fitbit** | `src\services\fitbit.service.ts` | - | ❌ Missing in Flutter |
| **gamification** | `src\services\gamification.service.ts` | - | ❌ Missing in Flutter |
| **gemini.provider** | `src\services\ai\gemini.provider.ts` | - | ❌ Missing in Flutter |
| **glass container** | - | `pocketgull_flutter\lib\widgets\ui\glass_container.dart` | ⚠️ Flutter Only |
| **hardware telemetry** | `src\services\hardware-telemetry.service.ts` | - | ❌ Missing in Flutter |
| **history timeline** | - | `pocketgull_flutter\lib\widgets\history_timeline_widget.dart` | ⚠️ Flutter Only |
| **home** | - | `pocketgull_flutter\lib\screens\home_screen.dart` | ⚠️ Flutter Only |
| **hybrid.provider** | `src\services\ai\hybrid.provider.ts` | - | ❌ Missing in Flutter |
| **image optimization** | `src\services\image-optimization.service.ts` | - | ❌ Missing in Flutter |
| **import** | `src\services\import.service.ts` | `pocketgull_flutter\lib\services\import_service.dart` | ✅ Parity |
| **inline agent chat** | - | `pocketgull_flutter\lib\widgets\inline_agent_chat_widget.dart` | ⚠️ Flutter Only |
| **insight card** | `src\components\synthesis\insight-card.component.ts` | - | ❌ Missing in Flutter |
| **insight grid** | `src\components\synthesis\insight-grid.component.ts` | - | ❌ Missing in Flutter |
| **intake form** | `src\components\intake-form.component.ts` | `pocketgull_flutter\lib\widgets\intake_form_widget.dart` | ✅ Parity |
| **intelligence.provider** | `src\services\ai\intelligence.provider.ts` | - | ❌ Missing in Flutter |
| **intelligence.provider.token** | `src\services\ai\intelligence.provider.token.ts` | - | ❌ Missing in Flutter |
| **knowledge synthesis** | `src\services\knowledge-synthesis.service.ts` | - | ❌ Missing in Flutter |
| **lifestyle adjunct** | `src\services\lifestyle-adjunct.service.ts` | - | ❌ Missing in Flutter |
| **live agent** | `src\components\live-agent.component.ts` | - | ❌ Missing in Flutter |
| **live agent visuals** | `src\components\live-agent-visuals.component.ts` | - | ❌ Missing in Flutter |
| **local intelligence** | - | `pocketgull_flutter\lib\services\local_intelligence_service.dart` | ⚠️ Flutter Only |
| **markdown** | `src\services\markdown.service.ts` | - | ❌ Missing in Flutter |
| **medical 3d viewer** | `src\components\medical-3d-viewer.component.ts` | - | ❌ Missing in Flutter |
| **medical chart** | `src\components\medical-chart.component.ts` | `pocketgull_flutter\lib\widgets\medical_chart_widget.dart` | ✅ Parity |
| **medical summary** | `src\components\medical-summary.component.ts` | `pocketgull_flutter\lib\widgets\medical_summary_widget.dart` | ✅ Parity |
| **metric card** | `src\components\shared\metric-card.component.ts` | `pocketgull_flutter\lib\widgets\metric_card_widget.dart`<br>`pocketgull_flutter\lib\widgets\ui\metric_card.dart` | ✅ Parity |
| **mobile local intelligence** | - | `pocketgull_flutter\lib\services\mobile_local_intelligence.dart` | ⚠️ Flutter Only |
| **nano.provider** | `src\services\ai\nano.provider.ts` | - | ❌ Missing in Flutter |
| **native body viewer** | - | `pocketgull_flutter\lib\widgets\native_body_viewer.dart` | ⚠️ Flutter Only |
| **network state** | `src\services\network-state.service.ts` | - | ❌ Missing in Flutter |
| **node agent dialog** | `src\components\node-agent-dialog.component.ts` | - | ❌ Missing in Flutter |
| **ohif viewer** | `src\components\ohif-viewer.component.ts` | - | ❌ Missing in Flutter |
| **orcid** | `src\services\orcid.service.ts` | `pocketgull_flutter\lib\services\orcid_service.dart` | ✅ Parity |
| **orcid profile** | - | `pocketgull_flutter\lib\models\orcid_profile.dart` | ⚠️ Flutter Only |
| **origami seagull** | - | `pocketgull_flutter\lib\widgets\origami_seagull.dart` | ⚠️ Flutter Only |
| **patient** | - | `pocketgull_flutter\lib\providers\patient_provider.dart`<br>`pocketgull_flutter\lib\models\patient_types.dart` | ⚠️ Flutter Only |
| **patient directory** | `src\components\patient-directory.component.ts` | `pocketgull_flutter\lib\widgets\patient_directory_widget.dart` | ✅ Parity |
| **patient dropdown** | `src\components\patient-dropdown.component.ts` | `pocketgull_flutter\lib\widgets\patient_dropdown_widget.dart` | ✅ Parity |
| **patient history timeline** | `src\components\patient-history-timeline.component.ts` | `pocketgull_flutter\lib\widgets\patient_history_timeline_widget.dart` | ✅ Parity |
| **patient management** | `src\services\patient-management.service.ts` | `pocketgull_flutter\lib\services\patient_management_service.dart`<br>`pocketgull_flutter\lib\providers\patient_management_provider.dart` | ✅ Parity |
| **patient scans** | `src\components\patient-scans.component.ts` | `pocketgull_flutter\lib\widgets\patient_scans_widget.dart` | ✅ Parity |
| **patient state** | `src\services\patient-state.service.ts` | - | ❌ Missing in Flutter |
| **patient vitals chart** | `src\components\patient-vitals-chart.component.ts` | `pocketgull_flutter\lib\widgets\patient_vitals_chart_widget.dart` | ✅ Parity |
| **patient.types** | `src\services\patient.types.ts` | - | ❌ Missing in Flutter |
| **pet auditory** | `src\services\pet-auditory.service.ts` | - | ❌ Missing in Flutter |
| **pocket gull badge** | `src\components\shared\pocket-gull-badge.component.ts` | `pocketgull_flutter\lib\widgets\pocket_gull_badge_widget.dart` | ✅ Parity |
| **pocket gull button** | `src\components\shared\pocket-gull-button.component.ts` | `pocketgull_flutter\lib\widgets\pocket_gull_button_widget.dart` | ✅ Parity |
| **pocket gull card** | `src\components\shared\pocket-gull-card.component.ts` | `pocketgull_flutter\lib\widgets\pocket_gull_card_widget.dart` | ✅ Parity |
| **pocket gull input** | `src\components\shared\pocket-gull-input.component.ts` | `pocketgull_flutter\lib\widgets\pocket_gull_input_widget.dart` | ✅ Parity |
| **primary button** | - | `pocketgull_flutter\lib\widgets\ui\primary_button.dart` | ⚠️ Flutter Only |
| **pubgemma.provider** | `src\services\ai\pubgemma.provider.ts` | - | ❌ Missing in Flutter |
| **python bridge** | `src\services\python-bridge.service.ts` | - | ❌ Missing in Flutter |
| **radiology.agent** | `src\services\ai\agents\radiology.agent.ts` | - | ❌ Missing in Flutter |
| **report tabs** | - | `pocketgull_flutter\lib\widgets\report_tabs_widget.dart` | ⚠️ Flutter Only |
| **research frame** | `src\components\research-frame.component.ts` | `pocketgull_flutter\lib\widgets\research_frame_widget.dart` | ✅ Parity |
| **research tab** | `src\components\research-tab.component.ts` | - | ❌ Missing in Flutter |
| **reveal** | `src\directives\reveal.directive.ts` | - | ❌ Missing in Flutter |
| **rich media** | `src\services\rich-media.service.ts` | - | ❌ Missing in Flutter |
| **risk score** | - | `pocketgull_flutter\lib\providers\risk_score_provider.dart` | ⚠️ Flutter Only |
| **rules engine** | `src\services\rules-engine.service.ts` | `pocketgull_flutter\lib\services\rules_engine_service.dart` | ✅ Parity |
| **safe html** | `src\pipes\safe-html.pipe.ts` | - | ❌ Missing in Flutter |
| **safe html new** | `src\pipes\safe-html-new.pipe.ts` | - | ❌ Missing in Flutter |
| **secure key** | `src\services\secure-key.ts` | - | ❌ Missing in Flutter |
| **secure splash** | `src\components\secure-splash.component.ts` | - | ❌ Missing in Flutter |
| **sentinel triage** | `src\components\sentinel-triage.component.ts` | - | ❌ Missing in Flutter |
| **serene intake** | `src\components\synthesis\serene-intake.component.ts` | - | ❌ Missing in Flutter |
| **services providers** | - | `pocketgull_flutter\lib\providers\services_providers.dart` | ⚠️ Flutter Only |
| **session state** | `src\services\session-state.service.ts` | `pocketgull_flutter\lib\services\session_state_service.dart` | ✅ Parity |
| **splash** | - | `pocketgull_flutter\lib\screens\splash_screen.dart` | ⚠️ Flutter Only |
| **storage** | `src\services\storage.service.ts` | `pocketgull_flutter\lib\services\storage_service.dart` | ✅ Parity |
| **stress intervention** | `src\services\stress-intervention.service.ts` | - | ❌ Missing in Flutter |
| **summary node** | `src\components\summary-node.component.ts` | `pocketgull_flutter\lib\widgets\summary_node_widget.dart` | ✅ Parity |
| **synthesis dashboard** | `src\components\synthesis\synthesis-dashboard.component.ts` | - | ❌ Missing in Flutter |
| **task flow** | `src\components\task-flow.component.ts` | `pocketgull_flutter\lib\widgets\task_flow_widget.dart` | ✅ Parity |
| **theme** | `src\services\theme.service.ts` | - | ❌ Missing in Flutter |
| **triage board** | - | `pocketgull_flutter\lib\screens\triage_board_screen.dart` | ⚠️ Flutter Only |
| **types** | `src\services\ybocs\types.ts` | - | ❌ Missing in Flutter |
| **veo** | `src\services\veo.service.ts` | - | ❌ Missing in Flutter |
| **verify ai** | `src\services\verify-ai.service.ts` | `pocketgull_flutter\lib\services\verify_ai_service.dart` | ✅ Parity |
| **visit review** | `src\components\visit-review.component.ts` | `pocketgull_flutter\lib\widgets\visit_review_widget.dart` | ✅ Parity |
| **voice assistant** | `src\components\voice-assistant.component.ts` | `pocketgull_flutter\lib\widgets\voice_assistant_widget.dart` | ✅ Parity |
| **walkthrough tour** | `src\components\walkthrough-tour.component.ts`<br>`src\services\walkthrough-tour.service.ts` | - | ❌ Missing in Flutter |
| **web local intelligence** | - | `pocketgull_flutter\lib\services\web_local_intelligence.dart` | ⚠️ Flutter Only |
| **webllm.provider** | `src\services\ai\webllm.provider.ts` | - | ❌ Missing in Flutter |
| **ybocs** | `src\services\ybocs\ybocs.service.ts` | - | ❌ Missing in Flutter |
| **ybocs screener** | `src\components\ybocs-screener.component.ts` | - | ❌ Missing in Flutter |
| **zamecznik canvas** | `src\components\shared\zamecznik-canvas.component.ts` | - | ❌ Missing in Flutter |

## Summary
- **Matched Features**: 40
- **Missing in Flutter (Needs Migration)**: 67
- **Flutter Only (New Features/Architecture)**: 29
