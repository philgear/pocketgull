/// DOC Protocol Service — Disorders of Consciousness stimulation protocol generator.
///
/// Flutter parity with Angular `doc-protocol.service.ts` (325 lines).
/// Generates evidence-informed Sensory Stimulation Protocols for patients
/// with DOC (coma, VS/UWS, MCS±, EMCS, locked-in syndrome).
///
/// Clinical basis: Thalamocortical arousal theory (Schiff 2010),
/// Gamma 40Hz GENUS protocol (Tsai lab MIT), CRS-R frameworks.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';

// ── Types ──────────────────────────────────────────────────────────

enum DocLevel { coma, vsUws, mcsMinus, mcsPlus, emcs, lockedIn }

class DocProfile {
  final DocLevel docLevel;
  final int gcsScore;
  final int daysPostOnset;
  final String etiology;
  final bool familyVoiceAvailable;
  final bool hasPhotosensitivity;
  final bool activeIcpMonitor;
  final bool hasAutonomicStorming;
  final String? preferredMusic;

  const DocProfile({
    required this.docLevel,
    required this.gcsScore,
    required this.daysPostOnset,
    this.etiology = 'TBI',
    this.familyVoiceAvailable = true,
    this.hasPhotosensitivity = false,
    this.activeIcpMonitor = false,
    this.hasAutonomicStorming = false,
    this.preferredMusic,
  });
}

class DocStimBlock {
  final String label;
  final int durationMin;
  final String modality; // quiet, familiar-voice, auditory, vibroacoustic, gamma-light, tactile-audio
  final double? frequencyHz;
  final String instruction;
  final String rationale;
  final List<String> contraindications;

  const DocStimBlock({
    required this.label,
    required this.durationMin,
    required this.modality,
    this.frequencyHz,
    required this.instruction,
    required this.rationale,
    this.contraindications = const [],
  });
}

class DocStimulationSession {
  final DocProfile profile;
  final List<DocStimBlock> schedule;
  final int totalDurationMin;
  final int sessionsPerDay;
  final String clinicianNote;
  final List<String> safetyWarnings;
  final List<String> familyGuidance;
  final List<String> evidenceReferences;

  const DocStimulationSession({
    required this.profile,
    required this.schedule,
    required this.totalDurationMin,
    required this.sessionsPerDay,
    required this.clinicianNote,
    required this.safetyWarnings,
    required this.familyGuidance,
    required this.evidenceReferences,
  });
}

// ── Notifier ──────────────────────────────────────────────────────

class DocProtocolNotifier extends Notifier<DocStimulationSession?> {
  @override
  DocStimulationSession? build() => null;

  DocStimulationSession generate(DocProfile profile) {
    final schedule = _buildSchedule(profile);
    final total = schedule.fold<int>(0, (s, b) => s + b.durationMin);
    final result = DocStimulationSession(
      profile: profile,
      schedule: schedule,
      totalDurationMin: total,
      sessionsPerDay: _sessionsPerDay(profile),
      clinicianNote: _buildClinicianNote(profile),
      safetyWarnings: _buildSafetyWarnings(profile),
      familyGuidance: _buildFamilyGuidance(profile),
      evidenceReferences: _buildReferences(profile),
    );
    state = result;
    return result;
  }

  // ── Schedule ──

