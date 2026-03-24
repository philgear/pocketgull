import { Component, ChangeDetectionStrategy, inject, computed, ViewEncapsulation, signal, OnDestroy, effect, viewChild, ElementRef, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalIntelligenceService, TranscriptEntry, AnalysisLens } from '../services/clinical-intelligence.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { HistoryEntry } from '../services/patient.types';
import { MarkdownService } from '../services/markdown.service';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';
import { DictationService } from '../services/dictation.service';

declare var webkitSpeechRecognition: any;
import { SummaryNode, SummaryNodeItem, ReportSection, ParsedTranscriptEntry, NodeAnnotation, LensAnnotations, VerificationIssue } from './analysis-report.types';
import { SummaryNodeComponent } from './summary-node.component';
import { PocketGullCardComponent } from './shared/pocket-gull-card.component';
import { AuditService } from '../services/audit.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { ClinicalGaugeComponent } from './clinical-gauge.component';
import { ClinicalIcons } from '../assets/clinical-icons';
import { ClinicalTrendComponent } from './clinical-trend.component';
import { AiCacheService } from '../services/ai-cache.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { RevealDirective } from '../directives/reveal.directive';

@Component({
  selector: 'app-analysis-report',
  standalone: true,
  imports: [CommonModule, SummaryNodeComponent, PocketGullCardComponent, PocketGullBadgeComponent, ClinicalGaugeComponent, ClinicalTrendComponent, PocketGullButtonComponent, RevealDirective, SafeHtmlPipe],
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
    @if (hasAnyReport()) {
      <div class="px-4 sm:px-8 py-2 sm:py-3 no-print overflow-x-auto w-full">
        <div class="max-w-4xl mx-auto min-w-0 relative">
          <div id="tour-lens-tabs" class="flex overflow-x-auto hide-scrollbar items-center gap-1 border-b border-gray-300 dark:border-zinc-700 w-full relative z-10">
          <pocket-gull-button (click)="changeLens('Summary Overview')"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Summary Overview'"
            [class.border-[#1C1C1C]]="activeLens() === 'Summary Overview'"
            [class.dark:border-white]="activeLens() === 'Summary Overview'"
            [class.text-[#1C1C1C]]="activeLens() === 'Summary Overview'"
            [class.dark:text-white]="activeLens() === 'Summary Overview'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap">
            Overview
          </pocket-gull-button>
          <pocket-gull-button (click)="changeLens('Functional Protocols')"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Functional Protocols'"
            [class.border-[#1C1C1C]]="activeLens() === 'Functional Protocols'"
            [class.dark:border-white]="activeLens() === 'Functional Protocols'"
            [class.text-[#1C1C1C]]="activeLens() === 'Functional Protocols'"
            [class.dark:text-white]="activeLens() === 'Functional Protocols'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap">
            Functional Protocols
          </pocket-gull-button>
          <pocket-gull-button (click)="changeLens('Nutrition')"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Nutrition'"
            [class.border-[#1C1C1C]]="activeLens() === 'Nutrition'"
            [class.dark:border-white]="activeLens() === 'Nutrition'"
            [class.text-[#1C1C1C]]="activeLens() === 'Nutrition'"
            [class.dark:text-white]="activeLens() === 'Nutrition'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap">
            Nutrition
          </pocket-gull-button>
          <pocket-gull-button (click)="changeLens('Monitoring & Follow-up')"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Monitoring & Follow-up'"
            [class.border-[#1C1C1C]]="activeLens() === 'Monitoring & Follow-up'"
            [class.dark:border-white]="activeLens() === 'Monitoring & Follow-up'"
            [class.text-[#1C1C1C]]="activeLens() === 'Monitoring & Follow-up'"
            [class.dark:text-white]="activeLens() === 'Monitoring & Follow-up'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap">
            Monitoring & Follow-up
          </pocket-gull-button>
          <pocket-gull-button (click)="changeLens('Patient Education')"
            variant="ghost"
            size="sm"
            [class.border-b-2]="activeLens() === 'Patient Education'"
            [class.border-[#1C1C1C]]="activeLens() === 'Patient Education'"
            [class.dark:border-white]="activeLens() === 'Patient Education'"
            [class.text-[#1C1C1C]]="activeLens() === 'Patient Education'"
            [class.dark:text-white]="activeLens() === 'Patient Education'"
            class="rounded-none px-4 -mb-px shadow-none shrink-0 whitespace-nowrap">
            Patient Education
          </pocket-gull-button>
        </div>
        </div>
      </div>
    }

    <!--Content Area-->
    <div #contentArea class="flex-1 mx-4 sm:mx-8 mb-6 mt-2 overflow-y-auto overflow-x-hidden bg-white dark:bg-[#09090b] rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 min-h-0">
      <!--Analysis Engine Body-->
      <div class="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 min-w-0">
        <!--Clinical Overview Dashboard-->
        @if (intel.analysisMetrics(); as metrics) {
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
                <span class="text-[8px] uppercase tracking-tighter text-gray-500 dark:text-zinc-400">Generating...</span>
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

        <!--AI Report Section-->
        @if (reportSections(); as sections) {
          <div class="flex flex-col gap-4 sm:gap-6 pb-4 w-full min-w-0">
            @for (section of sections; track section.title; let i = $index) {
              <div [id]="i === 0 ? 'tour-report-node' : null" appReveal [revealDelay]="i * 100" class="w-full shrink-0 flex flex-col min-h-max min-w-0 overflow-hidden">
                <pocket-gull-card [title]="section.title" [icon]="section.icon" class="flex-1 min-w-0 overflow-hidden">
                  <div right-action class="flex items-center gap-2">
                    @if (intel.isLoading() && !verificationStatus(section.title)) {
                      <div class="flex items-center gap-1.5 mr-2">
                        <span class="flex h-1.5 w-1.5 rounded-full bg-[#689F38] dark:bg-[#8bc34a] animate-pulse"></span>
                        <span class="text-[8px] uppercase tracking-tighter text-gray-500 dark:text-zinc-400">Streaming Section...</span>
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
                        <div [innerHTML]="node.rawHtml | safeHtml" class="mb-4"></div>
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
           @if (tooltip.severity === 'high') {
             <div class="text-red-500 mt-0.5 shrink-0" [innerHTML]="ClinicalIcons.Risk | safeHtml"></div>
           } @else {
             <div class="text-amber-500 mt-0.5 shrink-0" [innerHTML]="ClinicalIcons.Warning | safeHtml"></div>
           }
           <div>
             <div class="text-[10px] font-bold uppercase tracking-wider mb-1"
                  [class.text-red-600]="tooltip.severity === 'high'"
                  [class.text-amber-600]="tooltip.severity !== 'high'">
               AI Verification Flag
             </div>
             <div class="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">{{ tooltip.text }}</div>
           </div>
         </div>
         <!-- Caret -->
         <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-zinc-900 border-b border-r border-gray-200 dark:border-zinc-800 rotate-45"></div>
      </div>
    }
  `
})
export class AnalysisReportComponent implements OnDestroy {
  protected readonly intel = inject(ClinicalIntelligenceService);
  protected readonly state = inject(PatientStateService);
  protected readonly patientManager = inject(PatientManagementService);
  protected readonly dictation = inject(DictationService);
  private audit = inject(AuditService);

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
      .map(e => e.value?._metrics?.[type] || 5)
      .reverse();
  }

  async loadHistory() {
    const entries = await this.cache.getAllEntries();
    this.historyEntries.set(entries.filter(e => e.value?._isSnapshot));
  }


  activeLens = signal<AnalysisLens>('Summary Overview');

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
  activeReport = computed(() => this.intel.analysisResults()[this.activeLens()]);
  contentArea = viewChild<ElementRef<HTMLDivElement>>('contentArea');

  isSectionEmpty(section: any): boolean {
    return !section.nodes || section.nodes.length === 0;
  }

  isTextEmpty(text: string | undefined): boolean {
    return !text || text.trim().length === 0;
  }

  verificationStatus(sectionTitle: string): string | null {
    const res = this.intel.verificationResults()[this.activeLens()];
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

  reportSections = computed<ReportSection[] | null>(() => {
    const raw = this.activeReport();
    if (!raw) return null;
    try {
      const sections: ReportSection[] = [];
      const parts = raw.split(/\n(?=#{1,3}\s)/);
      for (let sIdx = 0; sIdx < parts.length; sIdx++) {
        const part = parts[sIdx];
        if (!part.trim()) continue;
        const lines = part.split('\n');
        const headingMarkdown = lines.find(l => l.trim().startsWith('#')) || lines[0] || '';
        const title = headingMarkdown.replace(/^#+\s*/, '').trim();
        const icon = this.getIconForSection(title);
        const contentMarkdown = part === headingMarkdown ? '' : part.substring(part.indexOf(headingMarkdown) + headingMarkdown.length);

        const verification = (this.intel.verificationResults()[this.activeLens()] || { status: 'verified', issues: [] });
        const parser = this.markdownService.parser();
        if (!parser) continue;

        let cleanMarkdown = contentMarkdown;
        // Strip out ```markdown code blocks if they consist of a table
        cleanMarkdown = cleanMarkdown.replace(/```(?:markdown)?\s*\n([\s\S]*?)\n```/g, (match, innerText) => {
          if (innerText.trim().startsWith('|')) {
            return innerText;
          }
          return match;
        });

        const tokens = parser.lexer(cleanMarkdown);
        const nodes: SummaryNode[] = [];

        for (let nIdx = 0; nIdx < tokens.length; nIdx++) {
          const token = tokens[nIdx];
          const key = (token as any).text || token.raw || `node- ${sIdx} - ${nIdx}`;
          const annotation = (this.lensAnnotations()[this.activeLens()] || {})[key] || { note: '', bracketState: 'normal' };
          // const annotation = (this.lensAnnotations()[this.activeLens()] || {})[key] || { note: '', bracketState: 'normal' };

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

          const applyHighlights = (html: string, issues: VerificationIssue[]) => {
            let highlightedHtml = html;
            for (const issue of issues) {
              if (issue.claim && highlightedHtml.includes(issue.claim)) {
                const colorClass = issue.severity === 'high' ? 'bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 'bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';
                // Encode the message to ensure it doesn't break data attributes
                const encodedMsg = issue.message.replace(/"/g, '&quot;');
                const highlightSpan = `<span class="verification-claim px-0.5 border-b-2 border-dotted cursor-help transition-colors ${colorClass}" data-message="${encodedMsg}">${issue.claim}</span>`;
                highlightedHtml = highlightedHtml.replace(issue.claim, highlightSpan);
              }
            }
            return highlightedHtml;
          };

          if (token.type === 'paragraph') {
            const { suggestions, proposedText, cleanedText } = extractMetadata(token.text);
            const annotation = (this.lensAnnotations()[this.activeLens()] || {})[key] || { note: '', bracketState: 'normal' };
            const content = annotation.modifiedText || cleanedText;

            nodes.push({
              id: `sec-${sIdx}-node-${nIdx}`,
              key,
              type: 'paragraph',
              rawHtml: applyHighlights(parser.parseInline(content) as string, verification.issues),
              bracketState: annotation.bracketState,
              note: annotation.note,
              showNote: !!annotation.note,
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
              items: token.items.map((item, iIdx) => {
                const itemKey = item.text;
                const itemAnnotation = (this.lensAnnotations()[this.activeLens()] || {})[itemKey] || { note: '', bracketState: 'normal' };
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
        }

        sections.push({
          raw: part,
          heading: parser.parse(headingMarkdown) as string,
          title,
          icon,
          nodes
        });
      }
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

  parsedTranscript = computed<ParsedTranscriptEntry[]>(() => {
    const transcript = this.intel.transcript();
    try {
      return transcript.map(entry => {
        const parsed: ParsedTranscriptEntry = { ...entry };
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
          this.generate();
          this.loadHistory();
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
  }

  ngOnDestroy() {
    if (this._autoSaveTimer) clearTimeout(this._autoSaveTimer);
    this.flushAutoSave();
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
        if (next[key] === 'saving') next[key] = 'saved';
      });
      return next;
    });

    // Clear 'saved' status after a few seconds
    setTimeout(() => {
      this.nodeSaveStatuses.update(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (next[key] === 'saved') delete next[key];
        });
        return next;
      });
    }, 3000);
  }

  private renderInteractiveContent(markdown: string): string {
    const parser = this.markdownService.parser();
    return parser ? parser.parse(markdown) as string : '';
  }

  handleNodeUpdate(node: SummaryNode | SummaryNodeItem, event: any) {
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


  private syncNodeToTaskFlow(node: SummaryNode | SummaryNodeItem) {
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
      const lensData = { ...(all[currentLens] || {}) };
      lensData[key] = { ...(lensData[key] || { note: '', bracketState: 'normal' }), ...data };
      return { ...all, [currentLens]: lensData };
    });
    this.triggerAutoSave(key);
  }

  activeDictationNode = signal<SummaryNode | SummaryNodeItem | null>(null);

  openNodeDictation(node: SummaryNode | SummaryNodeItem) {
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

  changeLens(lens: AnalysisLens) {
    this.audit.logAction('VIEW_LENS', this.patientManager.selectedPatientId(), { lens });
    this.flushAutoSave();
    this.activeLens.set(lens);
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

  printReport() { window.print(); }

  // --- Live Consult Actions ---



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
