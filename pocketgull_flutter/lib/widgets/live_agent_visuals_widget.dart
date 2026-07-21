import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Live agent visuals — animated SVG-like orb avatar.
///
/// Flutter parity with Angular `live-agent-visuals.component.ts`.
/// Renders a pulsing/listening/processing state orb using CustomPainter
/// and AnimationController.

enum AgentVisualState { idle, listening, processing }

class LiveAgentVisualsWidget extends ConsumerStatefulWidget {
  final AgentVisualState agentState;
  final bool hasChatHistory;

  const LiveAgentVisualsWidget({
    super.key,
    this.agentState = AgentVisualState.idle,
    this.hasChatHistory = false,
  });

  @override
  ConsumerState<LiveAgentVisualsWidget> createState() =>
      _LiveAgentVisualsWidgetState();
}

class _LiveAgentVisualsWidgetState extends ConsumerState<LiveAgentVisualsWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: widget.hasChatHistory ? 0.1 : 1.0,
      duration: const Duration(milliseconds: 500),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 200,
            height: 200,
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return CustomPaint(
                  painter: _OrbPainter(
                    state: widget.agentState,
                    progress: _controller.value,
                  ),
                  size: const Size(200, 200),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          AnimatedOpacity(
            opacity: widget.hasChatHistory ? 0.0 : 1.0,
            duration: const Duration(milliseconds: 300),
            child: Column(
              children: [
                Text(
                  'POCKET GULL AI',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 3,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Live Clinical Co-Pilot',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 1.5,
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withValues(alpha: 0.5),
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

class _OrbPainter extends CustomPainter {
  final AgentVisualState state;
  final double progress; // 0.0 → 1.0 repeating

  _OrbPainter({required this.state, required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final baseRadius = size.width * 0.35;

    // Base circle outline.
    final basePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5
      ..color = Colors.grey.withValues(alpha: 0.2);
    canvas.drawCircle(center, baseRadius, basePaint);

    switch (state) {
      case AgentVisualState.idle:
        _drawIdlePulse(canvas, center, baseRadius);
      case AgentVisualState.listening:
        _drawListeningWave(canvas, center, size);
      case AgentVisualState.processing:
        _drawProcessingSpinner(canvas, center, baseRadius);
    }
  }

  void _drawIdlePulse(Canvas canvas, Offset center, double baseRadius) {
    // Pulsing green core.
    final pulseScale = 1.0 + 0.15 * (0.5 + 0.5 * _sin01(progress));
    final radius = baseRadius * 0.28 * pulseScale;
    final alpha = 0.7 + 0.3 * _sin01(progress);

    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFF4ADE80).withValues(alpha: alpha);
    canvas.drawCircle(center, radius, paint);

    // Glow.
    final glowPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFF4ADE80).withValues(alpha: alpha * 0.15)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 20);
    canvas.drawCircle(center, radius * 2, glowPaint);
  }

  void _drawListeningWave(Canvas canvas, Offset center, Size size) {
    final path = Path();
    final startX = size.width * 0.2;
    final endX = size.width * 0.8;
    final midY = center.dy;
    final amplitude = 12.0 * (0.5 + 0.5 * _sin01(progress));

    path.moveTo(startX, midY);
    path.quadraticBezierTo(
      size.width * 0.35,
      midY - amplitude,
      size.width * 0.5,
      midY,
    );
    path.quadraticBezierTo(
      size.width * 0.65,
      midY + amplitude,
      endX,
      midY,
    );

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round
      ..color = const Color(0xFF60A5FA);
    canvas.drawPath(path, paint);

    // Glow ring.
    final glowPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFF60A5FA).withValues(alpha: 0.08)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 30);
    canvas.drawCircle(center, size.width * 0.4, glowPaint);
  }

  void _drawProcessingSpinner(Canvas canvas, Offset center, double baseRadius) {
    final spinnerRadius = baseRadius * 0.7;
    const sweepAngle = 2.3; // ~130 degrees
    final startAngle = progress * 6.283; // Full rotation per cycle

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..color = const Color(0xFFA78BFA);

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: spinnerRadius),
      startAngle,
      sweepAngle,
      false,
      paint,
    );

    // Glow.
    final glowPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFFA78BFA).withValues(alpha: 0.08)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 25);
    canvas.drawCircle(center, spinnerRadius * 1.3, glowPaint);
  }

  double _sin01(double t) {
    return (1.0 + math.sin(t * 2 * math.pi)) / 2.0;
  }

  @override
  bool shouldRepaint(covariant _OrbPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.state != state;
  }
}
