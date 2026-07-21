import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Consent state — tracks HIPAA-aligned data consent acknowledgment.
///
/// Flutter parity with Angular `consent.service.ts`.
/// Persists consent acknowledgment to SharedPreferences.
///
/// @see ACM Code of Ethics §1.6 — Respect Privacy

const String _consentKey = 'pg_data_consent_v1';
const String _consentTsKey = 'pg_data_consent_v1_ts';

class ConsentState {
  final bool hasConsented;
  final String? consentTimestamp;

  const ConsentState({
    this.hasConsented = false,
    this.consentTimestamp,
  });

  ConsentState copyWith({bool? hasConsented, String? consentTimestamp}) {
    return ConsentState(
      hasConsented: hasConsented ?? this.hasConsented,
      consentTimestamp: consentTimestamp ?? this.consentTimestamp,
    );
  }
}

class ConsentNotifier extends Notifier<ConsentState> {
  @override
  ConsentState build() {
    _loadConsent();
    return const ConsentState();
  }

  /// Record the user's informed consent and persist to local storage.
  Future<void> acceptConsent() async {
    final ts = DateTime.now().toIso8601String();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_consentKey, 'true');
      await prefs.setString(_consentTsKey, ts);
    } catch (e) {
      debugPrint('[Consent] Failed to persist consent: $e');
    }
    state = state.copyWith(hasConsented: true, consentTimestamp: ts);
    debugPrint('[Consent] User consented at $ts');
  }

  /// Revoke consent and clear the persisted acknowledgment.
  Future<void> revokeConsent() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_consentKey);
      await prefs.remove(_consentTsKey);
    } catch (e) {
      debugPrint('[Consent] Failed to clear consent: $e');
    }
    state = const ConsentState(hasConsented: false);
    debugPrint('[Consent] Consent revoked');
  }

  Future<void> _loadConsent() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final consented = prefs.getString(_consentKey) == 'true';
      final ts = prefs.getString(_consentTsKey);
      if (consented) {
        state = ConsentState(hasConsented: true, consentTimestamp: ts);
      }
    } catch (e) {
      debugPrint('[Consent] Failed to load consent state: $e');
    }
  }
}

final consentProvider = NotifierProvider<ConsentNotifier, ConsentState>(() {
  return ConsentNotifier();
});
