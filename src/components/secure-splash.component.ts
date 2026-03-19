import { Component, ChangeDetectionStrategy, inject, signal, effect, ElementRef, viewChild, HostListener, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStateService } from '../services/session-state.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';

@Component({
  selector: 'app-secure-splash',
  standalone: true,
  imports: [CommonModule, FormsModule, PocketGullButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="fixed inset-0 z-[999] flex flex-col items-center justify-center p-6 backdrop-blur-3xl bg-white/90 dark:bg-[#09090b]/90 animate-in fade-in duration-[800ms] overflow-hidden">
      <!-- Ambient light effect -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] rounded-full blur-3xl"></div>
      </div>

      <!-- HIPAA Lock Status Header (Visible only when locked) -->
      @if (isLocked()) {
        <div class="absolute shadow-sm top-8 left-1/2 -translate-x-1/2 flex flex-col items-center mb-8 mt-2 animate-in slide-in-from-top-4 duration-500">
           <div class="flex items-center gap-3 bg-white dark:bg-[#111111] px-5 py-2.5 rounded-full border border-gray-200 dark:border-zinc-800 shadow-xl">
               <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
               <span class="text-xs font-bold uppercase tracking-widest text-[#1C1C1C] dark:text-zinc-100">System Locked</span>
           </div>
        </div>
      }

      <!-- Unified Seagull Mascot -->
      <div class="origami-seagull-container group drop-shadow-2xl relative z-20 pointer-events-none mb-6">
        <svg
          class="w-40 h-40 md:w-48 md:h-48 hover:scale-105 active:scale-95 transition-transform" 
          viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g>
            <polygon class="origami-fold fold-4 origin-[60%_40%]" points="50,40 65,15 58,45" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-4 origin-[20%_40%]" points="20,50 50,40 10,35" fill="#e0e0e0" stroke="#d0d0d0" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-3 origin-[50%_50%]" points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f4" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-2 origin-[40%_60%]" points="50,40 58,45 35,85" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-2 origin-[40%_60%]" points="50,40 35,85 20,50" fill="#f9f9f9" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-1 origin-[70%_45%]" points="75,55 58,45 85,38" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-1 origin-[85%_35%]" points="85,38 82,45 95,34" fill="#ff4500" stroke="#df3d00" stroke-width="0.5" stroke-linejoin="round"></polygon>
          </g>
        </svg>
      </div>

      <div class="w-full max-w-sm relative z-10 flex flex-col items-center">
        <!-- Dynamic Entry Panel -->
        <div id="seagull-safe-zone" class="w-full relative shadow-[0_30px_60px_-15px_rgba(30,58,95,0.4)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] rounded-[2rem] p-8 bg-gradient-to-br from-[#E1EAF4] to-[#C9DEEE] dark:from-[#0F172A] dark:to-[#1E293B] border-[3px] border-white dark:border-[#334155] animate-in slide-in-from-bottom-8 duration-700 ease-out ring-1 ring-[#1E3A5F]/10 dark:ring-black/50 overflow-hidden mix-blend-normal backdrop-blur-md">
          
          <!-- Subtle Dieter Rams Grill/Detail lines at top -->
          <div class="absolute top-0 left-0 right-0 h-2 flex gap-0.5 px-6 opacity-40">
             <div class="flex-1 bg-white/60 dark:bg-zinc-700"></div><div class="flex-1 bg-white/60 dark:bg-zinc-700"></div><div class="flex-1 bg-white/60 dark:bg-zinc-700"></div><div class="flex-1 bg-white/60 dark:bg-zinc-700"></div>
          </div>

          <div class="text-center mb-8 mt-2">
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 uppercase pb-1" 
                style="letter-spacing: 0.1em;">
              {{ isLocked() ? 'Resume Session' : 'Pocket Gull' }}
            </h1>
            <p class="text-[10px] uppercase tracking-widest text-gray-500 dark:text-zinc-400">
              {{ isLocked() ? 'Idle Timeout Protection Active' : 'Clinical Intelligence Engine' }}
            </p>
          </div>

          <!-- PIN Unlock Flow -->
          @if (isLocked()) {
            <form (submit)="handleUnlock(); $event.preventDefault();" class="relative mb-4">
              <input 
                #pinInput
                type="password"
                name="pin"
                autocomplete="current-password"
                [(ngModel)]="pin"
                placeholder="PIN ('1234')" 
                autofocus
                class="w-full px-4 py-3 text-center text-lg tracking-[0.3em] font-mono bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm border border-white/50 dark:border-zinc-700 rounded-[1rem] shadow-inner outline-none focus:border-[#1E3A5F] dark:focus:border-white transition-colors text-gray-900 dark:text-zinc-100 placeholder:tracking-normal placeholder:text-xs placeholder:font-sans"
              />
              @if (errorMsg()) {
                <p class="absolute -bottom-6 left-0 right-0 text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">{{ errorMsg() }}</p>
              }
            </form>

            <button 
              (click)="handleUnlock()" 
              [disabled]="!pin().trim() || isChecking()"
              class="w-full mt-3 py-3 bg-[#1C1C1C] dark:bg-white text-white dark:text-[#09090b] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-gray-200 transition-all rounded-[1rem] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:translate-y-[1px] active:shadow-sm">
              {{ isChecking() ? 'Verifying...' : 'Unlock Terminal' }}
            </button>
          } 
          <!-- API Key Setup Flow -->
          @else {
            <form (submit)="handleSubmitKey(); $event.preventDefault();" class="space-y-4">
              <div class="relative group">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  name="apiKey"
                  [(ngModel)]="apiKeyStr"
                  placeholder="Enter Gemini API Key (AIza...)" 
                  autofocus
                  class="w-full px-4 py-3 pb-2.5 text-sm font-mono bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm border border-white/50 dark:border-zinc-700 rounded-[1rem] shadow-inner outline-none focus:border-[#1E3A5F] dark:focus:border-white transition-colors text-gray-900 dark:text-zinc-100 placeholder:font-sans placeholder:text-gray-500"
                >
                <button type="button" (click)="showPassword.set(!showPassword())" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1E3A5F] dark:hover:text-gray-200">
                  <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                </button>
              </div>

              @if (apiKeyError()) {
                <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-md">
                  <p class="text-[10px] text-red-600 dark:text-red-400 font-medium text-center uppercase tracking-wider">{{ apiKeyError() }}</p>
                </div>
              }

              <button 
                type="submit"
                [disabled]="!apiKeyStr().trim() || isChecking()"
                class="w-full py-3 bg-[#1C1C1C] dark:bg-white text-white dark:text-[#09090b] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-gray-200 transition-all rounded-[1rem] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:translate-y-[1px] active:shadow-sm">
                Initialize System
              </button>

              <div class="relative py-4">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-white/50 dark:border-zinc-800"></div>
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-transparent px-2 text-[#1E3A5F]/70 dark:text-gray-500 uppercase tracking-widest text-[9px] font-bold backdrop-blur-md rounded-full">Or use alternative</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <pocket-gull-button class="w-full" variant="outline" size="sm" (click)="handleAiStudio()">
                  <span class="text-[9px] uppercase tracking-wider">AI Studio Key</span>
                </pocket-gull-button>
                <pocket-gull-button class="w-full" variant="outline" size="sm" (click)="handleDemo()">
                  <span class="text-[9px] uppercase tracking-wider">Demo Mode</span>
                </pocket-gull-button>
              </div>
            </form>
          }
        </div>

        <p class="text-xs text-[#1E3A5F]/50 dark:text-gray-600 mt-12 font-mono uppercase tracking-[0.2em]">Clinical Evaluation Build v2.1</p>
      </div>
    </main>
  `,
  styles: [`
    @keyframes origami-unfold {
        0% { transform: scaleY(0.1) rotateX(80deg) rotateZ(-10deg); opacity: 0; }
        60% { transform: scaleY(1.1) rotateX(-15deg) rotateZ(5deg); opacity: 1; }
        100% { transform: scaleY(1) rotateX(0deg) rotateZ(0deg); opacity: 1; }
    }
    .origami-fold {
        animation: origami-unfold 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transform-style: preserve-3d;
    }
    .fold-1 { animation-delay: 150ms; }
    .fold-2 { animation-delay: 300ms; }
    .fold-3 { animation-delay: 450ms; }
    .fold-4 { animation-delay: 600ms; }
  `]
})
export class SecureSplashComponent {
  session = inject(SessionStateService);
  
  // Inputs
  apiKeyError = input<string | null>(null);

  // Outputs
  submitKey = output<string>();
  loadDemo = output<void>();
  selectAiStudio = output<void>();

  // State
  isLocked = computed(() => this.session.isLocked());
  apiKeyStr = signal('');
  pin = signal('');
  showPassword = signal(false);
  errorMsg = signal('');
  isChecking = signal(false);

  pinInputRef = viewChild<ElementRef<HTMLInputElement>>('pinInput');

  constructor() {
    effect(() => {
      // Auto-focus logic based on state
      if (this.isLocked() && this.pinInputRef()?.nativeElement) {
        setTimeout(() => this.pinInputRef()!.nativeElement.focus(), 100);
      }
    });
  }

  handleUnlock() {
    if (!this.pin().trim()) return;
    this.isChecking.set(true);
    this.errorMsg.set('');

    setTimeout(() => {
      const success = this.session.unlock(this.pin());
      if (!success) {
        this.errorMsg.set('Invalid PIN code.');
        this.pin.set('');
        this.pinInputRef()?.nativeElement?.focus();
      }
      this.isChecking.set(false);
    }, 600);
  }

  handleSubmitKey() {
    this.isChecking.set(true);
    this.submitKey.emit(this.apiKeyStr());
    setTimeout(() => this.isChecking.set(false), 300); // Visual delay
  }

  handleDemo() {
    this.loadDemo.emit();
  }

  handleAiStudio() {
    this.selectAiStudio.emit();
  }
}
