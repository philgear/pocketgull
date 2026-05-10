import 'package:flutter/material.dart';

class BoxBreathingWrapper extends StatefulWidget {
  final Widget child;
  final bool isBreathing;

  const BoxBreathingWrapper({
    super.key,
    required this.child,
    this.isBreathing = false,
  });

  @override
  State<BoxBreathingWrapper> createState() => _BoxBreathingWrapperState();
}

class _BoxBreathingWrapperState extends State<BoxBreathingWrapper>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _borderAnimation;
  late Animation<double> _shadowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 16),
    )..repeat();

    // 0-4s: Inhale (Expand)
    // 4-8s: Hold
    // 8-12s: Exhale (Contract)
    // 12-16s: Hold

    _borderAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(1.0),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(0.0),
        weight: 25, // 4s
      ),
    ]).animate(_controller);

    _shadowAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(1.0),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25, // 4s
      ),
      TweenSequenceItem(
        tween: ConstantTween<double>(0.0),
        weight: 25, // 4s
      ),
    ]).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isBreathing) return widget.child;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: Color.lerp(
                const Color(0xFFE5E7EB),
                const Color(0xFF689F38),
                _borderAnimation.value,
              )!,
              width: 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF689F38).withOpacity(0.2 * _shadowAnimation.value),
                blurRadius: 4.0 * _shadowAnimation.value,
                spreadRadius: 2.0 * _shadowAnimation.value,
              ),
            ],
          ),
          child: child,
        );
      },
      child: widget.child,
    );
  }
}
