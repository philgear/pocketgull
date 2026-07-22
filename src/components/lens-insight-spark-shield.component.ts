import { Component, ChangeDetectionStrategy, inject, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IInsightSpark {
  id: string;
  lensCategory: 'Summary Overview' | 'Functional Protocols' | 'Nutrition' | 'Monitoring & Follow-up' | 'Patient Education' | 'Precision Nutrients';
  title: string;
  hypothesis: string;
  keyBiomarkers: string[];
  proposedTrialProtocol: string;
  pubmedSearchQuery: string;
  innovationBadge: string;
}

@Component({
  selector: 'app-lens-insight-spark-shield',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-sans relative overflow-hidden">
      
      <!-- Ambient Dynamic Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header & Lens Shield Telemetry Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 font-mono relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-2xl animate-pulse">💡</span>
            <div>
              <h2 class="text-lg font-bold uppercase tracking-tight text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <span>Lens Innovation Shield & Insight Sparks</span>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 uppercase">
                  {{ activeLens() }} Shield Active
                </span>
              </h2>
              <p class="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-0.5">
                Targeted clinical safety shields and translational research sparks for <strong>{{ activePatientName() }}</strong>.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 font-mono text-xs">
          <button (click)="isDrillDownOpen.set(true)"
            class="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase transition shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5 focus:ring-2 focus:ring-indigo-400 outline-none">
            <span>🔬</span>
            <span>Drill-Down Insight Sparks ({{ activeSparks().length }})</span>
          </button>
        </div>
      </div>

      <!-- Lens-Specific Active Innovation Shield Banner -->
      <div class="p-5 rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-indigo-900/50 mb-6 font-mono shadow-xs">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3 mb-3">
          <div class="flex items-center gap-2 text-xs">
            <span class="text-lg">{{ getLensIcon(activeLens()) }}</span>
            <span class="font-bold uppercase text-indigo-700 dark:text-indigo-300">{{ activeLens() }} Innovation Shield Protocol</span>
          </div>
          <span class="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            PROTECTION ENGAGED
          </span>
        </div>

        <p class="text-xs text-slate-700 dark:text-zinc-300 font-sans leading-relaxed">
          {{ getLensShieldSummary(activeLens()) }}
        </p>
      </div>

      <!-- Insight Sparks Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (spark of activeSparks(); track spark.id) {
          <div class="p-5 rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition flex flex-col justify-between group shadow-xs">
            
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2 mb-2.5 font-mono text-[10px]">
                <span class="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold uppercase border border-indigo-500/30">
                  ⚡ {{ spark.innovationBadge }}
                </span>
                <span class="text-slate-500 dark:text-zinc-400">Translational Research Spark</span>
              </div>

              <h4 class="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-1">
                {{ spark.title }}
              </h4>

              <p class="text-[11px] text-slate-700 dark:text-zinc-300 font-sans leading-relaxed mb-3">
                <strong>Hypothesis:</strong> {{ spark.hypothesis }}
              </p>

              <div class="mb-3">
                <span class="text-[10px] font-mono text-slate-500 dark:text-zinc-400 font-bold uppercase block mb-1">Key Biomarkers / Metrics:</span>
                <div class="flex flex-wrap gap-1 font-mono text-[9.5px]">
                  @for (bio of spark.keyBiomarkers; track bio) {
                    <span class="px-2 py-0.5 rounded-md bg-indigo-50/50 dark:bg-zinc-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-zinc-800">
                      🧪 {{ bio }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Footer Action Buttons (Rams 8px Grid Spacing & Focus Accessibility) -->
            <div class="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between font-mono text-[10px]">
              <button (click)="launchPubMedSearch(spark)"
                class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline font-bold flex items-center gap-1 focus:ring-1 focus:ring-indigo-400 outline-none rounded-xs px-1">
                <span>📚 Launch PubMed Search</span>
              </button>

              <button (click)="bookmarkSpark(spark)"
                class="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-[9.5px] font-bold uppercase transition cursor-pointer active:scale-95 border border-slate-300 dark:border-zinc-700/60 focus:ring-2 focus:ring-indigo-500/50 outline-none">
                📌 Log Research Hypothesis
              </button>
            </div>

          </div>
        }
      </div>

      <!-- Drill-Down Exploration Modal -->
      @if (isDrillDownOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans animate-in fade-in duration-200">
          <div class="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 text-zinc-100 shadow-2xl font-mono">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">🔬</span>
                <h3 class="text-sm font-bold uppercase text-indigo-400">Drill-Down Clinical Insight Spark Directory</h3>
              </div>
              <button (click)="isDrillDownOpen.set(false)" class="text-xs text-zinc-400 hover:text-zinc-200">✕ Close</button>
            </div>

            <div class="space-y-3 text-xs font-mono mb-4 max-h-96 overflow-y-auto pr-1">
              @for (spark of allSparks; track spark.id) {
                <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <div class="flex items-center justify-between text-[10px]">
                    <span class="text-indigo-400 font-bold uppercase">{{ spark.lensCategory }}</span>
                    <span class="text-zinc-400">{{ spark.innovationBadge }}</span>
                  </div>
                  <h5 class="text-xs font-bold text-zinc-100">{{ spark.title }}</h5>
                  <p class="text-[11px] text-zinc-300 font-sans">{{ spark.proposedTrialProtocol }}</p>
                </div>
              }
            </div>

            <button (click)="isDrillDownOpen.set(false)"
              class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-xs rounded-xl transition">
              Acknowledge Drill-Down Insights
            </button>
          </div>
        </div>
      }

    </div>
  `
})
export class LensInsightSparkShieldComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  activeLens = input<string>('Summary Overview');
  isDrillDownOpen = signal<boolean>(false);

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Phil Gear';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Phil Gear';
  });

  allSparks: IInsightSpark[] = [
    {
      id: 'sp1',
      lensCategory: 'Functional Protocols',
      title: '0.1 Hz Resonant Breathing & Leukocyte Telomere Epigenetics',
      hypothesis: '12 weeks of 0.1 Hz vagal resonant breathing reduces leukocyte DNA methylation age (Horvath Clock) via HPA axis cortisol dampening.',
      keyBiomarkers: ['Horvath mDNA Age', 'Baroreflex Sensitivity', 'Salivary Cortisol AUC'],
      proposedTrialProtocol: 'N=60 randomized clinical trial evaluating daily 15-min 0.1 Hz AVS breathing vs sham controls over 90 days.',
      pubmedSearchQuery: 'vagus nerve stimulation telomere length epigenetics',
      innovationBadge: 'Epigenetic Clock Trial'
    },
    {
      id: 'sp2',
      lensCategory: 'Nutrition',
      title: 'Circadian Chrono-Nutrition & GLUT4 Hepatic Clearance',
      hypothesis: 'Restricting macronutrient intake to individual BMAL1 peak expression window enhances postprandial glucose clearance by 42%.',
      keyBiomarkers: ['BMAL1/CLOCK mRNA', 'Continuous Glucose AUC', 'HOMA-IR'],
      proposedTrialProtocol: 'Cross-over trial matching meal timing with salivary melatonin onset window.',
      pubmedSearchQuery: 'BMAL1 clock gene chrono-nutrition glucose clearance',
      innovationBadge: 'Circadian Metabolic Spark'
    },
    {
      id: 'sp3',
      lensCategory: 'Precision Nutrients',
      title: 'Anthocyanin Glymphatic Amyloid Clearance',
      hypothesis: 'Natural Beetroot & Hibiscus Anthocyanins combined with 40 Hz Gamma entrainment accelerate parenchymal glymphatic waste clearance.',
      keyBiomarkers: ['CSF Amyloid-Beta 42', 'Tau Phosphorylation', 'Glymphatic MRI Flow'],
      pubmedSearchQuery: 'anthocyanin gamma entrainment glymphatic clearance',
      proposedTrialProtocol: 'Co-administration of organic beetroot anthocyanin extract with 40 Hz AVS soundscapes.',
      innovationBadge: 'Glymphatic Protection'
    }
  ];

  activeSparks = computed(() => {
    const current = this.activeLens();
    const matches = this.allSparks.filter(s => s.lensCategory === current);
    return matches.length > 0 ? matches : this.allSparks.slice(0, 2);
  });

  getLensIcon(lens: string): string {
    switch (lens) {
      case 'Summary Overview': return '🌳';
      case 'Functional Protocols': return '🧘';
      case 'Nutrition': return '🥑';
      case 'Monitoring & Follow-up': return '🚨';
      case 'Patient Education': return '🇬🇧';
      case 'Precision Nutrients': return '🧬';
      default: return '🛡️';
    }
  }

  getLensShieldSummary(lens: string): string {
    switch (lens) {
      case 'Summary Overview':
        return 'Combines the Karolinska Cognitive Load Shield with the Living Apple Lifecycle Tree to protect clinician attention and visualize goal progression.';
      case 'Functional Protocols':
        return 'Gates AVS neuro-therapy soundscapes through trauma-safety screening (PTSD/photosensitivity) while driving 0.1 Hz baroreflex vagal stimulation.';
      case 'Nutrition':
        return 'Actively screens ingredients against dietary allergies, auto-blocking synthetic Red Dye #40 and substituting organic anthocyanins.';
      case 'Monitoring & Follow-up':
        return 'Computes vitals-driven emergency osmotic hydration, TCM cooling infusions, and live GPS coastal climate adjustments.';
      case 'Patient Education':
        return 'Enforces UK RIO Research Integrity Office evidence tiering (Grade A/B), COI transparency, and cryptographic SHA-256 provenance logging.';
      case 'Precision Nutrients':
        return 'Linus Pauling Orthomolecular Biomarker Matrix balancing micronutrient saturation levels (Magnesium, D3, B12, Zinc).';
      default:
        return 'Multi-layer clinical protection shield engaged.';
    }
  }

  launchPubMedSearch(spark: IInsightSpark) {
    this.patientState.requestResearchSearch(spark.pubmedSearchQuery, 'pubmed');
  }

  bookmarkSpark(spark: IInsightSpark) {
    const noteText = `💡 Research Hypothesis Logged (${spark.lensCategory}): ${spark.title} — ${spark.hypothesis}`;
    this.patientState.addClinicalNote({
      id: `spark-${spark.id}-${Date.now()}`,
      text: noteText,
      sourceLens: spark.lensCategory,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }
}
