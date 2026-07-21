/// Athletic Protocol Service — AVS protocols for performance enhancement.
///
/// Flutter parity with Angular `athletic-protocol.service.ts` (187 lines).
/// Targets: priming (beta/gamma), flow-state (SMR/alpha),
/// recovery (theta), circadian phase-shift.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AthleticState { priming, flow, recovery, phaseShift }

class AthleticProfile {
  final AthleticState state;
  final String sportType;
  final String? preferredMusic;
  final int? targetTimezoneOffset;

  const AthleticProfile({
    required this.state,
    this.sportType = 'General',
    this.preferredMusic,
    this.targetTimezoneOffset,
  });
}

class AthleticStimBlock {
  final String label;
  final int durationMin;
  final String modality;
  final double? frequencyHz;
  final String instruction;
  final String rationale;

  const AthleticStimBlock({
    required this.label,
    required this.durationMin,
    required this.modality,
    this.frequencyHz,
    required this.instruction,
    required this.rationale,
  });
}

class AthleticSession {
  final AthleticProfile profile;
  final List<AthleticStimBlock> schedule;
  final int totalDurationMin;
  final String coachNote;
  final List<String> athleteGuidance;
  final List<String> evidenceReferences;

  const AthleticSession({
    required this.profile,
    required this.schedule,
    required this.totalDurationMin,
    required this.coachNote,
    required this.athleteGuidance,
    required this.evidenceReferences,
  });
}

class AthleticProtocolNotifier extends Notifier<AthleticSession?> {
  @override
  AthleticSession? build() => null;

  AthleticSession generate(AthleticProfile profile) {
    final schedule = _buildSchedule(profile);
    final total = schedule.fold<int>(0, (s, b) => s + b.durationMin);
    final result = AthleticSession(
      profile: profile,
      schedule: schedule,
      totalDurationMin: total,
      coachNote: _buildCoachNote(profile),
      athleteGuidance: _buildGuidance(profile),
      evidenceReferences: _buildReferences(),
    );
    state = result;
    return result;
  }

  List<AthleticStimBlock> _buildSchedule(AthleticProfile p) {
    switch (p.state) {
      case AthleticState.priming:
        return [
          _block('Autonomic Calibration', 2, 'quiet', null,
              'Establish baseline resting heart rate before stimulation.',
              'Prevents artificial over-stimulation and anxiety panic.'),
          _block('High-Beta Escalation (20 Hz)', 5, 'auditory', 20,
              'Play ${p.preferredMusic ?? "high-tempo music"}. Binaural beats at 20 Hz.',
              'Beta entrainment activates sympathetic nervous system.'),
          _block('Gamma Peak Performance (40 Hz)', 5, 'ambient-light', 40,
              'Sync lighting to pulse at 40 Hz. Introduce isochronic tones.',
              'Gamma drives maximal focus, sensory processing, and reaction time.'),
          _block('Action Transition', 1, 'visual-focus', null,
              'Cease AVS. Visualize the exact physical sequence of the first movement.',
              'Translates neurological arousal into specific motor pathway activation.'),
        ];
      case AthleticState.flow:
        return [
          _block('Pre-Skill Relaxation', 3, 'auditory', 10,
              'Alpha wave (10 Hz) binaural beats with brown noise. 4-7-8 breathing.',
              'Alpha quiets the Default Mode Network (inner critic).'),
          _block('SMR Entrainment (14 Hz)', 10, 'ambient-light', 14,
              'Cool blue ambient light. 14 Hz binaural through headphones.',
              'SMR (12-15 Hz) is correlated with athletic "flow states."'),
          _block('Mental Rehearsal under SMR', 5, 'visual-focus', 14,
              'Close eyes and mentally rehearse the specific complex skill.',
              'Motor cortex activation during SMR identical to physical practice.'),
          _block('Physical Transfer', 2, 'quiet', null,
              'Remove headphones. Perform the skill 3 times with zero conscious thought.',
              'Transfers primed neurological state to physical execution.'),
        ];
      case AthleticState.recovery:
        return [
          _block('Immediate Down-Regulation', 5, 'auditory', 7,
              'Theta wave (7 Hz) binaural beats. Deep amber lighting. Box breathing.',
              'Shifts from sympathetic to parasympathetic. Halts cortisol production.'),
          _block('Deep Parasympathetic Rest (4 Hz)', 10, 'vibroacoustic', 4,
              '4 Hz vibration to major muscle groups. Binaural beats at 4 Hz.',
              'Delta/Theta border forces vasodilation, accelerates lactic acid clearance.'),
          _block('Autogenic Relaxation', 5, 'quiet', null,
              'Complete silence. Body scan feet to head, releasing tension.',
              'Ensures body fully enters anabolic repair state.'),
        ];
      case AthleticState.phaseShift:
        final direction = (p.targetTimezoneOffset ?? 0) > 0
            ? 'Advance (Eastward)'
            : 'Delay (Westward)';
        return [
          _block('Circadian Reset: Phase $direction', 15, 'ambient-light', null,
              direction == 'Advance (Eastward)'
                  ? 'High-intensity blue/cyan light upon waking.'
                  : 'Strict amber/red light only in evening. Blue light blockade 3 hours before sleep.',
              'Light is the primary zeitgeber for the suprachiasmatic nucleus.'),
          _block('Temperature & Arousal Sync', 10, 'auditory', 15,
              direction == 'Advance (Eastward)'
                  ? 'Cold shower, followed by 15 Hz Beta stimulation.'
                  : 'Warm bath, followed by 6 Hz Theta to induce sleep pressure.',
              'Core body temperature must align with the target timezone\'s rhythms.'),
        ];
    }
  }

