import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../models/patient_types.dart';
import '../services/patient_management_service.dart';
import '../services/patient_state_service.dart';
import '../blocs/patient/patient_bloc.dart';
import '../blocs/patient/patient_event.dart';

/// Dropdown widget for selecting the active patient.
///
/// Mirrors the Angular patient-selector component, reading the live patient
/// roster from [PatientManagementService] and broadcasting the selection
/// to both [PatientBloc] and [PatientStateService].
class PatientSelectorWidget extends StatefulWidget {
  const PatientSelectorWidget({super.key});

  @override
  State<PatientSelectorWidget> createState() => _PatientSelectorWidgetState();
}

class _PatientSelectorWidgetState extends State<PatientSelectorWidget> {
  final _service = PatientManagementService();
  List<Patient> _patients = [];
  Patient? _selectedPatient;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPatients();
  }

  Future<void> _loadPatients() async {
    final patients = await _service.loadPatients();
    if (!mounted) return;
    setState(() {
      _patients = patients;
      _isLoading = false;

      // Sync initial selection with PatientBloc's current state
      final bloc = context.read<PatientBloc>();
      final blocState = bloc.state;
      if (blocState is Patient) {
        _selectedPatient = patients.where((p) => p.id == blocState.id).firstOrNull;
      }
      _selectedPatient ??= patients.isNotEmpty ? patients.first : null;
    });
  }

  void _onSelect(Patient? patient) {
    if (patient == null) return;
    setState(() => _selectedPatient = patient);

    // Broadcast to BLoC
    context.read<PatientBloc>().add(LoadPatient(patient));

    // Broadcast to PatientStateService
    try {
      context.read<PatientStateService>().selectPatient(patient);
    } catch (_) {
      // PatientStateService not in tree on this route — no-op
    }
  }

  Color _kaizenColor(String color) {
    return switch (color.toLowerCase()) {
      'red' => const Color(0xFFEF4444),
      'yellow' => const Color(0xFFF59E0B),
      'blue' => const Color(0xFF3B82F6),
      'green' => const Color(0xFF10B981),
      _ => const Color(0xFF6B7280),
    };
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const SizedBox(
        width: 180,
        height: 32,
        child: Center(child: LinearProgressIndicator(minHeight: 2)),
      );
    }

    if (_patients.isEmpty) {
      return const SizedBox(
        width: 180,
        child: Text('No patients', style: TextStyle(fontSize: 11, color: Colors.grey)),
      );
    }

    return SizedBox(
      height: 36,
      child: DropdownButtonHideUnderline(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: DropdownButton<Patient>(
            value: _selectedPatient,
            isDense: true,
            icon: const Icon(Icons.expand_more, size: 16, color: Colors.grey),
            items: _patients.map((p) {
              final dot = _kaizenColor(p.kaizenColor);
              return DropdownMenuItem(
                value: p,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(color: dot, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      p.name,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            }).toList(),
            onChanged: _onSelect,
            selectedItemBuilder: (context) => _patients.map((p) {
              final dot = _kaizenColor(p.kaizenColor);
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(color: dot, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    p.name,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
