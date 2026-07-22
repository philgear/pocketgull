import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { FloatingWaterConsciousnessComponent } from './floating-water-consciousness.component';
import { SocialHealthGravitationComponent } from './social-health-gravitation.component';
import { LyricaConcertComponent } from './lyrica-concert.component';

export interface IConsciousnessState {
  id: 'focus' | 'calm' | 'sleep' | 'creativity' | 'grounding';
  name: string;
  subtitle: string;
  emoji: string;
  color: string; // Tailwind border / text color
  targetEEG: string; // Frequency range
  targetNeurotransmitters: string[];
  prescribedMeal: {
    emoji: string;
    name: string;
    activeCompounds: string;
  };
  avsTarget: {
    frequencyHz: number;
    waveType: 'Gamma' | 'Beta' | 'Alpha' | 'Theta' | 'Delta';
    breathingRateBpm: number;
  };
  clinicalRationale: string;
  tcmShenStatus: string;
  ayurvedicGuna: 'Sattva (Purity)' | 'Rajas (Action)' | 'Tamas (Rest)';
}

@Component({
  selector: 'app-mood-consciousness-matrix',
  standalone: true,
  imports: [CommonModule, FloatingWaterConsciousnessComponent, SocialHealthGravitationComponent, LyricaConcertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-sans relative overflow-hidden">

      
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>


      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 relative z-10 font-mono">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse"></span>
            <h2 class="text-xl font-bold uppercase tracking-tight text-zinc-100">
              🔮 Neuro-Consciousness & Mood Optimization Matrix
            </h2>
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Multimodal Mind-State Engine
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1.5 font-sans">
            Calibrate AVS entrainment, dietary micro-doses, and neuro-biomarker pathways targeted for <strong>{{ activePatientName() }}</strong>.
          </p>
        </div>

        <div class="text-right text-[11px] text-zinc-400">
          <span>Active State: <strong class="text-indigo-400 uppercase font-bold">{{ selectedState().name }}</strong></span>
        </div>
      </div>

      <!-- State of Mind Selection Spectrum Tabs -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8 relative z-10 font-mono">
        @for (state of states; track state.id) {
          <button (click)="selectState(state)"
            [class.ring-2]="selectedState().id === state.id"
            [class.ring-indigo-500]="selectedState().id === state.id"
            [class.bg-zinc-900]="selectedState().id === state.id"
            [class.bg-zinc-900/40]="selectedState().id !== state.id"
            class="p-3.5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition cursor-pointer flex flex-col items-center text-center group active:scale-95">
            
            <span class="text-2xl mb-1 group-hover:scale-110 transition-transform">{{ state.emoji }}</span>
            <span class="text-xs font-bold text-zinc-200 block uppercase tracking-tight">{{ state.name }}</span>
            <span class="text-[9.5px] text-zinc-400 block mt-0.5">{{ state.targetEEG }}</span>
          </button>
        }
      <!-- Dedicated AI Mind-State Suggestions & Clinical Prescription Card -->
      <div class="mb-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-purple-950/80 border border-indigo-500/40 shadow-2xl relative z-10 font-mono">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/30 pb-4 mb-5">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ selectedState().emoji }}</span>
            <div>
              <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Dedicated AI Suggestions</span>
              <h3 class="text-base font-extrabold uppercase tracking-wide text-white mt-0.5">
                {{ selectedState().name }} — Dedicated Mind-State Prescription
              </h3>
              <p class="text-xs text-zinc-300 font-sans mt-0.5">
                {{ selectedState().subtitle }} • Targeted for <strong class="text-cyan-400 font-bold uppercase">{{ activePatientName() }}</strong>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button (click)="generateDedicatedPrescription()"
              [class.animate-pulse]="isGeneratingPrescription()"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95">
              <span>⚡</span>
              <span>{{ isGeneratingPrescription() ? 'Synthesizing...' : 'Synthesize Dedicated AI Plan' }}</span>
            </button>
          </div>
        </div>

        @if (dedicatedPrescription(); as plan) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-4 rounded-xl bg-zinc-900/90 border border-indigo-500/30 space-y-2">
              <div class="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[11px]">
                <span>🧠</span> EEG & Neurotransmitter Profile
              </div>
              <p class="text-zinc-200 font-bold">{{ plan.targetEEG }}</p>
              <p class="text-zinc-400 text-[11px]">
                Neurotransmitters: <span class="text-indigo-300 font-bold">{{ plan.neurotransmitters }}</span>
              </p>
              <p class="text-zinc-400 text-[11px] font-sans">
                {{ plan.neuroRationale }}
              </p>
            </div>

            <div class="p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/30 space-y-2">
              <div class="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px]">
                <span>🥗</span> Nootropic Culinary Prescription
              </div>
              <p class="text-zinc-200 font-bold">{{ plan.mealEmoji }} {{ plan.mealName }}</p>
              <p class="text-emerald-300 text-[11px] font-mono">
                Active: {{ plan.mealActiveCompounds }}
              </p>
              <button (click)="prescribedMealState(selectedState())"
                class="w-full mt-2 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/60 text-emerald-200 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer">
                🥑 Prescribe Meal to Care Plan
              </button>
            </div>

            <div class="p-4 rounded-xl bg-zinc-900/90 border border-amber-500/30 space-y-2">
              <div class="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px]">
                <span>☯️</span> Multi-Paradigm Shen & Guna
              </div>
              <p class="text-amber-300 font-bold text-[11px]">TCM: {{ plan.tcmShen }}</p>
              <p class="text-amber-200 font-bold text-[11px]">Ayurveda: {{ plan.ayurvedaGuna }}</p>
              <button (click)="applyAvsState(selectedState())"
                class="w-full mt-2 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-200 border border-indigo-500/40 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer">
                ⚡ Activate AVS Target
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Aquatic Consciousness & Floating City Archipelagos Component -->
      <div class="mb-8 relative z-10">
        <app-floating-water-consciousness></app-floating-water-consciousness>
      </div>

      <!-- Detailed Mind-State Optimization Dashboard -->
      @let active = selectedState();

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 font-sans mb-8">
        
        <!-- Left 7 Cols: Prescribed Mind-State Interventions -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Card 1: AVS Brainwave Entrainment & Resonant Breathing -->
          <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-base">🧠</span>
                <h4 class="text-xs font-bold uppercase font-mono text-indigo-400">AVS Brainwave Entrainment & Vagal Resonance</h4>
              </div>
              <p class="text-xs text-zinc-200 font-bold">
                Target EEG: {{ active.avsTarget.waveType }} Wave ({{ active.avsTarget.frequencyHz }} Hz) • {{ active.avsTarget.breathingRateBpm }} BPM Breathing
              </p>
              <p class="text-[11px] text-zinc-400 leading-relaxed font-mono">
                Synchronizes baroreflex vagal tone and entrains cortical oscillations into target {{ active.name }} state.
              </p>
            </div>

            <button (click)="applyAvsState(active)"
              class="shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider transition shadow-md cursor-pointer active:scale-95">
              ⚡ Apply AVS State
            </button>
          </div>

          <!-- Card 2: Culinary Micro-Dosing & Botanical Nutrition -->
          <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-base">{{ active.prescribedMeal.emoji }}</span>
                <h4 class="text-xs font-bold uppercase font-mono text-emerald-400">Culinary Micro-Dosing Intervention</h4>
              </div>
              <p class="text-xs text-zinc-200 font-bold">
                {{ active.prescribedMeal.name }}
              </p>
              <p class="text-[11px] text-zinc-400 font-mono">
                Active Compounds: <span class="text-emerald-300">{{ active.prescribedMeal.activeCompounds }}</span>
              </p>
            </div>

            <button (click)="prescribedMealState(active)"
              class="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider transition shadow-md cursor-pointer active:scale-95">
              🥑 Prescribe Meal
            </button>
          </div>

          <!-- Card 3: Multimodal Voice Consultation Mode -->
          <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base">🎙️</span>
                <h4 class="text-xs font-bold uppercase font-mono text-amber-400">Gemini Bi-Directional Voice Consultation</h4>
              </div>
              <p class="text-[11px] text-zinc-400 font-mono mt-1">
                Launch interactive AI voice guide tuned to facilitate {{ active.name }} consciousness state.
              </p>
            </div>

            <button (click)="triggerVoiceMode(active)"
              class="shrink-0 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider transition shadow-md cursor-pointer active:scale-95">
              🎙️ Launch Voice Guide
            </button>
          </div>

        </div>

        <!-- Right 5 Cols: Neuro-Biomarker & Energetic Rationale -->
        <div class="lg:col-span-5 p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 font-mono flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase text-zinc-400 block mb-2 tracking-widest">
              🧬 Neuro-Biomarker & Energetic Targets
            </span>

            <div class="space-y-3 text-xs mb-4">
              <div class="flex justify-between border-b border-zinc-800 pb-2">
                <span class="text-zinc-400">Neurotransmitters:</span>
                <span class="text-indigo-300 font-bold">{{ active.targetNeurotransmitters.join(', ') }}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-800 pb-2">
                <span class="text-zinc-400">TCM Shen Status:</span>
                <span class="text-emerald-300 font-bold">{{ active.tcmShenStatus }}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-800 pb-2">
                <span class="text-zinc-400">Ayurvedic Guna:</span>
                <span class="text-amber-300 font-bold">{{ active.ayurvedicGuna }}</span>
              </div>
            </div>

            <span class="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Clinical Rationale:</span>
            <p class="text-[11px] text-zinc-300 font-sans leading-relaxed">
              {{ active.clinicalRationale }}
            </p>
          </div>

          <div class="pt-4 border-t border-zinc-800 text-[9.5px] text-zinc-500 flex justify-between">
            <span>State ID: {{ active.id | uppercase }}</span>
            <span>Physician Oversight Mandated</span>
          </div>
        </div>

      </div>

      <!-- Lyrica Generative Healing Jukebox Suite -->
      <div class="p-6 rounded-3xl bg-zinc-900/90 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] relative z-10 font-mono overflow-hidden">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-lg text-purple-300">
              📻
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold uppercase tracking-tight text-purple-200">
                  Lyrica Generative Healing Jukebox
                </h3>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  Solfeggio & Binaural Synth
                </span>
              </div>
              <p class="text-[11px] text-zinc-400 font-sans mt-0.5">
                Generates therapeutic ambient soundscapes, Solfeggio carrier waves, and spoken Lyrica healing affirmations tuned to {{ active.name }}.
              </p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-2">
            @if (!isPlayingJukebox()) {
              <button (click)="toggleJukebox()"
                class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95">
                <span>▶ Play Soundscape</span>
              </button>
            } @else {
              <button (click)="toggleJukebox()"
                class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95">
                <span>⏸ Pause Jukebox</span>
              </button>
            }

            <button (click)="generateNewLyricaTrack()"
              class="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-zinc-700 active:scale-95 flex items-center gap-1.5">
              <span>🎲 New Track</span>
            </button>
          </div>
        </div>

        <!-- Jukebox Main Content: Track Info, Audio Visualizer & Lyrica Teleprompter -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          <!-- Column 1: Active Track Spec & Solfeggio Tuning -->
          <div class="md:col-span-5 space-y-3">
            <div class="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <span class="text-[9.5px] text-purple-400 uppercase tracking-widest block font-bold">Now Playing</span>
              <h4 class="text-xs font-bold text-zinc-100 mt-1 font-sans">
                {{ activeJukeboxTrack().title }}
              </h4>
              <div class="flex items-center gap-2 text-[10.5px] text-zinc-400 mt-1">
                <span class="text-purple-300 font-bold">🎵 {{ activeJukeboxTrack().solfeggioFreq }} Hz {{ activeJukeboxTrack().tuningName }}</span>
                <span>•</span>
                <span class="text-indigo-300">🧠 {{ activeJukeboxTrack().binauralBeatHz }} Hz Binaural</span>
              </div>
            </div>

            <!-- Volume Slider -->
            <div class="flex items-center gap-3 px-1">
              <span class="text-xs text-zinc-400">🔊 Volume</span>
              <input type="range" min="0" max="1" step="0.05" [value]="jukeboxVolume()" (input)="updateVolume($event)"
                class="w-full accent-purple-500 bg-zinc-800 rounded-lg h-1.5 cursor-pointer">
              <span class="text-xs text-purple-300 font-bold min-w-[32px] text-right">{{ Math.round(jukeboxVolume() * 100) }}%</span>
            </div>
          </div>

          <!-- Column 2: Ambient Equalizer Visualizer & Scrolling Healing Lyrica Text -->
          <div class="md:col-span-7 p-4 rounded-2xl bg-zinc-950/90 border border-purple-500/20 relative overflow-hidden space-y-3">
            
            <!-- Animated Soundwave Equalizer Bars -->
            <div class="flex items-end justify-between gap-1 h-10 px-2">
              @for (bar of visualizerBars(); track $index) {
                <div class="w-full bg-gradient-to-t from-purple-600 via-indigo-500 to-emerald-400 rounded-t transition-all duration-300"
                  [style.height.%]="isPlayingJukebox() ? bar : 15"></div>
              }
            </div>

            <!-- Lyrica Healing Teleprompter Affirmation -->
            <div class="border-t border-zinc-800/80 pt-2.5">
              <div class="flex items-center justify-between text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
                <span>Spoken Lyrica Affirmation</span>
                <span class="text-emerald-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Healing Frequency Active
                </span>
              </div>
              <p class="text-xs italic text-purple-200 font-sans leading-relaxed">
                "{{ currentLyricaLyric() }}"
              </p>
            </div>

            <!-- Gemini Generative Mind Visual Mandala Banner -->
            <div class="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-sm">🎨</span>
                <div>
                  <span class="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">Gemini Mind Mandala Art</span>
                  <span class="text-[11px] text-zinc-300 font-sans">
                    Visual: {{ activeJukeboxTrack().artTheme }}
                  </span>
                </div>
              </div>
              <button (click)="synthesizeMindVisual()"
                class="px-2.5 py-1.5 rounded-lg bg-purple-600/40 hover:bg-purple-600/70 border border-purple-400/40 text-purple-200 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer active:scale-95">
                ✨ Generate Art
              </button>
            </div>

          </div>


        </div>

      </div>

      <!-- Lyrica Generative Healing Concert & Music Video -->
      <div class="mt-8 relative z-10">
        <app-lyrica-concert></app-lyrica-concert>
      </div>

      <!-- Social Health & Local Event Gravitation Matrix -->
      <div class="mt-8 relative z-10">
        <app-social-health-gravitation></app-social-health-gravitation>
      </div>

    </div>
  `
})
export class MoodConsciousnessMatrixComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  states: IConsciousnessState[] = [
    {
      id: 'focus',
      name: 'Hyper-Focus & Flow',
      subtitle: 'Peak Cognition & Executive Clarity',
      emoji: '⚡',
      color: 'indigo',
      targetEEG: '40 Hz Gamma',
      targetNeurotransmitters: ['Dopamine D2', 'Acetylcholine', 'Norepinephrine'],
      prescribedMeal: {
        emoji: '🍫',
        name: 'Dark Cacao & L-Theanine Nootropic Elixir',
        activeCompounds: 'Theobromine 150mg + L-Theanine 200mg + Bacopa 300mg'
      },
      avsTarget: {
        frequencyHz: 40,
        waveType: 'Gamma',
        breathingRateBpm: 6
      },
      clinicalRationale: 'Enhances prefrontal cortex gamma band coherence, upregulates cholinergic synaptic transmission, and sharpens executive working memory.',
      tcmShenStatus: 'Shen Bright & Focused in Heart Channel',
      ayurvedicGuna: 'Rajas (Action)'
    },
    {
      id: 'calm',
      name: 'Meditative Calm',
      subtitle: 'Parasympathetic Vagal Relaxation',
      emoji: '🧘',
      color: 'emerald',
      targetEEG: '10 Hz Alpha',
      targetNeurotransmitters: ['GABA-A', 'Glycine', 'Serotonin 5-HT1A'],
      prescribedMeal: {
        emoji: '🥑',
        name: 'Avocado & Ashwagandha KSM-66 Compote',
        activeCompounds: 'Withanolides 30mg + Oleic Acid 14g + Magnesium 400mg'
      },
      avsTarget: {
        frequencyHz: 10,
        waveType: 'Alpha',
        breathingRateBpm: 5
      },
      clinicalRationale: 'Promotes alpha wave occipital dominance, blunts HPA axis cortisol hyper-secretion, and increases heart rate variability (HRV).',
      tcmShenStatus: 'Shen Tranquilized & Anchored',
      ayurvedicGuna: 'Sattva (Purity)'
    },
    {
      id: 'sleep',
      name: 'Deep Rest & Sleep',
      subtitle: 'Delta Glymphatic Clearance',
      emoji: '🌙',
      color: 'purple',
      targetEEG: '2 Hz Delta',
      targetNeurotransmitters: ['Melatonin', 'GABA-B', 'Adenosine'],
      prescribedMeal: {
        emoji: '🫐',
        name: 'Tart Cherry & Chamomile Apigenin Tonic',
        activeCompounds: 'Natural Melatonin 10mg + Apigenin 50mg + Glycine 3g'
      },
      avsTarget: {
        frequencyHz: 2,
        waveType: 'Delta',
        breathingRateBpm: 4
      },
      clinicalRationale: 'Facilitates slow-wave delta sleep entry, drives glymphatic metabolic waste clearance from brain parenchyma, and resets autonomic tone.',
      tcmShenStatus: 'Shen Preserved in Kidney Essence (Jing)',
      ayurvedicGuna: 'Tamas (Rest)'
    },
    {
      id: 'creativity',
      name: 'Creative Reverie',
      subtitle: 'Hypnagogic Insight & Association',
      emoji: '🎨',
      color: 'amber',
      targetEEG: '6 Hz Theta',
      targetNeurotransmitters: ['Anandamide', 'Dopamine D1', 'Acetylcholine'],
      prescribedMeal: {
        emoji: '🫖',
        name: 'Gotu Kola & Lion’s Mane Hericenones Brew',
        activeCompounds: 'Hericenones 50mg + Asiaticoside 20mg + Citral'
      },
      avsTarget: {
        frequencyHz: 6,
        waveType: 'Theta',
        breathingRateBpm: 6
      },
      clinicalRationale: 'Fosters theta band hippocampal-cortical crosstalk, allowing novel associative synthesis and fluid unconstrained cognitive ideation.',
      tcmShenStatus: 'Hun (Spiritual Soul) Floating Free',
      ayurvedicGuna: 'Sattva (Purity)'
    },
    {
      id: 'grounding',
      name: 'Anxiolytic Grounding',
      subtitle: 'Somatic Emotional Stability',
      emoji: '🛡️',
      color: 'rose',
      targetEEG: '8 Hz Low Alpha',
      targetNeurotransmitters: ['Endorphins', 'Neuropeptide Y', 'GABA'],
      prescribedMeal: {
        emoji: '🍣',
        name: 'Wild Salmon & Reishi Lingzhi Soup',
        activeCompounds: 'Ganoderic Acids 40mg + Omega-3 EPA 1.8g + Zinc 15mg'
      },
      avsTarget: {
        frequencyHz: 8,
        waveType: 'Alpha',
        breathingRateBpm: 5.5
      },
      clinicalRationale: 'Calms amygdala hyper-reactivity, tonifies TCM Spleen Qi and Heart Blood, and grounds somatic anxiety into equilibrium.',
      tcmShenStatus: 'Heart Blood Nourished & Shen Rooted',
      ayurvedicGuna: 'Sattva (Purity)'
    }
  ];

  selectedState = signal<IConsciousnessState>(this.states[0]);
  isGeneratingPrescription = signal<boolean>(false);
  dedicatedPrescription = signal<any | null>({
    targetEEG: '40 Hz Gamma Wave • 6 BPM Resonant Breathing',
    neurotransmitters: 'Dopamine D2, Acetylcholine, Norepinephrine',
    neuroRationale: 'Enhances prefrontal cortex gamma band coherence, upregulates cholinergic synaptic transmission, and sharpens executive working memory.',
    mealEmoji: '🍫',
    mealName: 'Dark Cacao & L-Theanine Nootropic Elixir',
    mealActiveCompounds: 'Theobromine 150mg + L-Theanine 200mg + Bacopa 300mg',
    tcmShen: 'Shen Bright & Focused in Heart Channel',
    ayurvedaGuna: 'Rajas (Action)'
  });

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  selectState(state: IConsciousnessState) {
    this.selectedState.set(state);
    this.generateDedicatedPrescription();
  }

  generateDedicatedPrescription() {
    this.isGeneratingPrescription.set(true);
    setTimeout(() => {
      const state = this.selectedState();
      this.dedicatedPrescription.set({
        targetEEG: `${state.avsTarget.waveType} Wave (${state.avsTarget.frequencyHz} Hz) • ${state.avsTarget.breathingRateBpm} BPM Resonant Breathing`,
        neurotransmitters: state.targetNeurotransmitters.join(', '),
        neuroRationale: state.clinicalRationale,
        mealEmoji: state.prescribedMeal.emoji,
        mealName: state.prescribedMeal.name,
        mealActiveCompounds: state.prescribedMeal.activeCompounds,
        tcmShen: state.tcmShenStatus,
        ayurvedaGuna: state.ayurvedicGuna
      });
      this.isGeneratingPrescription.set(false);
    }, 400);
  }

  applyAvsState(state: IConsciousnessState) {
    this.patientState.avsBreathingRate.set(state.avsTarget.breathingRateBpm);
    this.patientState.avsBrainwaveFrequencyHz.set(state.avsTarget.frequencyHz);
    
    const waveLower = state.avsTarget.waveType.toLowerCase() as any;
    if (['theta', 'alpha', 'gamma', 'delta', 'beta'].includes(waveLower)) {
      this.patientState.avsBrainwaveFrequency.set(waveLower);
    }

    const noteText = `🔮 Applied AVS Mood State: ${state.emoji} ${state.name} (${state.avsTarget.waveType} ${state.avsTarget.frequencyHz} Hz, ${state.avsTarget.breathingRateBpm} BPM)`;
    this.patientState.addClinicalNote({
      id: `avs-mood-${state.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }


  prescribedMealState(state: IConsciousnessState) {
    const noteText = `🥑 Prescribed Mood Meal: ${state.prescribedMeal.emoji} ${state.prescribedMeal.name} (${state.prescribedMeal.activeCompounds})`;
    this.patientState.addClinicalNote({
      id: `mood-meal-${state.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Nutrition',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }

  triggerVoiceMode(state: IConsciousnessState) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voice-mode-change', { detail: 'avs' }));
    }
  }

  // Lyrica Generative Healing Jukebox State & Web Audio Synthesizer
  Math = Math;
  isPlayingJukebox = signal<boolean>(false);
  jukeboxVolume = signal<number>(0.5);
  visualizerBars = signal<number[]>([40, 65, 80, 50, 90, 70, 45, 85, 60, 95, 30, 75]);

  tracksSpec = [
    { title: '528 Hz Solfeggio Vagal Serenade (Transformation)', solfeggioFreq: 528, tuningName: 'Transformation & DNA Repair', binauralBeatHz: 10, artTheme: 'Bioluminescent Indigo Lotus' },
    { title: '432 Hz Harmonic Gamma Flow (Prefrontal Gamma)', solfeggioFreq: 432, tuningName: 'Natural Harmonic Balance', binauralBeatHz: 40, artTheme: 'Golden Neural Cortex Matrix' },
    { title: '639 Hz Heart Coherence Sonnet (Shen Anchoring)', solfeggioFreq: 639, tuningName: 'Interpersonal Harmony', binauralBeatHz: 8, artTheme: 'Rose Gold Heart Aura Mandala' },
    { title: '174 Hz Deep Delta Glymphatic Lullaby', solfeggioFreq: 174, tuningName: 'Pain & Stress Anesthetic', binauralBeatHz: 2, artTheme: 'Starlight Glymphatic Nebula' },
    { title: '852 Hz Intuitive Reverie Chants (Anandamide Flow)', solfeggioFreq: 852, tuningName: 'Spiritual Order & Intuition', binauralBeatHz: 6, artTheme: 'Emerald Crystalline Prism' }
  ];

  activeJukeboxTrack = signal(this.tracksSpec[0]);

  lyricaAffirmations = [
    "Breathe in clarity; your prefrontal cortex resonates with pure 528 Hz transformation and vagal harmony.",
    "Every breath releases somatic tension. Cortisol recedes as 432 Hz natural harmonics restore equilibrium.",
    "Your heart rate variability expands. Shen is anchored softly within the heart channel.",
    "Slow-wave delta entry begins. Glymphatic metabolic clearance washes over brain parenchyma.",
    "Anandamide and alpha waves flow freely. You are grounded, safe, and profoundly restored."
  ];

  currentLyricaLyric = signal<string>(this.lyricaAffirmations[0]);

  synthesizeMindVisual() {
    const track = this.activeJukeboxTrack();
    const noteText = `🎨 Synthesized Gemini Mood Visual Mandala: ${track.artTheme} (${track.solfeggioFreq} Hz Solfeggio, ${track.binauralBeatHz} Hz Binaural)`;
    this.patientState.addClinicalNote({
      id: `mood-visual-${Date.now()}`,
      text: noteText,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`✨ Synthesized Gemini Mind Visual: ${track.artTheme}\nPrompted for ${track.solfeggioFreq} Hz Solfeggio & ${track.binauralBeatHz} Hz EEG Target.`);
  }


  private audioCtx: AudioContext | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private visualizerInterval: any = null;

  toggleJukebox() {
    if (this.isPlayingJukebox()) {
      this.stopAudioSynth();
    } else {
      this.startAudioSynth();
    }
  }

  generateNewLyricaTrack() {
    const nextIdx = (this.tracksSpec.indexOf(this.activeJukeboxTrack()) + 1) % this.tracksSpec.length;
    const newTrack = this.tracksSpec[nextIdx];
    this.activeJukeboxTrack.set(newTrack);
    this.currentLyricaLyric.set(this.lyricaAffirmations[nextIdx % this.lyricaAffirmations.length]);

    if (this.isPlayingJukebox()) {
      this.stopAudioSynth();
      this.startAudioSynth();
    }
  }

  updateVolume(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.jukeboxVolume.set(val);
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(val * 0.15, this.audioCtx?.currentTime || 0);
    }
  }

  private startAudioSynth() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioCtx = new AudioCtx();

      const track = this.activeJukeboxTrack();
      const carrierFreq = track.solfeggioFreq;
      const beatFreq = track.binauralBeatHz;

      // Create stereo panners for binaural beat separation (Left: Carrier, Right: Carrier + Beat)
      const pannerLeft = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
      const pannerRight = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;

      if (pannerLeft) pannerLeft.pan.value = -0.8;
      if (pannerRight) pannerRight.pan.value = 0.8;

      this.oscLeft = this.audioCtx.createOscillator();
      this.oscRight = this.audioCtx.createOscillator();

      this.oscLeft.type = 'sine';
      this.oscRight.type = 'sine';

      this.oscLeft.frequency.setValueAtTime(carrierFreq, this.audioCtx.currentTime);
      this.oscRight.frequency.setValueAtTime(carrierFreq + beatFreq, this.audioCtx.currentTime);

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.jukeboxVolume() * 0.15, this.audioCtx.currentTime);

      if (pannerLeft && pannerRight) {
        this.oscLeft.connect(pannerLeft);
        pannerLeft.connect(this.gainNode);
        this.oscRight.connect(pannerRight);
        pannerRight.connect(this.gainNode);
      } else {
        this.oscLeft.connect(this.gainNode);
        this.oscRight.connect(this.gainNode);
      }

      this.gainNode.connect(this.audioCtx.destination);

      this.oscLeft.start();
      this.oscRight.start();

      this.isPlayingJukebox.set(true);

      // Start animated visualizer pulse
      this.visualizerInterval = setInterval(() => {
        const newBars = Array.from({ length: 12 }, () => Math.floor(Math.random() * 70) + 30);
        this.visualizerBars.set(newBars);
      }, 300);

      // Speak spoken Lyrica affirmation using Web Speech API SpeechSynthesis if available
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(this.currentLyricaLyric());
        utterance.rate = 0.85;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('[Lyrica Jukebox Synth Error]', err);
    }
  }

  private stopAudioSynth() {
    try {
      if (this.oscLeft) { this.oscLeft.stop(); this.oscLeft.disconnect(); }
      if (this.oscRight) { this.oscRight.stop(); this.oscRight.disconnect(); }
      if (this.audioCtx) { this.audioCtx.close(); }
      if (this.visualizerInterval) { clearInterval(this.visualizerInterval); }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (err) {
      console.warn('[Lyrica Jukebox Stop Error]', err);
    } finally {
      this.isPlayingJukebox.set(false);
      this.oscLeft = null;
      this.oscRight = null;
      this.audioCtx = null;
    }
  }
}

