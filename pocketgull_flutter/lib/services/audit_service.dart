import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

/// Cloud audit telemetry service.
///
/// Flutter parity with Angular `audit.service.ts`.
/// Dispatches immutable audit log entries containing the current action
/// and affected PHI Patient ID to the backend `/api/audit` endpoint.

class AuditService {
  final String _baseUrl;

  AuditService({String baseUrl = ''}) : _baseUrl = baseUrl; // ignore: prefer_initializing_formals

  /// Log a clinical action to the cloud audit trail.
  ///
  /// Silently drops telemetry in emergency mode or on network errors.
  Future<void> logAction(
    String action, {
    String? patientId,
    Map<String, dynamic>? details,
    bool isEmergencyMode = false,
  }) async {
    if (isEmergencyMode) {
      debugPrint('[Audit] Telemetry suppressed in Emergency Mode.');
      return;
    }

    try {
      await http.post(
        Uri.parse('$_baseUrl/api/audit'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'action': action,
          'userId': 'clinical-auth-user', // Mocked until enterprise auth
          'patientId': patientId,
          'details': details,
          'timestamp': DateTime.now().toUtc().toIso8601String(),
        }),
      );
    } catch (e) {
      debugPrint('[Audit] Telemetry failed to stream: $e');
    }
  }
}

final auditServiceProvider = Provider<AuditService>((ref) {
  return AuditService();
});
