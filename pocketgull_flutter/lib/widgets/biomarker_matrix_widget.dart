import 'dart:convert';
import 'package:flutter/material.dart';

/// Biomarker matrix — orthomolecular status grid.
///
/// Flutter parity with Angular `biomarker-matrix.component.ts`.
/// Parses AI markdown report text to extract biomarker status entries
/// and renders them as a responsive grid with color-coded levels.

enum BiomarkerLevel { deficient, subOptimal, optimal, high, excess }

class BiomarkerStatus {
  final String name;
  final BiomarkerLevel level;
  final String pathway;

  const BiomarkerStatus({
    required this.name,
    required this.level,
    required this.pathway,
  });

  String get levelLabel => switch (level) {
        BiomarkerLevel.deficient => 'Deficient',
        BiomarkerLevel.subOptimal => 'Sub-optimal',
        BiomarkerLevel.optimal => 'Optimal',
        BiomarkerLevel.high => 'High',
        BiomarkerLevel.excess => 'Excess',
      };

  bool get isCritical =>
      level == BiomarkerLevel.deficient || level == BiomarkerLevel.excess;
  bool get isWarning =>
      level == BiomarkerLevel.subOptimal || level == BiomarkerLevel.high;
  bool get isOptimal => level == BiomarkerLevel.optimal;
}

class BiomarkerMatrixWidget extends StatelessWidget {
  final String reportText;

  const BiomarkerMatrixWidget({super.key, required this.reportText});

  static const _dictionary = [
    {'name': 'Magnesium', 'pathway': 'ATP Synthesis / NMDA'},
    {'name': 'Vitamin D3', 'pathway': 'Immune / Bone'},
    {'name': 'Vitamin B12', 'pathway': 'Methylation'},
    {'name': 'Folate (B9)', 'pathway': 'Methylation / DNA'},
    {'name': 'Zinc', 'pathway': 'Immune / Hormones'},
    {'name': 'Homocysteine', 'pathway': 'Cardiovascular / Methylation'},
    {'name': 'Ferritin', 'pathway': 'Iron Storage / Thyroid'},
    {'name': 'Vitamin C', 'pathway': 'Collagen / Antioxidant'},
  ];

  List<BiomarkerStatus> _parseBiomarkers() {
    if (reportText.isEmpty) return [];

    final markers = <BiomarkerStatus>[];

    // Strategy 1: Parse JSON code blocks.
    final jsonMatch =
        RegExp(r'```json\s*([\s\S]*?)(?:```|$)', caseSensitive: false)
            .firstMatch(reportText);
    String? jsonText = jsonMatch?.group(1)?.trim();

    if (jsonText == null) {
      final rawMatch =
          RegExp(r'(\[\s*\{\s*"name"[\s\S]*?\])', caseSensitive: false)
              .firstMatch(reportText);
      jsonText = rawMatch?.group(1)?.trim();
    }

    if (jsonText != null) {
      try {
        if (!jsonText.endsWith(']')) {
          final lastCurly = jsonText.lastIndexOf('}');
          if (lastCurly != -1) {
            jsonText = '${jsonText.substring(0, lastCurly + 1)}\n]';
            if (!jsonText.startsWith('[')) jsonText = '[\n$jsonText';
          }
        }
        final parsed = jsonDecode(jsonText);
        if (parsed is List) {
          for (final item in parsed) {
            if (item is Map && item.containsKey('name')) {
              final dict = _dictionary.cast<Map<String, String>?>().firstWhere(
                    (d) =>
                        d!['name']!.toLowerCase() ==
                        (item['name'] as String).toLowerCase(),
                    orElse: () => null,
                  );
              markers.add(BiomarkerStatus(
                name: (dict?['name'] ?? item['name'] ?? 'Unknown') as String,
                level: _parseLevel((item['level'] ?? '') as String),
                pathway:
                    (item['pathway'] ?? dict?['pathway'] ?? 'Metabolic Pathway') as String,
              ));
            }
          }
        }
      } catch (_) {
        // Regex fallback for malformed JSON.
        final objRegex = RegExp(
          r'\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"level"\s*:\s*"([^"]+)"\s*,\s*"pathway"\s*:\s*"([^"]+)"\s*\}',
          caseSensitive: false,
        );
        for (final match in objRegex.allMatches(jsonText!)) {
          markers.add(BiomarkerStatus(
            name: match.group(1)!,
            level: _parseLevel(match.group(2)!),
            pathway: match.group(3)!,
          ));
        }
      }
    }

    if (markers.isNotEmpty) return markers;

    // Strategy 2: Heuristic regex fallback.
    final textLower = reportText.toLowerCase();
    for (final d in _dictionary) {
      final nameClean =
          d['name']!.toLowerCase().replaceAll(RegExp(r'\(.+\)'), '').trim();
      final regex = RegExp(
        '$nameClean.{0,40}(deficient|deficiency|low|sub-optimal|optimal|high|excess)',
        caseSensitive: false,
      );
      final match = regex.firstMatch(textLower);
      if (match != null) {
        markers.add(BiomarkerStatus(
          name: d['name']!,
          level: _parseLevel(match.group(1)!),
          pathway: d['pathway']!,
        ));
      }
    }

    return markers;
  }

