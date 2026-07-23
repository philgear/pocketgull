import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-vagal-biofeedback-dock',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full mb-8 p-5 sm:p-7 bg-[#F9F3D9] dark:bg-zinc-950 text-[#1C1C1C] dark:text-zinc-100 rounded-2xl border-2 border-[#F6B12B] dark:border-[#F6B12B]/80 shadow-[4px_6px_0px_0px_rgba(28,28,28,0.85)] font-mono overflow-hidden pocket-gull-card">
      
      <!-- Background Texture & Papercraft Overlay -->
      <div class="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:12px_12px]"></div>

      <!-- Top Bar Header -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-[#1C1C1C]/20 dark:border-zinc-800 pb-5 mb-6 font-mono">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-[#F6B12B] text-zinc-950 border-2 border-[#1C1C1C] flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_rgba(28,28,28,0.9)] animate-bounce shrink-0">
            🔦
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-extrabold uppercase tracking-widest text-[#EF6658] dark:text-orange-400">Sentinel Telemetry Dock</span>
              <span class="text-xs px-2.5 py-0.5 rounded-md bg-[#3B82F6] text-white font-bold tracking-wider uppercase border border-[#1C1C1C]">
                Sentinel 🔦 Dispatch
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 border border-[#1C1C1C] uppercase">
                Real-Time Checkin Dock
              </span>
            </div>
            <h3 class="text-base sm:text-lg font-black uppercase tracking-tight text-[#1C1C1C] dark:text-zinc-100 mt-1">
              Vagal Resonance & Biofeedback Quick-Dock
            </h3>
            <p class="text-xs sm:text-sm text-[#1C1C1C]/70 dark:text-zinc-400 mt-0.5 font-sans leading-relaxed">
              Log instant vagal tone check-ins, HRV micro-session completions, and clinical notes directly to patient state.
            </p>
          </div>
        </div>

        <div class="text-right text-xs sm:text-sm text-[#1C1C1C]/70 dark:text-zinc-400 font-mono shrink-0">
          <span>Logged Sessions Today: <strong class="text-orange-700 dark:text-orange-400 font-black">{{ sessionCount() }}</strong></span>
        </div>
      </div>

      <!-- Quick Action Biofeedback Dock Buttons -->
      <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        
        <!-- Action 1: 5-Min Vagal Breathing -->
        <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between space-y-4 sub-panel">
          <div>
            <div class="flex items-center gap-2 text-xs font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-tight font-mono">
              <span class="text-lg">🫁</span>
              <span>5-Min Resonant Breathing</span>
            </div>
            <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 font-sans leading-relaxed mt-2">
              6.0 BPM pace (Inhale 5s, Exhale 5s) to boost RMSSD HRV and activate baroreflex sensitivity.
            </p>
          </div>
          <button (click)="logBreathingSession()"
            class="w-full py-3 px-4 rounded-xl border-2 border-[#1C1C1C] bg-[#F6B12B] text-[#1C1C1C] font-mono text-xs font-black uppercase transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)]">
            ✓ Log 5-Min Session
          </button>
        </div>

        <!-- Action 2: HRV Coherence Check-in -->
        <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between space-y-4 sub-panel">
          <div>
            <div class="flex items-center gap-2 text-xs font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-tight font-mono">
              <span class="text-lg">💓</span>
              <span>HRV Coherence Micro-Checkin</span>
            </div>
            <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 font-sans leading-relaxed mt-2">
              Record instantaneous high HRV coherence status post-AVS or meditation exercise.
            </p>
          </div>
          <button (click)="logHrvCoherence()"
            class="w-full py-3 px-4 rounded-xl border-2 border-[#1C1C1C] bg-[#F6B12B] text-[#1C1C1C] font-mono text-xs font-black uppercase transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)]">
            ✓ Record High Coherence
          </button>
        </div>

        <!-- Action 3: TCM Shen & Vata Calming -->
        <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between space-y-4 sub-panel">
          <div>
            <div class="flex items-center gap-2 text-xs font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-tight font-mono">
              <span class="text-lg">☯️</span>
              <span>Shen & Vata Calming Tea</span>
            </div>
            <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 font-sans leading-relaxed mt-2">
              Confirm ingestion of warm ginger jujube tea to soothe Stomach Vata and kindle Agni.
            </p>
          </div>
          <button (click)="logElixirTea()"
            class="w-full py-3 px-4 rounded-xl border-2 border-[#1C1C1C] bg-[#F6B12B] text-[#1C1C1C] font-mono text-xs font-black uppercase transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)]">
            ✓ Confirm Elixir Ingestion
          </button>
        </div>

      </div>

      <!-- Quick Text Note Publisher Input -->
      <div class="relative z-10 p-5 rounded-2xl border-2 border-[#1C1C1C] bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] sub-panel font-mono">
        <h4 class="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-1.5">
          <span>✍️</span> Log Micro-Observation to Patient Chart
        </h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <input #noteInput type="text" placeholder="Enter clinical observation, symptom resolution, or biofeedback note..."
            class="flex-1 py-3 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-[#1C1C1C] text-xs text-[#1C1C1C] dark:text-zinc-100 placeholder-[#1C1C1C]/50 dark:placeholder-zinc-500 focus:outline-none font-sans">
          <button (click)="publishClinicalNote(noteInput.value); noteInput.value=''"
            class="px-5 py-3 rounded-xl border-2 border-[#1C1C1C] bg-[#F6B12B] text-[#1C1C1C] font-mono text-xs font-black uppercase transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] shrink-0">
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
