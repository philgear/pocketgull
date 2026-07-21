import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/patient_types.dart';
import '../providers/patient_provider.dart';

/// Patient vitals chart — real-time biometric visualization.
///
/// Flutter parity with Angular `patient-vitals-chart.component.ts`.
/// Displays current vitals in a clean card layout with trend indicators
/// and biochemical telemetry markers.

class PatientVitalsChartWidget extends ConsumerWidget {
  const PatientVitalsChartWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(patientProvider);
    final vitals = state.vitals;

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(
                  Icons.monitor_heart_outlined,
                  color: Theme.of(context).colorScheme.primary,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Patient Vitals',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Primary vitals grid
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _VitalTile(
                  label: 'Blood Pressure',
                  value: vitals.bp.isEmpty ? '--' : vitals.bp,
                  unit: 'mmHg',
                  icon: Icons.favorite_border,
                  color: Colors.red.shade300,
                ),
                _VitalTile(
                  label: 'Heart Rate',
                  value: vitals.hr.isEmpty ? '--' : vitals.hr,
                  unit: 'bpm',
                  icon: Icons.monitor_heart,
                  color: Colors.pink.shade300,
                ),
                _VitalTile(
                  label: 'Temperature',
                  value: vitals.temp.isEmpty ? '--' : vitals.temp,
                  unit: '°F',
                  icon: Icons.thermostat,
                  color: Colors.orange.shade300,
                ),
                _VitalTile(
                  label: 'SpO₂',
                  value: vitals.spO2.isEmpty ? '--' : vitals.spO2,
                  unit: '%',
                  icon: Icons.air,
                  color: Colors.blue.shade300,
                ),
                _VitalTile(
                  label: 'Weight',
                  value: vitals.weight.isEmpty ? '--' : vitals.weight,
                  unit: '',
                  icon: Icons.fitness_center,
                  color: Colors.green.shade300,
                ),
                _VitalTile(
                  label: 'Height',
                  value: vitals.height.isEmpty ? '--' : vitals.height,
                  unit: '',
                  icon: Icons.height,
                  color: Colors.teal.shade300,
                ),
              ],
            ),
            // Biochemical telemetry (if available)
            if (_hasAnyBiochem(vitals)) ...[
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Text(
                'Biochemical Telemetry',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: Theme.of(context).colorScheme.primary,
                    ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 12,
                runSpacing: 8,
                children: [
                  if (vitals.vitC != null && vitals.vitC!.isNotEmpty)
                    _BioTile(label: 'Vit C', value: vitals.vitC!),
                  if (vitals.vitD3 != null && vitals.vitD3!.isNotEmpty)
                    _BioTile(label: 'Vit D3', value: vitals.vitD3!),
                  if (vitals.magnesium != null && vitals.magnesium!.isNotEmpty)
                    _BioTile(label: 'Mg', value: vitals.magnesium!),
                  if (vitals.zinc != null && vitals.zinc!.isNotEmpty)
                    _BioTile(label: 'Zinc', value: vitals.zinc!),
                  if (vitals.b12 != null && vitals.b12!.isNotEmpty)
                    _BioTile(label: 'B12', value: vitals.b12!),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  bool _hasAnyBiochem(PatientVitals v) {
    return (v.vitC?.isNotEmpty ?? false) ||
        (v.vitD3?.isNotEmpty ?? false) ||
        (v.magnesium?.isNotEmpty ?? false) ||
        (v.zinc?.isNotEmpty ?? false) ||
        (v.b12?.isNotEmpty ?? false);
  }
}

class _VitalTile extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  final IconData icon;
  final Color color;

  const _VitalTile({
    required this.label,
    required this.value,
    required this.unit,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 140,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 14, color: color),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 10,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: value,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  if (unit.isNotEmpty)
                    TextSpan(
                      text: ' $unit',
                      style: TextStyle(
                        fontSize: 10,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BioTile extends StatelessWidget {
  final String label;
  final String value;

  const _BioTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.purple.shade50.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.purple.shade200.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: Colors.purple.shade700,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }
}