  BiomarkerLevel _parseLevel(String raw) {
    final val = raw.toLowerCase();
    if (val.contains('defic') || val == 'low') return BiomarkerLevel.deficient;
    if (val == 'sub-optimal') return BiomarkerLevel.subOptimal;
    if (val == 'high') return BiomarkerLevel.high;
    if (val == 'excess') return BiomarkerLevel.excess;
    return BiomarkerLevel.optimal;
  }

  @override
  Widget build(BuildContext context) {
    final biomarkers = _parseBiomarkers();
    if (biomarkers.isEmpty) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.black.withValues(alpha: 0.3)
            : const Color(0xFF10B981).withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF10B981).withValues(alpha: 0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF064E3B)
                      : const Color(0xFFECFDF5),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isDark
                        ? const Color(0xFF065F46)
                        : const Color(0xFFA7F3D0),
                  ),
                ),
                child: Icon(
                  Icons.link,
                  size: 14,
                  color: isDark
                      ? const Color(0xFF34D399)
                      : const Color(0xFF059669),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'BIOMARKER MATRIX',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2,
                      color: isDark ? Colors.white : Colors.grey.shade900,
                    ),
                  ),
                  Text(
                    'ORTHOMOLECULAR STATUS DETECTED',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 2,
                      color: isDark
                          ? const Color(0xFF34D399).withValues(alpha: 0.8)
                          : Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (context, constraints) {
              final crossCount = constraints.maxWidth > 600 ? 4 : 2;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: crossCount,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                  childAspectRatio: 1.3,
                ),
                itemCount: biomarkers.length,
                itemBuilder: (context, i) =>
                    _BiomarkerCard(marker: biomarkers[i], isDark: isDark),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _BiomarkerCard extends StatelessWidget {
  final BiomarkerStatus marker;
  final bool isDark;

  const _BiomarkerCard({required this.marker, required this.isDark});

  Color _borderColor() {
    if (marker.isCritical) return isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFECACA);
    if (marker.isWarning) return isDark ? const Color(0xFF78350F) : const Color(0xFFFEF3C7);
    return isDark ? const Color(0xFF064E3B) : const Color(0xFFA7F3D0);
  }

  Color _dotColor() {
    if (marker.isCritical) return const Color(0xFFEF4444);
    if (marker.isWarning) return const Color(0xFFEAB308);
    return const Color(0xFF10B981);
  }

  Color _levelColor() {
    if (marker.isCritical) return isDark ? const Color(0xFFF87171) : const Color(0xFFB91C1C);
    if (marker.isWarning) return isDark ? const Color(0xFFFBBF24) : const Color(0xFFB45309);
    return isDark ? const Color(0xFF34D399) : const Color(0xFF059669);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.04)
            : Colors.white.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _borderColor()),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  marker.name,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : Colors.grey.shade900,
                  ),
                ),
              ),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _dotColor(),
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
          Text(
            marker.levelLabel,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.5,
              color: _levelColor(),
            ),
          ),
          Text(
            marker.pathway,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 10,
              letterSpacing: 1.5,
              color: isDark ? Colors.grey.shade500 : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }
}
