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
      
      <!-- Header & Lens Shield Telemetry Banner (Dieter Rams Braun Style) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 font-mono relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-xl">💡</span>
            <div>
              <h2 class="text-base font-black uppercase tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Lens Innovation Shield & Insight Sparks</span>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800 uppercase">
                  {{ activeLens() }} Shield Active
                </span>
              </h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">
                Targeted clinical safety shields and translational research sparks for <strong>{{ activePatientName() }}</strong>.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 font-mono text-xs">
          <button (click)="isDrillDownOpen.set(true)"
            class="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-[10px] font-bold uppercase transition shadow-md cursor-pointer flex items-center gap-1.5 border border-orange-400/50">
            <span>🔬</span>
            <span>Drill-Down Insight Sparks ({{ activeSparks().length }})</span>
          </button>
        </div>
      </div>

      <!-- Lens-Specific Active Innovation Shield Banner -->
      <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 font-mono shadow-sm">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
          <div class="flex items-center gap-2 text-xs">
            <span class="text-lg">{{ getLensIcon(activeLens()) }}</span>
            <span class="font-bold uppercase text-orange-400">{{ activeLens() }} Innovation Shield Protocol</span>
          </div>
          <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
            PROTECTION ENGAGED
          </span>
        </div>

        <p class="text-xs text-zinc-300 font-sans leading-relaxed">
          {{ getLensShieldSummary(activeLens()) }}
        </p>
      </div>

      <!-- Insight Sparks Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        @for (spark of activeSparks(); track spark.id) {
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition flex flex-col justify-between group shadow-sm">
            
            <div>
              <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5 font-mono text-[10px]">
                <span class="px-2 py-0.5 rounded bg-zinc-950 text-orange-400 font-bold uppercase border border-zinc-800">
                  ⚡ {{ spark.innovationBadge }}
                </span>
                <span class="text-zinc-400">Translational Research Spark</span>
              </div>

              <h4 class="text-xs font-bold text-zinc-100 group-hover:text-orange-400 transition-colors leading-snug mb-1 font-sans">
                {{ spark.title }}
              </h4>

              <p class="text-[11px] text-zinc-300 font-sans leading-relaxed mb-3">
                <strong>Hypothesis:</strong> {{ spark.hypothesis }}
              </p>

              <div class="mb-3">
                <span class="text-[10px] font-mono text-zinc-400 font-bold uppercase block mb-1">Key Biomarkers / Metrics:</span>
                <div class="flex flex-wrap gap-1 font-mono text-[9.5px]">
                  @for (bio of spark.keyBiomarkers; track bio) {
                    <span class="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                      🧪 {{ bio }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Footer Action Buttons -->
            <div class="pt-3 border-t border-zinc-800 flex items-center justify-between font-mono text-[10px]">
              <button (click)="launchPubMedSearch(spark)"
                class="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1">
                <span>📚 Launch PubMed Search</span>
              </button>

              <button (click)="bookmarkSpark(spark)"
                class="px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-300 text-[9.5px] font-bold uppercase transition cursor-pointer border border-zinc-800">
                📌 Log Hypothesis
              </button>
            </div>

          </div>
        }
      </div>

      <!-- Drill-Down Exploration Modal -->
      @if (isDrillDownOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans animate-in fade-in duration-200">
          <div class="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 text-zinc-100 shadow-2xl font-mono">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">🔬</span>
                <h3 class="text-sm font-bold uppercase text-orange-400">Drill-Down Clinical Insight Spark Directory</h3>
              </div>
              <button (click)="isDrillDownOpen.set(false)" class="text-xs text-zinc-400 hover:text-zinc-200">✕ Close</button>
            </div>

            <div class="space-y-3 text-xs font-mono mb-4 max-h-96 overflow-y-auto pr-1">
              @for (spark of allSparks; track spark.id) {
                <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                  <div class="flex items-center justify-between text-[10px]">
                    <span class="text-orange-400 font-bold uppercase">{{ spark.lensCategory }}</span>
                    <span class="text-zinc-400">{{ spark.innovationBadge }}</span>
                  </div>
                  <h5 class="text-xs font-bold text-zinc-100 font-sans">{{ spark.title }}</h5>
                  <p class="text-[11px] text-zinc-300 font-sans">{{ spark.proposedTrialProtocol }}</p>
                </div>
              }
            </div>

            <button (click)="isDrillDownOpen.set(false)"
              class="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold uppercase text-xs rounded-xl transition border border-orange-400/50">
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
      proposedTrialProtocol: 'Pilot human imaging study tracking glymphatic tracer transit post-AVS gamma entrainment.',
      pubmedSearchQuery: 'anthocyanin gamma entrainment glymphatic clearance',
      innovationBadge: 'Glymphatic Clearance'
    }
  ];

  activeSparks = computed(() => {
    const currentLens = this.activeLens();
    const filtered = this.allSparks.filter(s => s.lensCategory === currentLens);
    return filtered.length > 0 ? filtered : this.allSparks.slice(0, 2);
  });

  getLensIcon(lens: string): string {
    switch (lens) {
      case 'Summary Overview': return '📋';
      case 'Functional Protocols': return '🧠';
      case 'Nutrition': return '🥗';
      case 'Monitoring & Follow-up': return '📈';
      case 'Patient Education': return '🎓';
      case 'Precision Nutrients': return '💊';
      default: return '🛡️';
    }
  }

  getLensShieldSummary(lens: string): string {
    switch (lens) {
      case 'Summary Overview':
        return 'Multi-system baseline shield: Synthesizes cardiometabolic risk, vagal tone, and multi-paradigm diagnoses into high-priority clinical actions.';
      case 'Functional Protocols':
        return 'Neurological & autonomic shield: Deploys 0.1 Hz vagal resonant breathing, AVS brainwave entrainment, and HPA axis cortisol dampening.';
      case 'Nutrition':
        return 'Metabolic & chrono-nutrition shield: Aligns macronutrient timing with BMAL1 circadian clock gene expression to optimize postprandial glucose clearance.';
      case 'Monitoring & Follow-up':
        return 'Biomarker tracking shield: Monitors high-sensitivity CRP, ApoB, continuous glucose, and biological age delta metrics over time.';
      case 'Patient Education':
        return 'Empowerment & health literacy shield: Translates complex clinical findings into accessible 3-Act patient stories and actionable habits.';
      case 'Precision Nutrients':
        return 'Phytochemical & epigenetic shield: Utilizes targeted nootropics, anthocyanins, and methyl donors to support cellular detoxification and DNA repair.';
      default:
        return 'Active multi-paradigm healthspan protection engaged.';
    }
  }

  launchPubMedSearch(spark: IInsightSpark) {
    const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(spark.pubmedSearchQuery)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  bookmarkSpark(spark: IInsightSpark) {
    this.patientState.addClinicalNote({
      id: `spark-log-${Date.now()}`,
      text: `🔬 Logged Translational Research Hypothesis: ${spark.title} (${spark.innovationBadge}). Trial Protocol: ${spark.proposedTrialProtocol}`,
      sourceLens: spark.lensCategory,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`📌 Research Hypothesis Logged to Patient Record:\n${spark.title}`);
  }
}
