class Patient {
  final String id;
  final String name;
  final int age;
  final String gender;
  final String lastVisit;
  final List<String> preexistingConditions;
  final PatientState state;

  Patient({
    required this.id,
    required this.name,
    required this.age,
    required this.gender,
    required this.lastVisit,
    required this.preexistingConditions,
    required this.state,
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      id: json['id'] as String,
      name: json['name'] as String,
      age: json['age'] as int,
      gender: json['gender'] as String,
      lastVisit: json['lastVisit'] as String,
      preexistingConditions: List<String>.from(json['preexistingConditions'] ?? []),
      state: PatientState.fromJson(json),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'age': age,
      'gender': gender,
      'lastVisit': lastVisit,
      'preexistingConditions': preexistingConditions,
      ...state.toJson(),
    };
  }
}

class PatientState {
  final Map<String, dynamic> vitals;
  final String patientGoals;
  final List<dynamic> biometricHistory;
  final Map<String, dynamic> issues;
  final List<dynamic> checklist;
  final List<dynamic> clinicalNotes;

  PatientState({
    required this.vitals,
    this.patientGoals = '',
    this.biometricHistory = const [],
    this.issues = const {},
    this.checklist = const [],
    this.clinicalNotes = const [],
  });

  factory PatientState.fromJson(Map<String, dynamic> json) {
    return PatientState(
      vitals: json['vitals'] ?? {},
      patientGoals: json['patientGoals'] ?? '',
      biometricHistory: json['biometricHistory'] ?? [],
      issues: json['issues'] ?? {},
      checklist: json['checklist'] ?? [],
      clinicalNotes: json['clinicalNotes'] ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'vitals': vitals,
      'patientGoals': patientGoals,
      'biometricHistory': biometricHistory,
      'issues': issues,
      'checklist': checklist,
      'clinicalNotes': clinicalNotes,
    };
  }
}
