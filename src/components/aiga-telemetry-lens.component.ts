import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { AigaModelAugmentationService } from '../services/aiga-model-augmentation.service';

@Component({
  selector: 'app-aiga-telemetry-lens',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 rounded-3xl bg-slate-900/85 dark:bg-zinc-950/90 border border-purple-500/30 backdrop-blur-2xl shadow-2xl font-sans text-slate-100 mb-8">
      
      <!-- Component Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2.5 rounded-2xl bg-purple-500/20 text-purple-300">🤖</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-purple-400">AIGA 2025/2026 AI Model Suite</span>
              <pocket-gull-badge label="Enriched Diagnostic Omics" severity="purple"></pocket-gull-badge>
            </div>
            <h3 class="text-lg font-extrabold text-white tracking-tight mt-0.5">AIGA Neural Model Telemetry & Omics Telemetry</h3>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
            Model: {{ telemetry().modelVersion }}
          </span>
        </div>
      </div>

      <!-- Key AIGA Metrics Banner -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        
        <!-- 1. Biological Age Delta -->
        <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            UK Biobank Longevity Delta
          </div>
          <div class="text-xl font-extrabold text-emerald-400">
            {{ telemetry().biologicalAgeDeltaYears > 0 ? '+' : '' }}{{ telemetry().biologicalAgeDeltaYears }} Yrs
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Biological Age vs Chronological</p>
        </div>

        <!-- 2. PhysioNet 2025 Risk -->
        <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            PhysioNet 2025 Ischemia Risk
          </div>
          <div class="text-xl font-extrabold text-sky-400">
            {{ telemetry().ecgArrhythmiaRisk }}% (Low)
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Deep Neural ECG Model</p>
        </div>

        <!-- 3. Polygenic Risk Percentile -->
        <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Polygenic Risk (PRS)
          </div>
          <div class="text-xl font-extrabold text-purple-400">
            {{ telemetry().polygenicRiskScorePercentile }}th Percentile
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Favorable Genetic Profile</p>
        </div>

        <!-- 4. Diagnostic Confidence -->
        <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            AIGA Confidence Score
          </div>
          <div class="text-xl font-extrabold text-amber-400">
            {{ telemetry().aigaDiagnosticConfidence }}%
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Multi-Modal Consensus</p>
        </div>

      </div>

      <!-- NMR Metabolomics Spectrum Grid -->
      <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
        <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 mb-3 flex items-center gap-2">
          <span>🧪</span> Serum NMR Metabolomics Spectrum (AIGA Augmented Data Stream)
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span class="text-slate-400 font-mono">BCAA Concentration:</span>
            <span class="font-bold text-slate-200">{{ telemetry().nmrMetabolomics.bcaaLevel }}</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span class="text-slate-400 font-mono">Lactate / Pyruvate:</span>
            <span class="font-bold text-slate-200">{{ telemetry().nmrMetabolomics.lactatePyruvateRatio }}</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span class="text-slate-400 font-mono">Endothelial TMAO:</span>
            <span class="font-bold text-slate-200">{{ telemetry().nmrMetabolomics.tmaoLevel }}</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span class="text-slate-400 font-mono">Cellular Glutathione:</span>
            <span class="font-bold text-emerald-400 font-semibold">{{ telemetry().nmrMetabolomics.glutathioneStatus }}</span>
          </div>

        </div>
      </div>

    </div>
  `
})
export class AigaTelemetryLensComponent {
  aigaService = inject(AigaModelAugmentationService);
  state = inject(PatientStateService);

  readonly telemetry = computed(() => this.aigaService.generateAigaTelemetry());
}
