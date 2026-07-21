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
      
      <!-- Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 relative z-10 font-mono">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse"></span>
            <h2 class="text-xl font-bold uppercase tracking-tight text-zinc-100">
              🧭 Social Health & Local Event Gravitation Matrix
            </h2>
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              Coherence Vector Engine
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1.5 font-sans">
            Personalized local community connections to <strong>gravitate towards</strong> for vagal healing, and environmental stressors to <strong>stay away from</strong>.
          </p>
        </div>

        <div class="text-right text-[11px] text-zinc-400">
          <span>Active Patient: <strong class="text-emerald-400 font-bold uppercase">{{ activePatientName() }}</strong></span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 font-mono">
        <div class="flex items-center gap-2">
          <button (click)="filterMode.set('all')"
            [class.bg-zinc-800]="filterMode() === 'all'"
            [class.border-zinc-700]="filterMode() === 'all'"
            class="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 transition cursor-pointer hover:border-zinc-700">
            🌐 All Vectors ({{ vectors().length }})
          </button>

          <button (click)="filterMode.set('gravitate')"
            [class.bg-emerald-950/80]="filterMode() === 'gravitate'"
            [class.border-emerald-500/50]="filterMode() === 'gravitate'"
            [class.text-emerald-300]="filterMode() === 'gravitate'"
            class="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 transition cursor-pointer hover:border-emerald-500/40">
            🌱 Gravitate Towards ({{ gravitateCount() }})
          </button>

          <button (click)="filterMode.set('avoid')"
            [class.bg-rose-950/80]="filterMode() === 'avoid'"
            [class.border-rose-500/50]="filterMode() === 'avoid'"
            [class.text-rose-300]="filterMode() === 'avoid'"
            class="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 transition cursor-pointer hover:border-rose-500/40">
            ⚠️ Stay Away From ({{ avoidCount() }})
          </button>
        </div>

        <span class="text-[10.5px] text-zinc-400">
          Radius: <strong class="text-zinc-200">Local (Within 10 miles)</strong>
        </span>
      </div>

      <!-- Social Gravitation Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 font-sans mb-8">
        @for (vector of filteredVectors(); track vector.id) {
          <div (click)="selectVector(vector)"
            [class.border-emerald-500/40]="vector.type === 'gravitate'"
            [class.bg-emerald-950/20]="vector.type === 'gravitate'"
            [class.border-rose-500/40]="vector.type === 'avoid'"
            [class.bg-rose-950/20]="vector.type === 'avoid'"
            class="p-5 rounded-2xl border bg-zinc-900/80 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between group shadow-lg">
            
            <div>
              <!-- Top Row -->
              <div class="flex items-center justify-between gap-2 mb-3 font-mono">
                <div class="flex items-center gap-2">
                  <span class="text-2xl group-hover:scale-110 transition-transform">{{ vector.emoji }}</span>
                  <div>
                    <h3 class="text-xs font-bold text-zinc-100 uppercase tracking-tight font-mono">{{ vector.name }}</h3>
                    <span class="text-[9.5px] text-zinc-400 block font-mono">📍 {{ vector.locationName }} ({{ vector.distanceMiles }} mi)</span>
                  </div>
                </div>

                @if (vector.type === 'gravitate') {
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    {{ vector.coherenceMatchPercent }}% Match
                  </span>
                } @else {
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    Avoid Target
                  </span>
                }
              </div>

              <!-- Impact & Rationale -->
              <div class="space-y-2 text-xs mb-3 font-sans">
                <div class="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span class="text-[9.5px] uppercase font-bold text-zinc-400 font-mono block mb-0.5">Biomarker Impact:</span>
                  <p class="text-[11px] text-zinc-300 leading-relaxed">
                    {{ vector.biomarkerImpact }}
                  </p>
                </div>

                <div class="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span class="text-[9.5px] uppercase font-bold text-zinc-400 font-mono block mb-0.5">Energetic & TCM Rationale:</span>
                  <p class="text-[11px] text-zinc-300 leading-relaxed font-mono">
                    {{ vector.energeticRationale }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Footer -->
            <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
              <span class="text-zinc-500">TCM: {{ vector.tcmAyurvedicMatch }}</span>
              
              @if (vector.type === 'gravitate') {
                <button (click)="rsvpVector($event, vector)"
                  class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase transition shadow-sm active:scale-95">
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
      <div class="p-6 rounded-3xl bg-zinc-900/90 border border-indigo-500/30 relative z-10 font-mono overflow-hidden">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🌱</span>
            <div>
              <h3 class="text-sm font-bold uppercase tracking-tight text-indigo-200">
                Pro-Health Hobbies & Character-Building Interests
              </h3>
              <p class="text-[11px] text-zinc-400 font-sans mt-0.5">
                Recommended activities to cultivate resilience, emotional balance, and lifelong flourishing aligned with patient conditions.
              </p>
            </div>
          </div>
          <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
            Therapeutic Interests
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
          @for (hobby of hobbies(); track hobby.id) {
            <div class="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition">
              <div>
                <div class="flex items-center justify-between font-mono mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{{ hobby.emoji }}</span>
                    <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-tight font-mono">{{ hobby.name }}</h4>
                  </div>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-indigo-300 font-mono uppercase">{{ hobby.difficulty }}</span>
                </div>

                <div class="space-y-1.5 text-[11px]">
                  <p class="text-zinc-300 leading-relaxed font-sans">
                    <strong class="text-indigo-400 font-mono text-[10px] uppercase block">Trait: {{ hobby.characterTrait }}</strong>
                    {{ hobby.clinicalBenefits }}
                  </p>
                  <p class="text-zinc-400 font-mono text-[10px]">
                    Synergy: <span class="text-emerald-300">{{ hobby.energeticSynergy }}</span>
                  </p>
                </div>
              </div>

              <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                <span class="text-zinc-500">⏱ {{ hobby.timeCommitment }}</span>
                <button (click)="adoptHobby(hobby)"
                  class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase transition shadow-sm cursor-pointer active:scale-95">
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
      name: 'Acoustic String Instrument (Lute/Harp)',
      emoji: '🪕',
      timeCommitment: '4 hrs/week',
      difficulty: 'Intermediate',
      characterTrait: 'Neuroplastic Harmony & Expression',
      clinicalBenefits: 'Increases 10Hz occipital alpha power, boosts auditory-motor plasticity, and triggers endogenous endorphin release.',
      energeticSynergy: 'Expands Heart Pericardium energy and enhances Sattvic clarity.'
    },
    {
      id: 'hob-4',
      name: 'Wild Botanical Foraging & Herbal Crafting',
      emoji: '🌿',
      timeCommitment: '2 hrs/week',
      difficulty: 'Beginner',
      characterTrait: 'Ecological Intelligence & Vitality',
      clinicalBenefits: 'Phytoncide inhalation from trees boosts Natural Killer (NK) immune cell counts and enhances aerobic capacity.',
      energeticSynergy: 'Harmonizes Five Elements (Wu Xing) and preserves Kidney Jing essence.'
    },
    {
      id: 'hob-5',
      name: 'Animal Rescue Volunteering',
      emoji: '🐕',
      timeCommitment: '2 hrs/week',
      difficulty: 'Beginner',
      characterTrait: 'Altruistic Compassion & Purpose',
      clinicalBenefits: 'Surges plasma oxytocin levels, lowers resting heart rate, and fosters profound existential emotional resilience.',
      energeticSynergy: 'Embodiment of Sattva Guna (Purity); nourishes Heart Blood.'
    }
  ]);


  vectors = signal<ISocialVector[]>([
    {
      id: 'soc-1',
      name: 'Sunrise Ocean Vagal Breathwork Circle',
      category: 'event',
      type: 'gravitate',
      coherenceMatchPercent: 96,
      distanceMiles: 1.8,
      emoji: '🌅',
      biomarkerImpact: 'Triggers parasympathetic vagal stimulation, lowers serum cortisol by 24%, and boosts 10Hz occipital alpha waves.',
      energeticRationale: 'Sattva Guna pure energy; nourishes Heart Blood and grounds erratic Shen in coastal salt air.',
      tcmAyurvedicMatch: 'Sattva (Purity) & Heart Shen Harmony',
      locationName: 'Pacific Cove Sanctuary'
    },
    {
      id: 'soc-2',
      name: 'Farm-to-Table Organic Nootropic Potluck',
      category: 'community',
      type: 'gravitate',
      coherenceMatchPercent: 92,
      distanceMiles: 3.2,
      emoji: '🥗',
      biomarkerImpact: 'Upregulates gut microbiome diversity, increases short-chain fatty acid (SCFA) production, and elevates serotonin synthesis.',
      energeticRationale: 'Tonifies TCM Spleen Qi and earth element; fosters empathetic social bonding.',
      tcmAyurvedicMatch: 'Spleen Qi & Ojas Building',
      locationName: 'Green Meadow Organic Commons'
    },
    {
      id: 'soc-3',
      name: '528 Hz Solfeggio Sound Healing & Tea Ceremony',
      category: 'event',
      type: 'gravitate',
      coherenceMatchPercent: 95,
      distanceMiles: 2.5,
      emoji: '🫖',
      biomarkerImpact: 'Increases heart rate variability (HRV), promotes prefrontal delta-theta synchronization, and reduces blood pressure.',
      energeticRationale: 'Harmonizes kidney Jing essence and opens the pericardium meridian.',
      tcmAyurvedicMatch: 'Jing Preservation & Shen Tranquilization',
      locationName: 'Lotus Temple Tea House'
    },
    {
      id: 'soc-4',
      name: 'Late-Night High-Noise Club & Alcohol Lounge',
      category: 'avoidance',
      type: 'avoid',
      coherenceMatchPercent: 12,
      distanceMiles: 4.1,
      emoji: '🍻',
      biomarkerImpact: 'Suppresses slow-wave delta glymphatic clearance, surges nocturnal cortisol & adrenaline, and spikes oxidative stress markers.',
      energeticRationale: 'Rajasic/Tamasic chaos; disturbs Liver Qi, depletes Heart Blood, and induces Shen agitation.',
      tcmAyurvedicMatch: 'Rajasic Agitation & Liver Fire Spike',
      locationName: 'Neon Underground Nightclub'
    },
    {
      id: 'soc-5',
      name: 'Heavy Traffic Smog & High-EMF Commercial Zone',
      category: 'environment',
      type: 'avoid',
      coherenceMatchPercent: 18,
      distanceMiles: 5.0,
      emoji: '🏭',
      biomarkerImpact: 'Increases systemic particulate matter inflammatory cytokines (IL-6, TNF-alpha) and disrupts cell membrane polarization.',
      energeticRationale: 'Depletes Lung Qi and weakens Wei Qi defensive protective aura against external pathogens.',
      tcmAyurvedicMatch: 'Lung Qi Deficiency & Toxic Heat Accumulation',
      locationName: 'Industrial Highway Corridor'
    }
  ]);

  gravitateCount = computed(() => this.vectors().filter(v => v.type === 'gravitate').length);
  avoidCount = computed(() => this.vectors().filter(v => v.type === 'avoid').length);

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  filteredVectors = computed(() => {
    const mode = this.filterMode();
    if (mode === 'gravitate') return this.vectors().filter(v => v.type === 'gravitate');
    if (mode === 'avoid') return this.vectors().filter(v => v.type === 'avoid');
    return this.vectors();
  });

  selectVector(vector: ISocialVector) {
    const actionText = vector.type === 'gravitate' ? 'Gravitate Towards' : 'Stay Away From';
    const noteText = `🧭 Social Health Vector (${actionText}): ${vector.emoji} ${vector.name} (${vector.coherenceMatchPercent}% Match) - Location: ${vector.locationName}`;
    this.patientState.addClinicalNote({
      id: `soc-vec-${vector.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }

  rsvpVector(event: Event, vector: ISocialVector) {
    event.stopPropagation();
    alert(`🤝 Connected to Pro-Health Social Circle: ${vector.name}\nLocation: ${vector.locationName}\nCoherence Match: ${vector.coherenceMatchPercent}%`);
  }

  adoptHobby(hobby: IHobbyVector) {
    const noteText = `🌱 Adopted Pro-Health Hobby: ${hobby.emoji} ${hobby.name} (${hobby.characterTrait}) - ${hobby.clinicalBenefits}`;
    this.patientState.addClinicalNote({
      id: `hobby-${hobby.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`🌱 Adopted Pro-Health Hobby: ${hobby.name}\nCharacter Focus: ${hobby.characterTrait}\nPrescribed Commitment: ${hobby.timeCommitment}`);
  }
}

