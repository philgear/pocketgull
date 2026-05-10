import 'package:flutter/material.dart';
import 'dart:math' as math;

class OrigamiSeagull extends StatefulWidget {
  final double size;
  const OrigamiSeagull({super.key, this.size = 200});

  @override
  State<OrigamiSeagull> createState() => _OrigamiSeagullState();
}

class _OrigamiSeagullState extends State<OrigamiSeagull> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _flapAnimation;
  late Animation<double> _hoverAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _flapAnimation = Tween<double>(begin: -0.08, end: 0.08).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _hoverAnimation = Tween<double>(begin: 0.0, end: 20.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, -80 + _hoverAnimation.value),
          child: Transform.rotate(
            angle: _flapAnimation.value,
            child: Transform.scale(
              scale: 1.0 + (_hoverAnimation.value / 750),
              child: SizedBox(
                width: widget.size,
                height: widget.size,
                child: CustomPaint(
                  painter: _SeagullPainter(),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _SeagullPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..strokeWidth = 0.5
      ..strokeJoin = StrokeJoin.round;

    final strokePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5
      ..strokeJoin = StrokeJoin.round;

    void drawPolygon(List<Offset> points, Color fill, Color stroke) {
      final path = Path()..addPolygon(points, true);
      canvas.drawPath(path, paint..color = fill);
      canvas.drawPath(path, strokePaint..color = stroke);
    }

    // Scale coordinates to fit size (original is 100x100)
    final s = size.width / 100;

    // Far Wing
    drawPolygon([
      Offset(50 * s, 40 * s),
      Offset(65 * s, 15 * s),
      Offset(58 * s, 45 * s),
    ], const Color(0xFFD0D0D0), const Color(0xFFB0B0B0));

    // Tail
    drawPolygon([
      Offset(20 * s, 50 * s),
      Offset(50 * s, 40 * s),
      Offset(10 * s, 35 * s),
    ], const Color(0xFFE0E0E0), const Color(0xFFD0D0D0));

    // Body Base
    drawPolygon([
      Offset(20 * s, 50 * s),
      Offset(50 * s, 40 * s),
      Offset(58 * s, 45 * s),
      Offset(75 * s, 55 * s),
      Offset(50 * s, 65 * s),
    ], const Color(0xFFF4F4F4), const Color(0xFFE0E0E0));

    // Near Wing (Upper)
    drawPolygon([
      Offset(50 * s, 40 * s),
      Offset(58 * s, 45 * s),
      Offset(35 * s, 85 * s),
    ], Colors.white, const Color(0xFFF0F0F0));

    // Near Wing (Fold)
    drawPolygon([
      Offset(50 * s, 40 * s),
      Offset(35 * s, 85 * s),
      Offset(20 * s, 50 * s),
    ], const Color(0xFFF9F9F9), const Color(0xFFE0E0E0));

    // Neck/Head
    drawPolygon([
      Offset(75 * s, 55 * s),
      Offset(58 * s, 45 * s),
      Offset(85 * s, 38 * s),
    ], Colors.white, const Color(0xFFF0F0F0));

    // Beak
    drawPolygon([
      Offset(85 * s, 38 * s),
      Offset(82 * s, 45 * s),
      Offset(95 * s, 34 * s),
    ], const Color(0xFFFF4500), const Color(0xFFDF3D00));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
