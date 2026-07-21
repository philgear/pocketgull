import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

/// FHIR / SMART-on-FHIR integration service.
///
/// Flutter parity with Angular `fhir-integration.service.ts`.
/// Handles OAuth 2.0 authorization flow with Epic MyChart and
/// token management for FHIR R4 API access.

class FhirIntegrationService {
  /// Epic SMART-on-FHIR configuration.
  static const String _clientId = 'pocketgull-sandbox-client-id';
  static const String _scopes =
      'launch/patient openid fhirUser '
      'patient/Observation.read patient/Condition.read '
      'patient/DiagnosticReport.read patient/DocumentReference.read '
      'patient/MedicationRequest.read';
  static const String _epicAuthUrl =
      'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize';
  static const String _epicTokenUrl =
      'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token';

  String? _accessToken;
  String? _patientId;

  /// Whether we have a valid access token.
  bool get isConnected => _accessToken != null;
  String? get patientId => _patientId;

  /// Build the OAuth 2.0 authorization URL for the given redirect URI.
  ///
  /// On mobile this would be opened via `url_launcher` or a custom tab.
  Uri buildAuthorizeUrl(String redirectUri) {
    return Uri.parse(_epicAuthUrl).replace(queryParameters: {
      'response_type': 'code',
      'client_id': _clientId,
      'redirect_uri': redirectUri,
      'scope': _scopes,
      'state': DateTime.now().millisecondsSinceEpoch.toString(),
      'aud': 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R6',
    });
  }

  /// Exchange an authorization code for an access token.
  Future<bool> handleCallback(String code, String redirectUri) async {
    try {
      final response = await http.post(
        Uri.parse(_epicTokenUrl),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: {
          'grant_type': 'authorization_code',
          'code': code,
          'redirect_uri': redirectUri,
          'client_id': _clientId,
        },
      );

      if (response.statusCode != 200) {
        debugPrint('[FHIR] Token exchange failed: ${response.statusCode}');
        return false;
      }

      final tokenData = jsonDecode(response.body);
      _accessToken = tokenData['access_token'] as String?;
      _patientId = tokenData['patient'] as String?;

      debugPrint('[FHIR] Successfully connected to Epic MyChart!');
      return true;
    } catch (e) {
      debugPrint('[FHIR] Token exchange error: $e');
      return false;
    }
  }

  /// Fetch a FHIR resource from the connected server.
  Future<Map<String, dynamic>?> fetchResource(String resourceType, {String? id}) async {
    if (_accessToken == null) return null;
    try {
      final url = id != null
          ? 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R6/$resourceType/$id'
          : 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R6/$resourceType?patient=$_patientId';
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $_accessToken',
          'Accept': 'application/fhir+json',
        },
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('[FHIR] Fetch error: $e');
    }
    return null;
  }

  /// Disconnect from the FHIR server.
  void disconnect() {
    _accessToken = null;
    _patientId = null;
  }
}

final fhirIntegrationProvider = Provider<FhirIntegrationService>((ref) {
  return FhirIntegrationService();
});
