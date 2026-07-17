import 'dart:math';
import '../models/patient_types.dart';

enum RiskLevel { low, moderate, high, critical }

class RiskScoreResult {
  final RiskLevel riskLevel;
  final double score;
  final double confidence;
  final List<String> contributingFactors;
  final String note;

  RiskScoreResult({
    required this.riskLevel,
    required this.score,
    required this.confidence,
    required this.contributingFactors,
    required this.note,
  });
}

class ClinicalRiskCalculator {
  static const double safetyThreshold = 0.500;

  static RiskScoreResult calculate(PatientVitals vitals, int age, List<String> conditions) {
    double score = 0.0;
    final List<String> factors = [];

    // Parse Vitals
    final double hr = double.tryParse(vitals.hr) ?? 0.0;
    final List<String> bpParts = vitals.bp.split('/');
    final double sbp = bpParts.isNotEmpty ? (double.tryParse(bpParts[0]) ?? 0.0) : 0.0;
    final double spo2 = double.tryParse(vitals.spO2) ?? 0.0;

    // 1. Hypoxia (SpO2)
    if (spo2 > 0 && spo2 < 94) {
      score += 0.40;
      factors.add('Hypoxia detected (SpO2: ${spo2.toStringAsFixed(0)}%)');
    }

    // 2. Age-Adjusted Shock Index (SIA)
    final double sia = sbp > 0 ? (hr * age) / sbp : 0.0;
    if (sia > 50.0) {
      score += 0.20;
      factors.add('Elevated Age-Adjusted Shock Index: ${sia.toStringAsFixed(1)} (Cardiac distress)');
    }

    // 3. Rate Pressure Product (RPP)
    final double rpp = hr * sbp;
    if (rpp > 12000.0) {
      score += 0.15;
      factors.add('High Myocardial Workload (RPP: ${rpp.toStringAsFixed(0)})');
    }

    // 4. Quadratic Heart Rate Deviation
    final double hrDev = pow(hr - 75.0, 2).toDouble();
    if (hrDev > 400.0) { // HR < 55 or HR > 95
      score += 0.15;
      factors.add('Heart Rate out of baseline: ${hr.toStringAsFixed(0)} bpm');
    }

    // 5. Quadratic Systolic Pressure Deviation
    final double sbpDev = pow(sbp - 120.0, 2).toDouble();
    if (sbpDev > 400.0) { // SBP < 100 or SBP > 140
      score += 0.10;
      factors.add('Systolic BP out of baseline: ${sbp.toStringAsFixed(0)} mmHg');
    }

    // Cap score at 1.0
    score = min(score, 1.0);

    // Classify using safety decision threshold
    RiskLevel level = RiskLevel.low;
    if (score < 0.25) {
      level = RiskLevel.low;
    } else if (score < safetyThreshold) {
      level = RiskLevel.moderate;
    } else if (score < safetyThreshold + (1.0 - safetyThreshold) * 0.5) {
      level = RiskLevel.high;
    } else {
      level = RiskLevel.critical;
    }

    return RiskScoreResult(
      riskLevel: level,
      score: score,
      confidence: 0.60,
      contributingFactors: factors.isNotEmpty ? factors : ['Vitals within normal ranges'],
      note: 'Mobile Clinical Indices Calculator (Offline)',
    );
  }
}
