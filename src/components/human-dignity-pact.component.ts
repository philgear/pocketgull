import { Component, ChangeDetectionStrategy, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../services/export.service';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-human-dignity-pact',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-in fade-in duration-200">
      <div class="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">
              🕊️
            </div>
            <div>
              <h2 class="text-base font-extrabold text-slate-900 dark:text-zinc-100 uppercase tracking-wide">
                Human Dignity Health Charter
              </h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Voluntary Opt-In Open Health Pact for Free, Autonomous Medical Intelligence
              </p>
            </div>
          </div>
          <button (click)="closeModal.emit()" aria-label="Close modal"
            class="w-8 h-8 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition">
            ✕
          </button>
        </div>

        <!-- 5 Pillars Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div class="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-1.5">
            <div class="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
              <span>🗽</span> Voluntary Opt-In Autonomy
            </div>
            <p class="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Zero forced mandates or insurance lock-in. Participation is 100% voluntary, honoring patient and clinician choice.
            </p>
          </div>

          <div class="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
            <div class="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              <span>💎</span> Zero-Cost Open Access
            </div>
            <p class="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Runs client-side on-device with WebGPU local AI. No cloud hosting fees, paywalls, or corporate subscriptions.
            </p>
          </div>

          <div class="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1.5">
            <div class="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              <span>🌿</span> Multi-Paradigm Cultural Respect
            </div>
            <p class="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Synthesizes Western Clinical Medicine, Eastern TCM Zang-Fu, and Ayurvedic Vedic systems into whole-person care.
            </p>
          </div>

          <div class="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-1.5">
            <div class="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              <span>🛡️</span> Restoring Human Connection
            </div>
            <p class="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Automates 95% of administrative screening paperwork so doctors spend unhurried time listening to human beings.
            </p>
          </div>

        </div>

        <!-- Data Sovereignty Banner -->
        <div class="p-4 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="text-[11px] font-bold uppercase tracking-widest text-slate-800 dark:text-zinc-200 block">🔥 100% Patient Data Ownership (FHIR R4)</span>
            <span class="text-[11px] text-slate-500 dark:text-zinc-400 block">Your health records are exported in standard open FHIR format with zero proprietary vendor lock-in.</span>
          </div>
          <button (click)="adoptPact()"
            class="px-4 py-2 text-xs font-bold uppercase rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm cursor-pointer shrink-0">
            {{ isAdopted() ? '✓ Charter Signed' : '🤝 Sign Charter' }}
          </button>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button (click)="downloadCharterPdf()"
            class="px-3 py-1.5 text-xs font-bold uppercase rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1.5">
            <span>📄</span> Download Printable Charter PDF
          </button>
          <button (click)="closeModal.emit()"
            class="px-4 py-1.5 text-xs font-bold uppercase rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition cursor-pointer">
            Close
          </button>
        </div>

      </div>
    </div>
  `
})
export class HumanDignityPactComponent {
  @Output() closeModal = new EventEmitter<void>();
  exportService = inject(ExportService);
  state = inject(PatientStateService);
  
  isAdopted = signal(false);

  adoptPact() {
    this.isAdopted.set(true);
  }

  downloadCharterPdf() {
    const charterText = `
# HUMAN DIGNITY HEALTH CHARTER
Voluntary Open Healthcare Access & Data Sovereignty

## 1. Voluntary Opt-In Autonomy
Participation in Pocket-Gull is 100% voluntary. Zero mandates, zero forced data sharing.

## 2. Zero-Cost Open Access
Powered by local on-device WebGPU AI processing with zero subscription fees.

## 3. Multi-Paradigm Cultural Harmony
Honors Western Clinical Medicine, Eastern TCM Zang-Fu organ meridians, and Ayurvedic Vedic systems.

## 4. Administrative Paperwork Relief
Automates 95% of screening paperwork overhead so caregivers focus on human connection.

## 5. FHIR R4 Open Data Sovereignty
Patients own 100% of their medical data with zero vendor lock-in.
`;
    this.exportService.exportPdfReport(charterText, 'Human Dignity Health Charter');
  }
}
