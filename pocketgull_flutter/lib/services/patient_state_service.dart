import 'package:flutter/foundation.dart';
import '../models/patient_types.dart';

/// Central patient state service — mirrors Angular's PatientStateService.
///
/// Uses [ValueNotifier] for reactive state propagation across the widget tree,
/// analogous to Angular Signals in the web app.
class PatientStateService extends ChangeNotifier {
  // ── State ───────────────────────────────────────────────────────────────────

  Patient? _activePatient;
  List<Patient> _patients = [];
  List<String> _selectedBodyParts = [];
  String _chiefComplaint = '';
  String _clinicalNotes = '';
  bool _isLoading = false;
  String? _error;

  // ── Getters ──────────────────────────────────────────────────────────────────

  Patient? get activePatient => _activePatient;
  List<Patient> get patients => List.unmodifiable(_patients);
  List<String> get selectedBodyParts => List.unmodifiable(_selectedBodyParts);
  String get chiefComplaint => _chiefComplaint;
  String get clinicalNotes => _clinicalNotes;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Returns a formatted summary of the current patient context for AI prompts.
  String get patientContextSummary {
    final p = _activePatient;
    if (p == null) return 'No patient loaded.';

    final vitals = '- BP: ${p.vitals.bp}\n'
        '- HR: ${p.vitals.hr} bpm\n'
        '- Temp: ${p.vitals.temp}\n'
        '- SpO2: ${p.vitals.spO2}%\n'
        '- Weight: ${p.vitals.weight}\n'
        '- Height: ${p.vitals.height}';

    final conditions = p.preexistingConditions.join(', ');
    final bodyParts = _selectedBodyParts.isNotEmpty
        ? _selectedBodyParts.join(', ')
        : 'None selected';

    return '''PATIENT PROFILE:
Name: ${p.name} | Age: ${p.age} | Gender: ${p.gender}
Last Visit: ${p.lastVisit}
Preexisting Conditions: $conditions

VITALS:
$vitals

ANATOMICAL REGIONS OF CONCERN: $bodyParts

CHIEF COMPLAINT: ${_chiefComplaint.isNotEmpty ? _chiefComplaint : 'Not provided'}

CLINICAL NOTES:
${_clinicalNotes.isNotEmpty ? _clinicalNotes : 'None'}

PATIENT GOALS: ${p.patientGoals}''';
  }

  // ── Mutations ────────────────────────────────────────────────────────────────

  /// Sets the full patient roster.
  void setPatients(List<Patient> patients) {
    _patients = patients;
    if (_activePatient == null && patients.isNotEmpty) {
      _activePatient = patients.first;
    }
    notifyListeners();
  }

  /// Selects a patient as the active clinical subject.
  void selectPatient(Patient patient) {
    _activePatient = patient;
    _selectedBodyParts = [];
    _chiefComplaint = '';
    _clinicalNotes = '';
    _error = null;
    notifyListeners();
  }

  /// Selects a patient by ID.
  void selectPatientById(String id) {
    final match = _patients.where((p) => p.id == id).firstOrNull;
    if (match != null) selectPatient(match);
  }

  /// Toggles an anatomical body part on/off.
  void toggleBodyPart(String partId) {
    if (_selectedBodyParts.contains(partId)) {
      _selectedBodyParts = _selectedBodyParts.where((p) => p != partId).toList();
    } else {
      _selectedBodyParts = [..._selectedBodyParts, partId];
    }
    notifyListeners();
  }

  /// Updates the chief complaint text.
  void setChiefComplaint(String text) {
    _chiefComplaint = text;
    notifyListeners();
  }

  /// Updates free-form clinical notes.
  void setClinicalNotes(String text) {
    _clinicalNotes = text;
    notifyListeners();
  }

  /// Updates a vitals field on the active patient.
  void updateVital(String field, String value) {
    final p = _activePatient;
    if (p == null) return;

    final v = p.vitals;
    _activePatient = p.copyWith(
      vitals: PatientVitals(
        bp: field == 'bp' ? value : v.bp,
        hr: field == 'hr' ? value : v.hr,
        temp: field == 'temp' ? value : v.temp,
        spO2: field == 'spO2' ? value : v.spO2,
        weight: field == 'weight' ? value : v.weight,
        height: field == 'height' ? value : v.height,
      ),
    );
    notifyListeners();
  }

  /// Adds or replaces a body part issue on the active patient.
  void addBodyPartIssue(String partId, BodyPartIssue issue) {
    final p = _activePatient;
    if (p == null) return;

    final updatedIssues = Map<String, List<BodyPartIssue>>.from(p.issues);
    updatedIssues[partId] = [...(updatedIssues[partId] ?? []), issue];
    _activePatient = p.copyWith(issues: updatedIssues);
    notifyListeners();
  }

  void setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void setError(String? message) {
    _error = message;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
