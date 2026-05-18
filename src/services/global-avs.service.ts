import {
  Injectable,
  inject,
  effect,
  untracked,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientStateService } from './patient-state.service';
import { AvsUiService } from './avs-ui.service';

/**
 * GlobalAvsService — Unified AVS Engine v1.1
 *
 * Single owner of:
 *  - Web Audio API context and binaural/noise graph
 *  - requestAnimationFrame loop → drives --avs-breath-phase CSS var
 *  - body.avs-active + data-avs-wave → all CSS animations cascade
 *  - Breath duration token → --avs-breath-duration
 *
 * Consumes PatientStateService signals as the single source of truth.
 * All components receive AVS state purely through CSS — no per-component
 * changes required.
 */
@Injectable({ providedIn: 'root' })
export class GlobalAvsService {
  private readonly state = inject(PatientStateService);
  private readonly avsUi = inject(AvsUiService);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // ── Audio graph nodes ──────────────────────────────────────────
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private leftOsc1: OscillatorNode | null = null;
  private rightOsc1: OscillatorNode | null = null;
  private leftOsc2: OscillatorNode | null = null;
  private rightOsc2: OscillatorNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  private merger: ChannelMergerNode | null = null;

  // ── rAF loop state ─────────────────────────────────────────────
  private rafId: number | null = null;
  private sessionStart = 0;

  // ── Gesture gate ───────────────────────────────────────────────
  private gestureUnlocked = false;
  private readonly gestureListeners: (() => void)[] = [];

  // ── Carrier / beat frequencies per brainwave ──────────────────
  private readonly WAVE_CONFIG: Record<string, { carrier1: number; beat1: number; carrier2: number; beat2: number; noiseGain: number }> = {
    delta: { carrier1: 432, beat1: 2.0,  carrier2: 216, beat2: 1.5,  noiseGain: 0.04 },
    theta: { carrier1: 432, beat1: 6.0,  carrier2: 216, beat2: 4.0,  noiseGain: 0.03 },
    alpha: { carrier1: 432, beat1: 10.0, carrier2: 216, beat2: 7.5,  noiseGain: 0.02 },
    beta:  { carrier1: 432, beat1: 20.0, carrier2: 216, beat2: 14.0, noiseGain: 0.015 },
    gamma: { carrier1: 432, beat1: 40.0, carrier2: 216, beat2: 30.0, noiseGain: 0.01 },
  };

