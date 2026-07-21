/// Lifestyle Adjunct Service — Substance–AVS interaction recommendations.
///
/// Flutter parity with Angular `lifestyle-adjunct.service.ts` (338 lines).
/// Deterministic, evidence-grounded lifestyle adjunct recommendations
/// for clinical AVS sessions. Reads patient chart for substance use
/// and metabolic conditions, generates beverage recommendations,
/// session timing advisories, and AVS parameter adjustments.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';

class LifestyleContext {
  final bool hasCaffeine;
  final bool hasCaffeineWithinSession;
  final bool hasAlcohol;
  final bool inAlcoholRecovery;
  final bool isSmoker;
  final bool isCannabisUser;
  final bool usesCbd;
  final bool isDiabetic;
  final bool isPreDiabetic;
  final List<String> notes;

  const LifestyleContext({
    this.hasCaffeine = false,
    this.hasCaffeineWithinSession = false,
    this.hasAlcohol = false,
    this.inAlcoholRecovery = false,
    this.isSmoker = false,
    this.isCannabisUser = false,
    this.usesCbd = false,
    this.isDiabetic = false,
    this.isPreDiabetic = false,
    this.notes = const [],
  });
}

class SessionRecommendation {
  final String category; // caution, beverage, avs-adjustment, timing, wind-down
  final String emoji;
  final String title;
  final String detail;
  final Map<String, dynamic>? avsAdjust;

  const SessionRecommendation({
    required this.category,
    required this.emoji,
    required this.title,
    required this.detail,
    this.avsAdjust,
  });
}

class LifestyleAdjunct {
  final LifestyleContext context;
  final List<SessionRecommendation> recommendations;
  final String clinicianNote;

  const LifestyleAdjunct({
    required this.context,
    required this.recommendations,
    required this.clinicianNote,
  });
}

class LifestyleAdjunctNotifier extends Notifier<LifestyleAdjunct?> {
  @override
  LifestyleAdjunct? build() => null;

  /// Scan the patient chart text and generate recommendations.
  LifestyleAdjunct generate(String chartText) {
    final ctx = _extractContext(chartText);
    final recs = _buildRecommendations(ctx);
    final note = _buildClinicianNote(ctx);
    final result = LifestyleAdjunct(
      context: ctx,
      recommendations: recs,
      clinicianNote: note,
    );
    state = result;
    return result;
  }

  // ── Context extraction via keyword matching ──

  static const _kw = {
    'caffeine': ['coffee', 'caffeine', 'espresso', 'energy drink', 'matcha'],
    'caffeineNow': ['had coffee', 'coffee this morning', 'coffee today'],
    'alcohol': ['alcohol', 'beer', 'wine', 'spirits', 'whiskey', 'vodka'],
    'recovery': ['sobriety', 'sober', 'in recovery', 'alcohol recovery'],
    'smoking': ['smok', 'cigarette', 'tobacco', 'nicotine', 'vaping', 'vape'],
    'cannabis': ['cannabis', 'marijuana', 'thc', 'weed'],
    'cbd': ['cbd', 'cannabidiol', 'hemp oil'],
    'diabetic': ['diabetes', 'diabetic', 'insulin', 'metformin', 'ozempic'],
    'preDiabetic': ['pre-diabet', 'prediabet', 'impaired fasting'],
  };

  bool _any(String text, List<String> kws) =>
      kws.any((k) => text.contains(k));

  LifestyleContext _extractContext(String rawText) {
    final text = rawText.toLowerCase();
    final notes = <String>[];

    final hasCaffeine = _any(text, _kw['caffeine']!);
    final hasAlcohol = _any(text, _kw['alcohol']!);
    final inRecovery = _any(text, _kw['recovery']!);
    final isSmoker = _any(text, _kw['smoking']!);
    final cannabis = _any(text, _kw['cannabis']!);
    final cbd = _any(text, _kw['cbd']!);
    final diabetic = _any(text, _kw['diabetic']!);
    final preDiabetic = _any(text, _kw['preDiabetic']!);

    if (hasCaffeine) notes.add('Caffeine use noted');
    if (hasAlcohol) notes.add(inRecovery ? 'Alcohol — in recovery' : 'Active alcohol use');
    if (isSmoker) notes.add('Tobacco/nicotine use');
    if (cannabis) notes.add('Cannabis (THC) use');
    if (cbd) notes.add('CBD use');
    if (diabetic) notes.add('Diabetic — glycemic timing matters');
    if (preDiabetic) notes.add('Pre-diabetic');

    return LifestyleContext(
      hasCaffeine: hasCaffeine,
      hasCaffeineWithinSession: _any(text, _kw['caffeineNow']!),
      hasAlcohol: hasAlcohol,
      inAlcoholRecovery: inRecovery,
      isSmoker: isSmoker,
      isCannabisUser: cannabis,
      usesCbd: cbd,
      isDiabetic: diabetic,
      isPreDiabetic: preDiabetic,
      notes: notes,
    );
  }

