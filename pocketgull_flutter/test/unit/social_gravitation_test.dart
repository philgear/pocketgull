import 'package:flutter_test/flutter_test.dart';
import 'package:pocketgull_flutter/models/social_vector.dart';
import 'package:pocketgull_flutter/services/social_gravitation_service.dart';

void main() {
  group('SocialGravitationService & Vector Models Test', () {
    test('defaultSocialVectors should contain both gravitate and avoid targets', () {
      final vectors = SocialGravitationService.defaultSocialVectors;
      expect(vectors, isNotEmpty);
      expect(vectors.length, equals(5));

      final gravitateVectors = vectors.where((v) => v.type == 'gravitate').toList();
      final avoidVectors = vectors.where((v) => v.type == 'avoid').toList();

      expect(gravitateVectors.length, equals(3));
      expect(avoidVectors.length, equals(2));
      expect(gravitateVectors.first.coherenceMatchPercent, greaterThanOrEqualTo(90));
    });

    test('defaultHobbies should contain 5 pro-health character building hobbies', () {
      final hobbies = SocialGravitationService.defaultHobbies;
      expect(hobbies, isNotEmpty);
      expect(hobbies.length, equals(5));
      expect(hobbies.first.name, contains('Bonsai'));
      expect(hobbies.first.characterTrait, contains('Patience'));
    });

    test('SocialVector serialization and deserialization should preserve values', () {
      const vector = SocialVector(
        id: 'test-1',
        name: 'Vagal Breathwork Circle',
        category: 'event',
        type: 'gravitate',
        coherenceMatchPercent: 98,
        distanceMiles: 1.2,
        emoji: '🌅',
        biomarkerImpact: 'Cortisol reduction',
        energeticRationale: 'Sattva Guna',
        tcmAyurvedicMatch: 'Heart Shen',
        locationName: 'Ocean Park',
      );

      final json = vector.toJson();
      final deserialized = SocialVector.fromJson(json);

      expect(deserialized.id, equals(vector.id));
      expect(deserialized.name, equals(vector.name));
      expect(deserialized.coherenceMatchPercent, equals(98));
      expect(deserialized.distanceMiles, equals(1.2));
    });
  });
}
