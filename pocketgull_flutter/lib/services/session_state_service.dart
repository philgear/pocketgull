import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_service.dart';

/// Session state — manages lock/unlock and idle timeout.
///
/// Flutter parity with Angular `session-state.service.ts`.
/// Tracks whether the app is locked (requiring biometric re-auth)
/// and enforces a configurable inactivity timeout.

class SessionState {
  final bool isLocked;
  final bool isOnboardingComplete;

  const SessionState({
    this.isLocked = true,
    this.isOnboardingComplete = false,
  });

  SessionState copyWith({bool? isLocked, bool? isOnboardingComplete}) {
    return SessionState(
      isLocked: isLocked ?? this.isLocked,
      isOnboardingComplete: isOnboardingComplete ?? this.isOnboardingComplete,
    );
  }
}

class SessionStateNotifier extends Notifier<SessionState> {
  /// Inactivity timeout in seconds (10 minutes).
  static const int _timeoutSeconds = 10 * 60;

  Timer? _idleTimer;

  @override
  SessionState build() {
    _loadOnboardingState();
    _resetIdleTimer();
    // Dispose timer when provider is disposed.
    ref.onDispose(() => _idleTimer?.cancel());
    return const SessionState();
  }

  /// Unlock the session via biometric prompt.
  Future<bool> unlock() async {
    final authNotifier = ref.read(authProvider.notifier);
    final success = await authNotifier.promptLocalBiometric();
    if (success) {
      state = state.copyWith(isLocked: false);
      _resetIdleTimer();
      return true;
    }
    return false;
  }

  /// Verify biometrics without unlocking (e.g. for sensitive operations).
  Future<bool> verifyBiometrics() async {
    final authNotifier = ref.read(authProvider.notifier);
    return await authNotifier.promptLocalBiometric();
  }

  /// Lock the session immediately.
  void lock() {
    state = state.copyWith(isLocked: true, isOnboardingComplete: false);
    _idleTimer?.cancel();
  }

  /// Mark onboarding as complete for this session.
  void completeOnboarding() {
    state = state.copyWith(isOnboardingComplete: true);
    _saveOnboardingState();
  }

  /// Reset the idle timer (call on any user interaction).
  void resetIdleTimer() => _resetIdleTimer();

  void _resetIdleTimer() {
    _idleTimer?.cancel();
    if (!state.isLocked) {
      _idleTimer = Timer(const Duration(seconds: _timeoutSeconds), () {
        lock();
      });
    }
  }

  Future<void> _loadOnboardingState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final onboarded = prefs.getBool('pg_session_onboarded') ?? false;
      if (onboarded) {
        state = state.copyWith(isOnboardingComplete: true);
      }
    } catch (e) {
      debugPrint('[Session] Failed to load onboarding state: $e');
    }
  }

  Future<void> _saveOnboardingState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('pg_session_onboarded', true);
    } catch (e) {
      debugPrint('[Session] Failed to save onboarding state: $e');
    }
  }
}

final sessionStateProvider = NotifierProvider<SessionStateNotifier, SessionState>(() {
  return SessionStateNotifier();
});
