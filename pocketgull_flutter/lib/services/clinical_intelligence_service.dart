import 'package:google_generative_ai/google_generative_ai.dart';

enum AnalysisLens {
  summaryOverview('Summary Overview'),
  functionalProtocols('Functional Protocols'),
  monitoringFollowUp('Monitoring & Follow-up'),
  patientEducation('Patient Education');

  final String title;
  const AnalysisLens(this.title);
}

class ClinicalMetrics {
  final int complexity;
  final int stability;
  final int certainty;

  ClinicalMetrics({
    required this.complexity,
    required this.stability,
    required this.certainty,
  });
}

class ClinicalIntelligenceService {
  final GenerativeModel _model;
  ChatSession? _chatSession;
  Map<String, String>? _archivedReport;

  void resetAIState() {
    _chatSession = null;
    _archivedReport = null;
  }

  void loadArchivedAnalysis(Map<String, String> report) {
    _archivedReport = report;
  }

  ClinicalIntelligenceService({required String apiKey}) 
      : _model = GenerativeModel(
          model: 'gemini-1.5-flash',
          apiKey: apiKey,
          generationConfig: GenerationConfig(
            temperature: 0.2,
          ),
        );

  final String _formattingRules = '''
FORMATTING RULES (you MUST follow these exactly):
- Use ONLY ### level headings. Never use # or ##.
- Keep paragraphs to 2–3 sentences maximum. Be concise and clinical.
- Use **bold** for key clinical terms. Never use ALL CAPS.
- Prefer bullet lists over numbered lists unless ordering matters clinically.
- Use markdown tables for structured data (labs, dosing, schedules, vitals).
- Never output raw URLs.
- Do NOT repeat the patient data back — synthesize and advise.
- Write in third person clinical voice ("The patient presents with..." not "You have...").
- CITATION INTEGRITY (UKRIO): When referencing medical literature, you MUST use a parenthetical citation [Author et al., Year].
- ACCURACY: Only cite a source if it directly supports the specific clinical claim being made. DO NOT use research sources to support patient-reported symptoms unless the source provides specific diagnostic criteria or evidence matched to those symptoms.
- TRANSPARENCY: Include the full reference in the 'References' section. Use DOIs whenever available. If a source is peer-reviewed, state this clearly in the reference.
- NO HALLUCINATION: Only cite sources provided in the "Research Context" or "Bookmarks" sections. If no provided source supports a claim, do NOT cite anything.
''';

  String _getSystemInstruction(AnalysisLens lens) {
    switch (lens) {
      case AnalysisLens.summaryOverview:
        return '''You are a world-class care plan recommendation engine for a clinical decision-support tool.
Analyze the patient overview and generate a **Visit Summary Overview** structured as follows:
### Clinical Assessment
A concise 2–3 sentence synthesis of the patient's current clinical picture — key diagnoses, functional status, and risk factors.
### Priority List
A bullet list of the top 3–5 clinical priorities, ordered by urgency.
### Plan of Care
Actionable treatment steps organized by priority.
### Goals
Short-term (2 weeks) and long-term (3 months) measurable clinical goals as bullet points.
### References (UKRIO Compliant)
A structured list of all sources cited in this report.
$_formattingRules''';
      case AnalysisLens.functionalProtocols:
        return '''You are an expert functional and integrative medicine strategist.
Analyze the patient overview and recommend specific, evidence-based interventions structured as follows:
### Immediate Actions (To start within 72 hours)
### Foundation (Diet & Lifestyle)
### Supplementation
### Functional Protocols
$_formattingRules''';
      case AnalysisLens.monitoringFollowUp:
        return '''You are a care coordination AI.
Generate a structured monitoring and follow-up plan:
### Immediate Next Steps (0-30 days)
### Ongoing (Month 1-3)
### Long-term Trajectory (6+ months)
$_formattingRules''';
      case AnalysisLens.patientEducation:
        return '''You are a patient education specialist. Translate clinical findings into plain language (8th grade reading level).
### Understanding Your Condition
### What Was Found
### Current Plan
### Important Notes
$_formattingRules''';
    }
  }

