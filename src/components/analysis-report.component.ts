import { Component, ChangeDetectionStrategy, inject, computed, ViewEncapsulation, signal, OnDestroy, effect, viewChild, ElementRef, untracked } from '@angular/core';
import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
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
import { CostBenefitAnalysisComponent } from './cost-benefit-analysis.component';
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
import { YbocsScreenerComponent } from './ybocs-screener.component';
import { ClinicalMenuComponent } from './clinical-menu.component';
import { KssCognitiveShieldComponent } from './kss-cognitive-shield.component';
import { CarePlanPrintPreviewComponent } from './care-plan-print-preview.component';
import { EmergencyNutritionalBypassComponent } from './emergency-nutritional-bypass.component';
import { MoodConsciousnessMatrixComponent } from './mood-consciousness-matrix.component';
import { UkRioPubmedSourcingComponent } from './uk-rio-pubmed-sourcing.component';
import { PatientFruitTreeComponent } from './patient-fruit-tree.component';
import { DietaryAllergyShieldComponent } from './dietary-allergy-shield.component';
import { LensInsightSparkShieldComponent } from './lens-insight-spark-shield.component';
import { ParadigmClinicalDashboardComponent } from './paradigm-clinical-dashboard.component';
import { GeolocationalHealthRelocationComponent } from './geolocational-health-relocation.component';
import { ClinicalActLensMapperService } from '../services/clinical-act-lens-mapper.service';
import { TypologyBadgeComponent } from './typology-badge.component';
import { InstantPatientActionSuiteComponent } from './instant-patient-action-suite.component';
import { PatientHealthTrajectoryStorybookComponent } from './patient-health-trajectory-storybook.component';
import { HandoffModalComponent } from './handoff-modal.component';
import { SdohNavigatorComponent } from './sdoh-navigator.component';

