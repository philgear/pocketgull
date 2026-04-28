import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/clinical_intelligence_service.dart';

class AnalysisState {
  final bool isLoading;
  final String? error;
  final Map<AnalysisLens, String> reports;

  const AnalysisState({
    this.isLoading = false,
    this.error,
    this.reports = const {},
  });

  AnalysisState copyWith({
    bool? isLoading,
    String? error,
    Map<AnalysisLens, String>? reports,
  }) {
    return AnalysisState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      reports: reports ?? this.reports,
    );
  }
}

class AnalysisCubit extends Cubit<AnalysisState> {
  final ClinicalIntelligenceService _intelligenceService;

  AnalysisCubit(this._intelligenceService) : super(const AnalysisState());

  Future<void> generateComprehensiveReport(String patientData) async {
    emit(state.copyWith(isLoading: true, error: null, reports: {}));

    final lenses = [
      AnalysisLens.summaryOverview,
      AnalysisLens.functionalProtocols,
      AnalysisLens.monitoringFollowUp,
      AnalysisLens.patientEducation,
    ];

    try {
      final futures = lenses.map((lens) async {
        String accumulated = '';
        await for (final chunk in _intelligenceService.generateReportStream(patientData, lens)) {
          accumulated += chunk;
          
          final currentReports = Map<AnalysisLens, String>.from(state.reports);
          currentReports[lens] = accumulated;
          emit(state.copyWith(reports: currentReports));
        }
      });

      await Future.wait(futures);
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    } finally {
      emit(state.copyWith(isLoading: false));
    }
  }
}
