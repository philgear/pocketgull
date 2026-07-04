import { Component, ChangeDetectionStrategy, inject, signal, computed, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { SereneIntakeComponent } from './serene-intake.component';
import { InsightGridComponent } from './insight-grid.component';

@Component({
  selector: 'app-synthesis-dashboard',
  standalone: true,
  imports: [CommonModule, SereneIntakeComponent, InsightGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col bg-[#EEEEEE] dark:bg-zinc-950 shadow-2xl border border-gray-300 dark:border-zinc-800 rounded-none md:rounded-lg overflow-hidden z-40 transition-all"
         [class.fixed]="isMobile()"
         [class.inset-0]="isMobile()"
         [class.absolute]="!isMobile()"
         [style.left.px]="isMobile() ? null : position().x"
         [style.top.px]="isMobile() ? null : position().y"
         [style.width.px]="isMobile() ? null : size().width"
         [style.height.px]="isMobile() ? null : size().height"
         [style.max-height]="isMobile() ? '100dvh' : 'none'">
      
      <!-- Drag Handle Header -->
      <div (mousedown)="isMobile() ? null : startDrag($event)" 
           [class.cursor-move]="!isMobile()"
           class="h-10 px-4 flex items-center justify-between bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shrink-0 select-none">
        <h3 class="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-zinc-400 flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Knowledge Synthesis Engine
        </h3>
        <button class="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md transition-colors" (click)="close()" title="Close Synthesis Dashboard" aria-label="Close Synthesis Dashboard">
          <svg class="w-4 h-4 text-gray-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Main Body Area -->
      <div class="flex-1 min-h-0 relative overflow-y-auto">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
           <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
           <div class="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        <div class="relative z-10 flex flex-col p-6 min-h-full">
          <!-- Inner Header -->
          <header class="w-full flex items-center justify-between pb-6 border-b border-gray-200 dark:border-zinc-800/50">
             <div>
               <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Interactive Synthesizer</h2>
               <p class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">AI-Powered Distillation</p>
             </div>
             
             <button class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors border border-gray-300 dark:border-zinc-800 rounded hover:bg-gray-100 dark:hover:bg-zinc-900" (click)="reset()">
               Reset Canvas
             </button>
          </header>

          <!-- Main Content Area -->
          <main class="flex-1 flex flex-col pt-6 min-h-0">
             @if (hasData()) {
               <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <app-insight-grid></app-insight-grid>
               </div>
             } @else {
               <app-serene-intake></app-serene-intake>
             }
          </main>
        </div>
      </div>

      <!-- Resize Handle -->
      @if (!isMobile()) {
        <div (mousedown)="startResize($event)" class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize text-gray-300 hover:text-gray-600 transition-colors flex items-end justify-end p-0.5">
            <svg width="100%" height="100%" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0 L10 10 L0 10" stroke="currentColor" stroke-width="2"/>
            </svg>
        </div>
      }
    </div>
  `
})
export class SynthesisDashboardComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  state = inject(PatientStateService);

  hasData = signal(false);
  isMobile = signal(false);

  // --- Window State ---
  position = signal({ x: 100, y: 80 });
  size = signal({ width: 900, height: 700 });

  private dragging = false;
  private resizing = false;
  private initialMousePos = { x: 0, y: 0 };
  private initialPosition = { x: 0, y: 0 };
  private initialSize = { width: 0, height: 0 };

  private boundDoDrag = this.doDrag.bind(this);
  private boundStopDrag = this.stopDrag.bind(this);
  private boundDoResize = this.doResize.bind(this);
  private boundStopResize = this.stopResize.bind(this);
  private checkMobileListener = () => this.isMobile.set(window.innerWidth < 768);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const w = window.innerWidth;
      this.position.set({ x: w * 0.1, y: 80 });
      
      this.checkMobileListener();
      window.addEventListener('resize', this.checkMobileListener);
    }
  }

  reset() {
    this.hasData.set(false);
  }

  close() {
    this.state.toggleSynthesisDashboard(false);
  }

  // --- Window Actions ---
  startDrag(event: MouseEvent) {
    event.preventDefault();
    this.dragging = true;
    this.initialMousePos = { x: event.clientX, y: event.clientY };
    this.initialPosition = this.position();
    document.addEventListener('mousemove', this.boundDoDrag);
    document.addEventListener('mouseup', this.boundStopDrag, { once: true });
  }

  private doDrag(event: MouseEvent) {
    if (!this.dragging) return;
    const deltaX = event.clientX - this.initialMousePos.x;
    const deltaY = event.clientY - this.initialMousePos.y;
    this.position.set({
      x: this.initialPosition.x + deltaX,
      y: this.initialPosition.y + deltaY,
    });
  }

  private stopDrag() {
    this.dragging = false;
    document.removeEventListener('mousemove', this.boundDoDrag);
  }

  startResize(event: MouseEvent) {
    event.preventDefault();
    this.resizing = true;
    this.initialMousePos = { x: event.clientX, y: event.clientY };
    this.initialSize = this.size();
    document.addEventListener('mousemove', this.boundDoResize);
    document.addEventListener('mouseup', this.boundStopResize, { once: true });
  }

  private doResize(event: MouseEvent) {
    if (!this.resizing) return;
    const deltaX = event.clientX - this.initialMousePos.x;
    const deltaY = event.clientY - this.initialMousePos.y;
    this.size.set({
      width: Math.max(500, this.initialSize.width + deltaX),
      height: Math.max(400, this.initialSize.height + deltaY),
    });
  }

  private stopResize() {
    this.resizing = false;
    document.removeEventListener('mousemove', this.boundDoResize);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.checkMobileListener);
    }
    document.removeEventListener('mousemove', this.boundDoDrag);
    document.removeEventListener('mouseup', this.boundStopDrag);
    document.removeEventListener('mousemove', this.boundDoResize);
    document.removeEventListener('mouseup', this.boundStopResize);
  }
}
