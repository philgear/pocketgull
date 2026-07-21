import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/knowledge_synthesis_service.dart';

/// Serene intake — calm-mode unstructured text input.
///
/// Flutter parity with Angular `serene-intake.component.ts`.
/// Provides a zen-like textarea for free-form clinical text input
/// with a "Synthesize" button to trigger knowledge distillation.

class SereneIntakeWidget extends ConsumerStatefulWidget {
  const SereneIntakeWidget({super.key});

  @override
  ConsumerState<SereneIntakeWidget> createState() =>
      _SereneIntakeWidgetState();
}

class _SereneIntakeWidgetState extends ConsumerState<SereneIntakeWidget> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _synthesize() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    ref.read(knowledgeSynthesisProvider.notifier).synthesize(text);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 700),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Header
            Text(
              "What's on your mind?",
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w300,
                color: isDark ? Colors.white : Colors.grey.shade800,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Speak freely or paste your unstructured data. '
              'We will distill the signal from the noise.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                letterSpacing: 0.5,
                color: isDark ? Colors.grey.shade400 : Colors.grey.shade500,
              ),
            ),
            const SizedBox(height: 32),
            // Textarea with glassmorphism
            Container(
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.04)
                    : Colors.white.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.08)
                      : Colors.white.withValues(alpha: 0.4),
                ),
                boxShadow: [
                  BoxShadow(
                    color:
                        Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: [
                  TextField(
                    controller: _controller,
                    maxLines: 6,
                    onChanged: (_) => setState(() {}),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      height: 1.6,
                      color: isDark ? Colors.white : Colors.grey.shade800,
                    ),
                    decoration: InputDecoration(
                      hintText:
                          'Type or paste medical notes, research abstracts, '
                          'or symptom descriptions...',
                      hintStyle: TextStyle(
                        color: isDark
                            ? Colors.grey.shade600
                            : Colors.grey.shade400,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.all(24),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 14),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.02)
                          : Colors.grey.shade50.withValues(alpha: 0.5),
                      border: Border(
                        top: BorderSide(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.06)
                              : Colors.grey.shade100,
                        ),
                      ),
                      borderRadius: const BorderRadius.vertical(
                        bottom: Radius.circular(24),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Voice button
                        TextButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.mic, size: 18),
                          label: const Text(
                            'Use Voice',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: TextButton.styleFrom(
                            foregroundColor: isDark
                                ? Colors.grey.shade300
                                : Colors.grey.shade600,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                        ),
                        // Synthesize button
                        ElevatedButton.icon(
                          onPressed: _controller.text.trim().isNotEmpty
                              ? _synthesize
                              : null,
                          icon: const Icon(Icons.arrow_forward, size: 16),
                          label: const Text(
                            'SYNTHESIZE',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 2,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark
                                ? Colors.white
                                : Colors.grey.shade900,
                            foregroundColor: isDark
                                ? Colors.grey.shade900
                                : Colors.white,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            disabledBackgroundColor:
                                Colors.grey.withValues(alpha: 0.3),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
