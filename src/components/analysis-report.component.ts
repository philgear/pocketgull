import { Component, ChangeDetectionStrategy, inject, computed, ViewEncapsulation, signal, OnDestroy, effect, viewChild, ElementRef, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalIntelligenceService, ITranscriptEntry, AnalysisLens } from '../services/clinical-intelligence.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { HistoryEntry } from '../services/patient.types';
import { MarkdownService } from '../services/markdown.service';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';
import { DictationService } from '../services/dictation.service';
import { generate } from 'lean-qr';

declare var webkitSpeechRecognition: any;
import { ISummaryNode, ISummaryNodeItem, IReportSection, IParsedTranscriptEntry, NodeAnnotation, LensAnnotations, IVerificationIssue } from './analysis-report.types';
import { SummaryNodeComponent } from './summary-node.component';
import { PocketGullCardComponent } from './shared/pocket-gull-card.component';
import { BiomarkerMatrixComponent } from './biomarker-matrix.component';
import { ExportService } from '../services/export.service';
import { AuditService } from '../services/audit.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { ClinicalGaugeComponent } from './clinical-gauge.component';
import { ClinicalIcons } from '../assets/clinical-icons';
import { ClinicalTrendComponent } from './clinical-trend.component';
import { AiCacheService } from '../services/ai-cache.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { RevealDirective } from '../directives/reveal.directive';
import { NodeAgentDialogComponent, INodeAgentDialogData } from './node-agent-dialog.component';

