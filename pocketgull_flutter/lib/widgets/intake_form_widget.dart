import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/patient/patient_bloc.dart';
import '../blocs/patient/patient_event.dart';

class IntakeFormWidget extends StatefulWidget {
  const IntakeFormWidget({super.key});

  @override
  State<IntakeFormWidget> createState() => _IntakeFormWidgetState();
}

class _IntakeFormWidgetState extends State<IntakeFormWidget> {
  final _goalsController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Patient Intake',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _goalsController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Chief Complaint / Goals',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              onChanged: (val) {
                context.read<PatientBloc>().add(UpdateGoals(val));
              },
            ),
            const SizedBox(height: 16),
            // TODO: Add Vitals fields and other demographic data
            const Text('Vitals Input Placeholder'),
          ],
        ),
      ),
    );
  }
}
