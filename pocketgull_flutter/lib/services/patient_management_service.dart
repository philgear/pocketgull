import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../models/patient_types.dart';

class PatientManagementService {
  static const String _storageKey = 'pocket_gull_patients';

  Future<List<Patient>> loadPatients() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_storageKey);
    
    if (jsonString == null) {
      // Return a default mock patient if empty
      return [
        Patient(
          id: 'p001',
          name: 'Robert Davis',
          age: 58,
          gender: 'Male',
          lastVisit: '2024.11.20',
          preexistingConditions: ['Essential Hypertension'],
          patientGoals: 'Discuss CPAP compliance issues.',
          vitals: const PatientVitals(bp: '152/95', hr: '88', temp: '98.4F', weight: '295 lbs', spO2: '', height: ''),
          issues: const {},
          history: const [],
          bookmarks: const [],
          scans: const [],
        )
      ];
    }

    try {
      final List<dynamic> decodedList = jsonDecode(jsonString);
      // Depending on how Patient.fromJson is implemented, map it
      // For now, we will assume a generic conversion if needed, 
      // but since we haven't written the full fromJson for Patient in models,
      // we'll leave this generic.
      return decodedList.map((json) => _patientFromJson(json)).toList();
    } catch (e) {
      print('Failed to parse patients: $e');
      return [];
    }
  }

  Future<void> savePatients(List<Patient> patients) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonList = patients.map((p) => _patientToJson(p)).toList();
    await prefs.setString(_storageKey, jsonEncode(jsonList));
  }

  Future<bool> syncToCloud(List<Patient> patients) async {
    try {
      final jsonList = patients.map((p) => _patientToJson(p)).toList();
      final response = await http.post(
        Uri.parse('/api/patients'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(jsonList),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        print('[PatientManagementService] Successfully synced to cloud');
        return true;
      } else {
        print('[PatientManagementService] Failed to sync. Status: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('[PatientManagementService] Error syncing to cloud: $e');
      return false;
    }
  }

  Patient addHistoryEntry(Patient patient, HistoryEntry entry) {
    final updatedHistory = [entry, ...patient.history];
    if (entry is VisitHistoryEntry) {
      return _copyWith(patient, history: updatedHistory, lastVisit: entry.date);
    }
    return _copyWith(patient, history: updatedHistory);
  }

  Patient updateHistoryEntry(Patient patient, HistoryEntry entry, bool Function(HistoryEntry) matchFn) {
    final index = patient.history.indexWhere(matchFn);
    if (index == -1) {
      return addHistoryEntry(patient, entry);
    }
    final updatedHistory = List<HistoryEntry>.from(patient.history);
    updatedHistory[index] = entry;
    return _copyWith(patient, history: updatedHistory);
  }

  Patient addBookmark(Patient patient, Bookmark bookmark) {
    final updatedBookmarks = [...patient.bookmarks, bookmark];
    final historyEntry = BookmarkAddedHistoryEntry(
      date: DateTime.now().toIso8601String().split('T')[0].replaceAll('-', '.'),
      summary: bookmark.title,
      bookmark: bookmark,
    );
    return addHistoryEntry(
      _copyWith(patient, bookmarks: updatedBookmarks),
      historyEntry,
    );
  }

  Patient removeBookmark(Patient patient, String url) {
    return _copyWith(
      patient,
      bookmarks: patient.bookmarks.where((b) => b.url != url).toList(),
    );
  }

  Patient _copyWith(Patient p, {List<HistoryEntry>? history, List<Bookmark>? bookmarks, String? lastVisit}) {
    return Patient(
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      lastVisit: lastVisit ?? p.lastVisit,
      preexistingConditions: p.preexistingConditions,
      history: history ?? p.history,
      bookmarks: bookmarks ?? p.bookmarks,
      issues: p.issues,
      patientGoals: p.patientGoals,
      vitals: p.vitals,
      scans: p.scans,
    );
  }

  // Temporary serialization helpers since patient_types.dart didn't have full JSON logic
  Map<String, dynamic> _patientToJson(Patient p) {
    return {
      'id': p.id,
      'name': p.name,
      'age': p.age,
      'gender': p.gender,
      'lastVisit': p.lastVisit,
      'preexistingConditions': p.preexistingConditions,
      'patientGoals': p.patientGoals,
      'vitals': {
        'bp': p.vitals.bp,
        'hr': p.vitals.hr,
        'temp': p.vitals.temp,
        'spO2': p.vitals.spO2,
        'weight': p.vitals.weight,
        'height': p.vitals.height,
      },
      'history': p.history.map((h) => h.toJson()).toList(),
      'bookmarks': p.bookmarks.map((b) => b.toJson()).toList(),
      'scans': p.scans,
    };
  }

  Patient _patientFromJson(Map<String, dynamic> json) {
    return Patient(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      age: json['age'] ?? 0,
      gender: json['gender'] ?? '',
      lastVisit: json['lastVisit'] ?? '',
      preexistingConditions: List<String>.from(json['preexistingConditions'] ?? []),
      patientGoals: json['patientGoals'] ?? '',
      vitals: PatientVitals(
        bp: json['vitals']?['bp'] ?? '',
        hr: json['vitals']?['hr'] ?? '',
        temp: json['vitals']?['temp'] ?? '',
        spO2: json['vitals']?['spO2'] ?? '',
        weight: json['vitals']?['weight'] ?? '',
        height: json['vitals']?['height'] ?? '',
      ),
      issues: const {}, // Ignoring complex nested mapping for now in this skeleton
      history: (json['history'] as List?)?.map((j) => HistoryEntry.fromJson(j)).toList() ?? [],
      bookmarks: (json['bookmarks'] as List?)?.map((j) => Bookmark.fromJson(j)).toList() ?? [],
      scans: json['scans'] ?? [],
    );
  }
}
