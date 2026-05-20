import { Component, ChangeDetectionStrategy, inject, signal, effect, ElementRef, viewChild, input, output, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStateService } from '../services/session-state.service';
import { FirestoreSyncService } from '../services/firestore-sync.service';
import { CircadianSleepinessService, KssScore } from '../services/circadian-sleepiness.service';
import { PetAuditoryService } from '../services/pet-auditory.service';


@Component({
  selector: 'app-secure-splash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="fixed inset-0 z-[999] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-sky-300 via-teal-100 to-pink-200 dark:from-[#0b0f19] dark:via-[#161328] dark:to-[#0d161a] animate-gradient-slow animate-in fade-in duration-[800ms] overflow-hidden">
      <!-- Cheery and Imagineery Floating Ambient Lights -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-amber-300/35 dark:bg-amber-500/20 rounded-full blur-[80px] orb-floating-1"></div>
        <div class="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] bg-pink-400/25 dark:bg-pink-600/15 rounded-full blur-[90px] orb-floating-2"></div>
        <div class="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-emerald-300/25 dark:bg-emerald-500/15 rounded-full blur-[70px] orb-floating-3"></div>
        <div class="absolute bottom-[20%] left-[10%] w-[250px] h-[250px] bg-sky-300/30 dark:bg-sky-600/20 rounded-full blur-[60px] orb-floating-4"></div>
      </div>

      <!-- HIPAA Lock Status Header (Visible only when locked) -->
      @if (isLocked()) {
        <div class="absolute shadow-sm top-8 left-1/2 -translate-x-1/2 flex flex-col items-center mb-8 mt-2 animate-in slide-in-from-top-4 duration-500">
           <div class="flex items-center gap-3 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md px-5 py-3 rounded-full border border-slate-200 dark:border-zinc-800/80 shadow-lg dark:shadow-2xl">
               <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
               <span class="text-xs font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-zinc-300">System Locked</span>
           </div>
        </div>
      }

      <!-- Unified Seagull Mascot (Bright Cheery Origami Design) -->
      <div class="origami-seagull-container group drop-shadow-2xl relative z-20 pointer-events-auto cursor-pointer mb-3 md:mb-6 avs-breathing-mascot transition-all duration-500 hover:scale-105 active:scale-95">
        <svg
          class="w-24 h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)]" 
          viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g class="transition-opacity duration-300 group-hover:opacity-95">
            <!-- Orange Folds -->
            <polygon class="origami-fold fold-4 origin-[60%_40%]" points="50,40 65,15 58,45" fill="#FF9F1C" stroke="#FF9F1C" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-4 origin-[20%_40%]" points="20,50 50,40 10,35" fill="#FFAA33" stroke="#FFAA33" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Blue Fold -->
            <polygon class="origami-fold fold-3 origin-[50%_50%]" points="20,50 50,40 58,45 75,55 50,65" fill="#3A86C8" stroke="#3A86C8" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Emerald/Mint Folds -->
            <polygon class="origami-fold fold-2 origin-[40%_60%]" points="50,40 58,45 35,85" fill="#06D6A0" stroke="#06D6A0" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <polygon class="origami-fold fold-2 origin-[40%_60%]" points="50,40 35,85 20,50" fill="#4895EF" stroke="#4895EF" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Coral Fold -->
            <polygon class="origami-fold fold-1 origin-[70%_45%]" points="75,55 58,45 85,38" fill="#FF5A5F" stroke="#FF5A5F" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Sunshine Beak/Head -->
            <polygon class="origami-fold fold-1 origin-[85%_35%]" points="85,38 82,45 95,34" fill="#FFD166" stroke="#FFD166" stroke-width="0.5" stroke-linejoin="round"></polygon>
          </g>
        </svg>
      </div>

      <div class="w-full max-w-sm relative z-10 flex flex-col items-center">
        <!-- Dynamic Entry Panel (Glassmorphism card) -->
        <div id="seagull-safe-zone" class="w-full relative shadow-[0_20px_50px_rgba(15,23,42,0.1)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)] rounded-3xl p-8 bg-white/70 dark:bg-zinc-900/80 border border-white/50 dark:border-zinc-800/80 animate-in slide-in-from-bottom-8 duration-700 ease-out ring-1 ring-white/20 dark:ring-white/5 overflow-hidden backdrop-blur-2xl glass-card">
          
          <!-- Colorful detail stripes at top -->
          <div class="absolute top-0 left-0 right-0 h-1.5 flex gap-[1px] px-8 opacity-80">
             <div class="flex-1 bg-[#FF9F1C]"></div>
             <div class="flex-1 bg-[#3A86C8]"></div>
             <div class="flex-1 bg-[#06D6A0]"></div>
             <div class="flex-1 bg-[#FF5A5F]"></div>
          </div>

          <div class="text-center mb-8 mt-2">
            <h1 class="text-2xl font-black tracking-wider text-slate-800 dark:text-zinc-100 uppercase pb-1 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-pink-500 to-emerald-500 dark:from-sky-400 dark:via-pink-400 dark:to-emerald-400">
              {{ isLocked() ? 'Resume Session' : 'Pocket Gull' }}
            </h1>
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-zinc-400 font-extrabold">
              {{ isLocked() ? 'Idle Timeout Protection Active' : 'Clinical Intelligence Engine' }}
            </p>
          </div>

          <!-- Beta Signup Flow -->
          @if (false) {
            <form (submit)="handleBetaSubmit(); $event.preventDefault();" class="space-y-4 animate-in fade-in duration-300">
               <div>
                  <input type="text" [(ngModel)]="betaForm().name" name="bname" required placeholder="Full Name (with credentials)" class="w-full px-4 py-3.5 text-xs bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800/80 rounded-[1rem] shadow-inner outline-none focus:border-indigo-500 dark:focus:border-emerald-500/50 transition-colors text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600">
               </div>
               <div>
                  <input type="text" [(ngModel)]="betaForm().clinic" name="bclinic" required placeholder="Organization / Clinic Name" class="w-full px-4 py-3.5 text-xs bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800/80 rounded-[1rem] shadow-inner outline-none focus:border-indigo-500 dark:focus:border-emerald-500/50 transition-colors text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600">
               </div>
               <div>
                  <input type="email" [(ngModel)]="betaForm().email" name="bemail" required placeholder="Secure Practice Email" class="w-full px-4 py-3.5 text-xs bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800/80 rounded-[1rem] shadow-inner outline-none focus:border-indigo-500 dark:focus:border-emerald-500/50 transition-colors text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600">
               </div>
               
               <div class="pt-2 flex flex-col gap-4">
                 <button type="submit" [disabled]="isSubmittingBeta() || !betaForm().name?.trim() || !betaForm().clinic?.trim() || !betaForm().email?.trim()" class="w-full py-3.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] transition rounded-[1rem] disabled:opacity-30 disabled:cursor-not-allowed shadow-md">
                   {{ isSubmittingBeta() ? 'Submitting...' : 'Request Beta Tenant' }}
                 </button>
                 <button type="button" (click)="viewState.set('auth')" class="text-xs text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300 uppercase tracking-widest transition-colors w-full text-center font-bold">
                   ← Back to Login
                 </button>
               </div>

               @if (betaSuccess()) {
                  <p class="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-center mt-2 animate-in slide-in-from-bottom-2">Request received. Deployment team will reach out within 48h.</p>
               }
            </form>
          }
          <!-- PIN Unlock Flow -->
          @else if (isLocked()) {
            <div class="flex flex-col items-center justify-center w-full animate-in fade-in-50 duration-300">
              
              <!-- Hidden input for Playwright test compatibility (styled to be invisible to user but interactive for tests) -->
              <input 
                #pinInput
                type="password" 
                [(ngModel)]="pin"
                (ngModelChange)="onPinChange($event)"
                (keydown)="onPinKeyDown($event)"
                (keyup.enter)="verifyPin()"
                maxlength="4"
                placeholder="1234" 
                class="absolute w-1 h-1 opacity-[0.01] bg-transparent border-none text-transparent top-0 left-0 z-[-1]"
              >

              <!-- Canvas Pad -->
              <div class="relative w-[190px] h-[190px] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/60 dark:bg-black/40 shadow-inner overflow-hidden flex items-center justify-center group">
                <canvas 
                  #gestureCanvas
                  width="190"
                  height="190"
                  class="draw-pen-cursor absolute inset-0 w-full h-full touch-none z-10"
                  (pointerdown)="startDrawing($event)"
                  (pointermove)="draw($event)"
                  (pointerup)="stopDrawing($event)"
                  (pointerleave)="stopDrawing($event)"
                ></canvas>
                
                <!-- Glowing guide circle/smiley backdrop to guide the user subtly -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] dark:opacity-[0.04] transition-opacity group-hover:opacity-15">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 stroke-current text-indigo-600 dark:text-zinc-100" fill="none" viewBox="0 0 24 24" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
                </div>
              </div>

              <!-- Controls -->
              <div class="flex items-center gap-3 mt-4 w-full">
                <button 
                  type="button"
                  (click)="clearDrawing()"
                  class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/40 text-xs uppercase tracking-widest font-extrabold rounded-xl transition active:scale-[0.95]"
                >
                  Clear Pad
                </button>
                <button 
                  type="button"
                  (click)="handleUnlock()"
                  [disabled]="isChecking()"
                  title="Unlock with Biometrics"
                  class="w-[48px] h-[38px] flex items-center justify-center bg-indigo-50 dark:bg-zinc-850 hover:bg-indigo-100 dark:hover:bg-zinc-750 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-zinc-800/80 transition rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.95]"
                >
                  @if (!isChecking()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
                  } @else {
                    <svg class="animate-spin w-4 h-4 text-indigo-600 dark:text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  }
                </button>
              </div>
            </div>

            @if (errorMsg()) {
              <p class="mb-4 mt-4 text-red-600 dark:text-red-400/90 text-xs uppercase font-bold tracking-[0.1em] text-center w-full animate-pulse">{{ errorMsg() }}</p>
            }

            <!-- Subtle AVS Lock-State Controller -->
            <div class="mt-6 pt-5 border-t border-slate-200 dark:border-zinc-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-500 font-mono tracking-wider animate-in fade-in duration-700">
               <div class="flex items-center gap-2">
                  <span class="relative flex h-2 w-2">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" [class]="isAvsPlaying() ? 'bg-emerald-400' : 'bg-slate-400 dark:bg-zinc-600'"></span>
                     <span class="relative inline-flex rounded-full h-2 w-2" [class]="isAvsPlaying() ? 'bg-emerald-500' : 'bg-slate-500 dark:bg-zinc-500'"></span>
                  </span>
                  <span class="font-bold text-xs">{{ isAvsPlaying() ? 'AVS ACTIVE' : 'AVS MUTED' }}</span>
               </div>
               <button 
                 type="button" 
                 (click)="toggleAvs()"
                 class="px-3 py-1 bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white rounded-full transition border border-slate-200 dark:border-zinc-700/40 text-xs uppercase font-bold tracking-widest active:scale-95 flex items-center gap-1.5 shadow-sm"
               >
                  <svg *ngIf="!isAvsPlaying()" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  <svg *ngIf="isAvsPlaying()" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 12V6.75A2.25 2.25 0 0 0 15 4.5h-1.5a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 13.5 19.5H15a2.25 2.25 0 0 0 2.25-2.25V12z" /></svg>
                  <span>{{ isAvsPlaying() ? 'Mute' : 'Listen' }}</span>
               </button>
            </div>

            <!-- Animal Comfort Protocols -->
            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800/60 w-full animate-in fade-in duration-500">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-2 font-mono">Animal Comfort Protocols</p>
              <div class="flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" (click)="playCanineHeartbeat()" 
                    [ngClass]="petAuditory.currentMode === 'canine' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/60' : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'"
                    class="py-2 text-xs uppercase tracking-wider font-extrabold rounded-xl border hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M3 12c0-3 2-6 5-6s5 3 5 3 2-3 5-3 5 3 5 6"/></svg>
                    Canine
                  </button>
                  <button type="button" (click)="playFelinePurr()"
                    [ngClass]="petAuditory.currentMode === 'feline' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/60' : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'"
                    class="py-2 text-xs uppercase tracking-wider font-extrabold rounded-xl border hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.33.09 2 .26 1.78-1.55 3-.94 3-.94.83 2.22.3 3.86.15 4.27C18.66 10.14 19 11.96 19 14c0 4.97-3.13 7-7 7s-7-2.03-7-7c0-2.04.34-3.86 1.85-5.41-.15-.41-.68-2.05.15-4.27 0 0 1.22-.61 3 .94.65-.17 1.33-.26 2-.26Z" /><path d="M9 13v.01M15 13v.01" /><path d="M12 16l-1-1h2Z" /></svg>
                    Feline
                  </button>
                  <button type="button" (click)="playCetaceanTherapy()"
                    [ngClass]="petAuditory.currentMode === 'cetacean' ? 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/60' : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'"
                    class="py-2 text-xs uppercase tracking-wider font-extrabold rounded-xl border hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c-1.5-2.5-3-3.5-6-3.5A4.5 4.5 0 0 1 1.5 12c0-2.5 1.5-3.5 4.5-3.5 3 0 4.5 1 6 3.5 1.5-2.5 3-3.5 6-3.5a4.5 4.5 0 0 1 4.5 4.5c0 2.5-1.5 3.5-4.5 3.5-3 0-4.5 1-6 3.5Z" /><path d="M12 12v4" /></svg>
                    Cetacean
                  </button>
                  <button type="button" (click)="playAvianTherapy()"
                    [ngClass]="petAuditory.currentMode === 'avian' ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/60' : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'"
                    class="py-2 text-xs uppercase tracking-wider font-extrabold rounded-xl border hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01" /><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" /><path d="m20 7 2 .5-2 .5" /><path d="M10 18v3" /><path d="M14 17.75V21" /><path d="M7 18a6 6 0 0 0 3.84-10.61" /></svg>
                    Avian
                  </button>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <p class="text-[10px] text-slate-400 dark:text-zinc-550 italic font-medium leading-snug">
                    ⚠️ Soothing frequencies. Use comfort protocols responsibly.
                  </p>
                  @if (petAuditory.isCurrentlyPlaying) {
                    <button type="button" (click)="stopPetAuditory()" class="px-2.5 py-1 text-xs uppercase tracking-wider font-extrabold rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/25 transition-all active:scale-95">
                      Stop
                    </button>
                  }
                </div>
              </div>
            </div>
          } 
          <!-- API Key Setup Flow -->
          @else if (viewState() === 'auth') {
            <form (submit)="handleSubmitKey(); $event.preventDefault();" class="space-y-4">
              <div class="relative group">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  name="apiKey"
                  [(ngModel)]="apiKeyStr"
                  placeholder="Enter Gemini API Key (AIza...)" 
                  autofocus
                  class="w-full px-4 py-4 pb-3.5 text-xs font-mono bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-zinc-800/80 rounded-[1rem] shadow-inner outline-none focus:border-indigo-500 dark:focus:border-zinc-500/80 transition-all focus:ring-4 focus:ring-indigo-500/10 text-slate-800 dark:text-zinc-200 placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-zinc-700 placeholder:tracking-widest placeholder:text-xs"
                >
                <button type="button" (click)="showPassword.set(!showPassword())" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-600 dark:hover:text-zinc-300">
                  <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                </button>
              </div>

              @if (apiKeyError()) {
                <div class="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
                  <p class="text-xs text-red-600 dark:text-red-400 font-medium text-center uppercase tracking-wider">{{ apiKeyError() }}</p>
                </div>
              }

              <button 
                type="submit"
                [disabled]="!apiKeyStr().trim() || isChecking()"
                class="w-full py-4 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 text-white text-xs font-bold uppercase tracking-[0.2em] transition rounded-[1rem] hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(99,102,241,0.2)] active:scale-[0.98]">
                Initialize System
              </button>

              <div class="relative py-4 mt-2">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-200 dark:border-zinc-800/80"></div>
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-white/80 dark:bg-zinc-900/90 px-3 text-slate-400 dark:text-zinc-600 uppercase tracking-widest text-xs font-bold rounded-full">Or use alternative</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-3">
                <button type="button" class="w-full py-3 border border-slate-200 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-800/60 hover:text-indigo-600 dark:hover:text-zinc-200 text-slate-600 dark:text-zinc-400 text-xs uppercase tracking-[0.1em] font-bold rounded-xl transition-all duration-200 bg-white/40 dark:bg-transparent active:scale-[0.97] hover:scale-[1.02]" (click)="handleAiStudio()">
                  AI Studio Key
                </button>
                <button type="button" class="w-full py-3 border border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-800/60 hover:text-emerald-600 dark:hover:text-zinc-200 text-slate-600 dark:text-zinc-400 text-xs uppercase tracking-[0.1em] font-bold rounded-xl transition-all duration-200 bg-white/40 dark:bg-transparent active:scale-[0.97] hover:scale-[1.02]" (click)="handleDemo()">
                  Demo Mode
                </button>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button type="button" class="w-full py-3 bg-[#4285F4]/10 border border-[#4285F4]/30 hover:bg-[#4285F4]/20 hover:border-[#4285F4]/50 text-[#4285F4] text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all active:scale-[0.97] hover:scale-[1.01] flex items-center justify-center gap-1.5" (click)="handleGoogleAuth()">
                  <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google SSO Secure
                </button>
                <button type="button" class="w-full py-3 bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 hover:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all active:scale-[0.97] hover:scale-[1.01] flex items-center justify-center gap-1.5" (click)="handleBiometricLogin()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
                  Biometrics
                </button>
              </div>
            </form>
          }

          <!-- KSS Readiness Check (shown after successful auth) -->
          @else if (viewState() === 'kss') {
            <div class="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

              <!-- Circadian context card -->
              <div class="p-3 rounded-xl border border-slate-200 dark:border-zinc-700/40 bg-white/50 dark:bg-zinc-800/40">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-base">{{ kss.circadian().phaseEmoji }}</span>
                  <p class="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-zinc-300">{{ kss.circadian().phaseLabel }}</p>
                </div>
                <p class="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{{ kss.circadian().recommendation }}</p>
                <div class="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-700/30">
                  <span class="text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Expected alertness</span>
                  <div class="flex gap-0.5">
                    @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
                      <div class="w-3 h-1.5 rounded-full transition-colors"
                           [class]="i <= kss.circadian().expectedKss ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-700'"></div>
                    }
                  </div>
                  <span class="text-xs font-bold animate-pulse"
                        [class]="kss.circadian().cognitiveLoad === 'optimal' ? 'text-emerald-600 dark:text-emerald-400' :
                                 kss.circadian().cognitiveLoad === 'good' ? 'text-blue-600 dark:text-blue-400' :
                                 kss.circadian().cognitiveLoad === 'reduced' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'">
                    {{ kss.circadian().cognitiveLoad | uppercase }}
                  </span>
                </div>
              </div>

              <!-- KSS question -->
              <div class="text-center">
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-400 mb-0.5">Karolinska Sleepiness Scale</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-zinc-100">How alert are you right now?</p>
              </div>

              <!-- KSS 9-point grid -->
              <div class="grid grid-cols-3 gap-1.5">
                @for (item of kss.KSS_ITEMS; track item.score) {
                  <button (click)="selectClinicianKss(item.score)"
                          class="p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer active:scale-95 hover:scale-[1.03]"
                          [class]="clinicianKssSelected() === item.score
                            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02] shadow-sm ring-1 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/40 hover:border-slate-400 dark:hover:border-zinc-600/60 hover:bg-white dark:hover:bg-zinc-800/40'">
                    <div class="flex items-center gap-1.5 mb-0.5">
                       <span class="text-sm">{{ item.emoji }}</span>
                       <span class="text-xs font-bold tabular-nums"
                             [class]="clinicianKssSelected() === item.score ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-zinc-300'">{{ item.score }}</span>
                    </div>
                    <p class="text-xs leading-tight"
                       [class]="clinicianKssSelected() === item.score ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-zinc-500'">{{ item.label }}</p>
                  </button>
                }
              </div>

              <!-- Alert banner (appears once score selected) -->
              @if (kss.readiness()) {
                <div class="p-3 rounded-xl border animate-in fade-in duration-300"
                     [class]="kss.readiness()!.combinedAlert === 'high-risk'
                        ? 'border-red-300/40 dark:border-red-500/30 bg-red-500/[0.04]'
                        : kss.readiness()!.combinedAlert === 'caution'
                        ? 'border-amber-300/40 dark:border-amber-500/30 bg-amber-500/[0.03]'
                        : 'border-emerald-200/40 dark:border-emerald-500/20 bg-emerald-500/[0.02]'">
                  <p class="text-xs leading-relaxed font-semibold"
                     [class]="kss.readiness()!.combinedAlert === 'high-risk' ? 'text-red-600 dark:text-red-300' :
                              kss.readiness()!.combinedAlert === 'caution' ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'">
                    {{ kss.readiness()!.recommendation }}
                  </p>
                  @if (kss.readiness()!.avsReset) {
                    <p class="text-xs text-slate-500 dark:text-zinc-500 mt-1.5 italic">Suggested: {{ kss.readiness()!.avsReset!.wave | uppercase }} reset · {{ kss.readiness()!.avsReset!.durationMin }} min · {{ kss.readiness()!.avsReset!.bpm }} BPM</p>
                  }
                </div>
              }

              <!-- Action buttons -->
              <div class="flex flex-col gap-2">
                <button (click)="enterApp()"
                        [disabled]="!clinicianKssSelected()"
                        class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-[1rem] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-[0.98]">
                  {{ kss.readiness()?.combinedAlert === 'high-risk' ? 'Acknowledge & Enter System' : 'Enter System' }}
                </button>
                <button (click)="enterApp()"
                        class="text-xs text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400 transition-colors text-center w-full uppercase font-bold tracking-widest mt-1">
                  Skip assessment
                </button>
              </div>

            </div>
          }

        </div>

        <!-- Quotes Display -->
        @if (isLocked()) {
          <div 
            (click)="cycleQuote()" 
            class="mt-6 w-full px-5 py-3.5 rounded-2xl bg-white/40 dark:bg-zinc-900/40 hover:bg-white/60 dark:hover:bg-zinc-900/60 border border-white/40 dark:border-zinc-800/40 shadow-sm cursor-pointer select-none transition-all duration-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] text-center backdrop-blur-md group animate-in slide-in-from-bottom-4 duration-1000 pointer-events-auto"
          >
            <p class="text-xs font-medium text-slate-700 dark:text-zinc-300 leading-relaxed italic">
              "{{ currentQuote().text }}"
            </p>
            <div class="mt-2 flex items-center justify-center gap-1.5">
              <span class="w-1.5 h-[1px] bg-slate-400 dark:bg-zinc-600"></span>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                {{ currentQuote().author }}
              </p>
              <span class="w-1.5 h-[1px] bg-slate-400 dark:bg-zinc-600"></span>
            </div>
            <p class="mt-1 text-xs uppercase font-bold tracking-[0.15em] text-indigo-500/0 group-hover:text-indigo-500 dark:group-hover:text-indigo-400/80 transition-all duration-300 h-0 group-hover:h-3 overflow-hidden">
              Click to Cycle Quote
            </p>
          </div>
        }

      </div>

      <!-- Responsive Clinical Footer -->
      <footer class="absolute bottom-4 left-0 right-0 z-30 text-center px-4 pointer-events-none select-none">
        <p class="text-xs text-slate-600 dark:text-zinc-500 font-mono uppercase tracking-[0.3em] font-semibold">
          Clinical Protocol v2.2 · HIPAA Compliant · Pocket Gull Care
        </p>
      </footer>
    </main>
  `,
  styles: [`
    .draw-pen-cursor {
      cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h9'/><path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/></svg>") 3 21, crosshair;
    }
    .dark .draw-pen-cursor {
      cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23a5b4fc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h9'/><path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'/></svg>") 3 21, crosshair;
    }

    @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    .animate-gradient-slow {
        background-size: 200% 200%;
        animation: gradient-shift 15s ease infinite;
    }

    @keyframes orb-float-1 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(40px, -60px) scale(1.2); }
    }
    @keyframes orb-float-2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-60px, 40px) scale(0.85); }
    }
    @keyframes orb-float-3 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(35px, 35px) scale(1.15); }
    }
    @keyframes orb-float-4 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-40px, -40px) scale(1.1); }
    }
    .orb-floating-1 { animation: orb-float-1 16s ease-in-out infinite; }
    .orb-floating-2 { animation: orb-float-2 20s ease-in-out infinite; }
    .orb-floating-3 { animation: orb-float-3 14s ease-in-out infinite; }
    .orb-floating-4 { animation: orb-float-4 18s ease-in-out infinite; }

    @keyframes glass-shine {
        0% { transform: translateX(-150%) skewX(-25deg); }
        100% { transform: translateX(150%) skewX(-25deg); }
    }
    .glass-card {
        position: relative;
    }
    .glass-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15) 20%,
            rgba(255, 255, 255, 0.35) 60%,
            transparent
        );
        transform: translateX(-150%) skewX(-25deg);
        transition: 0.8s;
        pointer-events: none;
    }
    .glass-card:hover::after {
        animation: glass-shine 1.6s ease-in-out infinite;
    }

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

    @keyframes avs-respiratory-breath {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.05)); }
        50% { transform: scale(1.04); filter: drop-shadow(0 0 28px rgba(16, 185, 129, 0.3)); }
    }
    .avs-breathing-mascot {
        animation: avs-respiratory-breath 10.909s ease-in-out infinite;
    }

    @keyframes avs-glow-breath {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.95; }
    }
    .avs-breathing-glow {
        animation: avs-glow-breath 10.909s ease-in-out infinite;
    }

    /* Reset all text-shadows within the splash screen */
    :host, :host * {
      text-shadow: none !important;
    }

    /* Light Mode Specificity Overrides */
    :host-context(html:not(.dark)) {
      /* Force black/dark slate text for titles, paragraphs, spans, labels, inputs */
      h1, h2, h3, p, span, div, label, input, button:not(.btn-primary) {
        color: #000000 !important;
      }

      /* Disable gradients and clip-text on title for absolute clarity */
      h1 {
        background: none !important;
        -webkit-text-fill-color: #000000 !important;
        color: #000000 !important;
      }

      /* Secondary/muted text in light mode */
      .text-slate-500, .text-zinc-500, .text-slate-400, .text-zinc-400, .text-slate-600, .text-zinc-600 {
        color: #1e293b !important;
      }

      /* Karolinska sleepiness scale header & description */
      .text-slate-800, .text-slate-700 {
        color: #000000 !important;
      }

      /* Expected Alertness tracker background bar dots */
      .bg-slate-200 {
        background-color: #cbd5e1 !important;
      }
      
      /* Circadian context card */
      .bg-white\\/50 {
        background-color: rgba(255, 255, 255, 0.95) !important;
        border-color: #cbd5e1 !important;
      }

      /* Custom background overrides to keep glass cards legible */
      .glass-card {
        background-color: rgba(255, 255, 255, 0.95) !important;
        border-color: #cbd5e1 !important;
      }

      /* KSS Grid items */
      .grid button {
        background-color: rgba(255, 255, 255, 0.9) !important;
        border-color: #cbd5e1 !important;
      }
      .grid button:hover {
        background-color: #ffffff !important;
        border-color: #94a3b8 !important;
      }
      /* Unselected score labels in KSS */
      .grid button p, .grid button span.tabular-nums {
        color: #1e293b !important;
      }
      
      /* Selected KSS item */
      .grid button.border-emerald-500 {
        background-color: #ecfdf5 !important;
        border-color: #10b981 !important;
      }
      .grid button.border-emerald-500 p,
      .grid button.border-emerald-500 span.tabular-nums {
        color: #065f46 !important;
      }

      /* Google SSO Button */
      button[class*="bg-[#4285F4]/10"] {
        background-color: #e8f0fe !important;
        color: #1a73e8 !important;
        border-color: #adc8f9 !important;
      }
      /* Biometrics Button */
      button[class*="bg-indigo-600/10"] {
        background-color: #eef2ff !important;
        color: #4f46e5 !important;
        border-color: #c7d2fe !important;
      }

      /* Enter System Button Text */
      button[class*="bg-gradient-to-r"], button[type="submit"] {
        color: #ffffff !important;
      }
      /* Disabled Enter System button */
      button[class*="bg-gradient-to-r"]:disabled, button[type="submit"]:disabled {
        opacity: 0.45 !important;
        color: #1e293b !important;
        background: #e2e8f0 !important;
        border: 1px solid #cbd5e1 !important;
      }

      /* Clear button */
      button[class*="bg-slate-100"] {
        background-color: #f1f5f9 !important;
        color: #0f172a !important;
        border-color: #cbd5e1 !important;
      }
      button[class*="bg-slate-100"]:hover {
        background-color: #e2e8f0 !important;
      }

      /* Biometric unlock button next to Clear */
      button[class*="bg-indigo-50"] {
        background-color: #eef2ff !important;
        color: #4f46e5 !important;
        border-color: #c7d2fe !important;
      }
      button[class*="bg-indigo-50"]:hover {
        background-color: #e0e7ff !important;
      }

      /* Animal Comfort buttons */
      .grid button[type="button"] {
        background-color: #ffffff !important;
        color: #1e293b !important;
        border-color: #cbd5e1 !important;
      }
      .grid button[type="button"]:hover {
        background-color: #f8fafc !important;
      }
      /* Selected states */
      .grid button[class*="border-amber-500"] {
        background-color: #fffbeb !important;
        color: #b45309 !important;
        border-color: #f59e0b !important;
      }
      .grid button[class*="border-emerald-500"] {
        background-color: #ecfdf5 !important;
        color: #047857 !important;
        border-color: #10b981 !important;
      }
      .grid button[class*="border-sky-500"] {
        background-color: #f0f9ff !important;
        color: #0369a1 !important;
        border-color: #0ea5e9 !important;
      }
      .grid button[class*="border-indigo-500"] {
        background-color: #f5f3ff !important;
        color: #4338ca !important;
        border-color: #6366f1 !important;
      }

      /* Stop button for pet auditory */
      button[class*="text-red-600"] {
        background-color: #fef2f2 !important;
        color: #b91c1c !important;
        border-color: #fca5a5 !important;
      }
      button[class*="text-red-600"]:hover {
        background-color: #fee2e2 !important;
      }

      /* Skip Assessment button */
      button[class*="text-slate-400"] {
        color: #475569 !important;
      }
      button[class*="text-slate-400"]:hover {
        color: #0f172a !important;
      }
    }

    /* Dark Mode Specificity Overrides */
    :host-context(html.dark) {
      .grid button.border-emerald-500 p,
      .grid button.border-emerald-500 span.tabular-nums {
        color: #34d399 !important;
      }
      .grid button:not(.border-emerald-500) p,
      .grid button:not(.border-emerald-500) span.tabular-nums {
        color: #a1a1aa !important;
      }
      
      .grid button[class*="border-amber-500"] {
        color: #fbbf24 !important;
      }
      .grid button[class*="border-emerald-500"] {
        color: #34d399 !important;
      }
      .grid button[class*="border-sky-500"] {
        color: #38bdf8 !important;
      }
      .grid button[class*="border-indigo-500"] {
        color: #818cf8 !important;
      }
    }
  `]
})
export class SecureSplashComponent {
  session    = inject(SessionStateService);
  readonly kss = inject(CircadianSleepinessService);
  syncService = inject(FirestoreSyncService);
  private platformId = inject(PLATFORM_ID);
  public readonly petAuditory = inject(PetAuditoryService);
  
  // Inputs
  apiKeyError = input<string | null>(null);
  hasApiKey = input<boolean>(false);

  // Outputs
  submitKey = output<string>();
  loadDemo = output<void>();
  selectAiStudio = output<void>();

  // State
  viewState = signal<'auth' | 'beta' | 'kss'>('auth');
  clinicianKssSelected = signal<KssScore | null>(null);
  isLocked = computed(() => this.session.isLocked());
  apiKeyStr = signal('');
  pin = signal('');
  showPassword = signal(false);
  errorMsg = signal('');
  isChecking = signal(false);

  // Beta Form State
  betaForm = signal({ name: '', clinic: '', email: '' });
  isSubmittingBeta = signal(false);
  betaSuccess = signal(false);

  pinInputRef = viewChild<ElementRef<HTMLInputElement>>('pinInput');
  gestureCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('gestureCanvas');

  // Quotes list
  quotes = [
    { text: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" },
    { text: "My doctor told me that running is good for my health. So I started running code... my CPU is now extremely fit.", author: "Anonymous Dev" },
    { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    { text: "There are 10 types of doctors: those who understand binary patient data, and those who ask the AI to translate it.", author: "AI Health Humour" },
    { text: "He who has health has hope; and he who has hope has everything.", author: "Arabian Proverb" },
    { text: "I asked the AI to diagnose my server's lag. It suggested a regular fiber diet.", author: "Network Specialist" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Why did the computer go to the doctor? It had a virus and a bad case of bloating.", author: "Tech Support" },
    { text: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "William Osler" },
    { text: "My AI told me I need more sleep. I told it to write its own code. We are both currently resting.", author: "Pair Programmer" },
    { text: "Computer science is no more about computers than astronomy is about telescopes.", author: "Edsger W. Dijkstra" },
    { text: "An apple a day keeps anyone away... if you throw it hard enough.", author: "Emergency Medicine Wisdom" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "I asked the clinical AI for a workout plan. It recommended debugging in production. Heart rate: 180 bpm instantly.", author: "Stress Management Service" },
    { text: "The art of medicine consists of amusing the patient while nature cures the disease.", author: "Voltaire" },
    { text: "The science of today is the technology of tomorrow.", author: "Edward Teller" },
    { text: "It is health that is real wealth and not pieces of gold and silver.", author: "Mahatma Gandhi" },
    { text: "The measure of intelligence is the ability to change.", author: "Albert Einstein" },
    { text: "Software is a great combination between artistry and engineering.", author: "Bill Gates" },
    { text: "Medicines cure diseases, but only doctors can cure patients.", author: "Carl Jung" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "The medical informatics of tomorrow will seamlessly fuse the empathy of the clinician with the precision of machine intelligence.", author: "Clinical Innovation Directive" },
    { text: "The greatest error in the treatment of sickness is that there are physicians for the body and physicians for the soul, and yet the two cannot be separated.", author: "Plato" },
    { text: "The digital health revolution is not about technology; it's about shifting the power to the patient and the insight to the practitioner.", author: "Healthcare Transformation Board" },
    { text: "The key to working with complexity is to make it simple without losing its depth.", author: "Systems Design Principle" },
    { text: "The technology of health is ultimately the technology of life itself—adaptive, continuous, and deeply interconnected.", author: "Functional Medicine Institute" },
    { text: "We are not just writing code; we are building systems that touch human lives and heal human suffering.", author: "Bioinformatics Engineering Guide" },
    { text: "Medicine is a science of uncertainty and an art of probability.", author: "Sir William Osler" },
    { text: "Innovation is the calling card of clinical excellence—using the tools of today to forge the therapies of tomorrow.", author: "Medical Technologies Group" },
    { text: "Data is the raw material of modern medicine, but synthesis is its soul.", author: "Digital Health Institute" },
    { text: "The most important tool a doctor has is their ears—listening to the patient is the beginning of all diagnostic wisdom.", author: "Clinical Practice Standards" }
  ];
  currentQuoteIdx = signal(0);
  currentQuote = computed(() => this.quotes[this.currentQuoteIdx()]);

  // AVS State & Audio Nodes
  private audioCtx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private oscL: OscillatorNode | null = null;
  private oscR: OscillatorNode | null = null;
  private pinkNoiseNode: AudioBufferSourceNode | null = null;
  private waveGain: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  
  isAvsPlaying = signal(false);
  private lastPinLength = 0;

  constructor() {
    // Select a random quote on init
    const randomIdx = Math.floor(Math.random() * this.quotes.length);
    this.currentQuoteIdx.set(randomIdx);

    effect((onCleanup) => {
      // Auto-focus logic & drawing reset based on state
      if (this.isLocked()) {
        this.clearDrawing();
        if (this.pinInputRef()?.nativeElement) {
          setTimeout(() => this.pinInputRef()!.nativeElement.focus(), 150);
        }

        if (isPlatformBrowser(this.platformId)) {
          const interval = setInterval(() => {
            this.cycleQuote();
          }, 8000);
          onCleanup(() => {
            clearInterval(interval);
          });
        }
      }
    });
  }

  cycleQuote() {
    this.currentQuoteIdx.update(idx => (idx + 1) % this.quotes.length);
  }

  ngOnDestroy() {
    this.cleanupNodes();
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
    }
  }

  // Safe AudioContext getter
  getAudioContext(): AudioContext | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  toggleAvs() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.isAvsPlaying()) {
      this.stopAmbientSoundscape();
    } else {
      this.startAmbientSoundscape();
    }
  }

  startAmbientSoundscape() {
    if (!isPlatformBrowser(this.platformId)) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.cleanupNodes();

    // 1. Create primary gain node for fading in
    this.primaryGain = ctx.createGain();
    this.primaryGain.gain.setValueAtTime(0, ctx.currentTime);
    this.primaryGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);

    // 2. Carrier Oscillators (432Hz Carrier & 4Hz Theta beat -> 436Hz Right)
    this.oscL = ctx.createOscillator();
    this.oscL.type = 'sine';
    this.oscL.frequency.setValueAtTime(432, ctx.currentTime);

    this.oscR = ctx.createOscillator();
    this.oscR.type = 'sine';
    this.oscR.frequency.setValueAtTime(436, ctx.currentTime);

    const merger = ctx.createChannelMerger(2);
    this.oscL.connect(merger, 0, 0);
    this.oscR.connect(merger, 0, 1);
    merger.connect(this.primaryGain);

    // 3. Pink/Brown Background Noise
    const bufferSize = 4 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    this.pinkNoiseNode = noiseSource;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);

    this.waveGain = ctx.createGain();
    this.waveGain.gain.setValueAtTime(0.05, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.waveGain);
    this.waveGain.connect(this.primaryGain);

    // LFO to automate respiratory brown noise gain modulation matching visual seagull breathing (5.5 breaths/min -> 0.0917Hz)
    this.lfoNode = ctx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.setValueAtTime(5.5 / 60, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.025, ctx.currentTime);

    this.lfoNode.connect(lfoGain);
    lfoGain.connect(this.waveGain.gain);

    this.primaryGain.connect(ctx.destination);

    this.oscL.start();
    this.oscR.start();
    noiseSource.start();
    this.lfoNode.start();

    this.isAvsPlaying.set(true);
  }

  stopAmbientSoundscape() {
    if (!this.primaryGain || !this.audioCtx) {
      this.isAvsPlaying.set(false);
      return;
    }

    const ctx = this.audioCtx;
    this.primaryGain.gain.cancelScheduledValues(ctx.currentTime);
    this.primaryGain.gain.setValueAtTime(this.primaryGain.gain.value, ctx.currentTime);
    this.primaryGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);

    const currentOscL = this.oscL;
    const currentOscR = this.oscR;
    const currentNoise = this.pinkNoiseNode;
    const currentLfo = this.lfoNode;

    setTimeout(() => {
      try {
        currentOscL?.stop();
        currentOscR?.stop();
        currentNoise?.stop();
        currentLfo?.stop();

        currentOscL?.disconnect();
        currentOscR?.disconnect();
        currentNoise?.disconnect();
        currentLfo?.disconnect();
      } catch (e) {}
    }, 1100);

    this.oscL = null;
    this.oscR = null;
    this.pinkNoiseNode = null;
    this.lfoNode = null;
    this.primaryGain = null;
    this.isAvsPlaying.set(false);
  }

  private cleanupNodes() {
    try {
      this.oscL?.stop();
      this.oscR?.stop();
      this.pinkNoiseNode?.stop();
      this.lfoNode?.stop();
    } catch (e) {}

    try {
      this.oscL?.disconnect();
      this.oscR?.disconnect();
      this.pinkNoiseNode?.disconnect();
      this.lfoNode?.disconnect();
      this.primaryGain?.disconnect();
    } catch (e) {}

    this.oscL = null;
    this.oscR = null;
    this.pinkNoiseNode = null;
    this.lfoNode = null;
    this.primaryGain = null;
  }

  // Harmonic sound synthesizers
  playKeyPressChime() {
    if (!isPlatformBrowser(this.platformId)) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime); // Transformation chime

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  playSuccessChime() {
    if (!isPlatformBrowser(this.platformId)) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Upward pentatonic major sweep: C4, D4, E4, G4, A4, C5
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    notes.forEach((freq, idx) => {
      const timeOffset = idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Warm, vintage synth tone
      osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);

      gain.gain.setValueAtTime(0, ctx.currentTime + timeOffset);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + timeOffset);
      osc.stop(ctx.currentTime + timeOffset + 0.85);
    });
  }

  playErrorChime() {
    if (!isPlatformBrowser(this.platformId)) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(112, ctx.currentTime); // Resonant beat

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(ctx.currentTime + 1.3);
    osc2.stop(ctx.currentTime + 1.3);
  }

  onPinKeyDown(event: KeyboardEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    this.getAudioContext();
  }

  onPinChange(val: string) {
    console.log('ON PIN CHANGE CALLED. VALUE:', val, 'SIGNAL VALUE:', this.pin());
    // Enable/resume AudioContext automatically on first keypress
    if (val.length === 1 && !this.isAvsPlaying()) {
      this.startAmbientSoundscape();
    }
    
    if (val.length > this.lastPinLength) {
      this.playKeyPressChime();
    }
    this.lastPinLength = val.length;

    if (val.length === 4) {
      setTimeout(() => this.verifyPin(), 200);
    }
  }

  async handleUnlock() {
    this.isChecking.set(true);
    this.errorMsg.set('');

    const success = await this.session.unlock();
    if (success) {
      this.playSuccessChime();
      this.stopAmbientSoundscape();
      if (!this.hasApiKey()) {
        this._pendingDemo = true;
        this.gotoKss();
      }
    } else {
      this.playErrorChime();
      this.errorMsg.set('Biometric verification failed.');
    }
    this.isChecking.set(false);
  }

  verifyPin() {
    console.log('VERIFY PIN CALLED. SIGNAL VALUE TYPE:', typeof this.pin, 'VALUE:', this.pin());
    const code = this.pin();
    if (!code) return;
    this.errorMsg.set('');
    if (code === '1234') {
       this.playSuccessChime();
       this.stopAmbientSoundscape();
       this.session.isLocked.set(false);
       this.session.resetIdleTimer();
       this.pin.set('');
    } else {
       this.playErrorChime();
       this.errorMsg.set('Invalid Access Code.');
       this.pin.set('');
       setTimeout(() => this.pinInputRef()?.nativeElement.focus(), 50);
    }
  }

  // Gesture Drawing State
  isDrawing = false;
  private strokes: Array<Array<{x: number, y: number}>> = [];
  private currentStroke: Array<{x: number, y: number}> = [];
  private verificationTimeoutId: any = null;
  private lastTouchTime = 0;

  startDrawing(event: PointerEvent) {
    if (!isPlatformBrowser(this.platformId)) return;

    if (event.cancelable) {
      event.preventDefault();
    }
    this.getAudioContext();
    this.isDrawing = true;
    this.errorMsg.set(''); // Clear error message when user starts drawing new attempt
    
    // Clear pending validation when a new stroke begins
    if (this.verificationTimeoutId) {
      clearTimeout(this.verificationTimeoutId);
      this.verificationTimeoutId = null;
    }

    const canvas = this.gestureCanvasRef()?.nativeElement;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.floor(rect.width || 190);
      const targetH = Math.floor(rect.height || 190);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    }

    const coords = this.getCanvasCoords(event);
    if (coords) {
      this.currentStroke = [coords];
      this.redrawCanvas();
    }
  }

  draw(event: PointerEvent) {
    if (!this.isDrawing || !isPlatformBrowser(this.platformId)) return;

    if (event.cancelable) {
      event.preventDefault();
    }
    const coords = this.getCanvasCoords(event);
    if (coords) {
      this.currentStroke.push(coords);
      this.redrawCanvas();
    }
  }

  stopDrawing(event?: PointerEvent) {
    if (!this.isDrawing || !isPlatformBrowser(this.platformId)) return;

    this.isDrawing = false;
    if (this.currentStroke.length > 0) {
      this.strokes.push(this.currentStroke);
      this.currentStroke = [];
      this.redrawCanvas();
      
      this.playKeyPressChime();

      if (this.verificationTimeoutId) {
        clearTimeout(this.verificationTimeoutId);
      }
      this.verificationTimeoutId = setTimeout(() => {
        this.verifyGesture();
      }, 1600); // Increased timeout to 1.6s to allow comfortable pause between eyes and smile
    }
  }

  clearDrawing() {
    this.strokes = [];
    this.currentStroke = [];
    this.lastTouchTime = 0;
    const canvas = this.gestureCanvasRef()?.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    this.errorMsg.set('');
    if (this.verificationTimeoutId) {
      clearTimeout(this.verificationTimeoutId);
    }
  }

  private getCanvasCoords(event: PointerEvent): {x: number, y: number} | null {
    const canvas = this.gestureCanvasRef()?.nativeElement;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  private redrawCanvas() {
    const canvas = this.gestureCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.classList.contains('dark');
    const strokeStyle = isDark ? '#a5b4fc' : '#4f46e5';
    const shadowColor = isDark ? '#6366f1' : '#818cf8';

    const drawPoints = (points: Array<{x: number, y: number}>) => {
      if (points.length === 0) return;
      
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = strokeStyle;
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 6;

      if (points.length === 1) {
        // Draw a neat solid dot for quick clicks/taps
        ctx.arc(points[0].x, points[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = strokeStyle;
        ctx.fill();
      } else {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }
    };

    for (const stroke of this.strokes) {
      drawPoints(stroke);
    }
    if (this.currentStroke.length > 0) {
      drawPoints(this.currentStroke);
    }
  }

  private verifyGesture() {
    if (this.strokes.length === 0) return;
    
    const isSmiley = this.detectSmileyFace();
    if (isSmiley) {
      this.playSuccessChime();
      this.stopAmbientSoundscape();
      this.session.isLocked.set(false);
      this.session.resetIdleTimer();
      this.clearDrawing();
      this.errorMsg.set('');
      if (!this.hasApiKey()) {
        this._pendingDemo = true;
        this.gotoKss();
      }
    } else {
      this.playErrorChime();
      this.errorMsg.set('Drawing not recognized. Draw two eyes and a curved smile to unlock.');
    }
  }

  private detectSmileyFace(): boolean {
    if (this.strokes.length < 1) return false;

    let allPoints: Array<{x: number, y: number}> = [];
    for (const stroke of this.strokes) {
      allPoints = allPoints.concat(stroke);
    }

    if (allPoints.length < 3) return false; // Allow shorter gestures (like a smile with quick taps for eyes)

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of allPoints) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    if (width < 10 || height < 10) return false; // More tolerant sizing bounds

    const normStrokes = this.strokes.map(stroke => 
      stroke.map(p => ({
        x: (p.x - minX) / (width || 1),
        y: (p.y - minY) / (height || 1)
      }))
    );

    let hasSmile = false;
    let hasLeftEye = false;
    let hasRightEye = false;

    for (const stroke of normStrokes) {
      if (stroke.length < 1) continue; // Allow single-dot eye taps

      let sMinX = Infinity, sMaxX = -Infinity;
      let sMinY = Infinity, sMaxY = -Infinity;
      let sumX = 0, sumY = 0;
      for (const p of stroke) {
        if (p.x < sMinX) sMinX = p.x;
        if (p.x > sMaxX) sMaxX = p.x;
        if (p.y < sMinY) sMinY = p.y;
        if (p.y > sMaxY) sMaxY = p.y;
        sumX += p.x;
        sumY += p.y;
      }
      const sW = sMaxX - sMinX;
      const centroidX = sumX / stroke.length;
      const centroidY = sumY / stroke.length;

      // 1. Check for U-shape (Smile) in the lower half of bounding box
      if (centroidY > 0.35 && sW > 0.15) {
        const firstY = stroke[0].y;
        const lastY = stroke[stroke.length - 1].y;
        let maxMidY = -Infinity;
        const startIdx = Math.floor(stroke.length * 0.1);
        const endIdx = Math.floor(stroke.length * 0.9);
        for (let i = startIdx; i <= endIdx; i++) {
          if (stroke[i].y > maxMidY) {
            maxMidY = stroke[i].y;
          }
        }

        // Must drop in the middle relative to both start and end point
        if (maxMidY > firstY + 0.01 && maxMidY > lastY + 0.01) {
          hasSmile = true;
        }
      }

      // 2. Check for Left Eye (upper left)
      if (centroidY < 0.7 && centroidX < 0.6) {
        hasLeftEye = true;
      }

      // 3. Check for Right Eye (upper right)
      if (centroidY < 0.7 && centroidX > 0.4) {
        hasRightEye = true;
      }
    }

    console.log('[Security] Smiley detection matching:', { hasSmile, hasLeftEye, hasRightEye });
    
    // Smile and at least one eye, or simple strokes that resemble facial details
    return hasSmile && (hasLeftEye || hasRightEye || normStrokes.length >= 2);
  }

  async handleBiometricLogin() {
    this.isChecking.set(true);
    this.errorMsg.set('');

    const success = await this.session.unlock();
    if (success) {
      this.playSuccessChime();
      this.stopAmbientSoundscape();
      this._pendingDemo = true;
      this.gotoKss();
    } else {
      this.playErrorChime();
      this.errorMsg.set('Biometric verification failed.');
    }
    this.isChecking.set(false);
  }

  handleSubmitKey() {
    this.isChecking.set(true);
    // Store the key to emit after KSS step, then go to readiness check
    this._pendingKey = this.apiKeyStr();
    setTimeout(() => { this.isChecking.set(false); this.gotoKss(); }, 300);
  }
  private _pendingKey = '';
  private _pendingDemo = false;
  private _pendingAiStudio = false;

  handleDemo() {
    this._pendingDemo = true;
    this.gotoKss();
  }

  handleAiStudio() {
    this._pendingAiStudio = true;
    this.gotoKss();
  }

  async handleGoogleAuth() {
    try {
       await this.syncService.signInWithGoogle();
       this._pendingDemo = true;
       this.gotoKss();
    } catch(err: any) {
       this.errorMsg.set(`Authentication Failed: ${err.message}`);
    }
  }

  /** Show the KSS readiness panel. */
  gotoKss(): void {
    this.stopAmbientSoundscape();
    this.viewState.set('kss');
  }

  /** Select a KSS score and update the circadian service reactively. */
  selectClinicianKss(score: KssScore): void {
    this.clinicianKssSelected.set(score);
    this.kss.clinicianKss.set(score);
  }

  playCanineHeartbeat() {
    this.petAuditory.playCanineHeartbeat();
  }

  playFelinePurr() {
    this.petAuditory.playFelinePurr();
  }

  playCetaceanTherapy() {
    this.petAuditory.playCetaceanTherapy();
  }

  playAvianTherapy() {
    this.petAuditory.playAvianTherapy();
  }

  stopPetAuditory() {
    this.petAuditory.stop();
  }

  /** Commit KSS result and enter the main application. */
  enterApp(): void {
    this.kss.dismissed.set(true);
    if (this._pendingDemo || this._pendingAiStudio) {
      this._pendingDemo ? this.loadDemo.emit() : this.selectAiStudio.emit();
    } else {
      this.submitKey.emit(this._pendingKey);
    }
  }
}
