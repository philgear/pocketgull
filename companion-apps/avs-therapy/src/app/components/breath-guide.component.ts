import {
  Component, input, computed, signal,
  PLATFORM_ID, inject, OnInit, OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

type BreathPhase = 'inhale' | 'hold' | 'exhale';

/**
 * BreathGuideComponent
 *
 * Animated SVG arc ring showing the inhale/hold/exhale cycle from
 * the active IAvsProtocol. Drives shared rhythmic pacing for co-regulation.
 *
 * Usage:
 *   <app-breath-guide [showLabel]="true" [size]="180" />
 */
@Component({
  selector: 'app-breath-guide',
  standalone: true,
  template: `
    <div class="flex flex-col items-center gap-3 select-none"
         [style.width.px]="size()"
         role="timer"
         [attr.aria-label]="phaseLabel() + ' — ' + phaseCount() + 's'">

      <!-- SVG breath ring -->
      <div class="relative" [style.width.px]="size()" [style.height.px]="size()">

        <!-- Ambient outer halo -->
        <svg class="absolute inset-0 w-full h-full breath-outer-ring opacity-20"
             viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90"
                  stroke="currentColor"
                  stroke-width="1"
                  class="text-violet-400"/>
        </svg>

        <!-- Progress arc: stroke-dashoffset animates via rAF -->
        <svg class="absolute inset-0 w-full h-full -rotate-90"
             viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80"
                  stroke="url(#breathGrad)"
                  stroke-width="3.5"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="ARC_LEN"
                  [attr.stroke-dashoffset]="dashOffset()"/>
          <defs>
            <linearGradient id="breathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" [attr.stop-color]="gradStart()"/>
              <stop offset="100%" [attr.stop-color]="gradEnd()"/>
            </linearGradient>
          </defs>
        </svg>

        <!-- Inner pulsing core -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="breath-core rounded-full flex flex-col items-center justify-center"
               [style.width.px]="size() * 0.5"
               [style.height.px]="size() * 0.5"
               [class.expanding]="phase() === 'inhale'"
               [class.holding]="phase() === 'hold'"
               [class.contracting]="phase() === 'exhale'">

            <span class="text-white/70 font-bold" [style.font-size.px]="size() * 0.1">
              @if (phase() === 'inhale') { ↑ }
              @if (phase() === 'hold')   { · }
              @if (phase() === 'exhale') { ↓ }
            </span>
            <span class="text-white/90 font-bold uppercase tracking-widest"
                  [style.font-size.px]="size() * 0.065">
              {{ phaseLabel() }}
            </span>
            <span class="text-white/60 font-mono tabular-nums"
                  [style.font-size.px]="size() * 0.12">
              {{ phaseCount() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Patient message -->
      @if (showLabel() && patientMessage()) {
        <p class="text-center text-xs font-medium text-zinc-400 italic max-w-[220px] leading-relaxed">
          {{ patientMessage() }}
        </p>
      }

      <!-- Ratio display -->
      @if (showLabel()) {
        <div class="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          <span class="text-violet-400">{{ breathRatio().inhale }}s</span>
          <span class="opacity-30">·</span>
          <span class="text-indigo-400">{{ breathRatio().hold }}s</span>
          <span class="opacity-30">·</span>
          <span class="text-blue-400">{{ breathRatio().exhale }}s</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .breath-core {
      background: radial-gradient(circle at 40% 30%, #7c3aed, #4338ca);
      box-shadow: 0 0 24px rgba(109,40,217,.35), 0 0 60px rgba(99,102,241,.15);
      transition: transform .4s cubic-bezier(.4,0,.2,1), box-shadow .4s ease;
    }
    .breath-core.expanding  { transform: scale(1.09); box-shadow: 0 0 36px rgba(139,92,246,.55), 0 0 80px rgba(99,102,241,.22); }
    .breath-core.holding    { transform: scale(1.09); box-shadow: 0 0 28px rgba(99,102,241,.45), 0 0 60px rgba(99,102,241,.18); }
    .breath-core.contracting{ transform: scale(0.87); box-shadow: 0 0 12px rgba(109,40,217,.18), 0 0 28px rgba(99,102,241,.07); }

    .breath-outer-ring { animation: ambient-rotate 22s linear infinite; }
    @keyframes ambient-rotate { to { transform: rotate(360deg); } }
  `]
})
export class BreathGuideComponent implements OnInit, OnDestroy {
  readonly size      = input<number>(180);
  readonly showLabel = input<boolean>(true);

