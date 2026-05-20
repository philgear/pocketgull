import 'package:flutter/material.dart';
import '../../../../core/models/patient.dart';

class PatientDetailScreen extends StatelessWidget {
  final Patient patient;

  const PatientDetailScreen({super.key, required this.patient});

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF18181B) : const Color(0xFFFAFAFA);
    final cardColor = isDark ? const Color(0xFF27272A) : Colors.white;
    final textColor = isDark ? const Color(0xFFF4F4F5) : const Color(0xFF1C1C1C);
    final subColor = isDark ? const Color(0xFFA1A1AA) : const Color(0xFF71717A);

    // Mock up some clinical gap conditions based on patient data
    final vitals = patient.state.vitals;
    final bool missingRecentHr = !vitals.containsKey('hr') || (vitals['hr'] as String).isEmpty;
    final bool missingRecentBp = !vitals.containsKey('bp') || (vitals['bp'] as String).isEmpty;
    final bool hasClinicalGaps = missingRecentHr || missingRecentBp;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text(patient.name.toUpperCase(), style: const TextStyle(letterSpacing: 2, fontSize: 14)),
        centerTitle: true,
        backgroundColor: bgColor,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          _buildInfoRow('AGE', patient.age.toString(), textColor, subColor),
          _buildInfoRow('GENDER', patient.gender, textColor, subColor),
          _buildInfoRow('LAST VISIT', patient.lastVisit, textColor, subColor),
          _buildInfoRow('DELEGATION CODE', patient.id, textColor, subColor),
          
          const SizedBox(height: 32),
          _buildSectionTitle('LATEST VITALS', textColor),
          const SizedBox(height: 16),
          if (vitals.isEmpty)
            Text('No vitals recorded.', style: TextStyle(color: subColor))
          else
            ...vitals.entries.map((e) => _buildInfoRow(e.key.toUpperCase(), e.value.toString(), textColor, subColor)).toList(),

          const SizedBox(height: 32),

          if (hasClinicalGaps) ...[
            _buildSectionTitle('CLINICAL GAPS', const Color(0xFFDC2626)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF450A0A).withOpacity(0.3) : const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: isDark ? const Color(0xFF7F1D1D) : const Color(0xFFFECACA)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626), size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Missing Baseline Data',
                          style: TextStyle(fontWeight: FontWeight.bold, color: isDark ? const Color(0xFFFCA5A5) : const Color(0xFF991B1B)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'No recent resting heart rate or blood pressure recorded. Patient should sync their Health Connect app.',
                    style: TextStyle(height: 1.5, color: isDark ? const Color(0xFFFCA5A5) : const Color(0xFF991B1B), fontSize: 14),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? const Color(0xFFDC2626) : const Color(0xFFEF4444),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Nudge sent to patient device.')),
                        );
                      },
                      child: const Text('NUDGE PATIENT FOR DATA', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                    ),
                  )
                ],
              ),
            ),
          ] else ...[
             _buildSectionTitle('CLINICAL GAPS', Colors.green),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
               decoration: BoxDecoration(
                color: isDark ? const Color(0xFF064E3B).withOpacity(0.3) : const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: isDark ? const Color(0xFF065F46) : const Color(0xFFBBF7D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_outline, color: Colors.green),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text('All baseline clinical markers are up to date.', style: TextStyle(color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF166534))),
                  )
                ],
              )
            )
          ]
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 2.0,
        color: color,
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, Color labelColor, Color valueColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: labelColor, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1)),
          Text(value, style: TextStyle(color: valueColor, fontSize: 14)),
        ],
      ),
    );
  }
}
