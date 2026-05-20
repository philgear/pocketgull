import 'package:flutter/material.dart';
import '../models/patient_types.dart';

class VisitReviewWidget extends StatelessWidget {
  final PatientState visitState;
  final String date;

  const VisitReviewWidget({super.key, required this.visitState, required this.date});

  @override
  Widget build(BuildContext context) {
    final issues = visitState.issues;
    final allIssues = issues.values.expand((e) => e).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.blueGrey.shade900,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'HISTORICAL VISIT REVIEW',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.white70,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        date,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'READ ONLY',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'VISIT SUMMARY',
                style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white38, letterSpacing: 1.0),
              ),
              const SizedBox(height: 8),
              Text(
                visitState.patientGoals.isEmpty ? 'No primary goals documented.' : visitState.patientGoals,
                style: const TextStyle(fontSize: 14, color: Colors.white70, height: 1.5),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 8),
          child: Text(
            'DOCUMENTED ISSUES',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.2),
          ),
        ),
        const SizedBox(height: 16),
        if (allIssues.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(48.0),
              child: Text('No clinical notes documented during this visit.', style: TextStyle(color: Colors.grey)),
            ),
          ),
        ...allIssues.map((issue) => _buildIssueCard(issue)),
      ],
    );
  }

  Widget _buildIssueCard(BodyPartIssue issue) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                issue.name,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getPainColor(issue.painLevel).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'Pain: ${issue.painLevel}',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: _getPainColor(issue.painLevel),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'OBSERVATIONS',
            style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0),
          ),
          const SizedBox(height: 6),
          Text(
            issue.description.isEmpty ? 'No observations recorded.' : issue.description,
            style: const TextStyle(fontSize: 14, height: 1.5, color: Colors.black87),
          ),
          if (issue.recommendation != null && issue.recommendation!.isNotEmpty) ...[
            const SizedBox(height: 20),
            const Text(
              'RECOMMENDATIONS',
              style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0),
            ),
            const SizedBox(height: 6),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                issue.recommendation!,
                style: const TextStyle(fontSize: 13, color: Color(0xFF416B1F)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Color _getPainColor(int level) {
    if (level <= 3) return Colors.green;
    if (level <= 6) return Colors.orange;
    return Colors.red;
  }
}
