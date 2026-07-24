import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export interface ISleepToolkitMilestone {
  title: string;
  timeframe: string;
  focus: string;
  completed: boolean;
}

export interface ISleepMicroAction {
  title: string;
  category: 'Circadian' | 'Digital Detox' | 'Mind-Body' | 'Nutrition';
  description: string;
  impact: string;
}

@Component({
  selector: 'app-holistic-sleep-toolkit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌙</span>
            <h2 class="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Sleep Twin & Holistic Health Sanctuary
            </h2>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Multi-Modal PSG Sleep Architecture & Continuous Passive Wearable Telemetry
          </p>
        </div>
        <div class="px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-950/60 text-emerald-300 border-emerald-800/80 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Sleep Twin Synapse Active
        </div>
      </div>

      <!-- Sleep Twin Telemetry & Bio-State Dashboard -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
          <span class="text-xs font-medium text-zinc-400">Holistic Risk Score</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-indigo-400">{{ (riskScore() * 100).toFixed(1) }}%</span>
            <span class="text-xs text-emerald-400 font-medium">↓ 4.2% baseline</span>
          </div>
          <p class="text-[11px] text-zinc-500 mt-1">Fused Sleep PSG & Wearables</p>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
          <span class="text-xs font-medium text-zinc-400">Glymphatic SWS (N3)</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-purple-300">{{ n3Percentage() }}%</span>
            <span class="text-xs text-emerald-400 font-medium">Optimal</span>
          </div>
          <p class="text-[11px] text-zinc-500 mt-1">Slow-Wave Brain Clearance</p>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
          <span class="text-xs font-medium text-zinc-400">Vagal Tone (HRV RMSSD)</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-emerald-400">{{ hrvRmssd() }} ms</span>
            <span class="text-xs text-emerald-400 font-medium">↑ High Vagal</span>
          </div>
          <p class="text-[11px] text-zinc-500 mt-1">Autonomic Nervous Balance</p>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
          <span class="text-xs font-medium text-zinc-400">Apnea-Hypopnea (AHI)</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-teal-300">{{ ahi() }} / hr</span>
            <span class="text-xs text-emerald-400 font-medium">Mild / Normal</span>
          </div>
          <p class="text-[11px] text-zinc-500 mt-1">Respiration Fragmentation</p>
        </div>
      </div>

      <!-- Battery Recharger Analogy & Visualizer -->
      <div class="p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-zinc-900/80 rounded-xl border border-indigo-900/40">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h4 class="text-sm font-semibold text-zinc-200">The Human Battery Recharger</h4>
              <p class="text-xs text-zinc-400">Sleep charges your body and brain so you wake up refreshed, sharp, and joyful.</p>
            </div>
          </div>
          <div class="w-36 bg-zinc-800 rounded-full h-3 p-0.5 border border-zinc-700">
            <div class="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-700" style="width: 88%"></div>
          </div>
        </div>
      </div>

      <!-- Key Micro-Interventions Toolkit -->
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <span>✨</span> Evidence-Based Sleep Micro-Actions
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (action of microActions(); track action.title) {
            <div class="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-indigo-300">{{ action.title }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {{ action.category }}
                </span>
              </div>
              <p class="text-xs text-zinc-300">{{ action.description }}</p>
              <p class="text-[11px] text-emerald-400 font-medium">✦ {{ action.impact }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Reverse Brainstorming: What Sabotages Sleep? -->
      <div class="p-4 bg-red-950/20 rounded-xl border border-red-900/30 space-y-2">
        <h4 class="text-xs font-semibold text-red-300 flex items-center gap-1.5">
          <span>🚫</span> Reverse Brainstorming: Sleep Sabotage Triggers to Avoid
        </h4>
        <ul class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-zinc-400">
          <li class="flex items-center gap-2">
            <span class="text-red-400">✕</span> Inconsistent weekend sleep schedules
          </li>
          <li class="flex items-center gap-2">
            <span class="text-red-400">✕</span> Late-night blue light screen exposure
          </li>
          <li class="flex items-center gap-2">
            <span class="text-red-400">✕</span> Working or arguing in the bedroom
          </li>
        </ul>
      </div>

      <!-- Milestone Map -->
      <div class="border-t border-zinc-800 pt-4 space-y-3">
        <h3 class="text-sm font-semibold text-zinc-300">🗺️ 4-Phase Sleep Health Resilience Milestone Map</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
          @for (milestone of milestones(); track milestone.title) {
            <div class="p-3 rounded-xl border" 
                 [class.bg-emerald-950\/30]="milestone.completed" [class.border-emerald-800\/50]="milestone.completed"
                 [class.bg-zinc-900\/40]="!milestone.completed" [class.border-zinc-800]="!milestone.completed">
              <div class="flex items-center justify-between text-xs font-medium mb-1">
                <span [class.text-emerald-300]="milestone.completed" [class.text-zinc-400]="!milestone.completed">
                  {{ milestone.title }}
                </span>
                <span class="text-[10px] text-zinc-500">{{ milestone.timeframe }}</span>
              </div>
              <p class="text-[11px] text-zinc-400 leading-tight">{{ milestone.focus }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HolisticSleepToolkitComponent {
  private patientService = inject(PatientStateService);

  riskScore = signal(0.184);
  n3Percentage = signal(21.5);
  hrvRmssd = signal(44);
  ahi = signal(3.8);

  microActions = signal<ISleepMicroAction[]>([
    {
      title: 'Consistent Circadian Anchors',
      category: 'Circadian',
      description: 'Set a consistent wake-up time every day, supported by 10 minutes of morning sunlight.',
      impact: 'Stabilizes central circadian clock & improves nocturnal melatonin surge.'
    },
    {
      title: '15-Min Evening Digital Detox',
      category: 'Digital Detox',
      description: 'Replace blue-light screens 60 minutes before bed with light reading or audio entrainment.',
      impact: 'Reduces sleep latency by 45% and calms cortical hyper-arousal.'
    },
    {
      title: 'Vagal Diaphragmatic Breathing',
      category: 'Mind-Body',
      description: 'Practice 4-7-8 breathing or gentle bedtime stretches prior to turning off lights.',
      impact: 'Activates parasympathetic vagal tone and lowers nocturnal heart rate.'
    },
    {
      title: 'Nutrient-Optimized Wind Down',
      category: 'Nutrition',
      description: 'Combine magnesium-rich evening snacks with warm Solfeggio 528 Hz audio.',
      impact: 'Enhances SWS N3 slow-wave sleep depth and glymphatic clearance.'
    }
  ]);

  milestones = signal<ISleepToolkitMilestone[]>([
    { title: '1. Sleep Baseline', timeframe: 'Wks 1-2', focus: 'Telemetry audit & circadian anchor setup', completed: true },
    { title: '2. Core Sleep Hygiene', timeframe: 'Wks 3-6', focus: 'Digital detox & bedroom sanctuary', completed: true },
    { title: '3. Mind-Body Integration', timeframe: 'Mths 2-3', focus: 'CBT-I & Solfeggio vagal entrainment', completed: false },
    { title: '4. Long-Term Resilience', timeframe: 'Mths 4+', focus: 'Peer support & continuous Sleep Twin sync', completed: false }
  ]);
}
