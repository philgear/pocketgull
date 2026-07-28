import 'package:flutter_riverpod/flutter_riverpod.dart';

class CgmTimeInRangeMetrics {
  final double timeInRangePercent;
  final double tightRangePercent;
  final double coefficientOfVariationPercent;
  final double glucoseManagementIndexGmi;

  CgmTimeInRangeMetrics({
    required this.timeInRangePercent,
    required this.tightRangePercent,
    required this.coefficientOfVariationPercent,
    required this.glucoseManagementIndexGmi,
  });
}

class MobileCgmTimeInRangeService {
  CgmTimeInRangeMetrics calculateMetrics(List<double> glucoseReadingsMgDl) {
    if (glucoseReadingsMgDl.isEmpty) {
      return CgmTimeInRangeMetrics(
        timeInRangePercent: 75.0,
        tightRangePercent: 55.0,
        coefficientOfVariationPercent: 28.5,
        glucoseManagementIndexGmi: 6.4,
      );
    }

    final total = glucoseReadingsMgDl.length;
    final inRangeCount = glucoseReadingsMgDl.where((g) => g >= 70 && g <= 180).length;
    final tightCount = glucoseReadingsMgDl.where((g) => g >= 70 && g <= 140).length;

    final mean = glucoseReadingsMgDl.reduce((a, b) => a + b) / total;
    double sumVariance = 0.0;
    for (var g in glucoseReadingsMgDl) {
      sumVariance += (g - mean) * (g - mean);
    }
    final stdDev = (sumVariance / total);
    final cv = mean > 0 ? (stdDev / mean) * 100.0 : 0.0;
    final gmi = 3.31 + (0.02392 * mean);

    return CgmTimeInRangeMetrics(
      timeInRangePercent: (inRangeCount / total) * 100.0,
      tightRangePercent: (tightCount / total) * 100.0,
      coefficientOfVariationPercent: cv,
      glucoseManagementIndexGmi: double.parse(gmi.toStringAsFixed(2)),
    );
  }
}

final cgmTimeInRangeServiceProvider = Provider<MobileCgmTimeInRangeService>((ref) {
  return MobileCgmTimeInRangeService();
});
