import 'package:flutter/material.dart';
import '../../../shared/widgets/origami_seagull.dart';
import '../../dashboard/screens/patient_dashboard.dart';

class SplashLoginScreen extends StatefulWidget {
  const SplashLoginScreen({super.key});

  @override
  State<SplashLoginScreen> createState() => _SplashLoginScreenState();
}

class _SplashLoginScreenState extends State<SplashLoginScreen> {
  final TextEditingController _apiKeyController = TextEditingController();
  bool _obscureText = true;

  @override
  void dispose() {
    _apiKeyController.dispose();
    super.dispose();
  }

  void _submitApiKey() {
    // In a real app we'd validate and save the key securely
    // For now, simulate success and navigate out of splash
    if (_apiKeyController.text.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('API Key registered. Entering Pocket Gull...')),
      );
      // Simulate navigation to dashboard
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const PatientDashboard()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Determine if we are in dark mode (though Braun aesthetic relies heavily on high contrast)
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF18181B) : Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Origami Seagull emerging from 'pocket'
                const SizedBox(
                  height: 200,
                  // We simulate the 'pocket' by wrapping the animation in a ClipRect
                  // so the bird appears to fly up from the invisible bottom edge.
                  child: ClipRect(
                    child: Align(
                      alignment: Alignment.bottomCenter,
                      child: OrigamiSeagull(),
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Typography matching web
                Text(
                  'POCKET GULL',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4.0,
                    color: isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'CLINICAL INTELLIGENCE PLATFORM',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    letterSpacing: 2.5,
                    color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A),
                  ),
                ),
                
                const SizedBox(height: 48),
                
                // API Form
                Text(
                  'Enter your Gemini API key to access the live practitioner dashboard.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A),
                  ),
                ),
                
                const SizedBox(height: 16),
                
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7),
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _apiKeyController,
                          obscureText: _obscureText,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            color: isDark ? const Color(0xFFF4F4F5) : const Color(0xFF27272A),
                          ),
                          onSubmitted: (_) => _submitApiKey(),
                          decoration: InputDecoration(
                            hintText: 'Paste your Gemini API key here',
                            hintStyle: TextStyle(
                              color: isDark ? const Color(0xFF52525B) : const Color(0xFFD1D5DB),
                            ),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          _obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A),
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureText = !_obscureText;
                          });
                        },
                      ),
                      IconButton(
                        icon: Icon(
                          Icons.arrow_forward_outlined,
                          color: isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C),
                        ),
                        onPressed: _submitApiKey,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
