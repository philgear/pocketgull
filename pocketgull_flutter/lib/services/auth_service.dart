import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';

/// Auth state — tracks biometric verification status.
///
/// Flutter parity with Angular `auth.service.ts`.
/// Uses `local_auth` package for biometric prompts on mobile (Touch ID /
/// Face ID / PIN). Falls back to simulated auth on platforms that lack
/// biometric hardware (web, emulators).

class AuthState {
  final bool isBiometricallyVerified;
  final String authError;

  const AuthState({
    this.isBiometricallyVerified = false,
    this.authError = '',
  });

  AuthState copyWith({bool? isBiometricallyVerified, String? authError}) {
    return AuthState(
      isBiometricallyVerified: isBiometricallyVerified ?? this.isBiometricallyVerified,
      authError: authError ?? this.authError,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  final LocalAuthentication _localAuth = LocalAuthentication();

  @override
  AuthState build() => const AuthState();

  /// Triggers a local biometric prompt (Touch ID / Face ID / PIN).
  ///
  /// On mobile, this delegates to [LocalAuthentication.authenticate].
  /// On web or devices without biometric hardware, it gracefully falls back
  /// to a simulated 800 ms success path so the app remains functional.
  Future<bool> promptLocalBiometric() async {
    try {
      debugPrint('[Security] Requesting Biometric Verification...');

      bool authenticated = false;

      // Check if the device supports biometrics at all.
      final bool isDeviceSupported = await _localAuth.isDeviceSupported();
      final bool canCheckBiometrics = await _localAuth.canCheckBiometrics;

      if (isDeviceSupported && canCheckBiometrics) {
        authenticated = await _localAuth.authenticate(
          localizedReason: 'Verify your identity to access patient records',
        );
        debugPrint('[Security] Biometric result: $authenticated');
      } else {
        // Graceful fallback for web, emulators, or devices without biometrics.
        debugPrint('[Security] Biometrics unavailable — using simulated auth');
        await Future<void>.delayed(const Duration(milliseconds: 800));
        authenticated = true;
      }

      state = state.copyWith(
        isBiometricallyVerified: authenticated,
        authError: authenticated ? '' : 'Biometric verification denied',
      );
      return authenticated;
    } catch (e) {
      debugPrint('[Security] Biometric verification failed: $e');
      state = state.copyWith(
        isBiometricallyVerified: false,
        authError: e.toString(),
      );
      return false;
    }
  }

  /// Returns the list of available biometric types on this device.
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (e) {
      debugPrint('[Security] Failed to enumerate biometrics: $e');
      return [];
    }
  }

  void logout() {
    state = state.copyWith(isBiometricallyVerified: false);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
