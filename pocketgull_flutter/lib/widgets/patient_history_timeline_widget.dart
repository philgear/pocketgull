import 'package:flutter/material.dart';
import '../models/patient_types.dart';

class PatientHistoryTimelineWidget extends StatelessWidget {
  final List<HistoryEntry> history;

  const PatientHistoryTimelineWidget({super.key, required this.history});

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(32.0),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.history_toggle_off, size: 32, color: Colors.grey),
              SizedBox(height: 8),
              Text(
                'NO RECORDED ACTIVITY',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    // Sort history by date descending for timeline
    final sortedHistory = List<HistoryEntry>.from(history)
      ..sort((a, b) => b.date.compareTo(a.date));

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: sortedHistory.length,
      itemBuilder: (context, index) {
        final entry = sortedHistory[index];
        final isLast = index == sortedHistory.length - 1;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Timeline line & dot
            Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: _getColorForType(entry.type),
                    shape: BoxShape.circle,
                  ),
                ),
                if (!isLast)
                  Container(
                    width: 2,
                    height: 60, // Adjust height or use IntrinsicHeight
                    color: Colors.grey.shade200,
                  ),
              ],
            ),
            const SizedBox(width: 16),
            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      entry.date,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _getTitleForType(entry.type),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black87),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      entry.summary,
                      style: const TextStyle(fontSize: 12, color: Colors.black54),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Color _getColorForType(String type) {
    switch (type) {
      case 'Visit':
        return Colors.blue;
      case 'ChartArchived':
        return Colors.green;
      case 'AnalysisRun':
        return Colors.purple;
      case 'NoteCreated':
        return Colors.orange;
      case 'BookmarkAdded':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  String _getTitleForType(String type) {
    switch (type) {
      case 'Visit':
        return 'Clinical Visit';
      case 'ChartArchived':
        return 'Chart Finalized & Archived';
      case 'AnalysisRun':
        return 'AI Analysis Generated';
      case 'NoteCreated':
        return 'Clinical Note Added';
      case 'BookmarkAdded':
        return 'Literature Bookmark Added';
      case 'FinalizedPatientSummary':
        return 'Patient Summary Finalized';
      default:
        return type;
    }
  }
}
