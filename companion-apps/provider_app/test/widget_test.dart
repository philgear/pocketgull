import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider_app/main.dart';
import 'package:provider_app/features/dashboard/screens/provider_dashboard.dart';
import 'package:provider_app/features/dashboard/screens/patient_detail_screen.dart';

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

  testWidgets('ProviderDashboard displays patients list and navigates to details', (WidgetTester tester) async {
    // Run the widget test within runWithClient to mock http requests
    await http.runWithClient(() async {
      await tester.pumpWidget(const ProviderApp());

      // Initial state: loading indicator should be visible
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      // Wait for the async _loadData request to complete and trigger a layout rebuild
      await tester.pumpAndSettle();

      // The loading indicator should now be gone, and patient list items should show
      expect(find.byType(CircularProgressIndicator), findsNothing);
      expect(find.text('Jane Doe'), findsOneWidget);
      expect(find.text('Age: 45 • Last Visit: 2026-06-15'), findsOneWidget);

      // Tap on the patient ListTile to trigger navigation to details screen
      await tester.tap(find.text('Jane Doe'));
      await tester.pumpAndSettle();

      // Verify that we successfully navigated to PatientDetailScreen
      expect(find.byType(PatientDetailScreen), findsOneWidget);
      expect(find.text('JANE DOE'), findsOneWidget);
      expect(find.text('AGE'), findsOneWidget);
      expect(find.text('45'), findsOneWidget);
      expect(find.text('HEARTRATE'), findsOneWidget);
      expect(find.text('72'), findsOneWidget);
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