  bool get _isMockMode => true; // Forced for demonstration

  Stream<String> generateReportStream(String patientData, AnalysisLens lens) async* {
    if (_isMockMode) {
      await Future.delayed(const Duration(milliseconds: 10));
      yield '### [Mock Report] ${lens.title}\n\n';
      yield 'This is a **simulated clinical report** because no valid Gemini API key was detected.\n\n';
      yield '#### Clinical Findings\n';
      yield '- Patient exhibits normal vital signs for their age group.\n';
      yield '- Recommended follow-up in 2 weeks.\n\n';
      yield '#### Protocols\n';
      yield '- **Standard hydration** and rest.\n';
      yield '- Monitor symptoms for any significant changes.\n';
      return;
    }

    final prompt = [
      Content.text('SYSTEM INSTRUCTIONS:\n${_getSystemInstruction(lens)}\n\nPATIENT DATA:\n$patientData')
    ];
    
    final responseStream = _model.generateContentStream(prompt);
    
    await for (final chunk in responseStream) {
      if (chunk.text != null) {
        yield chunk.text!;
      }
    }
  }

  Future<void> startChatSession(String patientData) async {
    if (_isMockMode) {
      _chatSession = null; // We'll handle mock chat separately
      return;
    }
    final context = '''You are a collaborative care plan co-pilot named "Cerebella". You are assisting a doctor in refining a strategy for their patient. You have already reviewed the finalized patient overview and the current recommendations. Your role is to help the doctor iterate on the care plan, explore functional protocols, structure follow-ups, or answer specific questions about the patient's data. Keep your answers brief, actionable, and focused on strategic holistic care.
    
PATIENT DATA CONTEXT:
$patientData
''';
    
    _chatSession = _model.startChat(history: [
      Content.model([TextPart('Understood. I am ready to assist.')])
    ]);
    
    // Seed it implicitly
    await _chatSession!.sendMessage(Content.text('SYSTEM CONTEXT: $context'));
  }

  Future<String> sendChatMessage(String message) async {
    if (_isMockMode) {
      await Future.delayed(const Duration(seconds: 1));
      return 'This is a **simulated response** from Cerebella. I am here to help you iterate on the patient strategy. Since no API key is set, I am currently in demonstration mode.';
    }
    if (_chatSession == null) {
      throw Exception('Chat session not initialized. Call startChatSession first.');
    }
    
    final response = await _chatSession!.sendMessage(Content.text(message));
    return response.text ?? 'No response generated.';
  }

  Future<String> getInitialGreeting() async {
    if (_chatSession == null) {
       throw Exception('Chat session not initialized.');
    }
    final response = await _chatSession!.sendMessage(
      Content.text("Start the conversation with a friendly and professional tone. Greet the doctor and confirm you have reviewed the patient's file and are ready for questions.")
    );
    return response.text ?? 'Hello Doctor, I have reviewed the patient file and am ready to assist.';
  }

  Future<String> translateReadingLevel(String text, String level) async {
    if (_isMockMode) {
      await Future.delayed(const Duration(milliseconds: 10));
      return '### [Mock Translated] ($level)\n\n$text\n\n*Note: This is a simulated translation for demonstration purposes.*';
    }
    String systemInstruction = '';
    if (level == 'simplified') {
      systemInstruction = 'You are an expert clinical copywriter. Rewrite the provided medical text to be Grade 6-8 level. Preserve all clinical facts.';
    } else if (level == 'dyslexia') {
      systemInstruction = 'Rewrite the provided medical text to be Dyslexia-friendly. Use frequent line breaks, short paragraphs, and bold text for key points.';
    } else if (level == 'child') {
      systemInstruction = 'Rewrite the provided medical text for an 8-12 year old child. Use simple analogies and a warm, encouraging tone.';
    } else {
      return text;
    }

    final prompt = 'REWRITE RULES:\n$systemInstruction\n\nTEXT TO REWRITE:\n$text';
    final response = await _model.generateContent([Content.text(prompt)]);
    return response.text ?? text;
  }
}
