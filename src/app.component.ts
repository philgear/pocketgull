import { Component, ChangeDetectionStrategy, inject, computed, signal, viewChild, ElementRef, afterNextRender, effect, ChangeDetectorRef, untracked, OnDestroy, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalIcons } from './assets/clinical-icons';
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
import { AI_CONFIG, IAiProviderConfig } from './services/ai-provider.types';
import { IntelligenceProviderToken } from './services/ai/intelligence.provider.token';
import { GeminiProvider } from './services/ai/gemini.provider';
import { ClinicalIntelligenceService } from './services/clinical-intelligence.service';
import { PatientManagementService } from './services/patient-management.service';
import { ThemeService } from './services/theme.service';
import { NetworkStateService } from './services/network-state.service';
import { HardwareTelemetryService } from './services/hardware-telemetry.service';
import { ExportService } from './services/export.service';
import { RevealDirective } from './directives/reveal.directive';
import { DEMO_ANALYSIS_REPORT_WESTERN } from './demo-data';
import { PatientDirectoryComponent } from './components/patient-directory.component';
import { FhirCallbackComponent } from './components/fhir-callback.component';
import { WalkthroughTourComponent } from './components/walkthrough-tour.component';
import { WalkthroughTourService } from './services/walkthrough-tour.service';
import { SecureSplashComponent } from './components/secure-splash.component';
import { SessionStateService } from './services/session-state.service';
import { RulesEngineService } from './services/rules-engine.service';
import { PocketGullInputComponent } from './components/shared/pocket-gull-input.component';

