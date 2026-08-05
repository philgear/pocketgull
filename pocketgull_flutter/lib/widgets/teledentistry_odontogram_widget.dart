import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class TeledentistryOdontogramWidget extends ConsumerStatefulWidget {
  const TeledentistryOdontogramWidget({super.key});

  @override
  ConsumerState<TeledentistryOdontogramWidget> createState() => _TeledentistryOdontogramWidgetState();
}

class _TeledentistryOdontogramWidgetState extends ConsumerState<TeledentistryOdontogramWidget> {
  int _selectedToothId = 11;
  int _twiGrade = 1;
  final int _deepPocketsCount = 3;
  final double _bopPercentage = 25.0;
  final double _hsCrp = 2.4;

  double get _sibiIndex {
    final raw = (_deepPocketsCount * 6) + (_bopPercentage * 0.8) + (_hsCrp * 12);
    return raw > 100 ? 100.0 : raw;
  }

  double get _cvRiskMultiplier {
    final sibi = _sibiIndex;
    return 1.0 + (sibi / 100.0) * 1.8;
  }

  double get _predictedHba1cElevation {
    final sibi = _sibiIndex;
    return (sibi / 100.0) * 0.8;
  }

  @override
  Widget build(BuildContext context) {
    final sibi = _sibiIndex;
    final cvRisk = _cvRiskMultiplier;
    final hba1cElev = _predictedHba1cElevation;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.health_and_safety, color: Color(0xFF0284C7), size: 20),
                  SizedBox(width: 8),
                  Text(
                    'FDI 32-TOOTH ODONTOGRAM & SIBI BRIDGE',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF1F2937)),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: Text(
                  'SIBI ${sibi.toStringAsFixed(1)} / 100',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Upper Quadrants (11-18, 21-28)
          const Text('Maxillary Arch (Upper Teeth 11-28)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 4),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(16, (index) {
                final toothNum = index < 8 ? (18 - index) : (21 + (index - 8));
                final isSelected = _selectedToothId == toothNum;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: ChoiceChip(
                    label: Text('#$toothNum', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : const Color(0xFF374151))),
                    selected: isSelected,
                    selectedColor: const Color(0xFF0284C7),
                    backgroundColor: const Color(0xFFF3F4F6),
                    onSelected: (_) => setState(() => _selectedToothId = toothNum),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: 8),

          // Lower Quadrants (41-48, 31-38)
          const Text('Mandibular Arch (Lower Teeth 48-38)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 4),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(16, (index) {
                final toothNum = index < 8 ? (48 - index) : (31 + (index - 8));
                final isSelected = _selectedToothId == toothNum;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: ChoiceChip(
                    label: Text('#$toothNum', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : const Color(0xFF374151))),
                    selected: isSelected,
                    selectedColor: const Color(0xFF0284C7),
                    backgroundColor: const Color(0xFFF3F4F6),
                    onSelected: (_) => setState(() => _selectedToothId = toothNum),
                  ),
                );
              }),
            ),
          ),
          const Divider(height: 24),

          // Smith & Knight TWI Selector
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Tooth #$_selectedToothId Smith & Knight TWI Grade:', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF374151))),
              DropdownButton<int>(
                value: _twiGrade,
                isDense: true,
                items: const [
                  DropdownMenuItem(value: 0, child: Text('Grade 0 (Normal)', style: TextStyle(fontSize: 11))),
                  DropdownMenuItem(value: 1, child: Text('Grade 1 (Enamel Facet)', style: TextStyle(fontSize: 11))),
                  DropdownMenuItem(value: 2, child: Text('Grade 2 (Dentin < 1/3)', style: TextStyle(fontSize: 11))),
                  DropdownMenuItem(value: 3, child: Text('Grade 3 (Dentin > 1/3)', style: TextStyle(fontSize: 11))),
                  DropdownMenuItem(value: 4, child: Text('Grade 4 (Pulp Exposure)', style: TextStyle(fontSize: 11))),
                ],
                onChanged: (val) => setState(() => _twiGrade = val ?? 1),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Systemic Periodontal-Cardiovascular Telemetry Cards
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF9FAFB),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Cardiovascular Risk Multiplier:', style: TextStyle(fontSize: 11, color: Color(0xFF4B5563))),
                    Text('${cvRisk.toStringAsFixed(2)}x', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFDC2626))),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Predicted HbA1c Elevation:', style: TextStyle(fontSize: 11, color: Color(0xFF4B5563))),
                    Text('+${hba1cElev.toStringAsFixed(2)}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
