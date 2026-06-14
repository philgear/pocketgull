import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';

/// AuthService — mirrors Angular's auth.service.ts.
///
/// Wraps [LocalAuthentication] to perform biometric User Verification
/// (Touch ID, Face ID, Android Fingerprint). On platforms without biometrics,
/// it simulates a successful check (development parity mode) so the rest of the
/// app functions without hardware dependency.
class AuthService extends ChangeNotifier {
  final _auth = LocalAuthentication();

  bool _isBiometricallyVerified = false;
  String _authError = '';

  bool get isBiometricallyVerified => _isBiometricallyVerified;
  String get authError => _authError;

  /// Triggers a local biometric prompt (Touch ID / Face ID / Windows Hello).
  /// Returns `true` on success.
  Future<bool> promptLocalBiometric() async {
    _authError = '';
    notifyListeners();

    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isDeviceSupported = await _auth.isDeviceSupported();

      if (!canCheck && !isDeviceSupported) {
        // Simulate success in dev/demo environments with no enrolled biometrics
        debugPrint('[Security] Biometrics unavailable — simulating success for demo.');
        await Future.delayed(const Duration(milliseconds: 800));
        _isBiometricallyVerified = true;
        notifyListeners();
        return true;
      }

      debugPrint('[Security] Requesting Biometric Verification…');
      final authenticated = await _auth.authenticate(
        localizedReason: 'Verify your identity to access Pocket Gull',
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
          useErrorDialogs: true,
        ),
      );

      _isBiometricallyVerified = authenticated;
      if (!authenticated) {
        _authError = 'Biometric verification was not successful.';
      }
      notifyListeners();
      return authenticated;
    } catch (e) {
      debugPrint('[Security] Biometric verification failed: $e');
      _authError = e.toString();
      _isBiometricallyVerified = false;
      notifyListeners();
      return false;
    }
  }

  void logout() {
    _isBiometricallyVerified = false;
    _authError = '';
    notifyListeners();
  }
}
