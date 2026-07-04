import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/patient_provider.dart';
import '../services/orcid_service.dart';
import '../providers/services_providers.dart';

class MedicalSummaryWidget extends ConsumerStatefulWidget {
  const MedicalSummaryWidget({super.key});

  @override
  ConsumerState<MedicalSummaryWidget> createState() => _MedicalSummaryWidgetState();
}

class _MedicalSummaryWidgetState extends ConsumerState<MedicalSummaryWidget> {
  final TextEditingController _orcidController = TextEditingController();

  @override
  void dispose() {
    _orcidController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final orcidService = ref.watch(orcidServiceProvider);

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          const SizedBox(height: 12),
          _buildOrcidPanel(context, orcidService),
          const SizedBox(height: 24),
          _buildSectionTitle(context, 'Current Visit / Chief Complaint'),
          _buildChiefComplaint(context),
          const SizedBox(height: 24),
          _buildSectionTitle(context, 'Biometric Telemetry'),
          _buildVitalsGrid(context),
          const SizedBox(height: 24),
          _buildSectionTitle(context, 'Active Strategy Overview'),
          _buildActiveCarePlan(context),
        ],
      ),
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

  Widget _buildOrcidPanel(BuildContext context, OrcidService orcidService) {
    if (orcidService.isConnected) {
      final profile = orcidService.profile;
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFECFDF5), // emerald-50
          border: Border.all(color: const Color(0xFFA7F3D0)), // emerald-200
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            const Icon(Icons.verified, color: Color(0xFF059669), size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Clinician: ${profile?.name ?? 'Unknown Researcher'}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF065F46), // emerald-800
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'ORCID: ${orcidService.orcidId}',
                    style: const TextStyle(
                      fontSize: 10,
                      fontFamily: 'monospace',
                      color: Color(0xFF059669), // emerald-600
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.link_off, color: Color(0xFF059669), size: 18),
              onPressed: () {
                orcidService.disconnect();
                setState(() {});
              },
              tooltip: 'Disconnect ORCID',
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: Colors.grey.shade200),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _orcidController,
                  style: const TextStyle(fontSize: 12),
                  decoration: const InputDecoration(
                    hintText: 'ORCID (e.g. 0009-0008-1372-5381)',
                    hintStyle: TextStyle(fontSize: 12, color: Colors.grey),
                    border: InputBorder.none,
                    isDense: true,
                  ),
                  onSubmitted: (val) async {
                    await orcidService.connectOrcid(val);
                    _orcidController.clear();
                    setState(() {});
                  },
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: orcidService.isLoading
                    ? null
                    : () async {
                        await orcidService.connectOrcid(_orcidController.text);
                        _orcidController.clear();
                        setState(() {});
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1C1C1C),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                ),
                child: Text(
                  orcidService.isLoading ? 'Connecting...' : 'Connect',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
        if (orcidService.error != null) ...[
          const SizedBox(height: 6),
          Text(
            orcidService.error!,
            style: const TextStyle(fontSize: 10, color: Colors.redAccent),
          ),
        ],
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

  Widget _buildChiefComplaint(BuildContext context) {
    final state = ref.watch(patientProvider);
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

  Widget _buildVitalsGrid(BuildContext context) {
    final state = ref.watch(patientProvider);
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

  Widget _buildActiveCarePlan(BuildContext context) {
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
