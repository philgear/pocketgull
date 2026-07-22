import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface ISocialVector {
  id: string;
  name: string;
  category: 'event' | 'community' | 'environment' | 'avoidance';
  type: 'gravitate' | 'avoid';
  coherenceMatchPercent: number; // 0 - 100
  distanceMiles: number;
  emoji: string;
  biomarkerImpact: string;
  energeticRationale: string;
  tcmAyurvedicMatch: string;
  locationName: string;
}

export interface IHobbyVector {
  id: string;
  name: string;
  emoji: string;
  timeCommitment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  clinicalBenefits: string;
  energeticSynergy: string;
  characterTrait: string;
}

@Component({
  selector: 'app-social-health-gravitation',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-sans relative overflow-hidden">
      
      <!-- Header (Dieter Rams Braun Instrumentation Console) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 relative z-10 font-mono">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]"></span>
            <h2 class="text-base font-black uppercase tracking-tight text-zinc-100">
              🧭 Social Health & Local Event Gravitation Matrix
            </h2>
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800 uppercase">
              Coherence Vector Engine
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-sans">
            Personalized local community connections to <strong>gravitate towards</strong> for vagal healing, and environmental stressors to <strong>stay away from</strong>.
          </p>
        </div>

        <div class="text-right text-[11px] text-zinc-400 font-mono">
          <span>Active Patient: <strong class="text-orange-400 font-bold uppercase">{{ activePatientName() }}</strong></span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 font-mono">
        <div class="flex items-center gap-2">
          <button (click)="filterMode.set('all')"
            [class]="filterMode() === 'all'
              ? 'px-3.5 py-1.5 rounded-xl bg-orange-500 text-zinc-950 font-bold text-xs transition cursor-pointer border border-orange-400/50'
              : 'px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 transition cursor-pointer hover:text-zinc-200'">
            🌐 All Vectors ({{ vectors().length }})
          </button>

          <button (click)="filterMode.set('gravitate')"
            [class]="filterMode() === 'gravitate'
              ? 'px-3.5 py-1.5 rounded-xl bg-orange-500 text-zinc-950 font-bold text-xs transition cursor-pointer border border-orange-400/50'
              : 'px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 transition cursor-pointer hover:text-zinc-200'">
            🌱 Gravitate Towards ({{ gravitateCount() }})
          </button>

          <button (click)="filterMode.set('avoid')"
            [class]="filterMode() === 'avoid'
              ? 'px-3.5 py-1.5 rounded-xl bg-orange-500 text-zinc-950 font-bold text-xs transition cursor-pointer border border-orange-400/50'
              : 'px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 transition cursor-pointer hover:text-zinc-200'">
            ⚠️ Stay Away From ({{ avoidCount() }})
          </button>
        </div>

        <span class="text-[10.5px] text-zinc-400 font-mono">
          Radius: <strong class="text-zinc-200">Local (Within 10 miles)</strong>
        </span>
      </div>

      <!-- Social Gravitation Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 font-sans mb-8">
        @for (vector of filteredVectors(); track vector.id) {
          <div (click)="selectVector(vector)"
            class="p-5 rounded-2xl border bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition cursor-pointer flex flex-col justify-between group shadow-sm font-mono">
            
            <div>
              <!-- Top Row -->
              <div class="flex items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-2.5">
                  <span class="text-2xl group-hover:scale-110 transition-transform">{{ vector.emoji }}</span>
                  <div>
                    <h3 class="text-xs font-bold text-zinc-100 uppercase tracking-tight font-mono">{{ vector.name }}</h3>
                    <span class="text-[9.5px] text-zinc-400 block">📍 {{ vector.locationName }} ({{ vector.distanceMiles }} mi)</span>
                  </div>
                </div>

                @if (vector.type === 'gravitate') {
                  <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-950 text-orange-400 border border-zinc-800 uppercase">
                    {{ vector.coherenceMatchPercent }}% Match
                  </span>
                } @else {
                  <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-950 text-rose-400 border border-zinc-800 uppercase">
                    Avoid Target
                  </span>
                }
              </div>

              <!-- Impact & Rationale -->
              <div class="space-y-2 text-xs mb-3 font-sans">
                <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span class="text-[9.5px] uppercase font-bold text-zinc-400 font-mono block mb-0.5">Biomarker Impact:</span>
                  <p class="text-[11px] text-zinc-300 leading-relaxed">
                    {{ vector.biomarkerImpact }}
                  </p>
                </div>

                <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span class="text-[9.5px] uppercase font-bold text-zinc-400 font-mono block mb-0.5">Energetic & TCM Rationale:</span>
                  <p class="text-[11px] text-zinc-300 leading-relaxed font-mono">
                    {{ vector.energeticRationale }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Footer -->
            <div class="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono">
              <span class="text-zinc-400">TCM: {{ vector.tcmAyurvedicMatch }}</span>
              
              @if (vector.type === 'gravitate') {
                <button (click)="rsvpVector($event, vector)"
                  class="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold uppercase transition border border-orange-400/50">
                  🤝 Join Circle
                </button>
              } @else {
                <span class="text-rose-400 font-bold uppercase">🛑 Steer Clear</span>
              }
            </div>

          </div>
        }
      </div>

      <!-- Pro-Health Hobbies & Human Flourishing Suite -->
      <div class="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 relative z-10 font-mono">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div class="flex items-center gap-3">
            <span class="text-xl">🌱</span>
            <div>
              <h3 class="text-xs font-bold uppercase tracking-widest text-orange-400">
                Pro-Health Hobbies & Character-Building Interests
              </h3>
              <p class="text-[11px] text-zinc-400 font-sans mt-0.5">
                Recommended activities to cultivate resilience, emotional balance, and lifelong flourishing.
              </p>
            </div>
          </div>
          <span class="text-[9.5px] font-bold px-2.5 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 uppercase">
            Therapeutic Interests
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
          @for (hobby of hobbies(); track hobby.id) {
            <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-3 hover:border-orange-500/40 transition">
              <div>
                <div class="flex items-center justify-between font-mono mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ hobby.emoji }}</span>
                    <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-tight font-mono">{{ hobby.name }}</h4>
                  </div>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono uppercase border border-zinc-800">{{ hobby.difficulty }}</span>
                </div>

                <div class="space-y-1.5 text-[11px]">
                  <p class="text-zinc-300 leading-relaxed font-sans">
                    <strong class="text-orange-400 font-mono text-[10px] uppercase block">Trait: {{ hobby.characterTrait }}</strong>
                    {{ hobby.clinicalBenefits }}
                  </p>
                  <p class="text-zinc-400 font-mono text-[10px]">
                    Synergy: <span class="text-emerald-400">{{ hobby.energeticSynergy }}</span>
                  </p>
                </div>
              </div>

              <div class="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono">
                <span class="text-zinc-400">⏱ {{ hobby.timeCommitment }}</span>
                <button (click)="adoptHobby(hobby)"
                  class="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold uppercase transition border border-orange-400/50">
                  ✨ Adopt Hobby
                </button>
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class SocialHealthGravitationComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  filterMode = signal<'all' | 'gravitate' | 'avoid'>('all');

  hobbies = signal<IHobbyVector[]>([
    {
      id: 'hob-1',
      name: 'Bonsai Cultivation & Horticulture',
      emoji: '🪴',
      timeCommitment: '2 hrs/week',
      difficulty: 'Beginner',
      characterTrait: 'Patience & Long-term Mindfulness',
      clinicalBenefits: 'Reduces salivary cortisol arousal by 22%, enhances fine motor coordination, and calms prefrontal chatter.',
      energeticSynergy: 'Balances Wood element; grounds erratic Vata energy and clears Liver Qi stagnation.'
    },
    {
      id: 'hob-2',
      name: 'Ceramic Pottery & Clay Sculpting',
      emoji: '🏺',
      timeCommitment: '3 hrs/week',
      difficulty: 'Intermediate',
      characterTrait: 'Somatic Emotional Grounding',
      clinicalBenefits: 'Provides tactile sensory stimulation, activates bilateral brain hemispheres, and reduces amygdala fear reactivity.',
      energeticSynergy: 'Tonifies Earth element and Spleen Qi; anchors floating Shen spirit.'
    },
    {
      id: 'hob-3',
      name: 'Classical Acoustic Guitar & Sight-Reading',
      emoji: '🎸',
      timeCommitment: '4 hrs/week',
      difficulty: 'Intermediate',
      characterTrait: 'Focus & Polyphonic Harmony',
      clinicalBenefits: 'Enhances neuroplasticity, boosts HRV coherence during fingerpicking, and stimulates auditory cortex.',
      energeticSynergy: 'Harmonizes Heart Fire and Kidney Water; elevates spirit.'
    }
  ]);

  vectors = signal<ISocialVector[]>([
    {
      id: 'vec-1',
      name: 'Community Organic Permaculture Garden',
      category: 'community',
      type: 'gravitate',
      coherenceMatchPercent: 96,
      distanceMiles: 1.4,
      emoji: '🥬',
      biomarkerImpact: 'Grounding tactile soil microbes (Mycobacterium vaccae) boost brain serotonin & reduce IL-6.',
      energeticRationale: 'Spleen Earth element tonification & Liver Qi dispersion.',
      tcmAyurvedicMatch: 'Earth / Kapha Balance',
      locationName: 'Androscoggin Community Garden'
    },
    {
      id: 'vec-2',
      name: 'Sunset Forest Bathing & Vagal Breathing Circle',
      category: 'event',
      type: 'gravitate',
      coherenceMatchPercent: 94,
      distanceMiles: 3.2,
      emoji: '🌲',
      biomarkerImpact: 'Aerosolized phytoncides increase Natural Killer (NK) immune cell count & lowers blood pressure.',
      energeticRationale: 'Wood & Lung Metal element harmony.',
      tcmAyurvedicMatch: 'Vata Calming',
      locationName: 'Pine Tree Sanctuary'
    },
    {
      id: 'vec-3',
      name: 'Heavy Industrial EMF & Noise Construction Site',
      category: 'avoidance',
      type: 'avoid',
      coherenceMatchPercent: 12,
      distanceMiles: 0.8,
      emoji: '🏗️',
      biomarkerImpact: 'Elevates sympathetic vasoconstriction, spikes epinephrine, and disrupts 0.1 Hz baroreflex.',
      energeticRationale: 'Agitates Heart Shen & disturbs Liver Yang.',
      tcmAyurvedicMatch: 'Severe Pitta/Vata Aggravation',
      locationName: 'Downtown High-Rise Site'
    }
  ]);

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Phil Gear';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Phil Gear';
  });

  filteredVectors = computed(() => {
    const mode = this.filterMode();
    if (mode === 'gravitate') return this.vectors().filter(v => v.type === 'gravitate');
    if (mode === 'avoid') return this.vectors().filter(v => v.type === 'avoid');
    return this.vectors();
  });

  gravitateCount = computed(() => this.vectors().filter(v => v.type === 'gravitate').length);
  avoidCount = computed(() => this.vectors().filter(v => v.type === 'avoid').length);

  selectVector(vector: ISocialVector) {
    console.log('Selected vector:', vector);
  }

  rsvpVector(event: Event, vector: ISocialVector) {
    event.stopPropagation();
    alert(`🤝 Reserved spot for ${vector.name}! Added to local health schedule.`);
  }

  adoptHobby(hobby: IHobbyVector) {
    this.patientState.addClinicalNote({
      id: `hobby-${Date.now()}`,
      text: `🌱 Adopted Therapeutic Hobby: ${hobby.name} (${hobby.characterTrait}). ${hobby.clinicalBenefits}`,
      sourceLens: 'Social & Lifestyle',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`✨ Adopted Hobby: ${hobby.name}! Added to patient care plan strategy.`);
  }
}
