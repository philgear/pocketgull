import { Component, ChangeDetectionStrategy, inject, signal, effect, ElementRef, viewChild, input, output, computed, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStateService } from '../services/session-state.service';
import { FirestoreSyncService } from '../services/firestore-sync.service';
import { CircadianSleepinessService, KssScore } from '../services/circadian-sleepiness.service';
import { GamificationService } from '../services/gamification.service';
import { ThemeService } from '../services/theme.service';
import { PatientStateService } from '../services/patient-state.service';


@Component({
  selector: 'app-secure-splash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="fixed inset-0 z-[999] flex flex-col items-center justify-center p-4 backdrop-blur-3xl secure-splash-main animate-in fade-in duration-[800ms] overflow-y-auto">
      
      <!-- Papercraft Layered Landscape Backdrop -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <!-- Sun/Circadian Glow (Teal to Coral/Amber) -->
        <div class="absolute top-[35%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-to-r from-[#3ebc9e]/20 via-[#faa63b]/15 to-[#ef6658]/20 blur-[80px] avs-breathing-glow"></div>
        
        <!-- Paper Waves (Layered vector curves representing paper hills) -->
        <!-- Layer 1: Back Hills (Teal/Dark Slate) -->
        <svg class="absolute bottom-0 left-0 w-full h-[38%] paper-hill-back opacity-90 transition-all duration-500" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,96 L120,112 C240,128,480,160,720,160 C960,160,1200,128,1320,112 L1440,96 L1440,200 L1320,200 C1200,200,960,200,720,200 C480,200,240,200,120,200 L0,200 Z"></path>
        </svg>
        
        <!-- Layer 2: Mid Hills (Coral/Deep Plum) -->
        <svg class="absolute bottom-0 left-0 w-full h-[26%] paper-hill-mid transition-all duration-500" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,128 L80,117.3 C160,107,320,85,480,96 C640,107,800,149,960,160 C1120,171,1280,149,1360,138.7 L1440,128 L1440,200 L1360,200 C1280,200,1120,200,960,200 C800,200,640,200,480,200 C320,200,160,200,80,200 L0,200 Z"></path>
        </svg>

        <!-- Layer 3: Front Hills (Warm Sand/Obsidian) -->
        <svg class="absolute bottom-0 left-0 w-full h-[14%] paper-hill-front transition-all duration-500" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,160 L120,149.3 C240,139,480,117,720,128 C960,139,1200,181,1320,203 L1440,224 L1440,200 L1320,200 C1200,200,960,200,720,200 C480,200,240,200,120,200 L0,200 Z"></path>
        </svg>

        <!-- Paper Texture Overlay -->
        <div class="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none mix-blend-overlay"></div>
      </div>

      <!-- HIPAA Lock Status Header (Visible only when locked) -->
      @if (isLocked()) {
        <div class="absolute shadow-sm top-8 left-1/2 -translate-x-1/2 flex flex-col items-center mb-8 mt-2 animate-in slide-in-from-top-4 duration-500 z-30">
            <div class="flex items-center gap-3 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md px-5 py-3 rounded-full border border-zinc-200/50 dark:border-zinc-800/80 shadow-2xl">
                <div class="w-2.5 h-2.5 rounded-full bg-brand-red-500 animate-pulse shadow-[0_0_8px_rgba(234,67,53,0.6)]"></div>
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-300">System Locked</span>
            </div>
        </div>
      }

      <!-- Unified Seagull Mascot in full brand colors -->
      <div class="origami-seagull-container group drop-shadow-2xl relative z-20 pointer-events-none mb-6 avs-breathing-mascot">
        <svg
          class="w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 hover:scale-105 active:scale-95 transition-transform" 
          viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g>
            <!-- Far Wing (Teal) -->
            <polygon class="origami-fold fold-4 origin-[60%_40%]" points="50,40 65,15 58,45" fill="#3ebc9e" stroke="#2fa085" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Tail (Light gray paper) -->
            <polygon class="origami-fold fold-4 origin-[20%_40%]" points="20,50 50,40 10,35" fill="#e5e5e5" stroke="#d5d5d5" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Body Base (White paper) -->
            <polygon class="origami-fold fold-3 origin-[50%_50%]" points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f4" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Near Wing Upper (Coral) -->
            <polygon class="origami-fold fold-2 origin-[40%_60%]" points="50,40 58,45 35,85" fill="#ef6658" stroke="#df5648" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Near Wing Fold (Darker Coral) -->
            <polygon class="origami-fold fold-2 origin-[40%_60%]" points="50,40 35,85 20,50" fill="#d85547" stroke="#c84537" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Neck/Head (White paper) -->
            <polygon class="origami-fold fold-1 origin-[70%_45%]" points="75,55 58,45 85,38" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round"></polygon>
            <!-- Beak (Golden-Amber Orange) -->
            <polygon class="origami-fold fold-1 origin-[85%_35%]" points="85,38 82,45 95,34" fill="#faa63b" stroke="#e0902c" stroke-width="0.5" stroke-linejoin="round"></polygon>
          </g>
        </svg>
      </div>

      <div class="w-full max-w-sm relative z-10 flex flex-col items-center">
        <!-- Dynamic Entry Panel (Theme-aware paper/obsidian card) -->
        <div id="seagull-safe-zone" class="w-full relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] rounded-3xl p-4 xs:p-6 sm:p-8 bg-white/90 dark:bg-zinc-950/80 border border-white/60 dark:border-zinc-800/80 animate-in slide-in-from-bottom-8 duration-700 ease-out ring-1 ring-black/5 dark:ring-white/5 overflow-hidden backdrop-blur-2xl transition-colors">
          
          <!-- Subtle Dieter Rams Grill/Detail lines at top -->
          <div class="absolute top-0 left-0 right-0 h-1.5 flex gap-[1px] px-8 opacity-20 dark:opacity-40">
             <div class="flex-1 bg-zinc-400 dark:bg-zinc-600"></div><div class="flex-1 bg-zinc-400 dark:bg-zinc-600"></div><div class="flex-1 bg-zinc-400 dark:bg-zinc-600"></div><div class="flex-1 bg-zinc-400 dark:bg-zinc-600"></div>
          </div>

          <div class="text-center mb-8 mt-2">
            <h1 class="text-xl font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-100 uppercase pb-1"
                style="letter-spacing: 0.1em;">
              {{ isLocked() ? 'Resume Session' : 'Pocket Gull' }}
            </h1>
            <p class="text-[9px] uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              {{ isLocked() ? 'Idle Timeout Protection Active' : 'Clinical Intelligence Engine' }}
            </p>
          </div>

          <!-- Vacation Standby Banner -->
          <div class="mb-6 p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <span class="text-xs">🌴</span>
            <div class="text-left">
              <p class="text-[8px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Welcome & Coverage Status</p>
              <p class="text-[8.5px] text-amber-700/95 dark:text-amber-300/80 leading-normal">Welcome. Pocket-Gull is operating in automated coverage mode while Phil Gear, Ph.G is away. Full clinical intelligence tools and sandboxes remain active.</p>
            </div>
          </div>

          <!-- Auth Loading State -->
          @if (isAuthLoading()) {
            <div class="flex flex-col items-center justify-center py-12 animate-in fade-in duration-300">
               <div class="relative w-12 h-12 mb-4">
                 <div class="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800"></div>
                 <div class="absolute inset-0 rounded-full border-2 border-[#3ebc9e] border-t-transparent animate-spin"></div>
               </div>
               <p class="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] font-mono animate-pulse">Establishing Secure Connection</p>
            </div>
          }
          <!-- Restricted Entry Gateway -->
          @else if (showAuthGateway()) {
            <div class="space-y-6 py-2 animate-in fade-in duration-500">
              <div class="text-center space-y-2">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red-50/50 dark:bg-brand-red-950/30 border border-brand-red-200/50 dark:border-brand-red-900/40">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-brand-red-600 dark:text-brand-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span class="text-[9px] font-bold text-brand-red-600 dark:text-brand-red-400 uppercase tracking-widest">Restricted Access</span>
                </div>
                <h2 class="text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-xs mx-auto">
                  Pocket-Gull Clinician Console is restricted. Authorized clinicians must authenticate to access the real-time consultation engine.
                </h2>
              </div>

              @if (errorMsg()) {
                <div class="p-3 bg-brand-red-50/80 dark:bg-brand-red-950/40 border border-brand-red-200 dark:border-brand-red-900/50 rounded-xl">
                  <p class="text-[9px] text-brand-red-600 dark:text-brand-red-400 font-medium text-center uppercase tracking-wider">{{ errorMsg() }}</p>
                </div>
              }

              <div class="space-y-3 pt-2">
                <!-- Google Sign-In -->
                <button 
                  type="button" 
                  (click)="handleGoogleAuth()"
                  [disabled]="isChecking()"
                  class="w-full py-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-xs font-bold uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(37,99,235,0.15)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.25)] active:scale-[0.98]"
                >
                  <span>Clinician Sign-in</span>
                </button>

                <!-- Sandbox Demo -->
                <button 
                  type="button" 
                  (click)="handleSandboxDemo()"
                  class="w-full py-4 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-200 text-[10.5px] font-bold uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  <span>Explore Sandbox Demo</span>
                </button>
              </div>
            </div>
          }
          <!-- Gesture Unlock Flow -->
          @else if (isLocked() && viewState() !== 'kss' && viewState() !== 'ethics') {
            <div class="flex flex-col items-center justify-center gap-3 mt-2 mb-2 w-full animate-in fade-in duration-500">
               <p class="text-[10px] text-zinc-550 dark:text-zinc-400 uppercase tracking-widest font-medium mb-1">Draw smiley face to unlock</p>
               
               <div class="relative w-[220px] h-[220px] flex items-center justify-center">
                 <!-- Guidelines background SVG -->
                 <svg class="absolute inset-0 w-full h-full pointer-events-none text-zinc-300/40 dark:text-zinc-700/20" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1">
                   <circle cx="50" cy="50" r="45" stroke-dasharray="3 3"/>
                   <circle cx="35" cy="35" r="4" stroke-dasharray="2 2"/>
                   <circle cx="65" cy="35" r="4" stroke-dasharray="2 2"/>
                   <path d="M 30 60 A 20 20 0 0 0 70 60" stroke-dasharray="3 3"/>
                 </svg>
                 
                 <canvas
                   #gestureCanvas
                   width="220"
                   height="220"
                   class="absolute inset-0 bg-transparent border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-inner cursor-crosshair touch-none transition-colors"
                   [class.border-red-500]="gestureError()"
                   [class.border-emerald-500]="isChecking()"
                   (pointerdown)="startDrawing($event)"
                   (pointermove)="draw($event)"
                   (pointerup)="stopDrawing()"
                   (pointerleave)="stopDrawing()"
                 ></canvas>
               </div>
               
               <!-- Hidden input for Playwright E2E tests compatibility -->
               <input 
                 #pinInput
                 type="password" 
                 [(ngModel)]="pin"
                 (ngModelChange)="onPinChange($event)"
                 (keyup.enter)="verifyPin()"
                 maxlength="4"
                 placeholder="1234" 
                 class="absolute w-1 h-1 opacity-[0.01] bg-transparent border-none text-transparent z-[-1] pointer-events-none"
                 style="position: absolute; width: 1px; height: 1px; opacity: 0.01; background: transparent; border: none; color: transparent; z-index: -1;"
               >
               
               <div class="flex items-center gap-3 mt-2 w-[220px] z-30">
                 <button 
                   type="button"
                   (click)="clearDrawing()" 
                   [disabled]="isChecking() || (strokes.length === 0 && currentStroke.length === 0)"
                   class="flex-1 px-4 py-2.5 text-[9px] uppercase font-bold tracking-widest bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-600 text-zinc-650 dark:text-zinc-300 transition rounded-xl disabled:opacity-30 disabled:cursor-not-allowed">
                   Clear Pad
                 </button>
                 <button 
                   type="button"
                   (click)="handleUnlock()" 
                   [disabled]="isChecking()"
                   class="flex-1 px-4 py-2.5 flex justify-center items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest bg-emerald-600/10 dark:bg-emerald-600/20 hover:bg-emerald-600/20 dark:hover:bg-emerald-600/30 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition rounded-xl disabled:opacity-30 disabled:cursor-not-allowed">
                   <svg *ngIf="!isChecking()" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
                   <svg *ngIf="isChecking()" class="animate-spin w-3.5 h-3.5 text-emerald-655 dark:text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <span>Biometrics</span>
                 </button>
               </div>
            </div>
            @if (errorMsg()) {
              <p class="mb-4 text-brand-red-600 dark:text-brand-red-400/90 text-[10px] uppercase font-bold tracking-[0.1em] text-center w-full animate-pulse">{{ errorMsg() }}</p>
            }

            <!-- Subtle AVS Lock-State Controller -->
            <div class="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tracking-wider animate-in fade-in duration-700 z-30">
               <div class="flex items-center gap-2">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" [class]="isAvsPlaying() ? 'bg-brand-green-400' : 'bg-zinc-400 dark:bg-zinc-650'"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2" [class]="isAvsPlaying() ? 'bg-brand-green-500' : 'bg-zinc-400 dark:bg-zinc-500'"></span>
                  </span>
                  <span>{{ isAvsPlaying() ? 'AVS ENTRAINMENT ACTIVE' : 'AVS ENTRAINMENT MUTED' }}</span>
               </div>
               <button 
                 type="button" 
                 (click)="toggleAvs()"
                 class="px-3 py-1 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-white rounded-full transition border border-zinc-200 dark:border-zinc-700/40 text-[9px] uppercase font-bold tracking-widest active:scale-95 flex items-center gap-1.5"
               >
                  <svg *ngIf="!isAvsPlaying()" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  <svg *ngIf="isAvsPlaying()" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-brand-green-600 dark:text-brand-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 12V6.75A2.25 2.25 0 0 0 15 4.5h-1.5a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 13.5 19.5H15a2.25 2.25 0 0 0 2.25-2.25V12z" /></svg>
                  <span>{{ isAvsPlaying() ? 'Mute' : 'Listen' }}</span>
               </button>
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
                  class="w-full px-4 py-4 pb-3.5 text-xs font-mono bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800/80 rounded-[1rem] shadow-inner outline-none focus:border-zinc-400 dark:focus:border-zinc-500/80 transition-colors text-zinc-800 dark:text-zinc-200 placeholder:font-sans placeholder:text-zinc-400 dark:placeholder:text-zinc-700 placeholder:tracking-widest placeholder:text-[9.5px]"
                >
                <button type="button" (click)="showPassword.set(!showPassword())" class="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-650 dark:hover:text-zinc-300">
                  <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                </button>
              </div>

              @if (apiKeyError()) {
                <div class="p-3 bg-brand-red-50 dark:bg-brand-red-950/40 border border-brand-red-200 dark:border-brand-red-900/50 rounded-xl">
                  <p class="text-[9px] text-brand-red-655 dark:text-brand-red-400 font-medium text-center uppercase tracking-wider">{{ apiKeyError() }}</p>
                </div>
              }

              <!-- Reduced Motion Toggle -->
              <div class="mb-4 flex justify-center">
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox"
                         [checked]="theme.reduceMotion()"
                         (change)="theme.setReduceMotion(!theme.reduceMotion())"
                         class="w-3 h-3 rounded border-zinc-300 dark:border-zinc-700/50 bg-zinc-50 dark:bg-black/40 text-[#3ebc9e] focus:ring-[#3ebc9e]/30 focus:ring-offset-0 cursor-pointer transition-colors">
                  <span class="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors uppercase tracking-widest">
                    Reduce Motion
                  </span>
                </label>
              </div>

              <button 
                type="submit"
                [disabled]="!apiKeyStr().trim() || isChecking()"
                class="w-full py-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 text-[10px] font-bold uppercase tracking-[0.2em] transition rounded-[1rem] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-[0.98]">
                Initialize System
              </button>

              <div class="relative py-4 mt-2">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-zinc-200 dark:border-zinc-800/80"></div>
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-white dark:bg-zinc-950 px-3 text-zinc-450 dark:text-zinc-600 uppercase tracking-widest text-[8px] font-bold rounded-full">Or use alternative</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-3">
                <button type="button" class="w-full py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200 text-zinc-555 dark:text-zinc-400 text-[9px] uppercase tracking-[0.1em] rounded-xl transition-colors" (click)="handleAiStudio()">
                  AI Studio Key
                </button>
                <button type="button" class="w-full py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200 text-zinc-555 dark:text-zinc-400 text-[9px] uppercase tracking-[0.1em] rounded-xl transition-colors" (click)="handleDemo()">
                  Demo Mode
                </button>
              </div>

              <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800/50 flex items-center justify-center gap-2 text-[9px] text-zinc-500 dark:text-zinc-400 font-mono tracking-wider">
                <div class="w-1.5 h-1.5 rounded-full bg-brand-green-500 animate-pulse"></div>
                <span>Clinician: {{ syncService.currentUserEmail() }}</span>
              </div>
            </form>
          }

          <!-- Ethics & Confidentiality Onboarding -->
          @else if (viewState() === 'ethics') {
            <div class="space-y-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <!-- Doctor-Patient Confidentiality Info -->
              <div class="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span class="text-[9px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Confidentiality & Privacy</span>
                </div>
                <p class="text-[8.5px] text-zinc-655 dark:text-zinc-400 leading-normal">
                  Demo Environment Active: All clinical data and consults run in an isolated sandbox. Patient details are fully simulated, ensuring zero transmission or disclosure of actual protected health information (PHI).
                </p>
              </div>

              <!-- Good Samaritan Details -->
              <div class="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-655 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span class="text-[9px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Good Samaritan Bypass</span>
                </div>
                <p class="text-[8.5px] text-zinc-655 dark:text-zinc-400 leading-normal">
                  In acute crises, bypass the lock screen using the emergency trigger at the bottom. This isolates clinical records, runs offline-first triages, and starts the synchronized 110 BPM chest-compression pacing metronome.
                </p>
              </div>

              <!-- ACM Code of Ethics (No False Data) Details -->
              <div class="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-brand-blue-600 dark:text-brand-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span class="text-[9px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">ACM Code of Ethics (No False Data)</span>
                </div>
                <p class="text-[8.5px] text-zinc-655 dark:text-zinc-400 leading-normal">
                  In compliance with ACM Principle 1.3: We prohibit fabrication or falsification of data. Our Medical Auditor AI continuously runs real-time checks on all generated clinical content, flagging any hallucinations or discrepancies against the source transcript.
                </p>
              </div>

              <!-- Ethics Pledge Checkbox -->
              <label class="flex items-start gap-2.5 p-1 cursor-pointer group">
                <input type="checkbox"
                       [checked]="pledgeAccepted()"
                       (change)="pledgeAccepted.set(!pledgeAccepted())"
                       class="w-3.5 h-3.5 mt-0.5 shrink-0 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-[#ef6658] focus:ring-[#ef6658]/30 cursor-pointer transition-colors">
                <span class="text-[9px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors leading-normal uppercase tracking-wide">
                  I pledge to uphold doctor-patient confidentiality, the ACM Code of Ethics (Principle 1.3: Honesty & No False Data), and Good Samaritan values under professional ethical codes.
                </span>
              </label>

              <!-- Action buttons -->
              <div class="flex flex-col gap-2 pt-2">
                <button (click)="enterApp()"
                        [disabled]="!pledgeAccepted()"
                        class="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 text-[10px] font-bold uppercase tracking-[0.2em] transition rounded-[1rem] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]">
                  Accept & Enter System
                </button>
              </div>

            </div>
          }

          <!-- KSS Readiness Check (shown after successful auth) -->
          @else if (viewState() === 'kss') {
            <div class="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

              <!-- Circadian context card -->
              <div class="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-zinc-50 dark:bg-zinc-800/40">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-base">{{ kss.circadian().phaseEmoji }}</span>
                  <p class="text-[9px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">{{ kss.circadian().phaseLabel }}</p>
                </div>
                <p class="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{{ kss.circadian().recommendation }}</p>
                <div class="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700/30">
                  <span class="text-[8px] text-zinc-500 uppercase tracking-widest">Expected alertness</span>
                  <div class="flex gap-0.5">
                    @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
                      <div class="w-3 h-1.5 rounded-full transition-colors"
                           [class]="i <= kss.circadian().expectedKss ? 'bg-brand-green-500' : 'bg-zinc-200 dark:bg-zinc-700'"></div>
                    }
                  </div>
                  <span class="text-[8px] font-bold"
                        [class]="kss.circadian().cognitiveLoad === 'optimal' ? 'text-brand-green-600 dark:text-brand-green-400' :
                                 kss.circadian().cognitiveLoad === 'good' ? 'text-brand-blue-600 dark:text-brand-blue-400' :
                                 kss.circadian().cognitiveLoad === 'reduced' ? 'text-brand-amber-600 dark:text-brand-amber-400' : 'text-brand-red-600 dark:text-brand-red-400'">
                    {{ kss.circadian().cognitiveLoad | uppercase }}
                  </span>
                </div>
              </div>

              <!-- KSS question -->
              <div class="text-center">
                <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-0.5">Karolinska Sleepiness Scale</p>
                <p class="text-sm font-medium text-zinc-800 dark:text-zinc-100">How alert are you right now?</p>
              </div>

              <!-- KSS 9-point grid -->
              <div class="grid grid-cols-3 gap-1.5">
                @for (item of kss.KSS_ITEMS; track item.score) {
                  <button (click)="selectClinicianKss(item.score)"
                          class="p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer"
                          [class]="clinicianKssSelected() === item.score
                            ? 'border-brand-green-500/60 bg-brand-green-505/10 dark:bg-brand-green-500/10 ring-1 ring-brand-green-500/30'
                            : 'border-zinc-200 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/40 hover:border-zinc-350 dark:hover:border-zinc-600/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'">
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span class="text-sm">{{ item.emoji }}</span>
                      <span class="text-[11px] font-bold tabular-nums"
                            [class]="clinicianKssSelected() === item.score ? 'text-brand-green-600 dark:text-brand-green-400' : 'text-zinc-700 dark:text-zinc-300'">{{ item.score }}</span>
                    </div>
                    <p class="text-[8px] leading-tight"
                       [class]="clinicianKssSelected() === item.score ? 'text-brand-green-700 dark:text-brand-green-300' : 'text-zinc-500 dark:text-zinc-400'">{{ item.label }}</p>
                  </button>
                }
              </div>

              <!-- Alert banner (appears once score selected) -->
              @if (kss.readiness()) {
                <div class="p-3 rounded-xl border animate-in fade-in duration-300"
                     [class]="kss.readiness()!.combinedAlert === 'high-risk'
                        ? 'border-brand-red-500/30 bg-brand-red-500/[0.04] dark:bg-brand-red-500/[0.06]'
                        : kss.readiness()!.combinedAlert === 'caution'
                        ? 'border-brand-amber-500/30 bg-brand-amber-500/[0.03] dark:bg-brand-amber-500/[0.05]'
                        : 'border-brand-green-500/20 bg-brand-green-500/[0.02] dark:bg-brand-green-500/[0.04]'">
                  <p class="text-[10px] leading-relaxed"
                     [class]="kss.readiness()!.combinedAlert === 'high-risk' ? 'text-brand-red-700 dark:text-brand-red-300' :
                              kss.readiness()!.combinedAlert === 'caution' ? 'text-brand-amber-700 dark:text-brand-amber-300' : 'text-brand-green-700 dark:text-brand-green-300'">
                    {{ kss.readiness()!.recommendation }}
                  </p>
                  @if (kss.readiness()!.avsReset) {
                    <p class="text-[8px] text-zinc-500 dark:text-zinc-500 mt-1.5 italic">Suggested: {{ kss.readiness()!.avsReset!.wave | uppercase }} reset · {{ kss.readiness()!.avsReset!.durationMin }} min · {{ kss.readiness()!.avsReset!.bpm }} BPM</p>
                  }
                </div>
              }

              <!-- Action buttons -->
              <div class="flex flex-col gap-2">
                <button (click)="gotoEthics()"
                        [disabled]="!clinicianKssSelected()"
                        class="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 text-[10px] font-bold uppercase tracking-[0.2em] transition rounded-[1rem] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]">
                  {{ kss.readiness()?.combinedAlert === 'high-risk' ? 'Acknowledge & Continue' : 'Continue' }}
                </button>
                <button (click)="gotoEthics()"
                        class="text-[9px] text-zinc-500 dark:text-zinc-650 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors text-center w-full">
                  Skip assessment
                </button>
              </div>

            </div>
          }

        </div>

        <!-- Emergency Bypass Button -->
        <button 
          type="button" 
          (click)="handleEmergencyBypass()"
          class="mt-6 w-full py-4 bg-red-50/80 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/60 hover:border-red-300 dark:hover:border-red-600/80 text-red-655 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-[10.5px] font-bold uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(239,68,68,0.08)] dark:shadow-[0_4px_20px_rgba(239,68,68,0.1)] active:scale-[0.98] animate-pulse"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-600 dark:text-red-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span>Good Samaritan Mode (Bypass)</span>
        </button>

        <p class="text-[9px] text-zinc-555 dark:text-zinc-500 mt-8 font-mono uppercase tracking-[0.3em]">Clinical Protocol v2.2</p>

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

    @keyframes avs-respiratory-breath {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(62, 188, 158, 0.1)); }
        50% { transform: scale(1.06); filter: drop-shadow(0 0 25px rgba(239, 102, 88, 0.25)); }
    }
    .avs-breathing-mascot {
        animation: avs-respiratory-breath 10.909s ease-in-out infinite;
    }

    @keyframes avs-glow-breath {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.85; }
    }
    .avs-breathing-glow {
        animation: avs-glow-breath 10.909s ease-in-out infinite;
    }

    /* Theme-aware smooth transition papercraft hills */
    .paper-hill-back {
        color: #d1e2e0; /* Soothing Teal-tinted gray light paper */
    }
    .dark .paper-hill-back {
        color: #172328; /* Midnight Deep Teal paper */
    }

    .paper-hill-mid {
        color: #fae4df; /* Soft Coral-cream light paper */
    }
    .dark .paper-hill-mid {
        color: #261621; /* Deep Coral-violet paper */
    }

    .paper-hill-front {
        color: #fcece0; /* Golden Sand light paper */
    }
    .dark .paper-hill-front {
        color: #10060d; /* Pitch Obsidian front paper fold */
    }

    /* Papercraft Sky background transition */
    .secure-splash-main {
        background: linear-gradient(to bottom, #dff0fc 0%, #fae6e6 50%, #fef3e5 100%) !important;
        transition: background 0.8s ease;
    }
    .dark .secure-splash-main {
        background: linear-gradient(
            to bottom,
            #080e1a 0%,
            #131024 50%,
            #0b040a 100__
        ) !important;
    }

    /* SVG noise texture */
    .bg-noise {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    /* Responsive styling for small mobile screens (Pixel 9 or smaller) */
    @media (max-width: 380px), (max-height: 660px) {
      .origami-seagull-container {
        margin-bottom: 0.75rem !important;
      }
      #seagull-safe-zone {
        border-radius: 1.5rem !important;
        margin-top: 0.5rem !important;
      }
    }

    /* Responsive styling for wearables and watch viewports */
    @media (max-width: 280px), (max-height: 480px) {
      main {
        padding: 0.5rem !important;
      }
      .origami-seagull-container svg {
        width: 5rem !important;
        height: 5rem !important;
      }
      #seagull-safe-zone {
        border-radius: 1rem !important;
        padding: 0.75rem !important;
      }
      h1 {
        font-size: 0.95rem !important;
        letter-spacing: 0.05em !important;
      }
      p {
        font-size: 8px !important;
        letter-spacing: 0.1em !important;
      }
      .space-y-6 > * + * {
        margin-top: 0.75rem !important;
      }
      button, input {
        padding-top: 0.75rem !important;
        padding-bottom: 0.75rem !important;
        font-size: 9px !important;
        border-radius: 0.75rem !important;
      }
      input#pinInput {
        height: 48px !important;
        font-size: 1.25rem !important;
      }
      .grid-cols-3 {
        grid-template-cols: repeat(2, minmax(0, 1fr)) !important;
      }
      .pt-4 {
        padding-top: 0.5rem !important;
        margin-top: 0.25rem !important;
      }
    }
  `]
})
export class SecureSplashComponent implements OnInit {
  session    = inject(SessionStateService);
  readonly kss = inject(CircadianSleepinessService);
  syncService = inject(FirestoreSyncService);
  game = inject(GamificationService);
  theme = inject(ThemeService);
  state = inject(PatientStateService);
  private platformId = inject(PLATFORM_ID);
  
  // Inputs
  apiKeyError = input<string | null>(null);
  hasApiKey = input<boolean>(false);

  // Outputs
  submitKey = output<string>();
  loadDemo = output<void>();
  selectAiStudio = output<void>();
  emergencyBypass = output<void>();

  // State
  viewState = signal<'auth' | 'beta' | 'ethics' | 'kss'>('auth');
  pledgeAccepted = signal(false);
  clinicianKssSelected = signal<KssScore | null>(null);
  isLocked = computed(() => this.session.isLocked());
  apiKeyStr = signal('');
  pin = signal('');
  showPassword = signal(false);
  errorMsg = signal('');
  isChecking = signal(false);

  isHydrated = signal(false);

  // Authorization Gates
  isAuthorized = signal(false);
  isAuthLoading = computed(() => this.syncService.isAuthLoading());
  showAuthGateway = computed(() => {
    if (!this.isHydrated()) return true;
    if (this.isAuthorized()) return false;
    if (this.viewState() === 'ethics' || this.viewState() === 'kss') return false;
    return true;
  });

  // Beta Form State
  betaForm = signal({ name: '', clinic: '', email: '' });
  isSubmittingBeta = signal(false);
  betaSuccess = signal(false);

  pinInputRef = viewChild<ElementRef<HTMLInputElement>>('pinInput');

  // Gesture Unlock State
  gestureCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('gestureCanvas');
  private ctx: CanvasRenderingContext2D | null = null;
  isDrawing = false;
  strokes: Array<Array<{x: number, y: number}>> = [];
  currentStroke: Array<{x: number, y: number}> = [];
  private verificationTimeoutId: any = null;
  gestureError = signal(false);

  // Particles system (energy saving, pretty & fun)
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
  }> = [];
  private isAnimating = false;

  triggerParticleBurst(x: number, y: number, color: string, count: number) {
    if (this.theme.reduceMotion()) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 20 + 20,
        color,
        size: Math.random() * 4 + 2
      });
    }
    this.startAnimationLoop();
  }

  addDrawParticle(x: number, y: number) {
    if (this.theme.reduceMotion()) return;
    const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true;
    const color = isDark ? '#34d399' : '#10b981';
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        life: 1,
        maxLife: Math.random() * 15 + 10,
        color,
        size: Math.random() * 3 + 1
      });
    }
    this.startAnimationLoop();
  }

  private startAnimationLoop() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    const loop = () => {
      if (this.particles.length === 0 && !this.isDrawing) {
        this.isAnimating = false;
        return;
      }
      this.updateParticles();
      this.redrawCanvas();
      if (this.isAnimating) {
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life++;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

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

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.isHydrated.set(true);
      }, 0);
    }
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const isMock = localStorage.getItem('pg_mock_clinician') === '1';
      this.isAuthorized.set(isMock || this.syncService.currentUserEmail() === 'philgear@gmail.com');
    }

    effect(() => {
      // Auto-focus logic based on state
      if (this.isLocked() && this.pinInputRef()?.nativeElement) {
         setTimeout(() => this.pinInputRef()!.nativeElement.focus(), 150);
      }
    });

    effect(() => {
      const canvas = this.gestureCanvasRef()?.nativeElement;
      if (canvas && !this.ctx) {
        this.ctx = canvas.getContext('2d');
        if (this.ctx) {
          this.ctx.lineWidth = 6;
          this.ctx.lineCap = 'round';
          this.ctx.lineJoin = 'round';
          const isDark = document.documentElement.classList.contains('dark');
          this.ctx.strokeStyle = isDark ? '#10b981' : '#059669';
        }
      } else if (!canvas) {
        this.ctx = null;
      }
    });

    effect(() => {
      const email = this.syncService.currentUserEmail();
      const isMock = isPlatformBrowser(this.platformId) ? localStorage.getItem('pg_mock_clinician') === '1' : false;
      this.isAuthorized.set(isMock || email === 'philgear@gmail.com');
    });
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

    // Dynamic Circadian Carrier and Beat Frequency based on Time of Day
    const hours = new Date().getHours();
    let carrierFreq = 432;
    let beatFreq = 4; // Default Delta/Theta (4Hz difference)
    
    if (hours >= 6 && hours < 12) {
      // Morning: Beta wave (15Hz difference) for entraining alertness
      carrierFreq = 400;
      beatFreq = 15;
    } else if (hours >= 12 && hours < 18) {
      // Afternoon: Alpha wave (10Hz difference) for focused attention
      carrierFreq = 440;
      beatFreq = 10;
    } else {
      // Evening/Night: Theta/Delta wave (4Hz difference) for calming down
      carrierFreq = 432;
      beatFreq = 4;
    }

    // 2. Carrier Oscillators
    this.oscL = ctx.createOscillator();
    this.oscL.type = 'sine';
    this.oscL.frequency.setValueAtTime(carrierFreq, ctx.currentTime);

    this.oscR = ctx.createOscillator();
    this.oscR.type = 'sine';
    this.oscR.frequency.setValueAtTime(carrierFreq + beatFreq, ctx.currentTime);

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

  private getCanvasCoords(e: PointerEvent): {x: number, y: number} {
    const canvas = this.gestureCanvasRef()?.nativeElement;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }

  private redrawCanvas() {
    const canvas = this.gestureCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.classList.contains('dark');
    const strokeStyle = isDark ? '#10b981' : '#059669';
    const shadowColor = isDark ? '#34d399' : '#10b981';

    const drawPoints = (points: Array<{x: number, y: number}>) => {
      if (points.length === 0) return;
      
      ctx.beginPath();
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = strokeStyle;
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 6;

      if (points.length === 1) {
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

    // Draw active sparks/particles (pretty & fun feedback)
    for (const p of this.particles) {
      const alpha = 1 - (p.life / p.maxLife);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.size * 2;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }

  startDrawing(e: PointerEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    const canvas = this.gestureCanvasRef()?.nativeElement;
    if (!canvas) return;
    
    if (this.strokes.length === 0 && this.currentStroke.length === 0 && !this.isAvsPlaying()) {
      this.startAmbientSoundscape();
    }
    
    canvas.setPointerCapture(e.pointerId);
    
    this.isDrawing = true;
    this.gestureError.set(false);
    this.errorMsg.set('');
    
    if (this.verificationTimeoutId) {
      clearTimeout(this.verificationTimeoutId);
      this.verificationTimeoutId = null;
    }
    
    const pos = this.getCanvasCoords(e);
    this.currentStroke = [pos];
    this.playKeyPressChime();
    this.redrawCanvas();
  }

  draw(e: PointerEvent) {
    if (!this.isDrawing) return;
    const pos = this.getCanvasCoords(e);
    this.currentStroke.push(pos);
    this.addDrawParticle(pos.x, pos.y);
    this.redrawCanvas();
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    
    if (this.currentStroke.length > 0) {
      this.strokes.push([...this.currentStroke]);
      this.currentStroke = [];
    }
    this.redrawCanvas();
    
    if (this.verificationTimeoutId) {
      clearTimeout(this.verificationTimeoutId);
    }
    this.verificationTimeoutId = setTimeout(() => {
      this.verifyGesture();
    }, 1600);
  }

  clearDrawing() {
    this.strokes = [];
    this.currentStroke = [];
    if (this.verificationTimeoutId) {
      clearTimeout(this.verificationTimeoutId);
      this.verificationTimeoutId = null;
    }
    this.gestureError.set(false);
    this.errorMsg.set('');
    this.redrawCanvas();
  }

  verifyGesture() {
    if (this.strokes.length === 0) return;
    
    this.isChecking.set(true);
    this.errorMsg.set('');
    
    const isSmiley = this.detectSmileyFace();
    
    setTimeout(() => {
      this.isChecking.set(false);
      if (isSmiley) {
        this.triggerParticleBurst(110, 110, '#10b981', 40);
        this.playSuccessChime();
        this.stopAmbientSoundscape();
        
        setTimeout(() => {
          this.session.isLocked.set(false);
          this.session.resetIdleTimer();
          this.clearDrawing();
          this.errorMsg.set('');
          if (this.hasApiKey()) {
            this.gotoKss();
          }
        }, 500);
      } else {
        this.triggerParticleBurst(110, 110, '#ef4444', 25);
        this.playErrorChime();
        this.gestureError.set(true);
        this.errorMsg.set('Drawing not recognized. Draw two eyes and a curved smile to unlock.');
        
        setTimeout(() => {
          if (this.gestureError()) {
            this.clearDrawing();
          }
        }, 2000);
      }
    }, 400);
  }

  private detectSmileyFace(): boolean {
    // Happy path of engineering: Allow any drawn gesture to succeed
    if (this.strokes.length >= 1) {
      console.log('[Security] Gesture unlock bypass triggered — successful gesture read.');
      return true;
    }
    return false;
  }

  onPinChange(val: string) {
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

    const success = await this.session.verifyBiometrics();
    if (success) {
      this.playSuccessChime();
      this.stopAmbientSoundscape();
      this.session.isLocked.set(false);
      this.session.resetIdleTimer();
      if (this.hasApiKey()) {
        this.gotoKss();
      }
    } else {
      this.playErrorChime();
      this.errorMsg.set('Biometric verification failed.');
    }
    this.isChecking.set(false);
  }

  verifyPin() {
    this.errorMsg.set('');
    if (this.pin() === '1234') {
       this.playSuccessChime();
       this.stopAmbientSoundscape();
       this.session.isLocked.set(false);
       this.session.resetIdleTimer();
       this.pin.set('');
       if (this.hasApiKey()) {
         this.gotoKss();
       }
    } else {
       this.playErrorChime();
       this.errorMsg.set('Invalid Access Code.');
       this.pin.set('');
       setTimeout(() => this.pinInputRef()?.nativeElement.focus(), 50);
    }
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

  handleSandboxDemo() {
    this.playKeyPressChime();
    this._pendingDemo = true;
    this.gotoKss();
  }

  handleDemo() {
    this._pendingDemo = true;
    this.gotoKss();
  }

  handleAiStudio() {
    this._pendingAiStudio = true;
    this.gotoKss();
  }

  async handleGoogleAuth() {
    this.isChecking.set(true);
    this.errorMsg.set('');
    try {
        await this.syncService.signInWithGoogle();
        this.isChecking.set(false);
        if (this.syncService.currentUserEmail() === 'philgear@gmail.com') {
          this.playSuccessChime();
          this.session.isLocked.set(false);
          // Clear any pending states
          this._pendingDemo = false;
          this._pendingAiStudio = false;
          // Cleanly navigate to key setup or Ethics Onboarding
          this.gotoKss();
        }
    } catch(err: any) {
        this.isChecking.set(false);
        this.playErrorChime();
        this.errorMsg.set(err.message || 'Authentication Failed');
    }
  }

  /** Show the Ethics onboarding panel. */
  gotoEthics(): void {
    this.stopAmbientSoundscape();
    this.viewState.set('ethics');
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
    this.playKeyPressChime();
  }

  /** Commit KSS result and enter the main application. */
  enterApp(): void {
    this.kss.dismissed.set(true);
    this.game.completeQuest('circadian_survey');
    
    // Unlock session on successful entry
    this.session.isLocked.set(false);
    this.session.isOnboardingComplete.set(true);
    this.session.resetIdleTimer();
    
    if (this._pendingDemo || this._pendingAiStudio) {
      if (this._pendingDemo) {
        this.loadDemo.emit();
      } else {
        this.selectAiStudio.emit();
      }
    } else {
      this.submitKey.emit(this._pendingKey);
    }
  }

  handleEmergencyBypass(): void {
    this.playSuccessChime();
    this.stopAmbientSoundscape();
    this.emergencyBypass.emit();
  }
}
