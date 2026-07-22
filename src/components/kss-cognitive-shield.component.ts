import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { AcronymExpanderService, MEDICAL_ACRONYM_DICTIONARY } from '../services/acronym-expander.service';

export interface IKssLevel {
  score: number;
  label: string;
  category: 'Alert' | 'Moderate Fatigue' | 'High Fatigue';
  uiAdaptation: string;
}

@Component({
  selector: 'app-kss-cognitive-shield',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xl mb-8 font-sans">
      
      <!-- Banner Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full animate-pulse"
              [class.bg-emerald-500]="kssScore() <= 4"
              [class.bg-amber-500]="kssScore() >= 5 && kssScore() <= 6"
              [class.bg-red-500]="kssScore() >= 7"></span>
            <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-widest">
              😴 Karolinska Sleepiness Scale (KSS) Adaptive Shield
            </h3>
            <span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase"
              [class.bg-emerald-500/10]="kssScore() <= 4"
              [class.text-emerald-600]="kssScore() <= 4"
              [class.bg-amber-500/10]="kssScore() >= 5 && kssScore() <= 6"
              [class.text-amber-600]="kssScore() >= 5 && kssScore() <= 6"
              [class.bg-red-500/10]="kssScore() >= 7"
              [class.text-red-600]="kssScore() >= 7">
              KSS Score {{ kssScore() }}/9 — {{ cognitiveMode() }}
            </span>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            Dynamically reduces UI cognitive load, enlarges touch targets, auto-expands medical acronyms, and enforces safety gates during clinician fatigue.
          </p>
        </div>

        <!-- Mode Indicator Badge -->
        <div class="flex items-center gap-2">
          <div class="px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider shadow-sm"
            [class.bg-emerald-500/15]="kssScore() <= 4"
            [class.text-emerald-700]="kssScore() <= 4"
            [class.dark:text-emerald-300]="kssScore() <= 4"
            [class.border-emerald-500/30]="kssScore() <= 4"
            [class.bg-amber-500/15]="kssScore() >= 5 && kssScore() <= 6"
            [class.text-amber-700]="kssScore() >= 5 && kssScore() <= 6"
            [class.dark:text-amber-300]="kssScore() >= 5 && kssScore() <= 6"
            [class.border-amber-500/30]="kssScore() >= 5 && kssScore() <= 6"
            [class.bg-red-500/15]="kssScore() >= 7"
            [class.text-red-700]="kssScore() >= 7"
            [class.dark:text-red-300]="kssScore() >= 7"
            [class.border-red-500/30]="kssScore() >= 7">
            🛡️ {{ cognitiveMode() }}
          </div>
        </div>
      </div>

      <!-- KSS 9-Point Rating Scale Grid -->
      <div class="mb-6">
        <label class="block text-xs font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-3">
          Select Current Clinician Fatigue / Sleepiness Level (KSS 1 – 9):
        </label>
        <div class="grid grid-cols-3 sm:grid-cols-9 gap-2">
          @for (lvl of kssLevels; track lvl.score) {
            <button (click)="setKssScore(lvl.score)"
              [class.ring-2]="kssScore() === lvl.score"
              [class.ring-indigo-500]="kssScore() === lvl.score"
              [class.bg-emerald-600]="kssScore() === lvl.score && lvl.score <= 4"
              [class.bg-amber-600]="kssScore() === lvl.score && lvl.score >= 5 && lvl.score <= 6"
              [class.bg-red-600]="kssScore() === lvl.score && lvl.score >= 7"
              [class.text-white]="kssScore() === lvl.score"
              [class.bg-zinc-100]="kssScore() !== lvl.score"
              [class.text-zinc-700]="kssScore() !== lvl.score"
              [class.dark:bg-zinc-800]="kssScore() !== lvl.score"
              [class.dark:text-zinc-300]="kssScore() !== lvl.score"
              class="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 text-center transition-all cursor-pointer hover:border-zinc-400 flex flex-col items-center justify-between min-h-[72px]">
              <span class="text-sm font-mono font-extrabold">{{ lvl.score }}</span>
              <span class="text-[9px] font-sans leading-tight mt-1 opacity-90 line-clamp-2">{{ lvl.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Active Cognitive Adaptations Matrix -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        
        <!-- 1. UI Density & Layout Simplification -->
        <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80">
          <div class="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200 mb-2">
            <span>📐 UI Density Adaptation</span>
          </div>
          <p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            @if (kssScore() <= 4) {
              Full analytical telemetry mode. Displays multi-layered charts, 3D anatomical models, and secondary data tabs.
            } @else if (kssScore() >= 5 && kssScore() <= 6) {
              Moderate density reduction. Collapses non-essential diagnostic tabs and highlights primary recommendations.
            } @else {
              <strong>Maximum Simplification Shield:</strong> Hides decorative sidebars, focuses on single-action decision cards, and expands line spacing.
            }
          </p>
        </div>

        <!-- 2. Night-Shift Color Spectrum & Typography -->
        <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80">
          <div class="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200 mb-2">
            <span>🌙 Ergonomic Contrast</span>
          </div>
          <p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            @if (kssScore() <= 4) {
              Standard high-definition typography and compact 32px UI touch controls.
            } @else if (kssScore() >= 5 && kssScore() <= 6) {
              Enlarges buttons to 40px touch targets with increased text contrast.
            } @else {
              <strong>Night-Shift Amber Spectrum:</strong> Touch targets expanded to 48px+, blue-light emission suppressed for night fatigue.
            }
          </p>
        </div>

        <!-- 3. Medical Acronym Expansion Engine -->
        <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80">
          <div class="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200 mb-2">
            <span>📚 Acronym Expansion</span>
          </div>
          <p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            @if (kssScore() <= 4) {
              Standard clinical shorthand (e.g. COPD, OSA, HRV, eGFR) with hover tooltips.
            } @else {
              <strong class="text-amber-600 dark:text-amber-400">Plain-Language Acronym Expansion Active:</strong> Automatically converts all medical acronyms (e.g., <em>COPD</em> &rarr; <em>Chronic Obstructive Pulmonary Disease</em>) to eliminate cognitive interpretation errors.
            }
          </p>
        </div>

        <!-- 4. Safety Guardrails & Voice Auto-Readout -->
        <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80">
          <div class="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200 mb-2">
            <span>🚨 Clinical Safety Lock</span>
          </div>
          <p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            @if (kssScore() <= 4) {
              Standard single-click clinical actions and standard verification checks.
            } @else if (kssScore() >= 5 && kssScore() <= 6) {
              Soft confirmation prompts on high-risk medication changes.
            } @else {
              <strong>Strict Safety Lock:</strong> Mandates explicit 2-step verification on all medication orders and auto-reads key flags aloud.
            }
          </p>
        </div>

      </div>

      <!-- Quick Acronym Expansion Sample Preview -->
      @if (kssScore() >= 5) {
        <div class="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span class="font-bold">✨ Active KSS Acronym Expansion:</span> 
            <span>"COPD + OSA + T2DM" automatically renders as </span>
            <span class="font-semibold underline decoration-dotted">"Chronic Obstructive Pulmonary Disease (COPD) + Obstructive Sleep Apnea (OSA) + Type 2 Diabetes Mellitus (T2DM)"</span>
          </div>
          <span class="text-[10px] font-mono uppercase bg-amber-500/20 px-2 py-0.5 rounded font-bold shrink-0">40+ Medical Acronyms Unfolded</span>
        </div>
      }

    </div>
  `
})
export class KssCognitiveShieldComponent {
  patientState = inject(PatientStateService);
  acronymService = inject(AcronymExpanderService);

  kssScore = signal<number>(3); // Default Alert (3)

  kssLevels: IKssLevel[] = [
    { score: 1, label: 'Extremely alert', category: 'Alert', uiAdaptation: 'Full telemetry density' },
    { score: 2, label: 'Very alert', category: 'Alert', uiAdaptation: 'Full telemetry density' },
    { score: 3, label: 'Alert, normal level', category: 'Alert', uiAdaptation: 'Standard interface' },
    { score: 4, label: 'Fairly alert', category: 'Alert', uiAdaptation: 'Standard interface' },
    { score: 5, label: 'Neither alert nor sleepy', category: 'Moderate Fatigue', uiAdaptation: 'Acronym expansion active' },
    { score: 6, label: 'Some signs of sleepiness', category: 'Moderate Fatigue', uiAdaptation: 'Enlarged touch targets + Acronyms' },
    { score: 7, label: 'Sleepy, no effort to stay awake', category: 'High Fatigue', uiAdaptation: 'Single-column view + Plain language' },
    { score: 8, label: 'Sleepy, effort to stay awake', category: 'High Fatigue', uiAdaptation: 'Warm amber night spectrum + 48px targets' },
    { score: 9, label: 'Extremely sleepy, fighting sleep', category: 'High Fatigue', uiAdaptation: 'Maximum Safety Shield + 2-step order lock' }
  ];

  cognitiveMode = computed(() => {
    const s = this.kssScore();
    if (s <= 4) return 'Full Telemetry Mode';
    if (s <= 6) return 'Simplified Focus Mode';
    return 'Maximum Safety Shield Mode';
  });

  setKssScore(score: number) {
    this.kssScore.set(score);
    this.acronymService.currentKssScore.set(score);
    // Dispatches custom event to notify parent components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kss-score-change', { detail: score }));
    }
  }
}
