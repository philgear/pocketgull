/// Markdown Service — render AI markdown responses.
///
/// Flutter parity with Angular `markdown.service.ts` (20 lines).
/// Provides a thin wrapper around `flutter_markdown` rendering.
/// In Flutter, markdown rendering is synchronous via widget tree,
/// so this service exposes utility methods for pre-processing AI text.
library;

/// Utility class for markdown processing.
///
/// In Angular, this lazily loaded `marked`. In Flutter, markdown
/// rendering is handled by the `flutter_markdown` widget directly,
/// so this service focuses on pre-processing AI text before display.
class MarkdownService {
  /// Strips markdown fences from AI-generated code blocks.
  static String stripCodeFences(String text) {
    return text
        .replaceAll(RegExp(r'^```\w*\n', multiLine: true), '')
        .replaceAll(RegExp(r'\n```$', multiLine: true), '');
  }

  /// Extracts JSON blocks from markdown-formatted AI responses.
  static String? extractJsonBlock(String text) {
    final match = RegExp(r'```json\s*([\s\S]*?)(?:```|$)').firstMatch(text);
    return match?.group(1)?.trim();
  }

  /// Sanitizes AI markdown for safe rendering (strip HTML tags).
  static String sanitize(String text) {
    return text.replaceAll(RegExp(r'<[^>]+>'), '');
  }

  /// Converts heading levels for mobile display (h1→h3, h2→h4).
  static String compactHeadings(String text) {
    return text
        .replaceAllMapped(RegExp(r'^(#{1,2})\s', multiLine: true),
            (m) => '${'#' * (m.group(1)!.length + 2)} ')
        .replaceAllMapped(RegExp(r'^(#{3,4})\s', multiLine: true),
            (m) => '${'#' * (m.group(1)!.length + 1)} ');
  }
}
