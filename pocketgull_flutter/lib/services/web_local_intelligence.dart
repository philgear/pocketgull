class LocalIntelligenceService {
  bool _isLoaded = false;
  bool get isLoaded => _isLoaded;

  Future<void> initialize() async {
    _isLoaded = true;
    return;
  }

  Future<String> scrubPII(String text) async {
    return text.replaceAll(RegExp(r'\d{3}-\d{3}-\d{4}'), '[REDACTED PHONE]');
  }

  Future<String> classifyIntent(String input) async {
    if (input.contains('BP') || input.contains('heart')) return 'VITAL';
    if (input.contains('pain') || input.contains('sore')) return 'SYMPTOM';
    return 'NOTE';
  }
}
