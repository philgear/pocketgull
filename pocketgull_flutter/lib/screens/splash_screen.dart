import 'package:flutter/material.dart';
import '../widgets/origami_seagull.dart';
import 'home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _foldController;
  late Animation<double> _paperScale;
  late Animation<double> _paperRotation;
  late Animation<double> _paperOpacity;

  @override
  void initState() {
    super.initState();
    
    _foldController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    );

    _paperScale = TweenSequence([
      TweenSequenceItem(tween: Tween<double>(begin: 1.0, end: 0.8), weight: 40),
      TweenSequenceItem(tween: Tween<double>(begin: 0.8, end: 0.0), weight: 60),
    ]).animate(CurvedAnimation(parent: _foldController, curve: Curves.easeIn));

    _paperRotation = Tween<double>(begin: 0, end: 6.28).animate(
      CurvedAnimation(parent: _foldController, curve: Curves.easeInOut),
    );

    _paperOpacity = TweenSequence([
      TweenSequenceItem(tween: Tween<double>(begin: 1.0, end: 1.0), weight: 80),
      TweenSequenceItem(tween: Tween<double>(begin: 1.0, end: 0.0), weight: 20),
    ]).animate(_foldController);

    _foldController.forward().then((_) {
      // Transition to HomeScreen after animation completes
      Future.delayed(const Duration(milliseconds: 1000), () {
        if (mounted) {
          Navigator.of(context).pushReplacement(
            PageRouteBuilder(
              pageBuilder: (_, _, _) => const HomeScreen(),
              transitionsBuilder: (_, a, _, c) => FadeTransition(opacity: a, child: c),
              transitionDuration: const Duration(milliseconds: 800),
            ),
          );
        }
      });
    });
  }

  @override
  void dispose() {
    _foldController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 300,
              height: 300,
              child: Stack(
                alignment: Alignment.bottomCenter,
                children: [
                  // The Pocket
                  Container(
                    width: 200,
                    height: 80,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 15,
                          offset: const Offset(0, -6),
                        )
                      ],
                    ),
                    child: Center(
                      child: Container(
                        width: 100,
                        height: 5,
                        decoration: BoxDecoration(
                          color: const Color(0xFF111827),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),
                  ),
                  
                  // The Paper (Folding)
                  AnimatedBuilder(
                    animation: _foldController,
                    builder: (context, child) {
                      return Opacity(
                        opacity: _paperOpacity.value,
                        child: Transform.translate(
                          offset: const Offset(0, -50),
                          child: Transform.rotate(
                            angle: _paperRotation.value,
                            child: Transform.scale(
                              scale: _paperScale.value,
                              child: Container(
                                width: 80,
                                height: 100,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  border: Border.all(color: const Color(0xFFE5E7EB)),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.05),
                                      blurRadius: 16,
                                      offset: const Offset(0, 6),
                                    )
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),

                  // The Seagull (Emerging)
                  const OrigamiSeagull(size: 240),
                ],
              ),
            ),
            const SizedBox(height: 48),
            const Text(
              'POCKET GULL',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 4.0,
                color: Color(0xFF111827),
              ),
            ),
            const Text(
              'CLINICAL INTELLIGENCE PLATFORM',
              style: TextStyle(
                fontSize: 10,
                letterSpacing: 2.0,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
