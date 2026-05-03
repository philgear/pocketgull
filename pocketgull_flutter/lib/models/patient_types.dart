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

class ClinicalNote extends Equatable {
  final String id;
  final String text;
  final String sourceLens;
  final String date;

  const ClinicalNote({
    required this.id,
    required this.text,
    required this.sourceLens,
    required this.date,
  });

  @override
  List<Object?> get props => [id, text, sourceLens, date];
}

class ChecklistItem extends Equatable {
  final String id;
  final String text;
  final bool completed;

  const ChecklistItem({
    required this.id,
    required this.text,
    required this.completed,
  });

  ChecklistItem copyWith({String? text, bool? completed}) {
    return ChecklistItem(
      id: id,
      text: text ?? this.text,
      completed: completed ?? this.completed,
    );
  }

  @override
  List<Object?> get props => [id, text, completed];
}

class PatientState extends Equatable {
  final Map<String, List<BodyPartIssue>> issues;
  final String patientGoals;
  final PatientVitals vitals;
  final List<DiagnosticScan> scans;
  final String? selectedPartId;
  final List<ClinicalNote>? clinicalNotes;
  final List<ChecklistItem>? checklist;

  const PatientState({
    required this.issues,
    required this.patientGoals,
    required this.vitals,
    this.scans = const [],
    this.selectedPartId,
    this.clinicalNotes = const [],
    this.checklist = const [],
  });

  @override
  List<Object?> get props => [issues, patientGoals, vitals, scans, selectedPartId, clinicalNotes, checklist];

  PatientState copyWith({
    Map<String, List<BodyPartIssue>>? issues,
    String? patientGoals,
    PatientVitals? vitals,
    List<DiagnosticScan>? scans,
    String? selectedPartId,
    List<ClinicalNote>? clinicalNotes,
    List<ChecklistItem>? checklist,
  }) {
    return PatientState(
      issues: issues ?? this.issues,
      patientGoals: patientGoals ?? this.patientGoals,
      vitals: vitals ?? this.vitals,
      scans: scans ?? this.scans,
      selectedPartId: selectedPartId ?? this.selectedPartId,
      clinicalNotes: clinicalNotes ?? this.clinicalNotes,
      checklist: checklist ?? this.checklist,
    );
  }
}

class Bookmark extends Equatable {
  final String title;
  final String url;
  final String? authors;
  final String? doi;
  final String? publicationDate;
  final String? publisher;
  final bool? isPeerReviewed;
  final bool? cited;

  const Bookmark({
    required this.title,
    required this.url,
    this.authors,
    this.doi,
    this.publicationDate,
    this.publisher,
    this.isPeerReviewed,
    this.cited,
  });

  @override
  List<Object?> get props => [title, url, authors, doi, publicationDate, publisher, isPeerReviewed, cited];
}

sealed class HistoryEntry extends Equatable {
  final String type;
  final String date;
  final String summary;

  const HistoryEntry({
    required this.type,
    required this.date,
    required this.summary,
  });

  @override
  List<Object?> get props => [type, date, summary];
}

class VisitHistoryEntry extends HistoryEntry {
  final PatientState state;

  const VisitHistoryEntry({
    required super.date,
    required super.summary,
    required this.state,
  }) : super(type: 'Visit');

  @override
  List<Object?> get props => [...super.props, state];
}

class ChartArchivedHistoryEntry extends HistoryEntry {
  final PatientState state;

  const ChartArchivedHistoryEntry({
    required super.date,
    required super.summary,
    required this.state,
  }) : super(type: 'ChartArchived');

  @override
  List<Object?> get props => [...super.props, state];
}

class PatientSummaryUpdateHistoryEntry extends HistoryEntry {
  const PatientSummaryUpdateHistoryEntry({
    required super.date,
    required super.summary,
  }) : super(type: 'PatientSummaryUpdate');
}

class BookmarkAddedHistoryEntry extends HistoryEntry {
  final Bookmark bookmark;

  const BookmarkAddedHistoryEntry({
    required super.date,
    required super.summary,
    required this.bookmark,
  }) : super(type: 'BookmarkAdded');

  @override
  List<Object?> get props => [...super.props, bookmark];
}

class NoteCreatedHistoryEntry extends HistoryEntry {
  final String partId;
  final String noteId;

  const NoteCreatedHistoryEntry({
    required super.date,
    required super.summary,
    required this.partId,
    required this.noteId,
  }) : super(type: 'NoteCreated');

  @override
  List<Object?> get props => [...super.props, partId, noteId];
}

class NoteDeletedHistoryEntry extends HistoryEntry {
  final String partId;
  final String noteId;

  const NoteDeletedHistoryEntry({
    required super.date,
    required super.summary,
    required this.partId,
    required this.noteId,
  }) : super(type: 'NoteDeleted');

  @override
  List<Object?> get props => [...super.props, partId, noteId];
}

class AnalysisRunHistoryEntry extends HistoryEntry {
  final Map<String, String> report;

  const AnalysisRunHistoryEntry({
    required super.date,
    required super.summary,
    required this.report,
  }) : super(type: 'AnalysisRun');

  @override
  List<Object?> get props => [...super.props, report];
}

class FinalizedPatientSummaryHistoryEntry extends HistoryEntry {
  final Map<String, String> report;
  final Map<String, dynamic> annotations;

  const FinalizedPatientSummaryHistoryEntry({
    required super.date,
    required super.summary,
    required this.report,
    required this.annotations,
  }) : super(type: 'FinalizedPatientSummary');

  @override
  List<Object?> get props => [...super.props, report, annotations];
}

class Patient extends PatientState {
  final String id;
  final String name;
  final int age;
  final String gender;
  final String lastVisit;
  final List<String> preexistingConditions;
  final List<HistoryEntry> history;
  final List<Bookmark> bookmarks;

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
        history,
        bookmarks,
        ...super.props,
      ];
}
