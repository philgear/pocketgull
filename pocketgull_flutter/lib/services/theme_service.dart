import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// Theme service — provides reactive [ThemeMode] state with Hive persistence.
///
/// Mirrors Angular's ThemeService. Call [toggle] to switch dark/light;
/// the preference is persisted in the `pocket_gull_db` Hive box.
class ThemeService extends ValueNotifier<ThemeMode> {
  static const _key = 'theme_mode';

  ThemeService() : super(_loadInitial());

  static ThemeMode _loadInitial() {
    try {
      final box = Hive.box('pocket_gull_db');
      final saved = box.get(_key) as String?;
      return switch (saved) {
        'dark' => ThemeMode.dark,
        'light' => ThemeMode.light,
        _ => ThemeMode.system,
      };
    } catch (_) {
      return ThemeMode.system;
    }
  }

  ThemeMode get current => value;
  bool get isDark => value == ThemeMode.dark;

  /// Cycles: system → light → dark → system
  void toggle() {
    value = switch (value) {
      ThemeMode.system => ThemeMode.light,
      ThemeMode.light => ThemeMode.dark,
      ThemeMode.dark => ThemeMode.system,
    };
    _persist();
  }

  void setMode(ThemeMode mode) {
    value = mode;
    _persist();
  }

  void _persist() {
    try {
      final box = Hive.box('pocket_gull_db');
      box.put(_key, switch (value) {
        ThemeMode.dark => 'dark',
        ThemeMode.light => 'light',
        _ => 'system',
      });
    } catch (_) {}
  }

  /// Returns the appropriate [Icon] for the current mode.
  IconData get icon => switch (value) {
        ThemeMode.light => Icons.light_mode_outlined,
        ThemeMode.dark => Icons.dark_mode_outlined,
        _ => Icons.brightness_auto_outlined,
      };

  /// Returns a label string for the current mode.
  String get label => switch (value) {
        ThemeMode.light => 'LIGHT',
        ThemeMode.dark => 'DARK',
        _ => 'AUTO',
      };
}
