import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/patient_types.dart';

/// FHIR R4 integration service — mirrors Angular's FhirIntegrationService.
///
/// Exports active patient state as FHIR R4 Bundle JSON and syncs to the
/// Cloud Run Healthcare API proxy (`/api/healthcare/fhir/export`).
/// Also supports importing bundles from the proxy.
class FhirIntegrationService {
  final String _baseUrl;

  FhirIntegrationService({String? baseUrl})
      : _baseUrl = baseUrl ?? 'https://pocket-gull-793190615625.us-west1.run.app';

  // ── Export ────────────────────────────────────────────────────────────────────

  /// Serializes [patient] to a FHIR R4 Bundle and returns the JSON string.
  String exportToFhirBundle(Patient patient) {
    final now = DateTime.now().toUtc().toIso8601String();
    final bundleId = 'pocketgull-${patient.id}-${DateTime.now().millisecondsSinceEpoch}';

    final patientResource = {
      'resourceType': 'Patient',
      'id': patient.id,
      'meta': {'lastUpdated': now},
      'name': [
        {
          'use': 'official',
          'text': patient.name,
        }
      ],
      'gender': patient.gender.toLowerCase(),
      'birthDate': _estimateBirthYear(patient.age),
    };

    final conditionResources = patient.preexistingConditions
        .where((c) => c != 'None')
        .map((condition) => {
              'resourceType': 'Condition',
              'id': 'cond-${patient.id}-${condition.hashCode.abs()}',
              'subject': {'reference': 'Patient/${patient.id}'},
              'code': {
                'text': condition,
              },
              'clinicalStatus': {
                'coding': [
                  {
                    'system': 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                    'code': 'active',
                  }
                ]
              },
              'recordedDate': now,
            })
        .toList();

    final observationResources = <Map<String, dynamic>>[];
    if (patient.vitals.bp.isNotEmpty) {
      observationResources.add(_buildObservation(
        id: 'obs-bp-${patient.id}',
        patientId: patient.id,
        code: '55284-4',
        display: 'Blood pressure systolic and diastolic',
        value: patient.vitals.bp,
        unit: 'mmHg',
        date: now,
      ));
    }
    if (patient.vitals.hr.isNotEmpty) {
      observationResources.add(_buildObservation(
        id: 'obs-hr-${patient.id}',
        patientId: patient.id,
        code: '8867-4',
        display: 'Heart rate',
        value: patient.vitals.hr,
        unit: '/min',
        date: now,
      ));
    }
    if (patient.vitals.spO2.isNotEmpty) {
      observationResources.add(_buildObservation(
        id: 'obs-spo2-${patient.id}',
        patientId: patient.id,
        code: '2708-6',
        display: 'Oxygen saturation',
        value: patient.vitals.spO2,
        unit: '%',
        date: now,
      ));
    }

    final allEntries = <Map<String, dynamic>>[
      {'fullUrl': 'Patient/${patient.id}', 'resource': patientResource},
      ...conditionResources.map(
          (r) => {'fullUrl': '${r['resourceType']}/${r['id']}', 'resource': r}),
      ...observationResources.map(
          (r) => {'fullUrl': '${r['resourceType']}/${r['id']}', 'resource': r}),
    ];

    final bundle = {
      'resourceType': 'Bundle',
      'id': bundleId,
      'meta': {'lastUpdated': now},
      'type': 'collection',
      'timestamp': now,
      'entry': allEntries,
    };

    return const JsonEncoder.withIndent('  ').convert(bundle);
  }

  /// Exports [patient] to FHIR R4 and POSTs the bundle to the Cloud Run
  /// Healthcare API proxy. Returns `true` on success.
  Future<bool> syncToHealthcareApi(Patient patient) async {
    try {
      final bundleJson = exportToFhirBundle(patient);
      final response = await http.post(
        Uri.parse('$_baseUrl/api/healthcare/fhir/export'),
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json',
        },
        body: bundleJson,
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 || response.statusCode == 201) {
        debugPrint('[FhirIntegrationService] Successfully synced patient ${patient.id}');
        return true;
      } else {
        debugPrint('[FhirIntegrationService] Sync failed. Status: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      debugPrint('[FhirIntegrationService] Error syncing to Healthcare API: $e');
      return false;
    }
  }

  // ── Import ────────────────────────────────────────────────────────────────────

  /// Fetches a FHIR Patient resource from the Healthcare API proxy by patient ID.
  Future<Map<String, dynamic>?> fetchFhirPatient(String patientId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/healthcare/fhir/import/$patientId'),
        headers: {'Accept': 'application/fhir+json'},
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      debugPrint('[FhirIntegrationService] Fetch failed. Status: ${response.statusCode}');
      return null;
    } catch (e) {
      debugPrint('[FhirIntegrationService] Error fetching FHIR patient: $e');
      return null;
    }
  }

  /// Maps a FHIR R4 Observation resource to a [PatientVitals] field value.
  static String mapObservationToVitalValue(Map<String, dynamic> obs) {
    final valueQuantity = obs['valueQuantity'];
    if (valueQuantity != null) {
      final value = valueQuantity['value']?.toString() ?? '';
      final unit = valueQuantity['unit'] ?? '';
      return '$value $unit'.trim();
    }
    // String-valued observations (e.g., BP "120/80")
    return obs['valueString'] ?? '';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  Map<String, dynamic> _buildObservation({
    required String id,
    required String patientId,
    required String code,
    required String display,
    required String value,
    required String unit,
    required String date,
  }) {
    return {
      'resourceType': 'Observation',
      'id': id,
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
      'subject': {'reference': 'Patient/$patientId'},
      'effectiveDateTime': date,
      'valueString': value,
    };
  }

  String _estimateBirthYear(int age) {
    final year = DateTime.now().year - age;
    return '$year-01-01';
  }
}
