import { Component, ChangeDetectionStrategy, signal, inject, computed, ViewChild, effect } from '@angular/core';
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
import { PatientStoryModalComponent } from './patient-story-modal.component';
import { PostItNotesComponent } from './post-it-notes.component';
import { ActuarialGleeAlbumComponent } from './actuarial-glee-album.component';
import { VinylDjStoreComponent } from './vinyl-dj-store.component';
import { GcpHealthcareService } from '../services/gcp-healthcare.service';
import { AmbientLivingSpaceDashboardComponent } from './ambient-living-space-dashboard.component';
import { GreenRoomLoungeComponent } from './green-room-lounge.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-analysis-container',
  standalone: true,
  host: {
    'class': 'flex flex-col flex-1 min-h-0 h-full w-full overflow-hidden max-md:h-full max-md:min-h-[calc(100dvh-140px)]'
  },
  imports: [CommonModule, AnalysisReportComponent, HumanDignityPactComponent, MyChartBriefModalComponent, FamilyTreePedigreeComponent, PatientStoryModalComponent, PostItNotesComponent, ActuarialGleeAlbumComponent, VinylDjStoreComponent, AmbientLivingSpaceDashboardComponent, GreenRoomLoungeComponent],
  template: `
    <div class="flex flex-col flex-1 h-full w-full overflow-hidden max-md:h-full max-md:min-h-[calc(100dvh-140px)] bg-[#F3F4F6] dark:bg-zinc-950">
      
      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden max-md:h-full max-md:min-h-[calc(100dvh-140px)]">
        
        <!-- Top Toolbar / Header -->
        @if (!state.isEmergencyMode()) {
          @let isWestern = state.activePhilosophy() === 'western';
          @let isEastern = state.activePhilosophy() === 'eastern';
          @let isAyurvedic = state.activePhilosophy() === 'ayurvedic';

          <div class="min-h-[56px] py-2.5 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between px-3 sm:px-6 shrink-0 relative z-10 font-mono gap-2 text-zinc-100">
              
            <!-- Geographical Clinical Paradigm Selector -->
            <div class="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto max-w-full font-mono">
              <span class="hidden md:inline text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 px-1">
                Paradigm:
              </span>

              <!-- Western Clinical (North America & Europe) -->
              <button (click)="selectPhilosophy('western')"
                title="Western Clinical Medicine (North America & Europe)"
                [class]="isWestern
                  ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-orange-500 text-zinc-950 border-orange-400/50 shadow-sm'
                  : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'">
                <span>🏥 Western</span>
              </button>

              <!-- Eastern TCM (East Asia Zang-Fu) -->
              <button (click)="selectPhilosophy('eastern')"
                title="Eastern TCM Medicine (East Asian Zang-Fu)"
                [class]="isEastern
                  ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-orange-500 text-zinc-950 border-orange-400/50 shadow-sm'
                  : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'">
                <span>☯️ Eastern</span>
              </button>

              <!-- Ayurvedic (South Asia Vedic) -->
              <button (click)="selectPhilosophy('ayurvedic')"
                title="Ayurvedic Medicine (South Asian Vedic Dosha)"
                [class]="isAyurvedic
                  ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-orange-500 text-zinc-950 border-orange-400/50 shadow-sm'
                  : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'">
                <span>🪷 Ayurvedic</span>
              </button>
            </div>

            <!-- Export Actions & Streamlined Interactive Suite Drawer Button -->
            <div class="flex items-center gap-2 sm:gap-2.5 ml-auto font-mono">
              @if (justGenerated() && hasReport() && !intelligence.isLoading()) {
                <div class="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">
                   <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                   <span>Analysis Synced</span>
                </div>
              }
              
              @if (!intelligence.isLoading()) {

                <!-- Clinical Tools & Engagement Suites Drawer Toggle Button -->
                <button type="button" (click)="showToolsMenu.set(!showToolsMenu())" title="Open Clinical Tools & Engagement Suites Drawer"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-600 hover:text-white transition cursor-pointer shadow-sm">
                  <span>🎛️</span> Clinical Suites ▾
                </button>
              }
            </div>
          </div>
        }

        <div class="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden relative">
          <div class="flex-1 min-h-0 min-w-0 h-full flex flex-col overflow-hidden transition-all duration-300">
            <div class="flex-1 flex flex-col min-h-0 min-w-0 h-full overflow-hidden relative" [class.slide-in-panel]="isSlidingIn()">
                <app-analysis-report class="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden" #reportRef (openGleeModal)="showGleeModal.set(true)"></app-analysis-report>
            </div>
          </div>
          
          <!-- Interactive Report Footer: Lens Navigation + Refresh & Clear + Metadata -->
          @if (hasReport() && !state.isEmergencyMode()) {
            <div class="shrink-0 mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-4 font-mono no-print">
              
              <!-- Lens Navigation & Action Controls Toolbar -->
              <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-sm">
                
                <!-- Sequential Lens Stepper Buttons -->
                <div class="flex items-center gap-2" id="tour-footer-lens-navigation">
                  <button type="button" (click)="reportRef.navigateToPreviousLens()"
                    [disabled]="!reportRef.hasPreviousLens()"
                    class="px-3 py-1.5 rounded-xl border text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                    <span>← Previous Lens</span>
                  </button>

                  <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50">
                    {{ reportRef.activeLens() }}
                  </span>

                  <button type="button" (click)="reportRef.navigateToNextLens()"
                    [disabled]="!reportRef.hasNextLens()"
                    class="px-3 py-1.5 rounded-xl border text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 shadow-sm">
                    <span>Next Lens →</span>
                  </button>
                </div>

                <!-- Footer Refresh Analysis & PAIR Data Card Actions -->
                <div class="flex items-center gap-2">
                  <button id="tour-generate-btn" type="button" (click)="triggerAnalysisGenerate()"
                    [disabled]="intelligence.isLoading()"
                    class="px-4 py-2 rounded-xl border text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500 disabled:opacity-50 shadow-md">
                    <span>🔄 Refresh Analysis</span>
                  </button>
                </div>

              </div>

              <!-- Metadata Grid & Isolated System Actions -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-['Inter'] opacity-80 hover:opacity-100 transition-opacity border-t border-zinc-200/50 dark:border-zinc-800/60 pt-3">
                <div class="space-y-1">
                  <div class="text-[12px] font-bold uppercase tracking-[0.2em] text-[#000000] dark:text-zinc-400">System Identification</div>
                  <div class="text-[12px] font-medium text-black/60 dark:text-zinc-400 uppercase tracking-widest">Pocket Gull Analysis Engine v 0.1</div>
                </div>
                <div class="space-y-1">
                  <div class="text-[12px] font-bold uppercase tracking-[0.2em] text-[#000000] dark:text-zinc-400">Analysis Metadata</div>
                  <div class="text-[12px] font-medium text-black/60 dark:text-zinc-400 uppercase tracking-widest">Generated: {{ intelligence.lastRefreshTime() | date:'yyyy.MM.dd HH:mm:ss' }}</div>
                </div>
                <div class="space-y-1 md:text-right flex flex-col items-start md:items-end justify-between">
                  <div>
                    <div class="text-[12px] font-bold uppercase tracking-[0.2em] text-[#000000] dark:text-zinc-400">Regulatory Status</div>
                    <div class="text-[12px] font-medium text-black/60 dark:text-zinc-400 uppercase tracking-widest">AI Generated Evidence. Physician Oversight Mandated.</div>
                  </div>

                  <!-- Isolated Clear Cache Button (Moved far down from Refresh Analysis) -->
                  <button type="button" (click)="intelligence.clearCache()"
                    title="Clear AI completion cache and force model re-inference"
                    class="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-red-400 opacity-60 hover:opacity-100 transition flex items-center gap-1 cursor-pointer">
                    <span>🗑️ Clear AI Cache</span>
                  </button>
                </div>
              </div>

            </div>
          }
        </div>
      </div>
    </div>

    <!-- Popover Clinical Tools & Engagement Suites Drawer -->
    @if (showToolsMenu()) {
      <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-in fade-in duration-150">
        <div class="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-5">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div class="flex items-center gap-3">
              <span class="text-xl p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">🎛️</span>
              <div>
                <h3 class="text-base font-black uppercase text-white tracking-wide">Clinical Tools & Engagement Suites</h3>
                <p class="text-xs text-zinc-400 font-sans mt-0.5">Select specialized modules, exports, or patient engagement lounges</p>
              </div>
            </div>
            <button (click)="showToolsMenu.set(false)" class="text-zinc-400 hover:text-white text-xl font-bold p-1 cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Categorized Tools Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-sans">
            
            <!-- Category 1: Clinical Documents & Briefs -->
            <div class="space-y-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span class="text-[10px] font-mono font-bold uppercase text-sky-400 block tracking-wider">📄 Documents & Briefs</span>
              <button (click)="showMyChartModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🏥</span> MyChart Brief
              </button>
              <button (click)="showPedigreeModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🌳</span> Pedigree Tree
              </button>
              <button (click)="showStoryModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>📖</span> Patient Story
              </button>
            </div>

            <!-- Category 2: Interactive Prescriptions -->
            <div class="space-y-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span class="text-[10px] font-mono font-bold uppercase text-orange-400 block tracking-wider">📌 Prescriptions & Music</span>
              <button (click)="showPostItModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>📌</span> 3D Post-Its
              </button>
              <button (click)="showGleeModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🎵</span> Actuarial Glee
              </button>
              <button (click)="showVinylModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>📻</span> Vinyl Lounge
              </button>
            </div>

            <!-- Category 3: Restorative Lounges & Ethics -->
            <div class="space-y-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span class="text-[10px] font-mono font-bold uppercase text-emerald-400 block tracking-wider">🌿 Lounges & Ethics</span>
              <button (click)="showPactModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🕊️</span> Dignity Charter
              </button>
              <button (click)="showLivingSpaceModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🏡</span> Living Space
              </button>
              <button (click)="showGreenRoomModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🌿</span> Green Room
              </button>
              <button (click)="syncGcpHealthcare(); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>☁️</span> GCP Healthcare Sync
              </button>
            </div>

          </div>

          <div class="pt-2 border-t border-zinc-800 flex justify-end">
            <button (click)="showToolsMenu.set(false)" class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer">
              Close Suites
            </button>
          </div>

        </div>
      </div>
    }

    <!-- Human Dignity Health Charter Modal -->
    <app-human-dignity-pact *ngIf="showPactModal()" (closeModal)="showPactModal.set(false)"></app-human-dignity-pact>

    <!-- Epic MyChart Physician Brief & Longevity Lab Modal -->
    <app-mychart-brief-modal *ngIf="showMyChartModal()" (closeModal)="showMyChartModal.set(false)"></app-mychart-brief-modal>

    <!-- Family Health Pedigree Tree & Risk Branch Pruning Modal -->
    <app-family-tree-pedigree *ngIf="showPedigreeModal()" (closeModal)="showPedigreeModal.set(false)"></app-family-tree-pedigree>

    <!-- TED-Style Patient Hero Journey Story Reader Modal -->
    <app-patient-story-modal *ngIf="showStoryModal()" (closeModal)="showStoryModal.set(false)"></app-patient-story-modal>

    <!-- 3D Interactive Prescription Post-It Notes Modal -->
    <app-post-it-notes *ngIf="showPostItModal()" (closeModal)="showPostItModal.set(false)"></app-post-it-notes>

    <!-- 12-Track Actuarial Glee Duet Singalong Album Modal -->
    <app-actuarial-glee-album *ngIf="showGleeModal()" (closeModal)="showGleeModal.set(false)"></app-actuarial-glee-album>

    <!-- Retro Vinyl Music Store & DJ Turntable Station Modal -->
    <app-vinyl-dj-store *ngIf="showVinylModal()" (closeModal)="showVinylModal.set(false)"></app-vinyl-dj-store>

    <!-- Main Living Space Ambient Display Studio Modal -->
    <app-ambient-living-space-dashboard *ngIf="showLivingSpaceModal()" (closeModal)="showLivingSpaceModal.set(false)" (openGleeAlbum)="showLivingSpaceModal.set(false); showGleeModal.set(true)"></app-ambient-living-space-dashboard>

    <!-- Restorative Green Room Clinician & Patient Lounge Modal -->
    <app-green-room-lounge *ngIf="showGreenRoomModal()" (closeModal)="showGreenRoomModal.set(false)" (openGleeAlbum)="showGreenRoomModal.set(false); showGleeModal.set(true)"></app-green-room-lounge>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    .animate-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideInRight3D {
      0% {
        transform: translateX(100%) scale(0.96);
        opacity: 0;
        filter: blur(4px);
        box-shadow: -20px 0 60px rgba(0, 0, 0, 0.4);
      }
      70% {
        transform: translateX(-0.5%) scale(1.002);
        opacity: 1;
        filter: blur(0);
      }
      100% {
        transform: translateX(0) scale(1);
        opacity: 1;
        filter: blur(0);
        box-shadow: none;
      }
    }

    .slide-in-panel {
      animation: slideInRight3D 0.48s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      will-change: transform, opacity, filter;
    }
  `]
})
export class AnalysisContainerComponent {
  @ViewChild(AnalysisReportComponent) reportComp!: AnalysisReportComponent;
  state = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);
  cache = inject(AiCacheService);
  intelligence = inject(ClinicalIntelligenceService);
  game = inject(GamificationService);
  exportService = inject(ExportService);
  gcpHealthcare = inject(GcpHealthcareService);
  ClinicalIcons = ClinicalIcons;

  isSlidingIn = signal(true);

  constructor() {
    // Re-trigger 3D slide-in animation whenever a patient is selected or analysis completes
    effect(() => {
      const pId = this.patientManagement.selectedPatientId();
      const lastRefresh = this.intelligence.lastRefreshTime();
      if (pId || lastRefresh) {
        this.triggerSlideIn();
      }
    });
  }

  triggerSlideIn() {
    this.isSlidingIn.set(false);
    setTimeout(() => {
      this.isSlidingIn.set(true);
    }, 20);
  }

  async syncGcpHealthcare() {
    const res = await this.gcpHealthcare.syncToGcpHealthcareApi();
    alert(res.message);
  }

  justGenerated = signal(false);
  showPactModal = signal(false);
  showMyChartModal = signal(false);
  showPedigreeModal = signal(false);
  showStoryModal = signal(false);
  showPostItModal = signal(false);
  showGleeModal = signal(false);
  showVinylModal = signal(false);
  showLivingSpaceModal = signal(false);
  showGreenRoomModal = signal(false);
  showToolsMenu = signal(false);

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
    this.triggerSlideIn();

    if (this.reportComp) {
      this.reportComp.generate();
    }
  }

  selectPhilosophy(philosophy: 'western' | 'eastern' | 'ayurvedic') {
    this.state.selectPhilosophy(philosophy);
    this.triggerSlideIn();
  }

  hasReport = computed(() => Object.keys(this.intelligence.analysisResults()).length > 0);
}

