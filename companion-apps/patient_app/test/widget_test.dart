// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:patient_app/main.dart';

void main() {
  const String mockPatientsResponse = '''
  [
    {
      "id": "patient-1",
      "name": "Jane Doe",
      "age": 45,
      "gender": "Female",
      "lastVisit": "2026-06-15",
      "preexistingConditions": ["Hypertension"],
      "vitals": {
        "heartRate": 72,
        "systolic": 120,
        "diastolic": 80
      },
      "patientGoals": "Manage blood pressure",
      "biometricHistory": [],
      "issues": {},
      "checklist": [],
      "clinicalNotes": []
    }
  ]
  ''';

  testWidgets('Splash login screen loads and displays title', (WidgetTester tester) async {
    await http.runWithClient(() async {
      // Build our app and trigger a frame.
      await tester.pumpWidget(const PocketGullApp());
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      // Verify that the title and portal texts are shown.
      expect(find.text('POCKET GULL'), findsOneWidget);
      expect(find.text('PATIENT CARE PLAN PORTAL'), findsOneWidget);
    }, () => MockClient((request) async {
      if (request.url.path.endsWith('/patients')) {
        return http.Response(mockPatientsResponse, 200, headers: {
          'content-type': 'application/json; charset=utf-8',
        });
      }
      return http.Response('Not found', 404);
    }));
  });
}
