import { Component, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetAuditoryService } from '../services/pet-auditory.service';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-instant-patient-action-suite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-4xl mx-auto my-6 p-6 rounded-lg border-2 border-indigo-500/40 dark:border-indigo-500/50 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/60 shadow-lg text-slate-900 dark:text-zinc-100 no-print">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-200/60 dark:border-indigo-800/60 pb-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl animate-pulse">⚡</span>
            <span class="font-mono text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded bg-indigo-600 text-white shadow-sm">
              Instant Patient Action Suite
            </span>
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Interactive
            </span>
          </div>
          <h2 class="text-base font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wider mt-1.5">
            Instant Somatic Relief & Companion Co-Regulation
          </h2>
          <p class="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 font-medium">
            Select an instant protocol below to regulate your nervous system, co-regulate with a service animal, or simulate cellular recovery.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button type="button" (click)="toggleTab('relief')"
            [class.bg-indigo-600]="activeTab() === 'relief'"
            [class.text-white]="activeTab() === 'relief'"
            [class.bg-white]="activeTab() !== 'relief'"
            [class.dark:bg-zinc-800]="activeTab() !== 'relief'"
            class="px-3.5 py-2 min-h-[44px] text-xs font-extrabold uppercase tracking-wider rounded border border-indigo-300 dark:border-indigo-700 transition cursor-pointer">
            🧘 Instant Relief
          </button>
          <button type="button" (click)="toggleTab('pet')"
            [class.bg-indigo-600]="activeTab() === 'pet'"
            [class.text-white]="activeTab() === 'pet'"
            [class.bg-white]="activeTab() !== 'pet'"
            [class.dark:bg-zinc-800]="activeTab() !== 'pet'"
            class="px-3.5 py-2 min-h-[44px] text-xs font-extrabold uppercase tracking-wider rounded border border-indigo-300 dark:border-indigo-700 transition cursor-pointer">
            🐕 Service Animal
          </button>
          <button type="button" (click)="toggleTab('simulator')"
            [class.bg-indigo-600]="activeTab() === 'simulator'"
            [class.text-white]="activeTab() === 'simulator'"
            [class.bg-white]="activeTab() !== 'simulator'"
            [class.dark:bg-zinc-800]="activeTab() !== 'simulator'"
            class="px-3.5 py-2 min-h-[44px] text-xs font-extrabold uppercase tracking-wider rounded border border-indigo-300 dark:border-indigo-700 transition cursor-pointer">
            🎮 Health Simulator
          </button>
        </div>
      </div>

      <!-- Tab 1: Instant Somatic Relief -->
      @if (activeTab() === 'relief') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
          
          <!-- 4-7-8 Breathing Trainer -->
          <div class="p-4 rounded-md border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">🫁 4-7-8 Bio-Breathing</span>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {{ breathingPhase() }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-3">
                Inhale 4s, Hold 7s, Exhale 8s to stimulate parasympathetic vagal nerve tone.
              </p>

              <!-- Interactive Breathing Circle -->
              <div class="flex items-center justify-center my-3">
                <div class="relative w-20 h-20 rounded-full border-4 border-indigo-500 flex items-center justify-center transition-all duration-1000"
                  [style.transform]="breathingCircleScale()">
                  <span class="text-xs font-extrabold font-mono text-indigo-700 dark:text-indigo-300">
                    {{ isBreathingActive() ? breathingTimer() + 's' : 'START' }}
                  </span>
                </div>
              </div>
            </div>

            <button type="button" (click)="toggleBreathing()"
              [class.bg-emerald-600]="isBreathingActive()"
              [class.bg-indigo-600]="!isBreathingActive()"
              class="w-full min-h-[44px] py-2 px-4 rounded text-white text-xs font-extrabold uppercase tracking-wider transition hover:opacity-90 cursor-pointer">
              {{ isBreathingActive() ? '⏸ Pause Pacer' : '▶ Start 4-7-8 Pacer' }}
            </button>
          </div>

          <!-- Acute Pain Vagus Cooling -->
          <div class="p-4 rounded-md border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">🧊 Vagus Nerve Cooling</span>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  {{ coolingTimer() > 0 ? coolingTimer() + 's' : 'READY' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-3">
                Apply cold compress or ice water to carotid / vagal sinus area for 60 seconds to reset pain signaling.
              </p>
              
              <!-- Progress Meter -->
              <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-3 mb-3 overflow-hidden">
                <div class="bg-sky-500 h-full transition-all duration-300" [style.width.%]="coolingProgress()"></div>
              </div>
            </div>

            <button type="button" (click)="startCooling()"
              [disabled]="isCoolingActive()"
              class="w-full min-h-[44px] py-2 px-4 rounded bg-sky-600 disabled:bg-slate-400 text-white text-xs font-extrabold uppercase tracking-wider transition hover:opacity-90 cursor-pointer">
              {{ isCoolingActive() ? '🧊 Cooling Active (' + coolingTimer() + 's)' : '🧊 Start 60s Vagal Cooling' }}
            </button>
          </div>

          <!-- Anti-Inflammatory Recipe Generator -->
          <div class="p-4 rounded-md border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">☕ Golden Electrolyte Elixir</span>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                  Instant Recipe
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-2">
                Turmeric (Curcumin) + Piperine + Magnesium + Coconut Water to quench oxidative stress.
              </p>
              <div class="text-[11px] font-mono bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 leading-relaxed mb-3">
                • 250ml Warm Coconut Water<br>
                • 1/2 tsp Organic Turmeric<br>
                • 1 pinch Black Pepper (Piperine)<br>
                • 200mg Magnesium Citrate
              </div>
            </div>

            <button type="button" (click)="copyRecipe()"
              class="w-full min-h-[44px] py-2 px-4 rounded bg-amber-600 text-white text-xs font-extrabold uppercase tracking-wider transition hover:opacity-90 cursor-pointer">
              {{ isRecipeCopied() ? '✓ Recipe Copied to Clipboard!' : '📋 Copy Elixir Recipe' }}
            </button>
          </div>

        </div>
      }

      <!-- Tab 2: Service Animal Co-Regulation -->
      @if (activeTab() === 'pet') {
        <div class="p-4 rounded-md border border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 text-center animate-in fade-in duration-300">
          <h3 class="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1">
            🐕 Service Animal & Companion Co-Regulation Audio Suite
          </h3>
          <p class="text-xs text-slate-600 dark:text-zinc-400 mb-4 max-w-lg mx-auto font-medium">
            Select an acoustic entrainment mode below. Is a service dog or comforting pet in the room helping you heal?
          </p>

          <div class="flex flex-wrap justify-center gap-3">
            <button (click)="petAuditory.playCanineHeartbeat()" 
              [class.bg-amber-600]="petAuditory.currentMode === 'canine'"
              [class.text-white]="petAuditory.currentMode === 'canine'"
              class="min-h-[48px] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded border border-amber-500 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer hover:border-amber-600">
              🐕 Canine Service (60 bpm)
            </button>
            <button (click)="petAuditory.playFelinePurr()" 
              [class.bg-emerald-600]="petAuditory.currentMode === 'feline'"
              [class.text-white]="petAuditory.currentMode === 'feline'"
              class="min-h-[48px] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded border border-emerald-500 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer hover:border-emerald-600">
              🐈 Feline Purr (25-50 Hz)
            </button>
            <button (click)="petAuditory.playCetaceanTherapy()" 
              [class.bg-sky-600]="petAuditory.currentMode === 'cetacean'"
              [class.text-white]="petAuditory.currentMode === 'cetacean'"
              class="min-h-[48px] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded border border-sky-500 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer hover:border-sky-600">
              🐬 Cetacean Bio-Waves
            </button>
            <button (click)="petAuditory.playAvianTherapy()" 
              [class.bg-indigo-600]="petAuditory.currentMode === 'avian'"
              [class.text-white]="petAuditory.currentMode === 'avian'"
              class="min-h-[48px] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded border border-indigo-500 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer hover:border-indigo-600">
              🦜 Avian Dawn Chorus
            </button>
            @if(petAuditory.isCurrentlyPlaying) {
              <button (click)="petAuditory.stop()" class="min-h-[48px] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded border border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 cursor-pointer">
                ⏹ Stop Audio
              </button>
            }
          </div>
        </div>
      }

      <!-- Tab 3: Interactive Health Simulator -->
      @if (activeTab() === 'simulator') {
        <div class="p-4 rounded-md border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 animate-in fade-in duration-300">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                🎮 Live Bio-Feedback Health Simulator ("My Health Dial")
              </h3>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Adjust sliders to simulate how lifestyle habits immediately shift your vital score & cellular recovery.
              </p>
            </div>

            <!-- Dynamic Vitality Score Badge -->
            <div class="text-right">
              <span class="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">{{ calculatedVitalityScore() }}%</span>
              <span class="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Predicted Vitality</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <!-- Sleep Hours Slider -->
            <div class="p-3 rounded bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <div class="flex justify-between items-center mb-1">
                <span class="font-extrabold text-slate-700 dark:text-zinc-200">😴 Sleep Duration</span>
                <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ simSleep() }} hrs</span>
              </div>
              <input type="range" min="4" max="10" step="0.5" [value]="simSleep()" (input)="updateSleep($event)"
                class="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded appearance-none cursor-pointer accent-indigo-600" />
            </div>

            <!-- Hydration Slider -->
            <div class="p-3 rounded bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <div class="flex justify-between items-center mb-1">
                <span class="font-extrabold text-slate-700 dark:text-zinc-200">💧 Daily Hydration</span>
                <span class="font-mono font-bold text-sky-600 dark:text-sky-400">{{ simHydration() }} L</span>
              </div>
              <input type="range" min="1.0" max="4.5" step="0.25" [value]="simHydration()" (input)="updateHydration($event)"
                class="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded appearance-none cursor-pointer accent-sky-600" />
            </div>

            <!-- Stress Level Slider -->
            <div class="p-3 rounded bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <div class="flex justify-between items-center mb-1">
                <span class="font-extrabold text-slate-700 dark:text-zinc-200">🧘 Stress Load</span>
                <span class="font-mono font-bold text-rose-600 dark:text-rose-400">{{ simStress() }} / 10</span>
              </div>
              <input type="range" min="1" max="10" step="1" [value]="simStress()" (input)="updateStress($event)"
                class="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded appearance-none cursor-pointer accent-rose-600" />
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class InstantPatientActionSuiteComponent implements OnDestroy {
  protected readonly petAuditory = inject(PetAuditoryService);
  protected readonly patientState = inject(PatientStateService);

  activeTab = signal<'relief' | 'pet' | 'simulator'>('relief');

  // Breathing Pacer State
  isBreathingActive = signal(false);
  breathingPhase = signal<'Inhale 4s' | 'Hold 7s' | 'Exhale 8s'>('Inhale 4s');
  breathingTimer = signal(4);
  private breathingIntervalId: any = null;

  // Vagus Cooling State
  isCoolingActive = signal(false);
  coolingTimer = signal(0);
  coolingProgress = computed(() => (this.coolingTimer() / 60) * 100);
  private coolingIntervalId: any = null;

  // Recipe Copy State
  isRecipeCopied = signal(false);

  // Health Simulator Sliders
  simSleep = signal<number>(7.5);
  simHydration = signal<number>(2.5);
  simStress = signal<number>(3);

  calculatedVitalityScore = computed(() => {
    const sleepScore = (this.simSleep() / 8) * 40;
    const hydScore = (this.simHydration() / 3) * 30;
    const stressDeduction = (this.simStress() / 10) * 30;
    const raw = Math.round(sleepScore + hydScore + (30 - stressDeduction));
    return Math.min(100, Math.max(10, raw));
  });

  breathingCircleScale = computed(() => {
    const phase = this.breathingPhase();
    if (phase === 'Inhale 4s') return 'scale(1.4)';
    if (phase === 'Hold 7s') return 'scale(1.4)';
    return 'scale(0.85)';
  });

  toggleTab(tab: 'relief' | 'pet' | 'simulator') {
    this.activeTab.set(tab);
  }

  toggleBreathing() {
    if (this.isBreathingActive()) {
      this.isBreathingActive.set(false);
      clearInterval(this.breathingIntervalId);
    } else {
      this.isBreathingActive.set(true);
      this.runBreathingLoop();
    }
  }

  private runBreathingLoop() {
    let currentStep = 0; // 0: inhale (4s), 1: hold (7s), 2: exhale (8s)
    let timeLeft = 4;
    this.breathingPhase.set('Inhale 4s');
    this.breathingTimer.set(timeLeft);

    this.breathingIntervalId = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        currentStep = (currentStep + 1) % 3;
        if (currentStep === 0) {
          this.breathingPhase.set('Inhale 4s');
          timeLeft = 4;
        } else if (currentStep === 1) {
          this.breathingPhase.set('Hold 7s');
          timeLeft = 7;
        } else {
          this.breathingPhase.set('Exhale 8s');
          timeLeft = 8;
        }
      }
      this.breathingTimer.set(timeLeft);
    }, 1000);
  }

  startCooling() {
    this.isCoolingActive.set(true);
    this.coolingTimer.set(60);
    this.coolingIntervalId = setInterval(() => {
      this.coolingTimer.update(t => {
        if (t <= 1) {
          clearInterval(this.coolingIntervalId);
          this.isCoolingActive.set(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  copyRecipe() {
    const recipe = "Golden Electrolyte Elixir:\n- 250ml Warm Coconut Water\n- 1/2 tsp Organic Turmeric (Curcumin)\n- 1 pinch Black Pepper (Piperine)\n- 200mg Magnesium Citrate";
    navigator.clipboard.writeText(recipe).then(() => {
      this.isRecipeCopied.set(true);
      setTimeout(() => this.isRecipeCopied.set(false), 3000);
    });
  }

  updateSleep(event: Event) {
    this.simSleep.set(parseFloat((event.target as HTMLInputElement).value));
  }

  updateHydration(event: Event) {
    this.simHydration.set(parseFloat((event.target as HTMLInputElement).value));
  }

  updateStress(event: Event) {
    this.simStress.set(parseInt((event.target as HTMLInputElement).value, 10));
  }

  ngOnDestroy() {
    if (this.breathingIntervalId) clearInterval(this.breathingIntervalId);
    if (this.coolingIntervalId) clearInterval(this.coolingIntervalId);
  }
}
