enum RespiratoryPattern {
  normalBreathing,
  expiratoryWheeze,
  inspiratoryStridor,
  explosiveCoughBurst
}

class RespiratoryAcousticAnalysis {
  final double dominantFrequencyHz;
  final double acousticEnergyDb;
  final RespiratoryPattern pattern;
  final String severity;
  final String clinicalNote;

  RespiratoryAcousticAnalysis({
    required this.dominantFrequencyHz,
    required this.acousticEnergyDb,
    required this.pattern,
    required this.severity,
    required this.clinicalNote,
  });

  Map<String, dynamic> toJson() => {
        'dominantFrequencyHz': dominantFrequencyHz,
        'acousticEnergyDb': acousticEnergyDb,
        'pattern': pattern.name,
        'severity': severity,
        'clinicalNote': clinicalNote,
      };
}

class MobileAudioRespiratoryService {
  RespiratoryAcousticAnalysis analyzeFrequency(double frequencyHz, double energyDb) {
    RespiratoryPattern pattern = RespiratoryPattern.normalBreathing;
    String severity = 'Mild';
    String note = 'Normal vesicular breath sounds. No adventitious rhonchi or stridor.';

    if (frequencyHz >= 2000 && energyDb > -18) {
      pattern = RespiratoryPattern.inspiratoryStridor;
      severity = 'Severe';
      note = 'High-pitched inspiratory sound indicating potential upper airway obstruction.';
    } else if (frequencyHz >= 400 && frequencyHz <= 1600 && energyDb > -22) {
      pattern = RespiratoryPattern.expiratoryWheeze;
      severity = energyDb > -12 ? 'Severe' : 'Moderate';
      note = 'Continuous musical adventitious sound suggesting lower airway bronchospasm (Asthma / COPD).';
    } else if (energyDb > -8) {
      pattern = RespiratoryPattern.explosiveCoughBurst;
      severity = 'Moderate';
      note = 'Explosive acoustic impulse with rapid pressure decay.';
    }

    return RespiratoryAcousticAnalysis(
      dominantFrequencyHz: frequencyHz,
      acousticEnergyDb: energyDb,
      pattern: pattern,
      severity: severity,
      clinicalNote: note,
    );
  }
}
