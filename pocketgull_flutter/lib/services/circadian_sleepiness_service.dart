import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/circadian_types.dart';

class CircadianSleepinessService with ChangeNotifier {
  final List<KssDescriptor> kssItems = const [
    KssDescriptor(score: 1, emoji: '⚡', label: 'Extremely Alert', detail: 'Feeling fully awake and sharp. Peak readiness.'),
    KssDescriptor(score: 2, emoji: '✨', label: 'Very Alert', detail: 'High energy, no drowsiness.'),
    KssDescriptor(score: 3, emoji: '🟢', label: 'Alert', detail: 'Normal, rested state.'),
    KssDescriptor(score: 4, emoji: '🟡', label: 'Rather Alert', detail: 'Mild variability, mostly focused.'),
    KssDescriptor(score: 5, emoji: '😐', label: 'Neither Alert nor Sleepy', detail: 'Neutral state — manageable.'),
    KssDescriptor(score: 6, emoji: '🟠', label: 'Some Signs of Sleepiness', detail: 'Noticeable effort needed to stay focused.'),
    KssDescriptor(score: 7, emoji: '🔴', label: 'Sleepy, No Effort to Stay Awake', detail: 'Significant impairment — errors more likely.'),
    KssDescriptor(score: 8, emoji: '🚨', label: 'Sleepy, Some Effort to Stay Awake', detail: 'High impairment risk. Clinical tasks affected.'),
    KssDescriptor(score: 9, emoji: '💤', label: 'Very Sleepy / Fighting Sleep', detail: 'Severe impairment. Not safe for complex clinical decisions.'),
  ];

  int? _clinicianKss;
  int? _patientKss;
  bool _dismissed = false;
  DateTime _now = DateTime.now();
  Timer? _timer;

  int? get clinicianKss => _clinicianKss;
  int? get patientKss => _patientKss;
  bool get dismissed => _dismissed;
  DateTime get now => _now;

  CircadianSleepinessService() {
    _timer = Timer.periodic(const Duration(minutes: 1), (timer) {
      _now = DateTime.now();
      notifyListeners();
    });
  }

  set clinicianKss(int? value) {
    _clinicianKss = value;
    notifyListeners();
  }

  set patientKss(int? value) {
    _patientKss = value;
    notifyListeners();
  }

  set dismissed(bool value) {
    _dismissed = value;
    notifyListeners();
  }

  set now(DateTime value) {
    _now = value;
    notifyListeners();
  }

  CircadianContext get circadian => getCircadianContext(_now);

  ReadinessProfile? get readiness {
    final ck = _clinicianKss;
    if (ck == null) return null;
    return _buildReadinessProfile(ck, _patientKss, circadian);
  }

  String? get kssTheme {
    final s = _clinicianKss;
    if (s == null) return null;
    if (s <= 3) return 'optimal';
    if (s <= 5) return 'neutral';
    if (s <= 7) return 'caution';
    return 'alert';
  }

  CircadianContext getCircadianContext(DateTime time) {
    final h = time.hour + time.minute / 60.0;

    if (h >= 5 && h < 8) {
      return CircadianContext(
        phase: 'early-morning',
        hour: time.hour,
        phaseLabel: 'Early Morning — Cortisol Surge',
        phaseEmoji: '🌅',
        expectedKss: 4,
        cognitiveLoad: 'good',
        recommendation: 'Cortisol is peaking — good alerting window, but emotional regulation lags. '
            'Beta entrainment can sharpen focus. Hydrate before seeing first patient.',
        avsWave: 'beta',
        avsBpm: 6.0,
        colorHsl: 'hsl(30, 80%, 55%)',
        colorHslData: const ColorHslData(h: 30, s: 80, l: 55),
      );
    }

    if (h >= 8 && h < 12) {
      return CircadianContext(
        phase: 'morning-peak',
        hour: time.hour,
        phaseLabel: 'Morning Peak — Optimal Window',
        phaseEmoji: '☀️',
        expectedKss: 2,
        cognitiveLoad: 'optimal',
        recommendation: 'Peak cognitive performance window. Schedule complex diagnoses, difficult conversations, '
            'and procedures here. Alpha entrainment maintains coherence without sedation.',
        avsWave: 'alpha',
        avsBpm: 5.5,
        colorHsl: 'hsl(45, 90%, 60%)',
        colorHslData: const ColorHslData(h: 45, s: 90, l: 60),
      );
    }

    if (h >= 12 && h < 15) {
      return CircadianContext(
        phase: 'post-lunch-dip',
        hour: time.hour,
        phaseLabel: 'Post-Lunch Dip — Adenosine Peak',
        phaseEmoji: '😴',
        expectedKss: 6,
        cognitiveLoad: 'reduced',
        recommendation: 'Post-prandial adenosine surge causes the highest sleepiness of the day — even without lunch. '
            'A 10–20 minute beta AVS reset significantly reduces medical error risk in this window.',
        avsWave: 'beta',
        avsBpm: 6.5,
        colorHsl: 'hsl(210, 70%, 50%)',
        colorHslData: const ColorHslData(h: 210, s: 70, l: 50),
      );
    }

    if (h >= 15 && h < 18) {
      return CircadianContext(
        phase: 'afternoon-rally',
        hour: time.hour,
        phaseLabel: 'Afternoon Rally — Motor Peak',
        phaseEmoji: '🌤️',
        expectedKss: 4,
        cognitiveLoad: 'good',
        recommendation: 'Second cognitive peak — good for procedural tasks and chart reviews. '
            'Melatonin has not yet risen. Alpha maintains calm focus.',
        avsWave: 'alpha',
        avsBpm: 5.5,
        colorHsl: 'hsl(270, 60%, 55%)',
        colorHslData: const ColorHslData(h: 270, s: 60, l: 55),
      );
    }

    if (h >= 18 && h < 21) {
      return CircadianContext(
        phase: 'evening-wind-down',
        hour: time.hour,
        phaseLabel: 'Evening Wind-Down — Melatonin Onset',
        phaseEmoji: '🌆',
        expectedKss: 5,
        cognitiveLoad: 'moderate',
        recommendation: 'Melatonin is rising. Cognitive flexibility decreasing. '
            'Theta entrainment supports a natural wind-down. Avoid scheduling high-complexity cases.',
        avsWave: 'theta',
        avsBpm: 5.0,
        colorHsl: 'hsl(320, 60%, 45%)',
        colorHslData: const ColorHslData(h: 320, s: 60, l: 45),
      );
    }

    if (h >= 21 || h < 2) {
      return CircadianContext(
        phase: 'night',
        hour: time.hour,
        phaseLabel: 'Night Shift — Impairment Risk',
        phaseEmoji: '🌙',
        expectedKss: 7,
        cognitiveLoad: 'impaired',
        recommendation: 'Circadian misalignment with social sleep pressure. Error rate comparable to 0.05% BAC. '
            'Beta AVS reset every 2 hours is strongly recommended. Caffeine + 10-min AVS nap more effective than caffeine alone.',
        avsWave: 'beta',
        avsBpm: 7.0,
        colorHsl: 'hsl(240, 50%, 30%)',
        colorHslData: const ColorHslData(h: 240, s: 50, l: 30),
      );
    }

    // Graveyard
    return CircadianContext(
      phase: 'graveyard',
      hour: time.hour,
      phaseLabel: 'Graveyard Hours — Maximum Impairment',
      phaseEmoji: '🌑',
      expectedKss: 9,
      cognitiveLoad: 'impaired',
      recommendation: 'Maximum circadian impairment window (2–4 AM nadir). '
          'Cognitive performance equivalent to 24h total sleep deprivation. '
          'Strategic beta AVS reset is critical. Consider peer-check for all clinical decisions.',
      avsWave: 'beta',
      avsBpm: 7.5,
      colorHsl: 'hsl(240, 40%, 20%)',
      colorHslData: const ColorHslData(h: 240, s: 40, l: 20),
    );
  }

