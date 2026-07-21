import { Component, ChangeDetectionStrategy, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IChronoWindow {
  id: string;
  name: string;
  startHour: number; // e.g. 7.0 for 07:00
  endHour: number;   // e.g. 9.0 for 09:00
  emoji: string;
  dishName: string;
  targetDishId: string;
  status: 'Optimal' | 'Suboptimal' | 'Fasting Mandatory';
  metabolicRationale: string;
  ramsAxiom: string;
}

@Component({
  selector: 'app-chrono-clock-decision-rail',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xl mb-8 font-sans">
      
      <!-- Clock Header & Braun Minimal Design Badge -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.6)] animate-pulse"></span>
            <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-widest">
              🕒 Chrono-Nutrition Circadian Clock & Decision Rail
            </h3>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              BMAL1 / CLOCK Pathway
            </span>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            Aligning meal timing with peripheral organ clock genes, GLUT4 sensitivity, and digestive fire.
          </p>
        </div>

        <!-- Quick Preset Time Buttons & Voice Assistant Launch -->
        <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button (click)="launchVoiceConsultation()"
            class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold uppercase tracking-wider transition shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5">
            <span>🎙️</span>
            <span>Live Voice Consult</span>
          </button>
          <button (click)="setTime(8.0)" [class.bg-sky-600]="selectedHour() === 8.0" [class.text-white]="selectedHour() === 8.0" class="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-sky-500/40 border border-transparent transition cursor-pointer">
            08:00
          </button>
          <button (click)="setTime(13.0)" [class.bg-sky-600]="selectedHour() === 13.0" [class.text-white]="selectedHour() === 13.0" class="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-sky-500/40 border border-transparent transition cursor-pointer">
            13:00
          </button>
          <button (click)="setTime(16.0)" [class.bg-sky-600]="selectedHour() === 16.0" [class.text-white]="selectedHour() === 16.0" class="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-sky-500/40 border border-transparent transition cursor-pointer">
            16:00
          </button>
          <button (click)="setTime(19.0)" [class.bg-sky-600]="selectedHour() === 19.0" [class.text-white]="selectedHour() === 19.0" class="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-sky-500/40 border border-transparent transition cursor-pointer">
            19:00
          </button>
        </div>

      </div>

      <!-- Main Layout: SVG Clock Dial + Decision Rail -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        <!-- Left Column: SVG 24-Hour Analog Clock Dial -->
        <div class="md:col-span-4 flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 relative">
          <svg viewBox="0 0 200 200" class="w-48 h-48 drop-shadow-md">
            <!-- Outer Clock Dial Circle -->
            <circle cx="100" cy="100" r="88" fill="none" class="stroke-zinc-300 dark:stroke-zinc-800" stroke-width="6" />
            
            <!-- Shaded Window Arcs -->
            <!-- Breakfast Arc (07:00-09:00 -> 105 deg to 135 deg) -->
            <path d="M 100 12 A 88 88 0 0 1 162 38" fill="none" class="stroke-emerald-500/40" stroke-width="10" />
            <!-- Lunch Arc (12:00-14:00 -> 180 deg to 210 deg) -->
            <path d="M 188 100 A 88 88 0 0 1 176 144" fill="none" class="stroke-indigo-500/40" stroke-width="10" />
            <!-- Elixir Arc (15:30-16:30) -->
            <path d="M 135 170 A 88 88 0 0 1 100 188" fill="none" class="stroke-amber-500/40" stroke-width="10" />
            <!-- Dinner Arc (18:30-19:30) -->
            <path d="M 62 162 A 88 88 0 0 1 38 138" fill="none" class="stroke-purple-500/40" stroke-width="10" />

            <!-- Hour Ticks -->
            @for (h of [0,3,6,9,12,15,18,21]; track h) {
              @let rad = (h / 24) * 2 * Math.PI - Math.PI / 2;
              <line 
                [attr.x1]="100 + 76 * Math.cos(rad)" 
                [attr.y1]="100 + 76 * Math.sin(rad)" 
                [attr.x2]="100 + 84 * Math.cos(rad)" 
                [attr.y2]="100 + 84 * Math.sin(rad)" 
                class="stroke-zinc-400 dark:stroke-zinc-600" stroke-width="2" />
            }

            <!-- Clock Center Pin -->
            <circle cx="100" cy="100" r="5" fill="#f97316" />

            <!-- Clock Rotating Hand -->
            @let handRad = (selectedHour() / 24) * 2 * Math.PI - Math.PI / 2;
            <line 
              [attr.x1]="100" 
              [attr.y1]="100" 
              [attr.x2]="100 + 68 * Math.cos(handRad)" 
              [attr.y2]="100 + 68 * Math.sin(handRad)" 
              stroke="#f97316" stroke-width="3" stroke-linecap="round" />
          </svg>

          <!-- Current Time Telemetry Pill -->
          <div class="mt-3 px-3 py-1 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono font-bold text-xs tracking-wider shadow-sm">
            ⏰ {{ formattedTime() }}
          </div>
        </div>

        <!-- Right Column: Interactive Decision Rail & Rationale -->
        <div class="md:col-span-8 space-y-4 font-mono">
          
          <!-- Interactive Time Slider (Rail) -->
          <div>
            <div class="flex justify-between items-center text-xs font-bold mb-2">
              <span class="text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">🎛️ Drag Chrono-Nutrition Decision Rail:</span>
              <span class="text-indigo-600 dark:text-indigo-400 font-extrabold">{{ formattedTime() }}</span>
            </div>
            <input 
              type="range" 
              min="6.0" 
              max="22.0" 
              step="0.5" 
              [value]="selectedHour()" 
              (input)="updateHour($event)" 
              class="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500" />
            
            <div class="flex justify-between text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">
              <span>06:00 AM (Dawn)</span>
              <span>12:00 PM (Noon Peak)</span>
              <span>06:00 PM (Sunset)</span>
              <span>10:00 PM (Night Fast)</span>
            </div>
          </div>

          <!-- Active Window Evaluation & Clinical Guidance Box -->
          @let activeWindow = currentEvaluatedWindow();
          <div class="p-4 rounded-2xl border transition-all duration-300 shadow-sm"
            [class.bg-emerald-500/10]="activeWindow.status === 'Optimal'"
            [class.border-emerald-500/30]="activeWindow.status === 'Optimal'"
            [class.bg-amber-500/10]="activeWindow.status === 'Suboptimal'"
            [class.border-amber-500/30]="activeWindow.status === 'Suboptimal'"
            [class.bg-red-500/10]="activeWindow.status === 'Fasting Mandatory'"
            [class.border-red-500/30]="activeWindow.status === 'Fasting Mandatory'">
            
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="flex items-center gap-2 font-bold text-xs">
                <span class="text-base">{{ activeWindow.emoji }}</span>
                <span class="text-zinc-900 dark:text-zinc-100 uppercase">{{ activeWindow.name }}</span>
              </div>

              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
                [class.bg-emerald-500/20]="activeWindow.status === 'Optimal'"
                [class.text-emerald-700]="activeWindow.status === 'Optimal'"
                [class.dark:text-emerald-300]="activeWindow.status === 'Optimal'"
                [class.bg-amber-500/20]="activeWindow.status === 'Suboptimal'"
                [class.text-amber-700]="activeWindow.status === 'Suboptimal'"
                [class.dark:text-amber-300]="activeWindow.status === 'Suboptimal'"
                [class.bg-red-500/20]="activeWindow.status === 'Fasting Mandatory'"
                [class.text-red-700]="activeWindow.status === 'Fasting Mandatory'"
                [class.dark:text-red-300]="activeWindow.status === 'Fasting Mandatory'">
                {{ activeWindow.status }}
              </span>
            </div>

            <!-- Recommended Culinary Prescription for this Hour -->
            <div class="text-xs font-sans text-zinc-700 dark:text-zinc-300 mb-2 leading-relaxed">
              <strong>Clinical Recommendation:</strong> {{ activeWindow.metabolicRationale }}
            </div>

            <!-- Rams Axiom Footnote -->
            <div class="text-[10px] text-zinc-500 dark:text-zinc-400 italic">
              Chrono Axiom: {{ activeWindow.ramsAxiom }}
            </div>

          </div>

        </div>

      </div>

    </div>
  `
})
export class ChronoClockDecisionRailComponent {
  selectedHour = signal<number>(12.5); // Default 12:30 PM
  windowSelect = output<string>();

  Math = Math;

  formattedTime = computed(() => {
    const h = this.selectedHour();
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    const padH = hours < 10 ? `0${hours}` : `${hours}`;
    const padM = mins < 10 ? `0${mins}` : `${mins}`;
    return `${padH}:${padM}`;
  });

  setTime(h: number) {
    this.selectedHour.set(h);
  }

  launchVoiceConsultation() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voice-mode-change', { detail: 'chrono' }));
    }
  }

  updateHour(event: Event) {

    const val = parseFloat((event.target as HTMLInputElement).value);
    this.selectedHour.set(val);
  }

  currentEvaluatedWindow = computed<IChronoWindow>(() => {
    const h = this.selectedHour();

    if (h >= 7.0 && h <= 9.5) {
      return {
        id: 'w-1',
        name: 'Morning Cortisol Awakening & HPA Glucose Shield',
        startHour: 7.0,
        endHour: 9.5,
        emoji: '🥑',
        dishName: 'Cold-Pressed EVOO & Avocado Carpaccio',
        targetDishId: 'menu-1',
        status: 'Optimal',
        metabolicRationale: 'Cortisol is at circadian peak. High healthy fats + low GI prevents glycemic volatility and buffers HPA axis stress.',
        ramsAxiom: 'Good design is useful — Provides sustained ketone precursors without insulin spikes.'
      };
    }

    if (h >= 11.5 && h <= 14.5) {
      return {
        id: 'w-2',
        name: 'Midday Peak Agni & High Protein Synthesis Window',
        startHour: 11.5,
        endHour: 14.5,
        emoji: '🍣',
        dishName: 'Wild Alaskan Salmon with Turmeric-Ginger Infusion',
        targetDishId: 'menu-2',
        status: 'Optimal',
        metabolicRationale: 'Pancreatic amylase and liver bile secretion are at maximal circadian capacity. Ideal for dense protein & EPA/DHA anti-inflammatory resolution.',
        ramsAxiom: 'Good design is honest — Synchronizes nutrient absorption with liver metabolic capacity.'
      };
    }

    if (h >= 15.0 && h <= 17.0) {
      return {
        id: 'w-3',
        name: 'Afternoon Slump & Gastric Motility Thermogenic Window',
        startHour: 15.0,
        endHour: 17.0,
        emoji: '🫖',
        dishName: 'Gingerol-Rich Lemongrass & Raw Manuka Decoction',
        targetDishId: 'menu-3',
        status: 'Optimal',
        metabolicRationale: 'Stimulates vagal nerve tone, accelerates gastric emptying, and ignites thermogenesis without caffeine-induced adrenal fatigue.',
        ramsAxiom: 'Good design is thorough — Precision temperature (65°C) preserves gingerol bio-activity.'
      };
    }

    if (h >= 18.0 && h <= 19.5) {
      return {
        id: 'w-4',
        name: 'Evening Pre-Fast & GABA/Melatonin Priming Window',
        startHour: 18.0,
        endHour: 19.5,
        emoji: '🫐',
        dishName: 'Wild Blueberry & Organic Ashwagandha Compote',
        targetDishId: 'menu-4',
        status: 'Optimal',
        metabolicRationale: 'Anthocyanins + Withanolides cross the blood-brain barrier to lower evening cortisol, elevate GABA, and prime pineal melatonin secretion.',
        ramsAxiom: 'Good design is unobtrusive — Soft polyphenols prepare the central nervous system for restorative sleep.'
      };
    }

    if (h > 19.5 || h < 7.0) {
      return {
        id: 'w-fast',
        name: 'Overnight Autophagy & BMAL1 Peripheral Clock Fasting Window',
        startHour: 20.0,
        endHour: 7.0,
        emoji: '⛔',
        dishName: 'Water & Herbal Rest Only',
        targetDishId: 'none',
        status: 'Fasting Mandatory',
        metabolicRationale: 'Peripheral insulin sensitivity drops by 34% after dark due to BMAL1 expression. Caloric intake now triggers hepatic lipid accumulation. Fasting is clinically indicated.',
        ramsAxiom: 'As little design as possible — Absolute metabolic rest allows AMPK-mediated cellular autophagy.'
      };
    }

    return {
      id: 'w-sub',
      name: 'Transition Window',
      startHour: h,
      endHour: h + 1,
      emoji: '🍵',
      dishName: 'Light Warm Hydration',
      targetDishId: 'menu-3',
      status: 'Suboptimal',
      metabolicRationale: 'Outside peak metabolic windows. Hydration or light thermal teas recommended.',
      ramsAxiom: 'Less, but better — Avoid unnecessary snacking between primary circadian meals.'
    };
  });
}
