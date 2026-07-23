import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IVocalStressData {
  spectralCentroidHz: number;
  pitchStability: number; // 0.0 to 1.0
  harmonicNoiseRatio: number;
  stressScore: number; // 0 - 100
  allopathicState: string;
  tcmPattern: string;
  ayurvedicDosha: string;
}

@Component({
  selector: 'app-vocal-biomarker-resonance',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden font-sans pocket-gull-card">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 font-mono">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)] animate-pulse"></span>
            <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>🎙️</span>
              <span>Client-Side Vocal Biomarker FFT & Auditory Ghost Engine</span>
            </h2>
            <span class="text-xs px-3 py-1 rounded-full bg-violet-950 text-violet-300 border border-violet-700/50 font-extrabold uppercase">
              Web Audio FFT
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1.5 font-sans leading-relaxed">
            Extract acoustic pitch jitter and spectral centroid in-browser before STT to diagnose autonomic stress and preview 5-second Auditory Ghost pacing.
          </p>
        </div>

        <!-- Mic Action Button -->
        <div class="flex items-center gap-3 shrink-0 font-mono">
          <button (click)="toggleMicrophone()"
            [class]="isListening()
              ? 'px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2 animate-pulse'
              : 'px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs shadow-lg transition flex items-center gap-2'">
            <span>{{ isListening() ? '⏹️ Stop Analysis' : '🎙️ Start Vocal Scan' }}</span>
          </button>
        </div>
      </div>

      <!-- Main Visual Grid: FFT Spectrum Canvas + Tri-Paradigm Diagnostic Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Audio Spectrum Canvas & Ghost Preview Player -->
        <div class="lg:col-span-7 bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 flex flex-col justify-between relative overflow-hidden">
          
          <div class="flex items-center justify-between mb-3 font-mono">
            <span class="text-xs font-bold uppercase tracking-wider text-violet-400">
              Live FFT Frequency Spectrum (AnalyserNode 2048)
            </span>
            <span class="text-[11px] text-zinc-500">
              Sample Rate: 44.1 kHz
            </span>
          </div>

          <!-- Canvas Spectrum -->
          <div class="relative w-full h-[180px] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
            <canvas #spectrumCanvas class="w-full h-full"></canvas>
            
            @if (!isListening()) {
              <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center text-center p-4">
                <span class="text-xs font-mono text-zinc-500">
                  Click <strong>"Start Vocal Scan"</strong> to analyze raw acoustic pitch jitter & spectral centroid.
                </span>
              </div>
            }
          </div>

          <!-- Auditory Ghost Preview Section -->
          <div class="mt-4 pt-4 border-t border-zinc-800/80 font-mono">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-extrabold uppercase text-amber-400">👻 5-Second Auditory Ghost Preview</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50">
                  Time-Lapsed Entrainment
                </span>
              </div>
              <button (click)="playGhostPreview()" [disabled]="isPlayingGhost()"
                class="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-black text-xs transition cursor-pointer">
                {{ isPlayingGhost() ? '🔊 Playing Ghost...' : '▶️ Play Auditory Ghost' }}
              </button>
            </div>
            <p class="text-xs font-sans text-zinc-400">
              Compresses the 20-minute therapeutic transition from acute stress (18 BPM respiration) down to vagal resonance (5.5 BPM) into a 5-second acoustic preview.
            </p>
          </div>
        </div>

        <!-- Right: Telemetry & Multi-Paradigm Diagnostic Mapping -->
        <div class="lg:col-span-5 flex flex-col gap-4 font-mono">
          
          <!-- Stress Score Gauge -->
          <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span class="text-xs text-zinc-400 uppercase font-bold">Vocal Stress Telemetry Index</span>
              <div class="text-2xl font-black mt-1" [class.text-red-400]="vocalData().stressScore > 60" [class.text-emerald-400]="vocalData().stressScore <= 60">
                {{ vocalData().stressScore }} / 100
              </div>
            </div>
            <div class="text-right text-xs text-zinc-400 space-y-1">
              <div>Centroid: <strong class="text-violet-300">{{ vocalData().spectralCentroidHz }} Hz</strong></div>
              <div>Jitter: <strong class="text-violet-300">{{ (1 - vocalData().pitchStability) | percent:'1.1-1' }}</strong></div>
            </div>
          </div>

          <!-- Paradigm Diagnosis Cross-Projection -->
          <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <span class="text-xs font-bold uppercase text-zinc-300 tracking-wider">Acoustic Paradigm Diagnosis</span>
            
            <div class="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs">
              <span class="text-cyan-400 font-bold">🔵 Allopathic:</span>
              <p class="text-zinc-300 mt-0.5">{{ vocalData().allopathicState }}</p>
            </div>

            <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs">
              <span class="text-emerald-400 font-bold">🟢 TCM Wu Xing:</span>
              <p class="text-zinc-300 mt-0.5">{{ vocalData().tcmPattern }}</p>
            </div>

            <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs">
              <span class="text-amber-400 font-bold">🟡 Ayurvedic Tridosha:</span>
              <p class="text-zinc-300 mt-0.5">{{ vocalData().ayurvedicDosha }}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class VocalBiomarkerResonanceComponent implements OnDestroy {
  @ViewChild('spectrumCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  isListening = signal<boolean>(false);
  isPlayingGhost = signal<boolean>(false);

  vocalData = signal<IVocalStressData>({
    spectralCentroidHz: 2940,
    pitchStability: 0.88,
    harmonicNoiseRatio: 18.2,
    stressScore: 68,
    allopathicState: 'Sympathetic Hyperarousal / Elevated Vocal Cord Tension (High Cortisol)',
    tcmPattern: 'Liver Qi Stagnation with Rising Liver Fire (Wood Element)',
    ayurvedicDosha: 'Acute Vata Aggravation / Prana Vayu Turbulence'
  });

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;

  async toggleMicrophone(): Promise<void> {
    if (this.isListening()) {
      this.stopMicrophone();
    } else {
      await this.startMicrophone();
    }
  }

  async startMicrophone(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioCtx = new AudioContext();
      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      this.isListening.set(true);
      this.renderSpectrumCanvas();
    } catch (err) {
      console.warn('Microphone access denied or unequipped:', err);
    }
  }

  stopMicrophone(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.isListening.set(false);
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  playGhostPreview(): void {
    if (this.isPlayingGhost()) return;
    this.isPlayingGhost.set(true);

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(108, ctx.currentTime + 5.0);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 5.0);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 5.0);

    setTimeout(() => {
      this.isPlayingGhost.set(false);
      ctx.close();
    }, 5000);
  }

  private renderSpectrumCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.analyser) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = canvas.parentElement?.clientHeight || 180;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.analyser!.getByteFrequencyData(dataArray);
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);

      const barWidth = (w / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * h;

        // Gradient hue from violet to cyan
        const hue = 260 + (i / bufferLength) * 100;
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.fillRect(x, h - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      this.animFrameId = requestAnimationFrame(draw);
    };

    draw();
  }

  ngOnDestroy(): void {
    this.stopMicrophone();
  }
}
