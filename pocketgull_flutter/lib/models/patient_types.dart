import 'package:equatable/equatable.dart';

class PatientSymptom extends Equatable {
  final String name;
  final String? type;
  final bool? verified;
  final String? timeline;
  final Map<String, dynamic> extra;

  const PatientSymptom({
    required this.name,
    this.type,
    this.verified,
    this.timeline,
    this.extra = const {},
  });

  @override
  List<Object?> get props => [name, type, verified, timeline, extra];
}

class BodyPartIssue extends Equatable {
  final String id;
  final String noteId;
  final String name;
  final int painLevel;
  final String description;
  final List<dynamic> symptoms; // Can be String or PatientSymptom
  final String? recommendation;

  const BodyPartIssue({
    required this.id,
    required this.noteId,
    required this.name,
    required this.painLevel,
    required this.description,
    required this.symptoms,
    this.recommendation,
  });

  @override
  List<Object?> get props => [id, noteId, name, painLevel, description, symptoms, recommendation];
}

class PatientVitals extends Equatable {
  final String bp;
  final String hr;
  final String temp;
  final String spO2;
  final String weight;
  final String height;

  const PatientVitals({
    required this.bp,
    required this.hr,
    required this.temp,
    required this.spO2,
    required this.weight,
    required this.height,
  });

  @override
  List<Object?> get props => [bp, hr, temp, spO2, weight, height];

  factory PatientVitals.empty() {
    return const PatientVitals(bp: '', hr: '', temp: '', spO2: '', weight: '', height: '');
  }
}

class DiagnosticScan extends Equatable {
  final String id;
  final String type;
  final String title;
  final String date;
  final String? bodyPartId;
  final String description;
  final String status;
  final String? imageUrl;

  const DiagnosticScan({
    required this.id,
    required this.type,
    required this.title,
    required this.date,
    this.bodyPartId,
    required this.description,
    required this.status,
    this.imageUrl,
  });

  @override
  List<Object?> get props => [id, type, title, date, bodyPartId, description, status, imageUrl];
}

class PatientState extends Equatable {
  final Map<String, List<BodyPartIssue>> issues;
  final String patientGoals;
  final PatientVitals vitals;
  final List<DiagnosticScan> scans;
  final String? selectedPartId;

  const PatientState({
    required this.issues,
    required this.patientGoals,
    required this.vitals,
    this.scans = const [],
    this.selectedPartId,
  });

  @override
  List<Object?> get props => [issues, patientGoals, vitals, scans, selectedPartId];

  PatientState copyWith({
    Map<String, List<BodyPartIssue>>? issues,
    String? patientGoals,
    PatientVitals? vitals,
    List<DiagnosticScan>? scans,
    String? selectedPartId,
  }) {
    return PatientState(
      issues: issues ?? this.issues,
      patientGoals: patientGoals ?? this.patientGoals,
      vitals: vitals ?? this.vitals,
      scans: scans ?? this.scans,
      selectedPartId: selectedPartId ?? this.selectedPartId,
    );
  }
}

class Patient extends PatientState {
  final String id;
  final String name;
  final int age;
  final String gender;
  final String lastVisit;
  final List<String> preexistingConditions;
  final List<dynamic> history;
  final List<dynamic> bookmarks;

  const Patient({
    required this.id,
    required this.name,
    required this.age,
    required this.gender,
    required this.lastVisit,
    required this.preexistingConditions,
    this.history = const [],
    this.bookmarks = const [],
    required super.issues,
    required super.patientGoals,
    required super.vitals,
    super.scans = const [],
  });

  @override
  List<Object?> get props => [
        id,
        name,
        age,
        gender,
        lastVisit,
        preexistingConditions,
        ...super.props,
      ];
}
