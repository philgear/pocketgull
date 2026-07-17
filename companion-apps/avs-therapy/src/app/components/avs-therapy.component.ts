import { Component, signal, computed, effect, inject, OnDestroy, PLATFORM_ID, Inject, ViewChild, ElementRef, untracked } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalContextAvsService } from '../services/clinical-context-avs.service';
import { LifestyleAdjunctService } from '../services/lifestyle-adjunct.service';
import { BreathGuideComponent } from './breath-guide.component';
import { ISessionRecommendation } from '../services/patient.types';
import { AthleticProtocolService } from '../services/athletic-protocol.service';
import { AthleticState, IAthleticProfile } from '../services/patient.types';
import { PythonBridgeService } from '../services/python-bridge.service';

export type BrainwaveFrequency = 'delta' | 'theta' | 'alpha' | 'beta';

@Component({
  selector: 'app-avs-therapy',
  standalone: true,
  imports: [CommonModule, FormsModule, BreathGuideComponent],
  template: `
    <div id="tour-avs-therapy" class="w-full bg-white dark:bg-[#0c0604] border border-gray-200 dark:border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:border-orange-500/30">
      
      <!-- Spark Header Banner -->
      <div class="px-6 py-4 bg-gradient-to-r from-orange-600/10 via-amber-600/5 to-transparent border-b border-gray-150 dark:border-zinc-800/50 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/10 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-zinc-200">AVS Biometric Neuro-Therapy</h3>
            <p class="text-[10px] font-medium text-orange-500 dark:text-orange-400/80 tracking-wide uppercase">Insight Spark Wellness Module</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Dual-Use View Toggle -->
          <div class="flex bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-gray-200 dark:border-zinc-800 mr-4">
            <button (click)="viewMode.set('clinician')"
                    class="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    [class.bg-orange-500]="viewMode() === 'clinician'" [class.text-white]="viewMode() === 'clinician'"
                    [class.text-gray-600]="viewMode() !== 'clinician'" [class.dark:text-zinc-400]="viewMode() !== 'clinician'">Clinician View</button>
            <button (click)="viewMode.set('patient')"
                    class="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    [class.bg-orange-500]="viewMode() === 'patient'" [class.text-white]="viewMode() === 'patient'"
                    [class.text-gray-600]="viewMode() !== 'patient'" [class.dark:text-zinc-400]="viewMode() !== 'patient'">Patient Waiting</button>
          </div>

          <span class="flex h-2.5 w-2.5 relative">
            @if (isActive()) {
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            } @else {
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400 dark:bg-zinc-600"></span>
            }
          </span>
          <span class="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 uppercase">
            {{ isActive() ? 'ACTIVE SESSION' : 'READY' }}
          </span>
        </div>
      </div>

      <!-- Main Panel Body -->
      <div class="p-6 space-y-6">
        
        <!-- Live Visual Entrainment Target -->
        <div class="relative w-full h-44 rounded-xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-900 flex flex-col items-center justify-center overflow-hidden">
          <!-- Ambient Canvas Visualizer -->
          <canvas #avsCanvas class="absolute inset-0 w-full h-full pointer-events-none opacity-85" *ngIf="isActive()"></canvas>
          
          <!-- Gradient background ripples -->
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03)_0%,transparent_70%)] pointer-events-none"></div>
          
          <!-- Sync Pulsing Core -->
          <div [class.paused]="!isActive()"
               [style.animationDuration.ms]="pulseIntervalMs()"
               class="avs-pulsing-glow relative w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center shadow-lg transition-transform duration-500 z-10">
            
            <div class="absolute inset-0 rounded-full bg-orange-400/20 animate-ping" [style.animationDuration.ms]="pulseIntervalMs() * 2" *ngIf="isActive()"></div>
            
            <span class="text-white font-extrabold text-xs tracking-wider uppercase select-none">
              @if (isActive()) {
                {{ currentWaveFrequencyName() }}
              } @else {
                STANDBY
              }
            </span>
          </div>

          <!-- Active Metrics Status Bar -->
          <div class="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[10px] font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider z-10 pointer-events-none">
            <span>Dynamic: {{ currentBaseFrequency() }} Hz Carrier</span>
            <span>Delta/Diff: {{ targetBrainwaveFrequencyHz() }} Hz ({{ currentWaveFrequencyName() }})</span>
          </div>
        </div>

        @if (viewMode() === 'clinician') {
        <!-- Practitioner Baseline Adjustments Console -->
        <div class="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/30 border border-gray-150 dark:border-zinc-800/80 space-y-4">
          <div class="flex items-center justify-between border-b border-gray-200/50 dark:border-zinc-800/50 pb-2">
            <span class="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest">Practitioner Target Goals</span>
            <span class="text-[9px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">OVERRIDE</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Target Heart Rate -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase">Target Heart Rate</label>
                <span class="text-xs font-bold text-orange-500">{{ targetHr() }} BPM</span>
              </div>
              <input type="range" min="50" max="110" step="1" 
                     [value]="targetHr()"
                     (input)="onHrSliderChange($event)"
                     class="w-full accent-orange-500 h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer">
              <div class="flex justify-between text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
                <span>IVitals Current: {{ patientState.vitals().hr || '--' }} BPM</span>
                <span>Restorative Limit: 60-70</span>
              </div>
            </div>

            <!-- Target Breathing Rate (Pacing) -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase">Respirations (Breaths/Min)</label>
                <span class="text-xs font-bold text-orange-500">{{ targetBreathingRate() }} / MIN</span>
              </div>
              <input type="range" min="4" max="15" step="0.5" 
                     [value]="targetBreathingRate()"
                     (input)="onBreathingSliderChange($event)"
                     class="w-full accent-orange-500 h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer">
              <div class="flex justify-between text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
                <span>Pacing cycle: {{ (60 / targetBreathingRate()).toFixed(1) }}s</span>
                <span>HRV Resonance: 5.5-6.5</span>
              </div>
            </div>

          </div>

          <!-- Brainwave Target Selector -->
          <div class="space-y-2 pt-2 border-t border-gray-200/50 dark:border-zinc-800/50">
            <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase block">Neurological Entrainment Frequency</label>
            <div class="grid grid-cols-4 gap-2">
              @for (wave of waveProfiles; track wave.id) {
                <button (click)="selectWaveProfile(wave.id)"
                        class="p-2.5 rounded-lg border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-0.5"
                        [ngClass]="targetWave() === wave.id ? 
                          'bg-orange-500/10 border-orange-500 text-orange-500' : 
                          'bg-white dark:bg-zinc-950/20 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-orange-500/40'">
                  <span class="text-[10px] font-extrabold uppercase tracking-wide">{{ wave.id }}</span>
                  <span class="text-[9px] font-medium opacity-80">{{ wave.freq }}Hz</span>
                </button>
              }
            </div>
            <p class="text-[9px] text-gray-600 dark:text-zinc-400 leading-snug">
              {{ selectedWaveDescription() }}
            </p>
          </div>

        </div>

        <!-- Circadian Tuning Dashboard Panel -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-950/20 via-zinc-900/10 to-transparent border border-indigo-500/15 space-y-4">
          <div class="flex items-center justify-between border-b border-gray-200/50 dark:border-zinc-800/50 pb-2">
            <span class="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
              Circadian Tuning Dashboard
            </span>
            <span class="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Visual &amp; Audio Pacing</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Frequency Slider -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase">Light Modulation Speed</label>
                <span class="text-xs font-bold text-indigo-400">{{ targetBrainwaveFrequencyHz().toFixed(1) }} Hz</span>
              </div>
              <input type="range" min="1.0" max="30.0" step="0.5" 
                     [value]="targetBrainwaveFrequencyHz()"
                     (input)="onFrequencySliderChange($event)"
                     class="w-full accent-indigo-500 h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer">
              <div class="flex justify-between text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
                <span>Delta: 2-4Hz</span>
                <span>Theta: 4-8Hz</span>
                <span>Alpha: 8-12Hz</span>
                <span>Beta: 12-30Hz</span>
              </div>
            </div>

            <!-- Color Temperature Presets -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase block">Circadian Color Temperature</label>
              <div class="grid grid-cols-2 gap-2">
                <button (click)="selectColorTemp('indigo')"
                        class="p-2 rounded border text-center transition-all duration-200 cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                        [ngClass]="colorTemp() === 'indigo' ? 
                          'bg-indigo-500/15 border-indigo-500 text-indigo-400 shadow-sm' : 
                          'bg-white dark:bg-zinc-950/20 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-indigo-500/30'">
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  Indigo
                </button>
                <button (click)="selectColorTemp('emerald')"
                        class="p-2 rounded border text-center transition-all duration-200 cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                        [ngClass]="colorTemp() === 'emerald' ? 
                          'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm' : 
                          'bg-white dark:bg-zinc-950/20 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-emerald-500/30'">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Emerald
                </button>
                <button (click)="selectColorTemp('violet')"
                        class="p-2 rounded border text-center transition-all duration-200 cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                        [ngClass]="colorTemp() === 'violet' ? 
                          'bg-violet-500/15 border-violet-500 text-violet-400 shadow-sm' : 
                          'bg-white dark:bg-zinc-950/20 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-violet-500/30'">
                  <span class="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                  Violet
                </button>
                <button (click)="selectColorTemp('rose-earth')"
                        class="p-2 rounded border text-center transition-all duration-200 cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                        [ngClass]="colorTemp() === 'rose-earth' ? 
                          'bg-rose-500/15 border-rose-500 text-rose-400 shadow-sm' : 
                          'bg-white dark:bg-zinc-950/20 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-rose-500/30'">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Rose Earth
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ CO-REGULATION PROTOCOL PANEL ══════════════════════════════════ -->
        <div class="rounded-xl border dark:border-violet-500/15 bg-violet-500/[0.03] dark:bg-violet-950/20 overflow-hidden transition-all duration-500"
             [ngClass]="patientState.avsProtocol() ? 'border-violet-500/40' : 'border-violet-500/20'">

          <!-- Panel Header -->
          <div class="px-4 py-3 border-b border-violet-500/15 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.69 3 3 0 0 1 .49-5.62A5 5 0 0 1 9.5 2Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.69 3 3 0 0 0-.49-5.62A5 5 0 0 0 14.5 2Z"/>
              </svg>
              <div class="flex bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-gray-200 dark:border-zinc-800">
                <button (click)="protocolMode.set('clinical')"
                        class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                        [class.bg-violet-500]="protocolMode() === 'clinical'" [class.text-white]="protocolMode() === 'clinical'"
                        [class.text-gray-600]="protocolMode() !== 'clinical'" [class.dark:text-zinc-400]="protocolMode() !== 'clinical'">Clinical</button>
                <button (click)="protocolMode.set('athletic')"
                        class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                        [class.bg-violet-500]="protocolMode() === 'athletic'" [class.text-white]="protocolMode() === 'athletic'"
                        [class.text-gray-600]="protocolMode() !== 'athletic'" [class.dark:text-zinc-400]="protocolMode() !== 'athletic'">Athletic</button>
              </div>
            </div>
            @if (protocolMode() === 'clinical' && patientState.avsProtocol()) {
              <span class="text-[9px] px-2 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">
                {{ patientState.avsProtocol()!.wave | uppercase }} · {{ patientState.avsProtocol()!.breathing_bpm }} BPM
              </span>
            }
            @if (protocolMode() === 'athletic' && athleticService.session()) {
              <span class="text-[9px] px-2 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">
                {{ athleticService.session()!.profile.state | uppercase }}
              </span>
            }
          </div>

          <div class="p-4 space-y-4">

            <!-- Context Fields -->
            @if (protocolMode() === 'clinical') {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Reason for Visit</label>
                  <input type="text" placeholder="Chief complaint or reason for today's visit..."
                         [value]="patientState.reasonForVisit()"
                         (input)="patientState.reasonForVisit.set($any($event.target).value)"
                         class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-colors"/>
                </div>
                <div class="space-y-1">
                  <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Occupation</label>
                  <input type="text" placeholder="e.g. Veteran, Firefighter, Nurse..."
                         [value]="patientState.occupation()"
                         (input)="patientState.occupation.set($any($event.target).value)"
                         class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-colors"/>
                </div>
                <div class="space-y-1">
                  <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Dietary & Nutrition Intake</label>
                  <input type="text" placeholder="e.g. Fasting state, high inflammation, digestive distress..."
                         [value]="patientState.dietaryProtocol()"
                         (input)="patientState.dietaryProtocol.set($any($event.target).value)"
                         class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-colors"/>
                </div>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Sport / Activity</label>
                  <input type="text" placeholder="e.g. Sprinting, Golf, eSports..."
                         [value]="athleticSport()"
                         (input)="athleticSport.set($any($event.target).value)"
                         class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-colors"/>
                </div>
                <div class="space-y-1">
                  <label class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Target State</label>
                  <select [value]="athleticState()" (change)="athleticState.set($any($event.target).value)"
                          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/50 text-xs text-gray-900 dark:text-zinc-200 focus:outline-none focus:border-violet-500/60 transition-colors cursor-pointer">
                    <option value="priming">Priming (High-Beta/Gamma)</option>
                    <option value="flow">Flow (SMR/Alpha)</option>
                    <option value="recovery">Recovery (Theta)</option>
                    <option value="phase-shift">Phase-Shift (Circadian)</option>
                  </select>
                </div>
              </div>
            }

            <!-- Generate Button -->
            <button (click)="protocolMode() === 'clinical' ? generateCoRegProtocol() : generateAthleticProtocol()"
                    [disabled]="patientState.isGeneratingAvsProtocol()"
                    class="w-full py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    [ngClass]="!patientState.isGeneratingAvsProtocol() ? 
                      'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 
                      'bg-zinc-800 text-zinc-500 cursor-not-allowed'">
              @if (patientState.isGeneratingAvsProtocol()) {
                <!-- Spinner -->
                <svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating Protocol...
              } @else if ((protocolMode() === 'clinical' && patientState.avsProtocol()) || (protocolMode() === 'athletic' && athleticService.session())) {
                <!-- Regenerate icon -->
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                </svg>
                Re-generate Protocol
              } @else {
                <!-- Spark icon -->
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
                </svg>
                Generate Protocol
              }
            </button>

            <!-- Protocol Result -->
            @if (protocolMode() === 'clinical' && patientState.avsProtocol(); as proto) {
              <div class="space-y-4 pt-1" [@.disabled]="true">

                <!-- Breath Guide + Patient Message -->
                <div class="flex flex-col items-center gap-2 py-2">
                  <app-breath-guide [size]="160" [showLabel]="true" />
                </div>

                <!-- Session Intent (clinician) -->
                <div class="p-3 rounded-lg bg-violet-500/[0.06] border border-violet-500/20">
                  <p class="text-[9px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1">Session Intent (Clinician)</p>
                  <p class="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed italic">{{ proto.session_intent }}</p>
                </div>

                <!-- Protocol Stats Row -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-2 rounded-lg bg-gray-100 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/60 text-center">
                    <p class="text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-0.5">Wave</p>
                    <p class="text-sm font-extrabold text-violet-600 dark:text-violet-400 uppercase">{{ proto.wave }}</p>
                  </div>
                  <div class="p-2 rounded-lg bg-gray-100 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/60 text-center">
                    <p class="text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-0.5">Rate</p>
                    <p class="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{{ proto.breathing_bpm }}<span class="text-[9px] ml-0.5">BPM</span></p>
                  </div>
                  <div class="p-2 rounded-lg bg-gray-100 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/60 text-center">
                    <p class="text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-0.5">Ratio</p>
                    <p class="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">{{ proto.breath_ratio.inhale }}-{{ proto.breath_ratio.hold }}-{{ proto.breath_ratio.exhale }}</p>
                  </div>
                </div>

                <!-- Safety Flags -->
                @if (proto.safety_flags.length > 0) {
                  <div class="p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/20">
                    <p class="text-[9px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                      Clinical Advisories
                    </p>
                    @for (flag of proto.safety_flags; track flag) {
                      <p class="text-[10px] text-amber-800 dark:text-amber-300/80 leading-snug">· {{ flag }}</p>
                    }
                  </div>
                }

                <!-- Apply to Session Button -->
                <button (click)="applyProtocolToSession()"
                        class="w-full py-2 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Apply Clinical Protocol
                </button>

              </div>
            } @else if (protocolMode() === 'athletic' && athleticService.session()) {
              <div class="space-y-4 pt-1" [@.disabled]="true">
                <div class="p-3 rounded-lg bg-violet-500/[0.06] border border-violet-500/20">
                  <p class="text-[9px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1">Coach Note</p>
                  <p class="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed italic">{{ athleticService.session()!.coach_note }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Athlete Guidance</p>
                  @for (g of athleticService.session()!.athlete_guidance; track g) {
                    <p class="text-[10px] text-gray-700 dark:text-zinc-300 leading-snug">· {{ g }}</p>
                  }
                </div>
                <!-- Apply button -->
                <button (click)="applyAthleticProtocol()"
                        class="w-full py-2 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Apply Athletic Protocol
                </button>
              </div>
            }

          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          
          <!-- Master Toggle -->
          <button (click)="toggleSession()"
                  class="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all duration-300 text-center select-none cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg"
                  [ngClass]="!isActive() ? 
                    'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/20' : 
                    'bg-zinc-800 dark:bg-zinc-800 text-gray-200 border border-zinc-700'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" *ngIf="!isActive()">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" *ngIf="isActive()">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            </svg>
            {{ isActive() ? 'Terminate Session' : 'Initiate Neuro-Therapy' }}
          </button>

          <!-- Voice Guidance Enable Toggle -->
          <button (click)="toggleVoice()"
                  class="py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 flex items-center justify-center gap-2 select-none cursor-pointer"
                  [ngClass]="voiceEnabled() ? 
                    'bg-orange-500/10 border-orange-500 text-orange-500' : 
                    'bg-white dark:bg-zinc-950/10 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
            Voice: {{ voiceEnabled() ? 'ON' : 'OFF' }}
          </button>

          <!-- Rhythmic Haptic Vibration Toggle -->
          <button (click)="toggleVibration()"
                  class="py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 flex items-center justify-center gap-2 select-none cursor-pointer"
                  [ngClass]="vibrationEnabled() ? 
                    'bg-orange-500/10 border-orange-500 text-orange-500' : 
                    'bg-white dark:bg-zinc-950/10 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400'"
                  [disabled]="!hasVibrator"
                  [class.opacity-50]="!hasVibrator"
                  [title]="hasVibrator ? 'Toggle Rhythmic Physical Entrainment' : 'Vibration API not supported on this device'">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m8 3 4 8 5-5-5 15-2-6-4 3Z"/>
            </svg>
            Haptics: {{ vibrationEnabled() ? 'ON' : 'OFF' }}
          </button>

        </div>

        <!-- Therapeutic Safety Guidelines -->
        <div class="text-[9px] text-gray-400 dark:text-zinc-500/80 leading-relaxed italic border-t border-gray-100 dark:border-zinc-900/50 pt-3">
          AVS Clinical Disclaimer: Do not utilize audio-visual entrainment therapies if the patient has a known history of epilepsy or photosensitive seizures. Headphones are strictly required for binaural beat neural stimulation.
        </div>

        <!-- ══ LIFESTYLE & BEVERAGE ADJUNCT PANEL ══════════════════════════ -->
        <div class="rounded-xl border dark:border-emerald-500/15 bg-emerald-500/[0.02] dark:bg-emerald-950/10 overflow-hidden"
             [ngClass]="lifestyleAdj.adjunct() ? 'border-emerald-500/40' : 'border-emerald-500/20'">

          <div class="px-4 py-3 border-b border-emerald-500/15 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
              <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Lifestyle &amp; Beverage Adjuncts</span>
            </div>
            @if (lifestyleAdj.adjunct()) {
              <span class="text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold uppercase tracking-wider">
                {{ lifestyleAdj.adjunct()!.recommendations.length }} suggestions
              </span>
            }
          </div>

          <div class="p-4 space-y-3">
            @if (lifestyleAdj.adjunct(); as adj) {
              <p class="text-[10px] text-zinc-400 italic leading-relaxed">{{ adj.clinician_note }}</p>
              @for (rec of adj.recommendations; track rec.title) {
                <div class="p-3 rounded-lg border" [class]="recCardClass(rec)">
                  <div class="flex items-start gap-2.5">
                    <span class="text-base leading-none mt-0.5">{{ rec.emoji }}</span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <p class="text-[10px] font-bold uppercase tracking-widest" [class]="recTitleClass(rec)">{{ rec.title }}</p>
                        @if (rec.avsAdjust) {
                          <span class="text-[8px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-bold uppercase tracking-wider shrink-0">AVS adj.</span>
                        }
                      </div>
                      <p class="text-[10px] text-zinc-300 leading-relaxed whitespace-pre-line">{{ rec.detail }}</p>
                    </div>
                  </div>
                </div>
              }
            } @else {
              <button (click)="generateAdjuncts()"
                      class="w-full py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-[11px] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
                Scan Chart for Lifestyle Adjuncts
              </button>
              <p class="text-[9px] text-zinc-600 text-center leading-snug">
                Reads clinical notes &amp; medications for tea, beverage &amp; session timing recommendations.
              </p>
            }
          </div>
        </div>

        } <!-- End Clinician View -->

        @if (viewMode() === 'patient') {
          <div class="p-6 rounded-xl bg-gradient-to-b from-orange-500/5 to-transparent border border-orange-500/10 text-center space-y-6">
            <h4 class="text-xl font-light text-gray-800 dark:text-gray-200">Welcome to your Session</h4>
            <p class="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Your clinician is preparing your chart. Please focus on the pulsing core and match your breathing to its rhythm. 
              This prepares your nervous system and optimizes blood flow for digestion and recovery.
            </p>
            
            <div class="pt-4 border-t border-gray-200/50 dark:border-zinc-800/50">
              <button (click)="toggleSession()"
                      class="px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs shadow-lg transition-all duration-300 text-center select-none cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-orange-500/30"
                      [class.bg-zinc-800]="isActive()"
                      [class.text-white]="isActive()"
                      [class.from-zinc-700]="isActive()"
                      [class.to-zinc-800]="isActive()">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" *ngIf="!isActive()">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" *ngIf="isActive()">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                </svg>
                {{ isActive() ? 'Pause Relaxation' : 'Start Relaxation' }}
              </button>
            </div>
          </div>
        }

      </div>

    </div>
  `,
  styles: [`
    .avs-pulsing-glow {
      animation: pulse-glow infinite ease-in-out;
      box-shadow: 0 0 20px rgba(249, 115, 22, 0.25);
    }
    .avs-pulsing-glow.paused {
      animation-play-state: paused !important;
      transform: scale(1) !important;
      box-shadow: 0 0 10px rgba(249, 115, 22, 0.1) !important;
    }
    @keyframes pulse-glow {
      0%, 100% {
        transform: scale(0.96);
        filter: brightness(0.9);
        box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);
      }
      50% {
        transform: scale(1.05);
        filter: brightness(1.1);
        box-shadow: 0 0 35px rgba(249, 115, 22, 0.45);
      }
    }
  `]
})
export class AvsTherapyComponent implements OnDestroy {
  patientState     = inject(PatientStateService);
  private contextAvs   = inject(ClinicalContextAvsService);
  readonly lifestyleAdj = inject(LifestyleAdjunctService);
  readonly athleticService = inject(AthleticProtocolService);
  private pythonBridge = inject(PythonBridgeService);
  private isBrowser = false;

