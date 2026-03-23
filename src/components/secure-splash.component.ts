import { Component, ChangeDetectionStrategy, inject, signal, effect, ElementRef, viewChild, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStateService } from '../services/session-state.service';
import { FirestoreSyncService } from '../services/firestore-sync.service';


@Component({
  selector: 'app-secure-splash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="fixed inset-0 z-[999] flex flex-col items-center justify-center p-6 backdrop-blur-3xl bg-zinc-950/95 animate-in fade-in duration-[800ms] overflow-hidden">
      <!-- Ambient light effect -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
      </div>

      <!-- HIPAA Lock Status Header (Visible only when locked) -->
      @if (isLocked()) {
        <div class="absolute shadow-sm top-8 left-1/2 -translate-x-1/2 flex flex-col items-center mb-8 mt-2 animate-in slide-in-from-top-4 duration-500">
           <div class="flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md px-5 py-3 rounded-full border border-zinc-800/80 shadow-2xl">
               <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
               <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">System Locked</span>
           </div>
        </div>
      }

      <!-- Unified Seagull Mascot -->
      <div class="origami-seagull-container group drop-shadow-2xl relative z-20 pointer-events-none mb-6">
        <svg
          class="w-40 h-40 md:w-48 md:h-48 hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
          viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g>
            <polygon class="origami-fold fold-4 origin-[60%_40%]" points="50,40 65,15 58,45" fill="#404040" stroke="#404040" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-4 origin-[20%_40%]" points="20,50 50,40 10,35" fill="#505050" stroke="#505050" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-3 origin-[50%_50%]" points="20,50 50,40 58,45 75,55 50,65" fill="#888888" stroke="#888888" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-2 origin-[40%_60%]" points="50,40 58,45 35,85" fill="#d4d4d8" stroke="#d4d4d8" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-2 origin-[40%_60%]" points="50,40 35,85 20,50" fill="#a1a1aa" stroke="#a1a1aa" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-1 origin-[70%_45%]" points="75,55 58,45 85,38" fill="#e4e4e7" stroke="#e4e4e7" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-1 origin-[85%_35%]" points="85,38 82,45 95,34" fill="#10b981" stroke="#059669" stroke-width="0.5" stroke-linejoin="round"></polygon>
          </g>
        </svg>
      </div>

      <div class="w-full max-w-sm relative z-10 flex flex-col items-center">
        <!-- Dynamic Entry Panel -->
        <div id="seagull-safe-zone" class="w-full relative shadow-[0_0_50px_-12px_rgba(0,0,0,1)] rounded-3xl p-8 bg-zinc-900/80 border border-zinc-800/80 animate-in slide-in-from-bottom-8 duration-700 ease-out ring-1 ring-white/5 overflow-hidden backdrop-blur-2xl">
          
          <!-- Subtle Dieter Rams Grill/Detail lines at top -->
          <div class="absolute top-0 left-0 right-0 h-1.5 flex gap-[1px] px-8 opacity-30">
             <div class="flex-1 bg-zinc-600"></div><div class="flex-1 bg-zinc-600"></div><div class="flex-1 bg-zinc-600"></div><div class="flex-1 bg-zinc-600"></div>
          </div>

          <div class="text-center mb-8 mt-2">
            <h1 class="text-xl font-medium tracking-[0.15em] text-zinc-100 uppercase pb-1"
                style="letter-spacing: 0.1em;">
              {{ isLocked() ? 'Resume Session' : 'Pocket Gull' }}
            </h1>
            <p class="text-[9px] uppercase tracking-[0.25em] text-zinc-400">
              {{ isLocked() ? 'Idle Timeout Protection Active' : 'Clinical Intelligence Engine' }}
            </p>
          </div>

          <!-- PIN Unlock Flow -->
          @if (isLocked()) {
            <div class="flex items-center justify-center gap-3 mt-2 mb-2 w-full">
               
               <input 
                 #pinInput
                 type="password" 
                 [(ngModel)]="pin"
                 (keyup.enter)="verifyPin()"
                 maxlength="4"
                 placeholder="1234" 
                 class="flex-1 min-w-0 h-[64px] px-6 text-center tracking-[1.2em] text-2xl font-mono bg-black/40 border border-zinc-800/80 rounded-2xl shadow-inner focus:outline-none focus:border-zinc-500/50 transition-all text-zinc-100 placeholder:text-zinc-800"
               >
               
               <button 
                 (click)="handleUnlock()" 
                 [disabled]="isChecking()"
                 title="Unlock with Biometrics"
                 class="w-[64px] h-[64px] flex-shrink-0 flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 hover:ring-2 hover:ring-zinc-600 text-zinc-300 transition-all rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.02)] active:scale-[0.96]">
                 <svg *ngIf="!isChecking()" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
                 <!-- Loading Spinner if checking -->
                 <svg *ngIf="isChecking()" class="animate-spin w-5 h-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               </button>

            </div>
            @if (errorMsg()) {
              <p class="mb-4 text-red-400/90 text-[10px] uppercase font-bold tracking-[0.1em] text-center w-full">{{ errorMsg() }}</p>
            }
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
                  class="w-full px-4 py-4 pb-3.5 text-xs font-mono bg-black/40 border border-zinc-800/80 rounded-[1rem] shadow-inner outline-none focus:border-zinc-500/80 transition-colors text-zinc-200 placeholder:font-sans placeholder:text-zinc-700 placeholder:tracking-widest placeholder:text-[9.5px]"
                >
                <button type="button" (click)="showPassword.set(!showPassword())" class="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300">
                  <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                </button>
              </div>

              @if (apiKeyError()) {
                <div class="p-3 bg-red-950/40 border border-red-900/50 rounded-xl">
                  <p class="text-[9px] text-red-400 font-medium text-center uppercase tracking-wider">{{ apiKeyError() }}</p>
                </div>
              }

              <button 
                type="submit"
                [disabled]="!apiKeyStr().trim() || isChecking()"
                class="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-[1rem] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-[0.98]">
                Initialize System
              </button>

              <div class="relative py-4 mt-2">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-zinc-800/80"></div>
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-zinc-900 px-3 text-zinc-600 uppercase tracking-widest text-[8px] font-bold rounded-full">Or use alternative</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-3">
                <button type="button" class="w-full py-3 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 text-[9px] uppercase tracking-[0.1em] rounded-xl transition-colors" (click)="handleAiStudio()">
                  AI Studio Key
                </button>
                <button type="button" class="w-full py-3 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 text-[9px] uppercase tracking-[0.1em] rounded-xl transition-colors" (click)="handleDemo()">
                  Demo Mode
                </button>
              </div>

              <button type="button" class="w-full py-3 bg-[#4285F4]/10 border border-[#4285F4]/30 hover:bg-[#4285F4]/20 hover:border-[#4285F4]/50 text-[#4285F4] text-[9.5px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all flex items-center justify-center gap-2" (click)="handleGoogleAuth()">
                <svg viewBox="0 0 24 24" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </button>
            </form>
          }
        </div>

        <p class="text-[9px] text-zinc-500 mt-12 font-mono uppercase tracking-[0.3em]">Clinical Protocol v2.2</p>
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
  syncService = inject(FirestoreSyncService);
  
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
         setTimeout(() => this.pinInputRef()!.nativeElement.focus(), 150);
      }
    });
  }

  async handleUnlock() {
    this.isChecking.set(true);
    this.errorMsg.set('');

    const success = await this.session.unlock();
    if (!success) {
      this.errorMsg.set('Biometric verification failed.');
    }
    this.isChecking.set(false);
  }

  verifyPin() {
    this.errorMsg.set('');
    if (this.pin() === '1234') {
       this.session.isLocked.set(false);
       this.session.resetIdleTimer();
       this.pin.set('');
    } else {
       this.errorMsg.set('Invalid Access Code.');
       this.pin.set('');
       setTimeout(() => this.pinInputRef()?.nativeElement.focus(), 50);
    }
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

  async handleGoogleAuth() {
    try {
       await this.syncService.signInWithGoogle();
       // Optionally alert or proceed to app...
       this.handleDemo(); // Fallback to demo mode state hydration after login for now
    } catch(err: any) {
       this.errorMsg.set(`Authentication Failed: ${err.message}`);
    }
  }
}
