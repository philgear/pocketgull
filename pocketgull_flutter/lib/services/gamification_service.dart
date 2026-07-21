/// Gamification Service — clinical quest XP system.
///
/// Flutter parity with Angular `gamification.service.ts` (277 lines).
/// Tracks clinician progress through standardized clinical workflows
/// with XP rewards, leveling, and guided next-step hints.
library;

import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Quest {
  final String id;
  final String name;
  final String description;
  final int xpReward;
  final bool completed;

  const Quest({
    required this.id,
    required this.name,
    required this.description,
    required this.xpReward,
    this.completed = false,
  });

  Quest withCompleted(bool value) => Quest(
    id: id, name: name, description: description,
    xpReward: xpReward, completed: value,
  );
}

class GamificationState {
  final int points;
  final List<String> completedQuestIds;

  const GamificationState({this.points = 0, this.completedQuestIds = const []});

  // ── Derived ──

  int get level {
    if (points < 200) return 1;
    if (points < 500) return 2;
    if (points < 900) return 3;
    if (points < 1400) return 4;
    return 5;
  }

  String get levelTitle => switch (level) {
        1 => 'Triage Novice',
        2 => 'Clinical Investigator',
        3 => 'Epidemic Specialist',
        4 => 'WHO Field Director',
        _ => 'National Chief Medical Officer',
      };

  int get xpNeededForNextLevel => switch (level) {
        1 => 200, 2 => 500, 3 => 900, 4 => 1400, _ => 2000,
      };

  int get xpMinForCurrentLevel => switch (level) {
        1 => 0, 2 => 200, 3 => 500, 4 => 900, _ => 1400,
      };

  int get progressPercentage {
    final max = xpNeededForNextLevel;
    if (points >= max) return 100;
    final num = points - xpMinForCurrentLevel;
    final den = max - xpMinForCurrentLevel;
    return ((num / den) * 100).round().clamp(0, 100);
  }

  List<Quest> get quests => [
    Quest(id: 'circadian_survey', name: 'Circadian Alignment',
        description: 'Unlock secure passcode & submit Karolinska Sleepiness Scale.',
        xpReward: 100, completed: completedQuestIds.contains('circadian_survey')),
    Quest(id: 'select_patient', name: 'Load Patient Chart',
        description: 'Select a patient case profile to begin clinical evaluation.',
        xpReward: 100, completed: completedQuestIds.contains('select_patient')),
    Quest(id: 'click_anatomy', name: 'Anatomical Assessment',
        description: 'Investigate a specific anatomical zone on the body map.',
        xpReward: 100, completed: completedQuestIds.contains('click_anatomy')),
    Quest(id: 'generate_care_plan', name: 'Gemini Multi-Lens Generation',
        description: 'Generate real-time Clinical Strategy across 5 specialized lenses.',
        xpReward: 200, completed: completedQuestIds.contains('generate_care_plan')),
    Quest(id: 'explore_evidence', name: 'Deep Evidence Drill',
        description: 'Activate Evidence Focus on a recommendation to view research context.',
        xpReward: 150, completed: completedQuestIds.contains('explore_evidence')),
    Quest(id: 'sentinel_triage', name: 'Sentinel Triage Briefing',
        description: 'Load a WHO/CDC Sentinel case for regional threat monitoring.',
        xpReward: 200, completed: completedQuestIds.contains('sentinel_triage')),
    Quest(id: 'sync_registry', name: 'Registry Connectivity Sync',
        description: 'Synchronize sentinel triage reports to the WHO database.',
        xpReward: 150, completed: completedQuestIds.contains('sync_registry')),
    Quest(id: 'finalize_plan', name: 'Secure Compliance Archival',
        description: 'Finalize and archive the patient care record.',
        xpReward: 300, completed: completedQuestIds.contains('finalize_plan')),
  ];

  String get nextStepText {
    if (!completedQuestIds.contains('circadian_survey')) {
      return 'Unlock the secure console and select sleepiness readiness (KSS).';
    }
    if (!completedQuestIds.contains('select_patient')) {
      return 'Select a patient profile to initiate a care plan.';
    }
    if (!completedQuestIds.contains('click_anatomy')) {
      return 'Tap a highlighted organ or pain area on the Body Viewer.';
    }
    if (!completedQuestIds.contains('generate_care_plan')) {
      return 'Press "Generate Care Plan" to compile the Gemini intelligence strategy.';
    }
    if (!completedQuestIds.contains('explore_evidence')) {
      return 'Tap a care recommendation to activate Evidence Focus.';
    }
    if (!completedQuestIds.contains('sentinel_triage')) {
      return 'Load a Sentinel patient to investigate outbreak triage.';
    }
    if (!completedQuestIds.contains('sync_registry')) {
      return 'Sync Sentinel findings to the central database.';
    }
    if (!completedQuestIds.contains('finalize_plan')) {
      return 'Tap "Finalize & Archive" to seal the compliant record.';
    }
    return 'All missions completed! Explore additional systems.';
  }

  GamificationState copyWith({int? points, List<String>? completedQuestIds}) =>
    GamificationState(
      points: points ?? this.points,
      completedQuestIds: completedQuestIds ?? this.completedQuestIds,
    );
}

class GamificationNotifier extends Notifier<GamificationState> {
  static const _pointsKey = 'pg_game_points';
  static const _questsKey = 'pg_game_quests';

  @override
  GamificationState build() {
    _loadSaved();
    return const GamificationState();
  }

  Future<void> _loadSaved() async {
    final prefs = await SharedPreferences.getInstance();
    final savedPoints = prefs.getInt(_pointsKey) ?? 0;
    final savedQuests = prefs.getString(_questsKey);
    List<String> questIds = [];
    if (savedQuests != null) {
      try {
        questIds = List<String>.from(jsonDecode(savedQuests) as List);
      } catch (_) {}
    }
    state = GamificationState(points: savedPoints, completedQuestIds: questIds);
  }

  Future<void> completeQuest(String questId) async {
    if (state.completedQuestIds.contains(questId)) return;

    final quest = state.quests.firstWhere(
      (q) => q.id == questId,
      orElse: () => const Quest(id: '', name: '', description: '', xpReward: 0),
    );
    if (quest.id.isEmpty) return;

    final newIds = [...state.completedQuestIds, questId];
    final newPoints = state.points + quest.xpReward;

    state = state.copyWith(points: newPoints, completedQuestIds: newIds);
    await _persist();
  }

  Future<void> reset() async {
    state = const GamificationState();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_pointsKey);
    await prefs.remove(_questsKey);
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_pointsKey, state.points);
    await prefs.setString(_questsKey, jsonEncode(state.completedQuestIds));
  }
}

final gamificationProvider =
    NotifierProvider<GamificationNotifier, GamificationState>(() {
  return GamificationNotifier();
});
