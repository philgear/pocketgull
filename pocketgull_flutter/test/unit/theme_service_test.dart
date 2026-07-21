import 'package:flutter/material.dart' show Brightness;
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pocketgull_flutter/services/theme_service.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('ThemeNotifier initialized with default state and modifies values', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    // Default configuration checking
    expect(container.read(themeProvider).currentTheme, AppTheme.light);
    expect(container.read(themeProvider).resolvedBrightness, Brightness.light);

    // Apply change
    container.read(themeProvider.notifier).setTheme(AppTheme.dark);

    expect(container.read(themeProvider).currentTheme, AppTheme.dark);
    expect(container.read(themeProvider).resolvedBrightness, Brightness.dark);
  });
}
