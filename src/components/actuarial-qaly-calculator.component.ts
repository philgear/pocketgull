import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-actuarial-qaly-calculator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-mono relative overflow-hidden">
      
      <!-- Top Bar Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
            <h3 class="text-xs font-black uppercase tracking-widest text-zinc-100">
              📊 Actuarial QALY & Epigenetic Clock Simulation Dial
            </h3>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800 uppercase">
              Interactive Bio-Calculator
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-mono">
            Adjust clinical protocol adherence sliders to calculate real-time biological age reduction and projected QALY longevity gains.
          </p>
        </div>

        <div class="text-right text-[11px] text-zinc-400 font-mono">
          <span>Base Bio-Age: <strong class="text-zinc-200">42.5 Yrs</strong></span>
        </div>
      </div>

      <!-- Main Grid: Sliders Left + Gauges Right -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        <!-- Left 7 Cols: Interactive Adherence Sliders -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Slider 1: Vagal Breathing -->
          <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div class="flex justify-between items-center text-xs font-bold font-mono">
              <label for="vagal-breathing-mins-input" class="text-zinc-300">🫁 0.1 Hz Vagal Resonant Breathing (Daily Mins)</label>
              <span class="text-orange-400">{{ vagalBreathingMins() }} Mins/Day</span>
            </div>
            <input id="vagal-breathing-mins-input" name="vagalBreathingMins" aria-label="0.1 Hz Vagal Resonant Breathing Daily Minutes" type="range" min="0" max="30" step="5" [value]="vagalBreathingMins()" (input)="vagalBreathingMins.set(asNumber($event))"
              class="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-zinc-800" />
            <div class="flex justify-between text-[9px] text-zinc-400">
              <span>0 Mins (Sedentary)</span>
              <span>15 Mins (Target)</span>
              <span>30 Mins (Optimal)</span>
            </div>
          </div>

          <!-- Slider 2: Chrono-Nutrition -->
          <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div class="flex justify-between items-center text-xs font-bold font-mono">
              <label for="chrono-adherence-input" class="text-zinc-300">🥗 Chrono-Nutrition Window Alignment</label>
              <span class="text-orange-400">{{ chronoAdherence() }}% Alignment</span>
            </div>
            <input id="chrono-adherence-input" name="chronoAdherence" aria-label="Chrono-Nutrition Window Alignment Percentage" type="range" min="20" max="100" step="10" [value]="chronoAdherence()" (input)="chronoAdherence.set(asNumber($event))"
              class="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-zinc-800" />
            <div class="flex justify-between text-[9px] text-zinc-400">
              <span>20% (Irregular)</span>
              <span>60% (Moderate)</span>
              <span>100% (Strict BMAL1 Sync)</span>
            </div>
          </div>

          <!-- Slider 3: Exercise Biogenesis -->
          <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div class="flex justify-between items-center text-xs font-bold font-mono">
              <label for="zone2-hours-input" class="text-zinc-300">⚡ Zone 2 Aerobic Biogenesis (Hrs/Week)</label>
              <span class="text-orange-400">{{ zone2Hours() }} Hrs/Wk</span>
            </div>
            <input id="zone2-hours-input" name="zone2Hours" aria-label="Zone 2 Aerobic Biogenesis Hours Per Week" type="range" min="0" max="8" step="0.5" [value]="zone2Hours()" (input)="zone2Hours.set(asNumber($event))"
              class="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-zinc-800" />
            <div class="flex justify-between text-[9px] text-zinc-400">
              <span>0 Hrs</span>
              <span>3 Hrs (Target)</span>
              <span>8 Hrs (Athlete)</span>
            </div>
          </div>

          <!-- Slider 4: Phytochemical Nootropics -->
          <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div class="flex justify-between items-center text-xs font-bold font-mono">
              <label for="precision-dosing-input" class="text-zinc-300">🍵 Precision Phytochemical & Methyl Donor Dosing</label>
              <span class="text-orange-400">{{ precisionDosing() }}% Dosing</span>
            </div>
            <input id="precision-dosing-input" name="precisionDosing" aria-label="Precision Phytochemical Dosing Percentage" type="range" min="0" max="100" step="10" [value]="precisionDosing()" (input)="precisionDosing.set(asNumber($event))"
              class="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-zinc-800" />
            <div class="flex justify-between text-[9px] text-zinc-400">
              <span>0% (None)</span>
              <span>50% (Partial)</span>
              <span>100% (Complete Rx)</span>
            </div>
          </div>

        </div>

        <!-- Right 5 Cols: Live Calculated Telemetry Readout -->
        <div class="lg:col-span-5 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 flex flex-col justify-between">
          
          <div class="space-y-4 text-center">
            <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Actuarial Longevity Projection</span>
            
            <!-- Epigenetic Age Delta -->
            <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span class="text-[10px] font-bold uppercase text-orange-400 block mb-1">Projected Biological Age Delta</span>
              <span class="text-3xl font-black text-white font-mono tracking-tight">{{ bioAgeDelta().toFixed(1) }} Yrs</span>
              <span class="text-[10px] text-zinc-400 block mt-1">Horvath DNAm Epigenetic Clock Speed</span>
            </div>

            <!-- Projected QALY Gain -->
            <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span class="text-[10px] font-bold uppercase text-emerald-400 block mb-1">Projected QALY Longevity Gain</span>
              <span class="text-3xl font-black text-emerald-400 font-mono tracking-tight">+{{ projectedQaly().toFixed(1) }} Years</span>
              <span class="text-[10px] text-zinc-400 block mt-1">Quality-Adjusted Life-Year Expansion</span>
            </div>
          </div>

          <!-- Reset Button -->
          <button (click)="resetCalculator()"
            class="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-300 font-mono text-xs font-bold uppercase transition border border-zinc-800 cursor-pointer">
            🔄 Reset to Defaults
          </button>

        </div>

      </div>

    </div>
  `
})
export class ActuarialQalyCalculatorComponent {
  patientState = inject(PatientStateService);

  vagalBreathingMins = signal<number>(15);
  chronoAdherence = signal<number>(80);
  zone2Hours = signal<number>(3.5);
  precisionDosing = signal<number>(70);

  bioAgeDelta = computed(() => {
    const v = this.vagalBreathingMins();
    const c = this.chronoAdherence();
    const z = this.zone2Hours();
    const p = this.precisionDosing();

    // Baseline age delta computation algorithm
    const delta = -( (v * 0.12) + (c * 0.035) + (z * 0.45) + (p * 0.025) );
    return Math.max(-8.5, Math.min(-0.5, delta));
  });

  projectedQaly = computed(() => {
    const absDelta = Math.abs(this.bioAgeDelta());
    return +(absDelta * 1.65).toFixed(1);
  });

  asNumber(event: Event): number {
    return parseFloat((event.target as HTMLInputElement).value);
  }

  resetCalculator() {
    this.vagalBreathingMins.set(15);
    this.chronoAdherence.set(80);
    this.zone2Hours.set(3.5);
    this.precisionDosing.set(70);
  }
}
