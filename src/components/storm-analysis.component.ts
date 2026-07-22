import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';

export type StormTypeKey = 'cytokine' | 'sympathetic' | 'thyroid' | 'barometric';

export interface IStormProfile {
  id: StormTypeKey;
  name: string;
  icon: string;
  severityScore: number; // 1-10
  westernPerspective: string;
  easternPerspective: string;
  ayurvedicPerspective: string;
  calmingActions: string[];
}

@Component({
  selector: 'app-storm-analysis',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 rounded-3xl bg-slate-900/80 dark:bg-zinc-950/90 border border-sky-500/30 backdrop-blur-2xl shadow-2xl font-sans text-slate-100 mb-8">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2.5 rounded-2xl bg-sky-500/20 text-sky-300">🌩️</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-sky-400">Acute Multi-System Telemetry</span>
              <pocket-gull-badge label="Physiological Storm Analysis" severity="warning"></pocket-gull-badge>
            </div>
            <h3 class="text-lg font-extrabold text-white tracking-tight mt-0.5">Physiological & Environmental Storm Shield</h3>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider"
                [class.bg-emerald-500\/20]="overallStormIndex() <= 3"
                [class.text-emerald-300]="overallStormIndex() <= 3"
                [class.border-emerald-500\/40]="overallStormIndex() <= 3"
                [class.bg-amber-500\/20]="overallStormIndex() >= 4 && overallStormIndex() <= 6"
                [class.text-amber-300]="overallStormIndex() >= 4 && overallStormIndex() <= 6"
                [class.border-amber-500\/40]="overallStormIndex() >= 4 && overallStormIndex() <= 6"
                [class.bg-red-500\/20]="overallStormIndex() >= 7"
                [class.text-red-300]="overallStormIndex() >= 7"
                [class.border-red-500\/40]="overallStormIndex() >= 7">
            Storm Risk Index: {{ overallStormIndex() }}/10 — {{ stormStatusText() }}
          </span>
        </div>
      </div>

      <!-- Storm Type Selectors (Min 44px Touch Targets) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        @for (storm of stormProfiles; track storm.id) {
          <button (click)="selectedStormId.set(storm.id)"
            [class]="selectedStormId() === storm.id ? 'bg-sky-500 text-slate-950 font-extrabold shadow-lg scale-[1.02]' : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700/80 font-semibold'"
            class="py-3 px-3 min-h-[44px] rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer">
            <div class="flex items-center gap-2">
              <span class="text-base">{{ storm.icon }}</span>
              <span class="truncate">{{ storm.name }}</span>
            </div>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 font-bold">
              {{ storm.severityScore }}/10
            </span>
          </button>
        }
      </div>

      <!-- Active Storm Lens Detail -->
      @if (activeStorm(); as storm) {
        <div class="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 animate-in fade-in duration-300">
          
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <span>{{ storm.icon }}</span> {{ storm.name }} Paradigm Evaluation
            </h4>
            <span class="text-xs font-mono text-slate-400">Active Paradigm Lens: {{ state.activePhilosophy() | uppercase }}</span>
          </div>

          <!-- 3-Lens Comparison Matrix -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            
            <!-- Western -->
            <div class="p-4 rounded-xl border transition-all"
                 [class.border-sky-500\/60]="state.activePhilosophy() === 'western'"
                 [class.bg-sky-950\/40]="state.activePhilosophy() === 'western'"
                 [class.border-slate-800]="state.activePhilosophy() !== 'western'"
                 [class.bg-slate-900\/50]="state.activePhilosophy() !== 'western'">
              <div class="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase text-sky-400 font-mono">
                <span>🔬</span> Western Allopathic
              </div>
              <p class="text-xs text-slate-300 leading-relaxed font-sans">{{ storm.westernPerspective }}</p>
            </div>

            <!-- Eastern -->
            <div class="p-4 rounded-xl border transition-all"
                 [class.border-emerald-500\/60]="state.activePhilosophy() === 'eastern'"
                 [class.bg-emerald-950\/40]="state.activePhilosophy() === 'eastern'"
                 [class.border-slate-800]="state.activePhilosophy() !== 'eastern'"
                 [class.bg-slate-900\/50]="state.activePhilosophy() !== 'eastern'">
              <div class="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase text-emerald-400 font-mono">
                <span>☯️</span> Eastern TCM
              </div>
              <p class="text-xs text-slate-300 leading-relaxed font-sans">{{ storm.easternPerspective }}</p>
            </div>

            <!-- Ayurvedic -->
            <div class="p-4 rounded-xl border transition-all"
                 [class.border-amber-500\/60]="state.activePhilosophy() === 'ayurvedic'"
                 [class.bg-amber-950\/40]="state.activePhilosophy() === 'ayurvedic'"
                 [class.border-slate-800]="state.activePhilosophy() !== 'ayurvedic'"
                 [class.bg-slate-900\/50]="state.activePhilosophy() !== 'ayurvedic'">
              <div class="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase text-amber-400 font-mono">
                <span>🕉️</span> Ayurvedic Vedic
              </div>
              <p class="text-xs text-slate-300 leading-relaxed font-sans">{{ storm.ayurvedicPerspective }}</p>
            </div>

          </div>

          <!-- Storm De-escalation Shield Actions -->
          <div class="pt-4 border-t border-slate-800">
            <div class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <span>🛡️</span> Prescribed Storm De-escalation & Calming Protocol
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              @for (action of storm.calmingActions; track action) {
                <div class="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200 flex items-start gap-2">
                  <span class="text-emerald-400 mt-0.5">✓</span>
                  <span>{{ action }}</span>
                </div>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class StormAnalysisComponent {
  state = inject(PatientStateService);

  readonly selectedStormId = signal<StormTypeKey>('cytokine');

  readonly stormProfiles: IStormProfile[] = [
    {
      id: 'cytokine',
      name: 'Cytokine Inflammatory',
      icon: '🔥',
      severityScore: 3,
      westernPerspective: 'Sub-acute pro-inflammatory cytokine activity (hsCRP 1.8 mg/L, IL-6 3.2 pg/mL). Low systemic vascular leakage risk.',
      easternPerspective: 'Internal Heat accumulation in the Blood (Xue Heat) with mild Damp-Heat disturbance in the Triple Burner (San Jiao).',
      ayurvedicPerspective: 'Pitta Dosha aggravation spreading through Rakta Dhatu (blood tissue), kindling metabolic internal heat.',
      calmingActions: [
        'High-dose Curcumin & Boswellia phytotherapy',
        'Vagal resonant 0.1 Hz slow deep breathing',
        'Cold-water facial immersion & anti-inflammatory diet'
      ]
    },
    {
      id: 'sympathetic',
      name: 'Sympathetic Adrenergic',
      icon: '⚡',
      severityScore: 4,
      westernPerspective: 'Adrenergic sympathetic dominance (HRV RMSSD 24ms, LF/HF ratio 3.2). Elevated baseline cortisol & norepinephrine.',
      easternPerspective: 'Heart-Shen agitation and Liver Qi Stagnation transforming into Fire, disturbing sleep and autonomic composure.',
      ayurvedicPerspective: 'Vata Prana high-velocity imbalance agitating the Manovaha Srotas (mental channels).',
      calmingActions: [
        'Magnesium L-Threonate & Ashwagandha supplementation',
        '10-min weighted eye pillow relaxation',
        'Acoustic 432 Hz vagal tone singalong session'
      ]
    },
    {
      id: 'thyroid',
      name: 'Hyper-Metabolic Heat',
      icon: '🌡️',
      severityScore: 2,
      westernPerspective: 'Transient free T3/T4 metabolic elevation without hyperthyroid storm crisis. Normal resting heart rate.',
      easternPerspective: 'Yin Deficiency with Flaring Fire (Yin Xu Huo Wang) consuming Kidney and Heart Essence.',
      ayurvedicPerspective: 'Pitta and Tejas excess in the Thyroid Gland (Galaganda region), creating tissue dryness.',
      calmingActions: [
        'Cooling Brahmi & Shankhpushpi herbal infusion',
        'Avoidance of stimulant caffeine & nightshade crops',
        'Evening restorative Yin yoga & moonlit walks'
      ]
    },
    {
      id: 'barometric',
      name: 'Barometric Pressure',
      icon: '🌧️',
      severityScore: 3,
      westernPerspective: 'Autonomic vestibular & dural membrane sensitivity to rapid barometric pressure drops (1013 to 998 hPa).',
      easternPerspective: 'External Wind-Dampness invasion affecting joints and Sinew meridians during weather fronts.',
      ayurvedicPerspective: 'Vata movement triggered by atmospheric pressure changes, causing joint stiffness and headaches.',
      calmingActions: [
        'Warm sesame oil Abhyanga self-massage',
        'Hydration with ionic trace mineral electrolytes',
        'Ambient warm lighting (1800K) & compression garments'
      ]
    }
  ];

  readonly activeStorm = computed(() => {
    return this.stormProfiles.find(s => s.id === this.selectedStormId()) || this.stormProfiles[0];
  });

  readonly overallStormIndex = computed(() => {
    const scores = this.stormProfiles.map(s => s.severityScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  });

  readonly stormStatusText = computed(() => {
    const idx = this.overallStormIndex();
    if (idx <= 3) return 'Stable Physiological Baseline';
    if (idx <= 6) return 'Moderate Autonomic Turbulence';
    return 'Acute De-escalation Protocol Recommended';
  });
}
