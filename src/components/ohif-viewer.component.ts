import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DicomService } from '../services/dicom.service';

@Component({
  selector: 'app-ohif-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ohif-wrapper w-full h-[600px] xl:h-[700px] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 relative flex flex-col items-center justify-center gap-6 p-8">

      <!-- Background grid -->
      <div class="absolute inset-0 opacity-10"
           style="background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 32px 32px;">
      </div>

      <!-- Icon -->
      <div class="relative z-10 w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-2xl">
        <svg class="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
      </div>

      <!-- Study info / prompt -->
      <div class="relative z-10 text-center space-y-2">
        @if (dicomService.selectedStudy()) {
          <p class="text-xs uppercase tracking-widest font-bold text-zinc-500">Selected Study</p>
          <p class="text-lg font-semibold text-zinc-100">{{ dicomService.selectedStudy()?.patientName || 'Unknown Patient' }}</p>
          <p class="text-sm text-zinc-400">{{ dicomService.selectedStudy()?.studyDescription || 'No description' }}</p>
          <p class="text-xs font-mono text-zinc-600 max-w-xs truncate">{{ dicomService.selectedStudy()?.studyInstanceUid }}</p>
        } @else {
          <p class="text-xs uppercase tracking-widest font-bold text-zinc-500">OHIF Medical Viewer</p>
          <p class="text-lg font-semibold text-zinc-100">Advanced DICOM Viewer</p>
          <p class="text-sm text-zinc-400">Select a study from the list to open it in OHIF</p>
        }
      </div>

      <!-- Launch button -->
      <a [href]="ohifUrl()"
         target="_blank"
         rel="noopener noreferrer"
         [class.pointer-events-none]="!dicomService.selectedStudy()"
         [class.opacity-40]="!dicomService.selectedStudy()"
         class="relative z-10 group flex items-center gap-3 px-6 py-3 rounded-xl
                bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500
                text-sm font-medium text-zinc-200 transition-all duration-200
                hover:shadow-lg hover:shadow-black/30 active:scale-95">
        <svg class="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {{ dicomService.selectedStudy() ? 'Open in OHIF Viewer' : 'No Study Selected' }}
      </a>

      <!-- Note -->
      <p class="relative z-10 text-[10px] text-zinc-600 text-center max-w-xs leading-relaxed">
        OHIF Viewer opens in a new tab. Public instance hosted at viewer.ohif.org.
      </p>
    </div>
  `
})
export class OhifViewerComponent {
  dicomService = inject(DicomService);

  ohifBaseUrl = input<string>('https://viewer.ohif.org/viewer');

  ohifUrl = computed(() => {
    const study = this.dicomService.selectedStudy();
    const uid = study?.studyInstanceUid;
    const base = this.ohifBaseUrl();
    if (!uid) return base;
    return `${base}?StudyInstanceUIDs=${uid}`;
  });
}