  List<DocStimBlock> _buildSchedule(DocProfile p) {
    switch (p.docLevel) {
      case DocLevel.coma:
        return [
          _block('Baseline Quiet', 5, 'quiet', null,
              'Silence all unnecessary ICU stimuli. Dim lights.',
              'Establishes a sensory baseline. Overstimulation in early coma worsens outcomes.'),
          _block('Familiar Voice — Name + Memory', 10, 'familiar-voice', null,
              'Family reads a personally meaningful narrative. Speak calmly, 60 cm from ear.',
              'Familiar voice elicits stronger cortical response in DOC patients.'),
          _block('Low-Frequency Vibroacoustic', 10, 'vibroacoustic', 40,
              'Apply 40 Hz vibration through mattress transducer pad. Monitor for autonomic response.',
              'Somatosensory stimulation bypasses damaged cortical routes via thalamocortical projections.'),
          _block('Rest + Autonomic Monitoring', 10, 'quiet', null,
              'Complete silence. Monitor HR, RR, BP, pupillary response for 10 minutes.',
              'Post-stimulation window captures delayed cortical responses.'),
        ];
      case DocLevel.vsUws:
        return [
          _block('Environment Calibration', 3, 'quiet', null,
              'Reduce ambient noise to < 45 dB.',
              'Environmental ICU noise masks meaningful stimulation responses.'),
          if (p.familyVoiceAvailable)
            _block('Familiar Voice — Personal Narrative', 8, 'familiar-voice', null,
                'Family reads 3–4 short sentences of a meaningful shared memory.',
                'EEG P300 detected in VS patients responding to own name (Perrin 2006).'),
          _block('Preferred Music — 10 min', 10, 'auditory', null,
              'Play ${p.preferredMusic ?? "patient preferred music"} at 55–60 dB.',
              'Preferred music produces significantly more cortical activation in VS/MCS.'),
          if (!p.hasPhotosensitivity)
            _block('Gamma Light Stimulation (40 Hz)', 10, 'gamma-light', 40,
                'Flickering LED panel at 40 Hz, 30–60 cm from patient.',
                'MIT GENUS protocol: 40 Hz flicker drives gamma via thalamocortical resonance.'),
          _block('Tactile + Auditory Combined', 8, 'tactile-audio', 40,
              'Gentle rhythmic touch (1 Hz) on forearm, synchronized with soft drumbeat.',
              'Cross-modal integration activates more thalamocortical networks.'),
          _block('Rest + Documentation', 9, 'quiet', null,
              'Complete rest. Document CRS-R response checklist.',
              'CRS-R is the gold-standard outcome measure.'),
        ];
      case DocLevel.mcsMinus:
        return [
          _block('Orienting + Name Response', 5, 'familiar-voice', null,
              'Say patient name 3× with 10s intervals. Watch for eye opening, head turn.',
              'CRS-R visual pursuit and auditory localization items.'),
          _block('Preferred Music + Visual Tracking', 12, 'auditory', null,
              'Play ${p.preferredMusic ?? "preferred music"} at 55 dB. Move coloured object across visual field.',
              'Visual pursuit ≥ 2 seconds = MCS criterion.'),
          _block('Binaural Theta (5.5 Hz)', 10, 'auditory', 5.5,
              'Binaural beats at 5.5 Hz through headphones, carrier 220 Hz.',
              'Theta targets thalamocortical binding frequencies for emerging consciousness.'),
          _block('Vibroacoustic — 40 Hz Gamma', 10, 'vibroacoustic', 40,
              '40 Hz vibration to sternum or palms.',
              'Somatosensory gamma entrainment supplements auditory pathways.'),
          _block('Quiet + CRS-R Documentation', 8, 'quiet', null,
              'Rest. Complete CRS-R subscales.',
              'Post-stimulation window may unmask suppressed responses.'),
        ];
      case DocLevel.mcsPlus:
        return [
          _block('Command-Following Calibration', 5, 'familiar-voice', null,
              '"Close your eyes." "Move your right thumb." 3 reps, 15s interval.',
              'CRS-R motor subscale 5–6. Fatigue limits command-following.'),
          _block('Theta + Alpha Entrainment', 15, 'auditory', 8,
              'Binaural beats 8 Hz through headphones. Brown noise background at 45 dB.',
              'Alpha-theta border is associated with early cortical integration.'),
          _block('Familiar Voice — Orientation Narrative', 10, 'familiar-voice', null,
              'Family reads: date, location, reassurance. Ask 2 simple yes/no questions.',
              'Orientation narrative reduces cognitive load in EMCS transition.'),
          _block('Rest + Cognitive Recovery', 15, 'quiet', null,
              'Complete quiet. Dim lights. MCS+ patients experience severe cognitive fatigue.',
              '35% of MCS+ patients fail command following due to fatigue.'),
        ];
      case DocLevel.emcs:
        return [
          _block('Alpha Coherence — Binaural', 20, 'auditory', 10,
              'Alpha binaural beats 10 Hz with quiet ambient nature sounds.',
              'Alpha entrainment supports thalamocortical coherence and sustained attention.'),
          _block('Preferred Music — Active Listening', 15, 'auditory', null,
              'Play ${p.preferredMusic ?? "preferred music"}. Ask patient to indicate recognition.',
              'Music recognition requires hippocampal + prefrontal engagement.'),
          _block('Vibroacoustic Wind-Down', 10, 'vibroacoustic', 40,
              '40 Hz applied to lower back or soles of feet with guided breathing narration.',
              'End-of-session parasympathetic grounding.'),
          _block('Family Engagement + Orientation', 10, 'familiar-voice', null,
              'Unstructured conversation with family. One question per minute maximum.',
              'Social presence maintains limbic arousal between sessions.'),
        ];
      case DocLevel.lockedIn:
        return [
          _block('IMPORTANT: Locked-in — Patient is FULLY CONSCIOUS', 0, 'quiet', null,
              'LiS patients are fully aware. Focus on communication scaffolding.',
              'Locked-in is frequently misdiagnosed as VS/coma.'),
          _block('Communication Channel Verification', 10, 'quiet', null,
              'Confirm yes/no eye-gaze code with patient. Test 3 known-answer questions.',
              'Patient autonomy is paramount.'),
          _block('Patient-Directed Music Session', 20, 'auditory', null,
              'Ask: "Would you like to hear ${p.preferredMusic ?? "your preferred music"}?" Wait for yes.',
              'Autonomy restoration is a primary therapeutic goal in LiS.'),
          _block('Alpha Relaxation — Patient Consent Required', 15, 'auditory', 10,
              'Only if patient communicates willingness: alpha binaural 10 Hz.',
              'Alpha AVS may provide spasticity reduction and autonomic calming.'),
          _block("Rest on Patient's Signal", 10, 'quiet', null,
              'Watch for distress signals. End session whenever patient indicates.',
              'Patient-directed session termination is non-negotiable in LiS.'),
        ];
    }
  }

