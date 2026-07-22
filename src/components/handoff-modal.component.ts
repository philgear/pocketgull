import { Component, input, output, signal, computed, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { generate } from 'lean-qr';

@Component({
  selector: 'app-handoff-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
           (click)="closeModal()">
        
        <!-- Modal Card Container -->
        <div class="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
             (click)="$event.stopPropagation()">
          
          <!-- Header Bar -->
          <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
                🤝
              </div>
              <div>
                <h2 class="text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                  Clinician-to-Clinician Handoff
                </h2>
                <p class="text-xs text-slate-500 dark:text-zinc-400">
                  Instant real-time state handoff via base64 encoded URL & QR code
                </p>
              </div>
            </div>
            
            <button type="button" (click)="closeModal()" aria-label="Close modal"
                    class="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-zinc-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Body Content Area -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1">
            
            <!-- Patient Summary Card for Screen Share -->
            <div class="p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  📋 Live Patient Snapshot
                </span>
                <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 font-semibold">
                  {{ activeParadigmLabel() }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-500 dark:text-zinc-400">Chief Complaint:</span>
                  <p class="font-bold text-slate-800 dark:text-zinc-200 truncate">
                    {{ patientState.currentSymptoms() || 'Standard Medical Assessment' }}
                  </p>
                </div>
                <div>
                  <span class="text-slate-500 dark:text-zinc-400">Selected Issues:</span>
                  <p class="font-bold text-slate-800 dark:text-zinc-200">
                    {{ issueCount() }} anatomical region(s)
                  </p>
                </div>
              </div>
            </div>

            <!-- Share Options Grid (QR Code + Copy Link) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              <!-- QR Code Display -->
              <div class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
                <div #qrContainer class="p-2 bg-white rounded-lg shadow-sm border border-slate-200 mb-2"></div>
                <span class="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  📱 Scan with mobile camera to load handoff
                </span>
              </div>

              <!-- Copy Link Action Box -->
              <div class="flex flex-col justify-center space-y-3">
                <label class="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Direct Handoff URL (Base64 Encoded):
                </label>
                <div class="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 text-[11px] font-mono text-slate-600 dark:text-zinc-400 truncate select-all">
                  {{ shareUrl() }}
                </div>

                <button type="button" (click)="copyShareUrl()"
                        class="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2">
                  @if (copied()) {
                    <span>✔ Link Copied to Clipboard!</span>
                  } @else {
                    <span>📋 Copy Handoff Link</span>
                  }
                </button>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-2">
            <button type="button" (click)="closeModal()"
                    class="py-2 px-4 rounded-xl font-bold text-xs border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer">
              Done
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class HandoffModalComponent {
  patientState = inject(PatientStateService);
  
  isOpen = input<boolean>(false);
  close = output<void>();

  qrContainer = viewChild<ElementRef<HTMLDivElement>>('qrContainer');
  
  copied = signal<boolean>(false);

  shareUrl = computed(() => {
    return this.patientState.generateExpandedShareUrl();
  });

  issueCount = computed(() => {
    return this.patientState.selectedIssues().length;
  });

  activeParadigmLabel = computed(() => {
    switch (this.patientState.activePhilosophy()) {
      case 'eastern':
        return 'Eastern TCM Paradigm';
      case 'ayurvedic':
        return 'Ayurvedic Medicine Paradigm';
      case 'western':
      default:
        return 'Western Allopathic Paradigm';
    }
  });

  constructor() {
    effect(() => {
      if (this.isOpen() && this.qrContainer()) {
        this.renderQrCode();
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  copyShareUrl(): void {
    const url = this.shareUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  private renderQrCode(): void {
    const container = this.qrContainer()?.nativeElement;
    if (!container) return;

    try {
      container.innerHTML = '';
      const url = this.shareUrl();
      const code = generate(url);
      const svgString = code.toSvgString({ on: '#0f172a', off: '#ffffff', pad: 1 });
      container.innerHTML = svgString;
    } catch (err) {
      console.warn('[HandoffModal] QR code rendering error:', err);
    }
  }
}
