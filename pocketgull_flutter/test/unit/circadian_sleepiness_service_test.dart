import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/services/circadian_sleepiness_service.dart';

void main() {
  group('CircadianSleepinessService Unit Tests', () {

    test('initializes KSS descriptors scale (1 to 9)', () {
      final service = CircadianSleepinessService();
      expect(service.kssItems.length, equals(9));
      expect(service.kssDescriptor(1).label, contains('Extremely Alert'));
      expect(service.kssDescriptor(9).label, contains('Very Sleepy'));
      service.dispose();
    });

    test('computes morning-peak circadian phase correctly', () {
      final service = CircadianSleepinessService();
      final morningTime = DateTime(2026, 7, 25, 9, 30); // 9:30 AM
      final context = service.getCircadianContext(morningTime);

      expect(context.phase, equals('morning-peak'));
      expect(context.expectedKss, equals(2));
      expect(context.cognitiveLoad, equals('optimal'));
      expect(context.avsWave, equals('alpha'));
      service.dispose();
    });

    test('computes post-lunch dip circadian phase correctly', () {
      final service = CircadianSleepinessService();
      final dipTime = DateTime(2026, 7, 25, 13, 30); // 1:30 PM
      final context = service.getCircadianContext(dipTime);

      expect(context.phase, equals('post-lunch-dip'));
      expect(context.expectedKss, equals(6));
      expect(context.cognitiveLoad, equals('reduced'));
      expect(context.avsWave, equals('beta'));
      service.dispose();
    });

    test('computes graveyard hours circadian phase correctly', () {
      final service = CircadianSleepinessService();
      final graveyardTime = DateTime(2026, 7, 25, 3, 15); // 3:15 AM
      final context = service.getCircadianContext(graveyardTime);

      expect(context.phase, equals('graveyard'));
      expect(context.expectedKss, equals(9));
      expect(context.cognitiveLoad, equals('impaired'));
      expect(context.avsWave, equals('beta'));
      service.dispose();
    });

    test('builds high-risk readiness profile and AVS reset when clinician KSS is elevated', () {
      final service = CircadianSleepinessService();
      service.now = DateTime(2026, 7, 25, 2, 30); // 2:30 AM night shift
      service.clinicianKss = 8; // Sleepy

      final readiness = service.readiness;
      expect(readiness, isNotNull);
      expect(readiness?.combinedAlert, equals('high-risk'));
      expect(readiness?.avsReset, isNotNull);
      expect(readiness?.avsReset?.wave, equals('beta'));
      expect(readiness?.avsReset?.durationMin, equals(15));
      service.dispose();
    });

  });
}
