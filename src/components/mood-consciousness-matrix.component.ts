import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

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
  imports: [CommonModule],
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
      </div>

      <!-- Detailed Mind-State Optimization Dashboard -->
      @let active = selectedState();
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 font-sans">
        
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

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  selectState(state: IConsciousnessState) {
    this.selectedState.set(state);
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
}
