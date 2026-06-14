import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// A quest definition — mirrors Angular's IQuest interface.
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
    required this.completed,
  });

  Quest copyWith({bool? completed}) => Quest(
        id: id,
        name: name,
        description: description,
        xpReward: xpReward,
        completed: completed ?? this.completed,
      );
}

/// GamificationService — mirrors Angular's gamification.service.ts.
///
/// Tracks XP points, completed quest IDs, level, and progress with
/// full Hive persistence so progress survives app restarts.
///
/// Item #6 — ACM §1.6 Privacy / PHI Risk Assessment:
/// The two Hive keys below store ONLY:
///   - `pg_game_points`: an integer XP total (non-PHI)
///   - `pg_game_quests`: a `List<String>` of opaque quest ID tokens
///     (e.g., 'circadian_survey', 'select_patient') — these are
///     pre-defined enum-like strings with NO patient identity data.
/// Risk: LOW. Quest completion timestamps are NOT persisted.
/// MUST NOT be extended to store patient IDs, names, or clinical data.
class GamificationService extends ChangeNotifier {
  static const _pointsKey = 'pg_game_points';   // int — XP total (non-PHI)
  static const _questsKey = 'pg_game_quests';   // List<String> — opaque quest IDs (non-PHI)

  int _points = 0;
  List<String> _completedQuestIds = [];

  int get points => _points;
  List<String> get completedQuestIds => List.unmodifiable(_completedQuestIds);

  // ── Level thresholds (mirrors Angular) ──────────────────────────────────────
  int get level {
    if (_points < 200) return 1;
    if (_points < 500) return 2;
    if (_points < 900) return 3;
    if (_points < 1400) return 4;
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
        1 => 200,
        2 => 500,
        3 => 900,
        4 => 1400,
        _ => 2000,
      };

  int get xpMinForCurrentLevel => switch (level) {
        1 => 0,
        2 => 200,
        3 => 500,
        4 => 900,
        _ => 1400,
      };

  /// Progress 0–1.0 within the current level band.
  double get progressFraction {
    final pts = _points;
    final min = xpMinForCurrentLevel;
    final max = xpNeededForNextLevel;
    if (pts >= max) return 1.0;
    final range = max - min;
    if (range <= 0) return 1.0;
    return ((pts - min) / range).clamp(0.0, 1.0);
  }

  /// Returns the full quest roster, with completion status applied.
  List<Quest> get quests => [
        Quest(
          id: 'circadian_survey',
          name: 'Circadian Alignment',
          description: 'Unlock secure passcode & submit Karolinska Sleepiness Scale (KSS).',
          xpReward: 100,
          completed: _completedQuestIds.contains('circadian_survey'),
        ),
        Quest(
          id: 'select_patient',
          name: 'Load Patient Chart',
          description: 'Select a patient case profile to begin clinical evaluation.',
          xpReward: 100,
          completed: _completedQuestIds.contains('select_patient'),
        ),
        Quest(
          id: 'click_anatomy',
          name: 'Anatomical Assessment',
          description: 'Investigate a specific anatomical zone of interest on the 3D body map.',
          xpReward: 100,
          completed: _completedQuestIds.contains('click_anatomy'),
        ),
        Quest(
          id: 'generate_care_plan',
          name: 'Gemini Multi-Lens Generation',
          description: 'Generate real-time Clinical Strategy across 5 specialized lenses.',
          xpReward: 200,
          completed: _completedQuestIds.contains('generate_care_plan'),
        ),
        Quest(
          id: 'explore_evidence',
          name: 'Deep Evidence Drill',
          description: 'Activate Evidence Focus on a recommendation to view clinical research context.',
          xpReward: 150,
          completed: _completedQuestIds.contains('explore_evidence'),
        ),
        Quest(
          id: 'sentinel_triage',
          name: 'Sentinel Triage Briefing',
          description: 'Load a WHO/CDC Sentinel case for regional threat monitoring.',
          xpReward: 200,
          completed: _completedQuestIds.contains('sentinel_triage'),
        ),
        Quest(
          id: 'sync_registry',
          name: 'Registry Connectivity Sync',
          description: 'Synchronize sentinel triage reports to the National/WHO database.',
          xpReward: 150,
          completed: _completedQuestIds.contains('sync_registry'),
        ),
        Quest(
          id: 'finalize_plan',
          name: 'Secure Compliance Archival',
          description: 'Finalize and archive the patient care record, and initiate print flow.',
          xpReward: 300,
          completed: _completedQuestIds.contains('finalize_plan'),
        ),
      ];

  /// Contextual next-step guidance text.
  String get nextStepText {
    if (!_completedQuestIds.contains('circadian_survey')) {
      return 'Unlock the secure console and select sleepiness readiness (KSS).';
    }
    if (!_completedQuestIds.contains('select_patient')) {
      return 'Select a patient profile (or a Sentinel) to initiate a care plan.';
    }
    if (!_completedQuestIds.contains('click_anatomy')) {
      return 'Tap a highlighted organ or pain area on the 3D Body Viewer.';
    }
    if (!_completedQuestIds.contains('generate_care_plan')) {
      return 'Press "Generate Care Plan" to compile the Gemini intelligence strategy.';
    }
    if (!_completedQuestIds.contains('explore_evidence')) {
      return 'Tap a care recommendation to activate inline Evidence Focus.';
    }
    if (!_completedQuestIds.contains('sentinel_triage')) {
      return 'Load a Sentinel patient (e.g. Global Sentinel) to investigate outbreak triage.';
    }
    if (!_completedQuestIds.contains('sync_registry')) {
      return 'Sync Sentinel findings to the central database in the Sentinel Triage Panel.';
    }
    if (!_completedQuestIds.contains('finalize_plan')) {
      return 'Tap "Finalize & Archive" to seal the compliant record and print.';
    }
    return 'All missions completed! Feel free to triage other patients or explore additional systems.';
  }

  /// Call once after Hive is initialized (e.g., in main.dart before runApp).
  Future<void> initialize() async {
    try {
      final box = Hive.box('pocket_gull_db');
      _points = (box.get(_pointsKey) as int?) ?? 0;
      final rawQuests = box.get(_questsKey);
      if (rawQuests is List) {
        _completedQuestIds = rawQuests.cast<String>();
      }
    } catch (_) {}
    notifyListeners();
  }

  /// Awards XP for a quest. Idempotent — will not double-award.
  void completeQuest(String questId) {
    if (_completedQuestIds.contains(questId)) return;
    final quest = quests.firstWhere((q) => q.id == questId, orElse: () => throw ArgumentError('Unknown quest: $questId'));

    final oldLevel = level;
    _completedQuestIds = [..._completedQuestIds, questId];
    _points += quest.xpReward;
    _persist();
    notifyListeners();

    if (level > oldLevel) {
      debugPrint('[Gamification] 🎉 LEVEL UP! → $levelTitle');
    }
    debugPrint('[Gamification] ✅ Quest "${quest.name}" complete. +${quest.xpReward} XP (Total: $_points)');
  }

  void reset() {
    _points = 0;
    _completedQuestIds = [];
    _persist();
    notifyListeners();
  }

  void _persist() {
    try {
      final box = Hive.box('pocket_gull_db');
      box.put(_pointsKey, _points);
      box.put(_questsKey, _completedQuestIds);
    } catch (_) {}
  }
}
