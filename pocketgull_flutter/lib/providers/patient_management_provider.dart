import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/patient_types.dart';
import '../services/patient_management_service.dart';

/// Riverpod provider for the full patient roster.
///
/// Backed by [PatientManagementService] which loads from Hive (with
/// SharedPreferences migration fallback) and supplies the default demo
/// patients on first run.

final patientManagementServiceProvider = Provider<PatientManagementService>(
  (ref) => PatientManagementService(),
);

/// Async provider that exposes the full `List<Patient>` roster.
///
/// Widgets can `ref.watch(patientManagementProvider)` and use
/// `AsyncValue.when()` to handle loading / error / data states.
final patientManagementProvider =
    AsyncNotifierProvider<PatientManagementNotifier, List<Patient>>(
  PatientManagementNotifier.new,
);

class PatientManagementNotifier extends AsyncNotifier<List<Patient>> {
  PatientManagementService get _service =>
      ref.read(patientManagementServiceProvider);

  @override
  Future<List<Patient>> build() async {
    debugPrint('[PatientManagement] Loading patient roster...');
    final patients = await _service.loadPatients();
    debugPrint('[PatientManagement] Loaded ${patients.length} patients');
    return patients;
  }

  /// Add a patient to the roster and persist.
  Future<void> addPatient(Patient patient) async {
    final current = List<Patient>.from(state.value ?? []);
    current.add(patient);
    await _service.savePatients(current);
    state = AsyncData(current);
  }

  /// Remove a patient by ID and persist.
  Future<void> removePatient(String patientId) async {
    final current = List<Patient>.from(state.value ?? []);
    current.removeWhere((p) => p.id == patientId);
    await _service.savePatients(current);
    state = AsyncData(current);
  }

  /// Replace a patient (matched by ID) and persist.
  Future<void> updatePatient(Patient updated) async {
    final current = List<Patient>.from(state.value ?? []);
    final index = current.indexWhere((p) => p.id == updated.id);
    if (index != -1) {
      current[index] = updated;
    } else {
      current.add(updated);
    }
    await _service.savePatients(current);
    state = AsyncData(current);
  }

  /// Trigger a full reload from storage.
  Future<void> reload() async {
    state = const AsyncLoading();
    state = AsyncData(await _service.loadPatients());
  }
}
