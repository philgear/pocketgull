import { Component, input, inject , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DicomService } from '../services/dicom.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ohif-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ohif-wrapper w-full h-[600px] xl:h-[700px] bg-black rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group flex items-center justify-center">
      @if (!dicomService.selectedStudy()) {
         <div class="flex flex-col items-center justify-center text-zinc-500 z-10 bg-zinc-950/50 backdrop-blur-sm inset-0 absolute">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm tracking-widest uppercase font-bold text-center">Select a Study <br/><span class="text-[10px] font-normal opacity-70">to view in OHIF</span></p>
         </div>
      } @else {
         <div class="flex flex-col items-center justify-center text-zinc-300 z-10 w-full max-w-md p-8 bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-md">
            <!-- Launch Icon -->
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
               <svg class="w-8 h-8 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
               </svg>
            </div>
            
            <h3 class="text-lg font-bold text-white mb-2 text-center">Diagnostic Study Loaded</h3>
            <div class="w-full flex justify-center mb-8">
               <p class="text-[10px] text-zinc-400 text-center px-4 leading-relaxed max-w-[250px] truncate">
                 UID: <span class="font-mono text-zinc-500">{{ dicomService.selectedStudy()?.studyInstanceUid }}</span>
               </p>
            </div>

            <button 
              (click)="launchViewer()"
              class="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-[0.98]">
              Launch Native Viewer
            </button>
            
            <p class="text-[9px] text-zinc-500 text-center mt-6 tracking-wide uppercase">
               Opens securely in an isolated high-performance tab
            </p>
         </div>
         
         <!-- Background decoration for the loaded state -->
         <div class="absolute inset-0 z-0 opacity-[0.15] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.3)_0%,transparent_60%)] pointer-events-none"></div>
      }
    </div>
  `
})
export class OhifViewerComponent {
  dicomService = inject(DicomService);
  
  // Base URL to the deployed OHIF instance
  ohifBaseUrl = input<string>('https://viewer.ohif.org/viewer');

  launchViewer() {
    const study = this.dicomService.selectedStudy();
    const uid = study?.studyInstanceUid;
    const base = this.ohifBaseUrl();
    
    let targetUrl = base;
    if (uid) {
      targetUrl = `${base}?StudyInstanceUIDs=${uid}`;
    }
    
    // Launch securely in a new tab to bypass X-Frame-Options and permit WASM memory isolation
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
}
