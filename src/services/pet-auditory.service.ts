import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PetAuditoryService {
  private audioCtx: AudioContext | null = null;
  private nodes: any[] = [];
  private isPlaying = false;
  private activeMode: 'feline' | 'canine' | null = null;

  private initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public stop() {
    if (this.audioCtx) {
      this.nodes.forEach(n => {
        try { n.stop(); } catch(e) {}
        try { n.disconnect(); } catch(e) {}
      });
      this.nodes = [];
    }
    this.isPlaying = false;
    this.activeMode = null;
  }

  public get isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public get currentMode(): 'feline' | 'canine' | null {
    return this.activeMode;
  }

  /**
   * Simulates a feline purr using a low-frequency oscillator (25Hz) modulated
   * by a slower LFO to create the rhythmic breathing/purring cadence.
   */
  public playFelinePurr() {
    this.stop();
    this.initContext();
    if (!this.audioCtx) return;

    // Base purr frequency (25Hz - 50Hz is therapeutic for cats)
    const carrier = this.audioCtx.createOscillator();
    carrier.type = 'sawtooth'; // Sawtooth gives a nice rumbly texture
    carrier.frequency.value = 25;

    // Amplitude modulation to simulate breathing/purring rhythm
    const modulator = this.audioCtx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.value = 1.5; // 1.5 Hz ~ 90 BPM (fast breathing)

    const modulatorGain = this.audioCtx.createGain();
    modulatorGain.gain.value = 0.5;

    // A lowpass filter to remove harsh high frequencies from the sawtooth
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.value = 0; // fade in

    // Routing
    modulator.connect(modulatorGain);
    modulatorGain.connect(masterGain.gain);
    carrier.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(this.audioCtx.destination);

    // Fade in
    masterGain.gain.setTargetAtTime(0.4, this.audioCtx.currentTime, 1.0);

    carrier.start();
    modulator.start();

    this.nodes.push(carrier, modulator, modulatorGain, filter, masterGain);
    this.isPlaying = true;
    this.activeMode = 'feline';
  }

  /**
   * Simulates a rhythmic, soothing heartbeat for dogs.
   * Uses a low-frequency sine wave with an envelope.
   */
  public playCanineHeartbeat() {
    this.stop();
    this.initContext();
    if (!this.audioCtx) return;

    const BPM = 60;
    const beatDuration = 60 / BPM;
    
    this.isPlaying = true;
    this.activeMode = 'canine';
    let nextBeatTime = this.audioCtx.currentTime + 0.1;

    const scheduleBeat = () => {
      if (!this.isPlaying || !this.audioCtx) return;

      // First thump
      this.createThump(nextBeatTime);
      // Second thump
      this.createThump(nextBeatTime + 0.2);

      nextBeatTime += beatDuration;
      
      // Schedule next beat
      const timeUntilNext = (nextBeatTime - this.audioCtx.currentTime) * 1000;
      setTimeout(scheduleBeat, timeUntilNext - 100);
    };

    scheduleBeat();
  }

  private createThump(time: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(45, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.8, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.2);

    // Keep track of master nodes if we need to completely halt, but short nodes garbage collect.
  }
}
