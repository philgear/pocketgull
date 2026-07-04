import 'package:flutter/material.dart';
import '../widgets/origami_seagull.dart';
import 'dashboard_screen.dart';

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

  bool _showLockScreen = false;
  String _pinCode = '';
  final TextEditingController _apiKeyController = TextEditingController();
  bool _usePubGemma = false;

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
      // Reveal the lock screen after animation completes
      Future.delayed(const Duration(milliseconds: 800), () {
        if (mounted) {
          setState(() {
            _showLockScreen = true;
          });
        }
      });
    });
  }

  @override
  void dispose() {
    _foldController.dispose();
    _apiKeyController.dispose();
    super.dispose();
  }

  void _handlePinPress(String digit) {
    if (_pinCode.length < 4) {
      setState(() {
        _pinCode += digit;
      });
      if (_pinCode.length == 4) {
        _unlockAndNavigate();
      }
    }
  }

  void _handleBiometricUnlock() {
    _unlockAndNavigate();
  }

  void _unlockAndNavigate() {
    // In a production app, we would validate the PIN and securely store the API Key / PubGemma config here.
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, _, _) => const DashboardScreen(),
        transitionsBuilder: (_, a, _, c) => FadeTransition(opacity: a, child: c),
        transitionDuration: const Duration(milliseconds: 800),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    // Base layout calculates vertical centering based on screen size minus a fixed offset
    final double centerOffset = (size.height * 0.5) - 200;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Logo Container
            AnimatedPositioned(
              duration: const Duration(milliseconds: 800),
              curve: Curves.easeInOut,
              top: _showLockScreen ? (size.height * 0.02) : centerOffset,
              left: 0,
              right: 0,
              child: AnimatedScale(
                scale: _showLockScreen ? 0.6 : 1.0,
                duration: const Duration(milliseconds: 800),
                curve: Curves.easeInOut,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
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
            ),
            
            // Lock Screen UI
            if (_showLockScreen)
              Positioned(
                top: size.height * 0.35,
                bottom: 0,
                left: 0,
                right: 0,
                child: TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 800),
                  curve: Curves.easeIn,
                  builder: (context, opacity, child) {
                    return Opacity(
                      opacity: opacity,
                      child: child,
                    );
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: _buildLockUI(),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLockUI() {
    return Column(
      children: [
        const SizedBox(height: 10),
        // Biometric / PIN Status
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(4, (index) => Container(
            margin: const EdgeInsets.symmetric(horizontal: 8),
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: index < _pinCode.length ? Colors.black87 : Colors.grey.shade300,
            ),
          )),
        ),
        const SizedBox(height: 24),
        // Biometric Button
        InkWell(
          onTap: _handleBiometricUnlock,
          borderRadius: BorderRadius.circular(32),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.grey.shade50,
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: const Icon(Icons.fingerprint, color: Color(0xFF416B1F), size: 36),
          ),
        ),
        const SizedBox(height: 8),
        const Text('BIOMETRIC UNLOCK', style: TextStyle(fontSize: 10, letterSpacing: 2, color: Colors.grey)),
        
        // PIN Pad
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: GridView.count(
              crossAxisCount: 3,
              childAspectRatio: 1.6,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                for (var i = 1; i <= 9; i++) _buildPinButton(i.toString()),
                const SizedBox.shrink(),
                _buildPinButton('0'),
                IconButton(
                  icon: const Icon(Icons.backspace_outlined, color: Colors.black54),
                  onPressed: () {
                    if (_pinCode.isNotEmpty) {
                      setState(() {
                        _pinCode = _pinCode.substring(0, _pinCode.length - 1);
                      });
                    }
                  },
                ),
              ],
            ),
          ),
        ),
        
        // Config options
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('AI CONFIGURATION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.black54)),
              const SizedBox(height: 12),
              TextField(
                controller: _apiKeyController,
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Enter API Key',
                  hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF416B1F))),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Use PubGemma Model', style: TextStyle(fontSize: 12, color: Colors.black87, fontWeight: FontWeight.w500)),
                  Switch(
                    value: _usePubGemma,
                    onChanged: (val) => setState(() => _usePubGemma = val),
                    activeThumbColor: const Color(0xFF416B1F),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Disclaimer
        const Text(
          'Generative AI Compliance Disclaimer: Pocket Gull utilizes experimental AI models. Output is generated by AI and may contain errors. This tool is not a substitute for professional medical advice, diagnosis, or treatment. Always verify findings with certified clinical judgement.',
          style: TextStyle(fontSize: 9, color: Colors.grey, height: 1.4),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildPinButton(String digit) {
    return TextButton(
      onPressed: () => _handlePinPress(digit),
      style: TextButton.styleFrom(
        foregroundColor: Colors.black87,
        shape: const CircleBorder(),
      ),
      child: Text(digit, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w300)),
    );
  }
}