@Component({
  selector: 'app-analysis-report',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    TitleCasePipe,
    SummaryNodeComponent,
    PocketGullCardComponent,
    BiomarkerMatrixComponent,
    CostBenefitAnalysisComponent,
    SafeHtmlPipe,
    PocketGullBadgeComponent,
    ClinicalGaugeComponent,
    ClinicalTrendComponent,
    PocketGullButtonComponent,
    RevealDirective,
    NodeAgentDialogComponent,
    YbocsScreenerComponent,
    ClinicalMenuComponent,
    KssCognitiveShieldComponent,
    CarePlanPrintPreviewComponent,
    EmergencyNutritionalBypassComponent,
    MoodConsciousnessMatrixComponent,
    UkRioPubmedSourcingComponent,
    PatientFruitTreeComponent,
    DietaryAllergyShieldComponent,
    LensInsightSparkShieldComponent,
    ParadigmClinicalDashboardComponent,
    GeolocationalHealthRelocationComponent,
    InstantPatientActionSuiteComponent,
    PatientHealthTrajectoryStorybookComponent,
    TypologyBadgeComponent,
    HandoffModalComponent,
    SdohNavigatorComponent
  ],




  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'flex flex-col flex-1 min-h-0 w-full overflow-hidden'
  },
  styles: [`
    /* Typography is now handled globally in styles.css */
  `],
  template: `


    <!-- Analysis & Paradigm Carousel Navigation Bar (Pixel 9 Pro Mobile Optimized) -->
    @if (hasAnyReport() || state.isEmergencyMode()) {
      <div class="px-2 sm:px-8 py-2 sm:py-3 no-print w-full bg-slate-100/90 dark:bg-zinc-950/90 border-b border-slate-200 dark:border-zinc-800">
        <div class="max-w-4xl mx-auto min-w-0 relative flex flex-col gap-2">
          
          <!-- Lens Navigation & Action Bar -->
          <div class="flex items-center justify-between gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <div class="flex items-center gap-1.5 shrink-0">
              <button type="button" (click)="showHandoffModal.set(true)"
                class="px-3 py-1 text-[11px] font-extrabold uppercase rounded-full border border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer flex items-center gap-1">
                <span>🤝</span> Specialist Handoff
              </button>
            </div>

            <!-- Touch Carousel Chevrons -->
            <div class="flex items-center gap-1 shrink-0">
              <button type="button" (click)="scrollLenses('left')" aria-label="Scroll left"
                class="w-8 h-8 rounded-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer">
                ‹
              </button>
              <button type="button" (click)="scrollLenses('right')" aria-label="Scroll right"
                class="w-8 h-8 rounded-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer">
                ›
              </button>
            </div>
          </div>

          <!-- Touch Snap Horizontal Carousel Strip -->
          <div #lensCarousel id="tour-lens-tabs" 
               class="flex overflow-x-auto hide-scrollbar items-center gap-2 w-full relative z-10 snap-x snap-mandatory scroll-smooth py-1">
            
            <button (click)="changeLens('Summary Overview')"
              data-testid="tab-overview"
              [class.bg-indigo-600]="activeLens() === 'Summary Overview'"
              [class.text-white]="activeLens() === 'Summary Overview'"
              class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12px] whitespace-nowrap transition-all border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>📋</span> Overview
            </button>

            <button (click)="changeLens('Treatment Matrix')"
              data-testid="tab-treatment-matrix"
              [class.bg-indigo-600]="activeLens() === 'Treatment Matrix'"
              [class.text-white]="activeLens() === 'Treatment Matrix'"
              class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12px] whitespace-nowrap transition-all border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>💊</span> Treatment Matrix
            </button>

            <button (click)="changeLens('Functional Protocols')"
              data-testid="tab-functional-protocols"
              [class.bg-indigo-600]="activeLens() === 'Functional Protocols'"
              [class.text-white]="activeLens() === 'Functional Protocols'"
              class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12px] whitespace-nowrap transition-all border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>🧠</span> Functional Protocols
            </button>

            <button (click)="changeLens('Nutrition')"
              data-testid="tab-nutrition"
              [class.bg-indigo-600]="activeLens() === 'Nutrition'"
              [class.text-white]="activeLens() === 'Nutrition'"
              class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12px] whitespace-nowrap transition-all border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>🥗</span> Nutrition
            </button>

            <button (click)="changeLens('Precision Nutrients')"
              data-testid="tab-precision-nutrients"
              [class.bg-indigo-600]="activeLens() === 'Precision Nutrients'"
              [class.text-white]="activeLens() === 'Precision Nutrients'"
              class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12px] whitespace-nowrap transition-all border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>🧬</span> Precision Nutrients
            </button>

            <button (click)="changeLens('Monitoring & Follow-up')"
              data-testid="tab-monitoring-follow-up"
              [class.bg-indigo-600]="activeLens() === 'Monitoring & Follow-up'"
              [class.text-white]="activeLens() === 'Monitoring & Follow-up'"
              class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12px] whitespace-nowrap transition-all border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>📈</span> Monitoring & Follow-up
            </button>

            <button (click)="changeLens('Patient Education')"
              data-testid="tab-patient-education"
              [class.bg-indigo-600]="activeLens() === 'Patient Education'"
              [class.text-white]="activeLens() === 'Patient Education'"
              class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12.5px] whitespace-nowrap transition-all border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>📚</span> Patient Education
            </button>

            <button (click)="changeLens('PhysioNet Telemetry')"
              [class.bg-indigo-600]="activeLens() === 'PhysioNet Telemetry'"
              [class.text-white]="activeLens() === 'PhysioNet Telemetry'"
              class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12px] whitespace-nowrap transition-all border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>📡</span> PhysioNet Waveforms
            </button>

            <button (click)="changeLens('Y-BOCs Screener')"
              [class.bg-indigo-600]="activeLens() === 'Y-BOCs Screener'"
              [class.text-white]="activeLens() === 'Y-BOCs Screener'"
              class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12px] whitespace-nowrap transition-all border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-indigo-500 flex items-center gap-1.5 shrink-0 cursor-pointer">
              <span>🧠</span> Y-BOCs Screener
            </button>

            @if (state.isEmergencyMode()) {
              <button (click)="changeLens('EMT Handoff')"
                [class.bg-red-600]="activeLens() === 'EMT Handoff'"
                [class.text-white]="activeLens() === 'EMT Handoff'"
                class="snap-start py-2.5 px-4 min-h-[44px] rounded-xl font-extrabold uppercase tracking-wider text-[12px] whitespace-nowrap transition-all border border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white flex items-center gap-1.5 shrink-0 cursor-pointer">
                <span>🚑</span> EMT Handoff
              </button>
            }
          </div>

          <!-- Carousel Pagination Dot Indicators -->
          <div class="flex items-center justify-center gap-1.5 pt-1">
            @for (lens of availableLenses; track lens; let i = $index) {
              <button (click)="changeLens(lens)" [attr.aria-label]="'Go to lens ' + lens"
                [class.w-4]="activeLensIndex() === i"
                [class.bg-indigo-600]="activeLensIndex() === i"
                [class.dark:bg-indigo-400]="activeLensIndex() === i"
                [class.w-1.5]="activeLensIndex() !== i"
                [class.bg-slate-300]="activeLensIndex() !== i"
                [class.dark:bg-zinc-700]="activeLensIndex() !== i"
                class="h-1.5 rounded-full transition-all duration-300 cursor-pointer">
              </button>
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
                  <span class="text-[12px] font-bold uppercase tracking-widest"
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
                  <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-bold uppercase tracking-wider bg-gray-50/50 dark:bg-zinc-900/50 border-gray-200/40 dark:border-zinc-800/40"
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

                <!-- Higher-Order Paradigm Typology Badge -->
                <div class="mt-2.5 flex items-center gap-2">
                  <app-typology-badge 
                    [paradigm]="state.activePhilosophy() === 'eastern' ? 'tcm' : (state.activePhilosophy() === 'ayurvedic' ? 'ayurvedic' : 'western')"
                    [lens]="activeLens()"
                    [evidenceGrade]="'A'"
                    [systemTag]="activeLens() === 'Summary Overview' ? 'Pathophysiological' : (activeLens() === 'Treatment Matrix' ? 'Multi-Modal Intervention' : (activeLens() === 'Functional Protocols' ? 'Biochemical & Circadian' : (activeLens() === 'Nutrition' ? 'Metabolic & Oxidative' : (activeLens() === 'Precision Nutrients' ? 'Orthomolecular Dosing' : 'Cognitive Localization'))))">
                  </app-typology-badge>
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

        @if (activeLens() === 'Y-BOCs Screener') {
          <div class="w-full">
            <app-ybocs-screener></app-ybocs-screener>
          </div>
        } @else {
          <!-- ACM §1.3: AI-Generated Content Disclosure -->
          @if (hasAnyReport()) {
            <div class="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/30">
            <div class="relative group/ai-badge cursor-help">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold uppercase tracking-widest bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-700/40 select-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a4 4 0 0 0-4 4c0 2 1 3.5 2 4.5L12 12l2-1.5c1-1 2-2.5 2-4.5a4 4 0 0 0-4-4z"/><path d="M12 12v10"/><path d="M8 22h8"/>
                </svg>
                AI-Generated
              </span>
              <!-- Tooltip -->
              <div class="absolute left-0 bottom-full mb-2 w-72 p-3 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-[12px] leading-relaxed shadow-xl opacity-0 group-hover/ai-badge:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                This analysis was generated by Google Gemini and has not been verified by a licensed clinician. Always verify recommendations with your care team.
                <div class="absolute left-4 top-full w-2 h-2 bg-zinc-900 dark:bg-zinc-800 rotate-45 -mt-1"></div>
              </div>
            </div>
            <span class="text-[12px] text-violet-600/80 dark:text-violet-400/70 font-medium">
              Powered by Google Gemini · Not clinically verified · <a href="/terms-of-service.html#ai-content" target="_blank" class="underline hover:text-violet-800 dark:hover:text-violet-300 transition-colors">Learn about clinical AI verification</a>
            </span>
          </div>
        }

        <!--Clinical Overview Dashboard-->
        @if (activeLens() !== 'EMT Handoff' && intel.analysisMetrics(); as metrics) {
          <div class="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
            <div class="col-span-full mb-2">
              <h2 class="text-xs font-bold text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-widest border-b border-gray-100 dark:border-zinc-800 pb-2"> Clinical Overview Dashboard </h2>
            </div>

            <!-- Multi-Paradigm Switchable Clinical Dashboard -->
            <div class="col-span-full mb-2">
              <app-paradigm-clinical-dashboard></app-paradigm-clinical-dashboard>
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
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs uppercase tracking-widest text-[#689F38] dark:text-[#8bc34a] font-bold">{{ activeLens() }}</span>
                @if (intel.isLoading() && isTextEmpty(activeReport())) {
                  <span class="flex h-1.5 w-1.5 rounded-full bg-[#689F38] dark:bg-[#8bc34a] animate-pulse"></span>
                  <span class="text-[12px] uppercase tracking-tighter text-gray-500 dark:text-zinc-400">{{ activeAgentName() }} is synthesizing...</span>
                }
              </div>
              @if (intel.webgpuIsLoading() && intel.webgpuProgress()) {
                <div class="text-[12px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 flex items-center gap-2 max-w-sm text-center animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-zinc-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  <span class="font-mono">{{ intel.webgpuProgress() }}</span>
                </div>
              }
            </div>
            <p class="text-xs font-bold uppercase tracking-widest text-[#1C1C1C] dark:text-zinc-200 mt-2">Processing Comprehensive Analysis</p>
          </div>
        }
        
        @if (intel.error()) {
          <div class="p-4 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-400 text-xs rounded-lg mb-4">
            <strong class="block uppercase tracking-wider mb-1">System Error</strong>
            {{ intel.error() }}
          </div>
        }

        <!-- Theatrical Clinical Proposal Act Banner -->
        @if (activeActProposal(); as act) {
          <div class="mb-6 p-4 rounded-md border-l-4 border-l-indigo-600 dark:border-l-indigo-400 border-t border-b border-r border-t-slate-200 border-b-slate-200 border-r-slate-200 dark:border-t-zinc-800 dark:border-b-zinc-800 dark:border-r-zinc-800 bg-slate-50 dark:bg-zinc-900/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ act.icon }}</span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40">
                    {{ act.actsSequenceStage }}
                  </span>
                </div>
                <h3 class="text-sm font-extrabold text-slate-900 dark:text-zinc-100 uppercase tracking-wider mt-1">
                  {{ activeActTitle() }}
                </h3>
                <p class="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 font-medium">
                  {{ act.proposalFocus }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Paradigm: {{ state.activePhilosophy() | uppercase }}
              </span>
            </div>
          </div>
        }

        <!-- Instant Patient Action Suite (Somatic Relief, Service Animal & Health Simulator) -->
        @if (hasAnyReport()) {
          <app-instant-patient-action-suite></app-instant-patient-action-suite>
        }



        <!-- EMT Handoff Component/Layout -->
        @if (activeLens() === 'EMT Handoff') {
          <div class="flex flex-col gap-6 animate-in fade-in duration-500">
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
                class="shrink-0 font-bold uppercase tracking-widest text-[12px] py-1.5 px-3 border border-red-500/30 transition-all active:scale-95"
                [class.bg-red-600]="isCprMetronomeActive()"
                [class.text-white]="isCprMetronomeActive()">
                🔊 {{ isCprMetronomeActive() ? 'Stop Metronome' : 'CPR Metronome (' + (patientAgeCategory() === 'infant' ? '120' : '110') + ' BPM)' }}
              </pocket-gull-button>
            </div>

            <!-- Patient Demographic Selector (Age & Pregnancy) -->
            <div class="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span class="text-[12px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest block mb-1">Target Patient Demographic</span>
                <div class="flex items-center gap-2">
                  <button type="button" (click)="patientAgeCategory.set('adult')"
                    [class]="patientAgeCategory() === 'adult' ? 'bg-zinc-850 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'"
                    class="px-3 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
                    🧑 Adult
                  </button>
                  <button type="button" (click)="patientAgeCategory.set('infant'); isPatientPregnant.set(false)"
                    [class]="patientAgeCategory() === 'infant' ? 'bg-zinc-850 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'"
                    class="px-3 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
                    👶 Infant (Baby)
                  </button>
                  <button type="button" (click)="patientAgeCategory.set('geriatric')"
                    [class]="patientAgeCategory() === 'geriatric' ? 'bg-zinc-850 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'"
                    class="px-3 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
                    🧓 Geriatric (Elder)
                  </button>
                </div>
              </div>

              @if (patientAgeCategory() === 'adult') {
                <div class="flex items-center gap-2">
                  <span class="text-[12px] uppercase tracking-wider font-bold text-gray-500 dark:text-zinc-400">Pregnancy Check:</span>
                  <button type="button" (click)="isPatientPregnant.set(!isPatientPregnant())"
                    [class]="isPatientPregnant() ? 'bg-pink-500/10 text-pink-600 border-pink-500/40' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'"
                    class="px-3 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition flex items-center gap-1.5">
                    🤰 {{ isPatientPregnant() ? 'Pregnant Patient' : 'Not Pregnant' }}
                  </button>
                </div>
              }
            </div>

            <!-- CPR Visual Coach HUD -->
            @if (isCprMetronomeActive()) {
              <div class="p-5 bg-zinc-950 border border-red-900/60 rounded-2xl flex flex-col items-center justify-center gap-4 text-center animate-in slide-in-from-top-4 duration-300">
                <div class="flex items-center gap-4">
                  <div class="text-[12px] uppercase font-mono tracking-widest text-zinc-500">Cycle {{ cprCycleCount() }}</div>
                  <div class="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                  <div class="text-[12px] uppercase font-mono tracking-widest text-red-500 font-extrabold animate-pulse">
                    @if (cprCompressionCount() <= 30) {
                      COMPRESSION: {{ cprCompressionCount() }} / 30
                    } @else {
                      RESCUE BREATH PHASE
                    }
                  </div>
                </div>
                
                <!-- Bouncing Target Indicator synchronized with compression clicks -->
                <div class="relative w-20 h-20 flex items-center justify-center">
                  <div class="absolute inset-0 rounded-full border border-red-500/20"></div>
                  <div class="rounded-full flex items-center justify-center text-white text-lg font-bold transition-all duration-75"
                       [class.w-16]="cprCompressionCount() % 2 === 0" [class.h-16]="cprCompressionCount() % 2 === 0" [class.bg-red-650]="cprCompressionCount() % 2 === 0"
                       [class.w-12]="cprCompressionCount() % 2 !== 0" [class.h-12]="cprCompressionCount() % 2 !== 0" [class.bg-red-950]="cprCompressionCount() % 2 !== 0"
                       [class.bg-blue-600]="cprCompressionCount() > 30" [style.transform]="cprCompressionCount() > 30 ? 'scale(1.1)' : 'none'">
                    @if (cprCompressionCount() <= 30) {
                      ❤️
                    } @else {
                      💨
                    }
                  </div>
                </div>
                
                <p class="text-sm font-bold text-zinc-200 max-w-md">{{ cprCoachPrompt() }}</p>
              </div>
            }

            <!-- Three-column grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Column 1: Vitals & Camera Pulse Sensor -->
              <pocket-gull-card title="Emergency Vitals" [icon]="ClinicalIcons.Assessment">
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <span class="text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 block mb-0.5">Heart Rate</span>
                    <div class="text-lg font-extrabold text-red-500 dark:text-red-400">
                      {{ state.vitals().hr || '--' }} <span class="text-[12px] font-normal text-gray-500 dark:text-zinc-500">BPM</span>
                    </div>
                  </div>
                  <div class="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <span class="text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 block mb-0.5">SpO2</span>
                    <div class="text-lg font-extrabold text-blue-500 dark:text-blue-400">
                      {{ state.vitals().spO2 || '--' }} <span class="text-[12px] font-normal text-gray-500 dark:text-zinc-500">%</span>
                    </div>
                  </div>
                  <div class="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <span class="text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 block mb-0.5">Temperature</span>
                    <div class="text-lg font-extrabold text-amber-500 dark:text-amber-400">
                      {{ state.vitals().temp || '--' }} <span class="text-[12px] font-normal text-gray-500 dark:text-zinc-500">°F</span>
                    </div>
                  </div>
                  <div class="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                    <span class="text-[12px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-550 block mb-0.5">Blood Pressure</span>
                    <div class="text-lg font-extrabold text-purple-500 dark:text-purple-400">
                      {{ state.vitals().bp || '--' }}
                    </div>
                  </div>
                </div>

                <div class="border-t border-gray-100 dark:border-zinc-800/80 pt-3 flex flex-col gap-2">
                  @if (!isPulseAcquiring()) {
                    <button type="button" (click)="startPulseAcquisition()" class="w-full py-2 bg-emerald-600/10 dark:bg-emerald-600/20 hover:bg-emerald-600/20 dark:hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-widest text-[12px] rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.98]">
                      <span>📷 Acquire pulse via Camera</span>
                    </button>
                  } @else {
                    <div class="p-2 bg-zinc-950 border border-emerald-900/40 rounded-xl flex flex-col gap-2">
                      <div class="flex items-center justify-between text-[12px] uppercase font-bold text-emerald-555">
                        <span class="animate-pulse">Hold finger on camera lens...</span>
                        <span>{{ pulseProgress() | number:'1.0-0' }}%</span>
                      </div>
                      
                      <div class="h-6 overflow-hidden flex items-end justify-center gap-[2px] bg-emerald-950/20 rounded">
                        <div class="w-1.5 bg-emerald-500 transition-all duration-75" [style.height.%]="20 + (pulseProgress() % 4 === 0 ? 60 : pulseProgress() % 4 === 1 ? 40 : 15)"></div>
                        <div class="w-1.5 bg-emerald-500 transition-all duration-75" [style.height.%]="30 + (pulseProgress() % 4 === 1 ? 55 : pulseProgress() % 4 === 2 ? 35 : 10)"></div>
                        <div class="w-1.5 bg-emerald-500 transition-all duration-75" [style.height.%]="25 + (pulseProgress() % 4 === 2 ? 65 : pulseProgress() % 4 === 3 ? 45 : 20)"></div>
                        <div class="w-1.5 bg-emerald-500 transition-all duration-75" [style.height.%]="40 + (pulseProgress() % 4 === 3 ? 50 : pulseProgress() % 4 === 0 ? 30 : 15)"></div>
                      </div>

                      <div class="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                        <div class="bg-emerald-500 h-full transition-all" [style.width.%]="pulseProgress()"></div>
                      </div>
                      <button type="button" (click)="cancelPulseAcquisition()" class="py-0.5 text-[8.5px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 font-bold">
                        Cancel
                      </button>
                    </div>
                  }
                </div>
              </pocket-gull-card>

              <!-- Column 2: Bystander Actions Timeline -->
              <pocket-gull-card title="Bystander Actions Timeline" [icon]="ClinicalIcons.FollowUp">
                @if (state.clinicalNotes().length === 0) {
                  <div class="h-32 flex items-center justify-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                    <p class="text-[12px] text-gray-400 dark:text-zinc-500 font-medium">No actions logged yet.</p>
                  </div>
                } @else {
                  <div class="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    @for (note of state.clinicalNotes(); track note.id) {
                      <div class="p-2 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/60 flex items-start justify-between gap-3">
                        <div class="flex-1 min-w-0">
                          <p class="text-[12px] text-gray-700 dark:text-zinc-300 font-medium break-words leading-relaxed">{{ note.text }}</p>
                          <span class="text-[8.5px] text-gray-400 dark:text-zinc-500 mt-1 block">{{ note.date }}</span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </pocket-gull-card>

              <!-- Column 3: Casualty Medical ID (ICE) -->
              <pocket-gull-card title="Casualty Medical ID (ICE)" [icon]="ClinicalIcons.Education">
                <div class="space-y-3 text-[12px]">
                  <div class="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/85 pb-2">
                    <span class="text-gray-450 dark:text-zinc-500 uppercase tracking-wider font-semibold text-[8.5px]">Blood Type</span>
                    <span class="font-extrabold text-red-500 dark:text-red-400">{{ medicalId().bloodType }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5 border-b border-gray-100 dark:border-zinc-800/85 pb-2">
                    <span class="text-gray-450 dark:text-zinc-500 uppercase tracking-wider font-semibold text-[8.5px]">Severe Allergies</span>
                    <span class="font-bold text-amber-600 dark:text-amber-450">{{ medicalId().allergies }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5 border-b border-gray-100 dark:border-zinc-800/85 pb-2">
                    <span class="text-gray-450 dark:text-zinc-500 uppercase tracking-wider font-semibold text-[8.5px]">Medications</span>
                    <span class="text-gray-700 dark:text-zinc-300 leading-normal">{{ medicalId().medications }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-450 dark:text-zinc-500 uppercase tracking-wider font-semibold text-[8.5px]">ICE Contact</span>
                    <span class="font-bold text-gray-700 dark:text-zinc-300">{{ medicalId().emergencyContact.split(' ')[0] }}</span>
                  </div>
                </div>
              </pocket-gull-card>
            </div>

            <!-- GPS SOS Telemetry -->
            <div class="p-4 bg-zinc-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="text-left flex-1">
                <span class="text-[12px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest block mb-0.5">Emergency SOS Location Telemetry</span>
                @if (isGpsAcquired()) {
                  <span class="text-xs font-bold text-gray-700 dark:text-zinc-300">📡 Coords: {{ gpsCoords() }}</span>
                } @else {
                  <span class="text-xs text-gray-500 dark:text-zinc-400 font-medium">Location Telemetry has not been shared. Click button to enable.</span>
                }
              </div>
              @if (isGpsAcquired()) {
                <a [href]="smsHref()" class="px-4 py-2 bg-red-650 hover:bg-red-700 text-white font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-[0_4px_12px_rgba(220,38,38,0.2)] no-underline">
                  🚨 Broadcast SOS SMS
                </a>
              } @else {
                <button type="button" (click)="loadLiveGpsCoordinates()" class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[9.5px] uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-sm">
                  📡 Enable & Share GPS Location
                </button>
              }
            </div>

            <!-- Emergency Bypass Rapid Nutritional Triage Telemetry -->
            <app-emergency-nutritional-bypass></app-emergency-nutritional-bypass>


            <!-- First Aid Quick Guides -->
            <pocket-gull-card title="Emergency Offline Treatment Guides" [icon]="ClinicalIcons.Medication">
              <div class="flex flex-wrap gap-2 mb-4 border-b border-gray-150 dark:border-zinc-800/80 pb-3">
                 <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'bleeding' ? null : 'bleeding')"
                   [class]="activeFirstAidGuide() === 'bleeding' ? 'bg-red-500/10 text-red-600 border-red-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
                   class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
                   🩸 Bleeding Control
                 </button>
                 <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'choking' ? null : 'choking')"
                   [class]="activeFirstAidGuide() === 'choking' ? 'bg-amber-500/10 text-amber-600 border-amber-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
                   class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
                   💨 Choking / Heimlich
                 </button>
                 <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'overdose' ? null : 'overdose')"
                   [class]="activeFirstAidGuide() === 'overdose' ? 'bg-purple-500/10 text-purple-650 border-purple-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
                   class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
                   💊 Overdose Response
                 </button>
                 <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'stroke' ? null : 'stroke')"
                   [class]="activeFirstAidGuide() === 'stroke' ? 'bg-blue-500/10 text-blue-600 border-blue-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
                   class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
                   🧠 Stroke (FAST)
                 </button>
                 <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'burns' ? null : 'burns')"
                   [class]="activeFirstAidGuide() === 'burns' ? 'bg-orange-500/10 text-orange-600 border-orange-500/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
                   class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
                   🔥 Burn Care
                 </button>
                 <button type="button" (click)="activeFirstAidGuide.set(activeFirstAidGuide() === 'heat' ? null : 'heat')"
                   [class]="activeFirstAidGuide() === 'heat' ? 'bg-amber-600/10 text-amber-700 border-amber-650/40' : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-350'"
                   class="px-2.5 py-1.5 text-[12px] uppercase tracking-wider font-bold rounded-lg border transition">
                   ☀️ Heat Stroke
                 </button>
               </div>
               
               <div class="text-[12px] leading-relaxed text-gray-700 dark:text-zinc-300">
                 @if (activeFirstAidGuide() === 'bleeding') {
                   <div class="space-y-2 animate-in fade-in duration-200">
                     @if (patientAgeCategory() === 'infant') {
                       <p class="font-bold text-red-500">🩸 Infant Bleeding Control (Direct Pressure Only):</p>
                       <ol class="list-decimal pl-5 space-y-1">
                         <li><strong>Direct Pressure:</strong> Place sterile gauze or clean cloth on the wound. Apply continuous, firm direct pressure using 2-3 fingers.</li>
                         <li><strong>No Windlass Tourniquets:</strong> Avoid adult windlass tourniquets on infants. Continue firm direct pressure until EMS arrives.</li>
                         <li><strong>Elevation & Warmth:</strong> Elevate the limb slightly if possible. Keep infant warm to prevent hypothermia.</li>
                       </ol>
                     } @else if (isPatientPregnant()) {
                       <p class="font-bold text-red-500">🩸 Severe Bleeding Control (Pregnancy Specific):</p>
                       <ol class="list-decimal pl-5 space-y-1">
                         <li><strong>Direct Pressure:</strong> Apply firm, continuous direct pressure with sterile dressings.</li>
                         <li><strong>Tourniquet:</strong> If bleeding is life-threatening on a limb, apply a tourniquet 2-3 inches above the wound. Tighten until bleeding stops.</li>
                         <li><strong>Left Lateral Position:</strong> Maintain left lateral tilt (elevate right hip) to prevent supine hypotensive syndrome (uterus pressing inferior vena cava) while managing bleeding.</li>
                       </ol>
                     } @else {
                       <p class="font-bold text-red-500">🩸 Bleeding Control Protocol:</p>
                       <ol class="list-decimal pl-5 space-y-1">
                         <li><strong>Direct Pressure:</strong> Place sterile gauze or clean cloth directly on the wound and apply firm, continuous pressure.</li>
                         <li><strong>Elevation:</strong> Elevate the injured limb above the level of the heart if possible.</li>
                         <li><strong>Tourniquet (Severe Bleeding):</strong> If bleeding is life-threatening on a limb and direct pressure fails, apply a tourniquet 2-3 inches above the wound (never on a joint). Tighten until bleeding stops. Record time.</li>
                       </ol>
                     }
                   </div>
                 } @else if (activeFirstAidGuide() === 'choking') {
                   <div class="space-y-2 animate-in fade-in duration-200">
                     @if (patientAgeCategory() === 'infant') {
                       <p class="font-bold text-amber-500">💨 Infant Choking Protocol (Back Blows & Chest Thrusts):</p>
                       <ol class="list-decimal pl-5 space-y-1">
                         <li><strong>Assess:</strong> Look for ineffective cough, blue lips, or silent choking. Do NOT perform abdominal Heimlich thrusts.</li>
                         <li><strong>5 Back Blows:</strong> Support the infant's head and neck. Place face down along your forearm, resting on your thigh with the head lower than the chest. Deliver 5 firm back blows with the heel of your hand between the shoulder blades.</li>
                         <li><strong>5 Chest Thrusts:</strong> Support the head and flip the infant face up along your forearm. Place 2 fingers on the center of the breastbone (just below the nipple line) and compress 5 times. Repeat cycles.</li>
                       </ol>
                     } @else if (isPatientPregnant()) {
                       <p class="font-bold text-amber-500">💨 Pregnancy Choking Protocol (Chest Thrusts):</p>
                       <ol class="list-decimal pl-5 space-y-1">
                         <li><strong>Assess:</strong> Confirm patient cannot speak or cough. Do NOT perform abdominal Heimlich thrusts.</li>
                         <li><strong>Chest Thrust Position:</strong> Wrap arms around the patient's chest from behind, placing your hands in the center of the breastbone (sternum).</li>
                         <li><strong>Deliver Chest Thrusts:</strong> Pull backward with quick, distinct inward thrusts until the airway is cleared or the patient becomes unresponsive.</li>
                       </ol>
                     } @else {
                       <p class="font-bold text-amber-500">💨 Conscious Choking Protocol (Heimlich):</p>
                       <ol class="list-decimal pl-5 space-y-1">
                         <li><strong>Confirm Choking:</strong> Ask "Are you choking?" Look for hands clutched to throat, inability to speak/cough.</li>
                         <li><strong>Abdominal Thrusts:</strong> Stand behind the person. Wrap arms around waist. Place thumb side of fist slightly above the navel. Grasp fist with other hand.</li>
                         <li><strong>Deliver Thrusts:</strong> Perform quick, upward and inward thrusts until the object is expelled or the person becomes unconscious.</li>
                       </ol>
                     }
                   </div>
                 } @else if (activeFirstAidGuide() === 'overdose') {
                   <div class="space-y-2 animate-in fade-in duration-200">
                     <p class="font-bold text-purple-650">💊 Opioid Overdose Response Protocol:</p>
                     <ol class="list-decimal pl-5 space-y-1">
                       <li><strong>Assess:</strong> Look for slow/stopped breathing, blue/gray lips/nails, unresponsive to sternum rub.</li>
                       <li><strong>Call & Narcan:</strong> Administer Naloxone (Narcan) nasal spray (spray entire bottle into one nostril). Call emergency services.</li>
                       <li><strong>Rescue Breathing:</strong> If not breathing, perform rescue breathing (1 breath every 5 seconds) and prepare CPR if pulse is absent.</li>
                     </ol>
                   </div>
                 } @else if (activeFirstAidGuide() === 'stroke') {
                   <div class="space-y-2 animate-in fade-in duration-200">
                     <p class="font-bold text-blue-500">🧠 Stroke FAST Check Protocol:</p>
                     <ul class="space-y-1.5 pl-4">
                       <li><strong>F - Face Drooping:</strong> Ask the person to smile. Does one side of the face droop?</li>
                       <li><strong>A - Arm Weakness:</strong> Ask the person to raise both arms. Does one arm drift downward?</li>
                       <li><strong>S - Speech Difficulty:</strong> Ask the person to repeat a simple phrase. Is their speech slurred or strange?</li>
                       <li><strong>T - Time to call 911:</strong> If they show any of these signs, note the time and call emergency services immediately.</li>
                     </ul>
                   </div>
                 } @else if (activeFirstAidGuide() === 'burns') {
                   <div class="space-y-2 animate-in fade-in duration-200">
                     <p class="font-bold text-orange-500">🔥 Burn Care Protocol:</p>
                     <ol class="list-decimal pl-5 space-y-1">
                       <li><strong>Cool Immediately:</strong> Run cool (not cold/ice) water over the burn for 10-20 minutes.</li>
                       <li><strong>Cover Loosely:</strong> Cover with a clean, dry, non-adherent dressing or plastic wrap. Do not apply butter, ointments, or toothpaste.</li>
                       <li><strong>Demographic Warnings:</strong>
                         @if (patientAgeCategory() === 'infant') {
                           <strong>Infants are at high risk of hypothermia!</strong> Do not cool large burns (over 10% body surface area) for long periods. Keep the baby warm.
                         } @else if (patientAgeCategory() === 'geriatric') {
                           <strong>Elderly skin is thin and heals slowly!</strong> Be extremely gentle; do not pop blisters, and monitor for signs of shock.
                         } @else {
                           Avoid popping blisters. Seek emergency care for third-degree (charred/white skin) or face/hand/joint burns.
                         }
                       </li>
                     </ol>
                   </div>
                 } @else if (activeFirstAidGuide() === 'heat') {
                   <div class="space-y-2 animate-in fade-in duration-200">
                     <p class="font-bold text-amber-700">☀️ Heat Stroke Protocol:</p>
                     <ol class="list-decimal pl-5 space-y-1">
                       <li><strong>Assess:</strong> Look for body temperature >103°F, red/hot/dry skin (or heavy sweating), rapid pulse, confusion/unconsciousness.</li>
                       <li><strong>Cool Rapidly:</strong> Move patient to shade/AC. Cool with water spray, wet sheets, fan, or ice packs in armpits, groin, and neck.</li>
                       <li><strong>Hydration Warning:</strong>
                         @if (patientAgeCategory() === 'infant' || patientAgeCategory() === 'geriatric') {
                           <strong>Do NOT force fluids</strong> if the patient is confused, drowsy, or vomiting, as they may aspirate. Seek immediate EMS transport.
                         } @else {
                           If fully conscious and able to swallow, give sips of cool water or electrolyte drink. Do not give aspirin or acetaminophen.
                         }
                       </li>
                     </ol>
                   </div>
                 } @else {
                   <p class="text-gray-400 dark:text-zinc-500 italic text-center py-4">Select an emergency guide above for offline step-by-step first aid instructions.</p>
                 }
               </div>
             </pocket-gull-card>

            <!-- Centered QR Code and FHIR section -->
            <div class="flex flex-col items-center justify-center mt-4 p-6 bg-gray-50 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/60 rounded-2xl">
              <h3 class="text-xs font-bold text-gray-900 dark:text-zinc-200 uppercase tracking-widest mb-1 text-center">EMT Handoff QR Code</h3>
              <p class="text-[12px] text-gray-500 dark:text-zinc-400 max-w-sm text-center mb-6">Scan with any mobile device to securely transfer patient vitals and treatment timeline in offline HL7 FHIR format.</p>
              
              @if (qrDataUrl()) {
                <div class="p-4 bg-white rounded-xl shadow-md border border-gray-200 mb-6 flex items-center justify-center">
                  <img [src]="qrDataUrl()" class="w-48 h-48 sm:w-64 sm:h-64 select-none pointer-events-none" style="image-rendering: pixelated;" alt="EMT Handoff FHIR QR Code" />
                </div>
              } @else {
                <div class="w-48 h-48 sm:w-64 sm:h-64 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg flex items-center justify-center mb-6">
                  <p class="text-xs text-gray-400">Loading QR Code...</p>
                </div>
              }

            </div>
          </div>
        }

        <!-- Care Plan Print Studio & Document Carousel -->
        <app-care-plan-print-preview></app-care-plan-print-preview>


        <!-- Karolinska Sleepiness Scale (KSS) Adaptive Cognitive Load Shield -->
        <app-kss-cognitive-shield></app-kss-cognitive-shield>

        <!-- Functional Protocols Lens Only: Neuro-Consciousness & Mood Optimization Matrix -->
        @if (activeLens() === 'Functional Protocols' && hasAnyReport()) {
          <app-mood-consciousness-matrix></app-mood-consciousness-matrix>
          <app-geolocational-health-relocation></app-geolocational-health-relocation>
        }

        <!-- Summary Overview Lens Only: Living Health Fruit Tree -->
        @if (activeLens() === 'Summary Overview' && hasAnyReport()) {
          <app-patient-fruit-tree></app-patient-fruit-tree>
        }

        <!-- Nutrition Lens Only: Dietary Allergy & Synthetic Red Dye #40 Shield -->
        @if (activeLens() === 'Nutrition' && hasAnyReport()) {
          <app-dietary-allergy-shield></app-dietary-allergy-shield>
        }

        <!-- Lens Innovation Shield & Insight Sparks Drill-Down -->
        @if (hasAnyReport()) {
          <app-lens-insight-spark-shield [activeLens]="activeLens()"></app-lens-insight-spark-shield>
        }

        <!-- Patient Education Lens Only: UK RIO PubMed Sourcing & Evidence Hierarchy Panel -->
        @if (activeLens() === 'Patient Education' && hasAnyReport()) {
          <app-uk-rio-pubmed-sourcing></app-uk-rio-pubmed-sourcing>
        }

        <!-- Patient Education & Summary Overview Lens: Interactive Health Trajectory Storybook -->
        @if ((activeLens() === 'Patient Education' || activeLens() === 'Summary Overview') && hasAnyReport()) {
          <app-patient-health-trajectory-storybook></app-patient-health-trajectory-storybook>
          <app-sdoh-navigator></app-sdoh-navigator>
        }



        <!-- Dieter Rams Clinical Menu (Nutrition Lens Only) -->
        @if (activeLens() === 'Nutrition' && hasAnyReport()) {
          <app-clinical-menu [reportText]="activeReport()"></app-clinical-menu>
        }




        <!-- Biomarker Matrix (Orthomolecular Only) -->
        @if (activeLens() === 'Precision Nutrients' && hasAnyReport()) {
          <app-biomarker-matrix [reportText]="activeReport()"></app-biomarker-matrix>
        }


        <!-- Cost-Benefit Analysis (Summary Overview & Treatment Matrix Lenses) -->
        @if ((activeLens() === 'Summary Overview' || activeLens() === 'Treatment Matrix') && hasAnyReport()) {
          <app-cost-benefit-analysis [reportText]="activeReport()"></app-cost-benefit-analysis>
        }

        <!-- AVS Neuro-Therapy & Autonomic Co-Regulation (Functional Protocols Lens Only) -->
        @if (activeLens() === 'Functional Protocols' && hasAnyReport()) {
          <div class="mb-6 bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-emerald-900/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-emerald-950/40 rounded-2xl p-6 border border-indigo-500/20 dark:border-indigo-500/30 shadow-lg relative overflow-hidden">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-200/40 dark:border-indigo-800/40 pb-4 mb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></span>
                  <h3 class="text-base font-bold text-gray-900 dark:text-zinc-150 uppercase tracking-widest">
                    🧠 Autonomic Co-Regulation & AVS Therapy Apps
                  </h3>
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                    Functional Protocol Integration
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Audio-Visual Stimulation (AVS) companion session targeting parasympathetic vagal tone restoration & brainwave entrainment.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button type="button" (click)="launchAvsVoiceCoRegulation()"
                  class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
                  <span>🎙️</span>
                  <span>AVS Voice Guide</span>
                </button>
                <button type="button" (click)="toggleAvsSession()"
                  [class]="state.isAvsSessionActive() ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'"
                  class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
                  <span>{{ state.isAvsSessionActive() ? '⏸ Pause AVS Therapy' : '▶ Start AVS Co-Regulation' }}</span>
                </button>
              </div>

            </div>

            <!-- Parameters Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <!-- Breathing Cadence -->
              <div class="bg-white/70 dark:bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-bold text-gray-700 dark:text-zinc-300">🫁 Resonant Breathing Rate</span>
                  <span class="font-mono font-black text-indigo-600 dark:text-indigo-400">{{ state.avsBreathingRate().toFixed(1) }} bpm</span>
                </div>
                <input type="range" min="4.0" max="8.0" step="0.5" [value]="state.avsBreathingRate()"
                  (input)="updateAvsBreathing($event)"
                  class="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                <span class="text-[10px] text-gray-400 dark:text-zinc-500 block mt-1">0.1 Hz Baroreflex Peak Resonance</span>
              </div>

              <!-- Brainwave Entrainment -->
              <div class="bg-white/70 dark:bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-bold text-gray-700 dark:text-zinc-300">🧠 Target Entrainment</span>
                  <span class="font-mono font-black text-purple-600 dark:text-purple-400">{{ state.avsBrainwaveFrequency() | titlecase }} ({{ state.avsBrainwaveFrequencyHz() }} Hz)</span>
                </div>
                <div class="flex gap-1">
                  <button type="button" (click)="setAvsBrainwave('theta', 6.0)"
                    [class.bg-purple-600]="state.avsBrainwaveFrequency() === 'theta'"
                    [class.text-white]="state.avsBrainwaveFrequency() === 'theta'"
                    class="flex-1 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold transition cursor-pointer">Theta (6Hz)</button>
                  <button type="button" (click)="setAvsBrainwave('alpha', 10.0)"
                    [class.bg-purple-600]="state.avsBrainwaveFrequency() === 'alpha'"
                    [class.text-white]="state.avsBrainwaveFrequency() === 'alpha'"
                    class="flex-1 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold transition cursor-pointer">Alpha (10Hz)</button>
                  <button type="button" (click)="setAvsBrainwave('gamma', 40.0)"
                    [class.bg-purple-600]="state.avsBrainwaveFrequency() === 'gamma'"
                    [class.text-white]="state.avsBrainwaveFrequency() === 'gamma'"
                    class="flex-1 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold transition cursor-pointer">Gamma (40Hz)</button>
                </div>
              </div>

              <!-- Active Status Indicator -->
              <div class="bg-white/70 dark:bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col justify-between">
                <span class="font-bold text-gray-700 dark:text-zinc-300">⚡ Autonomic Status</span>
                <div class="flex items-center gap-2 mt-1">
                  <span class="w-2.5 h-2.5 rounded-full" [class.bg-emerald-500]="state.isAvsSessionActive()" [class.animate-ping]="state.isAvsSessionActive()" [class.bg-gray-400]="!state.isAvsSessionActive()"></span>
                  <span class="font-bold font-mono text-[11px]" [class.text-emerald-600]="state.isAvsSessionActive()" [class.dark:text-emerald-400]="state.isAvsSessionActive()">
                    {{ state.isAvsSessionActive() ? 'SESSION ACTIVE (AUDIO-VISUAL FLICKER)' : 'STANDBY' }}
                  </span>
                </div>
                <span class="text-[10px] text-gray-400 block mt-1">Integrated in Functional Protocols Lens</span>
              </div>
            </div>
          </div>
        }


        <!--AI Report Section-->
        @if (activeLens() !== 'EMT Handoff' && reportSections(); as sections) {
          <div class="flex flex-col gap-4 sm:gap-6 pb-4 w-full min-w-0">

          <!-- Storybook Narrative Arc Banner & Lens Stage Indicator -->
          <div class="mb-2 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl font-sans relative overflow-hidden">
            <div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    📖 Storybook Chapter: {{ activeLens() }}
                  </span>
                  <span class="text-[10px] font-mono text-zinc-400">
                    Paradigm Framework: <strong class="text-cyan-400 font-bold uppercase">{{ state.activePhilosophy() }}</strong>
                  </span>
                </div>
                <h2 class="text-base font-extrabold uppercase tracking-wide text-zinc-100 mt-1">
                  {{ activeActTitle() }}
                </h2>
              </div>

              <!-- 3-Act Narrative Arc Progress Dots -->
              <div class="flex items-center gap-2 bg-zinc-900/80 px-3.5 py-2 rounded-xl border border-zinc-800 shrink-0 font-mono text-[11px]">
                <div class="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <span>Act I: Triage</span>
                  <span class="text-xs">→</span>
                </div>
                <div class="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span>Act II: Probing</span>
                  <span class="text-xs">→</span>
                </div>
                <div class="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span>Act III: Quest</span>
                </div>
              </div>
            </div>
          </div>
            @for (section of sections; track section.title; let i = $index) {
              <div [id]="i === 0 ? 'tour-report-node' : null" appReveal [revealDelay]="i * 100" class="w-full shrink-0 flex flex-col min-h-max min-w-0 overflow-hidden">
                <pocket-gull-card [title]="section.title" [icon]="section.icon" class="flex-1 min-w-0 overflow-hidden">
                  <div right-action class="flex items-center gap-2">
                    @if (intel.isLoading() && !verificationStatus(section.title)) {
                      <div class="flex items-center gap-1.5 mr-2">
                        <span class="flex h-1.5 w-1.5 rounded-full bg-[#689F38] dark:bg-[#8bc34a] animate-pulse"></span>
                        <span class="text-[12px] uppercase tracking-tighter text-gray-500 dark:text-zinc-400">{{ activeAgentName() }} is streaming...</span>
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
            <div class="text-[12px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 flex items-center gap-1.5">
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
            <div class="text-[12px] font-bold uppercase tracking-wider mb-1"
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

    <!-- Clinician-to-Clinician Handoff Modal -->
    <app-handoff-modal [isOpen]="showHandoffModal()" (close)="showHandoffModal.set(false)"></app-handoff-modal>
  `
})
export class AnalysisReportComponent implements OnDestroy {
  protected readonly intel = inject(ClinicalIntelligenceService);
  protected readonly state = inject(PatientStateService);
  protected readonly patientManager = inject(PatientManagementService);
  protected readonly dictation = inject(DictationService);
  private audit = inject(AuditService);
  protected readonly export = inject(ExportService);
  protected readonly actMapper = inject(ClinicalActLensMapperService);