  private readonly state     = inject(PatientStateService);
  private readonly pid       = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.pid);

  // ── Geometry ───────────────────────────────────────────────────────────────
  readonly ARC_LEN = 2 * Math.PI * 80; // r = 80

  // ── Protocol-derived computed ──────────────────────────────────────────────
  readonly breathRatio = computed(() =>
    this.state.avsProtocol()?.breath_ratio ?? { inhale: 4, hold: 1, exhale: 6 }
  );

  readonly patientMessage = computed(() =>
    this.state.avsProtocol()?.patient_message ?? ''
  );

  readonly gradStart = computed<string>(() => {
    const MAP: Record<string, string> = {
      violet: '#8b5cf6', blue: '#3b82f6',
      emerald: '#10b981', amber: '#f59e0b', 'rose-earth': '#e11d48',
    };
    return MAP[this.state.avsProtocol()?.color_palette ?? 'violet'] ?? '#8b5cf6';
  });

  readonly gradEnd = computed<string>(() => {
    const MAP: Record<string, string> = {
      violet: '#6366f1', blue: '#6366f1',
      emerald: '#6366f1', amber: '#ef4444', 'rose-earth': '#7c3aed',
    };
    return MAP[this.state.avsProtocol()?.color_palette ?? 'violet'] ?? '#6366f1';
  });

  // ── Live breath state (plain signals, mutated from rAF loop) ──────────────
  readonly phase      = signal<BreathPhase>('inhale');
  readonly phaseCount = signal<number>(4);
  readonly dashOffset = signal<number>(0);

  readonly phaseLabel = computed<string>(() => {
    const p = this.phase();
    if (p === 'inhale') return 'Inhale';
    if (p === 'hold')   return 'Hold';
    return 'Exhale';
  });

  // ── rAF state ─────────────────────────────────────────────────────────────
  private rafId: number | null = null;
  private phaseStartTime = 0;
  private phaseIdx = 0;
  private readonly PHASES: BreathPhase[] = ['inhale', 'hold', 'exhale'];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.isBrowser) {
      this.phaseStartTime = performance.now();
      this.rafId = requestAnimationFrame(now => this.tick(now));
    }
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  // ── Animation loop ────────────────────────────────────────────────────────
  private tick(now: number): void {
    const ratio = this.breathRatio();
    const durations = [
      ratio.inhale * 1000,
      ratio.hold   * 1000,
      ratio.exhale * 1000,
    ];

    const phaseDur = durations[this.phaseIdx]!;
    const elapsed  = now - this.phaseStartTime;

    // Advance phase
    if (elapsed >= phaseDur) {
      this.phaseIdx = (this.phaseIdx + 1) % this.PHASES.length;
      this.phaseStartTime = now;
    }

    const phaseElapsed  = now - this.phaseStartTime;
    const currPhaseDur  = durations[this.phaseIdx]!;
    const phaseFrac     = Math.min(phaseElapsed / currPhaseDur, 1);
    const currentPhase  = this.PHASES[this.phaseIdx]!;

    // Arc fill: inhale → fills, hold → full, exhale → empties
    const arcFrac =
      currentPhase === 'inhale' ? phaseFrac :
      currentPhase === 'hold'   ? 1 :
      1 - phaseFrac;

    const remaining = Math.ceil((currPhaseDur - phaseElapsed) / 1000);

    this.phase.set(currentPhase);
    this.phaseCount.set(Math.max(remaining, 0));
    this.dashOffset.set(this.ARC_LEN * (1 - arcFrac));

    this.rafId = requestAnimationFrame(n => this.tick(n));
  }
}
