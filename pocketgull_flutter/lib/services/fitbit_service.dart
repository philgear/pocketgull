import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

/// Connection status for Google Health / Fitbit integration.
class FitbitStatus {
  final bool connected;
  final bool expired;
  final String? scope;
  final String? expiresAt;
  final String? provider;
  final bool hasConsent;
  final String? consentTimestamp;
  final String? consentVersion;

  const FitbitStatus({
    required this.connected,
    this.expired = false,
    this.scope,
    this.expiresAt,
    this.provider,
    this.hasConsent = false,
    this.consentTimestamp,
    this.consentVersion,
  });

  factory FitbitStatus.fromJson(Map<String, dynamic> json) => FitbitStatus(
        connected: (json['connected'] as bool?) ?? false,
        expired: (json['expired'] as bool?) ?? false,
        scope: json['scope'] as String?,
        expiresAt: json['expiresAt'] as String?,
        provider: json['provider'] as String?,
        hasConsent: (json['hasConsent'] as bool?) ?? false,
        consentTimestamp: json['consentTimestamp'] as String?,
        consentVersion: json['consentVersion'] as String?,
      );

  static const disconnected = FitbitStatus(connected: false);

  bool get isActive => connected && !expired;
}

/// Result of a Google Health sync operation.
class GoogleHealthSyncResult {
  final String patientId;
  final String provider;
  final String syncedAt;
  final int dataPoints;
  final List<Map<String, dynamic>> biometricEntries;
  final List<Map<String, dynamic>> sleepSummary;

  const GoogleHealthSyncResult({
    required this.patientId,
    required this.provider,
    required this.syncedAt,
    required this.dataPoints,
    required this.biometricEntries,
    required this.sleepSummary,
  });

  factory GoogleHealthSyncResult.fromJson(Map<String, dynamic> json) =>
      GoogleHealthSyncResult(
        patientId: json['patientId'] as String? ?? '',
        provider: json['provider'] as String? ?? 'Google Health',
        syncedAt: json['syncedAt'] as String? ?? DateTime.now().toIso8601String(),
        dataPoints: (json['dataPoints'] as int?) ?? 0,
        biometricEntries: ((json['biometricEntries'] as List?) ?? []).cast<Map<String, dynamic>>(),
        sleepSummary: ((json['sleepSummary'] as List?) ?? []).cast<Map<String, dynamic>>(),
      );
}

/// The consented data types shown in the consent dialog.
const kHealthDataTypesConsented = [
  'Resting Heart Rate (bpm) — daily summary',
  'Oxygen Saturation / SpO2 (%) — daily average',
  'Sleep duration (minutes) and efficiency (%) — nightly summary',
];

const _consentVersion = '1.0.0';

/// FitbitService — mirrors Angular's fitbit.service.ts.
///
/// Manages the Google Health API OAuth2 lifecycle, informed consent gating,
/// biometric sync, and data withdrawal via the Cloud Run proxy backend.
///
/// Item #2: Cloud Run URL injected via --dart-define=CLOUD_RUN_URL (ACM §2.9).
class FitbitService extends ChangeNotifier {
  static final String _baseUrl = const String.fromEnvironment(
    'CLOUD_RUN_URL',
    defaultValue: 'https://pocket-gull-793190615625.us-west1.run.app',
  );

  bool _isSyncing = false;
  bool _isCheckingStatus = false;
  bool _hasConsented = false;
  bool _showConsentModal = false;
  FitbitStatus _connectionStatus = FitbitStatus.disconnected;
  GoogleHealthSyncResult? _lastSyncResult;
  String? _syncError;

  // ── Getters ──────────────────────────────────────────────────────────────────
  bool get isSyncing => _isSyncing;
  bool get isCheckingStatus => _isCheckingStatus;
  bool get hasConsented => _hasConsented;
  bool get showConsentModal => _showConsentModal;
  FitbitStatus get connectionStatus => _connectionStatus;
  GoogleHealthSyncResult? get lastSyncResult => _lastSyncResult;
  String? get syncError => _syncError;
  bool get isConnected => _connectionStatus.isActive;

