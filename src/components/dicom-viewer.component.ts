import { Component, OnInit, inject, signal, computed, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DicomService, DicomStudy } from '../services/dicom.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';

@Component({
  selector: 'app-dicom-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      <div class="px-4 py-3 border-b flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <h3 class="font-medium text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
           <svg class="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Medical Imaging Suite
        </h3>
        <button (click)="loadStudies()" 
                class="text-xs px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md transition-colors"
                [disabled]="dicomService.isLoading()">
          {{ dicomService.isLoading() ? 'Loading...' : 'Refresh Studies' }}
        </button>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar: Study List -->
        <div class="w-1/3 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/30">
          @if (dicomService.error()) {
            <div class="p-4 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 m-4 rounded">
              {{ dicomService.error() }}
            </div>
          }
          @if (studies().length === 0 && !dicomService.isLoading()) {
            <div class="p-8 text-center text-sm text-zinc-500 flex flex-col items-center">
                <svg class="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                No DICOM studies found.
            </div>
          }
          <div class="p-2 space-y-2">
            @for (study of studies(); track study.studyInstanceUid) {
              <div class="p-3 rounded-lg border cursor-pointer transition-all active:scale-[0.98]"
                   [class.border-blue-500]="selectedStudy()?.studyInstanceUid === study.studyInstanceUid"
                   [class.bg-blue-50]="selectedStudy()?.studyInstanceUid === study.studyInstanceUid"
                   [class.dark:bg-blue-900/20]="selectedStudy()?.studyInstanceUid === study.studyInstanceUid"
                   [class.border-zinc-200]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                   [class.dark:border-zinc-800]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                   [class.hover:border-zinc-300]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                   [class.dark:hover:border-zinc-700]="selectedStudy()?.studyInstanceUid !== study.studyInstanceUid"
                   (click)="selectStudy(study)">
                <div class="flex justify-between items-start mb-1">
                  <div class="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate pr-2" title="{{ study.patientName }}">
                    {{ study.patientName }}
                  </div>
                  <div class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
                    {{ study.modalities?.join(',') || 'CT' }}
                  </div>
                </div>
                <div class="text-xs text-zinc-500 truncate" title="{{ study.studyDescription }}">
                  {{ study.studyDescription || 'No description' }}
                </div>
                <div class="text-[10px] text-zinc-400 mt-1">
                  {{ formatDate(study.studyDate) }}
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Main Content: Viewer -->
        <div class="w-2/3 bg-black flex flex-col relative">
          @if (currentImageSrc()) {
            <!-- Image Area -->
            <div class="flex-1 flex items-center justify-center p-4 relative group">
              <img [src]="currentImageSrc()" 
                   class="max-w-full max-h-full object-contain"
                   alt="DICOM Frame" />
                   
              <!-- Overlay information -->
              <div class="absolute top-4 left-4 text-white/70 text-xs font-mono drop-shadow-md pointer-events-none">
                <div>{{ selectedStudy()?.patientName }}</div>
                <div>{{ selectedStudy()?.patientId }}</div>
              </div>
              
              <div class="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <!-- Controls -->
              </div>
            </div>
            
            <!-- Analysis Bar -->
            <div class="p-3 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center">
              <div class="text-xs text-zinc-400 font-mono truncate max-w-[50%]">
                 Study: {{ selectedStudy()?.studyInstanceUid?.substring(0,20) }}...
              </div>
              <button (click)="analyzeImage()" 
                      [disabled]="isAnalyzing()"
                      class="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
                      [class.bg-blue-600]="!isAnalyzing()"
                      [class.hover:bg-blue-500]="!isAnalyzing()"
                      [class.text-white]="!isAnalyzing()"
                      [class.bg-zinc-800]="isAnalyzing()"
                      [class.text-zinc-400]="isAnalyzing()">
                @if (isAnalyzing()) {
                  <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                } @else {
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze with Gemini
                }
              </button>
            </div>
          } @else {
            <div class="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-black">
               <svg class="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm">Select a study to view its images.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DicomViewerComponent {
  dicomService = inject(DicomService);
  intelligenceService = inject(ClinicalIntelligenceService);

  studies = this.dicomService.studies;
  selectedStudy = this.dicomService.selectedStudy;
  
  currentImageSrc = signal<string | null>(null);
  isAnalyzing = signal(false);

  constructor() {
    afterNextRender(() => {
      this.loadStudies();
    });
  }

  ngOnInit() {
    // Moved to afterNextRender for browser-only execution
  }

  loadStudies() {
    this.dicomService.searchStudies();
  }

  selectStudy(study: DicomStudy) {
    this.dicomService.selectedStudy.set(study);
    
    // For MVP demonstration, assume we have these UIDs, or we can use placeholder ones if the backend has test data
    // In a real application, clicking a study would load its Series, then its Instances, and we would view those.
    
    // To show something, we're using mock Series and Instance UIDs as placeholders for test data
    const studyUid = study.studyInstanceUid;
    const seriesUid = 'mock-series-uid'; // TODO: fetch actual series
    const instanceUid = 'mock-instance-uid'; // TODO: fetch actual instances
    
    // This allows the proxy to attempt to fetch. If it 404s, it will show a broken image unless caught.
    const src = this.dicomService.getRenderedImageUrl(studyUid, seriesUid, instanceUid);
    this.currentImageSrc.set(src);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr || dateStr.length !== 8) return dateStr || 'Unknown Date';
    // DICOM Date DA is YYYYMMDD
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }

  async analyzeImage() {
    if (!this.currentImageSrc()) return;
    
    this.isAnalyzing.set(true);
    try {
      const response = await fetch(this.currentImageSrc()!);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Multi-modal Analysis
        const analysis = await this.intelligenceService.analyzeRadiologyImage(base64data, this.selectedStudy()?.studyDescription || '');
        
        this.intelligenceService.transcript.update(t => [...t, {
            role: 'model',
            text: `**Radiology Analysis Complete:**\n\n${analysis}`
        }]);
        
        console.log("DICOM Analysis Response:", analysis);
      };
      
    } catch (e: any) {
      console.error("DICOM Analysis Failed", e);
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}
