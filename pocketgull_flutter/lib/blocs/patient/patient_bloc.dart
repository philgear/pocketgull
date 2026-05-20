import 'package:bloc/bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'patient_event.dart';
import '../../models/patient_types.dart';

class PatientBloc extends Bloc<PatientEvent, PatientState> {
  static const String _storageKey = 'pocketgull_patient_state';

  PatientBloc() : super(const PatientState(
    issues: {},
    patientGoals: '',
    vitals: PatientVitals(bp: '', hr: '', temp: '', spO2: '', weight: '', height: ''),
  )) {
    on<LoadPatient>((event, emit) {
      emit(event.patient);
      _saveToPrefs(event.patient);
    });

    on<UpdateVitals>((event, emit) {
      final newState = state.copyWith(vitals: event.vitals);
      emit(newState);
      _saveToPrefs(newState);
    });

    on<AddIssue>((event, emit) {
      final updatedIssues = Map<String, List<BodyPartIssue>>.from(state.issues);
      if (!updatedIssues.containsKey(event.partId)) {
        updatedIssues[event.partId] = [];
      }
      updatedIssues[event.partId] = List.from(updatedIssues[event.partId]!)..add(event.issue);
      
      final newState = state.copyWith(issues: updatedIssues);
      emit(newState);
      _saveToPrefs(newState);
    });

    on<UpdateGoals>((event, emit) {
      final newState = state.copyWith(patientGoals: event.goals);
      emit(newState);
      _saveToPrefs(newState);
    });

    on<SelectPartEvent>((event, emit) {
      emit(state.copyWith(selectedPartId: event.partId));
    });

    on<ToggleLiveAgent>((event, emit) {
      emit(state.copyWith(isLiveAgentActive: event.isActive));
    });

    on<ToggleResearchFrame>((event, emit) {
      emit(state.copyWith(isResearchFrameVisible: event.isVisible));
    });

    on<SelectNoteEvent>((event, emit) {
      emit(state.copyWith(selectedNoteId: event.noteId));
    });

    on<UpdateIssueEvent>((event, emit) {
      final updatedIssues = Map<String, List<BodyPartIssue>>.from(state.issues);
      if (!updatedIssues.containsKey(event.partId)) {
        updatedIssues[event.partId] = [event.issue];
      } else {
        final list = List<BodyPartIssue>.from(updatedIssues[event.partId]!);
        final index = list.indexWhere((i) => i.noteId == event.issue.noteId);
        if (index != -1) {
          list[index] = event.issue;
        } else {
          list.add(event.issue);
        }
        updatedIssues[event.partId] = list;
      }
      final newState = state.copyWith(
          issues: updatedIssues,
          selectedNoteId: state.selectedNoteId ?? event.issue.noteId,
      );
      emit(newState);
      _saveToPrefs(newState);
    });

    on<DeleteNoteEvent>((event, emit) {
      final updatedIssues = Map<String, List<BodyPartIssue>>.from(state.issues);
      if (updatedIssues.containsKey(event.partId)) {
        final list = List<BodyPartIssue>.from(updatedIssues[event.partId]!);
        list.removeWhere((i) => i.noteId == event.noteId);
        updatedIssues[event.partId] = list;
        
        String? nextNoteId;
        if (list.isNotEmpty) {
          nextNoteId = list.first.noteId;
        }

        final newState = state.copyWith(
          issues: updatedIssues,
          selectedNoteId: state.selectedNoteId == event.noteId ? nextNoteId : state.selectedNoteId,
        );
        emit(newState);
        _saveToPrefs(newState);
      }
    });

    on<SetViewingPastVisitDateEvent>((event, emit) {
      emit(state.copyWith(viewingPastVisitDate: event.date));
    });

    on<ToggleChecklistStatusEvent>((event, emit) {
      final updatedChecklist = state.checklist?.map((item) {
        if (item.id == event.itemId) {
          final nextStatus = switch (item.status) {
            BracketingState.normal => BracketingState.added,
            BracketingState.added => BracketingState.removed,
            BracketingState.removed => BracketingState.normal,
          };
          return item.copyWith(status: nextStatus);
        }
        return item;
      }).toList();

      final newState = state.copyWith(checklist: updatedChecklist);
      emit(newState);
      _saveToPrefs(newState);
    });

    on<ChangeAnatomicalViewModeEvent>((event, emit) {
      final newState = state.copyWith(viewMode: event.viewMode);
      emit(newState);
      _saveToPrefs(newState);
    });

    _loadFromPrefs();
  }

  Future<void> _saveToPrefs(PatientState state) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      final data = {
        'patientGoals': state.patientGoals,
        'vitals': {
          'bp': state.vitals.bp,
          'hr': state.vitals.hr,
          'temp': state.vitals.temp,
          'spO2': state.vitals.spO2,
          'weight': state.vitals.weight,
          'height': state.vitals.height,
        },
        'issues': state.issues.map((key, value) => MapEntry(
          key, 
          value.map((i) => {
            'noteId': i.noteId,
            'name': i.name,
            'description': i.description,
            'painLevel': i.painLevel,
            'recommendation': i.recommendation,
            'date': i.date,
          }).toList(),
        )),
        'checklist': state.checklist?.map((i) => {
          'id': i.id,
          'text': i.text,
          'status': i.status.index,
        }).toList(),
        'viewMode': state.viewMode.index,
      };
      
      await prefs.setString(_storageKey, jsonEncode(data));
    } catch (e) {
      print('Failed to save state: $e');
    }
  }

  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final dataStr = prefs.getString(_storageKey);
      if (dataStr != null) {
        final data = jsonDecode(dataStr);
        final vitalsData = data['vitals'];
        
        final loadedState = PatientState(
          patientGoals: data['patientGoals'] ?? '',
          vitals: PatientVitals(
            bp: vitalsData['bp'] ?? '',
            hr: vitalsData['hr'] ?? '',
            temp: vitalsData['temp'] ?? '',
            spO2: vitalsData['spO2'] ?? '',
            weight: vitalsData['weight'] ?? '',
            height: vitalsData['height'] ?? '',
          ),
          issues: (data['issues'] as Map).map((key, value) => MapEntry(
            key as String,
            (value as List).map((i) => BodyPartIssue(
              id: key,
              noteId: i['noteId'],
              name: i['name'],
              description: i['description'],
              painLevel: i['painLevel'],
              recommendation: i['recommendation'],
              date: i['date'],
              symptoms: const [],
            )).toList(),
          )),
          checklist: (data['checklist'] as List?)?.map((i) => ChecklistItem(
            id: i['id'],
            text: i['text'],
            status: BracketingState.values[i['status'] ?? 0],
          )).toList() ?? [],
          viewMode: AnatomicalViewMode.values[data['viewMode'] ?? 0],
        );
        add(LoadPatient(loadedState));
      }
    } catch (e) {
      print('Failed to load state: $e');
    }
  }
}
