import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisReportComponent } from './analysis-report.component';
import { PatientStateService } from '../services/patient-state.service';
import { AiCacheService } from '../services/ai-cache.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { ExportService } from '../services/export.service';
import { ClinicalTrendComponent } from './clinical-trend.component';
import { PatientVitalsChartComponent } from './patient-vitals-chart.component';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PatientManagementService } from '../services/patient-management.service';
import { ClinicalIcons } from '../assets/clinical-icons';

@Component({
  selector: 'app-analysis-container',
  standalone: true,
  imports: [CommonModule, AnalysisReportComponent, ClinicalTrendComponent, PatientVitalsChartComponent, PocketGullButtonComponent],
  template: `
    <div class="flex h-full w-full overflow-hidden bg-[#F3F4F6] dark:bg-zinc-950">
      
      <!-- History Sidebar (Continuity) -->
      @if (showHistory()) {
        <div class="w-80 border-r border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
          <div class="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-[#09090b]/50">
            <h2 class="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-widest">Clinical History</h2>
            <button (click)="showHistory.set(false)" class="text-gray-500 hover:text-gray-600" aria-label="Close Clinical History">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
             <!-- Trends Section -->
             @if (historicalMetrics().length > 1) {
               <div class="mb-6 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                 <h3 class="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-4">Longitudinal Trends</h3>
                 <app-clinical-trend label="Complexity" [values]="getHistoryValues('complexity')" type="complexity"></app-clinical-trend>
                 <app-clinical-trend label="Stability" [values]="getHistoryValues('stability')" type="stability"></app-clinical-trend>
                 <app-clinical-trend label="Certainty" [values]="getHistoryValues('certainty')" type="certainty"></app-clinical-trend>
               </div>
             }

             <!-- Vitals Chart -->
             @if (patientMgmt.selectedPatient()?.history; as history) {
                 <app-patient-vitals-chart [history]="history"></app-patient-vitals-chart>
             }

             <!-- History List -->
             @for (entry of historyEntries(); track entry.key) {
               <div (click)="loadHistory(entry)" 
                    class="group p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#09090b] hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-sm cursor-pointer transition-all">
                 <div class="flex justify-between items-start mb-1">
                   <span class="text-xs font-bold text-gray-800 dark:text-zinc-200 bg-gray-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                     SNAPSHOT
                   </span>
                   <span class="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                     {{ entry.lastUsed | date:'short' }}
                   </span>
                 </div>
                 <p class="text-xs font-semibold text-gray-800 dark:text-zinc-200 line-clamp-2">
                   {{ entry.value.report['Care Plan Overview']?.substring(0, 100) }}...
                 </p>
               </div>
             } @empty {
               <div class="h-64 flex items-center justify-center text-gray-500 dark:text-zinc-400 text-xs text-center border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-xl m-2">
                 No historical<br>snapshots found.
               </div>
             }
          </div>
        </div>
      }

      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- Top Toolbar / Header -->
        <div class="h-16 bg-white dark:bg-[#09090b] border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 relative z-10">
          <div class="flex items-center gap-6">
            <pocket-gull-button 
                    (click)="showHistory.set(!showHistory())" 
                    [variant]="showHistory() ? 'secondary' : 'ghost'" 
                    size="sm"
                    icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
               Clinical History
            </pocket-gull-button>
            
            <div class="h-6 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block"></div>
            
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

        <div class="flex-1 flex flex-col overflow-hidden p-6 gap-6 relative">
          <div class="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#09090b] rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div class="flex-1 flex flex-col min-h-0 overflow-hidden relative">
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
export class AnalysisContainerComponent implements OnInit {
  @ViewChild(AnalysisReportComponent) reportComp!: AnalysisReportComponent;
  state = inject(PatientStateService);
  cache = inject(AiCacheService);
  intelligence = inject(ClinicalIntelligenceService);
  showHistory = signal(false);
  historyEntries = signal<any[]>([]);
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

  ngOnInit() {
    this.refreshHistory();
  }

  async refreshHistory() {
    const entries = await this.cache.getAllEntries();
    // Filter for master snapshots
    this.historyEntries.set(entries.filter(e => e.value?._isSnapshot));
  }

  hasReport = computed(() => Object.keys(this.intelligence.analysisResults()).length > 0);

  historicalMetrics = computed(() => {
    return this.historyEntries()
      .map(e => e.value._metrics)
      .filter(m => !!m);
  });

  getHistoryValues(type: 'complexity' | 'stability' | 'certainty'): number[] {
    return this.historyEntries()
      .map(e => e.value?._metrics?.[type] || 5)
      .reverse(); // Newest last for chart
  }

  loadHistory(entry: any) {
    if (entry.value.report) {
      this.intelligence.loadArchivedAnalysis(entry.value.report);
    }
    if (entry.value._metrics) {
      this.intelligence.analysisMetrics.set(entry.value._metrics);
    }
    this.showHistory.set(false);
  }
}
