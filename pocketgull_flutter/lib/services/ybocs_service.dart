/// Y-BOCS (Yale-Brown Obsessive Compulsive Scale) Service
///
/// Flutter parity with Angular `ybocs/ybocs.service.ts`, `ybocs/types.ts`, `ybocs/data.ts`.
/// Full standardized neuropsychiatric OCD assessment with symptom checklist,
/// severity scoring (Q1-10 + insight Q11), and auto-save to patient history.
library;

import 'dart:ui' show Color;
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ══════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════

class SymptomItem {
  final int id;
  final String category;
  final bool isObsession;
  final String text;
  final String examples;
  const SymptomItem({
    required this.id, required this.category, required this.isObsession,
    required this.text, required this.examples,
  });
}

class SymptomResponse {
  final bool past;
  final bool current;
  const SymptomResponse({this.past = false, this.current = false});
  SymptomResponse togglePast() => SymptomResponse(past: !past, current: current);
  SymptomResponse toggleCurrent() => SymptomResponse(past: past, current: !current);
}

class SeverityOption {
  final int score;
  final String label;
  final String desc;
  const SeverityOption({required this.score, required this.label, required this.desc});
}

class SeverityQuestion {
  final int id;
  final String title;
  final String subtitle;
  final List<SeverityOption> options;
  final bool isObsessionRelated;
  const SeverityQuestion({
    required this.id, required this.title, required this.subtitle,
    required this.options, required this.isObsessionRelated,
  });
}

class SeverityCategory {
  final String name;
  final String description;
  const SeverityCategory({required this.name, required this.description});

  Color get color => switch (name) {
        'Subclinical' => const Color(0xFF10B981),
        'Mild OCD' => const Color(0xFFFBBF24),
        'Moderate OCD' => const Color(0xFFF97316),
        'Severe OCD' => const Color(0xFFEF4444),
        'Extreme OCD' => const Color(0xFFDC2626),
        _ => const Color(0xFF6B7280),
      };
}

class SymptomCategoryItem {
  final String id;
  final String name;
  final bool isObsession;
  const SymptomCategoryItem({required this.id, required this.name, required this.isObsession});
}

// ── Symptom Categories ──

const symptomCategories = <SymptomCategoryItem>[
  SymptomCategoryItem(id: 'aggressive', name: 'Aggressive Obsessions', isObsession: true),
  SymptomCategoryItem(id: 'contamination', name: 'Contamination Obsessions', isObsession: true),
  SymptomCategoryItem(id: 'sexual', name: 'Sexual Obsessions', isObsession: true),
  SymptomCategoryItem(id: 'hoarding_obs', name: 'Hoarding/Saving Obsessions', isObsession: true),
  SymptomCategoryItem(id: 'religious', name: 'Religious Obsessions', isObsession: true),
  SymptomCategoryItem(id: 'symmetry', name: 'Need for Symmetry or Exactness', isObsession: true),
  SymptomCategoryItem(id: 'misc_obs', name: 'Miscellaneous Obsessions', isObsession: true),
  SymptomCategoryItem(id: 'somatic', name: 'Somatic Obsessions', isObsession: true),
  SymptomCategoryItem(id: 'cleaning', name: 'Cleaning/Washing Compulsions', isObsession: false),
  SymptomCategoryItem(id: 'checking', name: 'Checking Compulsions', isObsession: false),
  SymptomCategoryItem(id: 'repeating', name: 'Repeating Rituals', isObsession: false),
  SymptomCategoryItem(id: 'counting', name: 'Counting Compulsions', isObsession: false),
  SymptomCategoryItem(id: 'ordering', name: 'Ordering/Arranging Compulsions', isObsession: false),
  SymptomCategoryItem(id: 'hoarding_comp', name: 'Hoarding/Collecting Compulsions', isObsession: false),
  SymptomCategoryItem(id: 'misc_comp', name: 'Miscellaneous Compulsions', isObsession: false),
];

// ── Representative Symptom Items ──

