import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-vagal-biofeedback-dock',
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
              🫁 Vagal Resonance & Biofeedback Quick-Dock
            </h3>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800 uppercase">
              Real-Time Checkin Dock
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-mono">
            Log instant vagal tone check-ins, HRV micro-session completions, and clinical notes directly to patient state.
          </p>
        </div>

        <div class="text-right text-[11px] text-zinc-400 font-mono">
          <span>Logged Sessions Today: <strong class="text-orange-400 font-bold">{{ sessionCount() }}</strong></span>
        </div>
      </div>

      <!-- Quick Action Biofeedback Dock Buttons -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        <!-- Action 1: 5-Min Vagal Breathing -->
        <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center gap-2 text-xs font-bold text-zinc-100 uppercase tracking-tight">
              <span>🫁</span>
              <span>5-Min Resonant Breathing</span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans leading-relaxed mt-1">
              6.0 BPM pace (Inhale 5s, Exhale 5s) to boost RMSSD HRV and activate baroreflex sensitivity.
            </p>
          </div>
          <button (click)="logBreathingSession()"
            class="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50">
            ✓ Log 5-Min Session
          </button>
        </div>

        <!-- Action 2: HRV Coherence Check-in -->
        <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center gap-2 text-xs font-bold text-zinc-100 uppercase tracking-tight">
              <span>💓</span>
              <span>HRV Coherence Micro-Checkin</span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans leading-relaxed mt-1">
              Record instantaneous high HRV coherence status post-AVS or meditation exercise.
            </p>
          </div>
          <button (click)="logHrvCoherence()"
            class="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50">
            ✓ Record High Coherence
          </button>
        </div>

        <!-- Action 3: TCM Shen & Vata Calming -->
        <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center gap-2 text-xs font-bold text-zinc-100 uppercase tracking-tight">
              <span>☯️</span>
              <span>Shen & Vata Calming Tea</span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans leading-relaxed mt-1">
              Confirm ingestion of warm ginger jujube tea to soothe Stomach Vata and kindle Agni.
            </p>
          </div>
          <button (click)="logElixirTea()"
            class="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50">
            ✓ Confirm Elixir Ingestion
          </button>
        </div>

      </div>

      <!-- Quick Text Note Publisher Input -->
      <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h4 class="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">
          ✍️ Log Micro-Observation to Patient Chart
        </h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <input #noteInput type="text" placeholder="Enter clinical observation, symptom resolution, or biofeedback note..."
            class="flex-1 py-2.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 font-sans">
          <button (click)="publishClinicalNote(noteInput.value); noteInput.value=''"
            class="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50 shrink-0">
            Publish Note 📌
          </button>
        </div>
      </div>

    </div>
  `
})
export class VagalBiofeedbackDockComponent {
  patientState = inject(PatientStateService);
  sessionCount = signal<number>(2);

  logBreathingSession() {
    this.sessionCount.update(c => c + 1);
    this.patientState.addClinicalNote({
      id: `vagal-session-${Date.now()}`,
      text: '🫁 Completed 5-Min 0.1 Hz Resonant Vagal Breathing micro-session. HRV coherence boosted.',
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert('🫁 Vagal Breathing Session Logged to Chart!');
  }

  logHrvCoherence() {
    this.sessionCount.update(c => c + 1);
    this.patientState.addClinicalNote({
      id: `hrv-checkin-${Date.now()}`,
      text: '💓 Recorded High HRV Coherence check-in (RMSSD > 65 ms). Autonomic balance confirmed.',
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert('💓 High HRV Coherence Logged!');
  }

  logElixirTea() {
    this.sessionCount.update(c => c + 1);
    this.patientState.addClinicalNote({
      id: `tea-checkin-${Date.now()}`,
      text: '☯️ Confirmed Warm Ginger Jujube Tea ingestion. Stomach Vata pacified & Agni supported.',
      sourceLens: 'Nutrition',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert('🍵 Elixir Ingestion Logged!');
  }

  publishClinicalNote(text: string) {
    if (!text || text.trim().length === 0) return;
    this.patientState.addClinicalNote({
      id: `user-note-${Date.now()}`,
      text: text.trim(),
      sourceLens: 'General Overview',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert('📌 Micro-Observation Logged to Patient Chart!');
  }
}
