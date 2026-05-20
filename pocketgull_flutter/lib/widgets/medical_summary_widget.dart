import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/patient/patient_bloc.dart';
import '../models/patient_types.dart';

class MedicalSummaryWidget extends StatelessWidget {
  const MedicalSummaryWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PatientBloc, PatientState>(
      builder: (context, state) {
        // In a real app we'd get the full Patient object to show name, age, etc.
        // For now, we'll just display the vitals and goals from PatientState.
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context),
              const SizedBox(height: 24),
              _buildSectionTitle(context, 'Current Visit / Chief Complaint'),
              _buildChiefComplaint(context, state),
              const SizedBox(height: 24),
              _buildSectionTitle(context, 'Biometric Telemetry'),
              _buildVitalsGrid(context, state),
              const SizedBox(height: 24),
              _buildSectionTitle(context, 'Active Strategy Overview'),
              _buildActiveCarePlan(context, state),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context) {
    final today = DateTime.now();
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Sarah Jenkins', // Hardcoded mock for now
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w300,
                color: Color(0xFF1C1C1C),
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${today.year}.${today.month.toString().padLeft(2, '0')}.${today.day.toString().padLeft(2, '0')}',
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
                letterSpacing: 2.0,
              ),
            ),
          ],
        ),
        ElevatedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.archive, size: 16),
          label: const Text('Finalize & Archive'),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1C1C1C),
            foregroundColor: Colors.white,
            textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: Colors.grey,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildChiefComplaint(BuildContext context, PatientState state) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        state.patientGoals.isEmpty ? 'No chief complaint recorded.' : state.patientGoals,
        style: const TextStyle(fontSize: 14, color: Colors.black87),
      ),
    );
  }

  Widget _buildVitalsGrid(BuildContext context, PatientState state) {
    final vitals = state.vitals;
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 600 ? 6 : (constraints.maxWidth > 400 ? 3 : 2);
        return GridView.count(
          crossAxisCount: crossAxisCount,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 1.5,
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          children: [
            _buildVitalCell('BP', vitals.bp, ''),
            _buildVitalCell('HR', vitals.hr, 'BPM'),
            _buildVitalCell('SpO2', vitals.spO2, '%'),
            _buildVitalCell('Temp', vitals.temp, '°F'),
            _buildVitalCell('Weight', vitals.weight, 'LBS'),
            _buildVitalCell('Height', vitals.height, 'FT'),
          ],
        );
      },
    );
  }

  Widget _buildVitalCell(String label, String value, String unit) {
    return Container(
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value.isEmpty ? '--' : value,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black),
              ),
              if (unit.isNotEmpty) ...[
                const SizedBox(width: 4),
                Text(
                  unit,
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActiveCarePlan(BuildContext context, PatientState state) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Text(
        'Care plan generated by AI will appear here based on the patient history and intake notes.',
        style: TextStyle(fontSize: 14, color: Colors.black87, fontStyle: FontStyle.italic),
      ),
    );
  }
}
