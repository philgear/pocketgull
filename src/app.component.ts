import { Component, ChangeDetectionStrategy, inject, computed, signal, viewChild, ElementRef, afterNextRender, effect, ChangeDetectorRef, untracked, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientDropdownComponent } from './components/patient-dropdown.component';
import { PatientStateService, BODY_PART_NAMES } from './services/patient-state.service';
import { ResearchFrameComponent } from './components/research-frame.component';
import { MedicalChartComponent } from './components/medical-chart.component';
import { VisitReviewComponent } from './components/visit-review.component';
import { AnalysisContainerComponent } from './components/analysis-container.component';
import { DictationModalComponent } from './components/dictation-modal.component';
import { TaskFlowComponent } from './components/task-flow.component';
import { IntakeFormComponent } from './components/intake-form.component';
import { VoiceAssistantComponent } from './components/voice-assistant.component';
import { AI_CONFIG, AiProviderConfig } from './services/ai-provider.types';
import { IntelligenceProviderToken } from './services/ai/intelligence.provider.token';
import { GeminiProvider } from './services/ai/gemini.provider';
import { ClinicalIntelligenceService } from './services/clinical-intelligence.service';
import { PatientManagementService } from './services/patient-management.service';
import { ThemeService } from './services/theme.service';
import { ExportService } from './services/export.service';
import { RevealDirective } from './directives/reveal.directive';
import { DEMO_ANALYSIS_REPORT } from './demo-data';
import { FhirCallbackComponent } from './components/fhir-callback.component';
import { WalkthroughTourComponent } from './components/walkthrough-tour.component';
import { WalkthroughTourService } from './services/walkthrough-tour.service';


