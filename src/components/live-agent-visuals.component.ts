import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-live-agent-visuals',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <div class="relative w-48 h-48 md:w-64 md:h-64 transition-all duration-500" [class.opacity-10]="hasChatHistory" [class.opacity-100]="!hasChatHistory">
                <!-- Glowing Orb -->
                <div class="absolute inset-0 rounded-full transition-all duration-500" 
                     [class.bg-green-400/10]="agentState === 'idle'"
                     [class.bg-blue-400/20]="agentState === 'listening'"
                     [class.bg-purple-400/20]="agentState === 'processing'"
                     [class.blur-2xl]="true"
                     [class.scale-100]="agentState === 'idle'"
                     [class.scale-125]="agentState !== 'idle'">
                </div>

                <!-- Animated SVG Avatar -->
                <svg class="w-full h-full" viewBox="0 0 100 100">
                    <!-- Base Circle -->
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E5E7EB" stroke-width="0.5"/>

                    <!-- Listening Waveform -->
                    @if (agentState === 'listening') {
                        <path d="M 20 50 Q 35 40, 50 50 T 80 50" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round">
                            <animate attributeName="d" dur="1.5s" repeatCount="indefinite" values="M 20 50 Q 35 40, 50 50 T 80 50; M 20 50 Q 35 60, 50 50 T 80 50; M 20 50 Q 35 40, 50 50 T 80 50" />
                        </path>
                    }

                    <!-- Processing Spinner -->
                    @if (agentState === 'processing') {
                        <circle cx="50" cy="50" r="30" fill="none" stroke="#C084FC" stroke-width="2" stroke-dasharray="15 10" stroke-linecap="round">
                            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite" />
                        </circle>
                    }

                    <!-- Idle Pulsing Core -->
                    @if (agentState === 'idle') {
                        <circle cx="50" cy="50" r="10" fill="#34D399" >
                            <animate attributeName="r" dur="2s" repeatCount="indefinite" values="10;12;10" />
                            <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="1;0.7;1" />
                        </circle>
                    }
                </svg>
            </div>
            <div class="text-center -mt-8 md:-mt-16 transition-all duration-300" [class.opacity-0]="hasChatHistory">
                <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200">Pocket Gull AI</h2>
                <p class="text-sm text-gray-500">Live Clinical Co-Pilot</p>
            </div>
        </div>
    `,
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
            margin-top: 1em;
            margin-bottom: 0.2em;
        }
    `]
})
export class LiveAgentVisualsComponent {
    @Input() agentState: 'idle' | 'listening' | 'processing' | 'speaking' | 'typing' = 'idle';
    @Input() hasChatHistory: boolean = false;
}