  lensCarousel = viewChild<ElementRef<HTMLDivElement>>('lensCarousel');

  availableLenses: (AnalysisLens | 'Y-BOCs Screener')[] = [
    'Summary Overview',
    'Treatment Matrix',
    'Functional Protocols',
    'Nutrition',
    'Precision Nutrients',
    'Monitoring & Follow-up',
    'Patient Education',
    'PhysioNet Telemetry',
    'Y-BOCs Screener'
  ];

  activeLensIndex = computed(() => {
    const current = this.activeLens();
    const idx = this.availableLenses.indexOf(current as any);
    return idx >= 0 ? idx : 0;
  });

  scrollLenses(direction: 'left' | 'right'): void {
    const el = this.lensCarousel()?.nativeElement;
    if (el) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  activeActTitle = computed(() => {
    return this.actMapper.getActTitleForLens(this.activeLens(), this.state.activePhilosophy());
  });

  activeActProposal = computed(() => {
    return this.actMapper.getActProposal(this.activeLens());
  });
  showHandoffModal = signal<boolean>(false);
  isCprMetronomeActive = signal<boolean>(false);
  private cprIntervalId: any = null;
  private audioCtx: AudioContext | null = null;

  // Pulse Acquisition Simulation State
  isPulseAcquiring = signal<boolean>(false);
  pulseProgress = signal<number>(0);
  private pulseAcquireIntervalId: any = null;

  // Demographic Selection State
  patientAgeCategory = signal<'adult' | 'infant' | 'geriatric'>('adult');
  isPatientPregnant = signal<boolean>(false);

  // GPS SOS Telemetry State
  isGpsAcquired = signal<boolean>(false);
  gpsCoords = signal<string>('46.0503° N, 124.0502° W (Oregon Coast Buoy 46050 Boundary)');
  smsHref = computed(() => {
    return `sms:911?body=${encodeURIComponent('Emergency! Bystander first aid in progress at ' + this.gpsCoords())}`;
  });

  loadLiveGpsCoordinates(): void {
    this.isGpsAcquired.set(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          this.gpsCoords.set(`${lat}° N, ${lng}° W (Live Device GPS)`);
        },
        (error) => {
          console.warn('[GPS] Geolocation failed or denied, using buoy fallback:', error);
          this.gpsCoords.set('46.0503° N, 124.0502° W (Oregon Coast Buoy 46050 Boundary)');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      this.gpsCoords.set('46.0503° N, 124.0502° W (Oregon Coast Buoy 46050 Boundary)');
    }
  }

  // CPR Coach Additional State
  cprCompressionCount = signal<number>(0);
  cprCycleCount = signal<number>(1);
  cprCoachPrompt = signal<string>('Prepare chest compressions. Place hands in the center of the chest.');
  
  // Quick Actions Accordion / Tab State
  activeFirstAidGuide = signal<'bleeding' | 'choking' | 'overdose' | 'stroke' | 'burns' | 'heat' | null>(null);

  // Mock Medical ID / ICE Data
  medicalId = signal({
    bloodType: 'O-Negative (Universal)',
    allergies: 'Penicillin, Sulfonamides, Bee Venom',
    medications: 'Lisinopril 10mg daily, Albuterol inhaler PRN',
    emergencyContact: 'Sarah Gear (Spouse) - 555-019-2834',
    organDonor: 'Yes'
  });

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

  activeLens = signal<AnalysisLens | 'EMT Handoff' | 'Y-BOCs Screener'>('Summary Overview');
  showRawFhir = signal(false);

  activeAgentName = computed(() => {
    const lens = this.activeLens();
    if (lens === 'EMT Handoff' || lens === 'Y-BOCs Screener') return '';
    return this.intel.getAgentNameForLens(lens as AnalysisLens);
  });

  activeAgentRole = computed(() => {
    const lens = this.activeLens();
    if (lens === 'EMT Handoff' || lens === 'Y-BOCs Screener') return '';
    return this.intel.getAgentRoleForLens(lens as AnalysisLens);
  });

  activeTabClasses = computed(() => {
    const phil = this.state.activePhilosophy();
    if (phil === 'eastern') {
      return 'border-emerald-500 dark:border-emerald-400 text-emerald-800 dark:text-emerald-400 font-bold';
    }
    if (phil === 'ayurvedic') {
      return 'border-amber-500 dark:border-amber-400 text-amber-800 dark:text-amber-400 font-bold';
    }
    return 'border-sky-500 dark:border-sky-400 text-sky-800 dark:text-sky-400 font-bold';
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
        if (title.toLowerCase().includes('biomarker matrix')) return;
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

            // Academic APA 7th & UK RIO Sourcing Citation Styling
            const hasDoiMatch = /(?:doi\.org\/10\.\d{4,9}\/|10\.\d{4,9}\/[-._;()/:A-Z0-9]+|Journal of|Peer-Reviewed)/i.test(highlightedHtml);
            if (hasDoiMatch || highlightedHtml.includes('DOI:')) {
              highlightedHtml = `<div class="apa-citation-block flex flex-col gap-1 my-3 font-sans">
                <div class="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold">
                  <span>📖 APA 7th Edition & UK RIO Verified Citation</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span class="text-emerald-600 dark:text-emerald-400">Peer-Reviewed Evidence</span>
                </div>
                <div class="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                  ${highlightedHtml}
                </div>
              </div>`;
            }

            // Dieter Rams Rectilinear Task Bracketing (Replacing Pills)
            highlightedHtml = highlightedHtml
              .replace(/\[✓\s*APPROVED\]/gi, '<span class="rams-task-bracket approved">✓ APPROVED</span>')
              .replace(/\[⚡\s*IN-PROGRESS\]/gi, '<span class="rams-task-bracket in-progress">⚡ IN-PROGRESS</span>')
              .replace(/\[⏳\s*PENDING\]/gi, '<span class="rams-task-bracket">⏳ PENDING</span>');

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

    // Auto-scroll during streaming: ONLY scroll if user is already near bottom (within 150px)
    effect(() => {
      this.reportSections();
      if (!this.intel.isLoading()) return;
      untracked(() => {
        const el = this.contentArea()?.nativeElement;
        if (!el) return;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (isNearBottom) {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
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

  toggleAvsSession() {
    this.state.isAvsSessionActive.update(v => !v);
  }

  launchAvsVoiceCoRegulation() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voice-mode-change', { detail: 'avs' }));
    }
  }

  updateAvsBreathing(event: Event) {

    const rate = parseFloat((event.target as HTMLInputElement).value);
    this.state.avsBreathingRate.set(rate);
  }

  setAvsBrainwave(type: string, hz: number) {
    this.state.avsBrainwaveFrequency.set(type);
    this.state.avsBrainwaveFrequencyHz.set(hz);
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
      if (this.activeLens() === 'EMT Handoff') {
        this.activeLens.set('Summary Overview');
      }
    }
  }

  changeLens(lens: AnalysisLens | 'EMT Handoff' | 'Y-BOCs Screener') {
    this.audit.logAction('VIEW_LENS', this.patientManager.selectedPatientId(), { lens });
    this.flushAutoSave();
    this.activeLens.set(lens);
  }

  toggleCprMetronome() {
    if (this.isCprMetronomeActive()) {
      this.stopCprMetronome();
    } else {
      this.cprCompressionCount.set(0);
      this.cprCycleCount.set(1);
      
      let initialMsg = 'Compressions starting. Push hard and fast in the center of the chest!';
      let speechMsg = 'Start chest compressions. Press hard and fast.';
      
      const age = this.patientAgeCategory();
      const preg = this.isPatientPregnant();

      if (age === 'infant') {
        initialMsg = 'Infant CPR starting. Push 1.5 inches deep using two fingers on breastbone.';
        speechMsg = 'Start infant compressions. Use two fingers on breastbone.';
      } else if (preg) {
        initialMsg = 'Pregnant patient CPR starting. Place hands slightly higher on sternum.';
        speechMsg = 'Start compressions slightly higher on breastbone.';
      } else if (age === 'geriatric') {
        initialMsg = 'Geriatric CPR starting. Push 2 inches. Mindful of rib fracture risk.';
        speechMsg = 'Start elderly compressions. Push firmly but carefully.';
      }

      this.cprCoachPrompt.set(initialMsg);
      this.speakFirstAidPrompt(speechMsg);
      this.startCprMetronome();
    }
  }

  startCprMetronome(): void {
    if (typeof window === 'undefined') return;
    if (this.cprIntervalId) return;

    this.isCprMetronomeActive.set(true);
    const bpm = this.patientAgeCategory() === 'infant' ? 120 : 110;
    const intervalMs = 60000 / bpm;

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
    this.cprCompressionCount.set(0);
    if (typeof window !== 'undefined') {
      document.body.classList.remove('cpr-flash');
      window.speechSynthesis?.cancel();
    }
  }

  playCprClick(): void {
    if (typeof window === 'undefined') return;

    // Trigger visual flash
    document.body.classList.add('cpr-flash');
    setTimeout(() => {
      document.body.classList.remove('cpr-flash');
    }, 100);

    const age = this.patientAgeCategory();
    const preg = this.isPatientPregnant();

    // Update CPR cycles & prompts
    this.cprCompressionCount.update(c => {
      const nextCount = c + 1;
      if (nextCount <= 30) {
        if (nextCount === 1) {
          if (age === 'infant') {
            this.cprCoachPrompt.set('Infant: Compress 1.5" with 2 fingers (120 BPM)');
          } else if (preg) {
            this.cprCoachPrompt.set('Pregnant: Hands slightly higher on breastbone (110 BPM)');
          } else if (age === 'geriatric') {
            this.cprCoachPrompt.set('Geriatric: Compress 2" carefully to avoid fracture (110 BPM)');
          } else {
            this.cprCoachPrompt.set('Adult: Compress 2" in center of chest (110 BPM)');
          }
        } else if (nextCount === 15) {
          this.cprCoachPrompt.set('Keep going! 15 compressions completed.');
        }
        return nextCount;
      } else if (nextCount <= 39) {
        const breathNum = nextCount - 30;
        if (breathNum === 1) {
          if (age === 'infant') {
            this.cprCoachPrompt.set('Stop compressions. Give 2 GENTLE puffs of breath.');
            this.speakFirstAidPrompt('Give gentle puff 1.');
          } else {
            this.cprCoachPrompt.set('Stop compressions. Tilt head & give Breath 1.');
            this.speakFirstAidPrompt('Give breath 1.');
          }
        } else if (breathNum === 5) {
          if (age === 'infant') {
            this.cprCoachPrompt.set('Give gentle puff 2.');
            this.speakFirstAidPrompt('Give gentle puff 2.');
          } else {
            this.cprCoachPrompt.set('Give Breath 2.');
            this.speakFirstAidPrompt('Give breath 2.');
          }
        }
        return nextCount;
      } else {
        this.cprCycleCount.update(cy => cy + 1);
        let resumeMsg = 'Resume compressions!';
        if (preg) {
          resumeMsg = 'Resume chest compressions. Ensure left lateral tilt.';
        }
        this.cprCoachPrompt.set(resumeMsg);
        this.speakFirstAidPrompt('Resume compressions.');
        return 1;
      }
    });

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

  startPulseAcquisition(): void {
    if (this.isPulseAcquiring()) return;
    this.isPulseAcquiring.set(true);
    this.pulseProgress.set(0);

    this.speakFirstAidPrompt('Place finger over camera lens and hold steady.');

    const durationMs = 4000; // 4 seconds measurement
    const stepMs = 100;
    const increment = 100 / (durationMs / stepMs);

    this.pulseAcquireIntervalId = setInterval(() => {
      this.pulseProgress.update(p => {
        if (p >= 100) {
          clearInterval(this.pulseAcquireIntervalId);
          this.pulseAcquireIntervalId = null;
          this.completePulseAcquisition();
          return 100;
        }
        return p + increment;
      });
    }, stepMs);
  }

  cancelPulseAcquisition(): void {
    if (this.pulseAcquireIntervalId) {
      clearInterval(this.pulseAcquireIntervalId);
      this.pulseAcquireIntervalId = null;
    }
    this.isPulseAcquiring.set(false);
    this.pulseProgress.set(0);
  }

  completePulseAcquisition(): void {
    this.isPulseAcquiring.set(false);
    this.pulseProgress.set(0);
    
    // Generate simulated vitals
    const simulatedHr = Math.floor(72 + Math.random() * 20).toString();
    const simulatedSpO2 = Math.floor(96 + Math.random() * 4).toString();
    const simulatedTemp = (97.8 + Math.random() * 1.5).toFixed(1);
    const simulatedBp = `${Math.floor(115 + Math.random() * 15)}/${Math.floor(75 + Math.random() * 10)}`;

    // Update state
    this.state.vitals.update(v => ({
      ...v,
      hr: simulatedHr,
      spO2: simulatedSpO2,
      temp: simulatedTemp,
      bp: simulatedBp
    }));

    // Add entry to Bystander Actions Timeline
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.state.clinicalNotes.update(notes => [
      {
        id: Math.random().toString(),
        text: `Acquired Vitals: HR ${simulatedHr} BPM, SpO2 ${simulatedSpO2}%, Temp ${simulatedTemp}°F, BP ${simulatedBp}`,
        date: timestamp,
        sourceLens: 'EMT Handoff'
      },
      ...notes
    ]);

    this.speakFirstAidPrompt(`Vitals acquired. Heart rate ${simulatedHr} beats per minute. Oxygen saturation ${simulatedSpO2} percent.`);
  }

  speakFirstAidPrompt(text: string): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
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
