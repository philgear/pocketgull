import 'package:flutter/material.dart';
import '../widgets/intake_form_widget.dart';
import '../widgets/analysis_report_widget.dart';
import '../widgets/voice_assistant_widget.dart';
import '../widgets/medical_chart_widget.dart';
import '../widgets/task_flow_widget.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isWide = width > 1200; // 3 columns
    final isMedium = width > 800; // 2 columns

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text(
          'Pocket Gull',
          style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.0, color: Color(0xFF1C1C1C)),
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        actions: [
          IconButton(
            icon: const Icon(Icons.print, color: Colors.grey),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.grey),
            onPressed: () {},
          ),
        ],
      ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Column 1: Medical Chart (Accordion)
          if (isMedium)
            Expanded(
              flex: 3,
              child: const SingleChildScrollView(
                padding: EdgeInsets.all(16.0),
                child: MedicalChartWidget(),
              ),
            ),
            
          // Column 2: Intake & Task Flow (Middle)
          Expanded(
            flex: isWide ? 4 : 6,
            child: Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      const IntakeFormWidget(),
                      const SizedBox(height: 16),
                      const TaskFlowWidget(),
                      // If not wide, stack analysis here
                      if (!isWide) ...[
                        const SizedBox(height: 16),
                        const AnalysisReportWidget(),
                      ],
                    ],
                  ),
                ),
                const VoiceAssistantWidget(),
              ],
            ),
          ),

          // Column 3: Analysis Report (Right side on wide screens)
          if (isWide)
            Expanded(
              flex: 3,
              child: const SingleChildScrollView(
                padding: EdgeInsets.all(16.0),
                child: AnalysisReportWidget(),
              ),
            ),
        ],
      ),
      // On narrow screens, perhaps show the medical chart in a drawer or modal
      floatingActionButton: !isMedium 
        ? FloatingActionButton(
            backgroundColor: const Color(0xFF1C1C1C),
            onPressed: () {
              showModalBottomSheet(
                context: context, 
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => Container(
                  height: MediaQuery.of(context).size.height * 0.9,
                  decoration: const BoxDecoration(
                    color: Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  ),
                  child: const SingleChildScrollView(
                    padding: EdgeInsets.all(16.0),
                    child: MedicalChartWidget(),
                  ),
                ),
              );
            },
            child: const Icon(Icons.medical_services, color: Colors.white),
          ) 
        : null,
    );
  }
}