  constructor() {
    if (!this.isBrowser) return;

    // React to AVS session state changes
    effect(() => {
      const active = this.state.isAvsSessionActive();
      const wave = this.state.avsBrainwaveFrequency();
      const bpm = this.state.avsBreathingRate();

      untracked(() => {
        if (active) {
          this.activateAvsMode(wave, bpm);
        } else {
          this.deactivateAvsMode();
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════

  /** Call on first user gesture to comply with autoplay policy. */
  onUserGesture(): void {
    if (this.gestureUnlocked) return;
    this.gestureUnlocked = true;
    this.gestureListeners.forEach(fn => fn());
    this.gestureListeners.length = 0;
  }

  /** Dynamically update breathing rate during an active session. */
  updateBreathRate(bpm: number): void {
    this.setCssVar('--avs-breath-duration', `${(60 / bpm).toFixed(2)}s`);
  }

  /** Dynamically update brainwave mode during an active session. */
  updateWave(wave: string): void {
    if (!this.isBrowser) return;
    document.body.setAttribute('data-avs-wave', wave);
    const cfg = this.WAVE_CONFIG[wave];
    if (cfg && this.leftOsc1 && this.rightOsc1 && this.leftOsc2 && this.rightOsc2) {
      this.leftOsc1.frequency.exponentialRampToValueAtTime(cfg.carrier1, this.audioTime() + 2.0);
      this.rightOsc1.frequency.exponentialRampToValueAtTime(cfg.carrier1 + cfg.beat1, this.audioTime() + 2.0);
      this.leftOsc2.frequency.exponentialRampToValueAtTime(cfg.carrier2, this.audioTime() + 2.0);
      this.rightOsc2.frequency.exponentialRampToValueAtTime(cfg.carrier2 + cfg.beat2, this.audioTime() + 2.0);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIVATION
  // ══════════════════════════════════════════════════════════════

  private activateAvsMode(wave: string, bpm: number): void {
    if (!this.isBrowser) return;

    // Set CSS state on body
    document.body.classList.add('avs-active');
    document.body.setAttribute('data-avs-wave', wave);
    this.setCssVar('--avs-breath-duration', `${(60 / bpm).toFixed(2)}s`);
    this.setCssVar('--avs-border-opacity', '0.35');

    // Start rAF loop (outside Angular zone for performance)
    this.sessionStart = performance.now();
    this.zone.runOutsideAngular(() => this.startRafLoop());

    // Start audio (may be gated on gesture)
    this.startAudioGraph(wave);
  }

  private deactivateAvsMode(): void {
    if (!this.isBrowser) return;

    document.body.classList.remove('avs-active');
    document.body.removeAttribute('data-avs-wave');
    this.setCssVar('--avs-border-opacity', '0');
    this.setCssVar('--avs-breath-phase', '0');

    this.stopRafLoop();
    this.stopAudioGraph();
  }

  // ══════════════════════════════════════════════════════════════
  // requestAnimationFrame LOOP
  // Drives --avs-breath-phase (0→1) at the current BPM.
  // Running outside NgZone — no change detection overhead.
  // ══════════════════════════════════════════════════════════════

  private startRafLoop(): void {
    if (this.rafId !== null) return;

    const tick = (now: number) => {
      const bpm = this.state.avsBreathingRate();
      const cycleDurationMs = (60 / bpm) * 1000;
      const elapsed = (now - this.sessionStart) % cycleDurationMs;
      const phase = elapsed / cycleDurationMs; // 0.0 → 1.0

      this.setCssVar('--avs-breath-phase', phase.toFixed(4));
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private stopRafLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // AUDIO GRAPH  (Web Audio API)
  // 432 Hz binaural beat + brown noise floor
  // ══════════════════════════════════════════════════════════════

  private startAudioGraph(wave: string): void {
    const start = () => {
      this.buildGraph(wave);
    };

    if (this.gestureUnlocked) {
      start();
    } else {
      this.gestureListeners.push(start);
    }
  }

  private buildGraph(wave: string): void {
    this.stopAudioGraph();

    try {
      this.ctx = new AudioContext();
      const cfg = this.WAVE_CONFIG[wave] ?? this.WAVE_CONFIG['theta'];

      // Master gain (soft start)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 3.0);
      this.masterGain.connect(this.ctx.destination);

      // Hemi-Sync Layer 1 (Primary)
      this.leftOsc1  = this.ctx.createOscillator();
      this.rightOsc1 = this.ctx.createOscillator();
      this.leftOsc1.type  = 'sine';
      this.rightOsc1.type = 'sine';
      this.leftOsc1.frequency.value  = cfg.carrier1;
      this.rightOsc1.frequency.value = cfg.carrier1 + cfg.beat1;

      // Hemi-Sync Layer 2 (Sub-harmonic)
      this.leftOsc2  = this.ctx.createOscillator();
      this.rightOsc2 = this.ctx.createOscillator();
      this.leftOsc2.type  = 'sine';
      this.rightOsc2.type = 'sine';
      this.leftOsc2.frequency.value  = cfg.carrier2;
      this.rightOsc2.frequency.value = cfg.carrier2 + cfg.beat2;

      const leftGain  = this.ctx.createGain();
      const rightGain = this.ctx.createGain();
      // Lower volume overall since we have 4 oscillators
      leftGain.gain.value  = 0.35;
      rightGain.gain.value = 0.35;

      this.leftOsc1.connect(leftGain).connect(this.merger, 0, 0);
      this.rightOsc1.connect(rightGain).connect(this.merger, 0, 1);
      
      this.leftOsc2.connect(leftGain).connect(this.merger, 0, 0);
      this.rightOsc2.connect(rightGain).connect(this.merger, 0, 1);
      
      this.merger.connect(this.masterGain);

      this.leftOsc1.start();
      this.rightOsc1.start();
      this.leftOsc2.start();
      this.rightOsc2.start();

      // Pink noise floor (Hemi-Sync standard)
      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.value = cfg.noiseGain;
      this.noiseSource = this.createPinkNoise(this.ctx);
      this.noiseSource.connect(this.noiseGain).connect(this.masterGain);
      this.noiseSource.start();

    } catch (e) {
      console.warn('[GlobalAvsService] Audio graph failed to start:', e);
    }
  }

  private stopAudioGraph(): void {
    try {
      if (this.masterGain) {
        this.masterGain.gain.linearRampToValueAtTime(0, (this.ctx?.currentTime ?? 0) + 1.5);
      }
      setTimeout(() => {
        [this.leftOsc1, this.rightOsc1, this.leftOsc2, this.rightOsc2, this.noiseSource].forEach(node => {
          try { node?.stop(); } catch { /* already stopped */ }
        });
        this.ctx?.close();
        this.ctx = null;
        this.leftOsc1 = this.rightOsc1 = this.leftOsc2 = this.rightOsc2 = this.noiseSource = null;
        this.masterGain = this.noiseGain = null;
        this.splitter = this.merger = null;
      }, 1600);
    } catch { /* ignore */ }
  }

  /**
   * Synthesizes a pink noise buffer (Hemi-Sync standard carrier).
   * 1/f spectral density sounds more balanced to human ears.
   */
  private createPinkNoise(ctx: AudioContext): AudioBufferSourceNode {
    const bufferSize = ctx.sampleRate * 4; // 4s loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // normalize
      b6 = white * 0.115926;
    }
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    return node;
  }

  // ══════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════

  private setCssVar(name: string, value: string): void {
    document.documentElement.style.setProperty(name, value);
  }

  private audioTime(): number {
    return this.ctx?.currentTime ?? 0;
  }
}
