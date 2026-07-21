/// Image Optimization Service — Wikipedia thumbnail URL standardization.
///
/// Flutter parity with Angular `image-optimization.service.ts` (55 lines).
/// Snaps Wikimedia thumbnail widths to standard production buckets.
library;

/// Standard Wikimedia thumbnail size buckets.
const _standardSizes = [320, 480, 640, 800, 960, 1280, 1920];

/// Returns the next standard Wikimedia thumbnail size >= [width].
int getStandardWikimediaSize(int width) {
  for (final size in _standardSizes) {
    if (size >= width) return size;
  }
  return _standardSizes.last;
}

class ImageOptimizationService {
  /// Standardizes a Wikipedia thumbnail URL to use recommended production sizes.
  String standardizeWikipediaUrl(String url, {int? targetWidth}) {
    try {
      final uri = Uri.parse(url);
      if (uri.host != 'upload.wikimedia.org') return url;
    } catch (_) {
      return url;
    }

    // Match the size part of the URL, e.g., /640px-
    final sizeMatch = RegExp(r'/(\d+)px-').firstMatch(url);
    if (sizeMatch != null) {
      final currentWidth = int.parse(sizeMatch.group(1)!);
      final widthToUse = targetWidth ?? currentWidth;
      final standardWidth = getStandardWikimediaSize(widthToUse);
      return url.replaceFirst('/${currentWidth}px-', '/${standardWidth}px-');
    }

    // If it's an original image (doesn't contain '/thumb/'), rewrite it.
    if (!url.contains('/thumb/')) {
      final match = RegExp(
        r'(https://upload\.wikimedia\.org/wikipedia/[^/]+)/(.+)/([^/]+)$',
      ).firstMatch(url);
      if (match != null) {
        final widthToUse = targetWidth ?? 640;
        final standardWidth = getStandardWikimediaSize(widthToUse);
        return '${match.group(1)}/thumb/${match.group(2)}/${match.group(3)}/${standardWidth}px-${match.group(3)}';
      }
    }

    return url;
  }
}
