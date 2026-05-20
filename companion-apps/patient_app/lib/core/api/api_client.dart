import 'dart:convert';
import 'dart:developer';
import 'package:http/http.dart' as http;

import 'package:flutter/foundation.dart';

class ApiClient {
  static String get baseUrl {
    if (kIsWeb) {
      final origin = Uri.base.origin;
      return '$origin/api';
    }
    return 'http://127.0.0.1:3000/api';
  }

  Future<List<Map<String, dynamic>>> fetchPatients() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/patients'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        log('Failed to load patients: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      log('Error fetching patients: $e');
      return [];
    }
  }

  Future<bool> syncPatientData(String patientId, Map<String, dynamic> updates) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/patients/$patientId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(updates),
      );
      if (response.statusCode == 200) {
        log('Successfully synced patient $patientId');
        return true;
      } else {
        log('Failed to sync patient: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      log('Error syncing patient data: $e');
      return false;
    }
  }
}