  List<SessionRecommendation> _buildRecommendations(LifestyleContext ctx) {
    final recs = <SessionRecommendation>[];

    if (ctx.hasCaffeineWithinSession) {
      recs.add(const SessionRecommendation(
        category: 'caution', emoji: '☕',
        title: 'Caffeine Within Last 2–3 Hours',
        detail: 'Recent caffeine blocks adenosine, suppressing alpha waves. '
            'Extend session by 5 min, start with slower breath rate (4.5 BPM).',
      ));
      recs.add(const SessionRecommendation(
        category: 'beverage', emoji: '🍵',
        title: 'Switch to L-Theanine Tea',
        detail: 'L-theanine promotes alpha wave activity and synergizes with AVS. '
            'Matcha or green tea: 1 cup 20 min before session.',
      ));
    } else if (ctx.hasCaffeine) {
      recs.add(const SessionRecommendation(
        category: 'beverage', emoji: '🍵',
        title: 'Pre-Session Beverage Swap',
        detail: 'Replace coffee with L-theanine-rich green tea 30–60 min before AVS.',
      ));
    }

    if (ctx.isSmoker) {
      recs.add(const SessionRecommendation(
        category: 'avs-adjustment', emoji: '🫁',
        title: 'Nicotine — Extended Exhale Protocol',
        detail: 'Nicotine elevates cortisol and HR. Extend exhale phase (4-1-7 ratio).',
      ));
      recs.add(const SessionRecommendation(
        category: 'beverage', emoji: '🌿',
        title: 'Peppermint or Ginger Tea',
        detail: 'Peppermint opens airways and reduces nicotine craving signals.',
      ));
    }

    if (ctx.hasAlcohol && !ctx.inAlcoholRecovery) {
      recs.add(const SessionRecommendation(
        category: 'caution', emoji: '🍺',
        title: 'Alcohol Use — Amplified Sedation Risk',
        detail: 'Alcohol potentiates GABA-A. Limit session to alpha (10 Hz), keep room well-lit.',
      ));
    }

    if (ctx.inAlcoholRecovery) {
      recs.add(const SessionRecommendation(
        category: 'avs-adjustment', emoji: '🧠',
        title: 'Recovery Protocol — Theta for GABA Normalization',
        detail: 'Alpha/theta neurofeedback (Peniston Protocol) has the strongest evidence for AUD recovery.',
      ));
    }

    if (ctx.isCannabisUser) {
      recs.add(const SessionRecommendation(
        category: 'caution', emoji: '🌿',
        title: 'Cannabis — Heightened Sensory Sensitivity',
        detail: 'THC amplifies sensory processing. Reduce binaural volume by 30%, use brown noise only.',
      ));
    }

    if (ctx.isDiabetic) {
      recs.add(const SessionRecommendation(
        category: 'timing', emoji: '🩸',
        title: 'Glycemic Timing — Session Scheduling',
        detail: 'Schedule AVS 90–120 min after a meal. Confirm patient has eaten.',
      ));
    }

    if (recs.isEmpty) {
      recs.add(const SessionRecommendation(
        category: 'beverage', emoji: '☕',
        title: 'General Pre-Session Beverages',
        detail: 'Chamomile, lavender, or L-theanine green tea. Stay hydrated.',
      ));
    }

    return recs;
  }

  String _buildClinicianNote(LifestyleContext ctx) {
    final factors = <String>[];
    if (ctx.hasCaffeineWithinSession) factors.add('caffeine within session window');
    if (ctx.isSmoker) factors.add('active nicotine use');
    if (ctx.inAlcoholRecovery) {
      factors.add('alcohol recovery (Peniston protocol)');
    } else if (ctx.hasAlcohol) {
      factors.add('active alcohol use (alpha-only)');
    }
    if (ctx.isCannabisUser) factors.add('THC use (reduced volume)');
    if (ctx.isDiabetic) factors.add('diabetic (glycemic timing)');
    if (factors.isEmpty) return 'No substance or metabolic interactions. Standard protocol.';
    return 'Lifestyle factors: ${factors.join('; ')}.';
  }
}

final lifestyleAdjunctProvider =
    NotifierProvider<LifestyleAdjunctNotifier, LifestyleAdjunct?>(() {
  return LifestyleAdjunctNotifier();
});
