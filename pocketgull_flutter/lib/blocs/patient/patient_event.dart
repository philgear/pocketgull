import 'package:equatable/equatable.dart';
import '../../models/patient_types.dart';

abstract class PatientEvent extends Equatable {
  const PatientEvent();

  @override
  List<Object> get props => [];
}

class LoadPatient extends PatientEvent {
  final PatientState patient;
  const LoadPatient(this.patient);

  @override
  List<Object> get props => [patient];
}

class UpdateVitals extends PatientEvent {
  final PatientVitals vitals;
  const UpdateVitals(this.vitals);

  @override
  List<Object> get props => [vitals];
}

class AddIssue extends PatientEvent {
  final String partId;
  final BodyPartIssue issue;
  const AddIssue(this.partId, this.issue);

  @override
  List<Object> get props => [partId, issue];
}

class UpdateGoals extends PatientEvent {
  final String goals;
  const UpdateGoals(this.goals);

  @override
  List<Object> get props => [goals];
}

class SelectPartEvent extends PatientEvent {
  final String? partId;
  const SelectPartEvent(this.partId);

  @override
  List<Object> get props => [partId ?? 'null'];
}

class ToggleLiveAgent extends PatientEvent {
  final bool isActive;
  const ToggleLiveAgent(this.isActive);

  @override
  List<Object> get props => [isActive];
}

class ToggleResearchFrame extends PatientEvent {
  final bool isVisible;
  const ToggleResearchFrame(this.isVisible);

  @override
  List<Object> get props => [isVisible];
}

class SelectNoteEvent extends PatientEvent {
  final String? noteId;
  const SelectNoteEvent(this.noteId);

  @override
  List<Object> get props => [noteId ?? 'null'];
}

class UpdateIssueEvent extends PatientEvent {
  final String partId;
  final BodyPartIssue issue;
  const UpdateIssueEvent(this.partId, this.issue);

  @override
  List<Object> get props => [partId, issue];
}

class DeleteNoteEvent extends PatientEvent {
  final String partId;
  final String noteId;
  const DeleteNoteEvent(this.partId, this.noteId);

  @override
  List<Object> get props => [partId, noteId];
}

class SetViewingPastVisitDateEvent extends PatientEvent {
  final String? date;
  const SetViewingPastVisitDateEvent(this.date);

  @override
  List<Object> get props => [date ?? 'null'];
}

class ToggleChecklistStatusEvent extends PatientEvent {
  final String itemId;
  const ToggleChecklistStatusEvent(this.itemId);

  @override
  List<Object> get props => [itemId];
}

class ChangeAnatomicalViewModeEvent extends PatientEvent {
  final AnatomicalViewMode viewMode;
  const ChangeAnatomicalViewModeEvent(this.viewMode);

  @override
  List<Object> get props => [viewMode];
}
