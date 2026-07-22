import { Component, ChangeDetectionStrategy, inject, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { OshaWorkplaceSafetyService } from '../services/osha-workplace-safety.service';

export interface IGreenRoomReflection {
  id: string;
  author: string;
  role: 'Clinician' | 'Caregiver' | 'Patient' | 'Peer Support';
  timestamp: string;
  reflectionText: string;
  category: 'Gratitude' | 'Shift Debrief' | 'Hero Story' | 'Compassion';
}

@Component({
  selector: 'app-green-room-lounge',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent, PocketGullButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1200] bg-emerald-950/95 backdrop-blur-3xl p-6 sm:p-10 flex flex-col justify-between overflow-y-auto font-sans text-slate-100 animate-in fade-in duration-300">
      
      <!-- Top Navigation Header -->
      <div class="flex items-center justify-between gap-4 pb-6 border-b border-emerald-800/80">
        <div class="flex items-center gap-3">
          <span class="text-3xl p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300">🌿</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">Green Room Clinician & Patient Lounge</span>
              <pocket-gull-badge label="Compassionate Reflections Studio" severity="success"></pocket-gull-badge>
            </div>
            <h2 class="text-xl font-extrabold text-white tracking-tight mt-0.5">The Green Room — Restorative Written Reflections & Debrief</h2>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <pocket-gull-button (click)="openGleeAlbum.emit()" variant="primary" size="sm">
            🎵 Vagal Acoustic Duet
          </pocket-gull-button>

          <button (click)="closeModal.emit()"
            class="w-10 h-10 rounded-full border border-emerald-700 bg-emerald-900 text-emerald-200 hover:bg-emerald-800 font-bold flex items-center justify-center transition cursor-pointer text-lg">
            ✕
          </button>
        </div>
      </div>

      <!-- OSHA Compliance Banner -->
      <div class="my-6 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div class="flex items-center gap-2 text-emerald-300">
          <span>👷 OSHA Worker & Patient Safety Index:</span>
          <span class="font-extrabold text-white">{{ osha().oshaComplianceScorePercent }}% Compliant</span>
          <span>(KSS Level {{ osha().currentKssLevel }}/9 — {{ osha().clinicianFatigueCapOk ? 'Shift Fatigue Safe' : 'Rest Advised' }})</span>
        </div>
        <div class="text-emerald-400 font-semibold">
          Air Quality: {{ osha().environmentalAirQualityIndex }} AQI · Posture: {{ osha().ergonomicPostureStatus }}
        </div>
      </div>

      <!-- Written Reflection Cards Grid -->
      <div class="my-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (card of reflections(); track card.id) {
          <div class="p-5 rounded-3xl bg-emerald-900/50 border border-emerald-700/60 flex flex-col justify-between shadow-xl">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {{ card.category }}
                </span>
                <span class="text-[10px] font-mono text-emerald-400">{{ card.timestamp }}</span>
              </div>
              <p class="text-xs text-slate-200 leading-relaxed font-sans italic">
                "{{ card.reflectionText }}"
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-emerald-800 flex items-center justify-between text-[11px] font-mono text-emerald-300">
              <span class="font-bold">— {{ card.author }}</span>
              <span class="opacity-80">({{ card.role }})</span>
            </div>
          </div>
        }
      </div>

      <!-- Add New Written Reflection Note -->
      <div class="p-6 rounded-3xl bg-emerald-900/60 border border-emerald-700/80 my-4">
        <h4 class="text-sm font-bold uppercase tracking-wider text-emerald-300 mb-3 flex items-center gap-2">
          <span>✍️</span> Add a Written Reflection Card to the Green Room Wall
        </h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <input #reflectionInput type="text" placeholder="Write a message of gratitude, shift encouragement, or patient hero reflection..."
            class="flex-1 py-3 px-4 rounded-xl bg-slate-950/80 border border-emerald-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400">
          <pocket-gull-button (click)="addReflection(reflectionInput.value); reflectionInput.value=''" variant="primary" size="md">
            Publish Reflection Card 🌿
          </pocket-gull-button>
        </div>
      </div>

      <!-- Bottom Status Bar -->
      <div class="pt-4 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-emerald-400">
        <div>Restorative Green Room Lounge · Pocket-Gull Clinician Care Engine v1.1.0</div>
        <div class="flex items-center gap-2 text-emerald-300">
          <span>GCP Project: gen-lang-client-0540208645</span>
        </div>
      </div>

    </div>
  `
})
export class GreenRoomLoungeComponent {
  oshaService = inject(OshaWorkplaceSafetyService);

  closeModal = output<void>();
  openGleeAlbum = output<void>();

  readonly osha = computed(() => this.oshaService.evaluateOshaCompliance());

  readonly reflections = signal<IGreenRoomReflection[]>([
    {
      id: 'ref_1',
      author: 'Dr. Sarah Lin, MD',
      role: 'Clinician',
      timestamp: 'Today, 18:30',
      reflectionText: 'Complex metabolic case stabilized today through resonant 0.1 Hz vagal breathing and precision magnesium glycinate. Immensely grateful for our multidisciplinary care team.',
      category: 'Gratitude'
    },
    {
      id: 'ref_2',
      author: 'Nurse Marcus Vance, RN',
      role: 'Clinician',
      timestamp: 'Today, 16:15',
      reflectionText: 'Post-shift debrief: The Karolinska fatigue shield reminded us to take a 10-minute break. Staying grounded and supporting each other is how we deliver exceptional care.',
      category: 'Shift Debrief'
    },
    {
      id: 'ref_3',
      author: 'Elena & Family',
      role: 'Caregiver',
      timestamp: 'Yesterday, 19:45',
      reflectionText: 'Participating in the Actuarial Glee singalong duet brought so much joy and calm into our living room tonight. Thank you for treating our family with such human dignity.',
      category: 'Hero Story'
    }
  ]);

  addReflection(text: string) {
    if (!text || text.trim().length === 0) return;
    const newCard: IGreenRoomReflection = {
      id: `ref_${Date.now()}`,
      author: 'Clinician Contributor',
      role: 'Clinician',
      timestamp: 'Just now',
      reflectionText: text.trim(),
      category: 'Compassion'
    };
    this.reflections.update(cards => [newCard, ...cards]);
  }
}
