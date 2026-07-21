import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/clinical_intelligence_service.dart';
import '../../services/local_intelligence_service.dart';
import '../../services/orcid_service.dart';
import '../../services/export_service.dart';
import '../../services/circadian_sleepiness_service.dart';
import '../../services/ambient_lighting_service.dart';

import '../../services/patient_management_service.dart';

final clinicalIntelligenceProvider = Provider<ClinicalIntelligenceService>((ref) {
  const apiKey = String.fromEnvironment('GEMINI_API_KEY', defaultValue: 'YOUR_API_KEY_HERE');
  return ClinicalIntelligenceService(apiKey: apiKey);
});

final localIntelligenceProvider = Provider<LocalIntelligenceService>((ref) {
  // Instance initialized in main.dart or lazily here.
  return LocalIntelligenceService();
});

final orcidServiceProvider = Provider<OrcidService>((ref) {
  return OrcidService();
});

final exportServiceProvider = Provider<ExportService>((ref) {
  return ExportService();
});

final circadianSleepinessProvider = Provider<CircadianSleepinessService>((ref) {
  return CircadianSleepinessService();
});

final ambientLightingProvider = Provider<AmbientLightingService>((ref) {
  final circadian = ref.watch(circadianSleepinessProvider);
  return AmbientLightingService(circadian);
});

final patientManagementProvider = Provider<PatientManagementService>((ref) {
  return PatientManagementService();
});

