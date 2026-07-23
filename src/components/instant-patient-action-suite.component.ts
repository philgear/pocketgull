import { Component, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetAuditoryService } from '../services/pet-auditory.service';
import { PatientStateService } from '../services/patient-state.service';
import { MoodConsciousnessMatrixComponent } from './mood-consciousness-matrix.component';
import { PatientHealthTrajectoryStorybookComponent } from './patient-health-trajectory-storybook.component';

@Component({
  selector: 'app-instant-patient-action-suite',
  standalone: true,
  imports: [CommonModule, MoodConsciousnessMatrixComponent, PatientHealthTrajectoryStorybookComponent],
  template: `
    <div class="relative w-full rounded-2xl border-2 p-5 sm:p-7 transition-all duration-500 bg-[#F9F3D9] dark:bg-zinc-950 text-[#1C1C1C] dark:text-zinc-100 border-[#F6B12B] dark:border-[#F6B12B]/80 shadow-[4px_6px_0px_0px_rgba(28,28,28,0.85)] dark:shadow-[4px_6px_0px_0px_rgba(0,0,0,0.9)] font-sans overflow-hidden pocket-gull-card my-6 no-print">
      
      <!-- Background Texture & Papercraft Overlay -->
      <div class="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:12px_12px]"></div>

      <!-- Header: Avian Squadron Banner & Narrative Stepper Style -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b-2 border-dashed border-[#1C1C1C]/20 dark:border-zinc-800 font-mono">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-[#F6B12B] text-zinc-950 border-2 border-[#1C1C1C] flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_rgba(28,28,28,0.9)] animate-bounce shrink-0">
            ⚡
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-extrabold uppercase tracking-widest text-[#EF6658] dark:text-orange-400">Avian Dispatch Somatic Suite</span>
              <span class="text-xs px-2.5 py-0.5 rounded-md bg-[#2AA4A0] text-white font-bold tracking-wider uppercase border border-[#1C1C1C]">
                Swoop ⚡ Dispatch
              </span>
              <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span class="w-2.5 h-2.5 rounded-full status-dot bg-emerald-500 animate-ping"></span>
                Live Co-Regulation
              </span>
            </div>
            <h2 class="text-lg sm:text-xl font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-tight mt-1">
              Instant Somatic Relief & Companion Co-Regulation
            </h2>
            <p class="text-xs sm:text-sm text-[#1C1C1C]/70 dark:text-zinc-400 font-sans mt-0.5">
              Select an instant protocol below to regulate your nervous system, co-regulate with service companions, or project vitality.
            </p>
          </div>
        </div>

        <!-- Right Controls: Tactile Persona Navigation Pills -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex flex-wrap items-center gap-1.5 bg-[#FFFFFF] dark:bg-zinc-900 p-1.5 rounded-xl border-2 border-[#1C1C1C] dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(28,28,28,0.8)] font-mono">
            <button type="button" (click)="toggleTab('relief')"
              [class.bg-[#F6B12B]]="activeTab() === 'relief'"
              [class.text-[#1C1C1C]]="activeTab() === 'relief'"
              [class.bg-transparent]="activeTab() !== 'relief'"
              [class.text-[#1C1C1C]/70]="activeTab() !== 'relief'"
              [class.dark:text-zinc-300]="activeTab() !== 'relief'"
              class="px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>🧘</span> Relief
            </button>

            <button type="button" (click)="toggleTab('storybook')"
              [class.bg-[#F6B12B]]="activeTab() === 'storybook'"
              [class.text-[#1C1C1C]]="activeTab() === 'storybook'"
              [class.bg-transparent]="activeTab() !== 'storybook'"
              [class.text-[#1C1C1C]/70]="activeTab() !== 'storybook'"
              [class.dark:text-zinc-300]="activeTab() !== 'storybook'"
              class="px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>📖</span> Storybook
            </button>

            <button type="button" (click)="toggleTab('matrix')"
              [class.bg-[#F6B12B]]="activeTab() === 'matrix'"
              [class.text-[#1C1C1C]]="activeTab() === 'matrix'"
              [class.bg-transparent]="activeTab() !== 'matrix'"
              [class.text-[#1C1C1C]/70]="activeTab() !== 'matrix'"
              [class.dark:text-zinc-300]="activeTab() !== 'matrix'"
              class="px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>🔮</span> Mind Matrix
            </button>

            <button type="button" (click)="toggleTab('pet')"
              [class.bg-[#F6B12B]]="activeTab() === 'pet'"
              [class.text-[#1C1C1C]]="activeTab() === 'pet'"
              [class.bg-transparent]="activeTab() !== 'pet'"
              [class.text-[#1C1C1C]/70]="activeTab() !== 'pet'"
              [class.dark:text-zinc-300]="activeTab() !== 'pet'"
              class="px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>🐕</span> Service Pet
            </button>

            <button type="button" (click)="toggleTab('simulator')"
              [class.bg-[#F6B12B]]="activeTab() === 'simulator'"
              [class.text-[#1C1C1C]]="activeTab() === 'simulator'"
              [class.bg-transparent]="activeTab() !== 'simulator'"
              [class.text-[#1C1C1C]/70]="activeTab() !== 'simulator'"
              [class.dark:text-zinc-300]="activeTab() !== 'simulator'"
              class="px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 min-h-[36px]">
              <span>🎮</span> Simulator
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 1: Instant Somatic Relief -->
      @if (activeTab() === 'relief') {
        <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-300">
          
          <!-- 4-7-8 Breathing Trainer -->
          <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between sub-panel">
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 font-mono">
                  <span>🫁</span> 4-7-8 Bio-Breathing
                </span>
                <span class="text-xs font-mono font-extrabold px-2.5 py-1 rounded-full bg-[#F6B12B] text-zinc-950 border border-[#1C1C1C]">
                  {{ breathingPhase() }}
                </span>
              </div>
              <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 leading-relaxed mb-4">
                Inhale 4s, Hold 7s, Exhale 8s to stimulate parasympathetic vagal nerve tone.
              </p>

              <!-- Interactive Breathing Circle -->
              <div class="flex items-center justify-center my-4">
                <div class="relative w-24 h-24 rounded-full border-4 border-[#1C1C1C] dark:border-zinc-600 bg-indigo-500/10 flex items-center justify-center transition-all duration-1000 shadow-inner"
                  [style.transform]="breathingCircleScale()">
                  <span class="text-sm font-black font-mono text-indigo-700 dark:text-indigo-300">
                    {{ isBreathingActive() ? breathingTimer() + 's' : 'START' }}
                  </span>
                </div>
              </div>
            </div>

            <button type="button" (click)="toggleBreathing()"
              [class.bg-[#10B981]]="isBreathingActive()"
              [class.bg-[#F6B12B]]="!isBreathingActive()"
              class="w-full py-3 px-4 rounded-xl border-2 border-[#1C1C1C] text-zinc-950 text-xs font-black uppercase tracking-wider transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] font-mono">
              {{ isBreathingActive() ? '⏸ Pause Pacer' : '▶ Start 4-7-8 Pacer' }}
            </button>
          </div>

          <!-- Acute Pain Vagus Cooling -->
          <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between sub-panel">
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5 font-mono">
                  <span>🧊</span> Vagus Nerve Cooling
                </span>
                <span class="text-xs font-mono font-extrabold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-[#1C1C1C]">
                  {{ coolingTimer() > 0 ? coolingTimer() + 's' : 'READY' }}
                </span>
              </div>
              <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 leading-relaxed mb-4">
                Apply cold compress or ice water to carotid / vagal sinus area for 60 seconds to reset pain signaling.
              </p>
              
              <!-- Progress Meter -->
              <div class="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3.5 mb-4 overflow-hidden border border-[#1C1C1C]">
                <div class="bg-sky-500 h-full transition-all duration-300" [style.width.%]="coolingProgress()"></div>
              </div>
            </div>

            <button type="button" (click)="startCooling()"
              [disabled]="isCoolingActive()"
              class="w-full py-3 px-4 rounded-xl border-2 border-[#1C1C1C] bg-sky-500 text-white disabled:bg-zinc-400 text-xs font-black uppercase tracking-wider transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] font-mono">
              {{ isCoolingActive() ? '🧊 Cooling Active (' + coolingTimer() + 's)' : '🧊 Start 60s Vagal Cooling' }}
            </button>
          </div>

          <!-- Anti-Inflammatory Recipe Generator -->
          <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between sub-panel">
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-mono">
                  <span>☕</span> Golden Elixir
                </span>
                <span class="text-xs font-mono font-extrabold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-[#1C1C1C]">
                  Recipe
                </span>
              </div>
              <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 leading-relaxed mb-3">
                Turmeric (Curcumin) + Piperine + Magnesium + Coconut Water to quench oxidative stress.
              </p>
              <div class="text-xs font-mono bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-[#1C1C1C] text-amber-950 dark:text-amber-200 leading-relaxed mb-4">
                • 250ml Warm Coconut Water<br>
                • 1/2 tsp Organic Turmeric<br>
                • 1 pinch Black Pepper (Piperine)<br>
                • 200mg Magnesium Citrate
              </div>
            </div>

            <button type="button" (click)="copyRecipe()"
              class="w-full py-3 px-4 rounded-xl border-2 border-[#1C1C1C] bg-amber-500 text-zinc-950 text-xs font-black uppercase tracking-wider transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] font-mono">
              {{ isRecipeCopied() ? '✓ Recipe Copied!' : '📋 Copy Elixir Recipe' }}
            </button>
          </div>

        </div>
      }

      <!-- Tab 2: Service Animal Co-Regulation -->
      @if (activeTab() === 'pet') {
        <div class="relative z-10 p-6 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-center animate-in fade-in duration-300 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] sub-panel">
          <h3 class="text-sm font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1 font-mono">
            🐕 Service Animal & Companion Co-Regulation Audio Suite
          </h3>
          <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 mb-5 max-w-lg mx-auto font-sans leading-relaxed">
            Select an acoustic entrainment mode below. Is a service dog or comforting pet in the room helping you heal?
          </p>

          <div class="flex flex-wrap justify-center gap-3">
            <button (click)="petAuditory.playCanineHeartbeat()" 
              [class.bg-[#F6B12B]]="petAuditory.currentMode === 'canine'"
              [class.text-[#1C1C1C]]="petAuditory.currentMode === 'canine'"
              class="px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#1C1C1C] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer hover:scale-105 transition-all shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] font-mono">
              🐕 Canine Service (60 bpm)
            </button>
            <button (click)="petAuditory.playFelinePurr()" 
              [class.bg-[#10B981]]="petAuditory.currentMode === 'feline'"
              [class.text-white]="petAuditory.currentMode === 'feline'"
              class="px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#1C1C1C] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer hover:scale-105 transition-all shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] font-mono">
              🐈 Feline Purr (25-50 Hz)
            </button>
            <button (click)="petAuditory.playCetaceanTherapy()" 
              [class.bg-sky-500]="petAuditory.currentMode === 'cetacean'"
              [class.text-white]="petAuditory.currentMode === 'cetacean'"
              class="px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#1C1C1C] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer hover:scale-105 transition-all shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] font-mono">
              🐬 Cetacean Bio-Waves
            </button>
            <button (click)="petAuditory.playAvianTherapy()" 
              [class.bg-purple-600]="petAuditory.currentMode === 'avian'"
              [class.text-white]="petAuditory.currentMode === 'avian'"
              class="px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#1C1C1C] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer hover:scale-105 transition-all shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] font-mono">
              🦜 Avian Dawn Chorus
            </button>
            @if(petAuditory.isCurrentlyPlaying) {
              <button (click)="petAuditory.stop()" class="px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#1C1C1C] bg-rose-600 text-white cursor-pointer hover:scale-105 transition-all shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] font-mono">
                ⏹ Stop Audio
              </button>
            }
          </div>
        </div>
      }

      <!-- Tab 3: Interactive Health Simulator -->
      @if (activeTab() === 'simulator') {
        <div class="relative z-10 p-6 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 animate-in fade-in duration-300 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] sub-panel">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-mono">
                🎮 Live Bio-Feedback Health Simulator ("My Health Dial")
              </h3>
              <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 font-sans mt-0.5">
                Adjust sliders to simulate how lifestyle habits immediately shift your vital score & cellular recovery.
              </p>
            </div>

            <!-- Dynamic Vitality Score Badge -->
            <div class="text-right shrink-0">
              <span class="text-3xl font-black font-mono text-indigo-700 dark:text-indigo-400">{{ calculatedVitalityScore() }}%</span>
              <span class="block text-xs font-mono font-extrabold uppercase tracking-widest text-[#1C1C1C]/70 dark:text-zinc-400">Predicted Vitality</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <!-- Sleep Hours Slider -->
            <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-[#1C1C1C] dark:border-zinc-700">
              <div class="flex justify-between items-center mb-2">
                <label for="sim-sleep-input" class="font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-wider font-mono">😴 Sleep Duration</label>
                <span class="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">{{ simSleep() }} hrs</span>
              </div>
              <input id="sim-sleep-input" name="simSleep" aria-label="Simulated Sleep Duration Hours" type="range" min="4" max="10" step="0.5" [value]="simSleep()" (input)="updateSleep($event)"
                class="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#1C1C1C]" />
            </div>

            <!-- Hydration Slider -->
            <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-[#1C1C1C] dark:border-zinc-700">
              <div class="flex justify-between items-center mb-2">
                <label for="sim-hydration-input" class="font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-wider font-mono">💧 Daily Hydration</label>
                <span class="font-mono font-extrabold text-sky-700 dark:text-sky-300 text-sm">{{ simHydration() }} L</span>
              </div>
              <input id="sim-hydration-input" name="simHydration" aria-label="Simulated Daily Hydration Liters" type="range" min="1.0" max="4.5" step="0.25" [value]="simHydration()" (input)="updateHydration($event)"
                class="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#1C1C1C]" />
            </div>

            <!-- Stress Level Slider -->
            <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-[#1C1C1C] dark:border-zinc-700">
              <div class="flex justify-between items-center mb-2">
                <label for="sim-stress-input" class="font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-wider font-mono">🧘 Stress Load</label>
                <span class="font-mono font-extrabold text-rose-700 dark:text-rose-300 text-sm">{{ simStress() }} / 10</span>
              </div>
              <input id="sim-stress-input" name="simStress" aria-label="Simulated Stress Load Level Out of 10" type="range" min="1" max="10" step="1" [value]="simStress()" (input)="updateStress($event)"
                class="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#1C1C1C]" />
            </div>
          </div>
        </div>
      }

      <!-- Tab 4: Neuro-Consciousness & Mood Optimization Matrix -->
      @if (activeTab() === 'matrix') {
        <div class="relative z-10 animate-in fade-in duration-300">
          <app-mood-consciousness-matrix></app-mood-consciousness-matrix>
        </div>
      }

      <!-- Tab 5: Patient Health Trajectory Storybook -->
      @if (activeTab() === 'storybook') {
        <div class="relative z-10 animate-in fade-in duration-300">
          <app-patient-health-trajectory-storybook></app-patient-health-trajectory-storybook>
        </div>
      }

    </div>
  `
})
export class InstantPatientActionSuiteComponent implements OnDestroy {
  protected readonly petAuditory = inject(PetAuditoryService);
  protected readonly patientState = inject(PatientStateService);

  activeTab = signal<'relief' | 'matrix' | 'pet' | 'simulator' | 'storybook'>('relief');

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

  toggleTab(tab: 'relief' | 'matrix' | 'pet' | 'simulator' | 'storybook') {
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
