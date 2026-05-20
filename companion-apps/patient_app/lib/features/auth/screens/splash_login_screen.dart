import 'package:flutter/material.dart';
import '../../../shared/widgets/origami_seagull.dart';
import '../../dashboard/screens/patient_dashboard.dart';
import '../../../core/api/api_client.dart';
import '../../../core/models/patient.dart';

class SplashLoginScreen extends StatefulWidget {
  const SplashLoginScreen({super.key});

  @override
  State<SplashLoginScreen> createState() => _SplashLoginScreenState();
}

class _SplashLoginScreenState extends State<SplashLoginScreen> {
  final ApiClient _apiClient = ApiClient();
  final TextEditingController _apiKeyController = TextEditingController();
  final TextEditingController _delegationCodeController = TextEditingController();
  bool _obscureText = true;
  List<Patient> _patients = [];
  bool _loadingPatients = true;

  @override
  void initState() {
    super.initState();
    _loadPatients();
  }

  Future<void> _loadPatients() async {
    setState(() => _loadingPatients = true);
    final data = await _apiClient.fetchPatients();
    if (mounted) {
      setState(() {
        _patients = data.map((json) => Patient.fromJson(json)).toList();
        _loadingPatients = false;
      });
    }
  }

  @override
  void dispose() {
    _apiKeyController.dispose();
    _delegationCodeController.dispose();
    super.dispose();
  }

  void _submitApiKey() {
    if (_apiKeyController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your Gemini API key.')),
      );
      return;
    }
    
    final enteredCode = _delegationCodeController.text.trim().toLowerCase();
    if (enteredCode.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your Patient Delegation Code.')),
      );
      return;
    }

    if (_loadingPatients) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Loading patient database, please try again.')),
      );
      return;
    }

    Patient? matchedPatient;
    for (final p in _patients) {
      if (p.id.toLowerCase() == enteredCode) {
        matchedPatient = p;
        break;
      }
    }

    if (matchedPatient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid delegation code. Please verify with your care provider.')),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Entering Care Plan for ${matchedPatient.name}...')),
    );
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => PatientDashboard(patient: matchedPatient!)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color borderColor = isDark ? const Color(0xFF27272A) : const Color(0xFFE4E4E7);
    final Color textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C);
    final Color subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);
    
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
                  child: ClipRect(
                    child: Align(
                      alignment: Alignment.bottomCenter,
                      child: OrigamiSeagull(),
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                Text(
                  'POCKET GULL',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4.0,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'PATIENT CARE PLAN PORTAL',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    letterSpacing: 2.5,
                    color: subColor,
                  ),
                ),
                
                const SizedBox(height: 48),
                
                Text(
                  'Access your clinical care plan and sync biometrics securely.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: subColor,
                  ),
                ),
                
                const SizedBox(height: 24),

                // API Key Field
                Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Text(
                      'GEMINI API KEY',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: subColor),
                    ),
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: borderColor),
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
                          color: subColor,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureText = !_obscureText;
                          });
                        },
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 20),

                // Patient Delegation Code
                Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Text(
                      'PATIENT DELEGATION CODE',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: subColor),
                    ),
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: borderColor),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: TextField(
                    controller: _delegationCodeController,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      color: isDark ? const Color(0xFFF4F4F5) : const Color(0xFF27272A),
                    ),
                    onSubmitted: (_) => _submitApiKey(),
                    decoration: InputDecoration(
                      hintText: 'Enter delegation access code (e.g. p001)',
                      hintStyle: TextStyle(
                        color: isDark ? const Color(0xFF52525B) : const Color(0xFFD1D5DB),
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: textColor,
                      foregroundColor: isDark ? const Color(0xFF18181B) : Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    onPressed: _submitApiKey,
                    child: const Text(
                      'ACCESS CARE PLAN',
                      style: TextStyle(letterSpacing: 2.0, fontWeight: FontWeight.bold),
                    ),
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