  KssDescriptor kssDescriptor(int score) {
    if (score < 1 || score > 9) {
      return kssItems[2]; // Default to Alert (score 3) if out of bounds
    }
    return kssItems[score - 1];
  }

  ReadinessProfile _buildReadinessProfile(
    int ck,
    int? pk,
    CircadianContext circ,
  ) {
    final penalty = circ.cognitiveLoad == 'impaired'
        ? 2
        : (circ.cognitiveLoad == 'reduced' ? 1 : 0);
    final effectiveKss = (ck + penalty).clamp(1, 9);
    final patientHigh = pk != null && pk >= 7;

    String combinedAlert = 'clear';
    if (effectiveKss >= 8 || (ck >= 7 && circ.cognitiveLoad == 'impaired')) {
      combinedAlert = 'high-risk';
    } else if (effectiveKss >= 6 || patientHigh) {
      combinedAlert = 'caution';
    }

    final rec = _buildRecommendation(ck, pk, circ, combinedAlert);
    final avsReset = _buildAvsReset(ck, circ, combinedAlert);

    return ReadinessProfile(
      clinicianKss: ck,
      patientKss: pk,
      circadian: circ,
      combinedAlert: combinedAlert,
      recommendation: rec,
      avsReset: avsReset,
    );
  }

  String _buildRecommendation(
    int ck,
    int? pk,
    CircadianContext circ,
    String alert,
  ) {
    if (alert == 'high-risk') {
      return '⚠️ KSS $ck + ${circ.phaseLabel}: High impairment risk. '
          'A ${circ.avsWave.toUpperCase()} AVS reset before your first patient is strongly recommended. '
          'Peer-check complex decisions. Avoid unsupported procedural work.';
    }
    if (alert == 'caution') {
      final patientMessage = (pk != null && pk >= 6)
          ? ' Patient also reports elevated sleepiness (KSS $pk) — adjust communication pace and check comprehension.'
          : '';
      return 'KSS $ck during ${circ.phaseLabel}. Mild-moderate impairment. '
          '${circ.recommendation}$patientMessage';
    }
    return 'KSS $ck — ${kssDescriptor(ck).label}. ${circ.phaseLabel}. ${circ.recommendation}';
  }

  AvsReset? _buildAvsReset(int ck, CircadianContext circ, String alert) {
    if (ck <= 3 && alert == 'clear') return null;

    final wave = circ.avsWave;
    final bpm = circ.avsBpm;
    final duration = ck >= 7 ? 15 : (ck >= 5 ? 10 : 5);

    String rationale = '';
    switch (wave) {
      case 'beta':
        rationale = 'Beta (18 Hz) binaural entrainment promotes cortical arousal and counters adenosine-mediated sleepiness. '
            'Most effective during the ${circ.phaseLabel} window.';
        break;
      case 'alpha':
        rationale = 'Alpha (10 Hz) entrainment sustains calm focus without sedation — ideal for peak and rally windows.';
        break;
      case 'theta':
        rationale = 'Theta (6 Hz) supports natural wind-down alignment with circadian melatonin onset.';
        break;
      default:
        rationale = 'Delta entrainment is not indicated for clinical reset scenarios.';
        break;
    }

    return AvsReset(
      wave: wave,
      bpm: bpm,
      durationMin: duration,
      rationale: rationale,
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
