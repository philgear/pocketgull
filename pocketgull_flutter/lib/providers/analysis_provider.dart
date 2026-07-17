import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/clinical_intelligence_service.dart';
import '../../models/chat_message.dart';
import '../../models/orcid_profile.dart';
import 'services_providers.dart';

class AnalysisState {
  final bool isLoading;
  final String? error;
  final AnalysisLens activeLens;
  final String readingLevel; // 'clinical', 'simplified', 'dyslexia', 'child'
  final Map<AnalysisLens, String> reports;
  final List<ChatMessage> chatMessages;

  const AnalysisState({
    this.isLoading = false,
    this.error,
    this.activeLens = AnalysisLens.summaryOverview,
    this.readingLevel = 'clinical',
    this.reports = const {},
    this.chatMessages = const [],
  });

  AnalysisState copyWith({
    bool? isLoading,
    String? error,
    AnalysisLens? activeLens,
    String? readingLevel,
    Map<AnalysisLens, String>? reports,
    List<ChatMessage>? chatMessages,
  }) {
    return AnalysisState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      activeLens: activeLens ?? this.activeLens,
      readingLevel: readingLevel ?? this.readingLevel,
      reports: reports ?? this.reports,
      chatMessages: chatMessages ?? this.chatMessages,
    );
  }
}

class AnalysisNotifier extends Notifier<AnalysisState> {
  late ClinicalIntelligenceService _intelligenceService;

  @override
  AnalysisState build() {
    _intelligenceService = ref.watch(clinicalIntelligenceProvider);
    return const AnalysisState();
  }

  void changeLens(AnalysisLens lens) {
    state = state.copyWith(activeLens: lens);
  }

  Future<void> generateComprehensiveReport(String patientData, {OrcidProfile? orcidProfile}) async {
    state = state.copyWith(isLoading: true, error: null, reports: {});

    final lenses = [
      AnalysisLens.summaryOverview,
      AnalysisLens.functionalProtocols,
      AnalysisLens.monitoringFollowUp,
      AnalysisLens.patientEducation,
    ];

    try {
      final futures = lenses.map((lens) async {
        String accumulated = '';
        await for (final chunk in _intelligenceService.generateReportStream(patientData, lens, orcidProfile: orcidProfile)) {
          accumulated += chunk;
          
          final currentReports = Map<AnalysisLens, String>.from(state.reports);
          currentReports[lens] = accumulated;
          state = state.copyWith(reports: currentReports);
        }
      });

      await Future.wait(futures);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> askAgent(String question, {String? context}) async {
    final userMsg = ChatMessage(role: MessageRole.user, text: question);
    final updatedMessages = List<ChatMessage>.from(state.chatMessages)..add(userMsg);
    state = state.copyWith(chatMessages: updatedMessages, isLoading: true);

    try {
      final prompt = context != null 
          ? "Context from the report: \"$context\"\n\nQuestion: $question"
          : question;
      
      final response = await _intelligenceService.sendChatMessage(prompt);
      final agentMsg = ChatMessage(role: MessageRole.agent, text: response);
      
      state = state.copyWith(
        chatMessages: List<ChatMessage>.from(state.chatMessages)..add(agentMsg),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  void clearChat() {
    state = state.copyWith(chatMessages: []);
  }

  Future<void> changeReadingLevel(String level) async {
    if (state.readingLevel == level) return;
    
    state = state.copyWith(readingLevel: level, isLoading: true);
    
    try {
      final updatedReports = Map<AnalysisLens, String>.from(state.reports);
      
      if (level == 'clinical') {
        // Assume 'clinical' means 'regenerate original'
      } else {
        for (final entry in state.reports.entries) {
          final translated = await _intelligenceService.translateReadingLevel(entry.value, level);
          updatedReports[entry.key] = translated;
        }
      }
      
      state = state.copyWith(reports: updatedReports, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
}

final analysisProvider = NotifierProvider<AnalysisNotifier, AnalysisState>(() {
  return AnalysisNotifier();
});