import { initializeWebMCPPolyfill } from '@mcp-b/webmcp-polyfill';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PatientDropdownComponent,
    MedicalChartComponent,
    AnalysisContainerComponent,
    DictationModalComponent,
    TaskFlowComponent,
    ResearchFrameComponent,
    IntakeFormComponent,
    VoiceAssistantComponent,
    RevealDirective,
    FhirCallbackComponent,
    WalkthroughTourComponent
  ],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showFhirCallback()) {
      <app-fhir-callback></app-fhir-callback>
    } @else {
    <div class="min-h-[100dvh] md:h-[100dvh] w-full bg-[#EEEEEE] dark:bg-zinc-950 text-[#1C1C1C] dark:text-zinc-100 flex flex-col md:overflow-hidden font-sans selection:bg-green-100 selection:text-green-900 group/app">
      
      <app-dictation-modal></app-dictation-modal>
        <app-walkthrough-tour></app-walkthrough-tour>

      @if (!hasApiKey()) {
        <main class="fixed inset-0 bg-white dark:bg-zinc-900 z-[100] flex flex-col items-center justify-center p-6 text-center landmark-main">
          <!-- Origami Pocket Splash -->
          <div class="mb-10 relative w-full h-56 max-w-sm mx-auto flex items-end justify-center">
             <!-- The Pocket -->
            <div class="origami-pocket"></div>
            
            <!-- The Seagull -->
            <div class="origami-seagull-container origami-seagull-enter">
                <div class="origami-paper"></div>
                <div class="origami-seagull">
                    <!-- Origami SVG Seagull shape - Braun minimalist palette -->
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <!-- Far Wing -->
                        <polygon points="50,40 65,15 58,45" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="0.5" stroke-linejoin="round" />
                        <!-- Tail -->
                        <polygon points="20,50 50,40 10,35" fill="#e0e0e0" stroke="#d0d0d0" stroke-width="0.5" stroke-linejoin="round" />
                        <!-- Body Base -->
                        <polygon points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f4" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round" />
                        <!-- Near Wing (Upper) -->
                        <polygon points="50,40 58,45 35,85" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round" />
                        <!-- Near Wing (Fold) -->
                        <polygon points="50,40 35,85 20,50" fill="#f9f9f9" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round" />
                        <!-- Neck/Head -->
                        <polygon points="75,55 58,45 85,38" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round" />
                        <!-- Beak - Functional Braun Orange Accent -->
                        <polygon points="85,38 82,45 95,34" fill="#ff4500" stroke="#df3d00" stroke-width="0.5" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
          </div>
          <h1 class="text-xl font-bold mb-1 uppercase tracking-[0.2em] text-[#1C1C1C] dark:text-zinc-100">Pocket Gull</h1>
          <p class="text-gray-500 dark:text-zinc-400 mb-8 text-xs uppercase tracking-widest">Clinical Intelligence Platform</p>

          <!-- API Key Input -->
          <div class="w-full max-w-sm">
            <p class="text-gray-500 dark:text-zinc-400 mb-4 text-sm">Enter your Gemini API key to access the live practitioner dashboard.</p>
            <div class="relative flex items-center border border-gray-200 dark:border-zinc-800 rounded focus-within:border-gray-400 dark:focus-within:border-zinc-600 transition-colors mb-2">
              <input
                id="api-key-input"
                [(ngModel)]="apiKeyInput"
                [type]="showPassword() ? 'text' : 'password'"
                placeholder="Paste your Gemini API key here"
                class="flex-1 px-4 py-3 text-sm bg-transparent outline-none font-mono text-gray-800 dark:text-zinc-100 placeholder-gray-300 dark:placeholder-zinc-600"
                (keydown.enter)="submitApiKey()"
              />
              <button (click)="showPassword.update(v => !v)" class="px-3 text-gray-500 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" [attr.aria-label]="showPassword() ? 'Hide key' : 'Show key'">
                @if (showPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            @if (apiKeyError()) {
              <p class="text-red-500 text-xs mb-3">{{ apiKeyError() }}</p>
            }
            <button (click)="submitApiKey()" [disabled]="!apiKeyInput().trim()"
              class="w-full py-3 bg-[#1C1C1C] dark:bg-zinc-100 text-white dark:text-[#09090b] text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-3">
              Enter Dashboard
            </button>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"
              class="block text-xs text-[#416B1F] dark:text-[#689f38] hover:text-[#244626] dark:hover:text-[#8bc34a] transition-colors mb-8">
              Get an API key at <span class="font-bold">ai.dev</span> →
            </a>

            <!-- Divider -->
            <div class="relative flex items-center gap-4 mb-8">
              <div class="flex-1 h-px bg-gray-100 dark:bg-zinc-800/50"></div>
              <span class="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-widest">or</span>
              <div class="flex-1 h-px bg-gray-100 dark:bg-zinc-800/50"></div>
            </div>

            <!-- Demo Mode -->
            <button (click)="loadDemoMode()"
              class="w-full py-3 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700 transition-all">
              Try Demo — No Key Required
            </button>
            <p class="text-gray-500 dark:text-zinc-400 text-xs mt-2">Loads a pre-sampled patient with example AI analysis outputs.</p>
          </div>

          <!-- Legal & Medical Disclaimer -->
          <div class="absolute bottom-6 left-6 right-6 text-center max-w-3xl mx-auto no-print">
            <p class="text-[10px] text-gray-500 dark:text-zinc-400 leading-relaxed uppercase tracking-widest font-medium">
              Important Legal / Liability Disclaimer
            </p>
            <p class="text-[10px] text-gray-500 dark:text-zinc-400 leading-relaxed mt-1">
              The software provided by Pocket Gull acts as a clinical support and administrative tool to aggregate and analyze explicitly provided medical data. It is not intended to independently diagnose, treat, or cure any disease, and final clinical judgments remain solely the responsibility of the licensed healthcare provider.
            </p>
          </div>
        </main>
      } @else {
        <main class="flex-1 flex flex-col min-w-0 min-h-0 relative group/main"> <!-- Main Content -->
        <!-- Demo Banner -->
        @if (isDemoMode()) {
          <div class="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/30 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 no-print shrink-0">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p class="text-xs text-amber-800 dark:text-amber-200 font-medium">Demo Mode <span class="hidden sm:inline">— Showing pre-sampled patient data. AI analysis generation requires an API key.</span></p>
            </div>
            <div class="flex items-center gap-3">

              <button (click)="exitDemoMode()" class="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest hover:text-amber-900 dark:hover:text-amber-300 whitespace-nowrap transition-colors">Enter API Key →</button>
            </div>
          </div>
        }
        <!-- Navbar: Pure utility, no decoration -->
        <nav class="h-14 border-b border-[#EEEEEE] dark:border-zinc-800 flex items-center justify-between px-3 sm:px-6 shrink-0 bg-white dark:bg-[#111111] z-50 no-print">
          <div class="flex items-center gap-4">
              <div class="flex items-center gap-3">
                  <svg width="42" height="42" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
                    <g transform="translate(0, -20)">
                      <rect x="166" y="275" width="180" height="10" rx="2" fill="#76B362" />
                      <g>
                        <path d="M251 270 C200 250 155 200 155 145 C155 180 185 240 251 270Z" fill="#76B362" />
                        <path d="M251 270 C240 210 215 155 185 145 C185 145 230 200 251 270Z" fill="#244626" />
                      </g>
                      <g transform="translate(512, 0) scale(-1, 1)">
                        <path d="M251 270 C200 250 155 200 155 145 C155 180 185 240 251 270Z" fill="#76B362" />
                        <path d="M251 270 C240 210 215 155 185 145 C185 145 230 200 251 270Z" fill="#76B362" />
                      </g>
                    </g>
                  </svg>
                  <span class="font-medium text-[#1C1C1C] dark:text-zinc-100 tracking-[0.15em] text-sm hidden sm:inline">POCKET GULL</span>
              </div>
            <div class="h-4 w-px bg-[#EEEEEE] hidden sm:block"></div>

            <!-- System Status Indicator (Hidden on smallest watches) -->
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-900 rounded-full border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all cursor-help group relative no-print">
            <div class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" style="will-change: transform, opacity;"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span class="text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest">System Ready</span>
              
              <!-- Tooltip -->
              <div class="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-left">
                 <div class="space-y-3">
                    <div class="flex justify-between items-center pb-2 border-b border-gray-800">
                       <span class="text-xs font-bold text-gray-300">CORE STATUS</span>
                       <span class="text-xs font-bold text-green-500 uppercase">Active</span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                       <div class="space-y-1">
                          <p class="text-xs text-gray-500 font-bold uppercase tracking-tighter">AI Node</p>
                          <p class="text-xs text-white">Stable</p>
                       </div>
                       <div class="space-y-1">
                          <p class="text-xs text-gray-500 font-bold uppercase tracking-tighter">Relay</p>
                          <p class="text-xs text-white">84ms</p>
                       </div>
                       <div class="space-y-1">
                          <p class="text-xs text-gray-500 font-bold uppercase tracking-tighter">Sync</p>
                          <p class="text-xs text-white">Verified</p>
                       </div>
                       <div class="space-y-1">
                          <p class="text-xs text-gray-500 font-bold uppercase tracking-tighter">Datastore</p>
                          <p class="text-xs text-white">Healthy</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button (click)="state.toggleLiveAgent(!state.isLiveAgentActive())"
                    aria-label="Toggle Live Agent"
                    class="group shrink-0 flex items-center gap-2 max-sm:px-2 max-sm:py-1.5 px-4 py-2 border transition-colors text-xs font-bold uppercase tracking-widest"
                    [class.bg-gray-800]="state.isLiveAgentActive()"
                    [class.dark:bg-white]="state.isLiveAgentActive()"
                    [class.border-gray-800]="state.isLiveAgentActive()"
                    [class.dark:border-white]="state.isLiveAgentActive()"
                    [class.text-white]="state.isLiveAgentActive()"
                    [class.dark:text-[#111111]]="state.isLiveAgentActive()"
                    [class.bg-transparent]="!state.isLiveAgentActive()"
                    [class.border-gray-300]="!state.isLiveAgentActive()"
                    [class.dark:border-zinc-700]="!state.isLiveAgentActive()"
                    [class.text-gray-700]="!state.isLiveAgentActive()"
                    [class.dark:text-zinc-300]="!state.isLiveAgentActive()"
                    [class.hover:bg-[#EEEEEE]]="!state.isLiveAgentActive()"
                    [class.dark:hover:bg-zinc-800]="!state.isLiveAgentActive()"
                    [class.hover:border-gray-400]="!state.isLiveAgentActive()"
                    [class.dark:hover:border-zinc-500]="!state.isLiveAgentActive()">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
              <span class="hidden sm:inline">Agent</span>
            </button>
            
            <button (click)="state.toggleResearchFrame()"
                    aria-label="Toggle Research Frame"
                    class="group shrink-0 flex items-center gap-2 max-sm:px-2 max-sm:py-1.5 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-[#EEEEEE] dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-2.29 0-4.43-.78-6.14-2.1C4.6 16.5 4 14.83 4 12c0-1.5.3-2.91.86-4.22L16.22 19.14A7.92 7.92 0 0 1 12 20m7.14-2.1C20.4 16.5 21 14.83 21 12c0-1.5-.3-2.91-.86-4.22L8.78 19.14C10.09 20.7 11.97 21.5 14 21.5c1.47 0 2.87-.42 4.14-1.14Z"/></svg>
              <span class="hidden sm:inline">Research</span>
            </button>
            
            <!-- Tour Guide Toggle -->
            <button (click)="tour.forceStart()" 
                    aria-label="Start Tour Guide"
                    title="Start Tour Guide"
                    class="group shrink-0 p-2 border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-gray-500 dark:text-zinc-400 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
            
            <!-- Theme Toggle -->
            <button (click)="cycleTheme()" 
                    aria-label="Toggle Theme"
                    [title]="'Theme: ' + theme.currentTheme()"
                    class="group shrink-0 p-2 border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-gray-500 dark:text-zinc-400 cursor-pointer">
              @switch (theme.currentTheme()) {
                 @case ('dark') {
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>   
                 }
                 @case ('light') {
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                 }
                 @case ('system') {
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                 }
              }
            </button>

            <div class="hidden sm:flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-zinc-400 pl-4 border-l border-gray-100 dark:border-zinc-800">
              <span>{{ today | date:'yyyy.MM.dd' }}</span>
              <span class="text-[#416B1F] dark:text-[#689F38] pr-2">REQ. DR. SMITH</span>
            </div>
          </div>
        </nav>

        <!-- New Patient Navigation Bar -->
        <nav class="h-12 border-b border-[#EEEEEE] dark:border-zinc-800 flex items-center px-3 sm:px-6 shrink-0 bg-gray-50 dark:bg-[#09090b] z-40 no-print gap-4">
           <div class="text-xs text-gray-500 dark:text-zinc-400 font-medium hidden sm:block">INTAKE MODULE 01</div>
           <div class="h-4 w-px bg-gray-300 dark:bg-zinc-700 hidden sm:block"></div>
           <div id="tour-patient-dropdown"><app-patient-dropdown></app-patient-dropdown></div>

           <div class="flex items-center gap-2 pr-2 pb-1 pt-1 -mb-1 -mt-1">
             <!-- EXPORT DROPDOWN -->
             <div class="relative group dropdown-container" (mouseenter)="exportMenuOpen.set(true)" (mouseleave)="exportMenuOpen.set(false)">
               <button class="snap-start shrink-0 flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-zinc-700 transition-colors text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-500 rounded-md">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                 <span>Export</span>
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 ml-1 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
               </button>
               
               @if (exportMenuOpen()) {
                 <div class="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                   <button (click)="exportPdf(); exportMenuOpen.set(false)" [disabled]="!hasReport()" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> As PDF
                   </button>
                   <button (click)="exportJson(); exportMenuOpen.set(false)" [disabled]="!hasReport()" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> As JSON
                   </button>
                   <button (click)="exportFhir(); exportMenuOpen.set(false)" [disabled]="!hasReport()" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> As FHIR
                   </button>
                 </div>
               }
             </div>

             <div class="w-px h-4 bg-gray-300 dark:bg-zinc-700 shrink-0 mx-1"></div>

             <!-- CONNECT DROPDOWN -->
             <div class="relative group dropdown-container" (mouseenter)="connectMenuOpen.set(true)" (mouseleave)="connectMenuOpen.set(false)">
               <button class="shrink-0 flex items-center gap-2 px-3 py-1.5 border border-[#4285F4]/20 dark:border-[#4285F4]/30 transition-colors text-[10px] font-bold uppercase tracking-widest text-[#4285F4] dark:text-[#4285F4] bg-[#4285F4]/5 dark:bg-[#4285F4]/10 hover:bg-[#4285F4]/10 dark:hover:bg-[#4285F4]/20 rounded-md">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                 <span>Integrations</span>
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 ml-1 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
               </button>

               @if (connectMenuOpen()) {
                 <div class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                   <button (click)="connectEpic(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#E33B44] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg> epic®
                   </button>
                   <button (click)="connectGoogleHealth(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#4285F4] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg> Health Connect
                   </button>
                   <button (click)="connectAppleHealth(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg> Apple Health
                   </button>
                   <button (click)="uploadData(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> Upload Data
                   </button>
                 </div>
               }
             </div>

             <div class="w-px h-4 bg-gray-300 dark:bg-zinc-700 shrink-0 mx-1"></div>

             <button (click)="finalizeRecord()"
                     id="tour-finalize-btn"
                     class="shrink-0 group flex items-center gap-2 px-3 py-1.5 border border-[#689F38]/20 dark:border-[#689F38]/30 transition-colors text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 text-[#689F38] dark:text-[#689F38] bg-[#689F38]/5 dark:bg-[#689F38]/10 hover:bg-[#689F38]/10 dark:hover:bg-[#689F38]/20 rounded-md">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               <span>Finalize & Archive</span>
             </button>
           </div>
        </nav>

        <!-- Main Grid Layout -->
        <div #mainContainer class="flex-1 flex flex-col md:flex-row max-md:overflow-visible overflow-y-auto md:overflow-hidden relative bg-[#F9FAFB] dark:bg-[#09090b] p-2 md:p-6 gap-3 md:gap-6 min-h-0">


          
          <!-- Column 1: Patient Medical Chart -->
           <div class="relative w-full md:h-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 md:overflow-hidden flex flex-col md:block flex-shrink-0"
                id="tour-body-chart"
               [class.md:flex-1]="isAnalysisCollapsed() || inputPanelWidth() === undefined"
               [class.transition-all]="!isDragging()"
               [class.duration-500]="!isDragging()"
               [class.ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]]="!isDragging()"
               [style.--panel-width.px]="isChartCollapsed() ? 0 : (isAnalysisCollapsed() ? null : inputPanelWidth())"
               [class.md:w-[var(--panel-width)]]="!isAnalysisCollapsed() && inputPanelWidth() !== undefined"
               [class.hidden]="isChartCollapsed()"
               [class.max-md:hidden]="!!state.selectedPartId()">
               <div class="md:h-full w-full md:overflow-hidden flex-1 flex flex-col min-h-0">
                 <app-medical-chart class="no-print md:h-full block md:overflow-y-auto w-full max-md:overflow-visible"></app-medical-chart>
               </div>
            </div>

            <!-- RESIZER V -->
            <div title="Drag to resize, Double-click to maximize chart" class="hidden md:flex w-2 shrink-0 items-center justify-center cursor-col-resize z-20 no-print group relative"
                 [class.md:hidden]="isChartCollapsed() || isAnalysisCollapsed()"
                 (mousedown)="startColumnDrag($event)"
                 (dblclick)="maximizeChart()">
                
                <!-- Full-width background bar -->
                <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-transparent group-hover:bg-gray-100/50 dark:group-hover:bg-zinc-800/50 transition-colors rounded-full z-0"></div>
                <div class="absolute inset-0 bg-gray-100/50 dark:bg-zinc-800/50 group-hover:bg-gray-200 dark:group-hover:bg-zinc-700 transition-colors rounded"></div>
                <!-- Handle -->
                <div class="h-12 w-1.5 rounded-full bg-gray-200 dark:bg-zinc-700 group-hover:bg-gray-300 dark:group-hover:bg-zinc-600 transition-colors relative z-10"></div>

                <!-- Quick Actions (V4) -->
                <div class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-3 bg-white dark:bg-zinc-900 shadow-xl border border-gray-200 dark:border-zinc-800 rounded-full p-1.5 z-30">
                   
                   <!-- Panel Management -->
                   <div class="flex flex-col gap-1 border-b border-gray-100 dark:border-zinc-800 pb-1.5 mb-0.5">
                      <button (click)="$event.stopPropagation(); toggleChart()" [class.bg-black]="!isChartCollapsed()" [class.dark:bg-white]="!isChartCollapsed()" [class.text-white]="!isChartCollapsed()" [class.dark:text-black]="!isChartCollapsed()"
                              title="Toggle Medical Chart" class="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path></svg>
                      </button>
                      <button (click)="$event.stopPropagation(); toggleAnalysis()" [class.bg-black]="!isAnalysisCollapsed()" [class.dark:bg-white]="!isAnalysisCollapsed()" [class.text-white]="!isAnalysisCollapsed()" [class.dark:text-black]="!isAnalysisCollapsed()"
                              title="Toggle Analysis Panel" class="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </button>
                      <button (click)="$event.stopPropagation(); maximizeChart()" class="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors" title="Maximize Chart">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m15 18-6-6 6-6"></path></svg>
                      </button>
                   </div>

                   
                </div>
            </div>

            <!-- Mobile Header: Back Button & Tabs -->
            @if (state.selectedPartId() && !state.isLiveAgentActive()) {
              <div class="w-full flex-col gap-3 shrink-0 z-20 hidden max-md:flex mb-3">
                <button (click)="goBackToChart()" class="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white self-start px-2 py-3 -ml-2 transition-colors min-h-[44px]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  <span>Back to Chart</span>
                </button>
                <div class="flex p-1.5 bg-gray-200 dark:bg-zinc-800 rounded-[10px] w-full">
                  <button (click)="mobileActiveTab.set('tasks')" 
                          class="flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-all shadow-sm min-h-[44px]"
                          [class.bg-white]="mobileActiveTab() === 'tasks'" [class.dark:bg-[#09090b]]="mobileActiveTab() === 'tasks'" [class.text-black]="mobileActiveTab() === 'tasks'" [class.dark:text-white]="mobileActiveTab() === 'tasks'"
                          [class.text-gray-500]="mobileActiveTab() !== 'tasks'" [class.dark:text-zinc-400]="mobileActiveTab() !== 'tasks'" [class.hover:text-gray-700]="mobileActiveTab() !== 'tasks'" [class.dark:hover:text-zinc-300]="mobileActiveTab() !== 'tasks'">
                    Tasks
                  </button>
                  <button (click)="mobileActiveTab.set('analysis')"
                          class="flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-all shadow-sm min-h-[44px]"
                          [class.bg-white]="mobileActiveTab() === 'analysis'" [class.dark:bg-[#09090b]]="mobileActiveTab() === 'analysis'" [class.text-black]="mobileActiveTab() === 'analysis'" [class.dark:text-white]="mobileActiveTab() === 'analysis'"
                          [class.text-gray-500]="mobileActiveTab() !== 'analysis'" [class.dark:text-zinc-400]="mobileActiveTab() !== 'analysis'" [class.hover:text-gray-700]="mobileActiveTab() !== 'analysis'" [class.dark:hover:text-zinc-300]="mobileActiveTab() !== 'analysis'">
                    Analysis
                  </button>
                </div>
              </div>
            }

            <!-- Column 2 (Middle): Task Flow & Intake Bracket -->
            @if (state.selectedPartId() && !state.isLiveAgentActive()) {
               <div class="shrink-0 w-full md:w-[400px] flex flex-col gap-3 md:gap-6 h-full z-20 transition-all duration-300"
                    [class.max-md:hidden]="mobileActiveTab() !== 'tasks'"
                    [class.tab-fade-enter]="mobileActiveTab() === 'tasks'">
                  <div id="tour-intake-form" class="flex-1 min-h-0 overflow-hidden rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <app-intake-form appReveal></app-intake-form>
                  </div>
                  <div class="flex-1 min-h-0 overflow-hidden rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <app-task-flow appReveal [revealDelay]="100"></app-task-flow>
                  </div>
               </div>
            }

             <!-- Column 3 (Right Area): Split View -->
            <div class="flex-1 md:flex-[1.5] flex md:overflow-hidden relative gap-3 md:gap-6 flex-col"
                 [class.hidden]="isAnalysisCollapsed()"
                 [class.max-md:hidden]="!!state.selectedPartId() && mobileActiveTab() !== 'analysis'"
                 [class.tab-fade-enter]="!!state.selectedPartId() && mobileActiveTab() === 'analysis'">
             
                 <!-- Section 1: Analysis Intake Container -->
                 <div class="overflow-hidden flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 transition-shadow duration-300 hover:shadow-md flex-1 md:min-h-0 min-h-[50dvh]">
                     <app-analysis-container class="block h-full min-h-0 min-w-0" appReveal [revealDelay]="100"></app-analysis-container>
                 </div>
            </div>

            <!-- Overlay: Full Screen Voice Assistant -->
            @if (state.isLiveAgentActive()) {
              <div class="fixed inset-0 z-[100] bg-white dark:bg-[#111111] flex flex-col transition-all duration-700 animate-in fade-in"
                   style="animation: intro-fullscreen 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;">
                  <app-voice-assistant class="block h-full w-full"></app-voice-assistant>
              </div>
            }

        </div>
        
        @if(state.isResearchFrameVisible()) {
            <app-research-frame></app-research-frame>
        }

    <!-- Preview & Print Modal -->
    @if (showPreviewModal()) {
      <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 no-print">
        <div class="bg-white dark:bg-[#09090b] w-full max-w-4xl max-h-[85dvh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-[#F9FAFB] dark:bg-zinc-900">
            <div>
              <h2 class="text-lg font-bold text-[#1C1C1C] dark:text-zinc-100">Preview & Print Care Plan</h2>
              <p class="text-xs uppercase font-bold text-gray-500 dark:text-zinc-400 tracking-wider mt-1">Review and edit finalized text before archiving</p>
            </div>
            <pocket-gull-button 
              variant="ghost" 
              size="sm" 
              (click)="closePreview()" 
              ariaLabel="Close Preview Modal"
              icon="M18 6L6 18M6 6l12 12">
            </pocket-gull-button>
          </div>
          <div class="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#09090b] relative">
             <div class="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <h3 class="block text-xs font-bold text-[#689F38] uppercase tracking-[0.15em]">Final Care Plan Document</h3>
                <div class="flex flex-col gap-1.5 w-full sm:w-auto mt-3 sm:mt-0">
                  <span class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-0.5">Cognitive Level</span>
                  <div class="flex flex-wrap bg-[#f4f4f5] dark:bg-zinc-900 p-1 rounded-lg border border-gray-200 dark:border-zinc-800 w-fit gap-1">
                    <button 
                      (click)="changeReadingLevel('standard')"
                      [disabled]="isTranslating()"
                      class="px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all duration-200 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#689F38]"
                      [ngClass]="selectedReadingLevel() === 'standard' ? 'bg-white dark:bg-zinc-800 text-[#689F38] shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'">
                      Standard
                    </button>
                    <button 
                      (click)="changeReadingLevel('simplified')"
                      [disabled]="isTranslating()"
                      class="px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all duration-200 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#689F38]"
                      [ngClass]="selectedReadingLevel() === 'simplified' ? 'bg-white dark:bg-zinc-800 text-[#689F38] shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'">
                      Simplified
                    </button>
                    <button 
                      (click)="changeReadingLevel('dyslexia')"
                      [disabled]="isTranslating()"
                      class="px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all duration-200 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#689F38]"
                      [ngClass]="selectedReadingLevel() === 'dyslexia' ? 'bg-white dark:bg-zinc-800 text-[#689F38] shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'">
                      Cognition
                    </button>
                    <button 
                      (click)="changeReadingLevel('child')"
                      [disabled]="isTranslating()"
                      class="px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all duration-200 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#689F38]"
                      [ngClass]="selectedReadingLevel() === 'child' ? 'bg-white dark:bg-zinc-800 text-[#689F38] shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'">
                      Pediatric
                    </button>
                  </div>
                </div>
             </div>
             
             <div class="relative grid gap-4 transition-all duration-300" [class.grid-cols-1]="selectedReadingLevel() === 'standard'" [class.sm:grid-cols-2]="selectedReadingLevel() !== 'standard'">
               
               @if (selectedReadingLevel() !== 'standard') {
                 <div class="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
                    <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Original (English)</label>
                    <pocket-gull-input
                      type="textarea"
                      [rows]="16"
                      [value]="originalPreviewText()"
                      (valueChange)="originalPreviewText.set($event)"
                      [disabled]="isTranslating()"
                      placeholder="No Active Care Plan recorded for this visit."
                      class="w-full">
                    </pocket-gull-input>
                 </div>
               }

               <div class="flex flex-col gap-1.5">
                  @if (selectedReadingLevel() !== 'standard') {
                     <label class="text-[10px] font-bold text-[#689F38] uppercase tracking-widest ml-1 animate-in fade-in duration-300">Translated / Adjusted Plan</label>
                  }
                  <pocket-gull-input
                    type="textarea"
                    [rows]="16"
                    [value]="previewText()"
                    (valueChange)="previewText.set($event)"
                    [disabled]="isTranslating()"
                    placeholder="No Active Care Plan recorded for this visit."
                    class="w-full">
                  </pocket-gull-input>
               </div>
               
               @if (isTranslating()) {
                 <div class="absolute inset-0 bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 rounded">
                    <div class="w-6 h-6 border-2 border-[#689F38] border-t-transparent rounded-full animate-spin"></div>
                    <p class="mt-2 text-xs font-bold text-[#689F38] uppercase tracking-wider animate-pulse">Translating...</p>
                 </div>
               }
               @if (translationError()) {
                  <div class="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest animate-in fade-in duration-300">
                    ⚠️ {{ translationError() }}
                  </div>
               }
             </div>
             
             <!-- NEW TRANSLATION ANALYSIS UI -->
             @if (selectedReadingLevel() !== 'standard') {
               <div class="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 animate-in fade-in duration-300">
                  <div class="flex flex-col gap-2 mb-2">
                    <div class="flex justify-between items-center">
                      <h4 class="text-[10px] font-bold text-[#689F38] uppercase tracking-widest">AI Translation Analysis</h4>
                      <pocket-gull-button 
                        (click)="analyzeCurrentTranslation()" 
                        [disabled]="isAnalyzingTranslation() || isTranslating()"
                        variant="secondary" 
                        size="sm" 
                        icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                        @if (isAnalyzingTranslation()) {
                          Analyzing...
                        } @else {
                          Analyze Translation
                        }
                      </pocket-gull-button>
                    </div>
                    @if (translationAnalysis()) {
                      <div class="p-3 bg-gray-50 dark:bg-zinc-900 rounded border border-gray-200 dark:border-zinc-800 text-sm text-gray-700 dark:text-zinc-300 animate-in slide-in-from-top-2 duration-300 whitespace-pre-wrap">
                         {{ translationAnalysis() }}
                      </div>
                    }
                  </div>
                  
                  <!-- PRINT STRATEGY TOGGLES -->
                  <div class="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4">
                    <label class="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" 
                             [checked]="includeAnalysisInPrint()" 
                             (change)="includeAnalysisInPrint.set(!includeAnalysisInPrint())"
                             class="w-4 h-4 text-[#689F38] rounded border-gray-300 focus:ring-[#689F38] dark:border-zinc-700 dark:bg-zinc-900" />
                      <span class="text-xs font-medium text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-zinc-100 transition-colors">Include AI Translation Analysis in Print</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" 
                             [checked]="includeOriginalInPrint()" 
                             (change)="includeOriginalInPrint.set(!includeOriginalInPrint())"
                             class="w-4 h-4 text-[#689F38] rounded border-gray-300 focus:ring-[#689F38] dark:border-zinc-700 dark:bg-zinc-900" />
                      <span class="text-xs font-medium text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-zinc-100 transition-colors">Include Original Clinical Plan in Print</span>
                    </label>
                  </div>
               </div>
             }
             
             <p class="text-xs text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider mt-3 pl-1">This text will be archived in the patient's chart as the final Care Plan for this visit.</p>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-[#F9FAFB] dark:bg-zinc-900 flex justify-between items-center">
            <pocket-gull-button 
              (click)="printReport()" 
              variant="secondary" 
              size="sm" 
              icon="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z">
              Print Plan
            </pocket-gull-button>
            <div class="flex items-center gap-3">
              <pocket-gull-button 
                (click)="closePreview()" 
                variant="ghost" 
                size="sm">
                Cancel
              </pocket-gull-button>
              <pocket-gull-button 
                (click)="confirmFinalize()" 
                variant="primary" 
                size="sm" 
                trailingIcon="M20 6L9 17l-5-5">
                Commit to Chart
              </pocket-gull-button>
            </div>
          </div>
        </div>
      </div>
    }

      </main>
    }
  </div>
  }
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    @keyframes intro-fullscreen {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AppComponent implements OnDestroy {
  public tour = inject(WalkthroughTourService);
  state = inject(PatientStateService);
  public theme = inject(ThemeService);
  private ngZone = inject(NgZone);
  private patientMgmt = inject(PatientManagementService);
  private clinicalIntelligence = inject(ClinicalIntelligenceService);
  private aiConfig = inject(AI_CONFIG, { optional: true });
  today = new Date();
  hasApiKey = signal<boolean>(!!this.aiConfig?.apiKey);
  isDemoMode = signal<boolean>(false);
  apiKeyInput = signal<string>('');
  showPassword = signal<boolean>(false);
  apiKeyError = signal<string | null>(null);
  isChartCollapsed = signal<boolean>(false);
  isAnalysisCollapsed = signal<boolean>(false);
  showFhirCallback = signal<boolean>(false);
  showAnalysisPdf = signal<boolean>(false);

  export = inject(ExportService);
  showExportMenu = signal(false);
  isSimplifying = signal(false);
  isSimplifyingChild = signal(false);

  // Finalize & Archive State
  showPreviewModal = signal(false);
  previewText = signal('');
  originalPreviewText = signal('');
  selectedReadingLevel = signal<'standard' | 'simplified' | 'dyslexia' | 'child'>('standard');
  isTranslating = signal<boolean>(false);
  translationAnalysis = signal<string>('');
  isAnalyzingTranslation = signal(false);
  translationError = signal<string | null>(null);
  includeAnalysisInPrint = signal<boolean>(true);
  includeOriginalInPrint = signal<boolean>(true);

  // Navbar Dropdown States
  exportMenuOpen = signal(false);
  connectMenuOpen = signal(false);

  hasReport = computed(() => Object.keys(this.clinicalIntelligence.analysisResults()).length > 0);

  exportPdf() {
    const results = this.clinicalIntelligence.analysisResults();
    const patient = this.patientMgmt.selectedPatient();
    const patientName = patient?.name || 'Clinical User';

    this.export.downloadAsPdf({
      report: results,
      summary: results['Summary Overview'] || 'No summary available.'
    }, patientName);
  }

  async exportSimplifiedPdf() {
    this.isSimplifying.set(true);
    try {
      const results = this.clinicalIntelligence.analysisResults();
      const patient = this.patientMgmt.selectedPatient();
      const patientName = patient?.name || 'Clinical User';

      const originalSummary = results['Summary Overview'] || 'No summary available.';
      const simplifiedSummary = await this.clinicalIntelligence.translateReadingLevel(originalSummary, 'dyslexia');

      this.export.downloadAsPdf({
        report: results,
        summary: simplifiedSummary
      }, patientName + ' (Cognition)');
    } catch (e) {
      console.error("Failed to generate simplified PDF", e);
      alert("Failed to generated simplified export. " + (e as Error).message);
    } finally {
      this.isSimplifying.set(false);
    }
  }

  async exportChildPdf() {
    this.isSimplifyingChild.set(true);
    try {
      const results = this.clinicalIntelligence.analysisResults();
      const patient = this.patientMgmt.selectedPatient();
      const patientName = patient?.name || 'Clinical User';

      const originalSummary = results['Summary Overview'] || 'No summary available.';
      const simplifiedSummary = await this.clinicalIntelligence.translateReadingLevel(originalSummary, 'child');

      this.export.downloadAsPdf({
        report: results,
        summary: simplifiedSummary
      }, patientName + ' (Pediatric Overview)');
    } catch (e) {
      console.error("Failed to generate child PDF", e);
      alert("Failed to generated child export. " + (e as Error).message);
    } finally {
      this.isSimplifyingChild.set(false);
    }
  }

  exportFhir() {
    const patient = this.patientMgmt.selectedPatient();
    if (patient) {
      this.export.downloadAsFhirBundle(patient);
    } else {
      // Fallback
      const results = this.clinicalIntelligence.analysisResults();
      this.export.downloadAsFhir({
        report: results,
        summary: results['Summary Overview']
      }, 'Clinical User');
    }
  }

  exportJson() {
    const patient = this.patientMgmt.selectedPatient();
    if (patient) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patient, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", patient.id + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  }

  connectEpic() {
    alert("Epic Integration placeholder: Connecting to Epic MyChart...");
  }

  connectGoogleHealth() {
    alert("Google Health Connect: Awaiting sync from Android Companion App...");
  }

  connectAppleHealth() {
    alert("Apple HealthKit: Awaiting sync from iOS Companion App...");
  }

  uploadData() {
    // Usually this triggers file upload dialog from patient-dropdown, but for now we'll trigger an alert or sync.
    alert("Upload data modal placeholder");
  }

  openFinalizePreview() {
    let plan = this.state.activePatientSummary();
    if (!plan) {
      const results = this.clinicalIntelligence.analysisResults();
      const annotations = this.state.lensAnnotations();
      
      if (Object.keys(results).length > 0) {
        plan = Object.entries(results).map(([lens, text]) => {
          let updatedText = text;
          const lensAnnots = annotations[lens];
          if (lensAnnots) {
            for (const [nodeKey, ann] of Object.entries(lensAnnots)) {
              if (ann.bracketState === 'removed') {
                updatedText = updatedText.replace(nodeKey, `~~${nodeKey}~~`);
              } else if (ann.modifiedText) {
                updatedText = updatedText.replace(nodeKey, ann.modifiedText);
              }
            }
          }
          return updatedText;
        }).join('\n\n');
      } else {
        plan = '';
      }
    }

    const draftItems = this.state.draftSummaryItems();
    if (draftItems.length > 0) {
      const newContent = draftItems.map(item => `- ${item.text}`).join('\n');
      plan = plan ? `${plan}\n\n### Draft Notes\n${newContent}` : `### Draft Notes\n${newContent}`;
    }

    const checklist = this.state.checklist();
    if (checklist.length > 0) {
      const clContent = checklist.map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`).join('\n');
      plan = plan ? `${plan}\n\n### Care Plan Instructions\n${clContent}` : `### Care Plan Instructions\n${clContent}`;
    }

    const dynamicNutrients = this.state.dynamicNutrients();
    if (dynamicNutrients.length > 0) {
      const tnContent = dynamicNutrients.map(item => `- **${item.name}**: ${item.value}`).join('\n');
      plan = plan ? `${plan}\n\n### Targeted Nutrients\n${tnContent}` : `### Targeted Nutrients\n${tnContent}`;
    }

    const oxStress = this.state.oxidativeStressMarkers();
    if (oxStress.length > 0) {
      const oxContent = oxStress.map(item => `- **${item.name}**: ${item.value}`).join('\n');
      plan = plan ? `${plan}\n\n### Oxidative Stress Markers\n${oxContent}` : `### Oxidative Stress Markers\n${oxContent}`;
    }

    const antiox = this.state.antioxidantSources();
    if (antiox.length > 0) {
      const antioxContent = antiox.map(item => `- **${item.name}**: ${item.value}`).join('\n');
      plan = plan ? `${plan}\n\n### Antioxidant Sources\n${antioxContent}` : `### Antioxidant Sources\n${antioxContent}`;
    }

    const meds = this.state.medications();
    if (meds.length > 0) {
      const medsContent = meds.map(item => `- **${item.name}**: ${item.value}`).join('\n');
      plan = plan ? `${plan}\n\n### Medications\n${medsContent}` : `### Medications\n${medsContent}`;
    }
    
    const finalText = plan || 'No Active Patient Summary recorded for this visit.';
    this.previewText.set(finalText);
    this.originalPreviewText.set(finalText);
    this.selectedReadingLevel.set('standard');
    this.showPreviewModal.set(true);
  }

  closePreview() {
    this.showPreviewModal.set(false);
  }

  async changeReadingLevel(levelOrEvent: string | Event) {
    let level: 'standard' | 'simplified' | 'dyslexia' | 'child';
    if (typeof levelOrEvent === 'string') {
      level = levelOrEvent as 'standard' | 'simplified' | 'dyslexia' | 'child';
    } else {
      level = (levelOrEvent.target as HTMLSelectElement).value as 'standard' | 'simplified' | 'dyslexia' | 'child';
    }
    
    this.selectedReadingLevel.set(level);
    this.translationAnalysis.set('');
    this.translationError.set(null);

    if (level === 'standard') {
      this.previewText.set(this.originalPreviewText());
      return;
    }

    this.isTranslating.set(true);
    try {
      const translated = await this.clinicalIntelligence.translateReadingLevel(this.originalPreviewText(), level);
      this.previewText.set(translated);
      // Automatically analyze the new translation
      await this.analyzeCurrentTranslation();
    } catch (error) {
      console.error("Translation failed", error);
      this.translationError.set("Failed to translate plan. Please try again or check your connection.");
      if (this.previewText().trim() === '') {
        this.previewText.set(this.originalPreviewText());
      }
    } finally {
      this.isTranslating.set(false);
    }
  }

  async analyzeCurrentTranslation() {
    if (!this.previewText() || !this.originalPreviewText()) return;
    this.isAnalyzingTranslation.set(true);
    this.translationAnalysis.set('');
    try {
      const analysis = await this.clinicalIntelligence.analyzeTranslation(
        this.originalPreviewText(),
        this.previewText()
      );
      this.translationAnalysis.set(analysis);
    } catch (e) {
      console.error("Translation analysis failed", e);
      this.translationAnalysis.set("Analysis failed. Please try again.");
    } finally {
      this.isAnalyzingTranslation.set(false);
    }
  }

  printReport() {
    const p = this.patientMgmt.selectedPatient();
    const vitals = this.state.vitals();
    let textToPrint = this.previewText();
    const level = this.selectedReadingLevel();

    if (level !== 'standard') {
      const levelNames = {
        'simplified': 'Simplified (6th Grade)',
        'dyslexia': 'Cognition (Dyslexia-Friendly)',
        'child': 'Child (Pediatric)'
      };
      
      let compositePlan = `## COGNITIVE LEVEL PLAN: ${levelNames[level]?.toUpperCase() || level.toUpperCase()}\n\n`;
      compositePlan += `${textToPrint}\n\n`;

      if (this.includeAnalysisInPrint()) {
        const analysis = this.translationAnalysis();
        if (analysis) {
          compositePlan += `---\n\n### AI Translation Analysis\n${analysis}\n\n`;
        }
      }

      if (this.includeOriginalInPrint()) {
        compositePlan += `---\n\n### Original Clinical Plan (Provider Reference)\n${this.originalPreviewText()}`;
      }
      
      textToPrint = compositePlan;
    }

    this.export.downloadCarePlanPdf(
      textToPrint,
      p?.name ?? 'Patient',
      {
        bp: vitals.bp || undefined,
        hr: vitals.hr || undefined,
        temp: vitals.temp || undefined,
        spO2: vitals.spO2 || undefined,
        weight: vitals.weight || undefined,
      },
      p?.preexistingConditions ?? []
    );
  }

  confirmFinalize() {
    this.state.updateActivePatientSummary(this.originalPreviewText());
    if (this.state.draftSummaryItems().length > 0) {
      this.state.clearDraftSummaryItems();
    }
    this.finalizeChart();
    this.closePreview();
  }

  finalizeChart() {
    const patientId = this.patientMgmt.selectedPatientId();
    if (!patientId) return;

    const chartState = this.state.getCurrentState();

    const historyEntry = {
      type: 'ChartArchived' as const,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      summary: 'Medical chart finalized and archived for this visit.',
      state: chartState,
      finalText: this.originalPreviewText(),
      translatedText: this.selectedReadingLevel() !== 'standard' ? this.previewText() : undefined,
      readingLevel: this.selectedReadingLevel()
    };

    this.patientMgmt.addHistoryEntry(patientId, historyEntry);
  }

  finalizeRecord() {
    this.openFinalizePreview();
  }

  cycleTheme() {
    const current = this.theme.currentTheme();
    if (current === 'system') this.theme.setTheme('light');
    else if (current === 'light') this.theme.setTheme('dark');
    else this.theme.setTheme('system');
  }

  isSyncing = signal<boolean>(false);

  async syncToMobile() {
    this.isSyncing.set(true);
    try {
      await this.patientMgmt.syncToCloud();
      // Optional: Show a brief success message or handle it centrally
    } catch (e) {
      console.error('Failed to sync to mobile', e);
    } finally {
      this.isSyncing.set(false);
    }
  }

  // --- Resizable Panel State ---
  mainContainer = viewChild<ElementRef<HTMLDivElement>>('mainContainer');

  // Vertical Panel Resizing (Column)
  inputPanelWidth = signal<number | undefined>(undefined);
  isDraggingColumn = signal<boolean>(false);
  private initialColumnDragX = 0;
  private initialInputPanelWidth = 0;

  // New Voice Column Resizing
  voiceColWidth = signal<number | undefined>(undefined);
  isDraggingVoiceCol = signal<boolean>(false);
  private initialVoiceDragX = 0;
  private initialVoiceWidth = 0;

  private lastContainerHeight = 0;
  private lastContainerWidth = 0;
  private boundOnWindowResize: (() => void) | null = null;
  private resizeDebounceTimer: any = null;

  isMobile = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  mobileActiveTab = signal<'tasks' | 'analysis'>('tasks');

  goBackToChart(): void {
    this.state.selectPart(null);
  }

  isViewingVisitDetails = computed(() => {
    const pastVisit = this.state.viewingPastVisit();
    // Show details view only when a visit is being reviewed AND no specific part has been selected yet.
    return pastVisit && (pastVisit.type === 'Visit' || pastVisit.type === 'ChartArchived') && !this.state.selectedPartId();
  });

  isDragging = computed(() => this.isDraggingColumn());

  private boundDoColumnDrag = this.doColumnDrag.bind(this);
  private boundStopColumnDrag = this.stopColumnDrag.bind(this);

  private boundDoVoiceColDrag = this.doVoiceColDrag.bind(this);
  private boundStopVoiceColDrag = this.stopVoiceColDrag.bind(this);

  constructor() {
    afterNextRender(async () => {
      if (typeof window === 'undefined') return;

      if (window.location.pathname === '/fhir-callback') {
        this.showFhirCallback.set(true);
        return;
      }

      this.isMobile.set(window.innerWidth < 768);

      // 1. Check for server-injected key (Cloud Run production)
      if ((window as any).GEMINI_API_KEY) {
        this.hasApiKey.set(true);
      }

      // 2. Check for stored API key in localStorage (manual entry)
      if (!this.hasApiKey()) {
        try {
          const storedKey = localStorage.getItem('GEMINI_API_KEY');
          if (storedKey) {
            this.hasApiKey.set(true);
          }
        } catch (e) { /* ignore */ }
      }

      // 3. Also check AI Studio key selection (dev environment)
      await this.checkApiKey();

      // Set up window resize listener for responsive layout
      this.boundOnWindowResize = this.onWindowResize.bind(this);
      window.addEventListener('resize', this.boundOnWindowResize);

      // Initialize WebMCP Polyfill
      initializeWebMCPPolyfill();

      if (navigator.modelContext) {
        // Register generate_medical_summary
        navigator.modelContext.registerTool({
          name: 'generate_medical_summary',
          description: 'Generates a medical summary for the current patient based on the provided clinical notes and current patient data.',
          inputSchema: {
            type: 'object',
            properties: {}
          },
          execute: async (params: any) => {
            try {
              const patientDataStr = this.state.getAllDataForPrompt();
              const report = await this.clinicalIntelligence.generateComprehensiveReport(patientDataStr);
              return {
                content: [{ type: 'text', text: JSON.stringify(report) }]
              };
            } catch (e: any) {
              return {
                content: [{ type: 'text', text: `Failed to generate summary: ${e.message}` }],
                isError: true
              };
            }
          }
        });

        // Register translate_clinical_text
        navigator.modelContext.registerTool({
          name: 'translate_clinical_text',
          description: 'Translates a clinical text to a specific reading level (e.g. simplified, child, dyslexia).',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string', description: 'The clinical text to translate.' },
              targetLevel: { type: 'string', enum: ['simplified', 'child', 'dyslexia'], description: 'The target reading level.' }
            },
            required: ['text', 'targetLevel']
          },
          execute: async (params: any) => {
            try {
              // Validate targetLevel
              if (!['simplified', 'child', 'dyslexia'].includes(params.targetLevel)) {
                throw new Error("Invalid targetLevel. Must be one of: 'simplified', 'child', 'dyslexia'.");
              }
              const translation = await this.clinicalIntelligence.translateReadingLevel(params.text, params.targetLevel);
              return {
                content: [{ type: 'text', text: translation }]
              };
            } catch (e: any) {
              return {
                content: [{ type: 'text', text: `Failed to translate text: ${e.message}` }],
                isError: true
              };
            }
          }
        });

        // Register get_current_patient_data
        navigator.modelContext.registerTool({
          name: 'get_current_patient_data',
          description: 'Retrieves the current patient data context being viewed in the application.',
          inputSchema: {
            type: 'object',
            properties: {}
          },
          execute: async () => {
            const patientData = this.state.getCurrentState();
            return {
              content: [{ type: 'text', text: JSON.stringify(patientData, null, 2) }]
            };
          }
        });

        // Register navigate_to_body_part
        navigator.modelContext.registerTool({
          name: 'navigate_to_body_part',
          description: 'Navigates the UI to focus on a specific body part and opens the analysis tab.',
          inputSchema: {
            type: 'object',
            properties: {
              partId: { type: 'string', description: 'The ID of the body part to navigate to (e.g., "head", "right_knee").' }
            },
            required: ['partId']
          },
          execute: async (params: any) => {
            try {
              if (BODY_PART_NAMES[params.partId]) {
                this.ngZone.run(() => {
                  this.state.selectPart(params.partId);
                  this.mobileActiveTab.set('analysis');
                });
                return { content: [{ type: 'text', text: `Successfully navigated to ${BODY_PART_NAMES[params.partId]}` }] };
              } else {
                throw new Error(`Invalid body part ID: ${params.partId}`);
              }
            } catch (e: any) {
              return { content: [{ type: 'text', text: `Failed to navigate: ${e.message}` }], isError: true };
            }
          }
        });

        // Register inject_clinical_note
        navigator.modelContext.registerTool({
          name: 'inject_clinical_note',
          description: 'Injects structured clinical data (a note) for a specific body part.',
          inputSchema: {
            type: 'object',
            properties: {
              partId: { type: 'string', description: 'The ID of the body part (e.g., "right_knee").' },
              painLevel: { type: 'number', description: 'Pain level from 0 to 10.' },
              description: { type: 'string', description: 'Clinical observations or description of the issue.' },
              recommendation: { type: 'string', description: 'Recommended treatments or next steps.' }
            },
            required: ['partId', 'painLevel', 'description']
          },
          execute: async (params: any) => {
            try {
              const partName = BODY_PART_NAMES[params.partId] || 'Selection';
              const newNoteId = `note_${Date.now()}`;
              const newNote = {
                id: params.partId,
                noteId: newNoteId,
                name: partName.toUpperCase(),
                painLevel: params.painLevel,
                description: params.description,
                symptoms: [],
                recommendation: params.recommendation || ''
              };
              this.ngZone.run(() => {
                this.state.updateIssue(params.partId, newNote);
                this.state.selectPart(params.partId);
                this.state.selectNote(newNoteId);
                this.mobileActiveTab.set('tasks');
              });
              return { content: [{ type: 'text', text: `Successfully injected clinical note for ${partName}` }] };
            } catch (e: any) {
              return { content: [{ type: 'text', text: `Failed to inject note: ${e.message}` }], isError: true };
            }
          }
        });

        // Register trigger_sync
        navigator.modelContext.registerTool({
          name: 'trigger_sync',
          description: 'Triggers a data sync to the mobile application cloud backend.',
          inputSchema: { type: 'object', properties: {} },
          execute: async () => {
            try {
              this.ngZone.run(() => {
                this.syncToMobile();
              });
              return { content: [{ type: 'text', text: 'Sync process initiated successfully.' }] };
            } catch (e: any) {
              return { content: [{ type: 'text', text: `Failed to initiate sync: ${e.message}` }], isError: true };
            }
          }
        });

        // Register research_clinical_term
        navigator.modelContext.registerTool({
          name: 'research_clinical_term',
          description: 'Initiates a deep search for a clinical term or question in the Research Frame.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The clinical term or question to research.' }
            },
            required: ['query']
          },
          execute: async (params: any) => {
            try {
              this.ngZone.run(() => {
                this.state.requestResearchSearch(params.query);
              });
              return { content: [{ type: 'text', text: `Initiated research for: ${params.query}` }] };
            } catch (e: any) {
              return { content: [{ type: 'text', text: `Failed to initiate research: ${e.message}` }], isError: true };
            }
          }
        });

        // Register load_research_url
        navigator.modelContext.registerTool({
          name: 'load_research_url',
          description: 'Loads a specific URL into the Research Frame (e.g., from a previous search result).',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'The URL to load.' }
            },
            required: ['url']
          },
          execute: async (params: any) => {
            try {
              this.ngZone.run(() => {
                this.state.requestResearchUrl(params.url);
                this.state.toggleResearchFrame(true);
              });
              return { content: [{ type: 'text', text: `Loaded URL: ${params.url}` }] };
            } catch (e: any) {
              return { content: [{ type: 'text', text: `Failed to load URL: ${e.message}` }], isError: true };
            }
          }
        });

        // Register add_research_bookmark
        navigator.modelContext.registerTool({
          name: 'add_research_bookmark',
          description: "Pre-stages a relevant literature link in the patient's bookmarks.",
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'The title of the bookmark.' },
              url: { type: 'string', description: 'The URL of the bookmark.' },
              authors: { type: 'string', description: 'The authors of the literature.' },
              doi: { type: 'string', description: 'The DOI of the literature.' },
              isPeerReviewed: { type: 'boolean', description: 'Whether the literature is peer-reviewed.' },
              cited: { type: 'boolean', description: 'Whether to include in summary references.' }
            },
            required: ['title', 'url']
          },
          execute: async (params: any) => {
            try {
              this.ngZone.run(() => {
                this.patientMgmt.addBookmark({
                  title: params.title,
                  url: params.url,
                  authors: params.authors,
                  doi: params.doi,
                  isPeerReviewed: params.isPeerReviewed || false,
                  cited: params.cited !== undefined ? params.cited : true
                });
              });
              return { content: [{ type: 'text', text: `Added bookmark: ${params.title}` }] };
            } catch (e: any) {
              return { content: [{ type: 'text', text: `Failed to add bookmark: ${e.message}` }], isError: true };
            }
          }
        });
      }
    });

    // Auto-expand analysis when a part is selected or clicked
    effect(() => {
      this.state.uiExpandTrigger(); // Listen to explicit selection actions
      const partId = this.state.selectedPartId();
      if (partId) {
        untracked(() => {
          this.isAnalysisCollapsed.set(false);
          this.isChartCollapsed.set(false);
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.boundOnWindowResize) {
      window.removeEventListener('resize', this.boundOnWindowResize);
    }
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
  }

  private onWindowResize(): void {
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
    this.resizeDebounceTimer = setTimeout(() => {
      if (typeof window === 'undefined') return;
      this.isMobile.set(window.innerWidth < 768);

      // If window resizes, revert panels back to their flexible, percentage-based dimensions
      this.inputPanelWidth.set(undefined);
      this.voiceColWidth.set(undefined);
    }, 150);
  }

  async checkApiKey() {
    if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (hasKey) this.hasApiKey.set(true);
    }
  }

  async selectKey() {
    if (typeof window.aistudio?.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      this.hasApiKey.set(true);
    }
  }

  submitApiKey() {
    const key = this.apiKeyInput().trim();
    if (!key) return;
    if (!key.startsWith('AI') || key.length < 20) {
      this.apiKeyError.set('This does not look like a valid Gemini API key. Keys typically start with "AI".');
      return;
    }
    try {
      localStorage.setItem('GEMINI_API_KEY', key);
    } catch (e) { /* ignore */ }
    this.apiKeyError.set(null);
    this.isDemoMode.set(false);
    // Force GeminiProvider to reinitialise with the new key on next call
    this.hasApiKey.set(true);
  }

  loadDemoMode() {
    this.isDemoMode.set(true);
    this.hasApiKey.set(true);
    // Load demo patient (Sarah Jenkins – p002)
    this.patientMgmt.selectPatient('p002');
    // Inject pre-baked analysis outputs (no API call)
    setTimeout(() => {
      this.clinicalIntelligence.loadArchivedAnalysis(DEMO_ANALYSIS_REPORT);
      // Start tour after data is loaded so targets exist in DOM
      setTimeout(() => this.tour.start(), 400);
    }, 350);
  }

  exitDemoMode() {
    this.isDemoMode.set(false);
    this.hasApiKey.set(false);
    this.apiKeyInput.set('');
  }

  toggleChart() {
    this.isChartCollapsed.update(v => !v);
  }

  toggleAnalysis() {
    this.isAnalysisCollapsed.update(v => !v);
  }

  maximizeChart() {
    this.isChartCollapsed.set(false);
    this.isAnalysisCollapsed.set(true);
  }

  maximizeAnalysis() {
    this.isChartCollapsed.set(true);
    this.isAnalysisCollapsed.set(false);
  }

  // --- Column Resizing Logic ---
  startColumnDrag(event: MouseEvent): void {
    event.preventDefault();
    this.isDraggingColumn.set(true);
    this.initialColumnDragX = event.clientX;

    if (this.inputPanelWidth() === undefined) {
      const panelEl = (event.target as HTMLElement).previousElementSibling as HTMLElement;
      this.initialInputPanelWidth = panelEl.offsetWidth;
      this.inputPanelWidth.set(this.initialInputPanelWidth);
    } else {
      this.initialInputPanelWidth = this.inputPanelWidth()!;
    }

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', this.boundDoColumnDrag);
    document.addEventListener('mouseup', this.boundStopColumnDrag, { once: true });
  }

  private doColumnDrag(event: MouseEvent): void {
    if (!this.isDraggingColumn()) return;

    const deltaX = event.clientX - this.initialColumnDragX;
    const containerWidth = this.mainContainer()?.nativeElement.offsetWidth ?? window.innerWidth;

    const newWidth = this.initialInputPanelWidth + deltaX;
    const minInputWidth = 400;
    const minAnalysisWidth = 320;
    const resizerWidth = 8;
    const maxInputWidth = containerWidth - minAnalysisWidth - resizerWidth;
    this.inputPanelWidth.set(Math.max(minInputWidth, Math.min(newWidth, maxInputWidth)));
  }

  private stopColumnDrag(): void {
    this.isDraggingColumn.set(false);
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.boundDoColumnDrag);

    // Snappy behavior: if released near the center (55%), snap to it
    const containerWidth = this.mainContainer()?.nativeElement.offsetWidth ?? window.innerWidth;
    const currentPercent = (this.inputPanelWidth() / containerWidth) * 100;

    if (Math.abs(currentPercent - 50) < 5) {
      this.inputPanelWidth.set(containerWidth * 0.50);
    }
  }

  resetColumnWidth(): void {
    this.inputPanelWidth.set(undefined);
  }

  // --- Voice Column Resizing Logic ---
  startVoiceColDrag(event: MouseEvent): void {
    event.preventDefault();
    this.isDraggingVoiceCol.set(true);
    this.initialVoiceDragX = event.clientX;

    if (this.voiceColWidth() === undefined) {
      const panelEl = (event.target as HTMLElement).nextElementSibling as HTMLElement;
      this.initialVoiceWidth = panelEl.offsetWidth;
      this.voiceColWidth.set(this.initialVoiceWidth);
    } else {
      this.initialVoiceWidth = this.voiceColWidth()!;
    }

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', this.boundDoVoiceColDrag);
    document.addEventListener('mouseup', this.boundStopVoiceColDrag, { once: true });
  }

  private doVoiceColDrag(event: MouseEvent): void {
    if (!this.isDraggingVoiceCol()) return;

    // We drag FROM the left side of the right column, so pulling Left (negative delta) INCREASES width
    const deltaX = event.clientX - this.initialVoiceDragX;
    const newWidth = this.initialVoiceWidth - deltaX;

    const minWidth = 300;
    const maxWidth = 800;

    const computedNewWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    this.voiceColWidth.set(computedNewWidth);
  }

  private stopVoiceColDrag(): void {
    this.isDraggingVoiceCol.set(false);
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.boundDoVoiceColDrag);
  }
}
