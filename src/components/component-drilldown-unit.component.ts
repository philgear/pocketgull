import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { BiomarkerMatrixComponent } from './biomarker-matrix.component';
import { OccupationalHazardCardComponent } from './occupational-hazard-card.component';
import { FoodSafetyGuardrailCardComponent } from './food-safety-guardrail-card.component';
import { YbocsScreenerComponent } from './ybocs-screener.component';
import { ActuarialQalyCalculatorComponent } from './actuarial-qaly-calculator.component';
import { AndroscogginForagingPhytoncideComponent } from './androscoggin-foraging-phytoncide.component';
import { VagalBiofeedbackDockComponent } from './vagal-biofeedback-dock.component';

export type DrilldownTarget = 'biomarkers' | 'occupational' | 'food_safety' | 'ybocs' | 'qaly' | 'foraging' | 'vagal' | null;

@Component({
  selector: 'app-component-drilldown-unit',
  standalone: true,
  imports: [
    CommonModule,
    BiomarkerMatrixComponent,
    OccupationalHazardCardComponent,
    FoodSafetyGuardrailCardComponent,
    YbocsScreenerComponent,
    ActuarialQalyCalculatorComponent,
    AndroscogginForagingPhytoncideComponent,
    VagalBiofeedbackDockComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (targetComponent()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        (click)="close()">
        
        <div 
          class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col gap-4 font-sans"
          (click)="$event.stopPropagation()">
          
          <!-- Header Bar -->
          <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 font-mono">
            <div class="flex items-center gap-3">
              <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-lg">🔍</span>
              <div>
                <span class="text-[10px] uppercase font-bold text-zinc-400 tracking-widest block">Interactive Component Drill-Down Unit</span>
                <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{{ title() }}</span>
                  <span class="text-xs font-normal text-zinc-500">({{ patientName() }})</span>
                </h3>
              </div>
            </div>

            <button 
              (click)="close()"
              aria-label="Close drill-down view"
              class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center text-sm font-bold transition">
              ✕
            </button>
          </div>

          <!-- Dynamic Component View -->
          <div class="py-2">
            @switch (targetComponent()) {
              @case ('biomarkers') { <app-biomarker-matrix /> }
              @case ('occupational') { <app-occupational-hazard-card /> }
              @case ('food_safety') { <app-food-safety-guardrail-card /> }
              @case ('ybocs') { <app-ybocs-screener /> }
              @case ('qaly') { <app-actuarial-qaly-calculator /> }
              @case ('foraging') { <app-androscoggin-foraging-phytoncide /> }
              @case ('vagal') { <app-vagal-biofeedback-dock /> }
            }
          </div>

        </div>
      </div>
    }
  `
})
export class ComponentDrilldownUnitComponent {
  private patientState = inject(PatientStateService);

  targetComponent = this.patientState.activeDrilldownComponent;
  patientName = this.patientState.patientName;

  title = computed(() => {
    switch (this.targetComponent()) {
      case 'biomarkers': return 'Lab Biomarker Target Matrix';
      case 'occupational': return 'Occupational Hazard Profile';
      case 'food_safety': return 'Food-Drug & Safety Guardrails';
      case 'ybocs': return 'Y-BOCS Obsessive-Compulsive Screener';
      case 'qaly': return 'Actuarial QALY Longevity Calculator';
      case 'foraging': return 'Local Wild Botanical & Foraging';
      case 'vagal': return 'Vagal Biofeedback Resonance Dock';
      default: return 'Clinical Instrument';
    }
  });

  close() {
    this.patientState.activeDrilldownComponent.set(null);
  }
}
