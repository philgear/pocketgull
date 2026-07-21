import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export type MedicalParadigmMode = 'western' | 'functional' | 'tcm' | 'ayurveda' | 'chronobiology';

export interface IParadigmInfo {
  id: MedicalParadigmMode;
  name: string;
  subtitle: string;
  icon: string;
  badgeColor: string;
  borderColor: string;
  focusPrinciples: string[];
}

@Component({
  selector: 'app-paradigm-clinical-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-sans relative overflow-hidden">
      
      <!-- Background Glow Effect -->
      <div [class]="activeParadigmGlowClass()" class="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700"></div>

      <!-- Header & Selector -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 relative z-10 font-mono">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse"></span>
            <h2 class="text-xl font-bold uppercase tracking-tight text-zinc-100">
              🩺 Multi-Paradigm Clinical Overview Dashboard
            </h2>
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
              Paradigm Switcher Engine
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1.5 font-sans">
            View patient health state through distinct medical paradigms: Western Allopathic, IFM Functional Systems, TCM Zang-Fu, Ayurveda Tridosha, or Chronobiology.
          </p>
        </div>

        <div class="text-right text-[11px] text-zinc-400 font-mono">
          <span>Active Patient: <strong class="text-cyan-400 font-bold uppercase">{{ activePatientName() }}</strong></span>
        </div>
      </div>

      <!-- Paradigm Switcher Tabs -->
      <div class="flex flex-wrap items-center gap-2 mb-6 relative z-10 font-mono">
        @for (p of paradigms; track p.id) {
          <button (click)="activeMode.set(p.id)"
            [class.bg-zinc-800]="activeMode() === p.id"
            [class.border-cyan-500/50]="activeMode() === p.id"
            [class.text-cyan-300]="activeMode() === p.id"
            class="px-3.5 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-bold text-zinc-400 transition cursor-pointer hover:border-zinc-700 flex items-center gap-2 shadow-sm">
            <span>{{ p.icon }}</span>
            <span>{{ p.name }}</span>
          </button>
        }
      </div>

      <!-- Active Paradigm Principles Banner -->
      <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 font-mono">
        <div class="flex items-center gap-3">
          <span class="text-2xl">{{ currentParadigm().icon }}</span>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-tight text-zinc-100 font-mono">{{ currentParadigm().name }} Paradigm</h3>
            <span class="text-[10.5px] text-zinc-400 block font-sans">{{ currentParadigm().subtitle }}</span>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-1.5">
          @for (principle of currentParadigm().focusPrinciples; track principle) {
            <span class="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
              {{ principle }}
            </span>
          }
        </div>
      </div>

      <!-- PARADIGM VIEW 1: WESTERN ALLOPATHIC -->
      @if (activeMode() === 'western') {
        <div class="space-y-6 relative z-10 font-sans">
          <!-- Organ System Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-4 rounded-2xl bg-zinc-900 border border-cyan-500/30 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-cyan-300 font-bold uppercase">🫀 Cardiovascular</span>
                <span class="text-emerald-400 font-bold">Stable</span>
              </div>
              <div class="text-xl font-bold text-zinc-100 font-mono">72 bpm <span class="text-xs font-normal text-zinc-400">/ 118/76 mmHg</span></div>
              <p class="text-[11px] text-zinc-400">Normal sinus rhythm. Mild vascular stiffness index.</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-indigo-500/30 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-indigo-300 font-bold uppercase">🧠 Neurological</span>
                <span class="text-amber-400 font-bold">Moderate Strain</span>
              </div>
              <div class="text-xl font-bold text-zinc-100 font-mono">10Hz Alpha <span class="text-xs font-normal text-zinc-400">/ Prefrontal</span></div>
              <p class="text-[11px] text-zinc-400">L4-L5 radiculopathy pain signals. Mild sleep deprivation.</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-emerald-300 font-bold uppercase">🪵 Metabolic & Liver</span>
                <span class="text-emerald-400 font-bold">Optimal</span>
              </div>
              <div class="text-xl font-bold text-zinc-100 font-mono">92 mg/dL <span class="text-xs font-normal text-zinc-400">/ Fasting Glucose</span></div>
              <p class="text-[11px] text-zinc-400">ALT/AST normal. Sub-optimal Vitamin D3 (28 ng/mL).</p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-rose-500/30 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-rose-300 font-bold uppercase">🦴 Musculoskeletal</span>
                <span class="text-rose-400 font-bold">Priority Focus</span>
              </div>
              <div class="text-xl font-bold text-zinc-100 font-mono">L4-L5 Disc <span class="text-xs font-normal text-zinc-400">/ VAS 6/10</span></div>
              <p class="text-[11px] text-zinc-400">Lumbar radiculopathy. Non-opioid NSAID & McKenzie PT active.</p>
            </div>
          </div>
        </div>
      }

      <!-- PARADIGM VIEW 2: FUNCTIONAL SYSTEMS (IFM MATRIX) -->
      @if (activeMode() === 'functional') {
        <div class="space-y-6 relative z-10 font-sans">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-zinc-900 border border-purple-500/30 space-y-3">
              <span class="text-xs font-bold text-purple-300 font-mono uppercase block">⚡ Energy & Mitochondria</span>
              <div class="w-full bg-zinc-800 rounded-full h-2">
                <div class="bg-purple-500 h-2 rounded-full" style="width: 68%"></div>
              </div>
              <p class="text-xs text-zinc-300">68% Capacity — Sub-optimal Magnesium & B-vitamins limits ATP electron transport.</p>
            </div>

            <div class="p-5 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-3">
              <span class="text-xs font-bold text-amber-300 font-mono uppercase block">🛡️ Defense & Repair</span>
              <div class="w-full bg-zinc-800 rounded-full h-2">
                <div class="bg-amber-500 h-2 rounded-full" style="width: 82%"></div>
              </div>
              <p class="text-xs text-zinc-300">82% Immune Activation — Elevated systemic IL-6 cytokines due to nerve inflammation.</p>
            </div>

            <div class="p-5 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-3">
              <span class="text-xs font-bold text-emerald-300 font-mono uppercase block">🌱 Assimilation & Gut Microbe</span>
              <div class="w-full bg-zinc-800 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 75%"></div>
              </div>
              <p class="text-xs text-zinc-300">75% Intestinal Integrity — Responding well to organic polyphenol dietary inputs.</p>
            </div>
          </div>
        </div>
      }

      <!-- PARADIGM VIEW 3: TRADITIONAL CHINESE MEDICINE (TCM) -->
      @if (activeMode() === 'tcm') {
        <div class="space-y-6 relative z-10 font-sans">
          <!-- Wu Xing 5-Elements Pentagram Grid -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono">
            <div class="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
              <span class="text-xl">🌿</span>
              <h4 class="text-xs font-bold text-emerald-300 uppercase">Wood (Mu)</h4>
              <span class="text-[10px] text-zinc-400 block">Liver / Gallbladder</span>
              <span class="text-[9.5px] font-bold text-amber-300 block">Qi Stagnation</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-1">
              <span class="text-xl">🔥</span>
              <h4 class="text-xs font-bold text-rose-300 uppercase">Fire (Huo)</h4>
              <span class="text-[10px] text-zinc-400 block">Heart / Pericardium</span>
              <span class="text-[9.5px] font-bold text-emerald-300 block">Shen Calm</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center space-y-1">
              <span class="text-xl">🌾</span>
              <h4 class="text-xs font-bold text-amber-300 uppercase">Earth (Tu)</h4>
              <span class="text-[10px] text-zinc-400 block">Spleen / Stomach</span>
              <span class="text-[9.5px] font-bold text-emerald-300 block">Spleen Qi Strong</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-center space-y-1">
              <span class="text-xl">⚔️</span>
              <h4 class="text-xs font-bold text-slate-300 uppercase">Metal (Jin)</h4>
              <span class="text-[10px] text-zinc-400 block">Lung / Large Int.</span>
              <span class="text-[9.5px] font-bold text-emerald-300 block">Wei Qi Intact</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-center space-y-1">
              <span class="text-xl">🌊</span>
              <h4 class="text-xs font-bold text-cyan-300 uppercase">Water (Shui)</h4>
              <span class="text-[10px] text-zinc-400 block">Kidney / Bladder</span>
              <span class="text-[9.5px] font-bold text-amber-300 block">Jing Nourished</span>
            </div>
          </div>
        </div>
      }

      <!-- PARADIGM VIEW 4: AYURVEDA TRIDOSHA -->
      @if (activeMode() === 'ayurveda') {
        <div class="space-y-6 relative z-10 font-sans">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div class="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-blue-300 uppercase">🌬️ Vata (Air/Space)</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Aggravated</span>
              </div>
              <p class="text-xs text-zinc-300 font-sans">Causes spinal joint dryness, nerve firing, and irregular digestion (Vishama Agni).</p>
            </div>

            <div class="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-rose-300 uppercase">🔥 Pitta (Fire/Water)</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Balanced</span>
              </div>
              <p class="text-xs text-zinc-300 font-sans">Metabolic transformation intact. Mild inflammatory heat in lower lumbar.</p>
            </div>

            <div class="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-300 uppercase">💧 Kapha (Earth/Water)</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Stable</span>
              </div>
              <p class="text-xs text-zinc-300 font-sans">Structural lubrication requires warm sesame oil Abhyanga massage support.</p>
            </div>
          </div>
        </div>
      }

      <!-- PARADIGM VIEW 5: CHRONOBIOLOGY & ENVIRONMENTAL -->
      @if (activeMode() === 'chronobiology') {
        <div class="space-y-6 relative z-10 font-sans">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div class="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
              <span class="text-xs font-bold text-indigo-300 uppercase block">🌙 Circadian Melatonin Phase</span>
              <div class="text-lg font-bold text-zinc-100">Optimal Phase Alignment</div>
              <p class="text-xs text-zinc-300 font-sans">10:30 PM Peak Melatonin onset. Limited screen exposure recommended 1 hr before bed.</p>
            </div>

            <div class="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
              <span class="text-xs font-bold text-cyan-300 uppercase block">🫁 Vagal Tone & HRV Spectrum</span>
              <div class="text-lg font-bold text-cyan-300">62 ms rMSSD</div>
              <p class="text-xs text-zinc-300 font-sans">High vagal resilience. Boosted by 528Hz Solfeggio sound therapy.</p>
            </div>

            <div class="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <span class="text-xs font-bold text-emerald-300 uppercase block">🌲 Environmental Phytoncide Index</span>
              <div class="text-lg font-bold text-emerald-300">High Coastal Exposure</div>
              <p class="text-xs text-zinc-300 font-sans">Low urban smog exposure. 1.8 miles to Pacific Cove ocean air sanctuary.</p>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class ParadigmClinicalDashboardComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  activeMode = signal<MedicalParadigmMode>('western');

  paradigms: IParadigmInfo[] = [
    {
      id: 'western',
      name: 'Western Allopathic',
      subtitle: 'Organ system ICD-10/SNOMED CT, quantitative biomarkers & standard-of-care guidelines.',
      icon: '🏥',
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
      borderColor: 'border-cyan-500/30',
      focusPrinciples: ['ICD-10 Diagnoses', 'Lab Ranges', 'Pharmacology']
    },
    {
      id: 'functional',
      name: 'IFM Functional Systems',
      subtitle: 'Root-cause etiology, 7 fundamental physiological processes & antecedent-trigger timeline.',
      icon: '⚡',
      badgeColor: 'bg-purple-500/20 text-purple-300',
      borderColor: 'border-purple-500/30',
      focusPrinciples: ['7 IFM Nodes', 'Mitochondria', 'Gut-Brain Axis']
    },
    {
      id: 'tcm',
      name: 'Traditional Chinese (TCM)',
      subtitle: 'Wu Xing 5-Element pentagram, Zang-Fu organ pairs, Qi/Blood/Jing & Shen tranquility.',
      icon: '☯️',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      borderColor: 'border-emerald-500/30',
      focusPrinciples: ['Wu Xing Pentagram', 'Zang-Fu Balance', 'Shen Harmony']
    },
    {
      id: 'ayurveda',
      name: 'Ayurveda Tridosha',
      subtitle: 'Vata/Pitta/Kapha equilibrium, Agni digestive fire & Ama metabolic toxicity.',
      icon: '🪔',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      borderColor: 'border-amber-500/30',
      focusPrinciples: ['Tridosha Radar', 'Agni Fire', 'Dinacharya']
    },
    {
      id: 'chronobiology',
      name: 'Chronobiology & Environment',
      subtitle: 'Circadian phase alignment, vagal HRV spectrum & environmental phytoncide exposure.',
      icon: '🌿',
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
      borderColor: 'border-indigo-500/30',
      focusPrinciples: ['Circadian Arc', 'Vagal HRV', 'Phytoncide Meter']
    }
  ];

  currentParadigm = computed(() => {
    const mode = this.activeMode();
    return this.paradigms.find(p => p.id === mode) || this.paradigms[0];
  });

  activeParadigmGlowClass = computed(() => {
    const mode = this.activeMode();
    if (mode === 'western') return 'bg-cyan-500/10';
    if (mode === 'functional') return 'bg-purple-500/10';
    if (mode === 'tcm') return 'bg-emerald-500/10';
    if (mode === 'ayurveda') return 'bg-amber-500/10';
    return 'bg-indigo-500/10';
  });

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });
}
