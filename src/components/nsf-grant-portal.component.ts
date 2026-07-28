import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademicLabRecruitmentService, IAcademicLabRecord } from '../services/academic-lab-recruitment.service';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-nsf-grant-portal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isDemoMode()) {
      <div class="p-5 bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-xl space-y-3 font-mono text-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div class="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
            <span>🔒 Confidential Grant & Secret IP Protection Engaged</span>
          </div>
          <span class="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-mono text-[10px] font-bold">
            STEALTH REDACTION ACTIVE
          </span>
        </div>
        <p class="text-zinc-300 text-[11px] font-sans leading-relaxed">
          Proprietary NSF SCH / TIP grant proposals, secret research lab recruitment data, and competitive trade secrets are redacted while running in public Demo Mode to protect IP secrecy.
        </p>
        <div class="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
          <span>🛡️ Enforced by PocketGull Security Protocol &bull; Zero Cloud Leak</span>
        </div>
      </div>
    } @else {
      <div class="p-5 bg-white dark:bg-zinc-900 border border-blue-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
        <!-- Title Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-lg">
              🏛️
            </div>
            <div>
              <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                NSF & Academic Research Grant Portal & Lab Matchmaker
              </h3>
              <p class="text-xs text-gray-500 dark:text-zinc-400">
                Supporting National Science Foundation (NSF SCH / TIP / SBIR) proposals, open dataset export, and PhD fellowship matching.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold font-mono">
              NSF SCH 2026-2030
            </span>
          </div>
        </div>

        <!-- 4 Strategic NSF Grant Pillars -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div class="p-4 bg-blue-500/5 border border-blue-500/30 rounded-xl space-y-1.5">
            <div class="font-black text-blue-900 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🔬 NSF SCH (Smart Health)</span>
            </div>
            <p class="text-[11px] text-gray-600 dark:text-zinc-300 font-medium">
              Multi-modal rPPG dermal pulse, audio frequency spectrogram, and continuous telemetry fusion with 95% Conformal Prediction Intervals.
            </p>
            <span class="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded font-mono text-[10px]">Grant #NSF-CISE-2401</span>
          </div>

          <div class="p-4 bg-teal-500/5 border border-teal-500/30 rounded-xl space-y-1.5">
            <div class="font-black text-teal-900 dark:text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🔒 NSF TIP / SBIR Phase II</span>
            </div>
            <p class="text-[11px] text-gray-600 dark:text-zinc-300 font-medium">
              On-device edge AI multimodal streaming with HIPAA-compliant DOMPurify privacy sanitization and zero cloud leak.
            </p>
            <span class="inline-block px-2 py-0.5 bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded font-mono text-[10px]">Grant #NSF-TIP-9820</span>
          </div>

          <div class="p-4 bg-purple-500/5 border border-purple-500/30 rounded-xl space-y-1.5">
            <div class="font-black text-purple-900 dark:text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🌾 NSF Convergence</span>
            </div>
            <p class="text-[11px] text-gray-600 dark:text-zinc-300 font-medium">
              Periodontal-cardiovascular-glycemic matrix modeling oral bacteremia (P. gingivalis) impact on systemic endothelial health.
            </p>
            <span class="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded font-mono text-[10px]">Grant #NSF-BIO-5542</span>
          </div>

          <div class="p-4 bg-indigo-500/5 border border-indigo-500/30 rounded-xl space-y-1.5">
            <div class="font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🌐 NSF CPS & WebMCP</span>
            </div>
            <p class="text-[11px] text-gray-600 dark:text-zinc-300 font-medium">
              Standardized Agentic WebMCP manifest (llms.txt) for autonomous emergency triage and hospital supply routing.
            </p>
            <span class="inline-block px-2 py-0.5 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded font-mono text-[10px]">Grant #NSF-CPS-8819</span>
          </div>
        </div>

        <!-- Curated NSF / NIH Academic Research Labs -->
        <div class="space-y-3">
          <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            NSF-Supported Academic Research Lab Network & Fellowship Openings:
          </h4>

          <div class="space-y-3">
            <div *ngFor="let lab of labs" class="p-4 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/70 rounded-xl flex flex-col md:flex-row justify-between gap-4">
              <div class="space-y-1 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ lab.labName }}</span>
                  <span class="px-2 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded font-mono text-[10px] font-bold">
                    {{ lab.studentRecruitmentStatus }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-zinc-400">
                  <strong>PI:</strong> {{ lab.principalInvestigator }} &bull; {{ lab.institution }} ({{ lab.location }})
                </p>
                <p class="text-xs text-gray-700 dark:text-zinc-300">
                  {{ lab.researchFocus }}
                </p>
              </div>

              <div class="flex flex-col justify-between items-end shrink-0 gap-2">
                <a [href]="lab.labWebsiteUrl" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition">
                  Apply / Contact Lab &rarr;
                </a>
                <span class="text-[10px] text-gray-400 font-mono">Domain: {{ lab.matchingPocketGullDomain }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class NsfGrantPortalComponent {
  private labService = inject(AcademicLabRecruitmentService);
  private patientState = inject(PatientStateService);

  readonly labs = this.labService.curatedAcademicLabs;
  readonly isDemoMode = computed(() => this.patientState.isDemoMode());
}