  // ── Status check ─────────────────────────────────────────────────────────────
  /// Checks the Google Health connection status for the given patient.
  Future<void> checkStatus(String patientId) async {
    _isCheckingStatus = true;
    notifyListeners();
    try {
      final res = await http.get(
        Uri.parse('$_baseUrl/api/fitbit/status?patientId=${Uri.encodeComponent(patientId)}'),
      );
      if (res.statusCode == 200) {
        final status = FitbitStatus.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
        _connectionStatus = status;
        if (status.hasConsent) _hasConsented = true;
      }
    } catch (e) {
      debugPrint('[FitbitService] Status check failed: $e');
    } finally {
      _isCheckingStatus = false;
      notifyListeners();
    }
  }

  // ── Consent flow ─────────────────────────────────────────────────────────────
  /// Shows the consent modal if consent hasn't been given yet.
  void initiateAuth(String patientId) {
    if (_hasConsented) {
      // Consent already given — emit a signal for the UI to open the OAuth URL
      _triggerOAuthRedirect(patientId);
    } else {
      _showConsentModal = true;
      notifyListeners();
    }
  }

  /// Records informed consent server-side then triggers OAuth redirect URL.
  Future<void> acceptConsent(String patientId) async {
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/api/fitbit/consent'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'patientId': patientId,
          'acknowledged': true,
          'consentVersion': _consentVersion,
        }),
      );
      if (res.statusCode != 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
        throw Exception(data['error'] ?? 'Failed to record consent.');
      }
      _hasConsented = true;
      _showConsentModal = false;
      notifyListeners();
      _triggerOAuthRedirect(patientId);
    } catch (e) {
      _syncError = 'Could not record consent: $e';
      notifyListeners();
    }
  }

  void declineConsent() {
    _showConsentModal = false;
    notifyListeners();
  }

  // ── Sync ─────────────────────────────────────────────────────────────────────
  /// Syncs the latest 30 days of Google Health biometric data for [patientId].
  Future<GoogleHealthSyncResult?> sync(String patientId) async {
    _isSyncing = true;
    _syncError = null;
    notifyListeners();

    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/api/fitbit/sync/${Uri.encodeComponent(patientId)}'),
      );

      if (res.statusCode == 403) {
        _showConsentModal = true;
        return null;
      }

      if (res.statusCode == 401) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        _connectionStatus = FitbitStatus.disconnected;
        _syncError = (data['needsAuth'] == true)
            ? 'Google Health not connected. Please authorize via Integrations → Google Health Connect.'
            : (data['error'] as String? ?? 'Authorization failed.');
        return null;
      }

      if (res.statusCode != 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>? ?? {};
        throw Exception(data['error'] ?? 'Sync failed (${res.statusCode})');
      }

      final result = GoogleHealthSyncResult.fromJson(
          jsonDecode(res.body) as Map<String, dynamic>);
      _lastSyncResult = result;
      _connectionStatus = FitbitStatus(connected: true, provider: result.provider);
      debugPrint('[FitbitService] ✅ Synced ${result.dataPoints} data points.');
      return result;
    } catch (e) {
      _syncError = e.toString();
      return null;
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }

  // ── Revoke ───────────────────────────────────────────────────────────────────
  /// Revokes the stored Google Health token. Pass [purgeData]=true to request
  /// full data deletion (GDPR / research withdrawal compliance).
  Future<void> revoke(String patientId, {bool purgeData = false}) async {
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/api/fitbit/revoke'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'patientId': patientId, 'purgeData': purgeData}),
      );
      if (res.statusCode == 200) {
        _connectionStatus = FitbitStatus.disconnected;
        _lastSyncResult = null;
        _hasConsented = false;
        notifyListeners();
        debugPrint('[FitbitService] Token revoked for $patientId. Purge: $purgeData');
      }
    } catch (e) {
      debugPrint('[FitbitService] Revoke failed: $e');
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────────
  /// Returns the OAuth redirect URL. In mobile, the UI should launch this with url_launcher.
  String getOAuthUrl(String patientId) =>
      '$_baseUrl/api/fitbit/auth?patientId=${Uri.encodeComponent(patientId)}';

  void _triggerOAuthRedirect(String patientId) {
    // On mobile, the UI listens for oauthUrl changes and launches with url_launcher
    _pendingOAuthUrl = getOAuthUrl(patientId);
    notifyListeners();
  }

  /// Non-null when the service wants the UI to open an OAuth URL.
  /// The UI should consume it (set to null) after launching.
  String? _pendingOAuthUrl;
  String? get pendingOAuthUrl => _pendingOAuthUrl;
  void clearPendingOAuthUrl() {
    _pendingOAuthUrl = null;
    notifyListeners();
  }
}