@Component({
  selector: 'app-analysis-report',
  standalone: true,
  imports: [CommonModule, SummaryNodeComponent, PocketGullCardComponent, PocketGullBadgeComponent, ClinicalGaugeComponent, ClinicalTrendComponent, PocketGullButtonComponent, RevealDirective, SafeHtmlPipe, BiomarkerMatrixComponent, NodeAgentDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'flex flex-col flex-1 min-h-0 w-full overflow-hidden'
  },
  styles: [`
    /* Typography is now handled globally in styles.css */
  `],
  template: `


    <!--Analysis Tabs-->
    @if (hasAnyReport() || state.isEmergencyMode()) {
      <div class="px-4 sm:px-8 py-2 sm:py-3 no-print overflow-x-auto w-full">
        <div class="max-w-4xl mx-auto min-w-0 relative">
          <div id="tour-lens-tabs" class="flex overflow-x-auto hide-scrollbar items-center gap-1 border-b border-gray-300 dark:border-zinc-700 w-full relative z-10">
          <pocket-gull-button (click)="changeLens('Summary Overview')"
            testId="tab-overview"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Summary Overview'"
            [class.border-transparent]="activeLens() !== 'Summary Overview'"
            [ngClass]="activeLens() === 'Summary Overview' ? activeTabClasses() : 'text-gray-500 dark:text-zinc-400'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap transition-all duration-200">
            Overview
          </pocket-gull-button>
          <pocket-gull-button (click)="changeLens('Functional Protocols')"
            testId="tab-functional-protocols"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Functional Protocols'"
            [class.border-transparent]="activeLens() !== 'Functional Protocols'"
            [ngClass]="activeLens() === 'Functional Protocols' ? activeTabClasses() : 'text-gray-500 dark:text-zinc-400'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap transition-all duration-200">
            Functional Protocols
          </pocket-gull-button>
          <pocket-gull-button (click)="changeLens('Nutrition')"
            testId="tab-nutrition"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Nutrition'"
            [class.border-transparent]="activeLens() !== 'Nutrition'"
            [ngClass]="activeLens() === 'Nutrition' ? activeTabClasses() : 'text-gray-500 dark:text-zinc-400'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap transition-all duration-200">
            Nutrition
          </pocket-gull-button>
          <pocket-gull-button (click)="changeLens('Precision Nutrients')"
            testId="tab-precision-nutrients"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Precision Nutrients'"
            [class.border-transparent]="activeLens() !== 'Precision Nutrients'"
            [ngClass]="activeLens() === 'Precision Nutrients' ? activeTabClasses() : 'text-gray-500 dark:text-zinc-400'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap transition-all duration-200">
            Precision Nutrients
          </pocket-gull-button>
          <pocket-gull-button (click)="changeLens('Monitoring & Follow-up')"
            testId="tab-monitoring-follow-up"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Monitoring & Follow-up'"
            [class.border-transparent]="activeLens() !== 'Monitoring & Follow-up'"
            [ngClass]="activeLens() === 'Monitoring & Follow-up' ? activeTabClasses() : 'text-gray-500 dark:text-zinc-400'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap transition-all duration-200">
            Monitoring & Follow-up
          </pocket-gull-button>
          <pocket-gull-button (click)="changeLens('Patient Education')"
            testId="tab-patient-education"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Patient Education'"
            [class.border-transparent]="activeLens() !== 'Patient Education'"
            [ngClass]="activeLens() === 'Patient Education' ? activeTabClasses() : 'text-gray-500 dark:text-zinc-400'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap transition-all duration-200">
            Patient Education
          </pocket-gull-button>

          @if (state.isEmergencyMode()) {
            <pocket-gull-button (click)="changeLens('EMT Handoff')"
              variant="ghost"
              size="sm"
              [class.border-b-2]="activeLens() === 'EMT Handoff'"
              [class.border-[#EF4444]]="activeLens() === 'EMT Handoff'"
              [class.dark:border-red-500]="activeLens() === 'EMT Handoff'"
              [class.text-red-600]="activeLens() === 'EMT Handoff'"
              [class.dark:text-red-400]="activeLens() === 'EMT Handoff'"
              class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap font-bold">
              🚑 EMT Handoff
            </pocket-gull-button>
          }
        </div>
        </div>
      </div>
    }

    <!--Content Area-->
    <div #contentArea class="flex-1 mx-4 sm:mx-8 mb-6 mt-2 overflow-y-auto overflow-x-hidden bg-white dark:bg-[#09090b] rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 min-h-0">
      <!--Analysis Engine Body-->
      <div class="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 min-w-0">
        
        <!-- Active Medicine Mode Info Banner -->
        @if (hasAnyReport() && activeLens() !== 'EMT Handoff') {
          <div class="mb-6 p-4 rounded-xl border transition-all duration-300"
               [class.bg-sky-50\/40]="state.activePhilosophy() === 'western'"
               [class.border-sky-200\/60]="state.activePhilosophy() === 'western'"
               [class.dark:bg-sky-950\/10]="state.activePhilosophy() === 'western'"
               [class.dark:border-sky-900\/30]="state.activePhilosophy() === 'western'"
               
               [class.bg-emerald-50\/40]="state.activePhilosophy() === 'eastern'"
               [class.border-emerald-200\/60]="state.activePhilosophy() === 'eastern'"
               [class.dark:bg-emerald-950\/10]="state.activePhilosophy() === 'eastern'"
               [class.dark:border-emerald-900\/30]="state.activePhilosophy() === 'eastern'"
               
               [class.bg-amber-50\/40]="state.activePhilosophy() === 'ayurvedic'"
               [class.border-amber-200\/60]="state.activePhilosophy() === 'ayurvedic'"
               [class.dark:bg-amber-950\/10]="state.activePhilosophy() === 'ayurvedic'"
               [class.dark:border-amber-900\/30]="state.activePhilosophy() === 'ayurvedic'">
            
            <div class="flex items-center gap-3">
              <!-- Animated Accent Indicator Dot -->
              <span class="relative flex h-2.5 w-2.5 shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      [class.bg-sky-400]="state.activePhilosophy() === 'western'"
                      [class.bg-emerald-400]="state.activePhilosophy() === 'eastern'"
                      [class.bg-amber-400]="state.activePhilosophy() === 'ayurvedic'"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5"
                      [class.bg-sky-500]="state.activePhilosophy() === 'western'"
                      [class.bg-emerald-500]="state.activePhilosophy() === 'eastern'"
                      [class.bg-amber-500]="state.activePhilosophy() === 'ayurvedic'"></span>
              </span>
              
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="text-[10px] font-bold uppercase tracking-widest"
                        [class.text-sky-700]="state.activePhilosophy() === 'western'"
                        [class.dark:text-sky-400]="state.activePhilosophy() === 'western'"
                        [class.text-emerald-700]="state.activePhilosophy() === 'eastern'"
                        [class.dark:text-emerald-400]="state.activePhilosophy() === 'eastern'"
                        [class.text-amber-700]="state.activePhilosophy() === 'ayurvedic'"
                        [class.dark:text-amber-400]="state.activePhilosophy() === 'ayurvedic'">
                    Active Paradigm: 
                    @if (state.activePhilosophy() === 'western') { Western (Allopathic) }
                    @else if (state.activePhilosophy() === 'eastern') { Eastern (Traditional Chinese Medicine) }
                    @else if (state.activePhilosophy() === 'ayurvedic') { Ayurvedic Medicine }
                  </span>

                  <!-- Dynamic Agent Pill -->
                  <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider bg-gray-50/50 dark:bg-zinc-900/50 border-gray-200/40 dark:border-zinc-800/40"
                       [class.text-sky-700]="state.activePhilosophy() === 'western'"
                       [class.dark:text-sky-400]="state.activePhilosophy() === 'western'"
                       [class.text-emerald-700]="state.activePhilosophy() === 'eastern'"
                       [class.dark:text-emerald-400]="state.activePhilosophy() === 'eastern'"
                       [class.text-amber-700]="state.activePhilosophy() === 'ayurvedic'"
                       [class.dark:text-amber-400]="state.activePhilosophy() === 'ayurvedic'">
                    <span class="flex h-1.5 w-1.5 rounded-full"
                          [class.bg-sky-500]="state.activePhilosophy() === 'western'"
                          [class.bg-emerald-500]="state.activePhilosophy() === 'eastern'"
                          [class.bg-amber-500]="state.activePhilosophy() === 'ayurvedic'"></span>
                    Expert: {{ activeAgentName() }}
                  </div>
                </div>
                
                <p class="text-xs mt-1 text-gray-600 dark:text-zinc-400 leading-relaxed font-sans">
                  @if (state.activePhilosophy() === 'western') {
                    Analyzing case telemetry under FDA and WHO pharmacotherapy reference standards, prioritizing conventional allopathic diagnostics.
                  } @else if (state.activePhilosophy() === 'eastern') {
                    Synthesizing patient history, symptoms, and vitals through TCM organ disharmonies, meridian flow, and energetic herbal/dietary dynamics.
                  } @else if (state.activePhilosophy() === 'ayurvedic') {
                    Mapping biomarkers and constitutional trends to the Tridosha framework (Vata/Pitta/Kapha), evaluating Agni (digestive fire) and Ama (cellular load).
                  }
                </p>
              </div>
            </div>
          </div>
        }

        <!-- ACM §1.3: AI-Generated Content Disclosure -->
        @if (hasAnyReport()) {
          <div class="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/30">
            <div class="relative group/ai-badge cursor-help">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-700/40 select-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a4 4 0 0 0-4 4c0 2 1 3.5 2 4.5L12 12l2-1.5c1-1 2-2.5 2-4.5a4 4 0 0 0-4-4z"/><path d="M12 12v10"/><path d="M8 22h8"/>
                </svg>
                AI-Generated
              </span>
              <!-- Tooltip -->
              <div class="absolute left-0 bottom-full mb-2 w-72 p-3 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] leading-relaxed shadow-xl opacity-0 group-hover/ai-badge:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                This analysis was generated by Google Gemini and has not been verified by a licensed clinician. Always verify recommendations with your care team.
                <div class="absolute left-4 top-full w-2 h-2 bg-zinc-900 dark:bg-zinc-800 rotate-45 -mt-1"></div>
              </div>
            </div>
            <span class="text-[10px] text-violet-600/80 dark:text-violet-400/70 font-medium">
              Powered by Google Gemini · Not clinically verified · <a href="/terms-of-service.html#ai-content" target="_blank" class="underline hover:text-violet-800 dark:hover:text-violet-300 transition-colors">Learn more</a>
            </span>
          </div>
        }

        <!--Clinical Overview Dashboard-->
        @if (activeLens() !== 'EMT Handoff' && intel.analysisMetrics(); as metrics) {
          <div class="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
            <div class="col-span-full mb-2">
              <h2 class="text-xs font-bold text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-widest border-b border-gray-100 dark:border-zinc-800 pb-2"> Clinical Overview Dashboard </h2>
            </div>

            <app-clinical-gauge
              label="Complexity"
              [value]="metrics.complexity"
              type="complexity"
              description="Measures comorbid depth and case difficulty.">
            </app-clinical-gauge>

            <app-clinical-gauge
              label="Stability"
              [value]="metrics.stability"
              type="stability"
              description="Patient physiological and functional compensatory status.">
            </app-clinical-gauge>

            <app-clinical-gauge
              label="Certainty"
              [value]="metrics.certainty"
              type="certainty"
              description="AI confidence based on available data density.">
            </app-clinical-gauge>

            <!--Trend Sparklines-->
            @if (historicalMetrics().length > 1) {
              <div class="col-span-full mt-4 p-4 sm:p-6 bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                <app-clinical-trend label="Complexity Trend" [values]="getHistoryValues('complexity')" type="complexity"></app-clinical-trend>
                <app-clinical-trend label="Stability Trend" [values]="getHistoryValues('stability')" type="stability"></app-clinical-trend>
                <app-clinical-trend label="Certainty Trend" [values]="getHistoryValues('certainty')" type="certainty"></app-clinical-trend>
              </div>
            }
          </div>
        }

        @if (intel.isLoading() && !hasAnyReport()) {
          <div class="h-64 flex flex-col items-center justify-center opacity-50 no-print">
            <div class="w-8 h-8 border-2 border-[#EEEEEE] dark:border-zinc-800 border-t-[#1C1C1C] dark:border-t-zinc-100 rounded-full animate-spin mb-4"></div>
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase tracking-widest text-[#689F38] dark:text-[#8bc34a] font-bold">{{ activeLens() }}</span>
              @if (intel.isLoading() && isTextEmpty(activeReport())) {
                <span class="flex h-1.5 w-1.5 rounded-full bg-[#689F38] dark:bg-[#8bc34a] animate-pulse"></span>
                <span class="text-[8px] uppercase tracking-tighter text-gray-500 dark:text-zinc-400">{{ activeAgentName() }} is synthesizing...</span>
              }
            </div>
            <p class="text-xs font-bold uppercase tracking-widest text-[#1C1C1C] dark:text-zinc-200">Processing Comprehensive Analysis</p>
          </div>
        }
        
        @if (intel.error() && !hasAnyReport()) {
          <div class="p-4 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-400 text-xs rounded-lg mb-4">
            <strong class="block uppercase tracking-wider mb-1">System Error</strong>
            {{ intel.error() }}
          </div>
        }



        <!-- EMT Handoff Component/Layout -->
        @if (activeLens() === 'EMT Handoff') {
          <div class="flex flex-col gap-6">
            <!-- Crimson alert banner -->
            <div class="p-4 bg-red-955/40 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center justify-between shadow-inner">
              <div class="flex items-center gap-2.5">
                <span class="text-lg">🚨</span>
                <div>
                  <h4 class="font-bold uppercase tracking-wider text-red-400">Offline Emergency First Aid Active</h4>
                  <p class="opacity-90 mt-0.5">Session-isolated, temporary clinical sandbox. No persistent data is saved.</p>
                </div>
              </div>
              <pocket-gull-button (click)="toggleCprMetronome()" 
                [variant]="isCprMetronomeActive() ? 'primary' : 'outline'" 
                class="shrink-0 font-bold uppercase tracking-widest text-[10px] py-1.5 px-3 border border-red-500/30 transition-all active:scale-95 animate-pulse"
                [class.bg-red-600]="isCprMetronomeActive()"
                [class.text-white]="isCprMetronomeActive()">
                🔊 CPR Metronome (110 BPM)
              </pocket-gull-button>
            </div>

            <!-- Two-column grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column: Vitals -->
              <pocket-gull-card title="Emergency Vitals" [icon]="ClinicalIcons.Assessment">
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Heart Rate</span>
                    <div class="text-xl font-extrabold text-red-500 dark:text-red-400 mt-1">
                      {{ state.vitals().hr || '--' }} <span class="text-xs font-normal text-gray-500 dark:text-zinc-500">BPM</span>
                    </div>
                  </div>
                  <div class="p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">SpO2</span>
                    <div class="text-xl font-extrabold text-blue-500 dark:text-blue-400 mt-1">
                      {{ state.vitals().spO2 || '--' }} <span class="text-xs font-normal text-gray-500 dark:text-zinc-500">%</span>
                    </div>
                  </div>
                  <div class="p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Temperature</span>
                    <div class="text-xl font-extrabold text-amber-500 dark:text-amber-400 mt-1">
                      {{ state.vitals().temp || '--' }} <span class="text-xs font-normal text-gray-500 dark:text-zinc-500">°F</span>
                    </div>
                  </div>
                  <div class="p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Blood Pressure</span>
                    <div class="text-xl font-extrabold text-purple-500 dark:text-purple-400 mt-1">
                      {{ state.vitals().bp || '--' }}
                    </div>
                  </div>
                </div>
              </pocket-gull-card>

              <!-- Right Column: Timeline -->
              <pocket-gull-card title="Bystander Actions Timeline" [icon]="ClinicalIcons.FollowUp">
                @if (state.clinicalNotes().length === 0) {
                  <div class="h-32 flex items-center justify-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                    <p class="text-xs text-gray-400 dark:text-zinc-500 font-medium">No actions logged yet.</p>
                  </div>
                } @else {
                  <div class="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                    @for (note of state.clinicalNotes(); track note.id) {
                      <div class="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/60 flex items-start justify-between gap-3">
                        <div class="flex-1 min-w-0">
                          <p class="text-xs text-gray-700 dark:text-zinc-300 font-medium break-words leading-relaxed">{{ note.text }}</p>
                          <span class="text-[9px] text-gray-400 dark:text-zinc-500 mt-1 block">{{ note.date }}</span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </pocket-gull-card>
            </div>

            <!-- Centered QR Code and FHIR section -->
            <div class="flex flex-col items-center justify-center mt-4 p-6 bg-gray-50 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/60 rounded-2xl">
              <h3 class="text-xs font-bold text-gray-900 dark:text-zinc-200 uppercase tracking-widest mb-1 text-center">EMT Handoff QR Code</h3>
              <p class="text-[10px] text-gray-500 dark:text-zinc-400 max-w-sm text-center mb-6">Scan with any mobile device to securely transfer patient vitals and treatment timeline in offline HL7 FHIR format.</p>
              
              @if (qrDataUrl()) {
                <div class="p-4 bg-white rounded-xl shadow-md border border-gray-200 mb-6 flex items-center justify-center">
                  <img [src]="qrDataUrl()" class="w-48 h-48 sm:w-64 sm:h-64 select-none pointer-events-none" style="image-rendering: pixelated;" alt="EMT Handoff FHIR QR Code" />
                </div>
              } @else {
                <div class="w-48 h-48 sm:w-64 sm:h-64 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg flex items-center justify-center mb-6">
                  <p class="text-xs text-gray-400">Loading QR Code...</p>
                </div>
              }

              <!-- Collapsible raw FHIR bundle text area -->
              <div class="w-full border-t border-gray-200 dark:border-zinc-800/60 pt-4 flex flex-col items-center">
                <pocket-gull-button (click)="showRawFhir.set(!showRawFhir())" variant="ghost" size="sm" class="text-xs text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 gap-1.5">
                  {{ showRawFhir() ? 'Hide Raw FHIR Bundle' : 'Show Raw FHIR Bundle' }}
                </pocket-gull-button>
                
                @if (showRawFhir()) {
                  <div class="w-full mt-4 bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                    <pre class="text-[9px] font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-48 scrollbar-thin">{{ fhirJsonString() }}</pre>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Biomarker Matrix (Orthomolecular Only) -->
        @if (activeLens() === 'Precision Nutrients' && hasAnyReport()) {
          <app-biomarker-matrix [reportText]="activeReport()"></app-biomarker-matrix>
        }

        <!--AI Report Section-->
        @if (activeLens() !== 'EMT Handoff' && reportSections(); as sections) {
          <div class="flex flex-col gap-4 sm:gap-6 pb-4 w-full min-w-0">
            @for (section of sections; track section.title; let i = $index) {
              <div [id]="i === 0 ? 'tour-report-node' : null" appReveal [revealDelay]="i * 100" class="w-full shrink-0 flex flex-col min-h-max min-w-0 overflow-hidden">
                <pocket-gull-card [title]="section.title" [icon]="section.icon" class="flex-1 min-w-0 overflow-hidden">
                  <div right-action class="flex items-center gap-2">
                    @if (intel.isLoading() && !verificationStatus(section.title)) {
                      <div class="flex items-center gap-1.5 mr-2">
                        <span class="flex h-1.5 w-1.5 rounded-full bg-[#689F38] dark:bg-[#8bc34a] animate-pulse"></span>
                        <span class="text-[8px] uppercase tracking-tighter text-gray-500 dark:text-zinc-400">{{ activeAgentName() }} is streaming...</span>
                      </div>
                    }
                    @if (verificationStatus(section.title); as status) {
                      <pocket-gull-badge [label]="status" [severity]="statusSeverity(status)">
                        <div badge-icon [innerHTML]="ClinicalIcons.Verified | safeHtml"></div>
                      </pocket-gull-badge>
                    }
                  </div>

                  <div class="rams-typography" (mouseover)="onTooltipOver($event)" (mouseout)="onTooltipOut($event)">
                    @for (node of section.nodes; track node.id) {
                      @if (node.type === 'raw') {
                        <div [innerHTML]="(node.rawHtml || '') | safeHtml" class="mb-4"></div>
                      } @else if (node.type === 'paragraph') {
                        <app-summary-node
                          [node]="node"
                          type="paragraph"
                          [sectionTitle]="section.title"
                          [saveStatus]="nodeSaveStatuses()[node.key]"
                          [protocolInsights]="protocolInsights"
                          (update)="handleNodeUpdate(node, $event)"
                          (dictationToggle)="openNodeDictation(node)"
                          (askAgent)="openAgentDialog($event)">
                        </app-summary-node>
                      } @else if (node.type === 'list') {
                        @if (node.ordered) {
                          <ol class="list-decimal pl-4 mb-6">
                            @for (item of node.items; track item.id) {
                              <li class="pl-2 mb-1">
                                <app-summary-node
                                  [node]="item"
                                  type="list-item"
                                  [sectionTitle]="section.title"
                                  [saveStatus]="nodeSaveStatuses()[item.key]"
                                  [protocolInsights]="protocolInsights"
                                  (update)="handleNodeUpdate(item, $event)"
                                  (dictationToggle)="openNodeDictation(item)"
                                  (askAgent)="openAgentDialog($event)">
                                </app-summary-node>
                              </li>
                            }
                          </ol>
                        } @else {
                          <ul class="list-disc pl-4 mb-6">
                            @for (item of node.items; track item.id) {
                              <li class="pl-2 mb-1">
                                <app-summary-node
                                  [node]="item"
                                  type="list-item"
                                  [sectionTitle]="section.title"
                                  [saveStatus]="nodeSaveStatuses()[item.key]"
                                  [protocolInsights]="protocolInsights"
                                  (update)="handleNodeUpdate(item, $event)"
                                  (dictationToggle)="openNodeDictation(item)"
                                  (askAgent)="openAgentDialog($event)">
                                </app-summary-node>
                              </li>
                            }
                          </ul>
                        }
                      }
                    }
                  </div>
                </pocket-gull-card>
              </div>
            }
          </div>
          
          <!-- AI Co-Pilot Transparency Watermark -->
          <div class="mt-4 pb-8 flex items-center justify-center gap-3 opacity-60 no-print select-none">
            <div class="h-px bg-gray-300 dark:bg-zinc-700 flex-1 max-w-[120px]"></div>
            <div class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 flex items-center gap-1.5">
               <span [innerHTML]="ClinicalIcons.Verified | safeHtml" class="w-3.5 h-3.5"></span>
               Generated by AI Co-Pilot — Verify all clinical findings
            </div>
            <div class="h-px bg-gray-300 dark:bg-zinc-700 flex-1 max-w-[120px]"></div>
          </div>
        }

        @if (!intel.isLoading() && !hasAnyReport()) {
          <div class="h-64 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg flex items-center justify-center no-print">
            <p class="text-xs text-gray-500 dark:text-zinc-400 font-medium uppercase tracking-widest">Waiting for input data...</p>
          </div>
        }
      </div>
    </div>

    <!-- Viewport Portal Tooltip -->
    @if (activeTooltip(); as tooltip) {
      <div class="fixed z-[100] w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-2xl p-4 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
           [style.left.px]="tooltip.x"
           [style.top.px]="tooltip.y"
           style="transform: translate(-50%, -100%);">
        <div class="flex items-start gap-3 relative z-10">
          <!-- Spectral severity icon: P1-Critical (640nm red) vs P2-Urgent (585nm amber) -->
          <div class="mt-0.5 shrink-0"
               [style.color]="tooltip.severity === 'high' ? 'var(--spectral-critical)' : 'var(--spectral-urgent)'"
               [innerHTML]="(tooltip.severity === 'high' ? ClinicalIcons.Risk : ClinicalIcons.Risk) | safeHtml">
          </div>
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider mb-1"
                 [style.color]="tooltip.severity === 'high' ? 'var(--spectral-critical)' : 'var(--spectral-urgent)'">
              AI Verification Flag
            </div>
            <div class="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">{{ tooltip.text }}</div>
          </div>
        </div>
        <!-- Caret -->
        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-900 border-b border-r border-gray-200 dark:border-zinc-800 rotate-45"></div>
     </div>
    }

    <!-- Node Agent Dialog (Evidence Focus) -->
    @if (nodeAgentDialogData()) {
      <app-node-agent-dialog
        [data]="nodeAgentDialogData()!"
        [patientData]="currentPatientDataForDialog()"
        (closed)="nodeAgentDialogData.set(null)">
      </app-node-agent-dialog>
    }
  `
})
export class AnalysisReportComponent implements OnDestroy {
  protected readonly intel = inject(ClinicalIntelligenceService);
  protected readonly state = inject(PatientStateService);
  protected readonly patientManager = inject(PatientManagementService);
  protected readonly dictation = inject(DictationService);
  private audit = inject(AuditService);
  protected readonly export = inject(ExportService);
  isCprMetronomeActive = signal<boolean>(false);
  private cprIntervalId: any = null;
  private audioCtx: AudioContext | null = null;

