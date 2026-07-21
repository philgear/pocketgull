import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/patient_types.dart';

/// Patient dropdown selector.
///
/// Flutter parity with Angular `patient-dropdown.component.ts`.
/// Provides a compact dropdown for switching between patients in the roster.

class PatientDropdownWidget extends ConsumerWidget {
  final List<Patient> patients;
  final String? selectedPatientId;
  final ValueChanged<String> onPatientSelected;

  const PatientDropdownWidget({
    super.key,
    required this.patients,
    required this.selectedPatientId,
    required this.onPatientSelected,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedPatient = patients
        .where((p) => p.id == selectedPatientId)
        .firstOrNull;

    return PopupMenuButton<String>(
      offset: const Offset(0, 48),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      itemBuilder: (context) => patients.map((patient) {
        return PopupMenuItem<String>(
          value: patient.id,
          child: Row(
            children: [
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                  color: _kaizenColor(patient.kaizenColor),
                  shape: BoxShape.circle,
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(patient.name,
                        style: const TextStyle(fontWeight: FontWeight.w500)),
                    Text(
                      '${patient.age}y • ${patient.gender}',
                      style: TextStyle(
                        fontSize: 11,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              // Triage badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: _kaizenColor(patient.kaizenColor).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${patient.triageScore}',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: _kaizenColor(patient.kaizenColor),
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
      onSelected: onPatientSelected,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (selectedPatient != null) ...[
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(right: 6),
                decoration: BoxDecoration(
                  color: _kaizenColor(selectedPatient.kaizenColor),
                  shape: BoxShape.circle,
                ),
              ),
              Text(selectedPatient.name,
                  style: const TextStyle(fontWeight: FontWeight.w500)),
            ] else
              Text('Select Patient',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  )),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_drop_down, size: 20),
          ],
        ),
      ),
    );
  }

  Color _kaizenColor(String color) {
    switch (color) {
      case 'red':
        return Colors.red.shade400;
      case 'yellow':
        return Colors.amber.shade400;
      case 'green':
      default:
        return Colors.green.shade400;
    }
  }
}
