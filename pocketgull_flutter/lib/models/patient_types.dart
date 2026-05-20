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
  final String? date;
  
  // Trajectory fields
  final String? trajectory;
  final String? deltaSummary;
  final bool escalationFlag;

  const BodyPartIssue({
    required this.id,
    required this.noteId,
    required this.name,
    required this.painLevel,
    required this.description,
    required this.symptoms,
    this.recommendation,
    this.date,
    this.trajectory,
    this.deltaSummary,
    this.escalationFlag = false,
  });

  @override
  List<Object?> get props => [
        id, noteId, name, painLevel, description, symptoms, recommendation, date,
        trajectory, deltaSummary, escalationFlag
      ];
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

enum AnatomicalViewMode { standard, orthomolecular, muscular, skeletal, vascular }

enum BracketingState { normal, added, removed }

class ChecklistItem extends Equatable {
  final String id;
  final String text;
  final BracketingState status;

  const ChecklistItem({
    required this.id,
    required this.text,
    this.status = BracketingState.normal,
  });

  ChecklistItem copyWith({String? text, BracketingState? status}) {
    return ChecklistItem(
      id: id,
      text: text ?? this.text,
      status: status ?? this.status,
    );
  }

  @override
  List<Object?> get props => [id, text, status];
}

class PatientState extends Equatable {
  final Map<String, List<BodyPartIssue>> issues;
  final String patientGoals;
  final PatientVitals vitals;
  final List<DiagnosticScan> scans;
  final String? selectedPartId;
  final String? selectedNoteId;
  final String? viewingPastVisitDate;
  final List<ClinicalNote>? clinicalNotes;
  final List<ChecklistItem>? checklist;
  final bool isLiveAgentActive;
  final bool isResearchFrameVisible;
  final AnatomicalViewMode viewMode;

  const PatientState({
    required this.issues,
    required this.patientGoals,
    required this.vitals,
    this.scans = const [],
    this.selectedPartId,
    this.selectedNoteId,
    this.viewingPastVisitDate,
    this.clinicalNotes = const [],
    this.checklist = const [],
    this.isLiveAgentActive = false,
    this.isResearchFrameVisible = false,
    this.viewMode = AnatomicalViewMode.standard,
  });

  @override
  List<Object?> get props => [
        issues,
        patientGoals,
        vitals,
        scans,
        selectedPartId,
        selectedNoteId,
        viewingPastVisitDate,
        clinicalNotes,
        checklist,
        isLiveAgentActive,
        isResearchFrameVisible,
        viewMode,
      ];

  PatientState copyWith({
    Map<String, List<BodyPartIssue>>? issues,
    String? patientGoals,
    PatientVitals? vitals,
    List<DiagnosticScan>? scans,
    String? selectedPartId,
    String? selectedNoteId,
    String? viewingPastVisitDate,
    List<ClinicalNote>? clinicalNotes,
    List<ChecklistItem>? checklist,
    bool? isLiveAgentActive,
    bool? isResearchFrameVisible,
    AnatomicalViewMode? viewMode,
  }) {
    return PatientState(
      issues: issues ?? this.issues,
      patientGoals: patientGoals ?? this.patientGoals,
      vitals: vitals ?? this.vitals,
      scans: scans ?? this.scans,
      selectedPartId: selectedPartId ?? this.selectedPartId,
      selectedNoteId: selectedNoteId ?? this.selectedNoteId,
      viewingPastVisitDate: viewingPastVisitDate ?? this.viewingPastVisitDate,
      clinicalNotes: clinicalNotes ?? this.clinicalNotes,
      checklist: checklist ?? this.checklist,
      isLiveAgentActive: isLiveAgentActive ?? this.isLiveAgentActive,
      isResearchFrameVisible: isResearchFrameVisible ?? this.isResearchFrameVisible,
      viewMode: viewMode ?? this.viewMode,
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

  factory Bookmark.fromJson(Map<String, dynamic> json) {
    return Bookmark(
      title: json['title'] ?? '',
      url: json['url'] ?? '',
      authors: json['authors'],
      doi: json['doi'],
      publicationDate: json['publicationDate'],
      publisher: json['publisher'],
      isPeerReviewed: json['isPeerReviewed'],
      cited: json['cited'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'url': url,
      if (authors != null) 'authors': authors,
      if (doi != null) 'doi': doi,
      if (publicationDate != null) 'publicationDate': publicationDate,
      if (publisher != null) 'publisher': publisher,
      if (isPeerReviewed != null) 'isPeerReviewed': isPeerReviewed,
      if (cited != null) 'cited': cited,
    };
  }

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

  factory HistoryEntry.fromJson(Map<String, dynamic> json) {
    final type = json['type'] as String;
    switch (type) {
      case 'BookmarkAdded':
        return BookmarkAddedHistoryEntry(
          date: json['date'] ?? '',
          summary: json['summary'] ?? '',
          bookmark: Bookmark.fromJson(json['bookmark'] ?? {}),
        );
      case 'NoteCreated':
        return NoteCreatedHistoryEntry(
          date: json['date'] ?? '',
          summary: json['summary'] ?? '',
          partId: json['partId'] ?? '',
          noteId: json['noteId'] ?? '',
        );
      case 'NoteDeleted':
        return NoteDeletedHistoryEntry(
          date: json['date'] ?? '',
          summary: json['summary'] ?? '',
          partId: json['partId'] ?? '',
          noteId: json['noteId'] ?? '',
        );
      // We are leaving the complex state-bearing history entries (VisitHistoryEntry, AnalysisRunHistoryEntry) 
      // without deep deserialization for this scope as they require deep PatientState deserialization.
      // We will fallback to a base parsing for unimplemented types if needed.
      default:
        return _GenericHistoryEntry(
          type: type,
          date: json['date'] ?? '',
          summary: json['summary'] ?? '',
        );
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'type': type,
      'date': date,
      'summary': summary,
    };
    
    if (this is BookmarkAddedHistoryEntry) {
      data['bookmark'] = (this as BookmarkAddedHistoryEntry).bookmark.toJson();
    } else if (this is NoteCreatedHistoryEntry) {
      data['partId'] = (this as NoteCreatedHistoryEntry).partId;
      data['noteId'] = (this as NoteCreatedHistoryEntry).noteId;
    } else if (this is NoteDeletedHistoryEntry) {
      data['partId'] = (this as NoteDeletedHistoryEntry).partId;
      data['noteId'] = (this as NoteDeletedHistoryEntry).noteId;
    }
    // We can add the state serialization later if required for the full app.
    return data;
  }

  @override
  List<Object?> get props => [type, date, summary];
}

class _GenericHistoryEntry extends HistoryEntry {
  const _GenericHistoryEntry({required super.type, required super.date, required super.summary});
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
  final int triageScore;
  final String kaizenColor;
  final int? activeTimerSeconds;
  final List<Map<String, String>> recommendedGuidelines;

  const Patient({
    required this.id,
    required this.name,
    required this.age,
    required this.gender,
    required this.lastVisit,
    required this.preexistingConditions,
    this.history = const [],
    this.bookmarks = const [],
    this.triageScore = 0,
    this.kaizenColor = 'green',
    this.activeTimerSeconds,
    this.recommendedGuidelines = const [],
    required super.issues,
    required super.patientGoals,
    required super.vitals,
    super.scans = const [],
    super.viewMode = AnatomicalViewMode.standard,
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
        triageScore,
        kaizenColor,
        activeTimerSeconds,
        recommendedGuidelines,
        ...super.props,
      ];
}