  readonly hasApiKey = computed(() => {
    // This line was part of the user's provided snippet, but it was incomplete and syntactically incorrect.
    // Assuming the user intended to add a computed property named `hasApiKey` and keep the existing injections.
    // The `inject(AiCacheService);` was already present as `protected readonly cache = inject(AiCacheService);`
    // and is kept in its original place for syntactical correctness.
    return true; // Placeholder for actual logic
  });
  protected readonly cache = inject(AiCacheService);
  protected readonly markdownService = inject(MarkdownService);
  protected readonly ClinicalIcons = ClinicalIcons;

  historyEntries = signal<any[]>([]);

  historicalMetrics = computed(() => {
    return this.historyEntries()
      .map(e => e.value._metrics)
      .filter(m => !!m);
  });

  getHistoryValues(type: 'complexity' | 'stability' | 'certainty'): number[] {
    return this.historyEntries()
      .map(e => {
        const metrics = e.value?._metrics;
        if (!metrics) return 5;
        if (type === 'complexity') return metrics.complexity || 5;
        if (type === 'stability') return metrics.stability || 5;
        if (type === 'certainty') return metrics.certainty || 5;
        return 5;
      })
      .reverse();
  }

  async loadHistory() {
    const entries = await this.cache.getAllEntries();
    this.historyEntries.set(entries.filter(e => e.value?._isSnapshot));
  }