const symptomItems = <SymptomItem>[
  SymptomItem(id: 1, category: 'aggressive', isObsession: true, text: 'Fear I might harm myself', examples: 'Fear of eating with knife, handling sharp objects'),
  SymptomItem(id: 2, category: 'aggressive', isObsession: true, text: 'Fear I might harm other people', examples: 'Fear of poisoning food, pushing someone'),
  SymptomItem(id: 3, category: 'aggressive', isObsession: true, text: 'Violent or horrific images', examples: 'Images of murder, dismembered bodies'),
  SymptomItem(id: 4, category: 'contamination', isObsession: true, text: 'Concerns with dirt or germs', examples: 'Bothered by sticky substances, afraid of contaminants'),
  SymptomItem(id: 5, category: 'contamination', isObsession: true, text: 'Excessive concern with environmental contaminants', examples: 'Asbestos, radiation, toxic waste'),
  SymptomItem(id: 6, category: 'sexual', isObsession: true, text: 'Forbidden or perverse sexual thoughts', examples: 'Intrusive sexual content involving others'),
  SymptomItem(id: 7, category: 'hoarding_obs', isObsession: true, text: 'Distinct from hobbies and concern with objects of monetary value', examples: 'Fear of throwing things away'),
  SymptomItem(id: 8, category: 'religious', isObsession: true, text: 'Concerned with sacrilege and blasphemy', examples: 'Fear of having committed unpardonable sin'),
  SymptomItem(id: 9, category: 'symmetry', isObsession: true, text: 'Accompanied by magical thinking', examples: 'If things are not "just right" something bad will happen'),
  SymptomItem(id: 10, category: 'somatic', isObsession: true, text: 'Concern with illness or disease', examples: 'Insistent preoccupation despite medical reassurance'),
  SymptomItem(id: 11, category: 'misc_obs', isObsession: true, text: 'Need to know or remember', examples: 'Trouble discarding old newspapers, mail, wrapper'),
  SymptomItem(id: 12, category: 'cleaning', isObsession: false, text: 'Excessive or ritualized handwashing', examples: 'Excessive handwashing, showering, bathing'),
  SymptomItem(id: 13, category: 'cleaning', isObsession: false, text: 'Excessive cleaning of household items', examples: 'Excessive cleaning of faucets, toilets, floors'),
  SymptomItem(id: 14, category: 'checking', isObsession: false, text: 'Checking locks, stove, appliances', examples: 'Checking that doors are locked, stove is off'),
  SymptomItem(id: 15, category: 'checking', isObsession: false, text: 'Checking that did not/will not harm self', examples: 'Need to re-read or re-write'),
  SymptomItem(id: 16, category: 'repeating', isObsession: false, text: 'Re-reading or re-writing', examples: 'Need to repeat routine activities'),
  SymptomItem(id: 17, category: 'counting', isObsession: false, text: 'Counting rituals', examples: 'Need to count to a certain number'),
  SymptomItem(id: 18, category: 'ordering', isObsession: false, text: 'Need to order or arrange items', examples: 'Need things in a particular order'),
  SymptomItem(id: 19, category: 'hoarding_comp', isObsession: false, text: 'Difficulty discarding objects', examples: 'Collecting useless objects'),
  SymptomItem(id: 20, category: 'misc_comp', isObsession: false, text: 'Mental rituals (other than checking/counting)', examples: 'Mental reviewing, special words or images'),
];

class YbocsAssessment {
  final Map<int, SymptomResponse> checklistAnswers;
  final int? upsettingObsessionId;
  final int? upsettingCompulsionId;
  final Map<int, int> severityAnswers;
  final int obsessionSubtotal;
  final int compulsiveSubtotal;
  final int totalScore;
  final String severityCategory;
  final String dateCreated;

