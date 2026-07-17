import { Component, ChangeDetectionStrategy, input, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientManagementService } from '../services/patient-management.service';

interface ITreatmentOption {
  paradigm: 'Western' | 'Eastern' | 'Ayurvedic';
  name: string;
  costLabel: string;
  costValue: number; // 1 (low) to 5 (high)
  effortLabel: string;
  effortValue: number; // 1 (low) to 5 (high)
  efficacy: string;
  holisticLabel: string;
  isNatural: boolean;
  benefits: string[];
  risks: string[];
}

interface ISentinelContainmentOption {
  paradigm: string;
  name: string;
  costLabel: string;
  costValue: number;
  effortLabel: string;
  effortValue: number;
  efficacy: string;
  holisticLabel: string;
  benefits: string[];
  risks: string[];
}

@Component({
  selector: 'app-cost-benefit-analysis',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-8 mt-4 bg-zinc-900/5 dark:bg-black/20 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800/80 shadow-inner relative overflow-hidden">
      <!-- Glowing backgrounds -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 dark:bg-sky-500/5 blur-3xl rounded-full"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 blur-3xl rounded-full"></div>

      <div class="relative z-10">
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/60 dark:border-zinc-800/80">
          <div>
            <h3 class="text-base font-bold text-gray-900 dark:text-zinc-150 uppercase tracking-widest">
              {{ isSentinel() ? 'Outbreak & Clinical Strategy Matrix' : (activeMode() === 'treatment' ? 'Treatment Cost-Benefit Matrix' : 'Patient Prevention Protocols') }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
              {{ isSentinel() ? 'Individual Care vs. Community Containment' : (activeMode() === 'treatment' ? 'Multi-Lens Paradigm Comparison' : 'Long-Term Proactive Health Strategy') }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Mode Switcher (Treatment vs Prevention) -->
            <div class="flex bg-gray-200/80 dark:bg-zinc-800/60 p-0.5 rounded-xl border border-gray-300/30">
              <button (click)="activeMode.set('treatment')"
                [class.bg-white]="activeMode() === 'treatment'"
                [class.dark:bg-zinc-700]="activeMode() === 'treatment'"
                [class.shadow-sm]="activeMode() === 'treatment'"
                [class.text-zinc-900]="activeMode() === 'treatment'"
                [class.dark:text-white]="activeMode() === 'treatment'"
                class="px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400">
                Active Treatment
              </button>
              <button (click)="activeMode.set('prevention')"
                [class.bg-white]="activeMode() === 'prevention'"
                [class.dark:bg-zinc-700]="activeMode() === 'prevention'"
                [class.shadow-sm]="activeMode() === 'prevention'"
                [class.text-zinc-900]="activeMode() === 'prevention'"
                [class.dark:text-white]="activeMode() === 'prevention'"
                class="px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400">
                Preventive Care
              </button>
            </div>
            
            <!-- Quick filters / preferences -->
            <div class="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-zinc-900/60 p-1 rounded-xl border border-gray-200/50 dark:border-zinc-800/80">
              <button (click)="togglePref('lowCost')"
                [class.bg-white]="prefs().lowCost"
                [class.dark:bg-zinc-800]="prefs().lowCost"
                [class.shadow-sm]="prefs().lowCost"
                [class.text-brand-green-600]="prefs().lowCost"
                [class.dark:text-brand-green-400]="prefs().lowCost"
                class="px-2.5 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
                💵 Low Cost
              </button>
              <button (click)="togglePref('lowEffort')"
                [class.bg-white]="prefs().lowEffort"
                [class.dark:bg-zinc-800]="prefs().lowEffort"
                [class.shadow-sm]="prefs().lowEffort"
                [class.text-sky-600]="prefs().lowEffort"
                [class.dark:text-sky-400]="prefs().lowEffort"
                class="px-2.5 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
                ⚡ Low Effort
              </button>
              <button (click)="togglePref('naturalFocus')"
                [class.bg-white]="prefs().naturalFocus"
                [class.dark:bg-zinc-800]="prefs().naturalFocus"
                [class.shadow-sm]="prefs().naturalFocus"
                [class.text-emerald-600]="prefs().naturalFocus"
                [class.dark:text-emerald-400]="prefs().naturalFocus"
                class="px-2.5 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
                🌿 Natural First
              </button>
            </div>
          </div>
        </div>

        <!-- Options Side-by-Side Comparison -->
        <div class="grid grid-cols-1 gap-6" [class.lg:grid-cols-2]="isSentinel()">
          
          <!-- Column 1: Individual Care Options -->
          <div class="flex flex-col gap-4">
            @if (isSentinel()) {
              <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200/40 dark:border-zinc-800/40">
                <span class="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest">👤 Individual Health Strategy</span>
              </div>
            }

            <div class="grid grid-cols-1 gap-5" [class.md:grid-cols-3]="!isSentinel()">
              @for (opt of rankedOptions(); track opt.name) {
                @let isWestern = opt.paradigm === 'Western';
                @let isEastern = opt.paradigm === 'Eastern';
                @let isAyurvedic = opt.paradigm === 'Ayurvedic';
                @let matchScore = calculateMatch(opt);

                <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-5 border border-zinc-200/60 dark:border-zinc-800/80 transition-all duration-300 hover:shadow-lg relative flex flex-col justify-between"
                     [class.ring-2]="matchScore >= 80"
                     [class.ring-emerald-500/40]="matchScore >= 80"
                     [class.dark:ring-emerald-400/30]="matchScore >= 80">
                  
                  <!-- Match score badge -->
                  <div class="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-full text-[12px] font-extrabold tracking-wider uppercase"
                       [class]="matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                matchScore >= 50 ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-gray-150 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'">
                    🎯 {{ matchScore }}% Match
                  </div>

                  <div>
                    <!-- Lens indicator -->
                    <div class="flex items-center gap-2 mb-3">
                      <span class="w-2 h-2 rounded-full"
                            [class.bg-sky-500]="isWestern"
                            [class.bg-emerald-500]="isEastern"
                            [class.bg-amber-500]="isAyurvedic"></span>
                      <span class="text-[12px] font-bold uppercase tracking-wider"
                            [class.text-sky-600]="isWestern"
                            [class.dark:text-sky-400]="isWestern"
                            [class.text-emerald-600]="isEastern"
                            [class.dark:text-emerald-400]="isEastern"
                            [class.text-amber-600]="isAyurvedic"
                            [class.dark:text-amber-400]="isAyurvedic">{{ opt.paradigm }} Lens</span>
                    </div>

                    <!-- Title & Core treatment name -->
                    <h4 class="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-1 pr-16 leading-tight">{{ opt.name }}</h4>
                    <p class="text-[12px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-4">{{ opt.holisticLabel }}</p>

                    <hr class="border-gray-200/60 dark:border-zinc-800/80 mb-4" />

                    <!-- Comparative cost & effort meters -->
                    <div class="space-y-3 mb-4">
                      <div>
                        <div class="flex justify-between text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 mb-1">
                          <span>Estimated Cost</span>
                          <span class="text-gray-800 dark:text-zinc-350">{{ opt.costLabel }}</span>
                        </div>
                        <div class="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                          @for (i of [1,2,3,4,5]; track i) {
                            <div class="h-full flex-1 transition-colors"
                                 [class]="i <= opt.costValue ? 'bg-red-500/60 dark:bg-red-400/50' : 'bg-transparent'"></div>
                          }
                        </div>
                      </div>

                      <div>
                        <div class="flex justify-between text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 mb-1">
                          <span>Effort / Schedule</span>
                          <span class="text-gray-800 dark:text-zinc-350">{{ opt.effortLabel }}</span>
                        </div>
                        <div class="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                          @for (i of [1,2,3,4,5]; track i) {
                            <div class="h-full flex-1 transition-colors"
                                 [class]="i <= opt.effortValue ? 'bg-sky-500/60 dark:bg-sky-400/50' : 'bg-transparent'"></div>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Benefits and side-effects list -->
                    <div class="space-y-3.5 mb-6 text-[12px]">
                      <div>
                        <span class="font-extrabold uppercase tracking-widest text-[12px] text-emerald-600 dark:text-emerald-400 block mb-1">Expected Benefits</span>
                        <ul class="list-none space-y-1">
                          @for (ben of opt.benefits; track ben) {
                            <li class="flex items-start gap-1.5 text-gray-700 dark:text-zinc-300">
                              <span class="text-emerald-500">✓</span>
                              <span>{{ ben }}</span>
                            </li>
                          }
                        </ul>
                      </div>

                      <div>
                        <span class="font-extrabold uppercase tracking-widest text-[12px] text-amber-600 dark:text-amber-400 block mb-1">Side Effects & Risks</span>
                        <ul class="list-none space-y-1">
                          @for (risk of opt.risks; track risk) {
                            <li class="flex items-start gap-1.5 text-gray-600 dark:text-zinc-450">
                              <span class="text-amber-500">⚠</span>
                              <span>{{ risk }}</span>
                            </li>
                          }
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Action choice indicator / match text -->
                  <div class="pt-3 border-t border-gray-150 dark:border-zinc-800/80 flex items-center justify-between">
                    <span class="text-[12px] font-medium text-gray-400 dark:text-zinc-550 uppercase tracking-widest">Clinical Response</span>
                    <span class="text-[12px] font-bold text-gray-800 dark:text-zinc-200">{{ opt.efficacy }}</span>
                  </div>

                </div>
              }
            </div>
          </div>

          <!-- Column 2: Public Health Sentinel Containment (Only if isSentinel) -->
          @if (isSentinel()) {
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200/40 dark:border-zinc-800/40">
                <span class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Community Containment & Triage</span>
              </div>
              
              <div class="grid grid-cols-1 gap-5">
                @for (opt of sentinelOptions; track opt.name) {
                  <div class="bg-amber-500/5 dark:bg-amber-500/5 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20 dark:border-amber-500/10 hover:shadow-lg relative flex flex-col justify-between">
                    <div>
                      <div class="flex items-center gap-2 mb-3">
                        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span class="text-[12px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">{{ opt.paradigm }}</span>
                      </div>

                      <h4 class="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-1 leading-tight">{{ opt.name }}</h4>
                      <p class="text-[12px] text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-4">{{ opt.holisticLabel }}</p>

                      <hr class="border-amber-500/10 mb-4" />

                      <div class="space-y-3 mb-4">
                        <div>
                          <div class="flex justify-between text-[12px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-450 mb-1">
                            <span>Local Cost & Impact</span>
                            <span class="text-gray-800 dark:text-zinc-350">{{ opt.costLabel }}</span>
                          </div>
                          <div class="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                            @for (i of [1,2,3,4,5]; track i) {
                              <div class="h-full flex-1 transition-colors"
                                   [class]="i <= opt.costValue ? 'bg-amber-500/60 dark:bg-amber-500/50' : 'bg-transparent'"></div>
                            }
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between text-[12px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-450 mb-1">
                            <span>Resource Effort</span>
                            <span class="text-gray-800 dark:text-zinc-350">{{ opt.effortLabel }}</span>
                          </div>
                          <div class="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                            @for (i of [1,2,3,4,5]; track i) {
                              <div class="h-full flex-1 transition-colors"
                                   [class]="i <= opt.effortValue ? 'bg-amber-600/60' : 'bg-transparent'"></div>
                            }
                          </div>
                        </div>
                      </div>

                      <div class="space-y-3.5 mb-6 text-[12px]">
                        <div>
                          <span class="font-extrabold uppercase tracking-widest text-[12px] text-emerald-600 dark:text-emerald-400 block mb-1">Containment Benefits</span>
                          <ul class="list-none space-y-1">
                            @for (ben of opt.benefits; track ben) {
                              <li class="flex items-start gap-1.5 text-gray-700 dark:text-zinc-300">
                                <span class="text-emerald-500">✓</span>
                                <span>{{ ben }}</span>
                              </li>
                            }
                          </ul>
                        </div>

                        <div>
                          <span class="font-extrabold uppercase tracking-widest text-[12px] text-red-600 dark:text-red-400 block mb-1">Community Side Effects & Risks</span>
                          <ul class="list-none space-y-1">
                            @for (risk of opt.risks; track risk) {
                              <li class="flex items-start gap-1.5 text-gray-600 dark:text-zinc-450">
                                <span class="text-red-500">⚠</span>
                                <span>{{ risk }}</span>
                              </li>
                            }
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div class="pt-3 border-t border-amber-500/10 flex items-center justify-between">
                      <span class="text-[12px] font-medium text-amber-600/50 dark:text-amber-400/50 uppercase tracking-widest">Transmission Impact</span>
                      <span class="text-[12px] font-bold text-gray-800 dark:text-zinc-200">{{ opt.efficacy }}</span>
                    </div>

                  </div>
                @}
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class CostBenefitAnalysisComponent {
  reportText = input<string>('');
  patientManagement = inject(PatientManagementService);

  isSentinel = computed(() => {
    const id = this.patientManagement.selectedPatientId();
    if (!id) return false;
    const patient = this.patientManagement.patients().find(p => p.id === id);
    return !!patient && (patient.name.toLowerCase().includes('sentinel') || ['p004', 'p005', 'p006', 'p007'].includes(id));
  });

  // Active view: treatment options or preventive protocols
  activeMode = signal<'treatment' | 'prevention'>('treatment');

  // Preference engine state
  prefs = signal({
    lowCost: false,
    lowEffort: false,
    naturalFocus: false
  });

  togglePref(key: 'lowCost' | 'lowEffort' | 'naturalFocus') {
    this.prefs.update(p => ({ ...p, [key]: !p[key] }));
  }

  // Public Health Triage Containment Options
  sentinelOptions: ISentinelContainmentOption[] = [
    {
      paradigm: 'Active Quarantine 🚷',
      name: 'Localized Containment & Home Isolation',
      costLabel: 'High (Local Economic Loss)',
      costValue: 5,
      effortLabel: 'Daily Active Surveillance',
      effortValue: 5,
      efficacy: 'Prevents Transmission (R0 Suppression)',
      holisticLabel: 'Surveillance & Spatial Separation',
      benefits: [
        'Blocks secondary transmissions completely',
        'Protects vulnerable populations locally',
        'Provides time to distribute vaccines/prophylaxis'
      ],
      risks: [
        'Causes local civic fatigue and resistance',
        'High economic burden on isolated households',
        'Requires continuous community supply delivery'
      ]
    },
    {
      paradigm: 'Surveillance Alert 🔦',
      name: 'Digital Alerting & Clinic Triage Briefings',
      costLabel: 'Low (Digital Infrastructure)',
      costValue: 1,
      effortLabel: 'One-Time Setup & Cadence',
      effortValue: 2,
      efficacy: 'Early Case Identification',
      holisticLabel: 'Active Public Health Surveillance',
      benefits: [
        'Enables early discovery of secondary clusters',
        'Raises diagnostic awareness in local clinics',
        'Low cost and high scalability'
      ],
      risks: [
        'May trigger minor anxiety or concern in public',
        'Causes short-term spike in clinic triage loads',
        'Requires active compliance from clinic networks'
      ]
    },
    {
      paradigm: 'Proactive Prophylaxis 💉',
      name: 'Targeted Immunization & Chemopreview',
      costLabel: 'Moderate (Stockpile Logistics)',
      costValue: 3,
      effortLabel: 'Local Campaign Deployment',
      effortValue: 4,
      efficacy: 'Establishes Immunity Barrier',
      holisticLabel: 'Proactive Host Protection',
      benefits: [
        'Creates local immunological barriers rapidly',
        'Significantly reduces symptom severity of infections',
        'Provides lasting protection to healthcare workers'
      ],
      risks: [
        'Requires cold chain distribution logistics',
        'Potential vaccine/therapeutics supply constraints',
        'Needs active tracking of vaccine uptake and reactions'
      ]
    }
  ];

  // Active Treatment Options
  private treatmentOptions: ITreatmentOption[] = [
    {
      paradigm: 'Western',
      name: 'Prescription Metformin & Statin Therapy',
      costLabel: 'Low (Insurance Covered)',
      costValue: 1,
      effortLabel: 'Oral Daily Dose',
      effortValue: 2,
      efficacy: 'Rapid Efficacy (1-2w)',
      holisticLabel: 'Allopathic Glycemic Control',
      isNatural: false,
      benefits: [
        'Direct, rapid HbA1c reduction',
        'Proven long-term cardiovascular protection',
        'Fully covered by standard health insurance'
      ],
      risks: [
        'Frequent transient gastrointestinal upset',
        'Potential risk of lactic acidosis (rare)',
        'Requires continuous clinical laboratory oversight'
      ]
    },
    {
      paradigm: 'Eastern',
      name: 'Acupuncture & Xiao Ke Wan (Herbs)',
      costLabel: 'Moderate ($80/session)',
      costValue: 4,
      effortLabel: '2x Weekly Clinic Visits',
      effortValue: 4,
      efficacy: 'Gradual Efficacy (3-6w)',
      holisticLabel: 'Traditional Chinese Medicine',
      isNatural: true,
      benefits: [
        'Addresses systemic qi stagnation & dampness',
        'Improves peripheral nerve sensation and pain',
        'Xiao Ke Wan naturally supports pancreatic function'
      ],
      risks: [
        'Requires regular out-of-pocket session fees',
        'Requires clinic travel twice a week',
        'Mild bruising or soreness at acupuncture points'
      ]
    },
    {
      paradigm: 'Ayurvedic',
      name: 'Nisha Amalaki & Yoga Therapy',
      costLabel: 'Low ($15/month)',
      costValue: 2,
      effortLabel: 'Daily Active Routine',
      effortValue: 5,
      efficacy: 'Preventive & Long-term',
      holisticLabel: 'Holistic Metabolic Balancing',
      isNatural: true,
      benefits: [
        'Curcumin & Amla blend supports antioxidant defenses',
        'Yoga significantly reduces cortisol and stress-induced glucose spikes',
        'Promotes systemic gut microbiome balance'
      ],
      risks: [
        'Requires high self-discipline (daily 30-min practices)',
        'Slower clinical onset (typically 4-8 weeks)',
        'Requires guidance from a certified Ayurvedic clinician'
      ]
    }
  ];

  // Preventive Care Options
  private preventionOptions: ITreatmentOption[] = [
    {
      paradigm: 'Western',
      name: 'Screening Metrics & Low-Dose Aspirin',
      costLabel: 'Low (Preventive Benefit)',
      costValue: 1,
      effortLabel: 'Annual Checks / Daily Pill',
      effortValue: 1,
      efficacy: 'Proactive Primary Prevention',
      holisticLabel: 'Vascular & Metabolic Screening',
      isNatural: false,
      benefits: [
        '100% covered screening tests (A1C, Lipids)',
        'Early identification of silent cardiac drifts',
        'Aspirin significantly lowers primary vascular risk'
      ],
      risks: [
        'Risk of minor gastrointestinal bleeding with aspirin',
        'Over-diagnosis of borderline/insignificant findings',
        'Requires regular primary care visits'
      ]
    },
    {
      paradigm: 'Eastern',
      name: 'Seasonal Acupuncture & Meridian Tuning',
      costLabel: 'Moderate ($80/month)',
      costValue: 3,
      effortLabel: 'Monthly Maintenance Visit',
      effortValue: 3,
      efficacy: 'Harmonious Qi Maintenance',
      holisticLabel: 'Preventive Yin/Yang Balancing',
      isNatural: true,
      benefits: [
        'Clears micro-congestions before symptoms develop',
        'Tones immune function and lymphatic drainage',
        'Constitutional dietary adjustments align with seasons'
      ],
      risks: [
        'Out-of-pocket costs (typically not covered by insurance)',
        'Slower, subtle response (unnoticeable changes)',
        'Needs strict adherence to seasonal dietary shifts'
      ]
    },
    {
      paradigm: 'Ayurvedic',
      name: 'Dinacharya (Circadian Routine) & Rejuvenation',
      costLabel: 'Very Low ($5/month)',
      costValue: 1,
      effortLabel: 'Daily Morning Rituals',
      effortValue: 4,
      efficacy: 'Root Constitutional Wellness',
      holisticLabel: 'Daily Dosha Harmonization',
      isNatural: true,
      benefits: [
        'Dinacharya (oil pulling, tongue scraping) clears toxins',
        'Daily Chyawanprash / Amalaki builds cellular immunity',
        'Stabilizes nervous system via morning pranayama (breathing)'
      ],
      risks: [
        'Requires waking up before sunrise (Brahma Muhurta)',
        'Time investment of 15-20 minutes every morning',
        'Incompatible with erratic schedules or shift work'
      ]
    }
  ];

  // Dynamic ranking based on mode selection and user preferences
  rankedOptions = computed(() => {
    const activeList = this.activeMode() === 'treatment' ? this.treatmentOptions : this.preventionOptions;
    return [...activeList].sort((a, b) => this.calculateMatch(b) - this.calculateMatch(a));
  });

  calculateMatch(opt: ITreatmentOption): number {
    const activePrefs = this.prefs();
    let score = 100;
    let activePrefCount = 0;

    if (activePrefs.lowCost) {
      activePrefCount++;
      score -= (opt.costValue - 1) * 15;
    }
    if (activePrefs.lowEffort) {
      activePrefCount++;
      score -= (opt.effortValue - 1) * 15;
    }
    if (activePrefs.naturalFocus) {
      activePrefCount++;
      if (!opt.isNatural) {
        score -= 40;
      }
    }

    if (activePrefCount === 0) {
      if (opt.paradigm === 'Western') return 85;
      if (opt.paradigm === 'Eastern') return 70;
      if (opt.paradigm === 'Ayurvedic') return 60;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
