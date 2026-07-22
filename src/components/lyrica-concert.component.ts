import {
  Component, ChangeDetectionStrategy, signal, computed, inject,
  ElementRef, viewChild, OnDestroy, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IConcertAct {
  actNumber: number;
  actTitle: string;
  subtitle: string;
  solfeggioFreq: number;
  binauralBeatHz: number;
  waveType: 'Alpha' | 'Theta' | 'Gamma' | 'Delta';
  durationSeconds: number;
  themeColor: string; // Tailwind glow / accent color
  bgGradient: string;
  lyricaAffirmation: string;
  visualStyleName: 'Oceanic Hydrodynamics' | 'Bioluminescent DNA Helix' | 'Aurora Borealis Prism' | 'Golden Supernova Mandala';
}

@Component({
  selector: 'app-lyrica-concert',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }
    .poster-glow {
      animation: pulseGlow 4s ease-in-out infinite;
    }
    @keyframes textGlow {
      0%, 100% { text-shadow: 0 0 10px rgba(168,85,247,0.5), 0 0 20px rgba(99,102,241,0.3); }
      50% { text-shadow: 0 0 20px rgba(168,85,247,0.9), 0 0 40px rgba(99,102,241,0.6); }
    }
    .concert-title-glow {
      animation: textGlow 3s ease-in-out infinite;
    }
  `],
  template: `
    <div class="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.2)] font-mono text-zinc-100 relative overflow-hidden">
      
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl text-purple-300">
            🎤
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold uppercase tracking-tight text-purple-200">
                Lyrica: Generative Healing Concert & Live Tour
              </h3>
              <span class="text-[9.5px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                4-Act Solfeggio Symphony
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-sans mt-0.5">
              Immersive 4-Act soundscape concert, generative music video, and printable VIP tour poster for <strong>{{ activePatientName() }}</strong>.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button (click)="isPosterModalOpen.set(true)"
            class="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 text-purple-300 border border-purple-500/40 text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5">
            <span>🎟️</span>
            <span>VIP Tour Poster & Ticket</span>
          </button>
          
          <button (click)="isMusicVideoOpen.set(true)"
            class="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5">
            <span>🎬</span>
            <span>Generative Music Video</span>
          </button>
        </div>
      </div>

      <!-- Concert Player Controller Card -->
      @let currentAct = setlist[activeActIndex()];

      <div class="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 relative z-10">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-purple-400 block">Currently Performing</span>
            <h4 class="text-lg font-bold text-white font-sans mt-0.5 flex items-center gap-2">
              <span>Act {{ currentAct.actNumber }}: {{ currentAct.actTitle }}</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {{ currentAct.solfeggioFreq }} Hz Solfeggio
              </span>
            </h4>
            <p class="text-xs text-zinc-400 font-sans mt-1">
              {{ currentAct.subtitle }} &bull; <strong class="text-indigo-300">{{ currentAct.waveType }} Wave ({{ currentAct.binauralBeatHz }} Hz)</strong>
            </p>
          </div>

          <!-- Concert Play / Pause / Skip Controls -->
          <div class="flex items-center gap-2">
            <button (click)="prevAct()"
              class="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer border border-zinc-700 active:scale-95"
              title="Previous Act">
              ⏮
            </button>

            @if (!isPlaying()) {
              <button (click)="startConcert()"
                class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95">
                <span>▶ Start Concert</span>
              </button>
            } @else {
              <button (click)="stopConcert()"
                class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95">
                <span>⏸ Pause Concert</span>
              </button>
            }

            <button (click)="nextAct()"
              class="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer border border-zinc-700 active:scale-95"
              title="Next Act">
              ⏭
            </button>
          </div>
        </div>

        <!-- 4-Act Setlist Timeline Progress -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          @for (act of setlist; track act.actNumber; let idx = $index) {
            <button (click)="selectAct(idx)"
              [class.border-purple-500]="activeActIndex() === idx"
              [class.bg-purple-950\/30]="activeActIndex() === idx"
              [class.border-zinc-800]="activeActIndex() !== idx"
              [class.bg-zinc-950\/60]="activeActIndex() !== idx"
              class="p-3 rounded-xl border text-left transition cursor-pointer hover:border-purple-400/50 group active:scale-95">
              
              <div class="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold mb-1">
                <span [class.text-purple-300]="activeActIndex() === idx" [class.text-zinc-500]="activeActIndex() !== idx">
                  Act {{ act.actNumber }}
                </span>
                <span class="text-zinc-400 font-mono">{{ act.solfeggioFreq }}Hz</span>
              </div>

              <h5 class="text-xs font-bold text-zinc-200 group-hover:text-purple-300 transition-colors truncate">
                {{ act.actTitle }}
              </h5>

              <span class="text-[9.5px] text-zinc-400 block mt-1">
                {{ act.waveType }} ({{ act.binauralBeatHz }}Hz)
              </span>
            </button>
          }
        </div>

        <!-- Active Spoken Affirmation Display -->
        <div class="p-4 rounded-xl bg-zinc-950 border border-purple-500/20 relative overflow-hidden">
          <div class="flex items-center justify-between text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">
            <span class="flex items-center gap-1.5 text-purple-300">
              <span>🎤</span> Spoken Lyrica Concert Lyric
            </span>
            <span class="text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Visualizer Active: {{ currentAct.visualStyleName }}
            </span>
          </div>

          <p class="text-sm italic text-purple-200 font-sans leading-relaxed">
            "{{ currentAct.lyricaAffirmation }}"
          </p>
        </div>

      </div>

      <!-- MODAL 1: VIP CONCERT POSTER & TICKET -->
      @if (isPosterModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div class="bg-zinc-950 border-2 border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-zinc-100 shadow-[0_0_50px_rgba(168,85,247,0.3)] font-mono relative my-8">
            
            <button (click)="isPosterModalOpen.set(false)"
              class="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition">
              ✕
            </button>

            <!-- Poster Header Artwork & Generative Cover Art -->
            <div class="text-center border-b border-purple-500/30 pb-6 mb-6 space-y-3">
              <span class="text-[10px] font-bold uppercase tracking-[0.4em] text-purple-400 block">Pocket-Gull Generative Concert & Album Series</span>
              
              <!-- Generative Album Cover Art Preview Badge -->
              <div class="w-48 h-48 mx-auto my-3 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-950 to-zinc-950 border-2 border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex flex-col items-center justify-center relative overflow-hidden group">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent animate-pulse"></div>
                <span class="text-5xl mb-1 animate-spin" style="animation-duration: 20s;">☸️</span>
                <span class="text-[9px] font-mono font-bold uppercase tracking-widest text-purple-300 relative z-10">Bioluminescent Lotus Cover</span>
                <span class="text-[8px] font-mono text-zinc-400 relative z-10">528Hz Solfeggio Resonator</span>
              </div>

              <h1 class="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white concert-title-glow font-sans">
                {{ activePatientName() }}
              </h1>
              <p class="text-sm font-bold text-purple-300 tracking-widest uppercase">THE RECOVERY WORLD TOUR: LIVE IN HEALING CONCERT</p>
              <p class="text-xs text-zinc-400 font-sans">Venue: Pocket-Gull Mind-State Arena &bull; Target Frequencies: 174Hz – 963Hz Solfeggio</p>
            </div>

            <!-- Official Album Liner Notes -->
            <div class="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 mb-6 font-sans text-xs">
              <h4 class="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-2">
                <span>📖</span> Official Album Liner Notes & Clinical Credits
              </h4>
              <p class="text-zinc-300 leading-relaxed mb-2">
                <strong>Executive Producer:</strong> Google Gemini 2.5 Clinical Intelligence Engine<br>
                <strong>Lead Vocalist & Beneficiary:</strong> {{ activePatientName() }}<br>
                <strong>Acoustic Architecture:</strong> 528 Hz transformation carrier waves, 432 Hz prefrontal gamma entrainment, and 639 Hz Shen heart-anchoring sonnets.
              </p>
              <p class="text-zinc-400 text-[11px] italic leading-normal border-t border-purple-500/20 pt-2">
                "Engineered for daily autonomic co-regulation, vagal tone activation, and multi-generational family healthspan."
              </p>
            </div>

            <!-- Setlist Program -->
            <div class="space-y-3 mb-6">
              <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-1">Official Concert Program & Setlist</h4>
              @for (act of setlist; track act.actNumber) {
                <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span class="text-purple-400 font-bold">Act {{ act.actNumber }}: {{ act.actTitle }}</span>
                    <p class="text-[11px] text-zinc-400 font-sans">{{ act.subtitle }}</p>
                  </div>
                  <span class="text-indigo-300 font-bold">{{ act.solfeggioFreq }}Hz</span>
                </div>
              }
            </div>

            <!-- VIP Ticket Stub & QR Pass -->
            <div class="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-zinc-900 to-indigo-950 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <span class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">VIP Clinical Access Ticket</span>
                <span class="text-sm font-bold text-white block font-sans">PASS HOLDER: {{ activePatientName() }}</span>
                <span class="text-[10px] text-zinc-400 block font-mono">PASS ID: PKT-CLINICAL-{{ activePatientId() }} &bull; SEAT: VIP ROW 1, SEAT 432</span>
              </div>

              <!-- Ticket Badge -->
              <div class="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-center shrink-0">
                <span class="text-xs font-bold text-purple-300 block">ADMIT ONE</span>
                <span class="text-[9px] text-zinc-400 block">FULL CONCERT PASS</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button (click)="saveAlbumArtToRecord()"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-emerald-400/40">
                <span>📌</span> Save Album Art & Liner Notes to Record
              </button>

              <button (click)="isPosterModalOpen.set(false)"
                class="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer">
                Close Ticket & Poster
              </button>
            </div>

          </div>
        </div>
      }

      <!-- MODAL 2: GENERATIVE MUSIC VIDEO CANVAS -->
      @if (isMusicVideoOpen()) {
        <div class="fixed inset-0 z-50 flex flex-col bg-black text-white font-mono animate-in fade-in duration-300">
          
          <!-- Music Video Top Control Bar -->
          <div class="p-4 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between shrink-0 z-20">
            <div class="flex items-center gap-3">
              <span class="text-red-500 animate-pulse text-sm">🔴 LIVE MUSIC VIDEO</span>
              <div>
                <h4 class="text-sm font-bold text-white font-sans uppercase">
                  {{ activePatientName() }} &bull; Act {{ currentAct.actNumber }}: {{ currentAct.actTitle }}
                </h4>
                <span class="text-xs text-purple-300 font-mono">
                  Visualizer: {{ currentAct.visualStyleName }} ({{ currentAct.solfeggioFreq }}Hz)
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button (click)="toggleConcertFromVideo()"
                class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase transition">
                {{ isPlaying() ? '⏸ Pause' : '▶ Play' }}
              </button>
              <button (click)="isMusicVideoOpen.set(false)"
                class="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase transition">
                ✕ Exit Video
              </button>
            </div>
          </div>

          <!-- Fullscreen Generative Canvas Container -->
          <div class="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
            
            <!-- Canvas Visualizer Element -->
            <canvas #visualizerCanvas class="w-full h-full object-cover absolute inset-0 z-0"></canvas>

            <!-- Overlay Lyric Karaoke Teleprompter -->
            <div class="absolute bottom-12 left-6 right-6 z-10 text-center max-w-3xl mx-auto p-6 rounded-3xl bg-black/60 backdrop-blur-md border border-purple-500/30 shadow-2xl">
              <span class="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-2">Concert Lyrica Teleprompter</span>
              <p class="text-lg sm:text-2xl font-bold italic text-purple-100 font-sans leading-relaxed concert-title-glow">
                "{{ currentAct.lyricaAffirmation }}"
              </p>
            </div>

          </div>

        </div>
      }

    </div>
  `
})
export class LyricaConcertComponent implements OnDestroy {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  isPosterModalOpen = signal<boolean>(false);
  isMusicVideoOpen = signal<boolean>(false);
  isPlaying = signal<boolean>(false);
  activeActIndex = signal<number>(0);

  visualizerCanvas = viewChild<ElementRef<HTMLCanvasElement>>('visualizerCanvas');

  // Web Audio Context & Oscillators
  private audioContext: AudioContext | null = null;
  private solfeggioOsc: OscillatorNode | null = null;
  private binauralOsc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private canvasAnimFrame: number | null = null;

  setlist: IConcertAct[] = [
    {
      actNumber: 1,
      actTitle: 'Opening Overture: Somatic Grounding',
      subtitle: 'Somatic Anesthetic & Neural De-escalation',
      solfeggioFreq: 174,
      binauralBeatHz: 10,
      waveType: 'Alpha',
      durationSeconds: 300,
      themeColor: 'indigo',
      bgGradient: 'from-indigo-950 via-zinc-900 to-black',
      lyricaAffirmation: 'My body releases all stored tension. In this sanctuary, every breath restores safety.',
      visualStyleName: 'Oceanic Hydrodynamics'
    },
    {
      actNumber: 2,
      actTitle: 'Core Healing: Cellular Regeneration',
      subtitle: 'DNA Repair & Nitric Oxide Biosynthesis',
      solfeggioFreq: 528,
      binauralBeatHz: 6,
      waveType: 'Theta',
      durationSeconds: 420,
      themeColor: 'emerald',
      bgGradient: 'from-emerald-950 via-zinc-900 to-black',
      lyricaAffirmation: 'My cells resonate with vitality. Every organ vibrates in harmonious, vibrant health.',
      visualStyleName: 'Bioluminescent DNA Helix'
    },
    {
      actNumber: 3,
      actTitle: 'Synaptic Flow: Vagal Awakening',
      subtitle: 'HRV Baroreflex Alignment & Synaptic Plasticity',
      solfeggioFreq: 741,
      binauralBeatHz: 40,
      waveType: 'Gamma',
      durationSeconds: 360,
      themeColor: 'amber',
      bgGradient: 'from-amber-950 via-zinc-900 to-black',
      lyricaAffirmation: 'My mind is clear, light, and unburdened. Wisdom and inspiration flow effortlessly through me.',
      visualStyleName: 'Aurora Borealis Prism'
    },
    {
      actNumber: 4,
      actTitle: 'Encore: Crown Synchronization',
      subtitle: 'Restorative Sleep & Cosmic Integration',
      solfeggioFreq: 963,
      binauralBeatHz: 2,
      waveType: 'Delta',
      durationSeconds: 480,
      themeColor: 'purple',
      bgGradient: 'from-purple-950 via-zinc-900 to-black',
      lyricaAffirmation: 'I am whole, radiant, and fully restored. Pure peace fills every cell of my being.',
      visualStyleName: 'Golden Supernova Mandala'
    }
  ];

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  activePatientId = computed(() => {
    return this.patientManagement.selectedPatientId() || 'DARWIN-001';
  });

  constructor() {
    // Start canvas animation loop when music video opens
    effect(() => {
      if (this.isMusicVideoOpen()) {
        setTimeout(() => this.startCanvasVisualizer(), 100);
      } else {
        if (this.canvasAnimFrame) cancelAnimationFrame(this.canvasAnimFrame);
      }
    });
  }

  ngOnDestroy() {
    this.stopConcert();
    if (this.canvasAnimFrame) cancelAnimationFrame(this.canvasAnimFrame);
  }

  selectAct(idx: number) {
    this.activeActIndex.set(idx);
    if (this.isPlaying()) {
      this.playActSynth(this.setlist[idx]);
    }
  }

  nextAct() {
    const nextIdx = (this.activeActIndex() + 1) % this.setlist.length;
    this.selectAct(nextIdx);
  }

  prevAct() {
    const prevIdx = (this.activeActIndex() - 1 + this.setlist.length) % this.setlist.length;
    this.selectAct(prevIdx);
  }

  startConcert() {
    this.isPlaying.set(true);
    this.playActSynth(this.setlist[this.activeActIndex()]);
  }

  stopConcert() {
    this.isPlaying.set(false);
    this.stopSynth();
  }

  toggleConcertFromVideo() {
    if (this.isPlaying()) {
      this.stopConcert();
    } else {
      this.startConcert();
    }
  }

  private playActSynth(act: IConcertAct) {
    this.stopSynth();
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master Gain
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      this.gainNode.connect(this.audioContext.destination);

      // Solfeggio Carrier Oscillator
      this.solfeggioOsc = this.audioContext.createOscillator();
      this.solfeggioOsc.type = 'sine';
      this.solfeggioOsc.frequency.setValueAtTime(act.solfeggioFreq, this.audioContext.currentTime);
      this.solfeggioOsc.connect(this.gainNode);
      this.solfeggioOsc.start();

      // Binaural Beat Difference Oscillator
      this.binauralOsc = this.audioContext.createOscillator();
      this.binauralOsc.type = 'sine';
      this.binauralOsc.frequency.setValueAtTime(act.solfeggioFreq + act.binauralBeatHz, this.audioContext.currentTime);
      this.binauralOsc.connect(this.gainNode);
      this.binauralOsc.start();

      // Spoken Lyrica Affirmation via Speech Synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(act.lyricaAffirmation);
        utterance.rate = 0.92;
        utterance.pitch = 1.02;
        window.speechSynthesis.speak(utterance);
      }

    } catch (e) {
      console.warn('[Lyrica Concert Audio Error]', e);
    }
  }

  private stopSynth() {
    if (this.solfeggioOsc) {
      try { this.solfeggioOsc.stop(); } catch {}
      this.solfeggioOsc = null;
    }
    if (this.binauralOsc) {
      try { this.binauralOsc.stop(); } catch {}
      this.binauralOsc = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  private startCanvasVisualizer() {
    if (!this.isMusicVideoOpen()) return;
    const canvasEl = this.visualizerCanvas();
    if (!canvasEl) return;
    const canvas = canvasEl.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let angle = 0;

    const render = () => {
      if (!this.isMusicVideoOpen()) return;

      const act = this.setlist[this.activeActIndex()];
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Dark background trailing wash
      ctx.fillStyle = 'rgba(5, 5, 10, 0.2)';
      ctx.fillRect(0, 0, width, height);

      angle += 0.008;

      // Primary color themes per act
      const primaryColor = act.actNumber === 1 ? '#6366f1' : (act.actNumber === 2 ? '#34d399' : (act.actNumber === 3 ? '#fbbf24' : '#c084fc'));
      const secondaryColor = act.actNumber === 1 ? '#a855f7' : (act.actNumber === 2 ? '#10b981' : (act.actNumber === 3 ? '#f59e0b' : '#ec4899'));

      // Render 12-fold Generative Mandala Cover Art Petals
      const petalRings = [180, 130, 80, 45];
      petalRings.forEach((radius, ringIdx) => {
        const petalCount = 12 + ringIdx * 4;
        const ringRotation = angle * (ringIdx % 2 === 0 ? 1 : -1);

        for (let i = 0; i < petalCount; i++) {
          const theta = (i * 2 * Math.PI) / petalCount + ringRotation;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(theta);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(radius / 2, radius / 2, 0, radius);
          ctx.quadraticCurveTo(-radius / 2, radius / 2, 0, 0);

          ctx.fillStyle = ringIdx % 2 === 0 ? primaryColor : secondaryColor;
          ctx.globalAlpha = 0.2 + 0.15 * Math.sin(angle * 4 + ringIdx);
          ctx.fill();

          ctx.strokeStyle = ringIdx % 2 === 0 ? secondaryColor : primaryColor;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.7;
          ctx.stroke();

          ctx.restore();
        }
      });

      // Central Pulsing Solfeggio Core
      const corePulse = 25 + 8 * Math.sin(angle * 6);
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, corePulse * 2.5);
      coreGlow.addColorStop(0, '#ffffff');
      coreGlow.addColorStop(0.4, primaryColor);
      coreGlow.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(cx, cy, corePulse, 0, 2 * Math.PI);
      ctx.fillStyle = coreGlow;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      // Outer Pulsing Wave Ring
      ctx.beginPath();
      ctx.arc(cx, cy, 220 + 15 * Math.sin(angle * 2), 0, 2 * Math.PI);
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([6, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      this.canvasAnimFrame = requestAnimationFrame(render);
    };

    render();
  }

  saveAlbumArtToRecord() {
    const patientName = this.activePatientName();
    const noteText = `🎨 Generative Album Cover Art & Tour Liner Notes Saved: "Actuarial Glee: 12-Track Duet & Solfeggio Symphony" (Lead Artist: ${patientName}). Includes Bioluminescent Lotus Cover Art, 528 Hz transformation acoustics, and VIP Tour Poster Credits.`;
    this.patientState.addClinicalNote({
      id: `album-art-${Date.now()}`,
      text: noteText,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`🎨 Saved Generative Album Cover Art & Concert Liner Notes to ${patientName}'s active medical record!`);
  }
}
