import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { RevealDirective } from '../directives/reveal.directive';

export interface IDualRevealPair {
  id: string;
  category: string;
  title: string;
  westernInsight: string;
  traditionalInsight: string;
  cadenceRecommendation: string;
}

@Component({
  selector: 'app-cycling-ergonomics-dual-reveal',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 rounded-3xl bg-slate-900/80 dark:bg-zinc-950/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl font-sans text-slate-100 mb-8">
      
      <!-- Component Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300">🚲</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">Aerobic Conditioning & Dual-Insight Engine</span>
              <pocket-gull-badge label="Cycling Ergonomics & Dual Reveal" severity="success"></pocket-gull-badge>
            </div>
            <h3 class="text-lg font-extrabold text-white tracking-tight mt-0.5">Outdoor Bike Riding & Synchronized Twin Reveals</h3>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
            Zone 2 Aerobic Base Target: 80 - 95 RPM
          </span>
        </div>
      </div>

      <!-- Cycling Ergonomic Benefits Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div class="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase text-emerald-400 font-mono">
            <span>🫀</span> Zone 2 Aerobic Base
          </div>
          <p class="text-xs text-slate-300 leading-relaxed font-sans">
            Steady 85 RPM cycling maintains fat oxidation (Zone 2) while building mitochondrial density and preserving cardiac stroke volume without joint shearing.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div class="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase text-sky-400 font-mono">
            <span>🦵</span> Joint-Sparing Mobility
          </div>
          <p class="text-xs text-slate-300 leading-relaxed font-sans">
            Closed-chain pedal revolutions lubricate knee articular cartilage with synovial fluid, reducing axial lumbar compression compared to high-impact running.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div class="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase text-amber-400 font-mono">
            <span>☀️</span> Circadian Outdoor Exposure
          </div>
          <p class="text-xs text-slate-300 leading-relaxed font-sans">
            Outdoor daytime bike rides provide full-spectrum ocular photons, resetting central SCN clock rhythms and optimizing evening melatonin secretion.
          </p>
        </div>

      </div>

      <!-- Dual-Insight Synchronized Twin Reveals (Paired Side-by-Side) -->
      <div class="mt-6">
        <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <span>♊</span> Synchronized Dual-Paradigm Reveal Cards (Matching Insights)
        </h4>

        <div class="space-y-4">
          @for (pair of dualPairs; track pair.id) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 transition-all hover:border-emerald-500/40">
              
              <!-- Reveal Card 1: Western Allopathic Insight -->
              <div appReveal [revealDelay]="100" class="p-4 rounded-xl bg-sky-950/30 border border-sky-500/40 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">🔬 Western Allopathic View</span>
                    <span class="text-[10px] font-mono text-slate-400">Twin Reveal A</span>
                  </div>
                  <h5 class="text-sm font-bold text-white mb-1.5">{{ pair.title }}</h5>
                  <p class="text-xs text-slate-300 leading-relaxed">{{ pair.westernInsight }}</p>
                </div>
                <div class="mt-3 pt-2 border-t border-sky-500/20 text-[11px] font-mono text-sky-300 font-semibold">
                  Cadence: {{ pair.cadenceRecommendation }}
                </div>
              </div>

              <!-- Reveal Card 2: Traditional Eastern / Ayurvedic Insight -->
              <div appReveal [revealDelay]="250" class="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">☯️ Eastern / 🕉️ Vedic View</span>
                    <span class="text-[10px] font-mono text-slate-400">Twin Reveal B</span>
                  </div>
                  <h5 class="text-sm font-bold text-white mb-1.5">{{ pair.title }}</h5>
                  <p class="text-xs text-slate-300 leading-relaxed">{{ pair.traditionalInsight }}</p>
                </div>
                <div class="mt-3 pt-2 border-t border-emerald-500/20 text-[11px] font-mono text-emerald-300 font-semibold">
                  Harmony: Synchronized Resonant Transport
                </div>
              </div>

            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class CyclingErgonomicsDualRevealComponent {
  state = inject(PatientStateService);

  readonly dualPairs: IDualRevealPair[] = [
    {
      id: 'dual_vo2_lung',
      category: 'Cardiopulmonary',
      title: 'VO2 Max Expansion & Resonant Oxygenation',
      westernInsight: 'Zone 2 cycling (65-75% max HR) increases mitochondrial volume density in Type I muscle fibers and raises VO2 max by 12-15% over 8 weeks.',
      traditionalInsight: 'TCM Lung-Qi governs atmospheric intake. Rhythmic pedal cadence regulates the Zong Qi (Chest Gathering Qi), strengthening Wei Qi immunity.',
      cadenceRecommendation: '85 - 90 RPM smooth pedal stroke'
    },
    {
      id: 'dual_lactic_agni',
      category: 'Metabolism',
      title: 'Lactic Clearance & Agni Digestive Fire',
      westernInsight: 'Active pedal recovery accelerates lactate shuttle via MCT1 transporters, preventing intracellular acidification and post-exercise soreness.',
      traditionalInsight: 'Ayurvedic Samana Vayu kindles Agni (digestive fire) in the lower belly during outdoor rides, burning Ama (metabolic toxins).',
      cadenceRecommendation: '75 - 85 RPM moderate resistance'
    },
    {
      id: 'dual_hrv_shen',
      category: 'Autonomic',
      title: 'Vagal HRV Resonant Flow & Heart-Shen Tranquility',
      westernInsight: 'Outdoor cycling in green environments increases High-Frequency (HF) HRV power by 28%, signalling parasympathetic vagal recovery.',
      traditionalInsight: 'Movement through open nature calms the Heart-Shen (Mind Spirit), alleviating Liver Qi Stagnation and promoting smooth circulation.',
      cadenceRecommendation: '80 - 90 RPM fluid rhythm'
    }
  ];
}
