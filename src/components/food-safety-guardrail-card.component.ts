import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';

export interface IFoodSafetyRule {
  id: string;
  category: 'cardiovascular' | 'renal' | 'hepatic' | 'medication' | 'thyroid' | 'histamine' | 'metabolic';
  severity: 'critical' | 'warning' | 'info';
  patientStateTrigger: string;
  foodToAvoid: string;
  clinicalRationale: string;
  recommendedAlternatives: string;
  icon: string;
}

@Component({
  selector: 'app-food-safety-guardrail-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md"
         [ngClass]="themeService.activeTheme() === 'dark' ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white/90 border-slate-200 text-slate-900'">
      
      <!-- Card Header -->
      <div class="flex items-center justify-between pb-4 border-b"
           [ngClass]="themeService.activeTheme() === 'dark' ? 'border-zinc-800' : 'border-slate-100'">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
            🥗
          </div>
          <div>
            <h3 class="text-base font-bold tracking-tight">Food-Drug & Patient State Safety Matrix</h3>
            <p class="text-xs text-emerald-500 font-medium">Chrono-Nutrition & Clinical Food Safety Engine</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 text-xs font-semibold rounded-full border shadow-sm"
                [ngClass]="activeRules().length > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'">
            {{ activeRules().length }} Active Safety Rules
          </span>
        </div>
      </div>

      <!-- Active Food Safety Warnings Grid -->
      <div class="mt-5 space-y-3">
        @for (rule of activeRules(); track rule.id) {
          <div class="p-4 rounded-xl border transition-all hover:translate-x-1"
               [ngClass]="{
                 'bg-rose-500/10 border-rose-500/30 text-rose-300': rule.severity === 'critical',
                 'bg-amber-500/10 border-amber-500/30 text-amber-300': rule.severity === 'warning',
                 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300': rule.severity === 'info'
               }">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ rule.icon }}</span>
                <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/20">
                  {{ rule.category }}
                </span>
                <span class="text-xs font-semibold text-zinc-300">Trigger: {{ rule.patientStateTrigger }}</span>
              </div>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded"
                    [ngClass]="rule.severity === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'">
                {{ rule.severity }}
              </span>
            </div>

            <div class="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div class="p-2.5 rounded-lg bg-black/20 border border-white/5">
                <span class="font-bold text-rose-400 block mb-1">🛑 Restrict / Ban:</span>
                <p class="leading-relaxed opacity-90">{{ rule.foodToAvoid }}</p>
                <p class="mt-1 text-[11px] italic opacity-75">{{ rule.clinicalRationale }}</p>
              </div>
              <div class="p-2.5 rounded-lg bg-black/20 border border-white/5">
                <span class="font-bold text-emerald-400 block mb-1">🟢 Clinical Food Replacements:</span>
                <p class="leading-relaxed opacity-90">{{ rule.recommendedAlternatives }}</p>
              </div>
            </div>
          </div>
        } @empty {
          <div class="p-6 rounded-xl border border-dashed text-center"
               [ngClass]="themeService.activeTheme() === 'dark' ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-500'">
            <p class="text-sm font-medium">✨ Baseline Food Safety Verified — No active critical contraindications detected.</p>
          </div>
        }
      </div>

      <!-- Circadian Meal Sequencing Ribbon -->
      <div class="mt-6 pt-4 border-t"
           [ngClass]="themeService.activeTheme() === 'dark' ? 'border-zinc-800' : 'border-slate-100'">
        <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
          <span>🌅</span> Circadian Food Sequencing & Chrono-Nutrition
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div class="p-3 rounded-xl border"
               [ngClass]="themeService.activeTheme() === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-slate-50 border-slate-200'">
            <div class="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
              <span>🍳</span> Morning (07:00–10:00)
            </div>
            <p class="text-[11px] leading-relaxed" [ngClass]="themeService.activeTheme() === 'dark' ? 'text-zinc-300' : 'text-slate-600'">
              High protein & healthy fats (pasture eggs, avocado, walnuts) to anchor cortisol awakening response.
            </p>
          </div>

          <div class="p-3 rounded-xl border"
               [ngClass]="themeService.activeTheme() === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-slate-50 border-slate-200'">
            <div class="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
              <span>🥗</span> Mid-Day (12:00–14:00)
            </div>
            <p class="text-[11px] leading-relaxed" [ngClass]="themeService.activeTheme() === 'dark' ? 'text-zinc-300' : 'text-slate-600'">
              Complex carbs & dense greens (quinoa, wild salmon, steamed broccoli) for peak metabolic rate.
            </p>
          </div>

          <div class="p-3 rounded-xl border"
               [ngClass]="themeService.activeTheme() === 'dark' ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-slate-50 border-slate-200'">
            <div class="flex items-center gap-1.5 font-bold text-indigo-400 mb-1">
              <span>🌙</span> Evening (18:00–20:00)
            </div>
            <p class="text-[11px] leading-relaxed" [ngClass]="themeService.activeTheme() === 'dark' ? 'text-zinc-300' : 'text-slate-600'">
              Tryptophan-dense foods (turkey, pumpkin seeds, tart cherry) for serotonin-melatonin conversion.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FoodSafetyGuardrailCardComponent {
  private patientState = inject(PatientStateService);
  readonly themeService = inject(ThemeService);

  readonly activeRules = computed<IFoodSafetyRule[]>(() => {
    const rules: IFoodSafetyRule[] = [];
    const vitals = this.patientState.vitals();
    const meds = (this.patientState.medications() || []).map(m => m.name.toLowerCase());
    const hrVal = parseFloat(vitals?.hr || '72');
    const sysBp = parseFloat((vitals?.bp || '120/80').split('/')[0] || '120');

    // 1. Anticoagulant Rule
    const isAnticoag = meds.some(m => m.includes('eliquis') || m.includes('warfarin') || m.includes('coumadin') || m.includes('aspirin') || m.includes('xarelto'));
    if (isAnticoag) {
      rules.push({
        id: 'anticoag-food',
        category: 'medication',
        severity: 'warning',
        patientStateTrigger: 'Active Anticoagulant / Antiplatelet Therapy',
        foodToAvoid: 'Excessive Omega-3 / Fish Oil (>1000mg DHA), Ginkgo Biloba, high-dose Garlic extracts',
        clinicalRationale: 'Potentiates systemic antiplatelet activity and elevates spontaneous bleeding risk.',
        recommendedAlternatives: 'Cap Omega-3 at <=1000mg/day. Focus on dietary wild salmon & chia seeds.',
        icon: '🩸'
      });
    }

    // 2. Hypertension Rule
    if (sysBp > 130 || hrVal > 80) {
      rules.push({
        id: 'hypertension-food',
        category: 'cardiovascular',
        severity: 'warning',
        patientStateTrigger: `Systolic BP ${sysBp} mmHg / HR ${hrVal} bpm`,
        foodToAvoid: 'Ultra-processed high-sodium foods (>2000mg Na/day), Licorice candy (Glycyrrhizin)',
        clinicalRationale: 'Glycyrrhizin inhibits 11-beta-HSD2 causing sodium retention & secondary BP spikes.',
        recommendedAlternatives: 'DASH diet: Avocados, spinach, beetroot juice (NO vasodilation), Hibiscus tea.',
        icon: '🫀'
      });
    }

    // 3. CYP3A4 Statin Rule
    const onStatin = meds.some(m => m.includes('statin') || m.includes('atorvastatin') || m.includes('simvastatin') || m.includes('amlodipine'));
    if (onStatin) {
      rules.push({
        id: 'cyp3a4-grapefruit',
        category: 'medication',
        severity: 'critical',
        patientStateTrigger: 'CYP3A4 Substrate Medication (Statin / CCB)',
        foodToAvoid: 'Grapefruit, Grapefruit Juice, Pomelos',
        clinicalRationale: 'Furanocoumarins irreversibly inhibit intestinal CYP3A4, raising drug levels 300-500%.',
        recommendedAlternatives: 'Organic lemons, limes, oranges, and pomegranates.',
        icon: '🍊'
      });
    }

    // 4. Default High-Vigor / Polymath Chrono Rule
    const occ = this.patientState.occupation().toLowerCase();
    if (occ.includes('polymath') || occ.includes('scholar') || occ.includes('astronaut')) {
      rules.push({
        id: 'polymath-hyper-ideation',
        category: 'metabolic',
        severity: 'info',
        patientStateTrigger: 'Polymath Multi-Domain Context Switching (11-1021-POLY)',
        foodToAvoid: 'Late-night high-glycemic carbohydrates & caffeine within 6 hours of sleep',
        clinicalRationale: 'Prevents nocturnal hyper-ideation neural loops and pineal melatonin suppression.',
        recommendedAlternatives: 'Magnesium L-Threonate + Tart Cherry juice + Chamomile 60 mins before bed.',
        icon: '🧠'
      });
    }

    return rules;
  });
}
