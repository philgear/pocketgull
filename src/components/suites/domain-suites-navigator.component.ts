import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiomedicalSuiteComponent } from './biomedical-suite.component';
import { TherapeuticsSuiteComponent } from './therapeutics-suite.component';
import { NutritionSuiteComponent } from './nutrition-suite.component';
import { RecoverySuiteComponent } from './recovery-suite.component';
import { TuringSuiteComponent } from '../turing/turing-suite.component';
import { NobelLaureatesSuiteComponent } from '../nobel/nobel-laureates-suite.component';
import { PatientStateService } from '../../services/patient-state.service';
import { CircadianSleepinessService } from '../../services/circadian-sleepiness.service';
import { ThemeService } from '../../services/theme.service';

export type DomainSuiteId = 'biomedical' | 'therapeutics' | 'nutrition' | 'recovery' | 'turing' | 'nobel';

export interface IDomainSuite {
  id: DomainSuiteId;
  name: string;
  subtitle: string;
  icon: string;
  badge: string;
}

@Component({
  selector: 'app-domain-suites-navigator',
  standalone: true,
  imports: [
    CommonModule,
    BiomedicalSuiteComponent,
    TherapeuticsSuiteComponent,
    NutritionSuiteComponent,
    RecoverySuiteComponent,
    TuringSuiteComponent,
    NobelLaureatesSuiteComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-10 space-y-6 font-sans">
      
      <!-- Top Ground Truth Telemetry Bar -->
      <div class="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <div>
            <span class="text-xs text-zinc-400 uppercase tracking-widest block font-bold">Unified Patient Ground Truth</span>
            <h2 class="text-base font-extrabold text-white flex items-center gap-2">
              <span>{{ activePatientName() }}</span>
              <span class="text-xs font-normal text-zinc-400">({{ activePatientAge() }} y/o {{ activePatientGender() }})</span>
            </h2>
          </div>
        </div>

        <!-- Telemetry Pill Indicators -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700">
            BP: <strong class="text-emerald-400">{{ vitals().bp || '120/80' }}</strong>
          </span>
          <span class="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700">
            HR: <strong class="text-emerald-400">{{ vitals().hr || 72 }} bpm</strong>
          </span>
          <span class="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700">
            SpO2: <strong class="text-emerald-400">{{ vitals().spO2 || '98%' }}</strong>
          </span>
          <span class="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
            KSS Readiness: <strong class="text-amber-400">Score {{ clinicianKss() }}</strong>
          </span>
        </div>
      </div>

      <!-- Domain Suite Selector & Paradigm Diff Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        
        <!-- Functional Domain Suite Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 font-mono">
          @for (suite of suites; track suite.id) {
            <button 
              (click)="activeSuite.set(suite.id)"
              [class]="activeSuite() === suite.id
                ? 'px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2'
                : 'px-3.5 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs font-semibold transition-all flex items-center gap-2'">
              <span>{{ suite.icon }}</span>
              <span>{{ suite.name }}</span>
            </button>
          }
        </div>

        <!-- Paradigm Diff Mode Toggle -->
        <div class="flex items-center gap-2 font-mono text-xs border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-2 md:pt-0 md:pl-4">
          <span class="text-zinc-500 font-bold uppercase">Paradigm Diff:</span>
          <button 
            (click)="toggleParadigmDiff()"
            [class]="showParadigmDiff() 
              ? 'px-3 py-1.5 rounded-xl bg-orange-600 text-white font-bold transition shadow-sm'
              : 'px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold transition'">
            {{ showParadigmDiff() ? '⚡ Diff Active' : 'Off (Full Lens)' }}
          </button>
        </div>
      </div>

      <!-- Paradigm Diff Notice Banner -->
      @if (showParadigmDiff()) {
        <div class="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-950 dark:text-orange-200 text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div class="flex items-center gap-2.5">
            <span class="text-lg">⚡</span>
            <div>
              <strong class="font-extrabold uppercase">Paradigm Diff Overlay Active (Zero Content Duplication)</strong>
              <p class="text-[11px] opacity-80 mt-0.5 font-sans">
                Suppressing baseline vitals and history repetition. Rendering exclusively novel paradigm-specific differentials for <strong class="uppercase text-orange-600 dark:text-orange-400">{{ activePhilosophy() }}</strong> mode.
              </p>
            </div>
          </div>
        </div>
      }

      <!-- Active Suite Component View -->
      <div class="animate-in fade-in duration-300">
        @switch (activeSuite()) {
          @case ('biomedical') { <app-biomedical-suite /> }
          @case ('therapeutics') { <app-therapeutics-suite /> }
          @case ('nutrition') { <app-nutrition-suite /> }
          @case ('recovery') { <app-recovery-suite /> }
          @case ('turing') { <app-turing-suite /> }
          @case ('nobel') { <app-nobel-laureates-suite /> }
        }
      </div>
    </div>
  `
})
export class DomainSuitesNavigatorComponent {
  private patientState = inject(PatientStateService);
  private circadianService = inject(CircadianSleepinessService);
  private themeService = inject(ThemeService);

  activeSuite = signal<DomainSuiteId>('biomedical');
  showParadigmDiff = signal<boolean>(true);

  activePatientName = this.patientState.patientName;
  activePatientAge = this.patientState.patientAge;
  activePatientGender = this.patientState.patientGender;
  vitals = this.patientState.vitals;
  clinicianKss = computed(() => this.circadianService.readiness()?.clinicianKss ?? 1);
  activePhilosophy = this.patientState.activePhilosophy;

  suites: IDomainSuite[] = [
    { id: 'biomedical', name: 'Biomedical & Diagnostic', subtitle: 'Ground Truth Telemetry', icon: '🧬', badge: 'Lab & Vitals' },
    { id: 'therapeutics', name: 'Therapeutics & Botanical', subtitle: 'Precision Formulas', icon: '🌿', badge: 'Nutrients & Herbs' },
    { id: 'nutrition', name: 'Nutritional & Metabolic', subtitle: 'Circadian Meal Planning', icon: '🥗', badge: 'Thermal Matrix' },
    { id: 'recovery', name: 'Kinetic & Recovery', subtitle: '120 BPM Entrainment', icon: '⚡', badge: 'Vagal & Playbook' },
    { id: 'turing', name: 'Turing Formal Logic', subtitle: 'Cellular Automata & Petri Net Deadlock Models', icon: '🧮', badge: 'Turing' },
    { id: 'nobel', name: 'Nobel Evidence Engine', subtitle: 'Ohsumi, Hall & Pääbo Breakthrough Models', icon: '🏆', badge: 'Nobel' }
  ];

  toggleParadigmDiff() {
    this.showParadigmDiff.update(v => !v);
  }
}
