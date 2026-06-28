class KssDescriptor {
  final int score;
  final String emoji;
  final String label;
  final String detail;

  const KssDescriptor({
    required this.score,
    required this.emoji,
    required this.label,
    required this.detail,
  });
}

class ColorHslData {
  final double h;
  final double s;
  final double l;

  const ColorHslData({
    required this.h,
    required this.s,
    required this.l,
  });

  Map<String, dynamic> toJson() => {
        'h': h,
        's': s,
        'l': l,
      };

  factory ColorHslData.fromJson(Map<String, dynamic> json) => ColorHslData(
        h: (json['h'] as num).toDouble(),
        s: (json['s'] as num).toDouble(),
        l: (json['l'] as num).toDouble(),
      );
}

class CircadianContext {
  final String phase;
  final int hour;
  final String phaseLabel;
  final String phaseEmoji;
  final int expectedKss;
  final String cognitiveLoad; // 'optimal' | 'good' | 'moderate' | 'reduced' | 'impaired'
  final String recommendation;
  final String avsWave; // 'beta' | 'alpha' | 'theta' | 'delta'
  final double avsBpm;
  final String colorHsl;
  final ColorHslData colorHslData;

  const CircadianContext({
    required this.phase,
    required this.hour,
    required this.phaseLabel,
    required this.phaseEmoji,
    required this.expectedKss,
    required this.cognitiveLoad,
    required this.recommendation,
    required this.avsWave,
    required this.avsBpm,
    required this.colorHsl,
    required this.colorHslData,
  });

  Map<String, dynamic> toJson() => {
        'phase': phase,
        'hour': hour,
        'phaseLabel': phaseLabel,
        'phaseEmoji': phaseEmoji,
        'expectedKss': expectedKss,
        'cognitiveLoad': cognitiveLoad,
        'recommendation': recommendation,
        'avsWave': avsWave,
        'avsBpm': avsBpm,
        'colorHsl': colorHsl,
        'colorHslData': colorHslData.toJson(),
      };
}

class AvsReset {
  final String wave;
  final double bpm;
  final int durationMin;
  final String rationale;

  const AvsReset({
    required this.wave,
    required this.bpm,
    required this.durationMin,
    required this.rationale,
  });

  Map<String, dynamic> toJson() => {
        'wave': wave,
        'bpm': bpm,
        'durationMin': durationMin,
        'rationale': rationale,
      };
}

class ReadinessProfile {
  final int clinicianKss;
  final int? patientKss;
  final CircadianContext circadian;
  final String combinedAlert; // 'clear' | 'caution' | 'high-risk'
  final String recommendation;
  final AvsReset? avsReset;

  const ReadinessProfile({
    required this.clinicianKss,
    this.patientKss,
    required this.circadian,
    required this.combinedAlert,
    required this.recommendation,
    this.avsReset,
  });

  Map<String, dynamic> toJson() => {
        'clinicianKss': clinicianKss,
        'patientKss': patientKss,
        'circadian': circadian.toJson(),
        'combinedAlert': combinedAlert,
        'recommendation': recommendation,
        'avsReset': avsReset?.toJson(),
      };
}
