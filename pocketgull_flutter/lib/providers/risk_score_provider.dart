import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'patient_provider.dart';
import '../models/patient_types.dart';
import '../services/clinical_risk_calculator.dart';

final riskScoreProvider = Provider<RiskScoreResult>((ref) {
  final patientState = ref.watch(patientProvider);

  int age = 0;
  final List<String> conditions = [];

  // Check if state is a Patient to extract age and preexisting conditions
  if (patientState is Patient) {
    age = patientState.age;
    conditions.addAll(patientState.preexistingConditions);
  }

  // Also extract conditions from active issues
  patientState.issues.forEach((partId, issuesList) {
    for (var issue in issuesList) {
      if (!conditions.contains(issue.name)) {
        conditions.add(issue.name);
      }
    }
  });

  return ClinicalRiskCalculator.calculate(
    patientState.vitals,
    age,
    conditions,
  );
});
