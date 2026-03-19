import { Component, input, computed, inject, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { DicomService } from '../services/dicom.service';

@Component({
  selector: 'app-ohif-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ohif-wrapper w-full h-[600px] xl:h-[700px] bg-black rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group">
      @if (!dicomService.selectedStudy()) {
         <div class="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 z-10 bg-zinc-950/50 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm tracking-widest uppercase font-bold text-center">Select a Study <br/><span class="text-[10px] font-normal opacity-70">to view in OHIF</span></p>
         </div>
      }
      <iframe 
        [src]="safeUrl()" 
        title="OHIF Medical Viewer"
        credentialless
        class="w-full h-full border-0 absolute inset-0 z-0 bg-black/5"
        allowfullscreen>
      </iframe>
    </div>
  `
})
export class OhifViewerComponent {
  dicomService = inject(DicomService);
  
  // Base URL to the deployed OHIF instance
  // Note: Depending on CORS and X-Frame-Options, embedding the public viewer might be restricted.
  ohifBaseUrl = input<string>('https://viewer.ohif.org/viewer');

  private sanitizer = inject(DomSanitizer);

  safeUrl = computed(() => {
    const study = this.dicomService.selectedStudy();
    const uid = study?.studyInstanceUid;
    const base = this.ohifBaseUrl();
    if (!uid) {
        // Just show the base viewer if no UID
        return this.sanitizer.bypassSecurityTrustResourceUrl(base);
    }
    // OHIF handles StudyInstanceUIDs via query param
    const url = `${base}?StudyInstanceUIDs=${uid}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
