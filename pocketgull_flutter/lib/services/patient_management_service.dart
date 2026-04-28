import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
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
      'history': p.history,
      'bookmarks': p.bookmarks,
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
      history: json['history'] ?? [],
      bookmarks: json['bookmarks'] ?? [],
      scans: json['scans'] ?? [],
    );
  }
}
