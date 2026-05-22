import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class OrigamiSeagull extends StatefulWidget {
  const OrigamiSeagull({super.key});

  @override
  State<OrigamiSeagull> createState() => _OrigamiSeagullState();
}

class _OrigamiSeagullState extends State<OrigamiSeagull>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _slideAnimation;
  late Animation<double> _fadeAnimation;

  final String _seagullSvg = '''
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Far Wing -->
    <polygon points="50,40 65,15 58,45" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Tail -->
    <polygon points="20,50 50,40 10,35" fill="#e0e0e0" stroke="#d0d0d0" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Body Base -->
    <polygon points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f4" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Near Wing (Upper) -->
    <polygon points="50,40 58,45 35,85" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Near Wing (Fold) -->
    <polygon points="50,40 35,85 20,50" fill="#f9f9f9" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Neck/Head -->
    <polygon points="75,55 58,45 85,38" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round" />
    <!-- Beak - Kaizen Green Accent -->
    <polygon points="85,38 82,45 95,34" fill="#34A853" stroke="#15803d" stroke-width="0.5" stroke-linejoin="round" />
  </svg>
  ''';

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    // Slide up from bottom
    _slideAnimation = Tween<double>(begin: 80.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.2, 1.0, curve: Curves.easeOutCubic),
      ),
    );

    // Fade in
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeIn),
      ),
    );

    // Start animation on load
    _controller.forward();
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
          offset: Offset(0, _slideAnimation.value),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: child,
          ),
        );
      },
      child: Center(
        child: SizedBox(
          width: 140,
          height: 140,
          child: SvgPicture.string(
            _seagullSvg,
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}
