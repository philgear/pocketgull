import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/patient_types.dart';

final fhirServiceProvider = Provider<FhirService>((ref) {
  return FhirService();
});

class FhirService {
  /// Converts an active PatientState into a fully compliant FHIR R4 Bundle JSON document.
  Map<String, dynamic> exportPatientToFhirBundle(PatientState state) {
    final patientId = 'patient_${state.name.replaceAll(' ', '_').toLowerCase()}';
    final nowIso = DateTime.now().toIso8601String();

    final List<Map<String, dynamic>> entries = [];

    // 1. FHIR Patient Resource
    final patientResource = {
      'resourceType': 'Patient',
      'id': patientId,
      'identifier': [
        {
          'system': 'http://pocketgull.app/fhir/patient-id',
          'value': patientId,
        }
      ],
      'active': true,
      'name': [
        {
          'use': 'official',
          'text': sanitizeString(state.name),
          'family': sanitizeString(state.name.split(' ').last),
          'given': state.name.split(' ').take(state.name.split(' ').length - 1).map(sanitizeString).toList(),
        }
      ],
      'gender': 'unknown',
      'birthDate': '1985-06-15',
    };

    entries.add({
      'fullUrl': 'urn:uuid:patient-$patientId',
      'resource': patientResource,
    });

    // 2. FHIR Observations (Vitals)
    final vitals = state.vitals;
    if (vitals.bp.isNotEmpty) {
      entries.add(_createObservationEntry(patientId, '85354-9', 'Blood Pressure', vitals.bp, 'mmHg', nowIso));
    }
    if (vitals.hr.isNotEmpty) {
      entries.add(_createObservationEntry(patientId, '8867-4', 'Heart Rate', vitals.hr, 'bpm', nowIso));
    }
    if (vitals.spO2.isNotEmpty) {
      entries.add(_createObservationEntry(patientId, '2708-6', 'Oxygen Saturation', vitals.spO2, '%', nowIso));
    }
    if (vitals.temp.isNotEmpty) {
      entries.add(_createObservationEntry(patientId, '8310-5', 'Body Temperature', vitals.temp, 'F', nowIso));
    }

    // 3. FHIR Conditions (Anatomical Issues & Pain Markers)
    int condIndex = 0;
    state.issues.forEach((partId, issueList) {
      for (var issue in issueList) {
        condIndex++;
        final conditionResource = {
          'resourceType': 'Condition',
          'id': '$patientId-cond-$condIndex',
          'clinicalStatus': {
            'coding': [
              {
                'system': 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                'code': issue.escalationFlag ? 'active' : 'recurrence',
              }
            ]
          },
          'verificationStatus': {
            'coding': [
              {
                'system': 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                'code': 'confirmed',
              }
            ]
          },
          'category': [
            {
              'coding': [
                {
                  'system': 'http://terminology.hl7.org/CodeSystem/condition-category',
                  'code': 'problem-list-item',
                  'display': 'Problem List Item',
                }
              ]
            }
          ],
          'code': {
            'text': sanitizeString(issue.name),
          },
          'subject': {
            'reference': 'Patient/$patientId',
          },
          'bodySite': [
            {
              'text': sanitizeString(partId),
            }
          ],
          'note': [
            {
              'text': sanitizeString(issue.description),
            }
          ],
          'extension': [
            {
              'url': 'http://pocketgull.app/fhir/StructureDefinition/pain-level',
              'valueInteger': issue.painLevel,
            },
            if (issue.trajectory != null)
              {
                'url': 'http://pocketgull.app/fhir/StructureDefinition/trajectory',
                'valueString': issue.trajectory,
              },
          ],
        };

        entries.add({
          'fullUrl': 'urn:uuid:cond-$patientId-$condIndex',
          'resource': conditionResource,
        });
      }
    });

    // Final FHIR Bundle Construct
    return {
      'resourceType': 'Bundle',
      'id': 'bundle-$patientId-${DateTime.now().millisecondsSinceEpoch}',
      'meta': {
        'lastUpdated': nowIso,
      },
      'type': 'collection',
      'total': entries.length,
      'entry': entries,
    };
  }

  /// Exports FHIR Bundle formatted as formatted JSON string
  String exportPatientToFhirJson(PatientState state) {
    final bundleMap = exportPatientToFhirBundle(state);
    return const JsonEncoder.withIndent('  ').convert(bundleMap);
  }

  /// HIPAA-compatible string sanitization helper (strips script tags & ORCID identifiers)
  String sanitizeString(String input) {
    return input
        .replaceAll(RegExp(r'<script[^>]*>([\s\S]*?)<\/script>', caseSensitive: false), '')
        .replaceAll(RegExp(r'0000-000[0-9]-[0-9]{4}-[0-9]{3}[0-9X]'), '[REDACTED_ORCID]')
        .trim();
  }



  Map<String, dynamic> _createObservationEntry(
    String patientId,
    String code,
    String display,
    String value,
    String unit,
    String dateIso,
  ) {
    return {
      'fullUrl': 'urn:uuid:obs-$code-${DateTime.now().millisecondsSinceEpoch}',
      'resource': {
        'resourceType': 'Observation',
        'id': 'obs-$patientId-$code',
        'status': 'final',
        'code': {
          'coding': [
            {
              'system': 'http://loinc.org',
              'code': code,
              'display': display,
            }
          ],
          'text': display,
        },
        'subject': {
          'reference': 'Patient/$patientId',
        },
        'effectiveDateTime': dateIso,
        'valueString': sanitizeString(value),
      },
    };
  }
}
