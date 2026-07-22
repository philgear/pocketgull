import { Component, ChangeDetectionStrategy, signal, inject, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisReportComponent } from './analysis-report.component';
import { PatientStateService } from '../services/patient-state.service';
import { AiCacheService } from '../services/ai-cache.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { ExportService } from '../services/export.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PatientManagementService } from '../services/patient-management.service';
import { ClinicalIcons } from '../assets/clinical-icons';
import { GamificationService } from '../services/gamification.service';

import { HumanDignityPactComponent } from './human-dignity-pact.component';
import { MyChartBriefModalComponent } from './mychart-brief-modal.component';
import { FamilyTreePedigreeComponent } from './family-tree-pedigree.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-analysis-container',
  standalone: true,
  imports: [CommonModule, AnalysisReportComponent, PocketGullButtonComponent, HumanDignityPactComponent, MyChartBriefModalComponent, FamilyTreePedigreeComponent],
  template: `
    <div class="flex h-full w-full overflow-hidden bg-[#F3F4F6] dark:bg-zinc-950">
      
      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- Top Toolbar / Header -->
        @if (!state.isEmergencyMode()) {
          @let isWestern = state.activePhilosophy() === 'western';
          @let isEastern = state.activePhilosophy() === 'eastern';
          @let isAyurvedic = state.activePhilosophy() === 'ayurvedic';

          <div class="min-h-[56px] py-2 bg-white dark:bg-[#09090b] border-b border-gray-200 dark:border-zinc-800 flex flex-wrap sm:flex-nowrap items-center justify-between px-3 sm:px-6 shrink-0 relative z-10 font-mono gap-2">
              
            <!-- Geographical Clinical Paradigm Selector -->
            <div class="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1 rounded-md border border-gray-300 dark:border-zinc-800 overflow-x-auto max-w-full">
              <span class="hidden md:inline text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 px-1">
                Paradigm:
              </span>

              <!-- Western Clinical (North America & Europe) -->
              <button (click)="selectPhilosophy('western')"
                title="Western Clinical Medicine (North America & Europe)"
                class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-mono font-extrabold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-md"
                [class.bg-white]="isWestern"
                [class.dark:bg-zinc-950]="isWestern"
                [class.text-sky-700]="isWestern"
                [class.dark:text-sky-300]="isWestern"
                [class.border-sky-500]="isWestern"
                [class.shadow-xs]="isWestern"
                [class.text-slate-600]="!isWestern"
                [class.dark:text-zinc-400]="!isWestern"
                [class.border-transparent]="!isWestern"
                [class.hover:bg-slate-200/50]="!isWestern"
                [class.dark:hover:bg-zinc-800/50]="!isWestern">
                <span class="w-2 h-2 rounded-md bg-sky-500 shrink-0"></span>
                <span>🏥 Western</span>
              </button>

              <!-- Eastern TCM (East Asia Zang-Fu) -->
              <button (click)="selectPhilosophy('eastern')"
                title="Eastern TCM Medicine (East Asian Zang-Fu)"
                class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-mono font-extrabold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-md"
                [class.bg-white]="isEastern"
                [class.dark:bg-zinc-950]="isEastern"
                [class.text-emerald-700]="isEastern"
                [class.dark:text-emerald-300]="isEastern"
                [class.border-emerald-500]="isEastern"
                [class.shadow-xs]="isEastern"
                [class.text-slate-600]="!isEastern"
                [class.dark:text-zinc-400]="!isEastern"
                [class.border-transparent]="!isEastern"
                [class.hover:bg-slate-200/50]="!isEastern"
                [class.dark:hover:bg-zinc-800/50]="!isEastern">
                <span class="w-2 h-2 rounded-md bg-emerald-500 shrink-0"></span>
                <span>☯️ Eastern</span>
              </button>

              <!-- Ayurvedic (South Asia Vedic) -->
              <button (click)="selectPhilosophy('ayurvedic')"
                title="Ayurvedic Medicine (South Asian Vedic Dosha)"
                class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-mono font-extrabold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-md"
                [class.bg-white]="isAyurvedic"
                [class.dark:bg-zinc-950]="isAyurvedic"
                [class.text-amber-700]="isAyurvedic"
                [class.dark:text-amber-300]="isAyurvedic"
                [class.border-amber-500]="isAyurvedic"
                [class.shadow-xs]="isAyurvedic"
                [class.text-slate-600]="!isAyurvedic"
                [class.dark:text-zinc-400]="!isAyurvedic"
                [class.border-transparent]="!isAyurvedic"
                [class.hover:bg-slate-200/50]="!isAyurvedic"
                [class.dark:hover:bg-zinc-800/50]="!isAyurvedic">
                <span class="w-2 h-2 rounded-md bg-amber-500 shrink-0"></span>
                <span>🪷 Ayurvedic</span>
              </button>
            </div>

            <!-- Export Actions & Mobile Refresh Analysis -->
            <div class="flex items-center gap-2 sm:gap-3 ml-auto">
              @if (justGenerated() && hasReport() && !intelligence.isLoading()) {
                <div class="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                   <span class="w-2 h-2 rounded-md bg-emerald-500 animate-pulse"></span>
                   <span>Analysis Synced</span>
                </div>
              }
              
              @if (!intelligence.isLoading()) {
                <!-- Human Dignity Health Charter Button -->
                <button type="button" (click)="showPactModal.set(true)" title="Human Dignity Health Charter & Voluntary Opt-In"
                  class="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-md border border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white transition cursor-pointer">
                  <span>🕊️</span> Dignity Charter
                </button>

                <!-- PDF Care Plan Export Button -->
                <button type="button" (click)="exportPdf()" title="Export Printable PDF Care Plan"
                  class="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                  <span>📄</span> PDF
                </button>

                <!-- MyChart Pre-Visit Brief Button -->
                <button type="button" (click)="showMyChartModal.set(true)" title="Generate Epic MyChart Pre-Visit Brief & Longevity Lab Navigator"
                  class="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-md border border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 transition cursor-pointer">
                  <span>🏥</span> MyChart Brief
                </button>

                <!-- Pedigree Tree Risk Pruning Button -->
                <button type="button" (click)="showPedigreeModal.set(true)" title="Open Family Health Pedigree Tree & Risk Branch Pruning"
                  class="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer">
                  <span>🌳</span> Pedigree Tree
                </button>

                <!-- FHIR R4 Export Button -->
                <button type="button" (click)="exportFhir()" title="Export FHIR R4 JSON Bundle"
                  class="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer">
                  <span>🔥</span> FHIR R4
                </button>

                <pocket-gull-button (click)="intelligence.clearCache()"
                  variant="ghost"
                  size="sm"
                  ariaLabel="Clear AI Cache"
                  [icon]="ClinicalIcons.Clear">
                </pocket-gull-button>

                <pocket-gull-button id="tour-generate-btn" (click)="triggerAnalysisGenerate()" [disabled]="!state.hasIssues()"
                  variant="primary"
                  size="sm"
                  [icon]="hasReport() ? 'M17.65 6.35A7.95 7.95 0 0 0 12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.66-.67 3.17-1.76 4.24l1.42 1.42A9.92 9.92 0 0 0 22 12c0-2.76-1.12-5.26-2.35-7.65z' : 'M14 5l7 7m0 0l-7 7m7-7H3'">
                  <span class="inline sm:hidden">{{ hasReport() ? 'Refresh' : 'Generate' }}</span>
                  <span class="hidden sm:inline">{{ hasReport() ? 'Refresh Analysis' : 'Generate Patient Summary' }}</span>
                </pocket-gull-button>
              }
            </div>
          </div>
        }

        <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div class="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden transition-all duration-300">
            <div class="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative">
                <app-analysis-report></app-analysis-report>
            </div>
          </div>
          
          <!-- Minimalist Metadata Footer -->
          @if (hasReport() && !state.isEmergencyMode()) {
            <div class="shrink-0 mt-2 pt-6 border-t border-black/10 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6 font-['Inter'] no-print opacity-80 hover:opacity-100 transition-opacity">
              <div class="space-y-1">
                <div class="text-[12px] font-bold uppercase tracking-[0.2em] text-[#000000] dark:text-zinc-400">System Identification</div>
                <div class="text-[12px] font-medium text-black/60 dark:text-zinc-400 uppercase tracking-widest">Pocket Gull Analysis Engine v 0.1</div>
              </div>
              <div class="space-y-1">
                <div class="text-[12px] font-bold uppercase tracking-[0.2em] text-[#000000] dark:text-zinc-400">Analysis Metadata</div>
                <div class="text-[12px] font-medium text-black/60 dark:text-zinc-400 uppercase tracking-widest">Generated: {{ intelligence.lastRefreshTime() | date:'yyyy.MM.dd HH:mm:ss' }}</div>
              </div>
              <div class="space-y-1 md:text-right">
                <div class="text-[12px] font-bold uppercase tracking-[0.2em] text-[#000000] dark:text-zinc-400">Regulatory Status</div>
                <div class="text-[12px] font-medium text-black/60 dark:text-zinc-400 uppercase tracking-widest">AI Generated Evidence. Physician Oversight Mandated.</div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Human Dignity Health Charter Modal -->
    <app-human-dignity-pact *ngIf="showPactModal()" (closeModal)="showPactModal.set(false)"></app-human-dignity-pact>

    <!-- Epic MyChart Physician Brief & Longevity Lab Modal -->
    <app-mychart-brief-modal *ngIf="showMyChartModal()" (closeModal)="showMyChartModal.set(false)"></app-mychart-brief-modal>

    <!-- Family Health Pedigree Tree & Risk Branch Pruning Modal -->
    <app-family-tree-pedigree *ngIf="showPedigreeModal()" (closeModal)="showPedigreeModal.set(false)"></app-family-tree-pedigree>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    .animate-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class AnalysisContainerComponent {
  @ViewChild(AnalysisReportComponent) reportComp!: AnalysisReportComponent;
  state = inject(PatientStateService);
  cache = inject(AiCacheService);
  intelligence = inject(ClinicalIntelligenceService);
  game = inject(GamificationService);
  exportService = inject(ExportService);
  ClinicalIcons = ClinicalIcons;

  justGenerated = signal(false);
  showPactModal = signal(false);
  showMyChartModal = signal(false);
  showPedigreeModal = signal(false);

  exportPdf() {
    const reportText = Object.values(this.intelligence.analysisResults()).filter(Boolean).join('\n\n');
    this.exportService.exportPdfReport(
      reportText || 'Sample Patient Care Plan',
      this.state.patientName() || 'Patient'
    );
  }

  exportFhir() {
    const patientName = this.state.patientName() || 'Patient';
    const bundle = this.exportService.buildFhirR4Bundle({
      id: 'p001',
      name: patientName,
      issues: this.state.issues()
    });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhir_bundle_${patientName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
 
  triggerAnalysisGenerate() {
    this.justGenerated.set(true);
    this.game.completeQuest('generate_care_plan');

    if (this.reportComp) {
      this.reportComp.generate();
    }
  }

  selectPhilosophy(philosophy: 'western' | 'eastern' | 'ayurvedic') {
    this.state.selectPhilosophy(philosophy);
  }

  hasReport = computed(() => Object.keys(this.intelligence.analysisResults()).length > 0);
}
