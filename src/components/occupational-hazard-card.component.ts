import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { ActuarialLongevityService, IOccupationalHazardProfile } from '../services/actuarial-longevity.service';

@Component({
  selector: 'app-occupational-hazard-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full overflow-hidden rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/80 shadow-lg hover:shadow-2xl transition-all duration-300 p-5 font-sans">
      <!-- Ambient Glow Backdrop -->
      <div class="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 blur-3xl pointer-events-none"></div>

      @if (profile(); as prof) {
        <!-- 1. Header & Primary Identification -->
        <div class="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-zinc-800/80">
          <div class="space-y-1 max-w-xl">
            <div class="flex items-center gap-2">
              <span class="text-xl">🛡️</span>
              <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">{{ prof.professionTitle }}</h2>
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                SOC {{ prof.socCode }}
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              Domain Category: <span class="text-slate-800 dark:text-zinc-200 font-semibold">{{ prof.category }}</span>
            </p>
          </div>

          <!-- Actuarial QALY Pill & Survival Reserve -->
          <div class="flex items-center gap-2">
            @if (actuarialProfile()?.survivalProbability5Year; as survivalProb) {
              <div class="px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 font-mono">
                <span>🛡️ 5-Yr Survival: {{ (survivalProb * 100).toFixed(1) }}%</span>
              </div>
            }

            <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm transition-transform hover:scale-105"
                 [class.bg-emerald-500\/10]="prof.actuarialQalyImpact >= 0"
                 [class.text-emerald-700]="prof.actuarialQalyImpact >= 0"
                 [class.dark:text-emerald-300]="prof.actuarialQalyImpact >= 0"
                 [class.border-emerald-500\/30]="prof.actuarialQalyImpact >= 0"
                 [class.bg-amber-500\/10]="prof.actuarialQalyImpact < 0"
                 [class.text-amber-700]="prof.actuarialQalyImpact < 0"
                 [class.dark:text-amber-300]="prof.actuarialQalyImpact < 0"
                 [class.border-amber-500\/30]="prof.actuarialQalyImpact < 0">
              <span>{{ prof.actuarialQalyImpact >= 0 ? '📈' : '📉' }}</span>
              <span>Actuarial QALY: {{ prof.actuarialQalyImpact >= 0 ? '+' : '' }}{{ prof.actuarialQalyImpact }} Years</span>
            </div>
          </div>
        </div>

        <!-- 2. SNOMED CT Hazard & Primary Clinical Disorder -->
        <div class="mt-4 p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-amber-500 dark:text-amber-400 font-bold">⚠️ SNOMED CT Hazard:</span>
            <span class="font-semibold text-slate-800 dark:text-zinc-200">{{ prof.snomedDisplay }}</span>
          </div>
          <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
            SCT {{ prof.snomedCode }}
          </span>
        </div>

        <!-- Gompertz-Makeham Trajectory Curve Ribbon -->
        @if (survivalCurvePoints(); as points) {
          <div class="mt-3 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs flex items-center justify-between gap-2 font-mono">
            <span class="text-cyan-400 font-bold text-[10px] uppercase">Gompertz-Makeham 20-Yr Risk Horizon:</span>
            <div class="flex items-center gap-1">
              @for (pt of points.slice(0, 5); track pt.age) {
                <span class="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-200 text-[10px] border border-cyan-500/30">
                  Age {{ pt.age }}: {{ (pt.personalizedSurvival * 100).toFixed(0) }}%
                </span>
              }
            </div>
          </div>
        }

        <!-- 3. 10D Occupational Hazard Score Grid -->
        <div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <!-- Ergonomic Strain -->
          <div class="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/50">
            <div class="flex justify-between text-[11px] font-medium text-gray-500 dark:text-zinc-400">
              <span>Ergonomic Strain</span>
              <span class="font-bold text-slate-800 dark:text-zinc-200">{{ prof.ergonomicStrainScore }}/10</span>
            </div>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500" [style.width.%]="prof.ergonomicStrainScore * 10"></div>
            </div>
          </div>

          <!-- Circadian Disruption -->
          <div class="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/50">
            <div class="flex justify-between text-[11px] font-medium text-gray-500 dark:text-zinc-400">
              <span>Circadian Disruption</span>
              <span class="font-bold text-slate-800 dark:text-zinc-200">{{ prof.circadianDisruptionScore }}/10</span>
            </div>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500" [style.width.%]="prof.circadianDisruptionScore * 10"></div>
            </div>
          </div>

          <!-- Chemical Exposure -->
          <div class="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/50">
            <div class="flex justify-between text-[11px] font-medium text-gray-500 dark:text-zinc-400">
              <span>Chemical Exposure</span>
              <span class="font-bold text-slate-800 dark:text-zinc-200">{{ prof.chemicalExposureScore }}/10</span>
            </div>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" [style.width.%]="prof.chemicalExposureScore * 10"></div>
            </div>
          </div>

          <!-- Allostatic Burnout -->
          <div class="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/50">
            <div class="flex justify-between text-[11px] font-medium text-gray-500 dark:text-zinc-400">
              <span>Allostatic Burnout</span>
              <span class="font-bold text-slate-800 dark:text-zinc-200">{{ prof.allostaticBurnoutScore }}/10</span>
            </div>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500 transition-all duration-500" [style.width.%]="prof.allostaticBurnoutScore * 10"></div>
            </div>
          </div>
        </div>

        <!-- 4. OSHA Mitigation Directives & Precision Nutrition -->
        <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- OSHA Directives -->
          <div class="space-y-2 p-3.5 rounded-xl bg-slate-50/60 dark:bg-zinc-950/40 border border-slate-200/60 dark:border-zinc-800/60">
            <h3 class="font-bold text-slate-900 dark:text-gray-100 flex items-center gap-1.5">
              <span>📋</span> OSHA & Polymath Directives
            </h3>
            <ul class="space-y-1.5">
              @for (directive of prof.oshaMitigationDirectives; track $index) {
                <li class="flex items-start gap-2 text-slate-700 dark:text-zinc-300 leading-relaxed">
                  <span class="text-teal-500 font-bold">•</span>
                  <span>{{ directive }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- Precision Occupational Nutrition -->
          <div class="space-y-2 p-3.5 rounded-xl bg-slate-50/60 dark:bg-zinc-950/40 border border-slate-200/60 dark:border-zinc-800/60">
            <h3 class="font-bold text-slate-900 dark:text-gray-100 flex items-center gap-1.5">
              <span>🥗</span> Precision Occupational Nutrition
            </h3>
            <div class="flex flex-wrap gap-1.5 mt-2">
              @for (nutrient of prof.precisionOccupationalNutrition; track $index) {
                <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                  🌿 {{ nutrient }}
                </span>
              }
            </div>
          </div>
        </div>

        <!-- 5. Choral Vocal Resonance & Glee Protocol -->
        @if (prof.vocalResonanceProtocol) {
          <div class="mt-4 p-3.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/30 border border-indigo-500/20 text-xs">
            <div class="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200 mb-1">
              <span>🎵</span>
              <span>Vocal Resonance & Choral Glee Vagal Protocol</span>
            </div>
            <p class="text-indigo-800 dark:text-indigo-300 leading-relaxed font-medium">
              {{ prof.vocalResonanceProtocol }}
            </p>
          </div>
        }
      } @else {
        <div class="py-8 text-center text-gray-500 dark:text-zinc-400 text-xs">
          <span>No occupation selected. Specify a profession in patient history to view actuarial hazard profiling.</span>
        </div>
      }
    </div>
  `
})
export class OccupationalHazardCardComponent {
  private patientState = inject(PatientStateService, { optional: true });
  private actuarialService = inject(ActuarialLongevityService, { optional: true });

  readonly profile = computed<IOccupationalHazardProfile | null>(() => {
    if (this.patientState) {
      return this.patientState.occupationalProfile();
    }
    if (this.actuarialService) {
      return this.actuarialService.getOccupationalProfile('Polymath');
    }
    return null;
  });

  readonly actuarialProfile = computed(() => {
    if (!this.actuarialService) return null;
    const vitals = this.patientState?.vitals() || { hr: '72', spO2: '98' };
    const age = 45;
    const soc = this.profile()?.socCode;
    return this.actuarialService.calculateActuarialProfile(vitals, 75, age, soc);
  });

  readonly survivalCurvePoints = computed(() => {
    const prof = this.actuarialProfile();
    if (!prof || !this.actuarialService) return [];
    return this.actuarialService.generateLongevityRiskCurve(prof.chronologicalAge, prof.chronologicalAge + 20, prof.gompertzParams);
  });
}