  activeLens = signal<AnalysisLens | 'EMT Handoff'>('Summary Overview');
  showRawFhir = signal(false);

  activeAgentName = computed(() => {
    const lens = this.activeLens();
    if (lens === 'EMT Handoff') return '';
    return this.intel.getAgentNameForLens(lens as AnalysisLens);
  });

  activeAgentRole = computed(() => {
    const lens = this.activeLens();
    if (lens === 'EMT Handoff') return '';
    return this.intel.getAgentRoleForLens(lens as AnalysisLens);
  });

  activeTabClasses = computed(() => {
    const phil = this.state.activePhilosophy();
    if (phil === 'eastern') {
      return 'border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 font-bold';
    }
    if (phil === 'ayurvedic') {
      return 'border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400 font-bold';
    }
    return 'border-sky-500 dark:border-sky-400 text-sky-600 dark:text-sky-400 font-bold';
  });

  fhirJsonString = computed(() => {
    const v = this.state.vitals();
    const notes = this.state.clinicalNotes();
    
    const entry: any[] = [
      {
        resource: {
          resourceType: 'Patient',
          id: 'emergency_casualty',
          name: [{ text: 'Emergency Casualty' }],
          gender: 'unknown'
        }
      }
    ];

    if (v.hr) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
          subject: { reference: 'Patient/emergency_casualty' },
          valueQuantity: { value: parseFloat(v.hr) || v.hr, unit: 'beats/minute' }
        }
      });
    }
    if (v.spO2) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '59408-5', display: 'Oxygen saturation' }] },
          subject: { reference: 'Patient/emergency_casualty' },
          valueQuantity: { value: parseFloat(v.spO2) || v.spO2, unit: '%' }
        }
      });
    }
    if (v.temp) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '8310-5', display: 'Body temperature' }] },
          subject: { reference: 'Patient/emergency_casualty' },
          valueQuantity: { value: parseFloat(v.temp) || v.temp, unit: 'F' }
        }
      });
    }
    if (v.bp) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure systolic & diastolic' }] },
          subject: { reference: 'Patient/emergency_casualty' },
          valueString: v.bp
        }
      });
    }

    notes.forEach((note, idx) => {
      entry.push({
        resource: {
          resourceType: 'Procedure',
          id: `procedure-${idx}`,
          status: 'completed',
          subject: { reference: 'Patient/emergency_casualty' },
          code: { text: note.text },
          performedDateTime: note.date
        }
      });
    });

    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry
    };

    return JSON.stringify(bundle, null, 2);
  });

  compactFhirJsonString = computed(() => {
    const v = this.state.vitals();
    const notes = this.state.clinicalNotes();
    
    const entry: any[] = [
      {
        resource: {
          resourceType: 'Patient',
          id: 'ec',
          name: [{ text: 'Casualty' }]
        }
      }
    ];

    if (v.hr) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'HR' },
          valueQuantity: { value: parseFloat(v.hr) || v.hr }
        }
      });
    }
    if (v.spO2) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'SpO2' },
          valueQuantity: { value: parseFloat(v.spO2) || v.spO2 }
        }
      });
    }
    if (v.temp) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'Temp' },
          valueQuantity: { value: parseFloat(v.temp) || v.temp }
        }
      });
    }
    if (v.bp) {
      entry.push({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: { text: 'BP' },
          valueString: v.bp
        }
      });
    }

    notes.forEach((note, idx) => {
      entry.push({
        resource: {
          resourceType: 'Procedure',
          status: 'completed',
          code: { text: note.text }
        }
      });
    });

    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry
    };

    return JSON.stringify(bundle);
  });

  qrDataUrl = computed(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    const fullJson = this.fhirJsonString();
    const compactJson = this.compactFhirJsonString();
    
    const fhirStr = fullJson.length < 1200 ? fullJson : compactJson;
    
    try {
      const qr = generate(fhirStr);
      return qr.toDataURL({ scale: 8 });
    } catch (e) {
      console.error('Failed to generate QR Code:', e);
      return '';
    }
  });


  // --- Portal Hover Tooltip ---
  activeTooltip = signal<{ text: string, x: number, y: number, severity: string } | null>(null);

  onTooltipOver(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('verification-claim')) {
      const rect = target.getBoundingClientRect();
      // Ensure the popover stays inside horizontal bounds
      let x = rect.left + (rect.width / 2);
      const padding = 150; // half of 300px width
      if (x < padding) x = padding;
      if (x > window.innerWidth - padding) x = window.innerWidth - padding;

      this.activeTooltip.set({
        text: target.getAttribute('data-message') || '',
        severity: target.classList.contains('bg-red-100') ? 'high' : 'medium',
        x: x,
        y: rect.top - 12 // 12px above element
      });
    }
  }

  onTooltipOut(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('verification-claim') || target.closest('.verification-claim')) {
      this.activeTooltip.set(null);
    }
  }

  // --- Hover Toolbar State ---
  hoveredElement = signal<HTMLElement | null>(null);
  toolbarPosition = signal<{ top: string; left: string } | null>(null);
  private leaveTimeout: any;

  lastRefreshDate = signal<string | null>(null);

  protocolInsights = [
    'Follow up in 72 hours if no improvement.',
    'Monitor BP and heart rate twice daily.',
    'Continue current medication as prescribed.',
    'Schedule follow-up with specialist.',
    'Patient education provided regarding diet.',
    'Increase fluid intake to 2L/day.',
    'Watch for signs of infection.'
  ];

  hasAnyReport = computed(() => Object.keys(this.intel.analysisResults()).length > 0);
  activeReport = computed(() => {
    const lens = this.activeLens();
    if (lens === 'EMT Handoff') return '';
    return getSafeProperty(this.intel.analysisResults(), lens) || '';
  });
  contentArea = viewChild<ElementRef<HTMLDivElement>>('contentArea');

  isSectionEmpty(section: any): boolean {
    return !section.nodes || section.nodes.length === 0;
  }

  isTextEmpty(text: string | undefined): boolean {
    return !text || text.trim().length === 0;
  }

  verificationStatus(sectionTitle: string): string | null {
    const lens = this.activeLens();
    if (lens === 'EMT Handoff') return null;
    const res = getSafeProperty(this.intel.verificationResults(), lens);
    return res?.status || null;
  }

  statusSeverity(status: string): any {
    switch (status) {
      case 'verified': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'neutral';
    }
  }

  reportSections = computed<IReportSection[] | null>(() => {
    const raw = this.activeReport();
    if (!raw) return null;
    try {
      const sections: IReportSection[] = [];
      const parts = raw.split(/\n(?=#{1,3}\s)/);
      parts.forEach((part, sIdx) => {
        if (!part.trim()) return;
        const lines = part.split('\n');
        const headingMarkdown = lines.find(l => l.trim().startsWith('#')) || lines[0] || '';
        const title = headingMarkdown.replace(/^#+\s*/, '').trim();
        const icon = this.getIconForSection(title);
        const contentMarkdown = part === headingMarkdown ? '' : part.substring(part.indexOf(headingMarkdown) + headingMarkdown.length);

        const verification = getSafeProperty(this.intel.verificationResults(), this.activeLens()) || { status: 'verified', issues: [] };
        const parser = this.markdownService.parser();
        if (!parser) return;

        let cleanMarkdown = contentMarkdown;
        // Strip out ```markdown code blocks if they consist of a table
        cleanMarkdown = cleanMarkdown.replace(/```(?:markdown)?\s*\n([\s\S]*?)\n```/g, (match, innerText) => {
          if (innerText.trim().startsWith('|')) {
            return innerText;
          }
          return match;
        });

        const tokens = parser.lexer(cleanMarkdown);
        const nodes: ISummaryNode[] = [];

        tokens.forEach((token: any, nIdx: number) => {
          const key = (token as any).text || token.raw || `node- ${sIdx} - ${nIdx}`;
          const activeLensAnns = getSafeProperty(this.lensAnnotations(), this.activeLens());
          const annotation = getSafeProperty(activeLensAnns, key) || { note: '', bracketState: 'normal' };

          // Extract suggestions and proposals
          const extractMetadata = (text: string) => {
            const suggestions: string[] = [];
            let proposedText: string | undefined;

            const suggMatches = text.matchAll(/\[\[suggestion:\s*(.*?)\]\]/g);
            for (const match of suggMatches) suggestions.push(match[1]);

            const propMatch = text.match(/\[\[proposed:\s*(.*?)\]\]/);
            if (propMatch) proposedText = propMatch[1];

            const cleanedText = text
              .replace(/\[\[suggestion:.*?\]\]/g, '')
              .replace(/\[\[proposed:.*?\]\]/g, '')
              .trim();

            return { suggestions, proposedText, cleanedText };
          };

          const applyHighlights = (html: string, issues: IVerificationIssue[]) => {
            let highlightedHtml = html;
            for (const issue of issues) {
              if (issue.claim && highlightedHtml.includes(issue.claim)) {
                const colorClass = issue.severity === 'high' ? 'bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 'bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';
                // Encode the message to ensure it doesn't break data attributes
                const highlightSpan = '<span class="verification-claim px-0.5 border-b-2 border-dotted cursor-help transition-colors ' +
                  colorClass +
                  '" data-message="' +
                  encodeHtml(issue.message) +
                  '">' +
                  encodeHtml(issue.claim) +
                  '</span>';
                highlightedHtml = highlightedHtml.replace(issue.claim, highlightSpan);
              }
            }
            return highlightedHtml;
          };

          if (token.type === 'paragraph') {
            const { suggestions, proposedText, cleanedText } = extractMetadata(token.text);
            const activeLensAnns2 = getSafeProperty(this.lensAnnotations(), this.activeLens());
            const annotation2 = getSafeProperty(activeLensAnns2, key) || { note: '', bracketState: 'normal' };
            const content = annotation2.modifiedText || cleanedText;

            nodes.push({
              id: `sec-${sIdx}-node-${nIdx}`,
              key,
              type: 'paragraph',
              rawHtml: applyHighlights(parser.parseInline(content) as string, verification.issues),
              bracketState: annotation2.bracketState,
              note: annotation2.note,
              showNote: !!annotation2.note,
              suggestions,
              proposedText,
              verificationStatus: verification.status as any,
              verificationIssues: verification.issues
            });
          } else if (token.type === 'list') {
            nodes.push({
              id: `sec-${sIdx}-node-${nIdx}`,
              key,
              type: 'list',
              ordered: token.ordered || false,
              items: (token.items as any[]).map((item: any, iIdx: number) => {
                const itemKey = item.text;
                const activeLensAnns3 = getSafeProperty(this.lensAnnotations(), this.activeLens());
                const itemAnnotation = getSafeProperty(activeLensAnns3, itemKey) || { note: '', bracketState: 'normal' };
                const { suggestions, proposedText, cleanedText } = extractMetadata(item.text);
                const content = itemAnnotation.modifiedText || cleanedText;

                return {
                  id: `sec-${sIdx}-node-${nIdx}-item-${iIdx}`,
                  key: itemKey,
                  html: applyHighlights(parser.parseInline(content) as string, verification.issues),
                  bracketState: itemAnnotation.bracketState,
                  note: itemAnnotation.note,
                  showNote: !!itemAnnotation.note,
                  suggestions,
                  proposedText
                };
              }),
              bracketState: annotation.bracketState,
              note: annotation.note,
              showNote: !!annotation.note
            });
          } else {
            nodes.push({
              id: `sec-${sIdx}-node-${nIdx}`,
              key,
              type: 'raw',
              rawHtml: parser.parse(token.raw) as string,
              bracketState: annotation.bracketState,
              note: annotation.note,
              showNote: !!annotation.note
            });
          }
        });

        sections.push({
          raw: part,
          heading: parser.parse(headingMarkdown) as string,
          title,
          icon,
          nodes
        });
      });
      return sections;
    } catch (e) {
      console.error('Markdown parse error', e);
      return [{ raw: raw, heading: '<h3>Error</h3>', title: 'Error', icon: ClinicalIcons.Risk, nodes: [{ id: 'err', key: 'err', type: 'raw', rawHtml: '<p>Could not parse report.</p>', bracketState: 'normal', note: '', showNote: false }] }];
    }
  });

  private getIconForSection(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('assessment') || lower.includes('overview') || lower.includes('nutrition')) return ClinicalIcons.Assessment;
    if (lower.includes('protocol') || lower.includes('intervention') || lower.includes('nutrition')) return ClinicalIcons.Medication;
    if (lower.includes('monitor') || lower.includes('cadence')) return ClinicalIcons.FollowUp;
    if (lower.includes('education') || lower.includes('resource')) return ClinicalIcons.Education;
    return ClinicalIcons.Assessment;
  }

  parsedTranscript = computed<IParsedTranscriptEntry[]>(() => {
    const transcript = this.intel.transcript();
    try {
      return transcript.map(entry => {
        const parsed: IParsedTranscriptEntry = { ...entry };
        if (entry.role === 'model') {
          parsed.htmlContent = this.renderInteractiveContent(entry.text);
        }
        return parsed;
      });
    } catch (e) {
      console.error('Transcript parse error', e);
      return transcript.map(entry => ({ ...entry }));
    }
  });

  get lensAnnotations() { return this.state.lensAnnotations; }  // Track save status per node
  readonly nodeSaveStatuses = signal<Record<string, 'idle' | 'saving' | 'saved'>>({});

  // Track save version — incrementing this kicks off the debounced auto-save effect
  private readonly _saveVersion = signal(0);
  private _autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Auto-scroll effect for transcript
    effect(() => {
      // This effect depends on the parsedTranscript signal.
      // It will run whenever the transcript changes.
      this.parsedTranscript();
    });

    // Removed the effect-based auto-scroll for patient summary content area, handled in ngAfterViewInit instead

    // Auto-load annotations effect
    effect(() => {
      const patient = this.patientManager.selectedPatient();
      if (patient) {
        const latestAnalysis = patient.history.filter(e => e.type === 'AnalysisRun' || e.type === 'FinalizedPatientSummary').pop();

        if (latestAnalysis) {
          untracked(() => {
            this.lastRefreshDate.set(latestAnalysis.date); // Use string date
          });
        }

        const latestFinalized = patient.history.find(e => e.type === 'FinalizedPatientSummary');
        if (latestFinalized && latestFinalized.type === 'FinalizedPatientSummary') {
          untracked(() => {
            this.state.lensAnnotations.set(latestFinalized.annotations || {});
          });
        } else {
          untracked(() => {
            this.state.lensAnnotations.set({});
          });
        }
      }
    });

    // New effect to handle analysis updates requested from other components
    effect(() => {
      const requestCount = this.state.analysisUpdateRequest();
      if (requestCount > 0) {
        untracked(() => {
          if (this.hasAnyReport()) {
            this.generate();
            this.loadHistory();
          }
        });
      }
    });

    this.loadHistory();

    // Auto-scroll during streaming: react to reportSections() changes while loading
    effect(() => {
      this.reportSections();
      if (!this.intel.isLoading()) return;
      untracked(() => {
        const el = this.contentArea()?.nativeElement;
        el?.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
      });
    });

    // Debounced auto-save: effect fires on every _saveVersion tick
    effect(() => {
      this._saveVersion(); // subscribe
      if (this._autoSaveTimer) clearTimeout(this._autoSaveTimer);
      this._autoSaveTimer = setTimeout(() => untracked(() => this.persistToHistory()), 1000);
    });

    // Auto-switch to EMT Handoff lens when in emergency mode
    effect(() => {
      if (this.state.isEmergencyMode()) {
        untracked(() => {
          this.activeLens.set('EMT Handoff');
        });
      }
    });
  }

  ngOnDestroy() {
    if (this._autoSaveTimer) clearTimeout(this._autoSaveTimer);
    this.flushAutoSave();
    this.stopCprMetronome();
  }

  private triggerAutoSave(nodeKey: string) {
    this.nodeSaveStatuses.update(prev => ({ ...prev, [nodeKey]: 'saving' }));
    this._saveVersion.update(v => v + 1);
  }

  private flushAutoSave() {
    if (this._autoSaveTimer) clearTimeout(this._autoSaveTimer);
    this.persistToHistory();
  }

  private persistToHistory() {
    const patientId = this.patientManager.selectedPatientId();
    if (!patientId) return;

    const historyEntry: HistoryEntry = {
      type: 'FinalizedPatientSummary',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      summary: 'Patient Summary updated (auto-saved).',
      report: this.intel.analysisResults(),
      annotations: this.lensAnnotations()
    };

    this.patientManager.updateHistoryEntry(patientId, historyEntry, (h) =>
      h.type === 'FinalizedPatientSummary' && h.date === historyEntry.date
    );

    // Update all 'saving' statuses to 'saved'
    this.nodeSaveStatuses.update(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (Reflect.get(next, key) === 'saving') {
          setSafeProperty(next, key, 'saved');
        }
      });
      return next;
    });

    // Clear 'saved' status after a few seconds
    setTimeout(() => {
      this.nodeSaveStatuses.update(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (Reflect.get(next, key) === 'saved') {
            if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
              Reflect.deleteProperty(next, key);
            }
          }
        });
        return next;
      });
    }, 3000);
  }

  private renderInteractiveContent(markdown: string): string {
    const parser = this.markdownService.parser();
    return parser ? parser.parse(markdown) as string : '';
  }

  handleNodeUpdate(node: ISummaryNode | ISummaryNodeItem, event: any) {
    if (event.note !== undefined) {
      this.updateAnnotation(node.key, { note: event.note });
      node.note = event.note; // Update local node state
      // Honor explicit showNote intent (e.g. from double-click); only hide if neither showNote nor note content present
      node.showNote = event.showNote === true ? true : !!event.note;
    }
    if (event.bracketState !== undefined) {
      this.updateAnnotation(node.key, { bracketState: event.bracketState });
      node.bracketState = event.bracketState; // Update local node state
    }
    if (event.acceptedProposal !== undefined) {
      this.updateAnnotation(node.key, { modifiedText: event.acceptedProposal });
      // The `reportSections` computed will re-render with `modifiedText`
    }

    // Trigger auto-save or sync
    if (event.bracketState !== undefined || event.note !== undefined || event.acceptedProposal !== undefined) {
      this.syncNodeToTaskFlow(node);
    }
  }


  private syncNodeToTaskFlow(node: ISummaryNode | ISummaryNodeItem) {
    const text = node.note || (node as any).rawHtml || (node as any).html;
    if (node.bracketState === 'added' || node.note) {
      this.state.addClinicalNote({
        id: node.id,
        text,
        sourceLens: this.activeLens(),
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
      });

      if (node.bracketState === 'added') {
        this.state.addDraftSummaryItem(node.id, text);
      }
    } else {
      this.state.removeClinicalNote(node.id);
      this.state.removeDraftSummaryItem(node.id);
    }
  }


  private updateAnnotation(key: string, data: Partial<NodeAnnotation>) {
    this.state.lensAnnotations.update(all => {
      const currentLens = this.activeLens();
      const lensData = { ...(getSafeProperty(all, currentLens) || {}) };
      const currentAnn = getSafeProperty(lensData, key) || { note: '', bracketState: 'normal' };
      setSafeProperty(lensData, key, { ...currentAnn, ...data });

      const newAll = { ...all };
      setSafeProperty(newAll, currentLens, lensData);
      return newAll;
    });
    this.triggerAutoSave(key);
  }

  activeDictationNode = signal<ISummaryNode | ISummaryNodeItem | null>(null);

  openNodeDictation(node: ISummaryNode | ISummaryNodeItem) {
    if (this.dictation.isListening() && this.activeDictationNode() === node) {
      this.dictation.stopRecognition();
      node.isDictating = false;
      this.activeDictationNode.set(null);
      return;
    }

    if (this.dictation.isListening()) {
      this.dictation.stopRecognition();
      const prev = this.activeDictationNode();
      if (prev) prev.isDictating = false;
    }

    node.isDictating = true;
    this.activeDictationNode.set(node);

    const initialText = node.note || '';
    let baseText = initialText ? initialText + (initialText.endsWith(' ') ? '' : ' ') : '';

    this.dictation.registerResultHandler((text, isFinal) => {
      if (this.activeDictationNode() === node) {
        node.note = baseText + text;
        this.updateAnnotation(node.key, { note: node.note });
        if (isFinal) {
          this.syncNodeToTaskFlow(node);
        }
      }
    });

    this.dictation.startRecognition();
  }

  // --- Report Actions ---
  async generate() {
    this.audit.logAction('GENERATE_REPORT', this.patientManager.selectedPatientId());
    const patientId = this.patientManager.selectedPatientId();
    const patient = patientId ? this.patientManager.patients().find(p => p.id === patientId) : null;
    const history = patient?.history || [];
    const bookmarks = patient?.bookmarks || [];

    const reportData = await this.intel.generateComprehensiveReport(this.state.getAllDataForPrompt(history, bookmarks));

    if (patientId && Object.keys(reportData).length > 0) {
      const historyEntry: HistoryEntry = {
        type: 'AnalysisRun',
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        summary: 'Comprehensive AI analysis generated.',
        report: reportData
      };
      this.patientManager.addHistoryEntry(patientId, historyEntry);
      this.activeLens.set('Summary Overview');
    }
  }

  changeLens(lens: AnalysisLens | 'EMT Handoff') {
    this.audit.logAction('VIEW_LENS', this.patientManager.selectedPatientId(), { lens });
    this.flushAutoSave();
    this.activeLens.set(lens);
  }

  toggleCprMetronome() {
    if (this.isCprMetronomeActive()) {
      this.stopCprMetronome();
    } else {
      this.startCprMetronome();
    }
  }

  startCprMetronome(): void {
    if (typeof window === 'undefined') return;
    if (this.cprIntervalId) return;

    this.isCprMetronomeActive.set(true);
    const intervalMs = 60000 / 110; // ~545.45 ms

    // Trigger immediately on start
    this.playCprClick();

    this.cprIntervalId = setInterval(() => {
      this.playCprClick();
    }, intervalMs);
  }

  stopCprMetronome(): void {
    if (this.cprIntervalId) {
      clearInterval(this.cprIntervalId);
      this.cprIntervalId = null;
    }
    this.isCprMetronomeActive.set(false);
    if (typeof window !== 'undefined') {
      document.body.classList.remove('cpr-flash');
    }
  }

  playCprClick(): void {
    if (typeof window === 'undefined') return;

    // Trigger visual flash
    document.body.classList.add('cpr-flash');
    setTimeout(() => {
      document.body.classList.remove('cpr-flash');
    }, 100);

    // Audio click
    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn('[CPR] audio click failed:', e);
    }
  }

  finalizeSummaryReport() {
    const patientId = this.patientManager.selectedPatientId();
    if (!patientId) return;

    const historyEntry: HistoryEntry = {
      type: 'FinalizedPatientSummary',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      summary: 'Patient Summary finalized and saved to chart.',
      report: this.intel.analysisResults(),
      annotations: this.lensAnnotations()
    };

    this.patientManager.addHistoryEntry(patientId, historyEntry);

    // Briefly change tab to show it's saved? 
    // For now we'll just log and rely on the history update
    console.log('Patient summary finalized and saved to chart.');
  }

  printReport() {
    const results = this.intel.analysisResults();
    const patientName = this.patientManager.selectedPatient()?.name || 'Clinical User';

    this.export.downloadAsPdf({
      report: results,
      summary: results['Summary Overview'] || 'No summary available.'
    }, patientName);
  }

  // --- Live Consult Actions ---

  /** Signal holding the currently-open NodeAgentDialog data (null = closed). */
  nodeAgentDialogData = signal<INodeAgentDialogData | null>(null);

  /** Provides the serialised patient data string for the NodeAgentDialog context. */
  currentPatientDataForDialog = computed(() => {
    const patient = this.patientManager.selectedPatient();
    if (!patient) return '';
    return this.state.getAllDataForPrompt(patient.history, patient.bookmarks || []);
  });

  openAgentDialog(event: string | { nodeKey: string; nodeText: string; sectionTitle: string }) {
    if (typeof event === 'string') {
      this.insertSectionIntoChat(event);
    } else {
      this.nodeAgentDialogData.set({
        nodeKey: event.nodeKey,
        nodeText: event.nodeText,
        sectionTitle: event.sectionTitle
      });
    }
  }

  insertSectionIntoChat(sectionMarkdown: string) {
    this.state.toggleLiveAgent(true); // Ensure panel is open
    // Need to wait for view to update if we just switched modes
    setTimeout(() => {
      this.state.liveAgentInput.set(`Regarding this section:\n\n> ${sectionMarkdown.replace(/\n/g, '\n> ')}\n\n`);
      const input = document.querySelector<HTMLTextAreaElement>('#chatInput');
      input?.focus();
    }, 100);
  }
}

function getSafeProperty<T>(obj: Record<string, T> | undefined | null, key: string): T | undefined {
  if (!obj || key === '__proto__' || key === 'constructor' || key === 'prototype') {
    return undefined;
  }
  return Reflect.get(obj, key);
}

function setSafeProperty<T>(obj: Record<string, T>, key: string, value: T): void {
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
    return;
  }
  Reflect.set(obj, key, value);
}

function encodeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