import { initializeWebMCPPolyfill } from '@mcp-b/webmcp-polyfill';
import { PetAuditoryService } from './services/pet-auditory.service';
import { StressInterventionService } from './services/stress-intervention.service';
import { CollaborationService } from './services/collaboration.service';
import { CollaborationDockComponent } from './components/collaboration-dock.component';
import { GamificationService } from './services/gamification.service';
import { SwUpdate } from '@angular/service-worker';
import { FitbitService } from './services/fitbit.service';
import { ConsentService } from './services/consent.service';
import { ConsentModalComponent } from './components/consent-modal.component';
import { SynthesisDashboardComponent } from './components/synthesis/synthesis-dashboard.component';
import { ResearchTabComponent } from './components/research-tab.component';
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
    ResearchTabComponent,
    IntakeFormComponent,
    VoiceAssistantComponent,
    RevealDirective,
    WalkthroughTourComponent,
    SecureSplashComponent,
    PatientDirectoryComponent,
    CollaborationDockComponent,
    FhirCallbackComponent,
    PocketGullInputComponent,
    ConsentModalComponent,
    SynthesisDashboardComponent
  ],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `

    <!-- ACM §1.6: First-run informed consent -->
    @if (!showSplash() && !consentService.hasConsented()) {
      <app-consent-modal></app-consent-modal>
    }

    @if (showFhirCallback()) {
      <app-fhir-callback></app-fhir-callback>
    } @else {
    <div class="min-h-[100dvh] md:h-[100dvh] w-full bg-[#EEEEEE] dark:bg-zinc-950 text-[#1C1C1C] dark:text-zinc-100 flex flex-col md:overflow-hidden font-sans selection:bg-green-100 selection:text-green-900 group/app">
      
      @if (isDirectoryOpen() || !patientMgmt.selectedPatientId()) {
         @defer (on immediate) {
           <app-patient-directory></app-patient-directory>
         }
      }

      @defer (on idle) {
        <app-dictation-modal></app-dictation-modal>
      }
      @defer (on idle) {
        <app-walkthrough-tour></app-walkthrough-tour>
      }
      
      <!-- Collaboration Dock -->
      <app-collaboration-dock></app-collaboration-dock>
      
      @if (showSplash()) {
        <app-secure-splash
          [apiKeyError]="apiKeyError()"
          [hasApiKey]="hasApiKey()"
          (submitKey)="apiKeyInput.set($event); submitApiKey()"
          (loadDemo)="loadDemoMode()"
          (selectAiStudio)="selectKey()"
          (emergencyBypass)="handleEmergencyBypass()">
        </app-secure-splash>
      } @else {
        @if (state.isEmergencyMode()) {
          <main class="flex-1 flex flex-col min-w-0 min-h-0 relative bg-[#F9FAFB] dark:bg-[#09090b] p-4 sm:p-6 overflow-y-auto">
            <div class="mb-4 flex items-center justify-between no-print">
              <button (click)="state.isEmergencyMode.set(false); session.isLocked.set(true)" class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                Exit Emergency Mode
              </button>
              <div class="flex items-center gap-2 px-3 py-1 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 rounded-full">
                <div class="relative flex h-2 w-2">
                  <span class="absolute inline-flex h-full w-full rounded-full opacity-75 bg-red-500 animate-ping"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
                <span class="text-[12px] font-bold text-red-655 dark:text-red-400 uppercase tracking-widest">First Aid Mode</span>
              </div>
            </div>
            <app-analysis-container class="block h-full w-full"></app-analysis-container>
          </main>
        } @else {
          <main class="flex-1 flex flex-col min-w-0 min-h-0 relative group/main"> <!-- Main Content -->
        <!-- Offline Banner -->
        @if (!network.isOnline()) {
          <!-- Spectral P1-Critical (640nm red) offline banner -->
          <div class="border-b px-4 py-2 flex items-center justify-between gap-4 no-print shrink-0"
               style="background-color: var(--spectral-critical-bg); border-color: var(--spectral-critical-border);">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" style="color: var(--spectral-critical);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l22 22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
              <p class="text-xs font-medium" style="color: var(--spectral-critical);">You are currently offline. Certain AI features and cloud sync may be disabled.</p>
            </div>
            @if (network.forceOffline()) {
                <button (click)="network.toggleForceOffline()" class="text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors rounded px-2 py-1"
                        style="color: var(--spectral-critical); border: 1px solid var(--spectral-critical-border); background: white;">Reconnect</button>
            }
          </div>
        }

        <!-- ═══ Google Health Informed Consent Modal ═══════════════════════════════ -->
        @if (fitbit.showConsentModal()) {
          <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="consent-title">
            <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <!-- Header -->
              <div class="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B0B9] to-blue-600 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div>
                    <h2 id="consent-title" class="text-base font-bold text-gray-900 dark:text-gray-100">Google Health Data Access — Informed Consent</h2>
                    <p class="text-xs text-gray-500 dark:text-zinc-400">Required before connecting your health data</p>
                  </div>
                </div>
              </div>
              <!-- Body -->
              <div class="px-6 py-4 space-y-4 text-sm text-gray-700 dark:text-zinc-300">
                <div class="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 p-4">
                  <p class="font-semibold text-blue-900 dark:text-blue-300 mb-2">What data will be accessed:</p>
                  <ul class="space-y-1.5">
                    <li class="flex items-start gap-2"><svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Resting Heart Rate (bpm) — daily summary, last 30 days</li>
                    <li class="flex items-start gap-2"><svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Oxygen Saturation / SpO₂ (%) — daily average, last 30 days</li>
                    <li class="flex items-start gap-2"><svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Sleep duration (minutes) &amp; efficiency — nightly summary, last 30 days</li>
                  </ul>
                </div>
                <div class="space-y-2">
                  <p><span class="font-semibold">Purpose:</span> Clinical intelligence features in PocketGull — biometric trend analysis, care plan optimization, and AI-assisted consultation support.</p>
                  <p><span class="font-semibold">Data handling:</span> Health data is held in server memory only during your session and is never written to permanent storage, sold, shared with third parties, or used for advertising.</p>
                  <p><span class="font-semibold">Security:</span> Data is transmitted over HTTPS. Tokens are stored in memory only (ephemeral — cleared on server restart).</p>
                  <p><span class="font-semibold">Your rights:</span> You may withdraw at any time via Integrations → Google Health Disconnect. Selecting "Disconnect &amp; Erase Data" will permanently remove all synced health data from this session.</p>
                  <p><span class="font-semibold">Contact:</span> <a href="mailto:privacy@pocketgull.app" class="text-blue-600 dark:text-blue-400 underline">privacy@pocketgull.app</a></p>
                </div>
                <div class="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-3 text-xs text-amber-800 dark:text-amber-300">
                  <strong>Note:</strong> Google Health API scopes are classified as Restricted. Your own personal data is accessible immediately. Production use with other users requires Google's privacy review.
                </div>
              </div>
              <!-- Footer -->
              <div class="px-6 pb-6 pt-2 flex flex-col gap-2">
                <button id="btn-consent-accept" (click)="fitbit.acceptConsent()" class="w-full py-3 px-4 bg-gradient-to-r from-[#00B0B9] to-blue-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  I Understand &amp; Consent — Connect Google Health
                </button>
                <button id="btn-consent-decline" (click)="fitbit.declineConsent()" class="w-full py-2.5 px-4 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors">
                  Cancel — Do not connect
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Fitbit Health Syncing Toast -->
        @if (isGHealthSyncing()) {
          <div class="border-b px-6 py-3 flex items-center justify-between no-print shrink-0 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" class="opacity-25"></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-[0.1em] text-blue-800 dark:text-blue-300">Synchronizing Fitbit Health Data</h3>
                <p class="text-[12px] text-blue-600 dark:text-blue-400/80">Transferring and transforming patient records, vital logs, and Fitbit metrics between PocketGull and Google Cloud Healthcare FHIR Store...</p>
              </div>
            </div>
          </div>
        }

        <!-- Fitbit Health Sync Success Toast -->
        @if (showGHealthSuccess()) {
          <div class="border-b px-6 py-3 flex items-center justify-between no-print shrink-0 bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-[0.1em] text-green-800 dark:text-green-300">Fitbit Health Sync Successful</h3>
                <p class="text-[12px] text-green-600 dark:text-green-500/80">Patient demographics, historical conditions, and Fitbit vital logs successfully synchronized with Google Cloud Healthcare FHIR Store.</p>
              </div>
            </div>
            <button (click)="showGHealthSuccess.set(false)" class="p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors text-green-700 dark:text-green-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        }

        <!-- Google Health Sync Error Toast -->
        @if (showGHealthError(); as errorMsg) {
          <div class="border-b px-6 py-3 flex items-center justify-between no-print shrink-0 bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-[0.1em] text-red-800 dark:text-red-300">Google Health Sync Failed</h3>
                <p class="text-[12px] text-red-600 dark:text-red-500/80">{{ errorMsg }}</p>
              </div>
            </div>
            <button (click)="showGHealthError.set(null)" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors text-red-700 dark:text-red-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        }

        <!-- AWS HealthLake Syncing Toast -->
        @if (isAwsSyncing()) {
          <div class="border-b px-6 py-3 flex items-center justify-between no-print shrink-0 bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50 animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" class="opacity-25"></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-[0.1em] text-amber-800 dark:text-amber-300">Synchronizing to AWS HealthLake</h3>
                <p class="text-[12px] text-amber-600 dark:text-amber-400/80">Transforming medical data to FHIR resources and uploading to AWS HealthLake...</p>
              </div>
            </div>
          </div>
        }

        <!-- AWS HealthLake Sync Success Toast -->
        @if (showAwsSuccess()) {
          <div class="border-b px-6 py-3 flex items-center justify-between no-print shrink-0 bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-[0.1em] text-green-800 dark:text-green-300">AWS HealthLake Sync Successful</h3>
                <p class="text-[12px] text-green-600 dark:text-green-500/80">Patient demographics, historical conditions, and vital logs successfully archived in AWS HealthLake FHIR Store.</p>
              </div>
            </div>
            <button (click)="showAwsSuccess.set(false)" class="p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors text-green-700 dark:text-green-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        }

        <!-- AWS HealthLake Sync Error Toast -->
        @if (showAwsError(); as errorMsg) {
          <div class="border-b px-6 py-3 flex items-center justify-between no-print shrink-0 bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-[0.1em] text-red-800 dark:text-red-300">AWS HealthLake Sync Failed</h3>
                <p class="text-[12px] text-red-600 dark:text-red-500/80">{{ errorMsg }}</p>
              </div>
            </div>
            <button (click)="showAwsError.set(null)" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors text-red-700 dark:text-red-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        }

        <!-- Spectral P2-Urgent (585nm amber) demo mode banner -->
        @if (isDemoMode()) {
          <div class="border-b px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 no-print shrink-0"
               style="background-color: var(--spectral-urgent-bg); border-color: var(--spectral-urgent-border);">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" style="color: var(--spectral-urgent);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p class="text-xs font-medium" style="color: var(--spectral-urgent);">Demo Mode <span class="hidden sm:inline">— Showing pre-sampled patient data. AI analysis generation requires an API key.</span></p>
            </div>
            <div class="flex items-center gap-3">
              <button (click)="exitDemoMode()" class="text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors" style="color: var(--spectral-urgent);">Enter API Key →</button>
            </div>
          </div>
        }
        <!-- Navbar: Pure utility, no decoration -->
        <nav class="h-14 border-b border-[#EEEEEE] dark:border-zinc-800 flex items-center justify-between px-3 sm:px-6 shrink-0 bg-white dark:bg-[#111111] z-50 no-print">
          <div class="flex items-center gap-4">
              <div class="flex items-center gap-3">
                  <svg width="42" height="42" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
                      <!-- Far Wing (Teal) -->
                      <polygon points="50,40 65,15 58,45" fill="#3ebc9e" stroke="#2fa085" stroke-width="0.5" stroke-linejoin="round" />
                      <!-- Tail (Light gray paper) -->
                      <polygon points="20,50 50,40 10,35" fill="#e5e5e5" stroke="#d5d5d5" stroke-width="0.5" stroke-linejoin="round" />
                      <!-- Body Base (White paper) -->
                      <polygon points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f4" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round" />
                      <!-- Near Wing Upper (Coral) -->
                      <polygon points="50,40 58,45 35,85" fill="#ef6658" stroke="#df5648" stroke-width="0.5" stroke-linejoin="round" />
                      <!-- Near Wing Fold (Darker Coral) -->
                      <polygon points="50,40 35,85 20,50" fill="#d85547" stroke="#c84537" stroke-width="0.5" stroke-linejoin="round" />
                      <!-- Neck/Head (White paper) -->
                      <polygon points="75,55 58,45 85,38" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round" />
                      <!-- Beak (Golden-Amber Orange) -->
                      <polygon points="85,38 82,45 95,34" fill="#faa63b" stroke="#e0902c" stroke-width="0.5" stroke-linejoin="round" />
                  </svg>
                  <span class="font-medium text-[#1C1C1C] dark:text-zinc-100 tracking-[0.15em] text-sm hidden sm:inline">POCKET GULL</span>
              </div>
            <div class="h-4 w-px bg-[#EEEEEE] hidden sm:block"></div>



            <!-- System Status Indicator (Hidden on smallest watches) -->
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-900 rounded-full border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all cursor-pointer group relative no-print" 
                 (click)="network.toggleForceOffline()"
                 [title]="network.isOnline() ? 'Click to simulate offline' : 'Click to disable offline override'">
            <div class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full rounded-full opacity-75" 
                    [style.background-color]="network.isOnline() ? 'var(--spectral-stable)' : 'var(--spectral-critical)'"
                    [class.animate-ping]="network.isOnline()"
                    style="will-change: transform, opacity;"></span>
              <span class="relative inline-flex rounded-full h-2 w-2"
                    [style.background-color]="network.isOnline() ? 'var(--spectral-stable)' : 'var(--spectral-critical)'"></span>
            </div>
            <span class="text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest">{{ network.isOnline() ? 'System Ready' : 'System Offline' }}</span>
              
              <!-- Tooltip -->
              <div class="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-left">
                 <div class="space-y-3">
                    <div class="flex justify-between items-center pb-2 border-b border-gray-800">
                       <span class="text-xs font-bold text-gray-300">CORE STATUS</span>
                       <span class="text-xs font-bold text-green-500 uppercase">Active</span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                       <div class="space-y-1">
                          <p class="text-xs text-gray-500 font-bold uppercase tracking-tighter">AI Node</p>
                           <p class="text-xs text-white">{{ network.activeProvider() }}</p>
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
                     
                     <!-- Hardware GPU & CPU Telemetry -->
                     @if (hardware.primaryGpu(); as gpu) {
                       <div class="pt-2 mt-2 border-t border-gray-800 space-y-2">
                         <div class="flex justify-between items-center">
                           <span class="text-[12px] font-bold text-gray-400 uppercase tracking-wider">GPU ACCELERATOR</span>
                           <span class="text-[12px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono uppercase font-bold">{{ gpu.vendor }}</span>
                         </div>
                         <p class="text-[12px] text-zinc-100 font-mono truncate font-medium">{{ gpu.name }}</p>
                         <div class="grid grid-cols-2 gap-2 text-[12px]">
                           <div>
                             <span class="text-zinc-500 block uppercase text-[12px] font-bold tracking-tighter">VRAM Usage</span>
                             <span class="text-zinc-300 font-mono">{{ gpu.memoryUsedMiB }} / {{ gpu.memoryTotalMiB }} MB</span>
                           </div>
                           <div>
                             <span class="text-zinc-500 block uppercase text-[12px] font-bold tracking-tighter">Utilization</span>
                             <span class="text-zinc-300 font-mono">{{ gpu.utilizationPercent }}% @ {{ gpu.temperatureC }}°C</span>
                           </div>
                         </div>
                         <div class="pt-1 text-[12px] text-zinc-500 border-t border-zinc-800/50 flex justify-between">
                           <span>Recommended Path:</span>
                           <span class="text-green-400 font-mono uppercase font-bold">{{ hardware.recommendedExecutionPath() }}</span>
                         </div>
                       </div>
                     }
                     
                     <div class="pt-2 mt-2 border-t border-gray-800 text-[12px] space-y-1 text-zinc-400">
                       <div class="flex justify-between">
                         <span class="text-zinc-500">Host CPU:</span>
                         <span class="truncate max-w-[120px] text-right font-mono" [title]="hardware.telemetry()?.cpuName || 'Searching...'">{{ hardware.telemetry()?.cpuName || 'Detecting...' }}</span>
                       </div>
                       <div class="flex justify-between">
                         <span class="text-zinc-500">CPU / RAM:</span>
                         <span class="font-mono">{{ hardware.telemetry()?.cpuLoadPercent }}% | {{ hardware.telemetry()?.systemMemoryUsedGb }}/{{ hardware.telemetry()?.systemMemoryTotalGb }} GB</span>
                       </div>
                     </div>
                     <div class="pt-2 mt-1 border-t border-gray-800 flex flex-col gap-2">
                         <button (click)="network.togglePreferLocalInference(); $event.stopPropagation()"
                                 [disabled]="!network.isOnline()"
                                 class="flex items-center justify-between text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed pointer-events-auto cursor-pointer"
                                 [class.text-green-400]="!network.preferLocalInference()"
                                 [class.text-amber-400]="network.preferLocalInference()">
                            <span>{{ network.preferLocalInference() ? '⚡ Use Cloud Gemini' : '🖥 Use Local PubGemma' }}</span>
                            <span>→</span>
                         </button>
                        <a href="/docs/study/" target="_blank" rel="noopener" class="flex items-center justify-between text-xs font-bold text-gray-400 hover:text-green-400 transition-colors pointer-events-auto cursor-pointer">
                           <span>VIEW DOCS</span>
                           <span>→</span>
                        </a>
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
                    aria-label="Research"
                    class="group shrink-0 flex items-center gap-2 max-sm:px-2 max-sm:py-1.5 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-[#EEEEEE] dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-2.29 0-4.43-.78-6.14-2.1C4.6 16.5 4 14.83 4 12c0-1.5.3-2.91.86-4.22L16.22 19.14A7.92 7.92 0 0 1 12 20m7.14-2.1C20.4 16.5 21 14.83 21 12c0-1.5-.3-2.91-.86-4.22L8.78 19.14C10.09 20.7 11.97 21.5 14 21.5c1.47 0 2.87-.42 4.14-1.14Z"/></svg>
              <span class="hidden sm:inline">Research</span>
            </button>

            <button (click)="state.toggleSynthesisDashboard()"
                    aria-label="Synthesize"
                    class="group shrink-0 flex items-center gap-2 max-sm:px-2 max-sm:py-1.5 px-4 py-2 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              <span class="hidden sm:inline">Synthesize</span>
            </button>
            
            <a href="/docs/study/" target="_blank" rel="noopener"
               aria-label="Docs"
               class="group shrink-0 flex items-center gap-2 max-sm:px-2 max-sm:py-1.5 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-[#EEEEEE] dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span class="hidden sm:inline">Docs</span>
            </a>
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
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                 }
                 @case ('system') {
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                 }
                 @case ('spark') {
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#FF6F3D] animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                     <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
                   </svg>
                 }
              }
            </button>
 
            <div class="hidden sm:flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-zinc-400 pl-4 border-l border-gray-100 dark:border-zinc-800">
              <!-- Gamified Points & Level HUD capsule -->
              <div class="relative group tracking-normal">
                <div class="flex items-center gap-2.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-full hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer shadow-sm select-none">
                  <div class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                  <span class="text-[12px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                    {{ game.levelTitle() }} (Lvl {{ game.level() }})
                  </span>
                  <span class="text-[12px] font-mono font-bold text-[#689F38]">
                    {{ game.points() }} XP
                  </span>
                  
                  <!-- Tiny progress bar -->
                  <div class="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shrink-0">
                    <div class="h-full bg-amber-500 transition-all duration-500" [style.width.%]="game.progressPercentage()"></div>
                  </div>
                </div>

                <!-- Hover Details Tooltip Panel -->
                <div class="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl p-4 hidden group-hover:flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div class="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
                    <span class="text-xs font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Clinician Progress</span>
                    <span class="text-xs font-bold text-amber-500">Lvl {{ game.level() }}</span>
                  </div>

                  <!-- Next Objective -->
                  <div class="p-2.5 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg border border-amber-500/10">
                    <span class="text-[12px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Current Objective:</span>
                    <p class="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-normal mt-0.5">
                      {{ game.nextStepText() }}
                    </p>
                  </div>

                  <!-- Quests list -->
                  <div class="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    @for (q of game.quests(); track q.id) {
                      <div class="flex items-start justify-between gap-2 text-xs">
                        <div class="flex items-start gap-1.5 min-w-0">
                          <span class="mt-0.5" [class.text-emerald-500]="q.completed" [class.text-zinc-300]="!q.completed">
                            @if (q.completed) {
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                            } @else {
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /></svg>
                            }
                          </span>
                          <div class="min-w-0">
                            <div class="font-bold truncate" [class.text-zinc-400]="q.completed" [class.text-zinc-800]="!q.completed" [class.dark:text-zinc-200]="!q.completed" [class.dark:text-zinc-500]="q.completed">{{ q.name }}</div>
                            <div class="text-[12px] text-zinc-500 leading-tight">{{ q.description }}</div>
                          </div>
                        </div>
                        <span class="text-[12px] font-mono shrink-0" [class.text-zinc-400]="q.completed" [class.text-amber-500]="!q.completed">+{{ q.xpReward }} XP</span>
                      </div>
                    }
                  </div>

                  <!-- Reset -->
                  <div class="border-t border-gray-100 dark:border-zinc-800 pt-2 flex justify-between items-center text-[12px]">
                    <span class="text-zinc-500 font-mono">Progress stored locally</span>
                    <button (click)="game.reset()" class="text-red-500 hover:underline uppercase font-bold tracking-wider">
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <span>{{ today | date:'yyyy.MM.dd' }}</span>
              <span class="text-[#416B1F] dark:text-[#689F38] pr-2">REQ. DR. SMITH</span>
            </div>
          </div>
        </nav>

        <!-- New Patient Navigation Bar -->
        <nav class="h-12 border-b border-[#EEEEEE] dark:border-zinc-800 flex items-center px-3 sm:px-6 shrink-0 bg-gray-50 dark:bg-[#09090b] z-40 no-print gap-2 sm:gap-4">
           <div class="text-xs text-gray-500 dark:text-zinc-400 font-medium hidden sm:block">INTAKE MODULE 01</div>
           <div class="h-4 w-px bg-gray-300 dark:bg-zinc-700 hidden sm:block"></div>
           <div id="tour-patient-dropdown"><app-patient-dropdown></app-patient-dropdown></div>

           <div class="flex items-center gap-2 pr-2 pb-1 pt-1 -mb-1 -mt-1 ml-auto">
             <!-- EXPORT DROPDOWN -->
             <div class="relative group dropdown-container" (mouseenter)="exportMenuOpen.set(true)" (mouseleave)="exportMenuOpen.set(false)">
               <button
                       class="snap-start shrink-0 flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-zinc-700 transition-colors text-[12px] font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-500 rounded-md">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                 <span class="hidden sm:inline">Export</span>
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 ml-1 transition-transform group-hover:rotate-180 hidden sm:inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
               </button>
               
               @if (exportMenuOpen()) {
                 <div class="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
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

             <div class="w-px h-4 bg-gray-300 dark:bg-zinc-700 shrink-0 mx-1 hidden sm:block"></div>

             <!-- CONNECT DROPDOWN -->
             <div class="relative group dropdown-container" (mouseenter)="connectMenuOpen.set(true)" (mouseleave)="connectMenuOpen.set(false)">
               <button
                       class="shrink-0 flex items-center gap-2 px-3 py-1.5 border border-[#4285F4]/20 dark:border-[#4285F4]/30 transition-colors text-[12px] font-bold uppercase tracking-widest text-[#4285F4] dark:text-[#4285F4] bg-[#4285F4]/5 dark:bg-[#4285F4]/10 hover:bg-[#4285F4]/10 dark:hover:bg-[#4285F4]/20 rounded-md">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                 <span class="hidden sm:inline">Integrations</span>
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 ml-1 transition-transform group-hover:rotate-180 hidden sm:inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
               </button>

               @if (connectMenuOpen()) {
                 <div class="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                   <button (click)="connectEpic(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#E33B44] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg> epic®
                   </button>
                    @if (!fitbit.isConnected()) {
                      <button id="btn-fitbit-connect" (click)="fitbit.initiateAuth(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#00B0B9] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        Google Health Connect
                      </button>
                    } @else {
                      <button id="btn-fitbit-sync" (click)="fitbit.sync(); connectMenuOpen.set(false)" [disabled]="fitbit.isSyncing()" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#00B0B9] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" [class.animate-spin]="fitbit.isSyncing()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
                        {{ fitbit.isSyncing() ? 'Syncing...' : 'Google Health Sync' }}
                      </button>
                      <button id="btn-fitbit-disconnect" (click)="fitbit.revoke(false); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-600 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64A9 9 0 0 1 20.77 15"/><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                        Disconnect
                      </button>
                      <button id="btn-fitbit-purge" (click)="fitbit.revoke(true); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-500 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        Disconnect & Erase Data
                      </button>
                    }
                    <button (click)="connectAwsHealth(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#FF9900] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg> AWS HealthLake
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

             <div class="w-px h-4 bg-gray-300 dark:bg-zinc-700 shrink-0 mx-1 hidden sm:block"></div>

             <button (click)="finalizeRecord()"
                    
                     id="tour-finalize-btn"
                     class="shrink-0 group flex items-center gap-2 px-3 py-1.5 border border-[#689F38]/20 dark:border-[#689F38]/30 transition-colors text-[12px] font-bold uppercase tracking-widest disabled:opacity-50 text-[#689F38] dark:text-[#689F38] bg-[#689F38]/5 dark:bg-[#689F38]/10 hover:bg-[#689F38]/10 dark:hover:bg-[#689F38]/20 rounded-md">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               <span class="hidden sm:inline">Finalize & Archive</span>
             </button>
           </div>
        </nav>


        <!-- Main Grid Layout -->
        <div #mainContainer class="flex-1 flex flex-col md:flex-row max-md:overflow-visible overflow-y-auto md:overflow-hidden relative bg-[#F9FAFB] dark:bg-[#09090b] p-2 md:p-6 gap-3 md:gap-6 min-h-0">


          
          <!-- Column 1: IPatient Medical Chart -->
           <div class="relative w-full md:h-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 md:overflow-hidden flex flex-col md:block flex-shrink-0"
                id="tour-body-chart"
               [class.md:flex-1]="isAnalysisCollapsed() || inputPanelWidth() === undefined || state.isSparkModeActive()"
               [class.transition-all]="!isDragging()"
               [class.duration-500]="!isDragging()"
               [class.ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]]="!isDragging()"
               [style.--panel-width.px]="isChartCollapsed() ? 0 : (isAnalysisCollapsed() ? null : inputPanelWidth())"
               [class.md:w-[var(--panel-width)]]="!isAnalysisCollapsed() && inputPanelWidth() !== undefined && !state.isSparkModeActive()"
               [class.hidden]="isChartCollapsed()"
               [class.max-md:hidden]="!!state.selectedPartId() && !state.isSparkModeActive()">
               <div class="md:h-full w-full md:overflow-hidden flex-1 flex flex-col min-h-0">
                 @defer {
                   <app-medical-chart class="no-print md:h-full block md:overflow-y-auto w-full max-md:overflow-visible"></app-medical-chart>
                 } @placeholder {
                   <div class="h-full w-full flex items-center justify-center text-zinc-400 text-xs uppercase tracking-widest font-bold">Loading Chart Engine...</div>
                 }
               </div>
            </div>

            <!-- RESIZER V -->
            <div title="Drag to resize, Double-click to maximize chart" class="hidden md:flex w-2 shrink-0 items-center justify-center cursor-col-resize z-20 no-print group"
                 [class.relative]="!isChartCollapsed() && !isAnalysisCollapsed()"
                 [class.absolute]="isChartCollapsed() || isAnalysisCollapsed()"
                 [class.h-full]="isChartCollapsed() || isAnalysisCollapsed()"
                 [class.left-0]="isChartCollapsed()"
                 [class.right-0]="isAnalysisCollapsed()"
                 [class.top-0]="isChartCollapsed() || isAnalysisCollapsed()"
                 (mousedown)="startColumnDrag($event)"
                 (dblclick)="maximizeChart()">
                
                <!-- Full-width background bar -->
                <div class="absolute inset-y-0 w-4 bg-transparent group-hover:bg-gray-100/50 dark:group-hover:bg-zinc-800/50 transition-colors rounded-full z-0"
                     [class.left-1/2]="!isChartCollapsed() && !isAnalysisCollapsed()"
                     [class.-translate-x-1/2]="!isChartCollapsed() && !isAnalysisCollapsed()"
                     [class.left-0]="isChartCollapsed()"
                     [class.right-0]="isAnalysisCollapsed()"></div>
                <div class="absolute inset-0 bg-gray-100/50 dark:bg-zinc-800/50 group-hover:bg-gray-200 dark:group-hover:bg-zinc-700 transition-colors rounded"></div>
                <!-- Handle -->
                <div class="h-12 w-1.5 rounded-full bg-gray-200 dark:bg-zinc-700 group-hover:bg-gray-300 dark:group-hover:bg-zinc-600 transition-colors relative z-10"></div>

                <!-- Quick Actions (V4) -->
                <div class="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-3 bg-white dark:bg-zinc-900 shadow-xl border border-gray-200 dark:border-zinc-800 rounded-full p-1.5 z-30"
                     [class.left-1/2]="!isChartCollapsed() && !isAnalysisCollapsed()"
                     [class.-translate-x-1/2]="!isChartCollapsed() && !isAnalysisCollapsed()"
                     [class.left-0]="isChartCollapsed()"
                     [class.translate-x-2]="isChartCollapsed()"
                     [class.right-0]="isAnalysisCollapsed()"
                     [class.-translate-x-2]="isAnalysisCollapsed()">
                   
                   <!-- Panel Management -->
                   <div class="flex flex-col gap-1 border-b border-gray-100 dark:border-zinc-800 pb-1.5 mb-0.5">
                      <button (click)="$event.stopPropagation(); maximizeChart()" [class.bg-black]="!isChartCollapsed() && isAnalysisCollapsed()" [class.dark:bg-white]="!isChartCollapsed() && isAnalysisCollapsed()" [class.text-white]="!isChartCollapsed() && isAnalysisCollapsed()" [class.dark:text-black]="!isChartCollapsed() && isAnalysisCollapsed()"
                              title="Maximize Medical Chart" class="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path></svg>
                      </button>
                      <button (click)="$event.stopPropagation(); maximizeAnalysis()" [class.bg-black]="isChartCollapsed() && !isAnalysisCollapsed()" [class.dark:bg-white]="isChartCollapsed() && !isAnalysisCollapsed()" [class.text-white]="isChartCollapsed() && !isAnalysisCollapsed()" [class.dark:text-black]="isChartCollapsed() && !isAnalysisCollapsed()"
                              title="Maximize Analysis Panel" class="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </button>
                      <button (click)="$event.stopPropagation(); showSplitView()" [class.bg-black]="!isChartCollapsed() && !isAnalysisCollapsed()" [class.dark:bg-white]="!isChartCollapsed() && !isAnalysisCollapsed()" [class.text-white]="!isChartCollapsed() && !isAnalysisCollapsed()" [class.dark:text-black]="!isChartCollapsed() && !isAnalysisCollapsed()" class="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors" title="Split View">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>
                      </button>
                   </div>

                   
                </div>
            </div>

            <!-- Mobile Header: Back Button & Tabs -->
            @if (state.selectedPartId() && !state.isLiveAgentActive() && !state.isSparkModeActive()) {
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
            @if (state.selectedPartId() && !state.isLiveAgentActive() && !state.isSparkModeActive()) {
               <div class="shrink-0 w-full md:w-[400px] flex flex-col gap-3 md:gap-6 h-full z-20 transition-all duration-300"
                    [class.max-md:hidden]="mobileActiveTab() !== 'tasks'"
                    [class.tab-fade-enter]="mobileActiveTab() === 'tasks'">
                  <div id="tour-intake-form" class="flex-1 min-h-0 overflow-hidden rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    @defer {
                      <app-intake-form appReveal></app-intake-form>
                    } @placeholder {
                      <div class="h-full flex items-center justify-center text-zinc-400 text-xs uppercase tracking-widest font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 m-4 rounded-xl">Loading Intake...</div>
                    }
                  </div>
                  <div class="flex-1 min-h-0 overflow-hidden rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    @defer {
                      <app-task-flow appReveal [revealDelay]="100"></app-task-flow>
                    } @placeholder {
                      <div class="h-full flex items-center justify-center text-zinc-400 text-xs uppercase tracking-widest font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 m-4 rounded-xl">Loading Tasks...</div>
                    }
                  </div>
               </div>
            }

            <div class="flex-1 md:flex-[1.5] flex md:overflow-hidden relative gap-3 md:gap-6 flex-col"
                 [class.hidden]="isAnalysisCollapsed()"
                 [class.max-md:hidden]="!!state.selectedPartId() && mobileActiveTab() !== 'analysis'"
                 [class.tab-fade-enter]="!!state.selectedPartId() && mobileActiveTab() === 'analysis'">
             
                 <!-- Section 1: Analysis Intake Container -->
                 <div class="overflow-hidden flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 transition-shadow duration-300 hover:shadow-md flex-1 md:min-h-0 min-h-[50dvh]"
                      [class.rounded-none]="isChartCollapsed()"
                      [class.border-y-0]="isChartCollapsed()"
                      [class.border-r-0]="isChartCollapsed()"
                      [class.shadow-none]="isChartCollapsed()"
                      [class.bg-[#F9FAFB]]="isChartCollapsed()"
                      [class.dark:bg-[#09090b]]="isChartCollapsed()">
                     @defer {
                       <app-analysis-container class="block h-full min-h-0 min-w-0" appReveal [revealDelay]="100"></app-analysis-container>
                     } @placeholder {
                       <div class="h-full flex items-center justify-center text-zinc-400 text-xs uppercase tracking-widest font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 m-4 rounded-xl">Loading Core AI Synthesis...</div>
                     }
                 </div>
                 
                 @if (intelligence.researchHits()) {
                   <div class="overflow-hidden flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 transition-shadow duration-300 hover:shadow-md h-[300px] shrink-0">
                     <app-research-tab class="block h-full" [hits]="intelligence.researchHits()"></app-research-tab>
                   </div>
                 }
            </div>

            <!-- Pocket: Floating Voice Assistant -->
            @if (state.isLiveAgentActive()) {
              <!-- Background backdrop blur -->
              <div class="fixed inset-0 z-[99] bg-black/10 dark:bg-black/30 backdrop-blur-[2px] animate-in fade-in" (click)="state.toggleLiveAgent(false)"></div>
              
              <!-- Animation Styles for Folding -->
              <style>
                @keyframes origami-unfold {
                    0% { transform: scaleY(0.1) rotateX(80deg) rotateZ(-10deg); opacity: 0; }
                    60% { transform: scaleY(1.1) rotateX(-15deg) rotateZ(5deg); opacity: 1; }
                    100% { transform: scaleY(1) rotateX(0deg) rotateZ(0deg); opacity: 1; }
                }
                @keyframes fly-out-pocket {
                    0% { transform: translateY(100px) scale(0.2) rotate(-20deg); opacity: 0; }
                    60% { transform: translateY(-15px) scale(1.1) rotate(10deg); opacity: 1; }
                    100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
                }
                .origami-fold {
                    animation: origami-unfold 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                    transform-style: preserve-3d;
                }
                .fly-out {
                    animation: fly-out-pocket 1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
                .fold-1 { animation-delay: 150ms; }
                .fold-2 { animation-delay: 300ms; }
                .fold-3 { animation-delay: 450ms; }
                .fold-4 { animation-delay: 600ms; }
              </style>

              <!-- The Pocket Container -->
              <div class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] sm:w-[420px] h-[650px] max-h-[calc(100dvh-4rem)] z-[100] flex flex-col transition-all duration-500 animate-in slide-in-from-bottom-10 fade-in pointer-events-none">
                 
                 <!-- Perched Origami Seagull -->
                 <div class="relative w-full h-24 pointer-events-auto flex justify-center items-end pb-0 translate-y-[4px] z-[101]" style="perspective: 1000px;">
                    <svg class="w-28 h-28 drop-shadow-[0_10px_10px_rgba(20,50,90,0.3)] fly-out" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <g fill-rule="evenodd" stroke="#1E3A5F" stroke-width="2.5" stroke-linejoin="round">
                            <!-- Right Wing (Back) -->
                            <polygon points="107,95 140,50 115,85" fill="#C5D9ED" class="origami-fold fold-4 origin-[60%_45%]" />
                            <polygon points="140,50 115,85 130,100" fill="#E6F0FA" class="origami-fold fold-3 origin-[60%_45%]" />

                            <!-- Left Wing (Front raised) -->
                            <polygon points="40,35 60,65 30,55" fill="#FFFFFF" class="origami-fold fold-4 origin-[35%_35%]" />
                            <polygon points="40,35 85,60 60,65" fill="#FFFFFF" class="origami-fold fold-3 origin-[40%_35%]" />
                            <polygon points="85,60 107,95 60,65" fill="#DAE8F5" class="origami-fold fold-2 origin-[40%_35%]" />
                            <polygon points="60,65 107,95 90,115" fill="#FFFFFF" class="origami-fold fold-1 origin-[50%_50%]" />

                            <!-- Tail -->
                            <polygon points="45,130 65,110 55,145" fill="#FFFFFF" class="origami-fold fold-4 origin-[30%_65%]" />
                            <polygon points="65,110 55,145 90,115" fill="#E6F0FA" class="origami-fold fold-3 origin-[35%_65%]" />

                            <!-- Body -->
                            <polygon points="65,110 90,115 107,95" fill="#FFFFFF" class="origami-fold origin-[50%_60%]" />
                            <polygon points="90,115 107,95 125,105" fill="#FFFFFF" class="origami-fold origin-[50%_60%]" />
                            <polygon points="90,115 125,105 120,130" fill="#C5D9ED" class="origami-fold origin-[55%_60%]" />

                            <!-- Head/Beak -->
                            <polygon points="107,95 122,90 125,105" fill="#FFFFFF" class="origami-fold fold-1 origin-[60%_50%]" />
                            <polygon points="122,90 135,93 125,105" fill="#FFFFFF" class="origami-fold fold-2 origin-[60%_50%]" />
                            <polygon points="125,105 135,93 140,110" fill="#E6F0FA" class="origami-fold fold-2 origin-[60%_50%]" />
                            <polygon points="135,93 150,100 133,102" fill="#E6F0FA" class="origami-fold fold-3 origin-[65%_50%]" />
                        </g>
                    </svg>
                 </div>
                 
                 <!-- The Pocket Window styled like the Origami Theme -->
                 <div class="flex-1 w-full bg-gradient-to-br from-[#E1EAF4] to-[#C9DEEE] dark:from-[#0F172A] dark:to-[#1E293B] rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(30,58,95,0.4)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-[3px] border-white dark:border-[#334155] overflow-hidden pointer-events-auto flex flex-col relative ring-1 ring-[#1E3A5F]/10 dark:ring-black/50">
                    <!-- Embedded Voice Assistant logic takes over inner bounds transparently -->
                    @defer (on immediate) {
                      <app-voice-assistant id="tour-voice-assistant" class="block h-full w-full mix-blend-normal bg-white/70 dark:bg-black/50 backdrop-blur-md"></app-voice-assistant>
                    }
                 </div>
              </div>
            }

        </div>
        
        @if(state.isResearchFrameVisible()) {
            @defer (on immediate) {
              <app-research-frame></app-research-frame>
            }
        }

        @if(state.isSynthesisDashboardVisible()) {
            @defer (on immediate) {
              <app-synthesis-dashboard></app-synthesis-dashboard>
            }
        }


    <!-- Preview & Print Modal (Dieter Rams Style) -->
    @if (showPreviewModal()) {
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 no-print">
        <div class="bg-[#f9f9f9] dark:bg-[#111111] w-full max-w-5xl max-h-[90dvh] rounded-[2px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-[0.98] duration-300 border border-gray-300 dark:border-zinc-800 relative print-medical-chart">
          
          <!-- Classic Dieter Rams Grill -->
          <div class="absolute top-0 left-0 right-0 h-1 flex gap-0.5 px-6 opacity-40">
             <div class="flex-1 bg-gray-400 dark:bg-zinc-600"></div><div class="flex-1 bg-gray-400 dark:bg-zinc-600"></div><div class="flex-1 bg-gray-400 dark:bg-zinc-600"></div><div class="flex-1 bg-gray-400 dark:bg-zinc-600"></div>
          </div>

          <!-- Header -->
          <div class="px-8 pt-6 pb-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-start bg-transparent">
            <div>
              <div class="flex items-center gap-3 mb-1">
                 <div class="w-2 h-2 rounded-full bg-[#ff4500] animate-pulse shadow-[0_0_8px_rgba(255,69,0,0.6)]"></div>
                 <h2 class="text-[12px] font-bold text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-[0.2em] font-mono">Care Plan Archiver</h2>
              </div>
              <p class="text-[12px] uppercase font-bold text-gray-500 dark:text-zinc-400 tracking-[0.2em] ml-5">Review • Adjust • Finalize</p>
            </div>
            <button 
              (click)="closePreview()" 
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors text-gray-500"
              aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Content Body -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-8 bg-transparent relative">
              <div class="mb-8 flex flex-col gap-6 border-b border-gray-300 dark:border-zinc-700 pb-6">
                <!-- Cognitive level -->
                <div class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <h3 class="text-[12px] font-bold text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-[0.3em]">Cognitive Output Level</h3>
                    <p class="text-[12px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Select target patient comprehension</p>
                  </div>
                  
                  <div class="flex flex-wrap gap-1">
                    <!-- Dieter Rams Tabs -->
                    <button (click)="selectCognitiveLevel('standard')" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="selectedCognitiveLevel() === 'standard' ? 'bg-[#1C1C1C] text-white dark:bg-white dark:text-[#111111] border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      Standard
                    </button>
                    <button (click)="selectCognitiveLevel('dyslexia')" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="selectedCognitiveLevel() === 'dyslexia' ? 'bg-[#ff4500] text-white border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      Cognition (Dyslexia-Friendly)
                    </button>
                    <button (click)="selectCognitiveLevel('child')" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="selectedCognitiveLevel() === 'child' ? 'bg-[#ff4500] text-white border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      Pediatric (Child)
                    </button>
                  </div>
                </div>

                <!-- Language Translation -->
                <div class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1.5">
                    <h3 class="text-[12px] font-bold text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-[0.3em]">Language Translation</h3>
                    <p class="text-[12px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest font-mono">Select target translation language</p>
                  </div>

                  <div class="flex flex-wrap gap-1 items-center">
                    <button (click)="selectLanguage('english')" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="selectedLanguage() === 'english' && !showCustomLanguageInput() ? 'bg-[#1C1C1C] text-white dark:bg-white dark:text-[#111111] border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      English
                    </button>
                    <button (click)="selectLanguage('spanish')" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="selectedLanguage() === 'spanish' && !showCustomLanguageInput() ? 'bg-[#ff4500] text-white border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      Spanish
                    </button>
                    <button (click)="selectLanguage('german')" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="selectedLanguage() === 'german' && !showCustomLanguageInput() ? 'bg-[#ff4500] text-white border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      German
                    </button>
                    <button (click)="selectLanguage('french')" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="selectedLanguage() === 'french' && !showCustomLanguageInput() ? 'bg-[#ff4500] text-white border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      French
                    </button>
                    <button (click)="selectLanguage('mandarin')" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="selectedLanguage() === 'mandarin' && !showCustomLanguageInput() ? 'bg-[#ff4500] text-white border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      Mandarin
                    </button>
                    <button (click)="selectLanguage('hindi')" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="selectedLanguage() === 'hindi' && !showCustomLanguageInput() ? 'bg-[#ff4500] text-white border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      Hindi
                    </button>
                    <button (click)="toggleCustomLanguageInput()" [disabled]="isTranslating()"
                      class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                      [ngClass]="showCustomLanguageInput() ? 'bg-[#ff4500] text-white border-transparent shadow-sm' : 'bg-transparent text-gray-500'">
                      Other...
                    </button>
                  </div>

                  <!-- Custom Language Input Field -->
                  @if (showCustomLanguageInput()) {
                    <div class="mt-2 flex gap-2 max-w-xs animate-in fade-in slide-in-from-top-1 duration-200">
                      <input type="text" 
                             [value]="customLanguage()" 
                             (input)="onCustomLanguageChange($event)"
                             placeholder="Enter language (e.g. Italian)"
                             class="flex-1 px-3 py-1.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[12px] text-gray-800 dark:text-gray-100 uppercase tracking-wider font-semibold rounded-none focus:outline-none focus:border-[#ff4500]" />
                      <button (click)="applyCustomLanguage()" 
                              [disabled]="isTranslating() || !customLanguage().trim()"
                              class="px-4 py-1.5 bg-[#1C1C1C] dark:bg-white text-white dark:text-[#111111] text-[12px] uppercase tracking-wider font-bold hover:bg-[#ff4500] dark:hover:bg-[#ff4500] dark:hover:text-white transition-all">
                        Apply
                      </button>
                    </div>
                  }
                </div>

                <!-- Pet Auditory Modes -->
                <div class="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <p class="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Animal Comfort Protocols</p>
                  <div class="flex flex-wrap gap-2">
                    <button (click)="petAuditory.playCanineHeartbeat()" 
                      [ngClass]="petAuditory.currentMode === 'canine' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/60' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700'"
                      class="px-4 py-2 text-[12px] uppercase tracking-wider font-bold rounded-lg border hover:border-gray-300 dark:hover:border-zinc-600 transition-all flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M3 12c0-3 2-6 5-6s5 3 5 3 2-3 5-3 5 3 5 6"/></svg>
                      Canine Comfort
                    </button>
                    <button (click)="petAuditory.playFelinePurr()"
                      [ngClass]="petAuditory.currentMode === 'feline' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/60' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700'"
                      class="px-4 py-2 text-[12px] uppercase tracking-wider font-bold rounded-lg border hover:border-gray-300 dark:hover:border-zinc-600 transition-all flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.33.09 2 .26 1.78-1.55 3-.94 3-.94.83 2.22.3 3.86.15 4.27C18.66 10.14 19 11.96 19 14c0 4.97-3.13 7-7 7s-7-2.03-7-7c0-2.04.34-3.86 1.85-5.41-.15-.41-.68-2.05.15-4.27 0 0 1.22-.61 3 .94.65-.17 1.33-.26 2-.26Z" /><path d="M9 13v.01M15 13v.01" /><path d="M12 16l-1-1h2Z" /></svg>
                      Feline Comfort
                    </button>
                    <button (click)="petAuditory.playCetaceanTherapy()"
                      [ngClass]="petAuditory.currentMode === 'cetacean' ? 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/60' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700'"
                      class="px-4 py-2 text-[12px] uppercase tracking-wider font-bold rounded-lg border hover:border-gray-300 dark:hover:border-zinc-600 transition-all flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c-1.5-2.5-3-3.5-6-3.5A4.5 4.5 0 0 1 1.5 12c0-2.5 1.5-3.5 4.5-3.5 3 0 4.5 1 6 3.5 1.5-2.5 3-3.5 6-3.5a4.5 4.5 0 0 1 4.5 4.5c0 2.5-1.5 3.5-4.5 3.5-3 0-4.5 1-6 3.5Z" /><path d="M12 12v4" /></svg>
                      Cetacean Comfort
                    </button>
                    <button (click)="petAuditory.playAvianTherapy()"
                      [ngClass]="petAuditory.currentMode === 'avian' ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/60' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700'"
                      class="px-4 py-2 text-[12px] uppercase tracking-wider font-bold rounded-lg border hover:border-gray-300 dark:hover:border-zinc-600 transition-all flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01" /><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" /><path d="m20 7 2 .5-2 .5" /><path d="M10 18v3" /><path d="M14 17.75V21" /><path d="M7 18a6 6 0 0 0 3.84-10.61" /></svg>
                      Avian Comfort
                    </button>
                    @if(petAuditory.isCurrentlyPlaying) {
                      <button (click)="petAuditory.stop()" class="px-4 py-2 text-[12px] uppercase tracking-wider font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all">
                        Stop
                      </button>
                    }
                  </div>
                </div>

              </div>

              <!-- PRINT STRATEGY OPTIONS -->
              @if (selectedReadingLevel() !== 'standard') {
                <div class="mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div class="flex flex-wrap items-center gap-6 p-4 bg-white/50 dark:bg-[#1C1C1C]/50 border border-gray-300 dark:border-zinc-700 rounded-[2px]">
                    <div class="flex items-center gap-3">
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [checked]="includeAnalysisInPrint()" (change)="toggleAnalysisInPrint()" class="sr-only peer">
                        <div class="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-none peer dark:bg-zinc-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-400 after:border after:rounded-none after:h-3 after:w-3.5 after:transition-all dark:border-zinc-600 peer-checked:bg-[#1C1C1C] dark:peer-checked:bg-white"></div>
                      </label>
                      <span class="text-[12px] font-bold text-[#1C1C1C] dark:text-zinc-300 uppercase tracking-widest font-mono">Include AI Analysis</span>
                    </div>

                    <div class="flex items-center gap-3">
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [checked]="includeOriginalInPrint()" (change)="toggleOriginalInPrint()" class="sr-only peer">
                        <div class="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-none peer dark:bg-zinc-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-400 after:border after:rounded-none after:h-3 after:w-3.5 after:transition-all dark:border-zinc-600 peer-checked:bg-[#1C1C1C] dark:peer-checked:bg-white"></div>
                      </label>
                      <span class="text-[12px] font-bold text-[#1C1C1C] dark:text-zinc-300 uppercase tracking-widest font-mono">Include Original</span>
                    </div>
                  </div>
                </div>
              }
             
              <div class="relative grid gap-8 transition-all duration-300" [class.grid-cols-1]="selectedReadingLevel() === 'standard'" [class.sm:grid-cols-2]="selectedReadingLevel() !== 'standard'">
               
               <!-- Original English -->
               @if (selectedReadingLevel() !== 'standard') {
                 <div class="flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                    <label class="text-[12px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-[0.2em] font-mono border-b border-gray-300 dark:border-zinc-700 pb-1">Original Active Plan</label>
                    <pocket-gull-input
                      type="textarea"
                      [rows]="20"
                      [value]="originalPreviewText()"
                      (valueChange)="originalPreviewText.set($event)"
                      [disabled]="isTranslating()"
                      placeholder="No Active Care Plan recorded for this visit."
                      class="w-full shadow-inner opacity-70 hover:opacity-100 transition-opacity">
                    </pocket-gull-input>
                 </div>
               } @else {
                 <div class="flex flex-col gap-2 relative">
                    <label class="text-[12px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-[0.2em] font-mono border-b border-gray-300 dark:border-zinc-700 pb-1">Original Active Care Plan</label>
                    <pocket-gull-input
                      type="textarea"
                      [rows]="20"
                      [value]="originalPreviewText()"
                      [disabled]="true"
                      placeholder="No Active Care Plan recorded for this visit."
                      class="w-full h-full opacity-60 pointer-events-none">
                    </pocket-gull-input>
                 </div>
               }

               <!-- Translated Plan -->
               <div class="flex flex-col gap-2 relative">
                  @if (selectedReadingLevel() !== 'standard') {
                     <label class="text-[12px] font-bold text-[#ff4500] uppercase tracking-[0.2em] font-mono border-b border-[#ff4500] pb-1 animate-in fade-in duration-300 flex justify-between items-center">
                       <span>Translated / Adjusted Plan</span>
                       <span class="w-1.5 h-1.5 bg-[#ff4500] rounded-full inline-block animate-pulse"></span>
                     </label>
                  }
                  <pocket-gull-input
                    type="textarea"
                    [rows]="20"
                    [value]="previewText()"
                    (valueChange)="previewText.set($event)"
                    [disabled]="isTranslating()"
                    placeholder="No Active Care Plan recorded for this visit."
                    class="w-full bg-white dark:bg-[#09090b] shadow-lg"
                    [class.dyslexia-textarea]="selectedReadingLevel() === 'dyslexia'">
                  </pocket-gull-input>
               </div>
               
               @if (isTranslating()) {
                 <div class="absolute inset-x-0 inset-y-8 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-sm">
                    <div class="w-8 h-8 border-[3px] border-gray-200 border-t-[#ff4500] rounded-full animate-spin shadow-lg"></div>
                    <p class="mt-4 text-[12px] font-bold text-[#ff4500] uppercase tracking-[0.3em] font-mono animate-pulse">Processing Translation</p>
                 </div>
               }
               @if (translationError()) {
                  <div class="absolute bottom-4 left-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-[12px] font-bold text-red-600 dark:text-red-400 uppercase tracking-[0.1em] font-mono shadow-md flex items-center gap-2 z-20">
                    <div class="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    System Error: {{ translationError() }}
                  </div>
               }
             </div>
             
             <!-- TRANSLATION ANALYSIS UI -->
             @if (selectedReadingLevel() !== 'standard') {
               <div class="mt-8 pt-6 border-t border-gray-300 dark:border-zinc-700 animate-in fade-in duration-500">
                  <div class="flex flex-col gap-3 mb-2">
                    <div class="flex justify-between items-end border-b border-gray-200 dark:border-zinc-800 pb-2">
                      <h4 class="text-[12px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.3em] font-mono">Structural Analysis</h4>
                      <button 
                        (click)="analyzeCurrentTranslation()" 
                        [disabled]="isAnalyzingTranslation() || isTranslating()"
                        class="px-4 py-1.5 border border-gray-300 dark:border-zinc-700 text-[12px] uppercase tracking-[0.2em] font-bold transition-all text-[#1C1C1C] dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                        @if (isAnalyzingTranslation()) {
                          <div class="w-2.5 h-2.5 border-2 border-gray-400 border-t-[#1C1C1C] rounded-full animate-spin"></div>
                          Analyzing...
                        } @else {
                          Analyze Translation Matrix
                        }
                      </button>
                    </div>
                    @if (translationAnalysis()) {
                      <div class="p-4 sm:p-6 bg-white dark:bg-[#09090b] shadow-inner border border-gray-200 dark:border-zinc-800 text-[12px] leading-relaxed text-gray-800 dark:text-zinc-300 font-mono animate-in slide-in-from-top-4 duration-500 whitespace-pre-wrap">
                         {{ translationAnalysis() }}
                      </div>
                    }
                  </div>
               </div>
             }
             
             <div class="mt-8 flex justify-center opacity-40">
                <p class="text-[12px] font-mono uppercase tracking-[0.4em]">Final Output Target: Medical Chart Archive</p>
             </div>
          </div>
          
          <!-- Footer -->
          <div class="px-8 py-5 border-t border-gray-300 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#09090b]/50 flex justify-between items-center mt-auto">
            <button 
              (click)="printReport()" 
              class="px-5 py-2.5 border border-[#1C1C1C] dark:border-zinc-600 text-[#1C1C1C] dark:text-zinc-100 bg-transparent text-[12px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2 rounded-[2px]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
              Print Document
            </button>
            <div class="flex items-center gap-4">
              <button 
                (click)="closePreview()" 
                class="px-4 py-2 text-gray-500 hover:text-[#1C1C1C] dark:hover:text-white text-[12px] font-bold uppercase tracking-[0.2em] transition-colors">
                Cancel
              </button>
              <button 
                (click)="confirmFinalize()" 
                class="px-8 py-3 bg-[#1C1C1C] dark:bg-white text-white dark:text-[#111111] text-[12px] font-bold uppercase tracking-[0.3em] font-mono hover:bg-black dark:hover:bg-gray-200 transition-all flex items-center gap-2 rounded-[2px] shadow-md active:translate-y-[1px]">
                Commit to Chart
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
    
        </main>
        }
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
  private _translateTimer: any = null;

  private debouncedTranslate(text: string, level: any) {
    if (this._translateTimer) {
      clearTimeout(this._translateTimer);
    }
    this._translateTimer = setTimeout(async () => {
      this.isTranslating.set(true);
      try {
        const translated = await this.clinicalIntelligence.translateReadingLevel(text, level);
        this.previewText.set(translated);
        await this.analyzeCurrentTranslation();
      } catch (error) {
        console.error("Auto-translation failed", error);
        this.translationError.set("Failed to translate plan. Please retry.");
      } finally {
        this.isTranslating.set(false);
      }
    }, 600);
  }

  public tour = inject(WalkthroughTourService);
  public readonly petAuditory = inject(PetAuditoryService);
  private readonly stressIntervention = inject(StressInterventionService);
  public readonly collaboration = inject(CollaborationService);
  patientDropdown = viewChild(PatientDropdownComponent);
  state = inject(PatientStateService);
  public theme = inject(ThemeService);
  public game = inject(GamificationService);
  private ngZone = inject(NgZone);


  public patientMgmt = inject(PatientManagementService);
  private clinicalIntelligence = inject(ClinicalIntelligenceService);
  network = inject(NetworkStateService);
  consentService = inject(ConsentService);
  hardware = inject(HardwareTelemetryService);
  readonly rules = inject(RulesEngineService);
  private aiConfig = inject(AI_CONFIG, { optional: true });
  today = new Date();
  hasApiKey = signal<boolean>(!!this.aiConfig?.apiKey);
  showSplash = computed(() => {
    const locked = this.session.isLocked();
    const hasKey = this.hasApiKey();
    const onboard = this.session.isOnboardingComplete();
    const emergency = this.state.isEmergencyMode();
    const show = (locked || !hasKey || !onboard) && !emergency;
    console.log('[DEBUG SHOW SPLASH]', { locked, hasKey, onboard, emergency, show });
    return show;
  });
  isDemoMode = this.state.isDemoMode;
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

  // Google Health (GCP Healthcare FHIR Store) Sync State
  isGHealthSyncing = signal<boolean>(false);
  showGHealthSuccess = signal<boolean>(false);
  showGHealthError = signal<string | null>(null);

  // AWS HealthLake Sync State
  isAwsSyncing = signal<boolean>(false);
  showAwsSuccess = signal<boolean>(false);
  showAwsError = signal<string | null>(null);



  // Finalize & Archive State
  showPreviewModal = signal(false);
  previewText = signal('');
  originalPreviewText = signal('');
  selectedReadingLevel = signal<string>('standard');
  selectedCognitiveLevel = signal<'standard' | 'simplified' | 'dyslexia' | 'child'>('standard');
  selectedLanguage = signal<string>('english');
  customLanguage = signal<string>('');
  showCustomLanguageInput = signal<boolean>(false);
  isTranslating = signal<boolean>(false);
  translationAnalysis = signal<string>('');
  isAnalyzingTranslation = signal(false);
  translationError = signal<string | null>(null);
  includeAnalysisInPrint = signal<boolean>(true);
  includeOriginalInPrint = signal<boolean>(true);

  // Navbar Dropdown States
  exportMenuOpen = signal(false);
  connectMenuOpen = signal(false);
  isDirectoryOpen = signal(false);

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
    this.rules.setContext('dyslexia_mode', true);
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
      this.rules.setContext('dyslexia_mode', false);
      this.isSimplifying.set(false);
    }
  }

  async exportChildPdf() {
    this.isSimplifyingChild.set(true);
    this.rules.setContext('pediatric_mode', true);
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
      this.rules.setContext('pediatric_mode', false);
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

  async connectGoogleHealth() {
    const patient = this.patientMgmt.selectedPatient();
    if (!patient) {
      alert("No patient selected to sync to Google Health FHIR Store.");
      return;
    }

    this.isGHealthSyncing.set(true);
    this.showGHealthSuccess.set(false);
    this.showGHealthError.set(null);

    try {
      const response = await fetch('/api/healthcare/fhir/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patient)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Sync failed with status code ${response.status}`);
      }

      const result = await response.json();
      console.log('[Google Health Sync] Success:', result);
      this.showGHealthSuccess.set(true);
      setTimeout(() => this.showGHealthSuccess.set(false), 5000);
    } catch (e: any) {
      console.error('[Google Health Sync] Error:', e);
      this.showGHealthError.set(e.message || 'An error occurred during synchronization.');
      setTimeout(() => this.showGHealthError.set(null), 8000);
    } finally {
      this.isGHealthSyncing.set(false);
    }
  }

  async importGoogleHealth() {
    const patient = this.patientMgmt.selectedPatient();
    if (!patient) {
      alert("No patient selected to import data from Google Health.");
      return;
    }

    this.isGHealthSyncing.set(true);
    this.showGHealthSuccess.set(false);
    this.showGHealthError.set(null);

    try {
      let response = await fetch(`/api/healthcare/fhir/import/${patient.id}`, {
        method: 'GET'
      });

      if (!response.ok && response.status === 404) {
        console.log('[Google Health Import] IPatient not found in FHIR Store. Auto-provisioning patient record first...');
        // Auto-provision (export) local patient details
        const exportRes = await fetch('/api/healthcare/fhir/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(patient)
        });
        if (!exportRes.ok) {
          const exportErr = await exportRes.json().catch(() => ({}));
          throw new Error(exportErr.error || `Auto-provisioning failed with status ${exportRes.status}`);
        }
        
        // Retry the import
        response = await fetch(`/api/healthcare/fhir/import/${patient.id}`, {
          method: 'GET'
        });
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Import failed with status code ${response.status}`);
      }

      const result = await response.json();
      console.log('[Google Health Import] Success:', result);
      
      // Update our local patient state registry
      this.patientMgmt.importPatient(result.patient);
      
      this.showGHealthSuccess.set(true);
      setTimeout(() => this.showGHealthSuccess.set(false), 5000);
    } catch (e: any) {
      console.error('[Google Health Import] Error:', e);
      this.showGHealthError.set(e.message || 'An error occurred during import.');
      setTimeout(() => this.showGHealthError.set(null), 8000);
    } finally {
      this.isGHealthSyncing.set(false);
    }
  }

  async connectAwsHealth() {
    const patient = this.patientMgmt.selectedPatient();
    if (!patient) {
      alert("No patient selected to sync to AWS HealthLake FHIR Store.");
      return;
    }

    this.isAwsSyncing.set(true);
    this.showAwsSuccess.set(false);
    this.showAwsError.set(null);

    try {
      const response = await fetch('/api/aws/healthlake/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patient)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Sync failed with status code ${response.status}`);
      }

      const result = await response.json();
      console.log('[AWS HealthLake Sync] Success:', result);
      this.showAwsSuccess.set(true);
      setTimeout(() => this.showAwsSuccess.set(false), 5000);
    } catch (e: any) {
      console.error('[AWS HealthLake Sync] Error:', e);
      this.showAwsError.set(e.message || 'An error occurred during synchronization.');
      setTimeout(() => this.showAwsError.set(null), 8000);
    } finally {
      this.isAwsSyncing.set(false);
    }
  }




  connectAppleHealth() {
    alert("Apple HealthKit: Awaiting sync from iOS Companion App...");
  }

  uploadData() {
    const dropdown = this.patientDropdown();
    if (dropdown) {
      dropdown.triggerImport();
    } else {
      const fileInput = document.querySelector('app-patient-dropdown input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      } else {
        alert("Upload data modal placeholder");
      }
    }
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
      plan = plan ? `${plan}\n\n### ${ClinicalIcons.Suggestion} Draft Notes\n${newContent}` : `### ${ClinicalIcons.Suggestion} Draft Notes\n${newContent}`;
    }

    const checklist = this.state.checklist();
    if (checklist.length > 0) {
      const clContent = checklist.map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`).join('\n');
      plan = plan ? `${plan}\n\n### ${ClinicalIcons.Assessment} Care Plan Instructions\n${clContent}` : `### ${ClinicalIcons.Assessment} Care Plan Instructions\n${clContent}`;
    }

    const dynamicNutrients = this.state.dynamicNutrients();
    if (dynamicNutrients.length > 0) {
      const tnContent = dynamicNutrients.map(item => `- **${item.name}**: ${item.value}`).join('\n');
      plan = plan ? `${plan}\n\n### ${ClinicalIcons.Risk} Targeted Nutrients\n${tnContent}` : `### ${ClinicalIcons.Risk} Targeted Nutrients\n${tnContent}`;
    }

    const oxStress = this.state.oxidativeStressMarkers();
    if (oxStress.length > 0) {
      const oxContent = oxStress.map(item => `- **${item.name}**: ${item.value}`).join('\n');
      plan = plan ? `${plan}\n\n### ${ClinicalIcons.EvidenceFocus} Oxidative Stress Markers\n${oxContent}` : `### ${ClinicalIcons.EvidenceFocus} Oxidative Stress Markers\n${oxContent}`;
    }

    const antiox = this.state.antioxidantSources();
    if (antiox.length > 0) {
      const antioxContent = antiox.map(item => `- **${item.name}**: ${item.value}`).join('\n');
      plan = plan ? `${plan}\n\n### ${ClinicalIcons.FollowUp} Antioxidant Sources\n${antioxContent}` : `### ${ClinicalIcons.FollowUp} Antioxidant Sources\n${antioxContent}`;
    }

    const meds = this.state.medications();
    if (meds.length > 0) {
      const medsContent = meds.map(item => `- **${item.name}**: ${item.value}`).join('\n');
      plan = plan ? `${plan}\n\n### ${ClinicalIcons.Medication} Medications\n${medsContent}` : `### ${ClinicalIcons.Medication} Medications\n${medsContent}`;
    }
    
    const finalText = plan || 'No Active Patient Summary recorded for this visit.';
    this.previewText.set(finalText);
    this.originalPreviewText.set(finalText);
    this.selectedReadingLevel.set('standard');
    this.selectedCognitiveLevel.set('standard');
    this.selectedLanguage.set('english');
    this.customLanguage.set('');
    this.showCustomLanguageInput.set(false);
    this.showPreviewModal.set(true);
  }

  closePreview() {
    this.showPreviewModal.set(false);
  }

  selectCognitiveLevel(level: 'standard' | 'simplified' | 'dyslexia' | 'child') {
    this.selectedCognitiveLevel.set(level);
    this.updateReadingLevelAndTranslate();
  }

  selectLanguage(lang: string) {
    this.selectedLanguage.set(lang);
    this.showCustomLanguageInput.set(false);
    this.updateReadingLevelAndTranslate();
  }

  toggleCustomLanguageInput() {
    this.showCustomLanguageInput.update(v => !v);
    if (!this.showCustomLanguageInput()) {
      // Revert to English if closed
      this.selectedLanguage.set('english');
      this.updateReadingLevelAndTranslate();
    }
  }

  onCustomLanguageChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.customLanguage.set(val);
  }

  applyCustomLanguage() {
    if (this.customLanguage().trim()) {
      this.updateReadingLevelAndTranslate();
    }
  }

  async updateReadingLevelAndTranslate() {
    const cog = this.selectedCognitiveLevel();
    const lang = this.showCustomLanguageInput() ? this.customLanguage() : this.selectedLanguage();
    
    let displayLevel = '';
    if (cog === 'standard' && lang.toLowerCase() === 'english') {
      displayLevel = 'standard';
    } else {
      displayLevel = `${cog} in ${lang}`;
    }
    this.selectedReadingLevel.set(displayLevel);

    this.translationAnalysis.set('');
    this.translationError.set(null);

    if (cog === 'standard' && lang.toLowerCase() === 'english') {
      this.previewText.set(this.originalPreviewText());
      return;
    }

    this.isTranslating.set(true);
    try {
      const translated = await this.clinicalIntelligence.translateReadingLevel(
        this.originalPreviewText(),
        undefined,
        cog,
        lang
      );
      this.previewText.set(translated);
      await this.analyzeCurrentTranslation();
    } catch (error) {
      console.error("Translation failed", error);
      this.translationError.set("Failed to translate plan. Please retry.");
    } finally {
      this.isTranslating.set(false);
    }
  }

  async changeReadingLevel(levelOrEvent: string | Event) {
    // Keep for backward compatibility with old selectors or external events
    let level = 'standard';
    if (typeof levelOrEvent === 'string') {
      level = levelOrEvent;
    } else {
      level = (levelOrEvent.target as HTMLSelectElement).value;
    }

    if (['simplified', 'dyslexia', 'child'].includes(level)) {
      this.selectedCognitiveLevel.set(level as any);
    } else if (level !== 'standard') {
      this.selectedLanguage.set(level);
    } else {
      this.selectedCognitiveLevel.set('standard');
      this.selectedLanguage.set('english');
    }
    await this.updateReadingLevelAndTranslate();
  }

  toggleAnalysisInPrint() {
    this.includeAnalysisInPrint.update(v => !v);
  }

  toggleOriginalInPrint() {
    this.includeOriginalInPrint.update(v => !v);
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
      const levelNames: Record<string, string> = {
        'simplified': 'Simplified (6th Grade)',
        'dyslexia': 'Cognition (Dyslexia-Friendly)',
        'child': 'Child (Pediatric)',
        'hindi': 'Hindi Translation'
      };
      
      const translationMatrix = {
        levelName: levelNames[level] || level.toUpperCase(),
        translatedPlanMarkdown: this.previewText(),
        originalPlanMarkdown: this.includeOriginalInPrint() ? this.originalPreviewText() : null,
        analysisMarkdown: this.includeAnalysisInPrint() ? this.translationAnalysis() : null
      };

      this.export.downloadCarePlanPdf(
        '',
        p?.name ?? 'Patient',
        {
          bp: vitals.bp || undefined,
          hr: vitals.hr || undefined,
          temp: vitals.temp || undefined,
          spO2: vitals.spO2 || undefined,
          weight: vitals.weight || undefined,
        },
        p?.preexistingConditions ?? [],
        translationMatrix
      );
    } else {
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
  }

  confirmFinalize() {
    this.state.updateActivePatientSummary(this.originalPreviewText());
    if (this.state.draftSummaryItems().length > 0) {
      this.state.clearDraftSummaryItems();
    }
    this.finalizeChart();
    this.game.completeQuest('finalize_plan');
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
    else if (current === 'dark') this.theme.setTheme('spark');
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

  readonly session = inject(SessionStateService);
  readonly fitbit = inject(FitbitService);
  readonly intelligence = inject(ClinicalIntelligenceService);

  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:touchstart')
  @HostListener('document:wheel')
  onUserInteraction() {
    if (!this.session.isLocked()) {
       this.session.resetIdleTimer();
    }
  }

  private mcpControllers: { name: string, controller: AbortController }[] = [];

  constructor() {
    effect(() => {
      const text = this.originalPreviewText();
      const level = this.selectedReadingLevel();
      if (level !== 'standard') {
        untracked(() => {
          this.debouncedTranslate(text, level);
        });
      }
    });

    effect(() => {
      const text = this.originalPreviewText();
      untracked(() => {
        this.state.activePatientSummary.set(text || null);
      });
    });

    const swUpdate = inject(SwUpdate, { optional: true });
    if (swUpdate && swUpdate.isEnabled) {
      swUpdate.versionUpdates.subscribe((evt: any) => {
        if (evt.type === 'VERSION_READY') {
          if (confirm('A new version of Pocket-Gull is available! Would you like to reload now to apply the update?')) {
            window.location.reload();
          }
        }
      });
    }

    afterNextRender(async () => {
      if (typeof window === 'undefined') return;

      if (window.location.pathname === '/fhir-callback') {
        this.showFhirCallback.set(true);
        return;
      }

      // Handle Fitbit OAuth redirect (?fitbit=connected|denied|error)
      this.fitbit.handleOAuthRedirect();
      // Check initial Fitbit connection status for current patient
      this.fitbit.checkStatus().catch(() => {});

      this.isMobile.set(window.innerWidth < 768);

      // 1. Fetch API key from server (replaces window.GEMINI_API_KEY HTML injection)
      //    The server only serves /api/config to same-origin requests.
      try {
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
          const config = await configRes.json();
          if (config?.apiKey) {
            try { localStorage.setItem('GEMINI_API_KEY', config.apiKey); } catch (_e) { /* ignore */ }
            (window as any).GEMINI_API_KEY = config.apiKey; // keep compat for ADK WS handshake
            this.hasApiKey.set(true);
          }
        }
      } catch (_e) { /* network offline or dev mode without server */ }

      // 2. Check for stored API key in localStorage (manual entry / offline fallback)
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
      if (!navigator.modelContext) {
        initializeWebMCPPolyfill();
      }

      if (navigator.modelContext) {
        // Register generate_medical_summary
        const sumCtrl = new AbortController();
        const sumTool = {
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
        };
        (navigator.modelContext as any).registerTool(sumTool, { signal: sumCtrl.signal });
        this.mcpControllers.push({ name: sumTool.name, controller: sumCtrl });

        // Register translate_clinical_text
        const transCtrl = new AbortController();
        const transTool = {
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
        };
        (navigator.modelContext as any).registerTool(transTool, { signal: transCtrl.signal });
        this.mcpControllers.push({ name: transTool.name, controller: transCtrl });

        // Register get_current_patient_data
        const pdataCtrl = new AbortController();
        const pdataTool = {
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
        };
        (navigator.modelContext as any).registerTool(pdataTool, { signal: pdataCtrl.signal });
        this.mcpControllers.push({ name: pdataTool.name, controller: pdataCtrl });

        // Register navigate_to_body_part
        const navCtrl = new AbortController();
        const navTool = {
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
        };
        (navigator.modelContext as any).registerTool(navTool, { signal: navCtrl.signal });
        this.mcpControllers.push({ name: navTool.name, controller: navCtrl });

        // Register inject_clinical_note
        const injectCtrl = new AbortController();
        const injectTool = {
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
        };
        (navigator.modelContext as any).registerTool(injectTool, { signal: injectCtrl.signal });
        this.mcpControllers.push({ name: injectTool.name, controller: injectCtrl });

        // Register trigger_sync
        const syncCtrl = new AbortController();
        const syncTool = {
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
        };
        (navigator.modelContext as any).registerTool(syncTool, { signal: syncCtrl.signal });
        this.mcpControllers.push({ name: syncTool.name, controller: syncCtrl });

        // Register research_clinical_term
        const researchCtrl = new AbortController();
        const researchTool = {
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
        };
        (navigator.modelContext as any).registerTool(researchTool, { signal: researchCtrl.signal });
        this.mcpControllers.push({ name: researchTool.name, controller: researchCtrl });

        // Register load_research_url
        const loadUrlCtrl = new AbortController();
        const loadUrlTool = {
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
        };
        (navigator.modelContext as any).registerTool(loadUrlTool, { signal: loadUrlCtrl.signal });
        this.mcpControllers.push({ name: loadUrlTool.name, controller: loadUrlCtrl });

        // Register add_research_bookmark
        const bmkCtrl = new AbortController();
        const bmkTool = {
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
        };
        (navigator.modelContext as any).registerTool(bmkTool, { signal: bmkCtrl.signal });
        this.mcpControllers.push({ name: bmkTool.name, controller: bmkCtrl });
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
    if (navigator.modelContext) {
      this.mcpControllers.forEach(item => {
        (navigator.modelContext as any).unregisterTool?.(item.name);
        item.controller.abort();
      });
      this.mcpControllers = [];
    }

    if (this.boundOnWindowResize) {
      window.removeEventListener('resize', this.boundOnWindowResize);
    }
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
    if (this._translateTimer) {
      clearTimeout(this._translateTimer);
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
    this.state.isDemoMode.set(false);
    // Force GeminiProvider to reinitialise with the new key on next call
    this.hasApiKey.set(true);
  }

  loadDemoMode() {
    this.isDemoMode.set(true);
    this.state.isDemoMode.set(true);
    this.hasApiKey.set(true);
    // Load demo patient (Sarah Jenkins – p002)
    this.patientMgmt.selectPatient('p002');
    // Inject pre-baked analysis outputs (no API call) synchronously
    this.state.activePhilosophy.set('western');
    this.clinicalIntelligence.loadArchivedAnalysis(DEMO_ANALYSIS_REPORT_WESTERN);
    this.clinicalIntelligence.lastActivePhilosophy.set('western');
    this.clinicalIntelligence.lastPatientData.set(this.state.getAllDataForPrompt());
    // Start tour after data is loaded so targets exist in DOM
    setTimeout(() => this.tour.start(), 400);
  }

  handleEmergencyBypass() {
    this.state.isEmergencyMode.set(true);
    this.state.clearState();

    const emergencyPatient: any = {
      id: 'emergency_casualty',
      name: 'Emergency Casualty',
      age: 30,
      gender: 'Other',
      lastVisit: new Date().toISOString(),
      preexistingConditions: [],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: 'Immediate trauma and emergency life support bypass mode.',
      dietaryProtocol: '',
      vitals: {
        bp: '', hr: '', temp: '', spO2: '', weight: '', height: '',
        vitC: '', vitD3: '', magnesium: '', zinc: '', b12: ''
      },
      dynamicNutrients: [],
      oxidativeStressMarkers: [],
      antioxidantSources: [],
      medications: [],
      clinicalNotes: [],
      checklist: [],
      shoppingList: []
    };

    const currentPatients = this.patientMgmt.patients();
    if (!currentPatients.some(p => p.id === 'emergency_casualty')) {
      const patientsSignal = this.patientMgmt.patients as any;
      if (typeof patientsSignal.update === 'function') {
        patientsSignal.update((list: any[]) => [...list, emergencyPatient]);
      }
    }

    this.patientMgmt.selectedPatientId.set('emergency_casualty');
    this.state.loadState(emergencyPatient);
    this.session.isLocked.set(false);
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

  showSplitView() {
    this.isChartCollapsed.set(false);
    this.isAnalysisCollapsed.set(false);
    this.inputPanelWidth.set(window.innerWidth / 2);
  }

  // --- Column Resizing Logic ---
  startColumnDrag(event: MouseEvent): void {
    event.preventDefault();
    this.isDraggingColumn.set(true);
    this.initialColumnDragX = event.clientX;

    if (this.inputPanelWidth() === undefined) {
      const handleEl = event.currentTarget as HTMLElement;
      const panelEl = handleEl?.previousElementSibling as HTMLElement;
      if (panelEl) {
        this.initialInputPanelWidth = panelEl.offsetWidth;
        this.inputPanelWidth.set(this.initialInputPanelWidth);
      } else {
        this.initialInputPanelWidth = window.innerWidth / 2;
        this.inputPanelWidth.set(this.initialInputPanelWidth);
      }
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
    const width = this.inputPanelWidth();
    if (width !== undefined) {
      const currentPercent = (width / containerWidth) * 100;

      if (Math.abs(currentPercent - 50) < 5) {
        this.inputPanelWidth.set(containerWidth * 0.50);
      }
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
