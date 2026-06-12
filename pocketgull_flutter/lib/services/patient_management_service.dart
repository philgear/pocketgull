import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:http/http.dart' as http;
import '../models/patient_types.dart';

class PatientManagementService {
  static const String _storageKey = 'pocket_gull_patients';

  Future<List<Patient>> loadPatients() async {
    final box = Hive.box('pocket_gull_db');
    
    // Check if Hive has patients
    if (box.containsKey('patients')) {
      try {
        final List<dynamic> decodedList = jsonDecode(box.get('patients') as String);
        return decodedList.map((json) => _patientFromJson(json)).toList();
      } catch (e) {
        debugPrint('Failed to parse patients from Hive: $e');
        return _getDefaultPatients();
      }
    }

    // Fallback/Migration from SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_storageKey);
    
    if (jsonString != null) {
      debugPrint('[Hive Migration] Migrating existing patients from SharedPreferences to Hive...');
      await box.put('patients', jsonString);
      try {
        final List<dynamic> decodedList = jsonDecode(jsonString);
        return decodedList.map((json) => _patientFromJson(json)).toList();
      } catch (e) {
        debugPrint('Failed to parse migrated patients: $e');
        return _getDefaultPatients();
      }
    }

    return _getDefaultPatients();
  }

  List<Patient> _getDefaultPatients() {
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
        triageScore: 0,
        kaizenColor: 'green',
        activeTimerSeconds: null,
        recommendedGuidelines: const [],
      ),
      Patient(
        id: 'p002',
        name: 'Sarah Jenkins',
        age: 42,
        gender: 'Female',
        lastVisit: '2024.11.20',
        preexistingConditions: ['Asthma', 'Heart Failure'],
        patientGoals: 'Manage recent shortness of breath.',
        vitals: const PatientVitals(bp: '95/60', hr: '145', temp: '101.2F', weight: '165 lbs', spO2: '89', height: '5\'4"'),
        issues: const {
          'chest': [
            BodyPartIssue(id: 'chest', noteId: 'n1', name: 'Severe Angina', description: 'Crushing chest pain', painLevel: 9, recommendation: 'Immediate ECG', date: '2024.11.20', symptoms: []),
          ]
        },
        history: const [],
        bookmarks: const [],
        scans: const [],
        triageScore: 12,
        kaizenColor: 'red',
        activeTimerSeconds: 3600,
        recommendedGuidelines: const [
          {'id': '18893435', 'title': 'The heart in bronchial asthma.'},
          {'id': '20241492', 'title': 'Cardiac complications and deaths in asthmatic patients.'}
        ],
      ),
      Patient(
        id: 'p003',
        name: 'John Doe',
        age: 34,
        gender: 'Male',
        lastVisit: '2024.11.20',
        preexistingConditions: ['None'],
        patientGoals: 'Survive severe respiratory distress and shock.',
        vitals: const PatientVitals(bp: '85/50', hr: '130', temp: '103.1F', weight: '180 lbs', spO2: '82', height: '6\'0"'),
        issues: const {
          'chest': [
            BodyPartIssue(id: 'chest', noteId: 'n1', name: 'Pulmonary Edema', description: 'Severe fluid buildup', painLevel: 9, symptoms: []),
          ],
          'abdomen': [
            BodyPartIssue(id: 'abdomen', noteId: 'n2', name: 'Renal Failure', description: 'Hemorrhagic fever signs', painLevel: 7, symptoms: []),
          ],
          'pelvis': [
            BodyPartIssue(id: 'pelvis', noteId: 'n3', name: 'Renal Failure', description: 'Kidney involvement', painLevel: 7, symptoms: []),
          ],
          'l_arm': [
            BodyPartIssue(id: 'l_arm', noteId: 'n4', name: 'Myalgia / Shock', description: 'Capillary leak', painLevel: 5, symptoms: []),
          ],
          'r_arm': [
            BodyPartIssue(id: 'r_arm', noteId: 'n5', name: 'Myalgia / Shock', description: 'Capillary leak', painLevel: 5, symptoms: []),
          ],
          'l_thigh': [
            BodyPartIssue(id: 'l_thigh', noteId: 'n6', name: 'Myalgia / Shock', description: 'Capillary leak', painLevel: 5, symptoms: []),
          ],
          'r_thigh': [
            BodyPartIssue(id: 'r_thigh', noteId: 'n7', name: 'Myalgia / Shock', description: 'Capillary leak', painLevel: 5, symptoms: []),
          ]
        },
        history: const [],
        bookmarks: const [],
        scans: const [],
        triageScore: 15,
        kaizenColor: 'red',
        activeTimerSeconds: 1800,
        recommendedGuidelines: const [
          {'id': '98765432', 'title': 'Hantavirus Pulmonary Syndrome: Clinical Management'},
          {'id': '11223344', 'title': 'Extracorporeal Membrane Oxygenation in Severe HPS'}
        ],
      )
    ];
  }

  Future<void> savePatients(List<Patient> patients) async {
    final box = Hive.box('pocket_gull_db');
    final jsonList = patients.map((p) => _patientToJson(p)).toList();
    await box.put('patients', jsonEncode(jsonList));
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
        debugPrint('[PatientManagementService] Successfully synced to cloud');
        return true;
      } else {
        debugPrint('[PatientManagementService] Failed to sync. Status: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      debugPrint('[PatientManagementService] Error syncing to cloud: $e');
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

  Patient _copyWith(Patient p, {List<HistoryEntry>? history, List<Bookmark>? bookmarks, String? lastVisit, int? triageScore, String? kaizenColor, int? activeTimerSeconds, List<Map<String, String>>? recommendedGuidelines}) {
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
      triageScore: triageScore ?? p.triageScore,
      kaizenColor: kaizenColor ?? p.kaizenColor,
      activeTimerSeconds: activeTimerSeconds ?? p.activeTimerSeconds,
      recommendedGuidelines: recommendedGuidelines ?? p.recommendedGuidelines,
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
      'triageScore': p.triageScore,
      'kaizenColor': p.kaizenColor,
      'activeTimerSeconds': p.activeTimerSeconds,
      'recommendedGuidelines': p.recommendedGuidelines,
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
      triageScore: json['triageScore'] ?? 0,
      kaizenColor: json['kaizenColor'] ?? 'green',
      activeTimerSeconds: json['activeTimerSeconds'],
      recommendedGuidelines: (json['recommendedGuidelines'] as List?)?.map((g) => Map<String, String>.from(g)).toList() ?? [],
    );
  }
}
