import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/patient/patient_bloc.dart';
import '../blocs/analysis/analysis_cubit.dart';
import '../services/clinical_intelligence_service.dart';
import '../services/orcid_service.dart';
import '../services/export_service.dart';
import '../models/patient_types.dart';
import 'report_tabs_widget.dart';
import 'summary_node_widget.dart';
import 'clinical_gauge_widget.dart';
import 'clinical_trend_widget.dart';

class AnalysisReportWidget extends StatefulWidget {
  const AnalysisReportWidget({super.key});

  @override
  State<AnalysisReportWidget> createState() => _AnalysisReportWidgetState();
}
// ... [rest of UI states remain unchanged] ...
class _AnalysisReportWidgetState extends State<AnalysisReportWidget> {
  bool _isChatOpen = false;
  ExportMode _exportMode = ExportMode.standard;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AnalysisCubit, AnalysisState>(
      builder: (context, state) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header with Generate button
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CLINICAL INTELLIGENCE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF416B1F),
                            letterSpacing: 2.0,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Analysis & Care Plan',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF1C1C1C),
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        if (state.reports.isNotEmpty) ...[
                          _buildCognitionToggles(context, state),
                          const SizedBox(width: 16),
                          IconButton(
                            tooltip: 'Export FHIR Bundle',
                            icon: const Icon(Icons.share_outlined, size: 20),
                            onPressed: () => _handleFhirExport(context),
                          ),
                          IconButton(
                            tooltip: 'Print Report',
                            icon: const Icon(Icons.print_outlined, size: 20),
                            onPressed: () => _handleExport(context, state),
                          ),
                        ],
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: state.isLoading && state.reports.isEmpty
                              ? null
                              : () => _handleGenerate(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1C1C1C),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                          ),
                          child: state.isLoading && state.reports.isEmpty
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  'GENERATE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.5,
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Tab Bar
              ReportTabsWidget(
                activeLens: state.activeLens,
                onLensChanged: (lens) {
                  context.read<AnalysisCubit>().changeLens(lens);
                  setState(() => _isChatOpen = false);
                },
              ),

              // Content Area
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: _buildContent(context, state),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCognitionToggles(BuildContext context, AnalysisState state) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
      child: Row(
        children: [
          _buildModeIcon(context, 'clinical', Icons.science_outlined, state.readingLevel == 'clinical'),
          _buildModeIcon(context, 'simplified', Icons.auto_awesome_outlined, state.readingLevel == 'simplified'),
          _buildModeIcon(context, 'dyslexia', Icons.visibility_outlined, state.readingLevel == 'dyslexia'),
          _buildModeIcon(context, 'child', Icons.child_care_outlined, state.readingLevel == 'child'),
        ],
      ),
    );
  }

  Widget _buildModeIcon(BuildContext context, String mode, IconData icon, bool isActive) {
    return IconButton(
      icon: Icon(icon, size: 16, color: isActive ? const Color(0xFF1C1C1C) : Colors.grey),
      onPressed: () => context.read<AnalysisCubit>().changeReadingLevel(mode),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      constraints: const BoxConstraints(),
      visualDensity: VisualDensity.compact,
    );
  }

  Widget _buildContent(BuildContext context, AnalysisState state) {
    if (state.error != null) {
      return Center(
        child: Text(
          'Error: ${state.error}',
          style: const TextStyle(color: Colors.red),
        ),
      );
    }

    final activeReport = state.reports[state.activeLens];

    if (activeReport == null || activeReport.isEmpty) {
      return Center(
        child: Column(
          children: [
            const SizedBox(height: 48),
            Icon(Icons.analytics_outlined, size: 48, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(
              state.isLoading
                  ? 'Analyzing patient data...'
                  : 'No analysis generated for this lens yet.',
              style: TextStyle(color: Colors.grey.shade500),
            ),
            const SizedBox(height: 48),
          ],
        ),
      );
    }

    return Column(
      children: [
        if (state.activeLens == AnalysisLens.summaryOverview) ...[
          const Row(
            children: [
              Expanded(
                child: ClinicalGaugeWidget(
                  label: 'Certainty',
                  value: 8.5,
                  type: GaugeType.certainty,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: ClinicalGaugeWidget(
                  label: 'Stability',
                  value: 7.2,
                  type: GaugeType.stability,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Row(
            children: [
              Expanded(
                child: ClinicalTrendWidget(
                  label: 'Stability',
                  values: [5.0, 5.5, 6.2, 7.0, 7.2],
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: ClinicalTrendWidget(
                  label: 'Complexity',
                  values: [8.0, 7.5, 7.0, 6.8, 6.5],
                  lowerIsBetter: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
        ],
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              const Text(
                'EXPORT MODE:',
                style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0),
              ),
              const SizedBox(width: 12),
              _buildModeChip('STD', ExportMode.standard),
              const SizedBox(width: 8),
              _buildModeChip('COG', ExportMode.cognition),
              const SizedBox(width: 8),
              _buildModeChip('PED', ExportMode.child),
            ],
          ),
        ),
        SummaryNodeWidget(
          title: state.activeLens.title,
          content: activeReport,
          status: VerificationStatus.verified,
          showChat: _isChatOpen,
          chatMessages: state.chatMessages,
          isChatLoading: state.isLoading && state.reports.isNotEmpty,
          onSendMessage: (msg) {
            context.read<AnalysisCubit>().askAgent(msg, context: activeReport);
          },
          onAskAgent: () {
            setState(() => _isChatOpen = !_isChatOpen);
          },
          onClearChat: () {
            context.read<AnalysisCubit>().clearChat();
            setState(() => _isChatOpen = false);
          },
          onExportFhir: () => _handleFhirExport(context),
        ),
      ],
    );
  }

  void _handleGenerate(BuildContext context) async {
    final patientState = context.read<PatientBloc>().state;
    final data = "Goals: ${patientState.patientGoals}";
    
    final orcidService = context.read<OrcidService>();
    final orcidProfile = orcidService.profile;
    
    // Start AI Chat Session
    final intelService = context.read<ClinicalIntelligenceService>();
    await intelService.startChatSession(data, orcidProfile: orcidProfile);
    
    // Generate Report
    if (context.mounted) {
      context.read<AnalysisCubit>().generateComprehensiveReport(data, orcidProfile: orcidProfile);
    }
  }

  void _handleExport(BuildContext context, AnalysisState state) {
    final patientState = context.read<PatientBloc>().state;
    
    // Create a Patient object for the export
    final patient = Patient(
      id: 'p001',
      name: 'Current Patient',
      age: 45,
      gender: 'Unknown',
      lastVisit: 'Today',
      preexistingConditions: const [],
      patientGoals: patientState.patientGoals,
      vitals: patientState.vitals,
      issues: patientState.issues,
      history: const [],
      bookmarks: const [],
    );

    context.read<ExportService>().downloadAsPdf(
          patient: patient,
          reports: state.reports,
          mode: _exportMode,
        );
  }

  void _handleFhirExport(BuildContext context) {
    final patientState = context.read<PatientBloc>().state;
    
    final patient = Patient(
      id: 'p001',
      name: 'Current Patient',
      age: 45,
      gender: 'Unknown',
      lastVisit: 'Today',
      preexistingConditions: const [],
      patientGoals: patientState.patientGoals,
      vitals: patientState.vitals,
      issues: patientState.issues,
    );

    context.read<ExportService>().exportToFhirBundle(patient);
  }

  Widget _buildModeChip(String label, ExportMode mode) {
    final isSelected = _exportMode == mode;
    return GestureDetector(
      onTap: () => setState(() => _exportMode = mode),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF416B1F) : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : Colors.grey.shade600,
          ),
        ),
      ),
    );
  }
}

