import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/patient_types.dart'
    show HistoryEntry, VisitHistoryEntry, ChartArchivedHistoryEntry, PatientState;

/// A data point extracted from a [HistoryEntry] for vitals charting.
class _VitalDataPoint {
  final String label;
  final double? weight;
  final double? systolic;
  final double? diastolic;

  const _VitalDataPoint({
    required this.label,
    this.weight,
    this.systolic,
    this.diastolic,
  });
}

/// PatientVitalsChartWidget — mirrors Angular's PatientVitalsChartComponent.
///
/// Renders a longitudinal fl_chart line chart of Weight, Systolic BP, and
/// Diastolic BP from the patient's visit history. Displays a "not enough data"
/// placeholder when fewer than 2 data points with valid vitals are available.
class PatientVitalsChartWidget extends StatefulWidget {
  final List<HistoryEntry> history;

  const PatientVitalsChartWidget({super.key, required this.history});

  @override
  State<PatientVitalsChartWidget> createState() => _PatientVitalsChartWidgetState();
}

class _PatientVitalsChartWidgetState extends State<PatientVitalsChartWidget> {
  List<_VitalDataPoint> _dataPoints = [];

  @override
  void initState() {
    super.initState();
    _parseHistory();
  }

  @override
  void didUpdateWidget(PatientVitalsChartWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.history != widget.history) _parseHistory();
  }

  void _parseHistory() {
    final rawVisits = widget.history.where((h) {
      return switch (h) {
        VisitHistoryEntry() => true,
        ChartArchivedHistoryEntry() => true,
        _ => false,
      };
    }).toList()
      ..sort((a, b) {
        final da = DateTime.tryParse(a.date.replaceAll('.', '-')) ?? DateTime(0);
        final db = DateTime.tryParse(b.date.replaceAll('.', '-')) ?? DateTime(0);
        return da.compareTo(db);
      });

    _dataPoints = rawVisits.map((h) {
      final PatientState entryState = switch (h) {
        VisitHistoryEntry(:final state) => state,
        ChartArchivedHistoryEntry(:final state) => state,
        _ => throw StateError('Unexpected entry type'),
      };

      final vitals = entryState.vitals;
      double? sys, dia, weight;

      final bpParts = vitals.bp.split('/');
      if (bpParts.length == 2) {
        sys = double.tryParse(bpParts[0].trim());
        dia = double.tryParse(bpParts[1].trim());
      }

      final weightStr = vitals.weight.replaceAll(RegExp(r'[^0-9.]'), '');
      if (weightStr.isNotEmpty) weight = double.tryParse(weightStr);

      final label = h.date.length >= 7 ? h.date.substring(5) : h.date;
      return _VitalDataPoint(label: label, weight: weight, systolic: sys, diastolic: dia);
    }).where((dp) => dp.weight != null || dp.systolic != null).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF3F4F6)),
        boxShadow: const [BoxShadow(color: Color(0x08000000), blurRadius: 8, offset: Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'LONGITUDINAL VITALS',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: Color(0xFF374151),
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: _dataPoints.length < 2 ? _buildNoData() : _buildChart(),
          ),
          const SizedBox(height: 12),
          _buildLegend(),
        ],
      ),
    );
  }

  Widget _buildNoData() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Center(
        child: Text(
          'Not enough historical\nvitals recorded.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: Colors.grey),
        ),
      ),
    );
  }

  Widget _buildChart() {
    final labels = _dataPoints.map((d) => d.label).toList();

    FlSpot? toSpot(int i, double? val) =>
        val != null ? FlSpot(i.toDouble(), val) : null;

    final weightSpots = <FlSpot>[];
    final sysSpots = <FlSpot>[];
    final diaSpots = <FlSpot>[];

    for (var i = 0; i < _dataPoints.length; i++) {
      final dp = _dataPoints[i];
      final ws = toSpot(i, dp.weight);
      final ss = toSpot(i, dp.systolic);
      final ds = toSpot(i, dp.diastolic);
      if (ws != null) weightSpots.add(ws);
      if (ss != null) sysSpots.add(ss);
      if (ds != null) diaSpots.add(ds);
    }

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (_) => const FlLine(color: Color(0xFFF3F4F6), strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (val, meta) => Text(
                val.toInt().toString(),
                style: const TextStyle(fontSize: 8, color: Color(0xFF3B82F6)),
              ),
            ),
          ),
          rightTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (val, meta) => Text(
                val.toInt().toString(),
                style: const TextStyle(fontSize: 8, color: Color(0xFFEF4444)),
              ),
            ),
          ),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 20,
              getTitlesWidget: (val, meta) {
                final i = val.toInt();
                if (i < 0 || i >= labels.length) return const SizedBox.shrink();
                return Text(
                  labels[i],
                  style: const TextStyle(fontSize: 8, color: Color(0xFF9CA3AF)),
                );
              },
            ),
          ),
        ),
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            getTooltipColor: (_) => const Color(0xFF1F2937),
            getTooltipItems: (spots) => spots
                .map((s) => LineTooltipItem(
                      s.y.toStringAsFixed(0),
                      const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ))
                .toList(),
          ),
        ),
        lineBarsData: [
          if (weightSpots.isNotEmpty)
            LineChartBarData(
              spots: weightSpots,
              isCurved: true,
              color: const Color(0xFF3B82F6),
              barWidth: 2,
              dotData: const FlDotData(show: true),
              belowBarData: BarAreaData(
                show: true,
                color: const Color(0xFF3B82F6).withValues(alpha: 0.05),
              ),
            ),
          if (sysSpots.isNotEmpty)
            LineChartBarData(
              spots: sysSpots,
              isCurved: true,
              color: const Color(0xFFEF4444),
              barWidth: 2,
              dotData: const FlDotData(show: true),
            ),
          if (diaSpots.isNotEmpty)
            LineChartBarData(
              spots: diaSpots,
              isCurved: true,
              color: const Color(0xFFF87171),
              barWidth: 2,
              dashArray: [5, 5],
              dotData: const FlDotData(show: true),
            ),
        ],
      ),
    );
  }

  Widget _buildLegend() {
    return Wrap(
      spacing: 16,
      runSpacing: 4,
      children: const [
        _LegendItem(color: Color(0xFF3B82F6), label: 'Weight (lbs)'),
        _LegendItem(color: Color(0xFFEF4444), label: 'Systolic BP'),
        _LegendItem(color: Color(0xFFF87171), label: 'Diastolic BP', dashed: true),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  final bool dashed;

  const _LegendItem({required this.color, required this.label, this.dashed = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 2,
          color: color,
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 9, color: Color(0xFF6B7280))),
      ],
    );
  }
}
