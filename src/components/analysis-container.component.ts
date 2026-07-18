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

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-analysis-container',
  standalone: true,
  imports: [CommonModule, AnalysisReportComponent, PocketGullButtonComponent],
  template: `
    <div class="flex h-full w-full overflow-hidden bg-[#F3F4F6] dark:bg-zinc-950">
      
      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- Top Toolbar / Header -->
        @if (!state.isEmergencyMode()) {
          @let isWestern = state.activePhilosophy() === 'western';
          @let isEastern = state.activePhilosophy() === 'eastern';
          @let isAyurvedic = state.activePhilosophy() === 'ayurvedic';

          <div class="h-16 bg-white dark:bg-[#09090b] border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 relative z-10">
              
            <!-- Philosophy Selector -->
            <div class="flex items-center gap-1 bg-gray-50 dark:bg-zinc-900/40 p-1 rounded-xl border border-gray-200/60 dark:border-zinc-800/80">
              <button (click)="selectPhilosophy('western')"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none cursor-pointer"
                [class.bg-white]="isWestern"
                [class.dark:bg-zinc-800]="isWestern"
                [class.text-sky-600]="isWestern"
                [class.dark:text-sky-400]="isWestern"
                [class.shadow-sm]="isWestern"
                [class.border]="isWestern"
                [class.border-gray-200/50]="isWestern"
                [class.dark:border-zinc-700/50]="isWestern"
                [class.text-gray-500]="!isWestern"
                [class.dark:text-zinc-400]="!isWestern"
                [class.hover:text-gray-700]="!isWestern"
                [class.dark:hover:text-zinc-200]="!isWestern">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                Western
              </button>
              <button (click)="selectPhilosophy('eastern')"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none cursor-pointer"
                [class.bg-white]="isEastern"
                [class.dark:bg-zinc-800]="isEastern"
                [class.text-emerald-600]="isEastern"
                [class.dark:text-emerald-400]="isEastern"
                [class.shadow-sm]="isEastern"
                [class.border]="isEastern"
                [class.border-gray-200/50]="isEastern"
                [class.dark:border-zinc-700/50]="isEastern"
                [class.text-gray-500]="!isEastern"
                [class.dark:text-zinc-400]="!isEastern"
                [class.hover:text-gray-700]="!isEastern"
                [class.dark:hover:text-zinc-200]="!isEastern">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Eastern (TCM)
              </button>
              <button (click)="selectPhilosophy('ayurvedic')"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none cursor-pointer"
                [class.bg-white]="isAyurvedic"
                [class.dark:bg-zinc-800]="isAyurvedic"
                [class.text-amber-600]="isAyurvedic"
                [class.dark:text-amber-400]="isAyurvedic"
                [class.shadow-sm]="isAyurvedic"
                [class.border]="isAyurvedic"
                [class.border-gray-200/50]="isAyurvedic"
                [class.dark:border-zinc-700/50]="isAyurvedic"
                [class.text-gray-500]="!isAyurvedic"
                [class.dark:text-zinc-400]="!isAyurvedic"
                [class.hover:text-gray-700]="!isAyurvedic"
                [class.dark:hover:text-zinc-200]="!isAyurvedic">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Ayurvedic
              </button>
            </div>

            <!-- Export Actions & Status -->
            <div class="flex items-center gap-4">
              @if (justGenerated() && hasReport() && !intelligence.isLoading()) {
                <div class="hidden md:flex items-center gap-2 mr-2 animate-in fade-in duration-500">
                   <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span class="text-[12px] font-bold uppercase tracking-wider text-emerald-700">Analysis Complete</span>
                </div>
              }
              
              @if (!intelligence.isLoading()) {
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
                  {{ hasReport() ? 'Refresh Analysis' : 'Generate Patient Summary' }}
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
  ClinicalIcons = ClinicalIcons;

  justGenerated = signal(false);
 
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
