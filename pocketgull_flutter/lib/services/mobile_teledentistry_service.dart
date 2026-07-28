class ToothRecord {
  final int fdiNumber;
  final List<String> cariesSurfaces; // M, O, D, F, L
  final double probingDepthMm;
  final bool bleedingOnProbing;
  final int twiGrade; // Smith & Knight Tooth Wear Index (0-4)

  ToothRecord({
    required this.fdiNumber,
    required this.cariesSurfaces,
    required this.probingDepthMm,
    required this.bleedingOnProbing,
    required this.twiGrade,
  });

  Map<String, dynamic> toJson() => {
        'fdiNumber': fdiNumber,
        'cariesSurfaces': cariesSurfaces,
        'probingDepthMm': probingDepthMm,
        'bleedingOnProbing': bleedingOnProbing,
        'twiGrade': twiGrade,
      };

  factory ToothRecord.fromJson(Map<String, dynamic> json) => ToothRecord(
        fdiNumber: json['fdiNumber'] as int,
        cariesSurfaces: List<String>.from(json['cariesSurfaces'] as List),
        probingDepthMm: (json['probingDepthMm'] as num).toDouble(),
        bleedingOnProbing: json['bleedingOnProbing'] as bool,
        twiGrade: json['twiGrade'] as int,
      );
}

class MobileTeledentistryService {
  final Map<int, ToothRecord> _odontogram = {};

  MobileTeledentistryService() {
    _initializeDefaultGrid();
  }

  void _initializeDefaultGrid() {
    // Populate 32 FDI teeth (11-18, 21-28, 31-38, 41-48)
    final quadrants = [
      [11, 12, 13, 14, 15, 16, 17, 18],
      [21, 22, 23, 24, 25, 26, 27, 28],
      [31, 32, 33, 34, 35, 36, 37, 38],
      [41, 42, 43, 44, 45, 46, 47, 48],
    ];

    for (final q in quadrants) {
      for (final tooth in q) {
        _odontogram[tooth] = ToothRecord(
          fdiNumber: tooth,
          cariesSurfaces: [],
          probingDepthMm: 2.0,
          bleedingOnProbing: false,
          twiGrade: 0,
        );
      }
    }
  }

  List<ToothRecord> getAllTeeth() => _odontogram.values.toList();

  ToothRecord? getTooth(int fdiNumber) => _odontogram[fdiNumber];

  void updateTooth(ToothRecord record) {
    _odontogram[record.fdiNumber] = record;
  }

  int countDeepPockets() {
    return _odontogram.values.where((t) => t.probingDepthMm >= 4.0).length;
  }

  double calculateBopPercentage() {
    if (_odontogram.isEmpty) return 0.0;
    final bopCount = _odontogram.values.where((t) => t.bleedingOnProbing).length;
    return (bopCount / _odontogram.length) * 100.0;
  }

  /// Systemic Inflammatory Burden Index (SIBI 0-100)
  int calculateSystemicBurdenIndex({double hsCrpMgL = 2.4}) {
    final deepPockets = countDeepPockets();
    final bopPct = calculateBopPercentage();
    final raw = (deepPockets * 6) + (bopPct * 0.8) + (hsCrpMgL * 12);
    return raw.round().clamp(0, 100);
  }
}
