import { Component, ChangeDetectionStrategy, signal, computed, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export interface ISolfeggioFrequency {
  freqHz: number;
  name: string;
  category: 'Cellular DNA' | 'Vagal Tone' | 'Grounding' | 'Gamma Entrainment' | 'Deep Sleep';
  description: string;
  emoji: string;
}

@Component({
  selector: 'app-solfeggio-audio-deck',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-mono relative overflow-hidden">
      
      <!-- Top Bar Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
            <h3 class="text-xs font-black uppercase tracking-widest text-zinc-100">
              🔊 Polyphonic Solfeggio & AVS Brainwave Frequency Deck
            </h3>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800 uppercase">
              Web Audio Synthesizer
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-mono">
            Select therapeutic sound frequencies to stimulate parasympathetic vagal tone and entrain cortical oscillations.
          </p>
        </div>

        <!-- Master Playback Control Button -->
        <button (click)="togglePlay()"
          [class]="isPlaying()
            ? 'px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-rose-400/30 flex items-center gap-2 shadow-md'
            : 'px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50 flex items-center gap-2 shadow-md'">
          <span>{{ isPlaying() ? '⏸ Stop Audio Deck' : '▶ Play Selected Frequency' }}</span>
        </button>
      </div>

      <!-- Frequency Preset Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        @for (item of presetFrequencies; track item.freqHz) {
          <div (click)="selectFrequency(item)"
            [class]="selectedFreq().freqHz === item.freqHz
              ? 'p-4 rounded-2xl bg-zinc-900 border-2 border-orange-500 cursor-pointer transition shadow-md'
              : 'p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition'">
            
            <div class="flex items-center justify-between mb-2">
              <span class="text-xl">{{ item.emoji }}</span>
              <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-950 text-orange-400 border border-zinc-800 uppercase font-mono">
                {{ item.freqHz }} Hz
              </span>
            </div>

            <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-tight font-mono mb-1">{{ item.name }}</h4>
            <p class="text-[11px] text-zinc-400 font-sans leading-relaxed">
              {{ item.description }}
            </p>
          </div>
        }
      </div>

      <!-- Volume & Oscillator Controls (Braun Industrial Instrument Style) -->
      <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div class="flex items-center gap-3">
          <label for="solfeggio-volume-slider" class="text-zinc-400 uppercase tracking-widest text-[10px]">Volume Level:</label>
          <input id="solfeggio-volume-slider" name="solfeggioVolume" aria-label="Solfeggio Harmonic Audio Volume Level" type="range" min="0" max="100" step="5" [value]="volumePercent()" (input)="setVolume($event)"
            class="w-32 h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-zinc-800" />
          <span class="text-orange-400 font-bold text-[11px]">{{ volumePercent() }}%</span>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-zinc-400 uppercase tracking-widest text-[10px]">Active Sound Status:</span>
          @if (isPlaying()) {
            <span class="text-orange-400 font-bold animate-pulse flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-orange-500"></span>
              Synthesizing {{ selectedFreq().freqHz }} Hz Sine Wave...
            </span>
          } @else {
            <span class="text-zinc-500 font-bold">Standby Mode</span>
          }
        </div>
      </div>

    </div>
  `
})
export class SolfeggioAudioDeckComponent implements OnDestroy {
  patientState = inject(PatientStateService);

  presetFrequencies: ISolfeggioFrequency[] = [
    {
      freqHz: 528,
      name: '528 Hz Solfeggio Transformation',
      category: 'Cellular DNA',
      description: 'Promotes vagal tone, reduces cortisol, and supports cellular DNA integrity.',
      emoji: '🧬'
    },
    {
      freqHz: 432,
      name: '432 Hz Earth Natural Harmonic',
      description: 'Resonates with natural biological frequency, inducing deep emotional tranquility.',
      category: 'Grounding',
      emoji: '🌿'
    },
    {
      freqHz: 40,
      name: '40 Hz Gamma Entrainment',
      description: 'Entrains prefrontal cortex to clear parenchymal glymphatic waste and boost focus.',
      category: 'Gamma Entrainment',
      emoji: '⚡'
    },
    {
      freqHz: 7.83,
      name: '7.83 Hz Schumann Resonance',
      description: 'Matches fundamental geomagnetic frequency, anchoring Vata and calming anxiety.',
      category: 'Vagal Tone',
      emoji: '🌍'
    }
  ];

  selectedFreq = signal<ISolfeggioFrequency>(this.presetFrequencies[0]);
  isPlaying = signal<boolean>(false);
  volumePercent = signal<number>(40);

  private audioCtx: AudioContext | null = null;
  private oscNode: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  selectFrequency(item: ISolfeggioFrequency) {
    this.selectedFreq.set(item);
    if (this.isPlaying()) {
      this.stopSynth();
      this.startSynth();
    }
  }

  togglePlay() {
    if (this.isPlaying()) {
      this.stopSynth();
    } else {
      this.startSynth();
    }
  }

  setVolume(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.volumePercent.set(val);
    if (this.gainNode) {
      this.gainNode.gain.value = (val / 100) * 0.15;
    }
  }

  private startSynth() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();
      this.oscNode = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      this.oscNode.type = 'sine';
      this.oscNode.frequency.value = this.selectedFreq().freqHz;

      this.gainNode.gain.value = (this.volumePercent() / 100) * 0.15;

      this.oscNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscNode.start();
      this.isPlaying.set(true);
    } catch (e) {
      console.error('Audio synthesis failed:', e);
    }
  }

  private stopSynth() {
    if (this.oscNode) {
      try {
        this.oscNode.stop();
        this.oscNode.disconnect();
      } catch (e) {}
      this.oscNode = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
    this.isPlaying.set(false);
  }

  ngOnDestroy() {
    this.stopSynth();
  }
}
