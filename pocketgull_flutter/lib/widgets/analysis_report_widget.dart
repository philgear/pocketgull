import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/patient/patient_bloc.dart';
import '../blocs/analysis/analysis_cubit.dart';
import '../services/clinical_intelligence_service.dart';
import '../services/export_service.dart';
import '../models/patient_types.dart';

class AnalysisReportWidget extends StatelessWidget {
  const AnalysisReportWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AnalysisCubit, AnalysisState>(
      builder: (context, analysisState) {
        return Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Analysis & Care Plan',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    ElevatedButton.icon(
                      onPressed: analysisState.isLoading 
                        ? null 
                        : () {
                            final patientState = context.read<PatientBloc>().state;
                            // Serialize patient state as context
                            final data = "Goals: ${patientState.patientGoals}";
                            context.read<AnalysisCubit>().generateComprehensiveReport(data);
                          },
                      icon: analysisState.isLoading 
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.analytics),
                      label: Text(analysisState.isLoading ? 'Generating...' : 'Generate'),
                    ),
                    if (analysisState.reports.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.print),
                        tooltip: 'Print Report',
                        onPressed: () {
                          // Mock patient data for now until we have PatientManagementService
                          final mockPatient = Patient(
                            id: 'p001',
                            name: 'Current Patient',
                            age: 45,
                            gender: 'Unknown',
                            lastVisit: 'Today',
                            preexistingConditions: [],
                            patientGoals: context.read<PatientBloc>().state.patientGoals,
                            vitals: context.read<PatientBloc>().state.vitals,
                            issues: context.read<PatientBloc>().state.issues,
                            history: [],
                            bookmarks: [],
                            scans: [],
                          );
                          ExportService().downloadAsPdf(
                            patient: mockPatient, 
                            reports: analysisState.reports
                          );
                        },
                      )
                  ],
                ),
                const SizedBox(height: 16),
                if (analysisState.error != null)
                  Text('Error: ${analysisState.error}', style: const TextStyle(color: Colors.red)),
                
                if (analysisState.reports.isEmpty && !analysisState.isLoading)
                  const Text('AI Care Plan will appear here based on the patient state.'),
                
                ...AnalysisLens.values.map((lens) {
                  final report = analysisState.reports[lens];
                  if (report == null || report.isEmpty) return const SizedBox.shrink();
                  
                  return Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(lens.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 8),
                        Text(report),
                        const Divider(),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }
}
