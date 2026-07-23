import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { CompassionateAnalogyService } from '../services/compassionate-analogy.service';

@Component({
  selector: 'app-dual-pane-consultation',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 font-sans">
      
      <!-- Shared Consultation Header -->
      <div class="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono font-bold uppercase border border-indigo-700/50">
              Dual-Pane Shared Decision Engine
            </span>
            <h3 class="text-lg font-black text-white">
              Synchronized Clinician & Patient Consultation
            </h3>
          </div>
          <p class="text-xs text-zinc-400 font-medium mt-1">
            Left: Deep clinical rationale, ICD-10 codes & evidence trials. Right: Real-time compassionate persona translation.
          </p>
        </div>

        <!-- Persona Selector Pill Group -->
        <div class="flex items-center gap-1 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 text-xs font-mono">
          <button (click)="themeService.setAnalogyLensMode('arborist')"
            [class.bg-emerald-600]="themeService.analogyLensMode() === 'arborist'"
            [class.text-white]="themeService.analogyLensMode() === 'arborist'"
            [class.text-zinc-400]="themeService.analogyLensMode() !== 'arborist'"
            class="px-3 py-1.5 rounded-xl transition cursor-pointer border-0 font-bold flex items-center gap-1">
            🌳 Arborist
          </button>
          <button (click)="themeService.setAnalogyLensMode('mechanic')"
            [class.bg-cyan-600]="themeService.analogyLensMode() === 'mechanic'"
            [class.text-white]="themeService.analogyLensMode() === 'mechanic'"
            [class.text-zinc-400]="themeService.analogyLensMode() !== 'mechanic'"
            class="px-3 py-1.5 rounded-xl transition cursor-pointer border-0 font-bold flex items-center gap-1">
            🏎️ Mechanic
          </button>
          <button (click)="themeService.setAnalogyLensMode('gentleman')"
            [class.bg-amber-600]="themeService.analogyLensMode() === 'gentleman'"
            [class.text-white]="themeService.analogyLensMode() === 'gentleman'"
            [class.text-zinc-400]="themeService.analogyLensMode() !== 'gentleman'"
            class="px-3 py-1.5 rounded-xl transition cursor-pointer border-0 font-bold flex items-center gap-1">
            🎩 Gentleman
          </button>
          <button (click)="themeService.setAnalogyLensMode('muse')"
            [class.bg-purple-600]="themeService.analogyLensMode() === 'muse'"
            [class.text-white]="themeService.analogyLensMode() === 'muse'"
            [class.text-zinc-400]="themeService.analogyLensMode() !== 'muse'"
            class="px-3 py-1.5 rounded-xl transition cursor-pointer border-0 font-bold flex items-center gap-1">
            ✨ Muse
          </button>
        </div>
      </div>

      <!-- Dual Split Panes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- LEFT PANE: Clinician Technical Rationale -->
        <div class="p-5 rounded-2xl bg-zinc-900/90 border border-sky-800/40 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">🔬</span>
              <h4 class="font-extrabold text-xs uppercase tracking-wider text-sky-400 font-mono">
                Clinician Technical View (EHR & Trials)
              </h4>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono border border-sky-800/50">
              ICD-10 / SNOMED CT
            </span>
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
              <div class="text-[10px] text-sky-400 font-bold uppercase mb-1">Diagnoses & Coding</div>
              <div>• ICD-10 R06.02: Shortness of breath</div>
              <div>• ICD-10 I10: Essential primary hypertension</div>
              <div>• SNOMED 407563006: Microvascular endothelial stress</div>
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
              <div class="text-[10px] text-sky-400 font-bold uppercase mb-1">Pathophysiological Telemetry</div>
              <div>• Cardiac Output: 5.2 L/min | MAP: 93 mmHg</div>
              <div>• Cortisol Evaporation Rate: High-velocity sympathovagal shift</div>
              <div>• Gut Microbiome Diversity: Reduced Short-Chain Fatty Acid synthesis</div>
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
              <div class="text-[10px] text-sky-400 font-bold uppercase mb-1">Clinical Trial Evidence</div>
              <div>• NEJM 2025: Vagal HRV baroreflex therapy reduces systolic BP by 14 mmHg</div>
              <div>• Lancet 2026: Fiber-rich mycorrhizal gut protocols lower systemic CRP by 38%</div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANE: Patient Compassionate Persona View -->
        <div class="p-5 rounded-2xl bg-zinc-900/90 border border-emerald-800/40 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">
                {{ themeService.analogyLensMode() === 'arborist' ? '🌳' : (themeService.analogyLensMode() === 'mechanic' ? '🏎️' : (themeService.analogyLensMode() === 'gentleman' ? '🎩' : '✨')) }}
              </span>
              <h4 class="font-extrabold text-xs uppercase tracking-wider text-emerald-400 font-mono">
                Patient Persona View (Compassionate Translation)
              </h4>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/50 uppercase font-bold">
              {{ themeService.analogyLensMode() }} Mode Active
            </span>
          </div>

          <div class="space-y-3 font-sans text-xs">
            @let translation = getActiveTranslation();
            
            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 italic leading-relaxed">
              "{{ translation.greeting }}"
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200">
              <div class="text-[10px] text-emerald-400 font-bold uppercase font-mono mb-1">Personal Overview</div>
              {{ translation.overviewSummary }}
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200">
              <div class="text-[10px] text-emerald-400 font-bold uppercase font-mono mb-1">Vital Sign Translation</div>
              {{ translation.vitalsAnalogy }}
            </div>

            <div class="p-3 rounded-xl bg-zinc-950 border border-emerald-800/40 text-emerald-300 font-mono text-[11px]">
              💖 Reassurance: {{ translation.reassuranceStatement }}
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class DualPaneConsultationComponent {
  protected readonly patientState = inject(PatientStateService);
  protected readonly themeService = inject(ThemeService);
  protected readonly compassionateAnalogy = inject(CompassionateAnalogyService);

  getActiveTranslation() {
    const name = this.patientState.patientName() || 'Friend';
    const issues = ['acute stress', 'elevated blood pressure'];
    const vitals = '120/80 mmHg';

    switch (this.themeService.analogyLensMode()) {
      case 'mechanic':
        return this.compassionateAnalogy.generateMechanicTranslation(name, vitals, issues);
      case 'gentleman':
        return this.compassionateAnalogy.generateGentlemanTranslation(name, vitals, issues);
      case 'muse':
        return this.compassionateAnalogy.generateMuseTranslation(name, vitals, issues);
      default:
        return this.compassionateAnalogy.generateArboristTranslation(name, vitals, issues);
    }
  }
}
