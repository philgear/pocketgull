import 'package:flutter_test/flutter_test.dart';
import 'package:provider_app/main.dart';

void main() {
  testWidgets('Provider App loads ProviderApp root widget', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderApp());
    expect(find.byType(ProviderApp), findsOneWidget);
  });
}
