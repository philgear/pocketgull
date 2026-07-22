import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { ProceduralHealthInvestmentService } from '../services/procedural-health-investment.service';

@Component({
  selector: 'app-procedural-investment-matrix',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 rounded-3xl bg-slate-900/85 dark:bg-zinc-950/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl font-sans text-slate-100 mb-8">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300">📈</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">Actuarial Financial & Healthspan ROI</span>
              <pocket-gull-badge label="Procedural Innovation & Investment" severity="success"></pocket-gull-badge>
            </div>
            <h3 class="text-lg font-extrabold text-white tracking-tight mt-0.5">Procedural Innovations & Capital Return Matrix</h3>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
            Total 5-Yr Cost Avoidance: {{ totalSavings() | currency:'USD':'symbol':'1.0-0' }}
          </span>
        </div>
      </div>

      <!-- Procedural Investment Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (item of investments(); track item.id) {
          <div class="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {{ item.category }}
                </span>
                <span class="text-xs font-mono font-extrabold text-emerald-400">
                  {{ item.actuarialRoiRatio }}x Actuarial ROI
                </span>
              </div>

              <h4 class="text-sm font-bold text-white mb-2">{{ item.proceduralInnovation }}</h4>
              <p class="text-xs text-slate-300 leading-relaxed font-sans">{{ item.roiBreakdown }}</p>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div class="text-[10px] text-slate-400 uppercase">Upfront</div>
                <div class="font-bold text-slate-200 mt-0.5">{{ item.upfrontInvestmentUsd | currency:'USD':'symbol':'1.0-0' }}</div>
              </div>
              <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div class="text-[10px] text-slate-400 uppercase">5-Yr Savings</div>
                <div class="font-bold text-emerald-400 mt-0.5">{{ item.projected5YearSavingsUsd | currency:'USD':'symbol':'1.0-0' }}</div>
              </div>
              <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div class="text-[10px] text-slate-400 uppercase">QALY Yield</div>
                <div class="font-bold text-sky-400 mt-0.5">+{{ item.qalyYield }} QALYs</div>
              </div>
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class ProceduralInvestmentMatrixComponent {
  investmentService = inject(ProceduralHealthInvestmentService);

  readonly investments = computed(() => this.investmentService.calculateProceduralInvestments());

  readonly totalSavings = computed(() => {
    return this.investments().reduce((sum, item) => sum + item.projected5YearSavingsUsd, 0);
  });
}
