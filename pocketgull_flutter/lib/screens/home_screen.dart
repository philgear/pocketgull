import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/intake_form_widget.dart';
import '../widgets/analysis_report_widget.dart';
import '../widgets/voice_assistant_widget.dart';
import '../widgets/medical_chart_widget.dart';
import '../widgets/task_flow_widget.dart';
import '../widgets/native_body_viewer.dart';
import '../widgets/origami_seagull.dart';
import '../widgets/research_frame_widget.dart';
import '../blocs/patient/patient_bloc.dart';
import '../models/patient_types.dart';
import '../blocs/patient/patient_event.dart';
import '../widgets/visit_review_widget.dart';
import 'documentation_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedMobileTab = 0; // 0: Map, 1: Chart, 2: Docs

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PatientBloc, PatientState>(
      builder: (context, state) {
        final width = MediaQuery.of(context).size.width;
        final isWide = width > 1200;
        final isMedium = width > 800;
        final isMobile = !isMedium;

        return Scaffold(
          backgroundColor: const Color(0xFFF9FAFB),
          appBar: AppBar(
            toolbarHeight: isMobile ? 60 : 70,
            title: Row(
              children: [
                OrigamiSeagull(size: isMobile ? 36 : 50),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'POCKET GULL',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2.0,
                        fontSize: isMobile ? 12 : 16,
                        color: const Color(0xFF1C1C1C),
                      ),
                    ),
                    if (!isMobile)
                      const Text(
                        'INTAKE MODULE 01',
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey,
                          letterSpacing: 1.0,
                        ),
                      ),
                  ],
                ),
              ],
            ),
            backgroundColor: Colors.white,
            elevation: 1,
            actions: [
              if (!isMobile) _buildSystemStatus(),
              const SizedBox(width: 12),
              SizedBox(
                height: 32,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.mic, size: 14),
                  label: Text(isMobile ? 'AI' : 'AGENT'),
                  onPressed: () {
                    context.read<PatientBloc>().add(const ToggleLiveAgent(true));
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1C1C1C),
                    side: const BorderSide(color: Color(0xFFE5E7EB)),
                    textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              if (!isMobile) ...[
                SizedBox(
                  height: 32,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.workspace_premium, size: 14),
                    label: const Text('UPGRADE'),
                    onPressed: () async {
                      try {
                        final response = await http.post(
                          Uri.parse('http://localhost:8080/api/billing/checkout'),
                          headers: {'Content-Type': 'application/json'},
                          body: jsonEncode({'userId': 'user_123'}),
                        );
                        if (response.statusCode == 200) {
                          final data = jsonDecode(response.body);
                          if (data['url'] != null) {
                            final uri = Uri.parse(data['url']);
                            if (await canLaunchUrl(uri)) {
                              await launchUrl(uri);
                            }
                          }
                        } else {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Billing service is currently unavailable.')),
                            );
                          }
                        }
                      } catch (e) {
                        debugPrint('Error launching checkout: $e');
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Checkout API is not implemented or unreachable.')),
                          );
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: const Color(0xFF6366F1), // Indigo/Premium color
                      textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      elevation: 0,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  height: 32,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.gavel_outlined, size: 14),
                    label: const Text('POLICY'),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const DocumentationScreen(initialDoc: 'ai_policy.md')),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF1C1C1C),
                      side: const BorderSide(color: Color(0xFFE5E7EB)),
                      textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  height: 32,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.menu_book_outlined, size: 14),
                    label: const Text('DOCS'),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const DocumentationScreen()),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF1C1C1C),
                      side: const BorderSide(color: Color(0xFFE5E7EB)),
                      textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
              IconButton(
                icon: const Icon(Icons.travel_explore, color: Colors.grey, size: 18),
                onPressed: () {
                  context.read<PatientBloc>().add(ToggleResearchFrame(!state.isResearchFrameVisible));
                },
              ),
              const SizedBox(width: 12),
            ],
          ),
          body: Stack(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Desktop Sidebar: Medical Chart
                  if (isMedium)
                    const Expanded(
                      flex: 3,
                      child: SingleChildScrollView(
                        padding: EdgeInsets.all(16.0),
                        child: MedicalChartWidget(),
                      ),
                    ),

                  // Responsive Body
                  Expanded(
                    flex: isWide ? (state.selectedPartId == null ? 7 : 3) : 6,
                    child: _buildResponsiveBody(isMobile, state),
                  ),

                  // Desktop Analysis Report (Only if part selected)
                  if (isMedium && state.selectedPartId != null)
                    const Expanded(
                      flex: 4,
                      child: SingleChildScrollView(
                        padding: EdgeInsets.all(16.0),
                        child: AnalysisReportWidget(),
                      ),
                    ),
                ],
              ),
              
              // Floating Research Frame
              if (state.isResearchFrameVisible)
                ResearchFrameWidget(
                  onClose: () {
                    context.read<PatientBloc>().add(const ToggleResearchFrame(false));
                  },
                ),

              // Voice Assistant Overlay (Mobile Co-Pilot)
              if (state.isLiveAgentActive)
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: const VoiceAssistantWidget(),
                ),
            ],
          ),
          bottomNavigationBar: isMobile
              ? BottomNavigationBar(
                  currentIndex: _selectedMobileTab,
                  onTap: (index) => setState(() => _selectedMobileTab = index),
                  selectedFontSize: 10,
                  unselectedFontSize: 10,
                  selectedItemColor: const Color(0xFF416B1F),
                  unselectedItemColor: Colors.grey,
                  type: BottomNavigationBarType.fixed,
                  items: const [
                    BottomNavigationBarItem(icon: Icon(Icons.accessibility_new, size: 20), label: 'MAP'),
                    BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined, size: 20), label: 'CHART'),
                    BottomNavigationBarItem(icon: Icon(Icons.menu_book_outlined, size: 20), label: 'DOCS'),
                  ],
                )
              : null,
        );
      },
    );
  }

  Widget _buildResponsiveBody(bool isMobile, PatientState state) {
    if (!isMobile) {
      return state.selectedPartId == null
          ? const Padding(padding: EdgeInsets.all(32.0), child: NativeBodyViewer())
          : ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                _buildBackButton(),
                const SizedBox(height: 8),
                state.viewingPastVisitDate != null 
                  ? VisitReviewWidget(visitState: state, date: state.viewingPastVisitDate!)
                  : const IntakeFormWidget(),
                const SizedBox(height: 16),
                if (state.viewingPastVisitDate == null) const TaskFlowWidget(),
              ],
            );
    }

    // Mobile View Switching
    return switch (_selectedMobileTab) {
      0 => state.selectedPartId == null
          ? const Padding(padding: EdgeInsets.all(16.0), child: NativeBodyViewer())
          : ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                _buildBackButton(),
                const SizedBox(height: 8),
                const IntakeFormWidget(),
                const SizedBox(height: 16),
                const TaskFlowWidget(),
                const SizedBox(height: 24),
                const AnalysisReportWidget(),
              ],
            ),
      1 => const SingleChildScrollView(padding: EdgeInsets.all(16.0), child: MedicalChartWidget()),
      2 => const DocumentationScreen(hideAppBar: true),
      _ => const SizedBox.shrink(),
    };
  }

  Widget _buildBackButton() {
    return Row(
      children: [
        IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 14),
          onPressed: () => context.read<PatientBloc>().add(const SelectPartEvent(null)),
        ),
        const Text(
          'BACK TO BODY MAP',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.5),
        ),
      ],
    );
  }

  Widget _buildSystemStatus() {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: const BoxDecoration(
            color: Colors.green,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        const Text(
          'SYSTEM READY',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
            letterSpacing: 1.0,
          ),
        ),
      ],
    );
  }
}
