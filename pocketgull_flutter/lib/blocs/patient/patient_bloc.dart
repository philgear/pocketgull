import 'package:bloc/bloc.dart';
import 'patient_event.dart';
import '../../models/patient_types.dart';

class PatientBloc extends Bloc<PatientEvent, PatientState> {
  PatientBloc() : super(const PatientState(
    issues: {},
    patientGoals: '',
    vitals: PatientVitals(bp: '', hr: '', temp: '', spO2: '', weight: '', height: ''),
  )) {
    on<LoadPatient>((event, emit) {
      emit(event.patient);
    });

    on<UpdateVitals>((event, emit) {
      emit(state.copyWith(vitals: event.vitals));
    });

    on<AddIssue>((event, emit) {
      final updatedIssues = Map<String, List<BodyPartIssue>>.from(state.issues);
      if (!updatedIssues.containsKey(event.partId)) {
        updatedIssues[event.partId] = [];
      }
      updatedIssues[event.partId] = List.from(updatedIssues[event.partId]!)..add(event.issue);
      
      emit(state.copyWith(issues: updatedIssues));
    });

    on<UpdateGoals>((event, emit) {
      emit(state.copyWith(patientGoals: event.goals));
    });

    on<SelectPartEvent>((event, emit) {
      emit(state.copyWith(selectedPartId: event.partId));
    });
  }
}
