import 'package:flutter/material.dart';
import '../widgets/intake_form_widget.dart';
import '../widgets/body_viewer_widget.dart';
import '../widgets/analysis_report_widget.dart';
import '../widgets/voice_assistant_widget.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // A simple responsive layout checking for wide screens
    final isWide = MediaQuery.of(context).size.width > 800;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pocket Gull', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.print),
            onPressed: () {
              // TODO: Export service
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // TODO: Settings
            },
          ),
        ],
      ),
      body: Row(
        children: [
          // Left side - 3D Body Viewer (Takes up 40% on wide, or hidden/overlay on mobile)
          if (isWide)
            const Expanded(
              flex: 4,
              child: BodyViewerWidget(),
            ),
            
          // Right side - Intake Form and Analysis
          Expanded(
            flex: 6,
            child: Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: const [
                      IntakeFormWidget(),
                      SizedBox(height: 24),
                      AnalysisReportWidget(),
                    ],
                  ),
                ),
                // Voice Assistant pinned to bottom
                const VoiceAssistantWidget(),
              ],
            ),
          ),
        ],
      ),
      // On narrow screens, perhaps show the 3D viewer in a drawer or modal
      floatingActionButton: !isWide 
        ? FloatingActionButton(
            onPressed: () {
              showModalBottomSheet(
                context: context, 
                isScrollControlled: true,
                builder: (_) => const FractionallySizedBox(
                  heightFactor: 0.8,
                  child: BodyViewerWidget(),
                ),
              );
            },
            child: const Icon(Icons.accessibility_new),
          ) 
        : null,
    );
  }
}