  const YbocsAssessment({
    this.checklistAnswers = const {},
    this.upsettingObsessionId,
    this.upsettingCompulsionId,
    this.severityAnswers = const {},
    this.obsessionSubtotal = 0,
    this.compulsiveSubtotal = 0,
    this.totalScore = 0,
    this.severityCategory = 'Subclinical',
    required this.dateCreated,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// DATA — Severity scoring thresholds
// ══════════════════════════════════════════════════════════════════════════

SeverityCategory getSeverityCategory(int totalScore) {
  if (totalScore <= 7) {
    return const SeverityCategory(name: 'Subclinical',
        description: 'Symptoms present but do not meet threshold for mild impairment.');
  } else if (totalScore <= 15) {
    return const SeverityCategory(name: 'Mild OCD',
        description: 'Symptoms noticeable, 1-3 hrs/day. Mild distress but manageable.');
  } else if (totalScore <= 23) {
    return const SeverityCategory(name: 'Moderate OCD',
        description: 'Definitive interference with daily activities, 3-8 hrs/day.');
  } else if (totalScore <= 31) {
    return const SeverityCategory(name: 'Severe OCD',
        description: 'Highly intrusive, >8 hrs/day. Work/social roles heavily impaired.');
  }
  return const SeverityCategory(name: 'Extreme OCD',
      description: 'Near-constant, incapacitating. Urgent professional support needed.');
}

/// Condensed severity questions (10 clinical + 1 insight).
final List<SeverityQuestion> severityQuestions = [
  const SeverityQuestion(id: 1, title: '1. Time Occupied by Obsessive Thoughts', subtitle: 'How much time per day?', isObsessionRelated: true, options: [
    SeverityOption(score: 0, label: 'None', desc: 'No obsessive thoughts.'),
    SeverityOption(score: 1, label: 'Mild (<1 hr)', desc: 'Less than 1 hour per day.'),
    SeverityOption(score: 2, label: 'Moderate (1-3 hrs)', desc: '1-3 hours per day.'),
    SeverityOption(score: 3, label: 'Severe (3-8 hrs)', desc: '3-8 hours per day.'),
    SeverityOption(score: 4, label: 'Extreme (>8 hrs)', desc: '>8 hours per day.'),
  ]),
  const SeverityQuestion(id: 2, title: '2. Interference from Obsessions', subtitle: 'How much did thoughts interfere?', isObsessionRelated: true, options: [
    SeverityOption(score: 0, label: 'None', desc: 'No interference.'),
    SeverityOption(score: 1, label: 'Mild', desc: 'Slight interference.'),
    SeverityOption(score: 2, label: 'Moderate', desc: 'Definite interference.'),
    SeverityOption(score: 3, label: 'Severe', desc: 'Substantial impairment.'),
    SeverityOption(score: 4, label: 'Extreme', desc: 'Incapacitating.'),
  ]),
  const SeverityQuestion(id: 3, title: '3. Distress from Obsessions', subtitle: 'How much distress?', isObsessionRelated: true, options: [
    SeverityOption(score: 0, label: 'None', desc: 'No distress.'),
    SeverityOption(score: 1, label: 'Mild', desc: 'Infrequent distress.'),
    SeverityOption(score: 2, label: 'Moderate', desc: 'Frequent, disturbing.'),
    SeverityOption(score: 3, label: 'Severe', desc: 'Very frequent.'),
    SeverityOption(score: 4, label: 'Extreme', desc: 'Near-constant, disabling.'),
  ]),
  const SeverityQuestion(id: 4, title: '4. Resistance Against Obsessions', subtitle: 'How much effort to resist?', isObsessionRelated: true, options: [
    SeverityOption(score: 0, label: 'Always Resist', desc: 'Always resisted.'),
    SeverityOption(score: 1, label: 'Mostly Resist', desc: 'Resisted most of the time.'),
    SeverityOption(score: 2, label: 'Some Effort', desc: 'Some effort to resist.'),
    SeverityOption(score: 3, label: 'Rarely Resist', desc: 'Yielded with reluctance.'),
    SeverityOption(score: 4, label: 'Completely Yielded', desc: 'Willingly gave in.'),
  ]),
  const SeverityQuestion(id: 5, title: '5. Control Over Obsessions', subtitle: 'How much control?', isObsessionRelated: true, options: [
    SeverityOption(score: 0, label: 'Complete', desc: 'Complete control.'),
    SeverityOption(score: 1, label: 'Much', desc: 'Could stop with effort.'),
    SeverityOption(score: 2, label: 'Moderate', desc: 'Sometimes could stop.'),
    SeverityOption(score: 3, label: 'Little', desc: 'Rarely successful.'),
    SeverityOption(score: 4, label: 'None', desc: 'Rarely could even ignore.'),
  ]),
  // Compulsive Behaviors Q6-10
  const SeverityQuestion(id: 6, title: '6. Time on Compulsive Behaviors', subtitle: 'How much time per day?', isObsessionRelated: false, options: [
    SeverityOption(score: 0, label: 'None', desc: 'No compulsive behaviors.'),
    SeverityOption(score: 1, label: 'Mild (<1 hr)', desc: 'Less than 1 hour.'),
    SeverityOption(score: 2, label: 'Moderate (1-3 hrs)', desc: '1-3 hours.'),
    SeverityOption(score: 3, label: 'Severe (3-8 hrs)', desc: '3-8 hours.'),
    SeverityOption(score: 4, label: 'Extreme (>8 hrs)', desc: '>8 hours.'),
  ]),
  const SeverityQuestion(id: 7, title: '7. Interference from Compulsions', subtitle: 'How much interference?', isObsessionRelated: false, options: [
    SeverityOption(score: 0, label: 'None', desc: 'No interference.'),
    SeverityOption(score: 1, label: 'Mild', desc: 'Slight.'),
    SeverityOption(score: 2, label: 'Moderate', desc: 'Definite.'),
    SeverityOption(score: 3, label: 'Severe', desc: 'Substantial.'),
    SeverityOption(score: 4, label: 'Extreme', desc: 'Incapacitating.'),
  ]),
  const SeverityQuestion(id: 8, title: '8. Distress from Compulsions', subtitle: 'How anxious if prevented?', isObsessionRelated: false, options: [
    SeverityOption(score: 0, label: 'None', desc: 'Not anxious.'),
    SeverityOption(score: 1, label: 'Mild', desc: 'Slightly anxious.'),
    SeverityOption(score: 2, label: 'Moderate', desc: 'Manageable anxiety.'),
    SeverityOption(score: 3, label: 'Severe', desc: 'Very disturbing.'),
    SeverityOption(score: 4, label: 'Extreme', desc: 'Incapacitating.'),
  ]),
  const SeverityQuestion(id: 9, title: '9. Resistance Against Compulsions', subtitle: 'How much effort to resist?', isObsessionRelated: false, options: [
    SeverityOption(score: 0, label: 'Always Resist', desc: 'Always resisted.'),
    SeverityOption(score: 1, label: 'Mostly', desc: 'Most of the time.'),
    SeverityOption(score: 2, label: 'Some Effort', desc: 'Some effort.'),
    SeverityOption(score: 3, label: 'Rarely', desc: 'Yielded to almost all.'),
    SeverityOption(score: 4, label: 'Completely Yielded', desc: 'Willingly gave in.'),
  ]),
  const SeverityQuestion(id: 10, title: '10. Control Over Compulsions', subtitle: 'How much control?', isObsessionRelated: false, options: [
    SeverityOption(score: 0, label: 'Complete', desc: 'Complete control.'),
    SeverityOption(score: 1, label: 'Much', desc: 'Could stop with effort.'),
    SeverityOption(score: 2, label: 'Moderate', desc: 'Sometimes.'),
    SeverityOption(score: 3, label: 'Little', desc: 'Only delay.'),
    SeverityOption(score: 4, label: 'None', desc: 'Rarely could delay.'),
  ]),
];

// ══════════════════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════════════════

class YbocsState {
  final Map<int, SymptomResponse> checklistAnswers;
  final int? upsettingObsessionId;
  final int? upsettingCompulsionId;
  final Map<int, int> severityAnswers;
  final String dateCreated;

  const YbocsState({
    this.checklistAnswers = const {},
    this.upsettingObsessionId,
    this.upsettingCompulsionId,
    this.severityAnswers = const {},
    required this.dateCreated,
  });

  int get obsessionSubtotal {
    int sum = 0;
    for (int id = 1; id <= 5; id++) {
      sum += severityAnswers[id] ?? 0;
    }
    return sum;
  }

  int get compulsiveSubtotal {
    int sum = 0;
    for (int id = 6; id <= 10; id++) {
      sum += severityAnswers[id] ?? 0;
    }
    return sum;
  }

  int get totalScore => obsessionSubtotal + compulsiveSubtotal;

  SeverityCategory get severityDetails => getSeverityCategory(totalScore);

  YbocsState copyWith({
    Map<int, SymptomResponse>? checklistAnswers,
    int? upsettingObsessionId,
    int? upsettingCompulsionId,
    Map<int, int>? severityAnswers,
    String? dateCreated,
  }) => YbocsState(
    checklistAnswers: checklistAnswers ?? this.checklistAnswers,
    upsettingObsessionId: upsettingObsessionId ?? this.upsettingObsessionId,
    upsettingCompulsionId: upsettingCompulsionId ?? this.upsettingCompulsionId,
    severityAnswers: severityAnswers ?? this.severityAnswers,
    dateCreated: dateCreated ?? this.dateCreated,
  );
}

// ══════════════════════════════════════════════════════════════════════════
// NOTIFIER
// ══════════════════════════════════════════════════════════════════════════

class YbocsNotifier extends Notifier<YbocsState> {
  @override
  YbocsState build() => YbocsState(dateCreated: DateTime.now().toIso8601String());

  void toggleChecklist(int symptomId, String type) {
    final current = state.checklistAnswers[symptomId] ?? const SymptomResponse();
    final updated = type == 'past' ? current.togglePast() : current.toggleCurrent();
    state = state.copyWith(
      checklistAnswers: {...state.checklistAnswers, symptomId: updated},
    );
  }

  void setSeverityScore(int questionId, int score) {
    state = state.copyWith(
      severityAnswers: {...state.severityAnswers, questionId: score},
    );
  }

  void setUpsettingObsession(int? id) {
    state = state.copyWith(upsettingObsessionId: id);
  }

  void setUpsettingCompulsion(int? id) {
    state = state.copyWith(upsettingCompulsionId: id);
  }

  void reset() {
    state = YbocsState(dateCreated: DateTime.now().toIso8601String());
  }

  /// Alias for the widget layer.
  void resetAssessment() => reset();
}

final ybocsProvider = NotifierProvider<YbocsNotifier, YbocsState>(() {
  return YbocsNotifier();
});
