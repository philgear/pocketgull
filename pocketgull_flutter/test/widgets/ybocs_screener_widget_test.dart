import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pocketgull_flutter/widgets/ybocs_screener_widget.dart';

void main() {
  testWidgets('YbocsScreenerWidget renders score layout and checklist tabs', (WidgetTester tester) async {
    // Set a large screen size to prevent row layout overflow under test constraints
    tester.view.physicalSize = const Size(1024, 768);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: YbocsScreenerWidget(),
          ),
        ),
      ),
    );

    // Verify key titles and widgets exist
    expect(find.text('Yale-Brown Obsessive-Compulsive Scale'), findsOneWidget);
    expect(find.byWidgetPredicate((widget) => widget is RichText && widget.text.toPlainText().contains('/40')), findsOneWidget);
    expect(find.text('Obsessions Checklist'), findsOneWidget);

    // Tap Compulsions Checklist
    await tester.tap(find.text('Compulsions Checklist'));
    await tester.pumpAndSettle();
  });
}
