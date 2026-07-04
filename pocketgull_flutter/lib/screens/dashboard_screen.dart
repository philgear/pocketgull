import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../widgets/ui/metric_card.dart';
import '../widgets/ui/primary_button.dart';
import '../widgets/ui/glass_container.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final patientState = ref.watch(patientProvider);
    final vitals = patientState.vitals;

    return Scaffold(
      body: Stack(
        children: [
          // Background content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(top: 100, left: 16, right: 16, bottom: 80),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Patient Vitals',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Vitals Grid
                  GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.5,
                    children: [
                      MetricCard(
                        title: 'Heart Rate',
                        value: vitals.hr.isEmpty ? '--' : '${vitals.hr} bpm',
                        trend: 0,
                      ),
                      MetricCard(
                        title: 'Blood Pressure',
                        value: vitals.bp.isEmpty ? '--/--' : vitals.bp,
                        trend: 0,
                      ),
                      MetricCard(
                        title: 'SpO2',
                        value: vitals.spO2.isEmpty ? '--' : '${vitals.spO2}%',
                        trend: 0,
                      ),
                      MetricCard(
                        title: 'Temperature',
                        value: vitals.temp.isEmpty ? '--' : '${vitals.temp}°',
                        trend: 0,
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 32),
                  
                  Text(
                    'Recent Issues',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  if (patientState.issues.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text(
                          'No recent issues recorded.',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    )
                  else
                    ...patientState.issues.entries.map((entry) {
                      final bodyPart = entry.key;
                      final issuesList = entry.value;
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: issuesList.map((issue) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Theme.of(context).cardTheme.color,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: Theme.of(context).dividerColor.withValues(alpha: 0.1),
                              ),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        issue.name,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '$bodyPart - ${issue.date ?? 'Unknown date'}',
                                        style: const TextStyle(color: Colors.grey, fontSize: 13),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.red.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    'Pain: ${issue.painLevel}/10',
                                    style: const TextStyle(
                                      color: Colors.red,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      );
                    }),
                ],
              ),
            ),
          ),
          
          // Floating Top Header
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: GlassContainer(
              opacity: 0.7,
              borderRadius: BorderRadius.zero,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 16,
                bottom: 16,
                left: 20,
                right: 20,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Good Morning,',
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                      ),
                      Text(
                        'Dr. Jane Doe',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.search),
                        onPressed: () {},
                      ),
                      const CircleAvatar(
                        radius: 18,
                        backgroundColor: Colors.blueAccent,
                        child: Icon(Icons.person, color: Colors.white, size: 20),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
          
          // Floating Action Area (Bottom)
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: Row(
              children: [
                Expanded(
                  child: PrimaryButton(
                    onPressed: () {
                      // Action to start live consult
                    },
                    label: 'Start Live Consult',
                    icon: Icons.mic,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