  protocolMode = signal<'clinical' | 'athletic'>('clinical');
  viewMode = signal<'clinician' | 'patient'>('clinician');
  athleticSport = signal('Sprinting');
  athleticState = signal<AthleticState>('priming');

  // --- Dynamic Telemetry & Settings Signals ---
  isActive = signal(false);
  voiceEnabled = signal(true);
  vibrationEnabled = signal(false);
  
  targetHr = signal(70);
  targetBreathingRate = signal(6.0); // Respiration pacing per minute (coherence frequency)
  targetWave = signal<BrainwaveFrequency>('theta');
  customFrequency = signal<number | null>(null);
  colorTemp = signal<'indigo' | 'emerald' | 'violet' | 'rose-earth'>('indigo');

  @ViewChild('avsCanvas') avsCanvasRef!: ElementRef<HTMLCanvasElement>;
  private canvasRafId: number | null = null;
  
  // --- Web Audio API Properties ---
  private audioCtx: AudioContext | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private mainGain: GainNode | null = null;

  // --- Speech & Vibration Interval Handles ---
  private guidanceTimer: any = null;
  private vibrationTimer: any = null;
  hasVibrator = false;

  // --- Wave Profiles Data ---
  waveProfiles = [
    { id: 'delta', freq: 2.5, desc: 'Delta Wave (2.5Hz): Deep restorative sleep, somatic cell healing, cortisol mitigation.' },
    { id: 'theta', freq: 6.0, desc: 'Theta Wave (6.0Hz): Meditation, neural plasticity, profound autonomic nervous system reset.' },
    { id: 'alpha', freq: 10.0, desc: 'Alpha Wave (10.0Hz): Calm focus, anxiety release, cognitive integration.' },
    { id: 'beta', freq: 18.0, desc: 'Beta Wave (18.0Hz): Cognitive processing, focused problem solving, baseline alertness.' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.hasVibrator = !!navigator.vibrate;
      
      // Auto-adapt practitioner baseline targets dynamically if current patient has telemetry
      effect(() => {
        const liveVitals = this.patientState.vitals();
        if (liveVitals.hr) {
          const hrVal = parseInt(liveVitals.hr, 10);
          if (!isNaN(hrVal) && hrVal > 85) {
            // High heart rate, automatically recommend calming Theta waves and slow breathing (5.5 breaths/min)
            this.targetWave.set('theta');
            this.targetBreathingRate.set(5.5);
            this.targetHr.set(70); // Practitioner target is set to guide them down
          }
        }
      }, { allowSignalWrites: true });

      // Synchronize active AVS session state with the global PatientStateService for 3D body viewer entrainment
      effect(() => {
        const active = this.isActive();
        const rate = this.targetBreathingRate();
        const wave = this.targetWave();
        const freqHz = this.targetBrainwaveFrequencyHz();
        
        this.patientState.isAvsSessionActive.set(active);
        this.patientState.avsBreathingRate.set(rate);
        this.patientState.avsBrainwaveFrequency.set(wave);
        this.patientState.avsBrainwaveFrequencyHz.set(freqHz);
      }, { allowSignalWrites: true });

      // Canvas loop reaction based on active status
      effect(() => {
        const active = this.isActive();
        this.targetBrainwaveFrequencyHz();
        this.colorTemp();
        untracked(() => {
          if (active) {
            setTimeout(() => this.startCanvasLoop(), 100);
          } else {
            this.stopCanvasLoop();
          }
        });
      });
    }
  }