  DocStimBlock _block(String label, int dur, String mod, double? freq,
      String instr, String rationale,
      [List<String> contra = const []]) {
    return DocStimBlock(
        label: label,
        durationMin: dur,
        modality: mod,
        frequencyHz: freq,
        instruction: instr,
        rationale: rationale,
        contraindications: contra);
  }

  List<String> _buildSafetyWarnings(DocProfile p) {
    final w = <String>[];
    if (p.activeIcpMonitor) w.add('⚠️ ICP monitor present — halt if ICP > 20 mmHg.');
    if (p.hasAutonomicStorming) w.add('⚠️ Paroxysmal sympathetic hyperactivity — reduce intensity by 50%.');
    if (p.hasPhotosensitivity) w.add('⚠️ Photosensitivity — gamma-light flicker is CONTRAINDICATED.');
    if (p.daysPostOnset < 7) w.add('⚠️ < 7 days post-onset — limit to familiar voice only.');
    if (p.gcsScore <= 5) w.add('⚠️ GCS ≤ 5 — sessions must be < 20 minutes.');
    if (p.docLevel == DocLevel.lockedIn) w.add('🔴 Locked-in Syndrome — patient is FULLY CONSCIOUS.');
    w.add('ℹ️ Minimum 4-hour rest interval between sessions.');
    w.add('ℹ️ Discontinue if: sustained HR > 110, SBP > 180, new pupillary asymmetry.');
    return w;
  }

  List<String> _buildFamilyGuidance(DocProfile p) {
    if (p.docLevel == DocLevel.lockedIn) {
      return [
        '🔴 Your family member is FULLY AWAKE AND AWARE.',
        '👁️ We are establishing eye-gaze communication.',
        '📖 Read to them daily. Share news and updates.',
        '🚫 Do NOT discuss prognosis in the room without their communication method.',
      ];
    }
    final base = [
      '📱 Record a 2–3 minute voice message describing a warm shared memory.',
      '🎵 Share a playlist of 5–10 songs from their late teens/early 20s.',
      '🕐 Visit during scheduled session windows.',
      '🤫 Speak softly, move slowly during sessions.',
      '👁️ Watch for any eye movement, finger twitch, facial change. Report everything.',
      '💛 Responses may be delayed by minutes. Lack of immediate response ≠ absence of awareness.',
    ];
    if (p.docLevel == DocLevel.mcsPlus || p.docLevel == DocLevel.emcs) {
      base.add('💬 If they respond, celebrate calmly. Say "I see you, that\'s wonderful."');
    }
    return base;
  }

  String _buildClinicianNote(DocProfile p) {
    final level = switch (p.docLevel) {
      DocLevel.coma => 'Deep coma — subcortical-only stimulation',
      DocLevel.vsUws => 'Vegetative/UWS — full multimodal protocol',
      DocLevel.mcsMinus => 'MCS- — binaural theta + music + tactile',
      DocLevel.mcsPlus => 'MCS+ — theta/alpha entrainment + orientation',
      DocLevel.emcs => 'EMCS — alpha coherence + family engagement',
      DocLevel.lockedIn => 'Locked-in — FULLY CONSCIOUS; communication scaffolding only',
    };
    return '$level. GCS ${p.gcsScore}, day ${p.daysPostOnset} post-onset (${p.etiology}).';
  }

  int _sessionsPerDay(DocProfile p) => switch (p.docLevel) {
        DocLevel.coma => 3,
        DocLevel.vsUws => 4,
        DocLevel.mcsMinus => 3,
        DocLevel.mcsPlus => 2,
        DocLevel.emcs => 2,
        DocLevel.lockedIn => 1,
      };

  List<String> _buildReferences(DocProfile p) {
    final refs = [
      'Giacino JT et al. (2002). The minimally conscious state. Neurology. 58(3):349–353.',
      'Owen AM et al. (2006). Detecting awareness in the vegetative state. Science. 313(5792):1402.',
      'Schiff ND. (2010). Recovery of consciousness after brain injury. Prog Brain Res. 177:579–593.',
      'Perrin F et al. (2006). Brain response to one\'s own name in vegetative state. Neuroreport.',
      'Skille O. (1989). Vibroacoustic therapy. Music Therapy. 8(1):61–77.',
    ];
    if (!p.hasPhotosensitivity) {
      refs.add('Iaccarino HF et al. (2016). Gamma frequency entrainment. Nature. 540(7632):230–235.');
    }
    if (p.docLevel == DocLevel.lockedIn) {
      refs.add('Bruno MA et al. (2011). Well-being in chronic locked-in syndrome. BMJ Open. 1(1).');
    }
    return refs;
  }
}

final docProtocolProvider =
    NotifierProvider<DocProtocolNotifier, DocStimulationSession?>(() {
  return DocProtocolNotifier();
});
