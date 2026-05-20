import 'package:flutter/services.dart';

class DocumentationService {
  Future<String> loadMarkdown(String filename) async {
    try {
      return await rootBundle.loadString('assets/docs/$filename');
    } catch (e) {
      return '# Error\nCould not load documentation file: $filename';
    }
  }

  List<String> getAvailableDocs() {
    return [
      'llms.txt',
      'README.md',
      'ai_policy.md',
      'study/index.md', // Fallback path
    ];
  }
}
