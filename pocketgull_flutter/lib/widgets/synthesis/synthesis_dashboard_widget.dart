import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/knowledge_synthesis_service.dart';
import 'serene_intake_widget.dart';
import 'insight_grid_widget.dart';

/// Synthesis dashboard — draggable/resizable knowledge synthesis panel.
///
/// Flutter parity with Angular `synthesis-dashboard.component.ts`.
/// Shows either the serene intake form or the insight grid once data
/// has been synthesized. On mobile, renders full-screen.

class SynthesisDashboardWidget extends ConsumerWidget {
  final VoidCallback? onClose;

  const SynthesisDashboardWidget({super.key, this.onClose});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final synthesis = ref.watch(knowledgeSynthesisProvider);
    final hasData = synthesis.hasSynthesizedData;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF09090B) : const Color(0xFFEEEEEE),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? Colors.white.withValues(alpha: 0.06) : Colors.grey.shade300,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.12),
            blurRadius: 30,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header bar
          Container(
            height: 40,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF18181B) : Colors.grey.shade100,
              border: Border(
                bottom: BorderSide(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.06)
                      : Colors.grey.shade200,
                ),
              ),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(12)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.science,
                      size: 16,
                      color: isDark
                          ? const Color(0xFF3B82F6)
                          : const Color(0xFF2563EB),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'KNOWLEDGE SYNTHESIS ENGINE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 2,
                        color: isDark
                            ? Colors.grey.shade400
                            : Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    if (hasData)
                      GestureDetector(
                        onTap: () => ref
                            .read(knowledgeSynthesisProvider.notifier)
                            .reset(),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: isDark
                                  ? Colors.white.withValues(alpha: 0.1)
                                  : Colors.grey.shade300,
                            ),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Reset Canvas',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.5,
                              color: isDark
                                  ? Colors.grey.shade400
                                  : Colors.grey.shade500,
                            ),
                          ),
                        ),
                      ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: onClose,
                      child: Icon(
                        Icons.close,
                        size: 16,
                        color: isDark
                            ? Colors.grey.shade500
                            : Colors.grey.shade400,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Body
          Expanded(
            child: Stack(
              children: [
                // Ambient background blobs
                Positioned(
                  top: -50,
                  left: -30,
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF3B82F6)
                          .withValues(alpha: isDark ? 0.06 : 0.03),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -40,
                  right: -30,
                  child: Container(
                    width: 180,
                    height: 180,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF14B8A6)
                          .withValues(alpha: isDark ? 0.06 : 0.03),
                    ),
                  ),
                ),
                // Content
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Interactive Synthesizer',
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w700,
                                  color: isDark
                                      ? Colors.white
                                      : Colors.grey.shade900,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'AI-POWERED DISTILLATION',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 2,
                                  color: isDark
                                      ? Colors.grey.shade500
                                      : Colors.grey.shade400,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const Divider(height: 32),
                      Expanded(
                        child: synthesis.isProcessing
                            ? const Center(
                                child: CircularProgressIndicator())
                            : hasData
                                ? SingleChildScrollView(
                                    child: InsightGridWidget(
                                        insights: synthesis.insights),
                                  )
                                : const SereneIntakeWidget(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
