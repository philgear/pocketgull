import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-origami-decorations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-4 py-2 px-3 bg-[#F9F3D9] dark:bg-zinc-900/90 rounded-2xl border border-[#F5B98E]/40 shadow-sm transition-all hover:shadow-md">
      <!-- Origami Gull SVG Badge -->
      <div class="relative w-10 h-10 flex items-center justify-center filter drop-shadow-[2px_4px_6px_rgba(60,40,20,0.15)]">
        <svg viewBox="0 0 100 100" class="w-full h-full transform hover:scale-110 transition-transform">
          <!-- Sun ray backdrop -->
          <polygon points="50,40 65,15 58,45" fill="#F6B12B" stroke="#E59F1E" stroke-width="0.5" />
          <!-- Origami Gull Wings -->
          <polygon points="20,50 50,40 10,35" fill="#FFFFFF" stroke="#D0D0D0" stroke-width="0.5" />
          <polygon points="20,50 50,40 58,45 75,55 50,65" fill="#F4F4F4" stroke="#E0E0E0" stroke-width="0.5" />
          <!-- Coral Beak & Accent -->
          <polygon points="50,40 58,45 35,85" fill="#EF6658" stroke="#DF5648" stroke-width="0.5" />
          <polygon points="50,40 35,85 20,50" fill="#2AA4A0" stroke="#1F8582" stroke-width="0.5" />
          <!-- Tail & Beak Tip -->
          <polygon points="75,55 58,45 85,38" fill="#FFFFFF" stroke="#F0F0F0" stroke-width="0.5" />
          <polygon points="85,38 82,45 95,34" fill="#F6B12B" stroke="#E0902C" stroke-width="0.5" />
        </svg>
      </div>

      <!-- Papercraft Title & Subtitle -->
      <div class="flex flex-col">
        <span class="text-xs font-bold uppercase tracking-wider text-[#1C1C1C] dark:text-zinc-100 flex items-center gap-1.5">
          {{ title() }}
          <span class="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-[#EF6658]/20 text-[#EF6658] border border-[#EF6658]/30">
            Papercraft 3D
          </span>
        </span>
        <span class="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
          {{ subtitle() }}
        </span>
      </div>
    </div>
  `
})
export class OrigamiPapercraftDecorationsComponent {
  title = input<string>('Tactile Paper Stock');
  subtitle = input<string>('Origami Folds & Layered Shadow Physics');
}
