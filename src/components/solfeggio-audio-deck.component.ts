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
    <div class="relative w-full mb-8 p-5 sm:p-7 bg-[#F9F3D9] dark:bg-zinc-950 text-[#1C1C1C] dark:text-zinc-100 rounded-2xl border-2 border-[#F6B12B] dark:border-[#F6B12B]/80 shadow-[4px_6px_0px_0px_rgba(28,28,28,0.85)] font-mono overflow-hidden pocket-gull-card">
      
      <!-- Background Texture & Papercraft Overlay -->
      <div class="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:12px_12px]"></div>

      <!-- Top Bar Header -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-[#1C1C1C]/20 dark:border-zinc-800 pb-5 mb-6">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-[#F6B12B] text-zinc-950 border-2 border-[#1C1C1C] flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_rgba(28,28,28,0.9)] animate-bounce shrink-0">
            🎵
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-extrabold uppercase tracking-widest text-[#EF6658] dark:text-orange-400">Avian Audio Entrainment</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#F6B12B] text-zinc-950 font-bold tracking-wider uppercase border border-[#1C1C1C]">
                Swoop ⚡ Dispatch
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 border border-[#1C1C1C] uppercase">
                Web Audio Synthesizer
              </span>
            </div>
            <h3 class="text-base sm:text-lg font-black uppercase tracking-tight text-[#1C1C1C] dark:text-zinc-100 mt-1">
              Polyphonic Solfeggio & AVS Brainwave Frequency Deck
            </h3>
            <p class="text-xs sm:text-sm text-[#1C1C1C]/70 dark:text-zinc-400 mt-0.5 font-sans leading-relaxed">
              Select therapeutic sound frequencies to stimulate parasympathetic vagal tone and entrain cortical oscillations.
            </p>
          </div>
        </div>

        <!-- Master Playback Control Button -->
        <button (click)="togglePlay()"
          [class]="isPlaying()
            ? 'px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer border-2 border-[#1C1C1C] shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] flex items-center gap-2'
            : 'px-5 py-3 rounded-xl bg-[#F6B12B] text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider transition hover:scale-105 active:scale-95 cursor-pointer border-2 border-[#1C1C1C] shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] flex items-center gap-2'">
          <span>{{ isPlaying() ? '⏸ Stop Audio Deck' : '▶ Play Selected Frequency' }}</span>
        </button>
      </div>

      <!-- Frequency Preset Cards Grid -->
      <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        @for (item of presetFrequencies; track item.freqHz) {
          <div (click)="selectFrequency(item)"
            [class]="selectedFreq().freqHz === item.freqHz
              ? 'p-5 rounded-2xl bg-[#F6B12B] text-zinc-950 border-2 border-[#1C1C1C] cursor-pointer transition shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)]'
              : 'p-5 rounded-2xl bg-[#FFFFFF] dark:bg-zinc-900 border-2 border-[#1C1C1C] text-[#1C1C1C] dark:text-zinc-100 hover:bg-[#F6B12B]/20 cursor-pointer transition shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] sub-panel'">
            
            <div class="flex items-center justify-between mb-2">
              <span class="text-2xl">{{ item.emoji }}</span>
              <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-white text-zinc-950 border border-[#1C1C1C] uppercase font-mono">
                {{ item.freqHz }} Hz
              </span>
            </div>

            <h4 class="text-xs font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-tight font-mono mb-1">{{ item.name }}</h4>
            <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 font-sans leading-relaxed">
              {{ item.description }}
            </p>
          </div>
        }
      </div>

      <!-- Volume & Oscillator Controls -->
      <div class="relative z-10 p-5 rounded-2xl border-2 border-[#1C1C1C] bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] sub-panel">
        <div class="flex items-center gap-3">
          <label for="solfeggio-volume-slider" class="text-[#1C1C1C] dark:text-zinc-200 uppercase tracking-widest text-xs font-black">Volume Level:</label>
          <input id="solfeggio-volume-slider" name="solfeggioVolume" aria-label="Solfeggio Harmonic Audio Volume Level" type="range" min="0" max="100" step="5" [value]="volumePercent()" (input)="setVolume($event)"
            class="w-36 h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1C1C1C] border border-[#1C1C1C]" />
          <span class="text-orange-600 dark:text-orange-400 font-black text-xs">{{ volumePercent() }}%</span>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-[#1C1C1C]/70 dark:text-zinc-400 uppercase tracking-widest text-xs font-bold">Active Sound Status:</span>
          @if (isPlaying()) {
            <span class="text-orange-700 dark:text-orange-400 font-black animate-pulse flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              Synthesizing {{ selectedFreq().freqHz }} Hz Sine Wave...
            </span>
          } @else {
            <span class="text-[#1C1C1C]/60 dark:text-zinc-400 font-bold">Standby Mode</span>
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
