/// Pet Auditory Service — procedural bioacoustic therapy soundscapes.
///
/// Flutter parity with Angular `pet-auditory.service.ts` (484 lines).
/// Note: Web Audio API is not available in Flutter natively.
/// This service provides the data model and playback state management.
/// Actual audio synthesis will be handled by platform channels or
/// a Flutter audio plugin (e.g. `just_audio`, `flutter_soloud`).
///
/// Modes: Feline purr (25Hz), Canine heartbeat (60 BPM), 
/// Cetacean therapy (whistles + clicks), Avian therapy (forest soundscape).
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';

enum PetAudioMode { feline, canine, cetacean, avian }

class PetAudioState {
  final bool isPlaying;
  final PetAudioMode? activeMode;
  final bool isListening; // wake-word STT active

  const PetAudioState({
    this.isPlaying = false,
    this.activeMode,
    this.isListening = false,
  });

  PetAudioState copyWith({
    bool? isPlaying,
    PetAudioMode? activeMode,
    bool? isListening,
  }) => PetAudioState(
    isPlaying: isPlaying ?? this.isPlaying,
    activeMode: activeMode ?? this.activeMode,
    isListening: isListening ?? this.isListening,
  );
}

/// Audio synthesis parameters per mode for platform channel implementation.
class PetAudioParams {
  final String modeName;
  final double baseFrequencyHz;
  final String oscillatorType;
  final double modulationFrequencyHz;
  final double masterGain;
  final String description;

  const PetAudioParams({
    required this.modeName,
    required this.baseFrequencyHz,
    required this.oscillatorType,
    required this.modulationFrequencyHz,
    required this.masterGain,
    required this.description,
  });
}

const petAudioParams = <PetAudioMode, PetAudioParams>{
  PetAudioMode.feline: PetAudioParams(
    modeName: 'Feline Purr',
    baseFrequencyHz: 25,
    oscillatorType: 'sawtooth',
    modulationFrequencyHz: 1.5,
    masterGain: 0.4,
    description: 'Low-frequency purr (25-50Hz). Therapeutic for cats and calming for humans.',
  ),
  PetAudioMode.canine: PetAudioParams(
    modeName: 'Canine Heartbeat',
    baseFrequencyHz: 45,
    oscillatorType: 'sine',
    modulationFrequencyHz: 1.0, // 60 BPM
    masterGain: 0.8,
    description: 'Rhythmic heartbeat at 60 BPM. Soothing for dogs during storms or separation.',
  ),
  PetAudioMode.cetacean: PetAudioParams(
    modeName: 'Cetacean Therapy',
    baseFrequencyHz: 60,
    oscillatorType: 'sine',
    modulationFrequencyHz: 0.15, // slow ambient modulation
    masterGain: 0.08,
    description: 'Deep ocean drone with procedural dolphin whistles and echolocation clicks.',
  ),
  PetAudioMode.avian: PetAudioParams(
    modeName: 'Avian Therapy',
    baseFrequencyHz: 80,
    oscillatorType: 'sine',
    modulationFrequencyHz: 0.1,
    masterGain: 0.03,
    description: 'Forest ambient soundscape with crow, parrot, and falcon calls.',
  ),
};

class PetAuditoryNotifier extends Notifier<PetAudioState> {
  @override
  PetAudioState build() => const PetAudioState();

  void playFelinePurr() {
    state = const PetAudioState(isPlaying: true, activeMode: PetAudioMode.feline);
  }

  void playCanineHeartbeat() {
    state = const PetAudioState(isPlaying: true, activeMode: PetAudioMode.canine);
  }

  void playCetaceanTherapy() {
    state = const PetAudioState(isPlaying: true, activeMode: PetAudioMode.cetacean);
  }

  void playAvianTherapy() {
    state = const PetAudioState(isPlaying: true, activeMode: PetAudioMode.avian);
  }

  void stop() {
    state = const PetAudioState();
  }

  void toggleWakeWordListening() {
    state = state.copyWith(isListening: !state.isListening);
  }
}

final petAuditoryProvider =
    NotifierProvider<PetAuditoryNotifier, PetAudioState>(() {
  return PetAuditoryNotifier();
});
