import 'package:flutter/material.dart';
import '../../services/knowledge_synthesis_service.dart';
import 'insight_card_widget.dart';

/// Insight grid — responsive grid layout for insight cards.
///
/// Flutter parity with Angular `insight-grid.component.ts`.

class InsightGridWidget extends StatelessWidget {
  final List<InsightNode> insights;

  const InsightGridWidget({super.key, required this.insights});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 900
            ? 3
            : constraints.maxWidth > 500
                ? 2
                : 1;

        return GridView.builder(
          padding: const EdgeInsets.all(20),
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 20,
            mainAxisSpacing: 20,
            childAspectRatio: 1.4,
          ),
          itemCount: insights.length,
          itemBuilder: (context, index) {
            return InsightCardWidget(insight: insights[index]);
          },
        );
      },
    );
  }
}
