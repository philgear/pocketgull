import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Network state — tracks online/offline status and AI execution path.
///
/// Flutter parity with Angular `network-state.service.ts`.
/// Uses `connectivity_plus` for real network detection on mobile,
/// unlike the Angular version which relies on `navigator.onLine`.

const String _localInferenceKey = 'pg_preferLocalInference';

class NetworkStateModel {
  final bool isConnected;
  final bool forceOffline;
  final bool preferLocalInference;

  const NetworkStateModel({
    this.isConnected = true,
    this.forceOffline = false,
    this.preferLocalInference = false,
  });

  /// Effective online status accounting for forced offline toggle.
  bool get isOnline => isConnected && !forceOffline;

  /// Whether local inference should be used (offline OR user prefers it).
  bool get useLocalInference => !isOnline || preferLocalInference;

  /// Reactive label for the active AI provider shown in status UI.
  String get activeProvider {
    if (useLocalInference) {
      final prefix = isOnline ? 'Local' : 'Offline';
      return '$prefix (On-Device)';
    }
    return 'Gemini Cloud';
  }

  NetworkStateModel copyWith({
    bool? isConnected,
    bool? forceOffline,
    bool? preferLocalInference,
  }) {
    return NetworkStateModel(
      isConnected: isConnected ?? this.isConnected,
      forceOffline: forceOffline ?? this.forceOffline,
      preferLocalInference: preferLocalInference ?? this.preferLocalInference,
    );
  }
}

class NetworkStateNotifier extends Notifier<NetworkStateModel> {
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  @override
  NetworkStateModel build() {
    _init();

    // Clean up subscription when provider is disposed.
    ref.onDispose(() {
      _subscription?.cancel();
    });

    return const NetworkStateModel();
  }

  Future<void> _init() async {
    // Load persisted preference.
    try {
      final prefs = await SharedPreferences.getInstance();
      final prefLocal = prefs.getString(_localInferenceKey) == 'true';
      if (prefLocal) {
        state = state.copyWith(preferLocalInference: true);
      }
    } catch (e) {
      debugPrint('[NetworkState] Failed to load preference: $e');
    }

    // Check current connectivity.
    try {
      final results = await Connectivity().checkConnectivity();
      final connected = !results.contains(ConnectivityResult.none);
      state = state.copyWith(isConnected: connected);
    } catch (e) {
      debugPrint('[NetworkState] Connectivity check failed: $e');
    }

    // Listen for changes.
    _subscription = Connectivity().onConnectivityChanged.listen((results) {
      final connected = !results.contains(ConnectivityResult.none);
      debugPrint('[NetworkState] Connectivity changed: $results → online=$connected');
      state = state.copyWith(isConnected: connected);
    });
  }

  /// Toggle forced offline mode for testing.
  void toggleForceOffline() {
    state = state.copyWith(forceOffline: !state.forceOffline);
    debugPrint('[NetworkState] Force offline: ${state.forceOffline}');
  }

  /// Toggle the user's preference for local inference and persist.
  Future<void> togglePreferLocalInference() async {
    final next = !state.preferLocalInference;
    state = state.copyWith(preferLocalInference: next);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_localInferenceKey, next.toString());
    } catch (e) {
      debugPrint('[NetworkState] Failed to persist local inference pref: $e');
    }
  }
}

final networkStateProvider =
    NotifierProvider<NetworkStateNotifier, NetworkStateModel>(() {
  return NetworkStateNotifier();
});
