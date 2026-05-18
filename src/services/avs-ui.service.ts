import { Injectable, signal, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AvsUiService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  // State
  public isAudioFeedbackEnabled = signal<boolean>(true);
  
  private audioCtx: AudioContext | null = null;

  constructor() {
    // If browser, try to restore settings
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('avs_ui_audio_feedback');
      if (saved !== null) {
        this.isAudioFeedbackEnabled.set(saved === 'true');
      }
    }
  }

  ngOnDestroy() {
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
    }
  }

  toggleAudioFeedback() {
    const nextVal = !this.isAudioFeedbackEnabled();
    this.isAudioFeedbackEnabled.set(nextVal);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('avs_ui_audio_feedback', String(nextVal));
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // --- Real-time synthesized chimes ---

  /**
   * Hover Chime: Ultra soft, very rapid, high-frequency focus whisper
   */
  playHover() {
    if (!this.isAudioFeedbackEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      gain.gain.setValueAtTime(0.003, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }

  /**
   * Transition Sweep: Kinetic slider sweep for tab/page navigation
   */
  playTransition() {
    if (!this.isAudioFeedbackEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Warm, analog physical tone
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  }

  /**
   * Toggle Click: Crisp mechanical snap for switch widgets
   */
  playToggle() {
    if (!this.isAudioFeedbackEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.01);

      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  /**
   * Success Dyad: Warm harmonic perfect-fifth arpeggio for confirmations
   */
  playSuccess() {
    if (!this.isAudioFeedbackEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Synthesize C5 (523.25Hz) and G5 (783.99Hz)
      const freqs = [523.25, 783.99];
      freqs.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + index * 0.06);

        gain.gain.setValueAtTime(0, now + index * 0.06);
        gain.gain.linearRampToValueAtTime(0.025, now + index * 0.06 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.5);
      });
    } catch (e) {}
  }

  /**
   * Error Warning: Detuned low dis-harmonic pulse
   */
  playError() {
    if (!this.isAudioFeedbackEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(111.5, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch (e) {}
  }
}
