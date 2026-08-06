import 'package:flutter_test/flutter_test.dart';
import 'package:patient_app/main.dart';

void main() {
  testWidgets('Patient App loads PocketGullApp root widget', (WidgetTester tester) async {
    await tester.pumpWidget(const PocketGullApp());
    expect(find.byType(PocketGullApp), findsOneWidget);
  });
}
