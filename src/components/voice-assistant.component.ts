import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, ElementRef, OnDestroy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { DictationService } from '../services/dictation.service';
import { PatientManagementService } from '../services/patient-management.service';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullInputComponent } from './shared/pocket-gull-input.component';
import { MarkdownService } from '../services/markdown.service';
import { RichMediaService, RichMediaCard } from '../services/rich-media.service';
import { ClinicalIcons } from '../assets/clinical-icons';
import { AdkLiveService } from '../services/ai/adk-live.service';
import { inject as baseInject } from '@angular/core';

export interface ChatEntry {
    role: 'user' | 'model';
    text: string;
    htmlContent?: string;
    richCards?: RichMediaCard[];
    feedback?: 'up' | 'down';
}

@Component({
    selector: 'app-voice-assistant',
    imports: [CommonModule, FormsModule, PocketGullButtonComponent, PocketGullInputComponent, SafeHtmlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .prose {
            --tw-prose-body: theme(colors.gray.700);
            --tw-prose-headings: theme(colors.gray.900);
            --tw-prose-lead: theme(colors.gray.600);
            --tw-prose-links: theme(colors.blue.600);
            --tw-prose-bold: theme(colors.gray.900);
            --tw-prose-counters: theme(colors.gray.500);
            --tw-prose-bullets: theme(colors.gray.300);
            --tw-prose-hr: theme(colors.gray.200);
            --tw-prose-quotes: theme(colors.gray.900);
            --tw-prose-quote-borders: theme(colors.gray.200);
            --tw-prose-captions: theme(colors.gray.500);
            --tw-prose-code: theme(colors.indigo.600);
            --tw-prose-pre-code: theme(colors.indigo.200);
            --tw-prose-pre-bg: theme(colors.gray.800);
            --tw-prose-th-borders: theme(colors.gray.300);
            --tw-prose-td-borders: theme(colors.gray.200);

            --tw-prose-invert-body: theme(colors.gray.300);
            --tw-prose-invert-headings: theme(colors.white);
            --tw-prose-invert-lead: theme(colors.gray.400);
            --tw-prose-invert-links: theme(colors.blue.400);
            --tw-prose-invert-bold: theme(colors.white);
            --tw-prose-invert-counters: theme(colors.gray.400);
            --tw-prose-invert-bullets: theme(colors.gray.600);
            --tw-prose-invert-hr: theme(colors.gray.700);
            --tw-prose-invert-quotes: theme(colors.gray.100);
            --tw-prose-invert-quote-borders: theme(colors.gray.700);
            --tw-prose-invert-captions: theme(colors.gray.400);
            --tw-prose-invert-code: theme(colors.indigo.400);
            --tw-prose-invert-pre-code: theme(colors.indigo.300);
            --tw-prose-invert-pre-bg: theme(colors.gray.900);
            --tw-prose-invert-th-borders: theme(colors.gray.600);
            --tw-prose-invert-td-borders: theme(colors.gray.700);
        }

        .prose :where(p):not(:where([class~="not-prose"] *)) {
            margin-top: 0.8em;
            margin-bottom: 0.8em;
        }
        
        .prose :where(ul):not(:where([class~="not-prose"] *)) {
            margin-top: 0.8em;
            margin-bottom: 0.8em;
        }

        .prose :where(h2):not(:where([class~="not-prose"] *)) {
            font-size: 1.1em;
            margin-top: 1.2em;
            margin-bottom: 0.5em;
        }

        .prose.prose-sm :where(h3):not(:where([class~="not-prose"] *)) {
            font-size: 0.9em;
.foo {}
        }
    `],
    template: `
        <div class="h-full bg-white dark:bg-[#09090b] z-10 flex flex-col no-print w-full">
            
            <!-- Panel Header -->
            <div class="flex items-center justify-between px-4 sm:px-6 py-4 lg:px-12 h-16 shrink-0 z-20 relative bg-white dark:bg-[#09090b] border-b border-gray-100 dark:border-zinc-800">
                <div class="flex items-center gap-2 sm:gap-4 min-w-0">
                    <div class="flex items-center gap-3">
                        <svg class="w-6 h-6 shrink-0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
                        <span class="font-medium text-[#1C1C1C] dark:text-zinc-100 tracking-[0.1em] sm:tracking-[0.15em] text-[10px] sm:text-sm uppercase truncate">Pocket Gull Intelligence</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        (click)="isMuted.set(!isMuted())"
                        class="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                        title="Toggle Sound">
                        @if (isMuted()) {
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        } @else {
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        }
                    </button>
                    <button
                        (click)="endLiveConsult()"
                        class="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 sm:gap-2 transition-colors uppercase text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 shrink-0"
                        title="Close Voice Assistant">
                        <span class="hidden sm:inline">Close Session</span>
                        <span class="sm:hidden">Close</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            <!-- MODE: SELECTION Placeholder -->
            @if (panelMode() === 'selection') {
                <div class="flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-white dark:bg-[#09090b] w-full"></div>
            }

            <!-- MODE: CHAT -->
            @if (panelMode() === 'chat') {
                <div class="flex-1 flex flex-col items-stretch justify-center overflow-hidden bg-white dark:bg-[#09090b] w-full relative">
                    
                    <!-- Centerpiece: Agent Avatar & Status -->
                    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                        <div class="relative w-48 h-48 md:w-64 md:h-64 transition-all duration-500" [class.opacity-10]="chatHistory().length > 0" [class.opacity-100]="chatHistory().length === 0">
                            <!-- Glowing Orb -->
                            <div class="absolute inset-0 rounded-full transition-all duration-500" 
                                 [class.bg-green-400/10]="agentState() === 'idle'"
                                 [class.bg-blue-400/20]="agentState() === 'listening'"
                                 [class.bg-purple-400/20]="agentState() === 'processing'"
                                 [class.blur-2xl]="true"
                                 [class.scale-100]="agentState() === 'idle'"
                                 [class.scale-125]="agentState() !== 'idle'">
                            </div>

                            <!-- Animated SVG Avatar -->
                            <svg class="w-full h-full" viewBox="0 0 100 100">
                                <!-- Base Circle -->
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E5E7EB" stroke-width="0.5"/>

                                <!-- Listening Waveform -->
                                @if (agentState() === 'listening') {
                                    <path d="M 20 50 Q 35 40, 50 50 T 80 50" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round">
                                        <animate attributeName="d" dur="1.5s" repeatCount="indefinite" values="M 20 50 Q 35 40, 50 50 T 80 50; M 20 50 Q 35 60, 50 50 T 80 50; M 20 50 Q 35 40, 50 50 T 80 50" />
                                    </path>
                                }

                                <!-- Processing Spinner -->
                                @if (agentState() === 'processing') {
                                    <circle cx="50" cy="50" r="30" fill="none" stroke="#C084FC" stroke-width="2" stroke-dasharray="15 10" stroke-linecap="round">
                                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite" />
                                    </circle>
                                }

                                <!-- Idle Pulsing Core -->
                                @if (agentState() === 'idle') {
                                    <circle cx="50" cy="50" r="10" fill="#34D399" >
                                        <animate attributeName="r" dur="2s" repeatCount="indefinite" values="10;12;10" />
                                        <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="1;0.7;1" />
                                    </circle>
                                }
                            </svg>
                        </div>
                        <div class="text-center -mt-8 md:-mt-16 transition-all duration-300" [class.opacity-0]="chatHistory().length > 0">
                            <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200">Pocket Gull Intelligence</h2>
                            <p class="text-sm text-gray-500">Live Clinical Co-Pilot</p>
                        </div>
                    </div>

                    <!-- Transcript Scroll Area -->
                    <div #transcriptContainer class="relative z-10 flex-1 overflow-y-auto w-full scroll-smooth pt-8 pb-48 px-4 lg:px-8">
                        <div class="max-w-3xl mx-auto space-y-12">
                            <!-- Regular Transcript -->
                            @for (entry of parsedTranscript(); track $index) {
                                <div class="group flex gap-3 items-start w-full animate-in fade-in slide-in-from-bottom-3 duration-300" [class.flex-row-reverse]="entry.role === 'user'">
                                    
                                    <!-- Avatar -->
                                    <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1" [class.bg-gray-700]="entry.role === 'model'" [class.bg-blue-500]="entry.role === 'user'">
                                        @if (entry.role === 'model') {
                                            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                                        } @else {
                                            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 21a8 8 0 0 0-16 0" /><circle cx="10" cy="8" r="5" /><path d="M10 13a3 3 0 0 0-3 3" /></svg>
                                        }
                                    </div>

                                    <!-- Bubble & Content -->
                                    <div class="flex flex-col gap-2 w-full min-w-0" [class.items-end]="entry.role === 'user'">
                                         @if (entry.role === 'model') {
                                             <!-- Model Bubble -->
                                             <div class="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl rounded-tl-sm p-4 w-full break-words">
                                                <div [innerHTML]="entry.htmlContent | safeHtml"></div>
                                             </div>
                                         } @else {
                                            <!-- User Bubble -->
                                            <div class="prose prose-sm max-w-none text-white bg-blue-500 dark:bg-blue-600 rounded-2xl rounded-tr-sm p-4 w-full break-words">
                                                <div [innerHTML]="(entry.htmlContent || entry.text) | safeHtml"></div>
                                            </div>
                                         }
                                         
                                        <!-- Rich Media Cards -->
                                        @if (entry.richCards && entry.richCards.length > 0) {
                                             <div class="rm-panel">
                                                 @for (card of entry.richCards; track card.query) {
                                                    <!-- ... [Rest of rich media card templates remain the same] ... -->
                                                 }
                                             </div>
                                        }

                                        <!-- Action Buttons on Hover -->
                                        <div class="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" [class.self-start]="entry.role === 'model'" [class.self-end]="entry.role === 'user'">
                                            <pocket-gull-button variant="ghost" size="xs" (click)="actionCopy(entry.text)" icon="M9 9h13v13H9V9zm-4 6H4v-9h9v1z" ariaLabel="Copy Message"></pocket-gull-button>
                                            <pocket-gull-button variant="ghost" size="xs" (click)="actionDictate(entry.text)" icon="M11 5L6 9H2v6h4l5 4V5zm8.07-.07a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" ariaLabel="Speak Aloud"></pocket-gull-button>
                                            <pocket-gull-button variant="ghost" size="xs" (click)="actionInsert(entry.text)" icon="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" ariaLabel="Insert into Clinical Notes"></pocket-gull-button>
                                            @if (entry.role === 'model') {
                                                <div class="w-px h-4 bg-gray-300 dark:bg-zinc-700 mx-1"></div>
                                                <pocket-gull-button variant="ghost" size="xs" (click)="actionThumbsUp(entry)" icon="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" ariaLabel="Thumbs Up" [class.text-green-600]="entry.feedback === 'up'" [class.dark:text-green-400]="entry.feedback === 'up'"></pocket-gull-button>
                                                <pocket-gull-button variant="ghost" size="xs" (click)="actionThumbsDown(entry)" icon="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2" ariaLabel="Thumbs Down" [class.text-red-600]="entry.feedback === 'down'" [class.dark:text-red-400]="entry.feedback === 'down'"></pocket-gull-button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            }

                            <!-- Thinking Indicator -->
                            @if (agentState() === 'processing') {
                                <div class="flex gap-3 items-start w-full animate-in fade-in">
                                    <div class="shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mt-1">
                                        <svg class="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    </div>
                                    <div class="prose prose-sm text-gray-500 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-4">
                                        Thinking...
                                    </div>
                                </div>
                            }
                        </div>
                    </div>

                    <!-- Controls (Floating at bottom) -->
                    <div class="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-[#09090b] dark:via-[#09090b]/90 dark:to-transparent flex justify-center z-20">
                         <div class="w-full max-w-3xl flex flex-col gap-3 relative">
                            <!-- Smart Suggestions -->
                            @if (chatHistory().length === 0 && agentState() === 'idle') {
                              <div class="flex flex-wrap items-center justify-center gap-2 mb-2 w-full px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                 <button type="button" (click)="messageText.set('What is the most critical evidence here?'); sendMessage()" class="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all shadow-sm">
                                     What is the most critical evidence?
                                 </button>
                                 <button type="button" (click)="messageText.set('Are there alternative interventions?'); sendMessage()" class="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all shadow-sm">
                                     Alternative interventions?
                                 </button>
                                 <button type="button" (click)="messageText.set('Explain the clinical rationale simply.'); sendMessage()" class="hidden sm:inline-block px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all shadow-sm">
                                     Explain rationale simply
                                 </button>
                              </div>
                            }

                            <!-- ... [Rest of controls like error messages, file uploads remain the same] ... -->

                            <form (submit)="sendMessage($event)" class="w-full flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-700 shadow-2xl rounded-full p-2 focus-within:border-gray-300 dark:focus-within:border-zinc-600 transition-all">
                                <button type="button" (click)="toggleListening()" [disabled]="agentState() !== 'idle' || !!permissionError()"
                                        title="Start/Stop Voice Capture"
                                        class="w-12 h-12 flex items-center justify-center rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                                        [class.bg-red-500]="live.isListening()" [class.text-white]="live.isListening()"
                                        [class.bg-gray-100]="!live.isListening()" [class.dark:bg-zinc-800]="!live.isListening()" [class.text-gray-600]="!live.isListening()" [class.dark:text-zinc-300]="!live.isListening()"
                                        [class.hover:bg-red-600]="live.isListening()" [class.hover:bg-gray-200]="!live.isListening()" [class.dark:hover:bg-zinc-700]="!live.isListening()">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                                </button>

                                <div class="flex-1">
                                    <pocket-gull-input
                                        #chatInput
                                        type="text"
                                        [value]="messageText()"
                                        (valueChange)="messageText.set($event)"
                                        placeholder="Ask a follow-up or say 'Done' to exit..."
                                        className="!border-transparent !bg-transparent !shadow-none !ring-0 !px-2 !py-2 text-base"
                                        [disabled]="agentState() !== 'idle'"
                                        (keydown)="handleKeydown($event)">
                                    </pocket-gull-input>
                                </div>

                                 <button type="button" class="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50" (click)="triggerFileInput()" [disabled]="agentState() !== 'idle'" title="Attach Files">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                </button>

                                <button 
                                    type="submit" 
                                    [disabled]="!messageText().trim() || agentState() !== 'idle'"
                                    class="w-12 h-12 rounded-full flex items-center justify-center bg-black text-white disabled:bg-gray-300 dark:disabled:bg-zinc-700 hover:bg-gray-800 transition-colors shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </button>
                            </form>
                            
                        </div>
                    </div>
                </div>
            }
        </div>
    `
})
export class VoiceAssistantComponent implements OnDestroy {
    state = inject(PatientStateService);
    intel = inject(ClinicalIntelligenceService);
    dictation = inject(DictationService);
    patientMgmt = inject(PatientManagementService);
    markdownService = inject(MarkdownService);
    richMedia = inject(RichMediaService);

    panelMode = signal<'selection' | 'chat' | 'dictation'>('selection');

    transcriptContainer = viewChild<ElementRef<HTMLDivElement>>('transcriptContainer');
    fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');
    chatInputRef = viewChild<any>('chatInput');

    // --- Chat State ---
    agentState = signal<'idle' | 'listening' | 'processing' | 'speaking' | 'typing'>('idle');
    isMuted = signal<boolean>(true);
    permissionError = signal<string | null>(null);
    messageText = signal('');
    typingIntroText = signal('');
    chatHistory = signal<ChatEntry[]>([]);
    selectedFiles = signal<File[]>([]);

    protected readonly ClinicalIcons = ClinicalIcons;
    public live = inject(AdkLiveService);

    // Derived signal for UI rendering
    parsedTranscript = computed(() => {
        return this.chatHistory();
    });

    // --- Action Bar Logic ---
    actionCopy(text: string) {
        navigator.clipboard.writeText(text);
    }

    actionThumbsUp(entry: ChatEntry) {
        entry.feedback = entry.feedback === 'up' ? undefined : 'up';
        this.chatHistory.update(h => [...h]);
    }

    actionThumbsDown(entry: ChatEntry) {
        entry.feedback = entry.feedback === 'down' ? undefined : 'down';
        this.chatHistory.update(h => [...h]);
    }

    actionDictate(text: string) {
        this.speak(text);
    }

    actionInsert(text: string) {
        const cleanText = text.replace(/[*_~`#]/g, '');
        const newNote = {
            id: 'note_' + Date.now().toString(),
            text: cleanText,
            sourceLens: 'Overview',
            date: new Date().toISOString()
        };
        this.state.addClinicalNote(newNote);
    }

    // --- Dictation State ---
    dictationText = signal('');
    isDictating = signal(false);

    constructor() {
        effect(() => {
            const input = this.state.liveAgentInput();
            if (input && this.agentState() === 'idle') {
                this.messageText.set(input);
                this.state.liveAgentInput.set('');

                untracked(() => {
                    setTimeout(() => this.sendMessage(), 50);
                });
            }
        }, { allowSignalWrites: true });

        // Ensure we always scroll to bottom when transcript updates
        effect(() => {
            this.parsedTranscript();
            untracked(() => this.scrollToBottom());
        });

        effect(() => {
            const isActive = this.state.isLiveAgentActive();
            untracked(() => {
                if (isActive && this.panelMode() !== 'chat') {
                    // Auto-start chat when active
                    this.activateChat();
                } else if (!isActive && this.panelMode() === 'chat') {
                    this.panelMode.set('selection');
                }
            });
        }, { allowSignalWrites: true });

        // Only init if in browser
        if (typeof window !== 'undefined') {
            this.live.onMessage = (msg) => {
                if (msg.text) {
                    this._accumulateModelText(msg.text);
                }
            };
            this.live.onModelTurnComplete = () => {
                this._finalizeModelTurn();
            };
            
            // Setup local STT purely for UI feedback since Live API doesn't echo user speech
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';
                
                this.recognition.onresult = (event: any) => {
                    let interim = '';
                    let finalBlock = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) finalBlock += transcript;
                        else interim += transcript;
                    }
                    if (finalBlock) {
                        this._liveUserText += finalBlock + " ";
                        this._updateUserBubble(this._liveUserText.trim() + " " + interim);
                    } else if (interim) {
                        this._updateUserBubble(this._liveUserText.trim() + " " + interim);
                    }
                };
                
                this.recognition.onerror = (e: any) => console.log("UI STT Error:", e.error);
                this.recognition.onend = () => {
                    // Loop if still listening
                    if (this.live.isListening() && this.agentState() !== 'processing') {
                        try { this.recognition.start(); } catch {}
                    }
                };
            }
        }
    }

    private recognition: any;

    ngOnDestroy() {
        this.stopDictation();
        this.live.disconnect();
        if (this.recognition) this.recognition.stop();
    }

    endLiveConsult() {
        this.live.disconnect();
        if (this.recognition) this.recognition.stop();
        this.agentState.set('idle');
        this.isDictating.set(false);
        this.state.isLiveAgentActive.set(false);
    }

    async activateChat() {
        this.panelMode.set('chat');

        this.chatHistory.set([]);
        console.log("Activating chat...");

        const patient = this.patientMgmt.selectedPatient();
        const history = patient?.history || [];
        let rawPatientData = this.state.getAllDataForPrompt(history);

        const recentNodes = this.intel.recentNodes();
        if (recentNodes.length > 0) {
            rawPatientData += "\n\n=== RECENT CLINICAL NODE DISCUSSIONS ===\n" +
                recentNodes.map(n =>
                    `[Section: ${n.sectionTitle}]\nClaim in Focus: "${n.nodeText}"\nDiscussion History:\n${n.transcript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n')}`
                ).join('\n\n---\n\n');
        }

        console.log("Starting chat session with patientData length:", rawPatientData.length);

        // We'll manually specify context for VoiceAssistant to ensure rich-media parsing is respected
        const context = `You are a collaborative care plan co-pilot named "Pocket Gull". You are assisting a doctor in refining a strategy for their patient. You have already reviewed the finalized patient overview and the current recommendations. Your role is to help the doctor iterate on the care plan, explore functional protocols, structure follow-ups, or answer specific questions. Keep your answers brief, actionable, and focused on strategic holistic care. Be ready to elaborate when asked.

VISUAL GROUNDING: When the user asks for images, a 3D model, or research (e.g. "show me an image", "3D model of", "find research on"), respond with a \`\`\`rich-media\`\`\` JSON block BEFORE your prose explanation. Format:
\`\`\`rich-media
{ "cards": [{ "kind": "model-3d"|"image-gallery"|"pubmed-refs"|"phil-image", "query": "<anatomical or clinical term>", "severity": "green"|"yellow"|"red", "afflictionHighlight": "<anatomical part>", "particles": true|false }] }
\`\`\`
Only include a rich-media block when the user explicitly requests visual or research content.`;

        // Start standard STT backend init (keeps context sync'd)
        await this.intel.ai.startChat(rawPatientData, context);
        
        // Initialize ADK Live Service with user's actual token (from API key context)
        // Check window (SSR inject) first, then fallback to local storage
        const apiKey = (window as any).GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY') || '';
        if (!apiKey) {
             console.error("AdkLiveService Error: No GEMINI_API_KEY found in window or localStorage.");
             this.permissionError.set('Missing API Key. Please re-enter it on the home screen.');
             return;
        }

        try {
            console.log("Connecting to Live API WebSocket...");
            await this.live.connect(apiKey, `${context}\n\nPatient Data:\n${rawPatientData}`);
            // Barge-in enabled natively by SDK setup!
        } catch (e) {
            console.error("AdkLiveService Connection Error:", e);
            this.permissionError.set('Failed to connect to Live Interface.');
        }

        console.log("Chat session started.");

        setTimeout(() => this.chatInputRef()?.focus(), 100);

        this.agentState.set('idle');
    }

    activateDictation() {
        this.panelMode.set('dictation');
    }

    toggleDictation() {
        if (this.isDictating()) {
            this.stopDictation();
        } else {
            this.startDictation();
        }
    }

    startDictation() {
        // Dictation has been deprecated in favor of native multimodal chat
    }

    stopDictation() {
        this.isDictating.set(false);
    }

    clearDictation() {
        this.dictationText.set('');
    }

    copyDictation() {
        navigator.clipboard.writeText(this.dictationText());
    }

    // --- Auto-scroll Handler ---
    private scrollToBottom(): void {
        setTimeout(() => {
            const container = this.transcriptContainer()?.nativeElement;
            if (container) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    }

    // --- Helpers ---
    private _liveUserText = '';
    
    private _updateUserBubble(tempText: string) {
        this.chatHistory.update(h => {
             const next = [...h];
             let entry = next.length > 0 ? next[next.length - 1] : null;
             if (!entry || entry.role !== 'user') {
                 entry = { role: 'user', text: '' };
                 next.push(entry);
             }
             entry.text = tempText;
             entry.htmlContent = `<p>${tempText}</p>`;
             return next;
        });
        this.scrollToBottom();
    }

    private _appendUser(text: string, htmlContent?: string) {
        const html = htmlContent || `<p>${text}</p>`;
        this.chatHistory.update(h => {
             const next = [...h];
             // If the last bubble was a UI-transcribed user bubble, update it.
             if (next.length > 0 && next[next.length - 1].role === 'user') {
                 next[next.length - 1].text = text;
                 next[next.length - 1].htmlContent = html;
             } else {
                 next.push({ role: 'user', text, htmlContent: html });
             }
             return next;
        });
        this.scrollToBottom();
    }

    private _liveModelText = '';
    private _liveCardsResolved = false;

    private _accumulateModelText(chunk: string) {
        this.agentState.set('processing');
        this._liveModelText += chunk;
        
        let { cleanMd, jsonStr } = this._extractCards(this._liveModelText);
        
        let htmlContent = cleanMd;
        const parser = this.markdownService.parser();
        if (parser) { try { htmlContent = (parser as any).parse(cleanMd); } catch { htmlContent = `<p>${cleanMd}</p>`; } }

        this.chatHistory.update(h => {
            const next = [...h];
            let entry = next.length > 0 ? next[next.length - 1] : null;
            if (!entry || entry.role !== 'model') {
                 entry = { role: 'model', text: '' };
                 next.push(entry);
            }
            
            entry.text = cleanMd;
            entry.htmlContent = htmlContent;

            if (jsonStr && !this._liveCardsResolved) {
               const richCards = this._parseCards(jsonStr);
               if (richCards && richCards.length > 0) {
                   entry.richCards = richCards;
                   try {
                       JSON.parse(jsonStr.trim()); // ensures JSON is complete before network requests
                       this._liveCardsResolved = true;
                       Promise.all(richCards.map(card => this.richMedia.resolveCard(card))).then(resolved => {
                           this.chatHistory.update(history => {
                               const updated = [...history];
                               const last = updated[updated.length - 1];
                               if (last && last.role === 'model') {
                                   updated[updated.length - 1] = { ...last, richCards: resolved };
                               }
                               return updated;
                           });
                           this.scrollToBottom();
                       });
                   } catch { /* JSON not fully formed yet */ }
               }
            }
            return next;
        });
        this.scrollToBottom();
    }
    
    private _finalizeModelTurn() {
        this.agentState.set('idle');
        this._liveModelText = '';
        this._liveCardsResolved = false;
        this._liveUserText = ''; // Reset user STT tracking for the next turn
        
        // Restart UI STT if still listening
        if (this.live.isListening() && this.recognition) {
             try { this.recognition.start(); } catch {}
        }
    }

    private _extractCards(md: string): { cleanMd: string, jsonStr: string } {
        let cleanMd = md;
        const fencedRegex = /```[a-z0-9-]*\s*(\{[\s\S]*?"cards"\s*:[\s\S]*?\})\s*```/i;
        let match = md.match(fencedRegex);
        let jsonStr = '';

        if (match) {
            jsonStr = match[1];
            cleanMd = md.replace(match[0], '').trim();
        } else if (md.includes('"cards"')) {
            const startIdx = md.indexOf('{');
            const endIdx = md.lastIndexOf('}');
            if (startIdx !== -1 && endIdx > startIdx) {
                jsonStr = md.substring(startIdx, endIdx + 1);
                cleanMd = md.replace(jsonStr, '').trim();
                cleanMd = cleanMd.replace(/```[a-z0-9-]*\s*```/gi, '').trim();
            }
        }
        return { cleanMd, jsonStr };
    }

    private _parseCards(jsonStr: string): RichMediaCard[] | undefined {
        try {
            const parsed = JSON.parse(jsonStr.trim());
            const rawCards: Array<{ kind: string; query: string; severity?: string; afflictionHighlight?: string; particles?: boolean }> = parsed.cards ?? [];
            return rawCards
                .filter(c => ['model-3d', 'image-gallery', 'pubmed-refs', 'phil-image'].includes(c.kind))
                .map(c => ({
                    kind: c.kind as any,
                    query: c.query,
                    severity: c.severity as any,
                    afflictionHighlight: c.afflictionHighlight,
                    particles: c.particles,
                    loading: true
                }));
        } catch { return undefined; }
    }

    triggerFileInput() {
        this.fileInputRef()?.nativeElement.click();
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            const filesToAdd = Array.from(input.files);
            this.selectedFiles.update(current => [...current, ...filesToAdd]);
            input.value = '';
        }
    }

    removeFile(index: number) {
        this.selectedFiles.update(files => files.filter((_, i) => i !== index));
    }

    requestImage() { this.messageText.set(`Show me medical images of relevant anatomy`); this.sendMessage(); }
    request3DModel() { this.messageText.set(`Show me a 3D anatomical model`); this.sendMessage(); }
    requestResearch() { this.messageText.set(`Find clinical research on the topics discussed`); this.sendMessage(); }

    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage(event?: Event) {
        event?.preventDefault();

        const message = this.messageText().trim();
        const files = this.selectedFiles();
        if ((!message && files.length === 0) || this.agentState() !== 'idle') return;

        this.messageText.set('');
        this.selectedFiles.set([]);
        this.agentState.set('processing');
        this.scrollToBottom();

        // create message with text and file indicators for user UI
        let userDisplayHtml = message ? `<p>${message}</p>` : '';
        if (files.length > 0) {
            const fileNames = files.map(f => f.name).join(', ');
            userDisplayHtml += `<p style="font-size: 11px; color: #9CA3AF; margin-top: 4px;">📎 Attached: ${fileNames}</p>`;
        }

        this._appendUser(message, userDisplayHtml);

        try {
            if (this.live.isConnected()) {
                // Send text over WebSockets natively if connected to multimodal live
                this.live.sendText(message);
            } else {
                // Fallback to standard chat endpoint if Live connection fails
                const responseText = await this.intel.ai.sendMessage(message, files);
                this._accumulateModelText(responseText);
                this._finalizeModelTurn();
                this.speak(responseText);
            }
        } catch (e: any) {
            this._accumulateModelText(`Error: ${e?.message ?? e}`);
            this._finalizeModelTurn();
        } finally {
            if (this.agentState() === 'processing') {
                this.agentState.set('idle');
            }
            this.scrollToBottom();
        }
    }

    toggleListening() {
        if (this.permissionError()) return;
        if (this.live.isListening()) {
            this.live.stopListening();
            if (this.recognition) this.recognition.stop();
        } else {
            this.live.startListening();
            if (this.recognition) {
                 try { this.recognition.start(); } catch {}
            }
        }
    }

    speak(text: string) {
        // Handled directly via ADK Multimodal audio stream / playNextAudio().
        // Legacy TTS is disabled to prevent colliding with real model voice.
    }
}
