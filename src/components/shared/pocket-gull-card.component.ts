import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'pocket-gull-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="neoTactile() 
      ? 'bg-[#FFFDF5] dark:bg-zinc-950 rounded-2xl border-2 border-[#1C1C1C] dark:border-white/30 shadow-[4px_6px_0px_0px_rgba(28,28,28,0.85)] dark:shadow-[4px_6px_0px_0px_rgba(0,0,0,0.9)] relative h-full flex flex-col transition-all duration-300 hover:translate-y-[-2px] pocket-gull-card'
      : 'bg-white/70 dark:bg-zinc-900 backdrop-blur-[12px] rounded-xl border border-white/20 dark:border-zinc-800 shadow-lg relative h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-gray-200 dark:hover:border-zinc-700 pocket-gull-card'">
      
      <!-- Glow Effect (Clipped to card bounds) -->
      <div class="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div class="px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-zinc-800/80 shrink-0 relative z-10 min-w-0">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          @if (icon()) {
            <div class="w-8 h-8 rounded-lg bg-primary-10 flex items-center justify-center text-[#689F38]">
              <div [innerHTML]="iconHtml()"></div>
            </div>
          }
          <h3 class="text-base sm:text-lg font-black uppercase tracking-wider text-[#111827] dark:text-zinc-100 flex items-center gap-2">
            <span>{{ title() }}</span>
            @if (personaBadge()) {
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#F6B12B] text-[#1C1C1C] font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)] shrink-0">
                {{ personaBadge() }}
              </span>
            }
          </h3>
        </div>
        <ng-content select="[right-action]"></ng-content>
      </div>

      <div class="flex-grow min-w-0" [class.p-4]="!noPadding()" [class.sm:p-6]="!noPadding()">
        <ng-content></ng-content>
      </div>
      
      @if (footer()) {
        <div class="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 dark:border-zinc-800/80 text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300 bg-black/5 dark:bg-zinc-800/50">
          <ng-content select="[card-footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .bg-primary-10 {
      background: rgba(104, 159, 56, 0.1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PocketGullCardComponent {
  private sanitizer = inject(DomSanitizer);

  title = input<string>();
  icon = input<string>('');
  personaBadge = input<string>('');
  neoTactile = input<boolean>(false);
  footer = input<boolean>(false);
  noPadding = input<boolean>(false);

  iconHtml = computed(() => {
    const raw = this.icon();
    if (!raw) return '';
    let html: string;
    // If already contains HTML tags, pass through
    if (raw.includes('<')) {
      html = raw;
    } else {
      // Treat as SVG path data
      html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="${raw}"></path></svg>`;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });
}

