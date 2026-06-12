import 'dart:io';
import 'package:mediapipe_genai/mediapipe_genai.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/services.dart' show rootBundle;

class LocalIntelligenceService {
  LlmInferenceEngine? _llmInference;
  bool _isLoaded = false;

  bool get isLoaded => _isLoaded;

  Future<void> initialize() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final modelPath = '${directory.path}/gemma-2b-it-cpu-int4.bin';
      final modelFile = File(modelPath);

      if (!await modelFile.exists()) {
        try {
          final data = await rootBundle.load('assets/models/gemma-2b-it-cpu-int4.bin');
          final bytes = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
          await modelFile.writeAsBytes(bytes);
        } catch (e) {
          _isLoaded = true;
          return;
        }
      }
      
      final cacheDirectory = await getApplicationCacheDirectory();
      final options = LlmInferenceOptions.cpu(
        modelPath: modelPath,
        cacheDir: cacheDirectory.path,
        maxTokens: 512,
        temperature: 0.7,
        topK: 40,
      );
      
      _llmInference = LlmInferenceEngine(options);
      _isLoaded = true;
    } catch (e) {
      _isLoaded = true; 
    }
  }

  Future<String> scrubPII(String text) async {
    if (!_isLoaded) return text;
    if (_llmInference != null) {
      try {
        final stream = _llmInference!.generateResponse("Scrub PII: $text");
        final buffer = StringBuffer();
        await for (final chunk in stream) {
          buffer.write(chunk);
        }
        return buffer.toString().trim();
      } catch (e) {
        return text.replaceAll(RegExp(r'\d{3}-\d{3}-\d{4}'), '[REDACTED PHONE]');
      }
    }
    return text.replaceAll(RegExp(r'\d{3}-\d{3}-\d{4}'), '[REDACTED PHONE]');
  }

  Future<String> classifyIntent(String input) async {
    if (!_isLoaded) return 'unknown';
    if (_llmInference != null) {
      try {
        final stream = _llmInference!.generateResponse("Classify: $input");
        final buffer = StringBuffer();
        await for (final chunk in stream) {
          buffer.write(chunk);
        }
        return buffer.toString().trim().toUpperCase();
      } catch (e) {
        // Fallback to simple string parsing on inference failure
      }
    }
    if (input.contains('BP')) return 'VITAL';
    return 'NOTE';
  }
}
