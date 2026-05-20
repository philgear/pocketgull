import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/patient/patient_bloc.dart';
import '../blocs/patient/patient_event.dart';
import '../models/patient_types.dart';

class HistoryTimelineWidget extends StatelessWidget {
  final String partId;

  const HistoryTimelineWidget({super.key, required this.partId});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PatientBloc, PatientState>(
      builder: (context, state) {
        final issues = state.issues[partId] ?? [];
        // Sort issues by date descending (Current Visit first)
        final sortedIssues = List<BodyPartIssue>.from(issues)..sort((a, b) {
          if (a.date == null && b.date != null) return -1;
          if (a.date != null && b.date == null) return 1;
          if (a.date == null && b.date == null) return 0;
          return b.date!.compareTo(a.date!);
        });

        if (sortedIssues.isEmpty) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: Text(
                'No prior history for this body part.',
                style: TextStyle(fontSize: 11, color: Colors.grey, fontStyle: FontStyle.italic),
              ),
            ),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Row(
                children: [
                  Icon(Icons.history, size: 14, color: Colors.grey.shade600),
                  const SizedBox(width: 8),
                  Text(
                    'HISTORY & CONTEXT',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade600,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: sortedIssues.length,
              itemBuilder: (context, index) {
                final issue = sortedIssues[index];
                final isSelected = state.selectedNoteId == issue.noteId;
                
                return _TimelineItem(
                  issue: issue,
                  isSelected: isSelected,
                  isLast: index == sortedIssues.length - 1,
                  onTap: () {
                    context.read<PatientBloc>().add(SelectNoteEvent(issue.noteId));
                  },
                );
              },
            ),
          ],
        );
      },
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final BodyPartIssue issue;
  final bool isSelected;
  final bool isLast;
  final VoidCallback onTap;

  const _TimelineItem({
    required this.issue,
    required this.isSelected,
    required this.isLast,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: IntrinsicHeight(
          child: Row(
            children: [
              // Timeline line and dot
              SizedBox(
                width: 20,
                child: Stack(
                  alignment: Alignment.topCenter,
                  children: [
                    if (!isLast)
                      Container(
                        width: 1,
                        color: Colors.grey.shade200,
                        margin: const EdgeInsets.only(top: 10),
                      ),
                    Container(
                      margin: const EdgeInsets.only(top: 10),
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF689F38) : Colors.white,
                        border: Border.all(
                          color: isSelected ? const Color(0xFF689F38) : Colors.grey.shade300,
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              // Content Card
              Expanded(
                child: Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFFF1F8E9) : Colors.white,
                    border: Border.all(
                      color: isSelected ? const Color(0xFF689F38) : Colors.grey.shade200,
                    ),
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: isSelected ? null : [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            issue.date ?? 'Current Visit',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? const Color(0xFF416B1F) : Colors.grey.shade500,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Pain: ${issue.painLevel}',
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: Colors.black54,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        issue.description.isEmpty ? 'No description provided.' : issue.description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 11,
                          height: 1.4,
                          color: Colors.grey.shade800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