  // --- Computed Helpers ---
  targetBrainwaveFrequencyHz = computed(() => {
    const custom = this.customFrequency();
    if (custom !== null) return custom;
    const profile = this.waveProfiles.find(w => w.id === this.targetWave());
    return profile ? profile.freq : 6.0;
  });

  currentWaveFrequencyName = computed(() => {
    return this.targetWave().toUpperCase();
  });

  selectedWaveDescription = computed(() => {
    const profile = this.waveProfiles.find(w => w.id === this.targetWave());
    return profile ? profile.desc : '';
  });

  currentBaseFrequency = computed(() => {
    // Dynamically adjust carrier frequency based on target wave for optimal resonance
    switch (this.targetWave()) {
      case 'delta': return 150; // Low frequency base for somatic resonance
      case 'theta': return 200; // Calming frequency
      case 'alpha': return 250; // Meditative balance
      case 'beta': return 350;  // Focus-enhancing higher frequency
      default: return 200;
    }
  });

  pulseIntervalMs = computed(() => {
    // Breathing pacing in milliseconds per complete cycle
    return Math.round((60 / this.targetBreathingRate()) * 1000);
  });

  // --- Event Handlers for UI Sliders ---
  onHrSliderChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.targetHr.set(parseInt(value, 10));
    