  AthleticStimBlock _block(String label, int dur, String mod, double? freq,
      String instr, String rationale) {
    return AthleticStimBlock(
        label: label,
        durationMin: dur,
        modality: mod,
        frequencyHz: freq,
        instruction: instr,
        rationale: rationale);
  }

  List<String> _buildGuidance(AthleticProfile p) => switch (p.state) {
        AthleticState.priming => [
            '🔥 Use this protocol 15-30 minutes before your event.',
            '⚠️ Do not use if already experiencing high anxiety.',
            '🎧 High volume is acceptable. Stand up and move during final minutes.',
          ],
        AthleticState.flow => [
            '🎯 Use right before practicing high-skill, technical movements.',
            '🧘 Goal: physical relaxation + sharp external focus.',
            '🚫 Let go of conscious control. Trust muscle memory.',
          ],
        AthleticState.recovery => [
            '🛌 Start within 15 minutes of finishing training.',
            '📱 Phone on Do Not Disturb. Avoid social media.',
            '🫁 Focus entirely on long, slow exhales.',
          ],
        AthleticState.phaseShift => [
            '🌍 Begin 1-3 days before travel.',
            '💡 Control your light environment strictly.',
          ],
      };

  String _buildCoachNote(AthleticProfile p) {
    final desc = switch (p.state) {
      AthleticState.priming => 'Sympathetic Nervous System Activation (Pre-Event)',
      AthleticState.flow => 'Sensorimotor Rhythm Entrainment (Skill/Accuracy)',
      AthleticState.recovery => 'Parasympathetic Down-Regulation (Anabolic Repair)',
      AthleticState.phaseShift => 'Circadian Suprachiasmatic Nucleus Reset',
    };
    return 'Athletic Protocol: $desc. Target: ${p.sportType}.';
  }

  List<String> _buildReferences() => [
        'Thompson T et al. (2008). EEG applications for sport and performance.',
        'Cheron G et al. (2016). Brain oscillations in sport. Frontiers in Psychology.',
        'Waterhouse J et al. (2007). The stress of travel. Journal of Sports Sciences.',
        'Binaural beats and athletic performance: A review (Sports Med, 2020).',
      ];
}

final athleticProtocolProvider =
    NotifierProvider<AthleticProtocolNotifier, AthleticSession?>(() {
  return AthleticProtocolNotifier();
});
