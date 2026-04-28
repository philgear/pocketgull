import 'package:equatable/equatable.dart';
import '../../models/patient_types.dart';

abstract class PatientEvent extends Equatable {
  const PatientEvent();

  @override
  List<Object> get props => [];
}

class LoadPatient extends PatientEvent {
  final Patient patient;
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
  final String partId;
  const SelectPartEvent(this.partId);

  @override
  List<Object> get props => [partId];
}