    if (this.isActive() && this.voiceEnabled()) {
      this.speakGuidance("Target heart rate updated by practitioner. Directing entrainment toward " + value + " beats per minute.");
    }
  }

  onBreathingSliderChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.targetBreathingRate.set(parseFloat(value));
    
    if (this.isActive() && this.voiceEnabled()) {
      this.speakGuidance("Respiratory pacing adjusted. Breathing cycle is now set to " + parseFloat(value).toFixed(1) + " breaths per minute.");
    }
  }

  onFrequencySliderChange(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.customFrequency.set(value);
    if (this.isActive()) {
      this.restartOscillators();
      if (this.voiceEnabled()) {
        this.speakGuidance(`Light modulation frequency tuned to ${value.toFixed(1)} Hertz.`);
      }
    }
  }

  selectColorTemp(temp: 'indigo' | 'emerald' | 'violet' | 'rose-earth') {
    this.colorTemp.set(temp);
    if (this.isActive() && this.voiceEnabled()) {
      this.speakGuidance(`Circadian color temperature preset shifted to ${temp.replace('-', ' ')}.`);
    }
  }

  private startCanvasLoop() {
    if (!this.isBrowser) return;
    this.stopCanvasLoop();

    const canvas = this.avsCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 400;
        canvas.height = canvas.parentElement.clientHeight || 176;
      }
    };
    resize();

    window.addEventListener('resize', resize);

    let angle = 0;
    const tick = () => {
      if (!this.isActive() || !canvas || !ctx) {
        window.removeEventListener('resize', resize);
        return;
      }
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);

      // Get color temperature colors
      const preset = this.colorTemp();
      let colorGlow = 'rgba(67, 56, 202, 0.15)'; // Indigo
      let colorLine = 'rgba(14, 165, 233, 0.4)';
      
      if (preset === 'emerald') {
        colorGlow = 'rgba(5, 150, 105, 0.15)';
        colorLine = 'rgba(52, 211, 153, 0.4)';
      } else if (preset === 'violet') {
        colorGlow = 'rgba(124, 58, 237, 0.15)';
        colorLine = 'rgba(192, 132, 252, 0.4)';
      } else if (preset === 'rose-earth') {
        colorGlow = 'rgba(225, 29, 72, 0.15)';
        colorLine = 'rgba(251, 146, 60, 0.4)';
      }

      // Draw background glow using color temp
      const radGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) / 2);
      radGrad.addColorStop(0, colorGlow);
      radGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw sine wave pattern corresponding to light modulation frequency
      const freqHz = this.targetBrainwaveFrequencyHz();
      const speed = (freqHz * 2 * Math.PI) / 1000;
      angle += speed;

      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colorLine;
      
      for (let x = 0; x < width; x += 3) {
        const y = height / 2 + 
                  Math.sin(x * 0.015 + angle) * 35 * Math.sin(angle * 0.1) + 
                  Math.cos(x * 0.008 - angle * 0.3) * 12;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      this.canvasRafId = requestAnimationFrame(tick);
    };

    this.canvasRafId = requestAnimationFrame(tick);
  }

  private stopCanvasLoop() {
    if (this.canvasRafId !== null) {
      cancelAnimationFrame(this.canvasRafId);
      this.canvasRafId = null;
    }
  }

  // --- Co-Regulation Protocol Handlers ---

  /**
   * Invoke Gemini to generate a personalized AVS co-regulation protocol
   * from the patient's clinical context (PTSD, occupation, reason for visit).
   * Falls back to a deterministic heuristic if Gemini is unavailable.
   */
  async generateCoRegProtocol(): Promise<void> {
    await this.contextAvs.generateContextualProtocol();
  }

  /**
   * Apply the currently generated co-regulation protocol to the AVS session
   * controls and start the session.
   */
  applyProtocolToSession(): void {
    const proto = this.patientState.avsProtocol();
    if (!proto) return;
    this.targetWave.set(proto.wave as BrainwaveFrequency);
    this.targetBreathingRate.set(proto.breathing_bpm);
    if (!this.isActive()) this.startTherapy();
    else this.restartOscillators();
  }

  generateAthleticProtocol(): void {
    this.athleticService.generate({
      state: this.athleticState(),
      sportType: this.athleticSport(),
      preferredMusic: 'high-tempo'
    });
  }

  applyAthleticProtocol(): void {
    const session = this.athleticService.session();
    if (!session) return;
    
    // Auto-map athletic state to brainwave target
    const stateToWave: Record<AthleticState, BrainwaveFrequency> = {
      'priming': 'beta',
      'flow': 'alpha',
      'recovery': 'theta',
      'phase-shift': 'delta'
    };
    
    this.targetWave.set(stateToWave[this.athleticState()]);
    // Set a matching breathing rate (e.g. faster for priming, slower for recovery)
    if (this.athleticState() === 'priming') this.targetBreathingRate.set(12.0);
    else if (this.athleticState() === 'recovery') this.targetBreathingRate.set(5.5);
    else this.targetBreathingRate.set(6.0);

    if (!this.isActive()) this.startTherapy();
    else this.restartOscillators();
  }

  /** Scan chart and populate lifestyle adjunct recommendations (instant, no Gemini). */
  generateAdjuncts(): void {
    this.lifestyleAdj.generate();
  }

  /** Background + border classes for a recommendation card. */
  recCardClass(rec: ISessionRecommendation): string {
    const MAP: Record<string, string> = {
      'beverage':      'bg-emerald-500/[0.05] border-emerald-500/20',
      'caution':       'bg-amber-500/[0.05] border-amber-500/20',
      'avs-adjustment':'bg-violet-500/[0.05] border-violet-500/20',
      'timing':        'bg-blue-500/[0.05] border-blue-500/20',
      'wind-down':     'bg-indigo-500/[0.05] border-indigo-500/20',
    };
    return MAP[rec.category] ?? 'bg-zinc-800/40 border-zinc-700/40';
  }

  /** Title text color class for a recommendation card. */
  recTitleClass(rec: ISessionRecommendation): string {
    const MAP: Record<string, string> = {
      'beverage':      'text-emerald-400',
      'caution':       'text-amber-400',
      'avs-adjustment':'text-violet-400',
      'timing':        'text-blue-400',
      'wind-down':     'text-indigo-400',
    };
    return MAP[rec.category] ?? 'text-zinc-400';
  }

  selectWaveProfile(profileId: string) {
    this.customFrequency.set(null);
    this.targetWave.set(profileId as BrainwaveFrequency);
    
    if (this.isActive()) {
      // Live reload audio oscillators with the new frequencies immediately
      this.restartOscillators();
      
      if (this.voiceEnabled()) {
        this.speakGuidance(`Neurological target shifted to ${profileId} waves at ${this.targetBrainwaveFrequencyHz()} Hertz.`);
      }
    }
  }

  // --- Speech Therapy (WebSpeech API) ---
  private speakGuidance(text: string) {
    if (!this.isBrowser || !('speechSynthesis' in window)) return;
    
    // Stop any active utterance to prevent queue build up
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Slow, calming, clinical voice configuration
    utterance.rate = 0.8;
    utterance.pitch = 0.95;
    
    // Search for a warm, premium clinical/local voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural') || v.lang === 'en-US');
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  // --- Session Controls ---
  toggleSession() {
    if (this.isActive()) {
      this.stopTherapy();
    } else {
      this.startTherapy();
    }
  }

  toggleVoice() {
    this.voiceEnabled.update(v => !v);
  }

  toggleVibration() {
    if (!this.hasVibrator) return;
    this.vibrationEnabled.update(v => !v);
    
    if (this.isActive()) {
      if (this.vibrationEnabled()) {
        this.startHapticLoop();
      } else {
        this.stopHapticLoop();
      }
    }
  }

  // --- AVS Brainwave Synthesis (Web Audio API) ---
  private startTherapy() {
    if (!this.isBrowser) return;
    
    this.isActive.set(true);
    this.pythonBridge.startBiosignalStream('avs-session-' + Date.now());
    
    try {
      // 1. Initialize Audio Context
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      // 2. Setup Stereo Channel Merger Node (Input 0 -> Left, Input 1 -> Right)
      const merger = this.audioCtx.createChannelMerger(2);
      
      // 3. Setup oscillators with the carrier and differential frequencies
      const carrier = this.currentBaseFrequency();
      const difference = this.targetBrainwaveFrequencyHz();
      
      // Left Ear
      this.oscLeft = this.audioCtx.createOscillator();
      this.oscLeft.type = 'sine';
      this.oscLeft.frequency.value = carrier;
      
      // Right Ear (Carrier + Difference frequency creates the Binaural beat)
      this.oscRight = this.audioCtx.createOscillator();
      this.oscRight.type = 'sine';
      this.oscRight.frequency.value = carrier + difference;
      
      // Connect oscillators to corresponding channels
      this.oscLeft.connect(merger, 0, 0);
      this.oscRight.connect(merger, 0, 1);
      
      // 4. Generate Soothing Pink/Brown Background Noise
      const bufferSize = 4 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Filter to brown noise (extremely restorative low frequency rumble)
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain factor
      }
      
      this.noiseNode = this.audioCtx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;
      
      // Low pass filter to keep noise deeply restorative
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180; // Cut off high frequencies
      
      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.value = 0.08; // Gentle background masking
      
      this.noiseNode.connect(filter);
      filter.connect(noiseGain);
      
      // 5. Setup Master Gain
      this.mainGain = this.audioCtx.createGain();
      this.mainGain.gain.setValueAtTime(0.18, this.audioCtx.currentTime); // Standard comfortable volume
      
      // Connect components to Master Gain
      merger.connect(this.mainGain);
      noiseGain.connect(this.mainGain);
      
      // Connect Master Gain to Speaker destination
      this.mainGain.connect(this.audioCtx.destination);
      
      // 6. Start Audio generators
      this.oscLeft.start();
      this.oscRight.start();
      this.noiseNode.start();
      
      // 7. Initiate Speech Induction Flow
      if (this.voiceEnabled()) {
        const hr = this.patientState.vitals().hr || '80';
        this.speakGuidance(
          `Initiating clinical biometric entrainment session. Active heart rate telemetry is ${hr} beats per minute. ` +
          `Setting respiratory coherence pacing to ${this.targetBreathingRate()} breaths per minute. ` +
          `Please match your breathing to the orange pulsing light. Inhale as it expands, exhale as it contracts. Let's begin.`
        );
      }

      // 8. Start dynamic speech and haptic intervals
      this.startSpeechGuidanceLoop();
      if (this.vibrationEnabled()) {
        this.startHapticLoop();
      }

    } catch (e) {
      console.error('[AVS Therapy] Failed to initialize Web Audio API: ', e);
    }
  }

  private stopTherapy() {
    this.isActive.set(false);
    this.pythonBridge.stopBiosignalStream();
    
    // Stop WebSpeech
    if (this.isBrowser && ('speechSynthesis' in window)) {
      window.speechSynthesis.cancel();
    }
    
    // Clean up Audio Nodes
    try {
      if (this.oscLeft) { this.oscLeft.stop(); this.oscLeft.disconnect(); }
      if (this.oscRight) { this.oscRight.stop(); this.oscRight.disconnect(); }
      if (this.noiseNode) { this.noiseNode.stop(); this.noiseNode.disconnect(); }
      if (this.mainGain) { this.mainGain.disconnect(); }
      if (this.audioCtx) { this.audioCtx.close(); }
    } catch (_) {}
    
    this.oscLeft = null;
    this.oscRight = null;
    this.noiseNode = null;
    this.mainGain = null;
    this.audioCtx = null;
    
    // Stop intervals
    if (this.guidanceTimer) { clearInterval(this.guidanceTimer); this.guidanceTimer = null; }
    this.stopHapticLoop();
  }

  private restartOscillators() {
    if (!this.isActive() || !this.audioCtx) return;
    
    const carrier = this.currentBaseFrequency();
    const difference = this.targetBrainwaveFrequencyHz();
    
    if (this.oscLeft && this.oscRight) {
      // Smooth frequency transition using AudioParams
      const now = this.audioCtx.currentTime;
      this.oscLeft.frequency.setTargetAtTime(carrier, now, 0.2);
      this.oscRight.frequency.setTargetAtTime(carrier + difference, now, 0.2);
    }
  }

  // --- Guidance Loop (Adaptive clinical voice checks) ---
  private startSpeechGuidanceLoop() {
    if (this.guidanceTimer) clearInterval(this.guidanceTimer);
    
    let step = 0;
    this.guidanceTimer = setInterval(() => {
      if (!this.isActive() || !this.voiceEnabled()) return;
      
      const hrVal = parseInt(this.patientState.vitals().hr || '80', 10);
      step++;

      if (step % 2 === 1) {
        // Clinical biometric feedback
        if (hrVal > this.targetHr()) {
          this.speakGuidance(
            `Elevated pulse detected. Focus on elongating your exhalation. ` +
            `Exhale for ${Math.round(this.pulseIntervalMs() / 2000)} seconds, and let your baseline targets stabilize.`
          );
        } else {
          this.speakGuidance(
            `Coherence achieved. Heart rate is fully synchronized. Continuing ${this.targetWave()} brainwave entrainment.`
          );
        }
      } else {
        // Restorative imagery guidance
        const prompts = [
          "Visualize neural pathways firing with crystal clarity. Calm, steady, focused.",
          "Inhale healing and vitality. Exhale tension, worry, and static noise.",
          "Feel the rhythmic resonance aligning your somatic and autonomic systems. Deep clinical restoration.",
          "Your nervous system is resetting. Neural pathways are finding quiet, cohesive flow."
        ];
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        this.speakGuidance(randomPrompt);
      }
    }, 28000); // Trigger soothing updates every 28 seconds
  }

  // --- Physical Haptic Loop (`navigator.vibrate`) ---
  private startHapticLoop() {
    this.stopHapticLoop();
    if (!this.isBrowser || !this.hasVibrator || !this.vibrationEnabled()) return;

    const pacingIntervalMs = this.pulseIntervalMs();
    
    // Heartbeat-like double vibration at the beginning of each inhalation cycle
    const heartbeatPattern = [120, 80, 120]; 
    
    this.vibrationTimer = setInterval(() => {
      if (this.isActive() && this.vibrationEnabled()) {
        navigator.vibrate(heartbeatPattern);
      }
    }, pacingIntervalMs);
  }

  private stopHapticLoop() {
    if (this.vibrationTimer) {
      clearInterval(this.vibrationTimer);
      this.vibrationTimer = null;
    }
    if (this.isBrowser && this.hasVibrator) {
      navigator.vibrate(0); // Cancel any active vibrations
    }
  }

  ngOnDestroy() {
    this.stopTherapy();
  }
}
