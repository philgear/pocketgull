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

@Component({
  selector: 'app-analysis-container',
  standalone: true,
  imports: [CommonModule, AnalysisReportComponent, PocketGullButtonComponent],
  template: `
    <div class="flex h-full w-full overflow-hidden bg-[#F3F4F6] dark:bg-zinc-950">
      
      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- Top Toolbar / Header -->
        <div class="h-16 bg-white dark:bg-[#09090b] border-b border-gray-200 dark:border-zinc-800 flex items-center justify-end px-6 shrink-0 relative z-10">
            
          <!-- Export Actions & Status -->
          <div class="flex items-center gap-4">
            @if (justGenerated() && hasReport() && !intelligence.isLoading()) {
              <div class="hidden md:flex items-center gap-2 mr-2 animate-in fade-in duration-500">
                 <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Analysis Complete</span>
              </div>
            }
            
            @if (!intelligence.isLoading()) {
              <pocket-gull-button (click)="intelligence.clearCache()"
                variant="ghost"
                size="sm"
                ariaLabel="Clear AI Cache"
                [icon]="ClinicalIcons.Clear">
              </pocket-gull-button>
              <pocket-gull-button id="tour-generate-btn" (click)="triggerAnalysisGenerate()" [disabled]="!state.hasIssues() || hasGeneratedDemo()"
                variant="primary"
                size="sm"
                [icon]="hasReport() ? 'M17.65 6.35A7.95 7.95 0 0 0 12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.66-.67 3.17-1.76 4.24l1.42 1.42A9.92 9.92 0 0 0 22 12c0-2.76-1.12-5.26-2.35-7.65z' : 'M14 5l7 7m0 0l-7 7m7-7H3'">
                {{ hasReport() ? 'Refresh Analysis' : (hasGeneratedDemo() ? 'Demo Limit Reached' : 'Generate Patient Summary') }}
              </pocket-gull-button>
            }
          </div>
        </div>

        <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div class="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden transition-all duration-300">
            <div class="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative">
                <app-analysis-report></app-analysis-report>
            </div>
          </div>
          
          <!-- Minimalist Metadata Footer -->
          @if (hasReport()) {
            <div class="shrink-0 mt-2 pt-6 border-t border-black/10 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6 font-['Inter'] no-print opacity-80 hover:opacity-100 transition-opacity">
              <div class="space-y-1">
                <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000] dark:text-zinc-400">System Identification</div>
                <div class="text-[10px] font-medium text-black/60 dark:text-zinc-400 uppercase tracking-widest">Pocket Gull Analysis Engine v 0.1</div>
              </div>
              <div class="space-y-1">
                <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000] dark:text-zinc-400">Analysis Metadata</div>
                <div class="text-[10px] font-medium text-black/60 dark:text-zinc-400 uppercase tracking-widest">Generated: {{ intelligence.lastRefreshTime() | date:'yyyy.MM.dd HH:mm:ss' }}</div>
              </div>
              <div class="space-y-1 md:text-right">
                <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000] dark:text-zinc-400">Regulatory Status</div>
                <div class="text-[10px] font-medium text-black/60 dark:text-zinc-400 uppercase tracking-widest">AI Generated Evidence. Physician Oversight Mandated.</div>
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
  ClinicalIcons = ClinicalIcons;

  hasGeneratedDemo = signal(false);
  justGenerated = signal(false);

  triggerAnalysisGenerate() {
    this.justGenerated.set(true);
    if (typeof localStorage !== 'undefined') {
      const generations = parseInt(localStorage.getItem('pg_generations') || '0', 10);
      if (generations >= 1) {
        this.hasGeneratedDemo.set(true);
        return; // Prevent generation
      }
      localStorage.setItem('pg_generations', (generations + 1).toString());
      this.hasGeneratedDemo.set(true);
    }

    if (this.reportComp) {
      this.reportComp.generate();
    }
  }

  hasReport = computed(() => Object.keys(this.intelligence.analysisResults()).length > 0);
}
