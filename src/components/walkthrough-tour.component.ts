import {
  Component, ChangeDetectionStrategy, inject, signal, computed,
  effect, ViewEncapsulation, OnDestroy, NgZone, afterNextRender
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalkthroughTourService, TOUR_STEPS, TourStep } from '../services/walkthrough-tour.service';

interface Rect { top: number; left: number; width: number; height: number; }

@Component({
  selector: 'app-walkthrough-tour',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    /* ─── Tour Overlay ──────────────────────────── */
    .tour-backdrop {
      position: fixed; inset: 0; z-index: 9000;
      pointer-events: none;
    }
    .tour-backdrop.active { pointer-events: auto; }

    /* ─── SVG Spotlight ──────────────────────────── */
    .tour-svg {
      position: fixed; inset: 0;
      width: 100dvw; height: 100dvh;
      overflow: visible; pointer-events: none;
      z-index: 9001;
    }
    .tour-mask-bg {
      fill: rgba(0, 0, 0, 0.72);
      transition: d 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tour-spotlight {
      fill: transparent;
      rx: 12;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ─── Tooltip Card ────────────────────────────── */
    .tour-card {
      position: fixed; z-index: 9100;
      width: 320px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06);
      overflow: hidden;
      animation: tour-card-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    .dark .tour-card {
      background: #18181b;
      box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
    }
    @keyframes tour-card-in {
      from { opacity: 0; transform: scale(0.88) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* ─── Seagull Header ──────────────────────────── */
    .tour-gull-header {
      background: linear-gradient(135deg, #1C1C1C 0%, #2d2d2d 100%);
      padding: 20px 20px 14px;
      position: relative;
      overflow: hidden;
    }
    .tour-gull-header::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 80% 50%, rgba(104,159,56,0.15) 0%, transparent 60%);
    }
    .tour-gull-row {
      display: flex; align-items: flex-end; gap: 12px;
      position: relative; z-index: 1;
    }
    .tour-gull-svg {
      flex-shrink: 0; width: 52px; height: 52px;
      filter: drop-shadow(0 4px 12px rgba(104,159,56,0.3));
      animation: gull-float 3s ease-in-out infinite;
    }
    @keyframes gull-float {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50%       { transform: translateY(-4px) rotate(1deg); }
    }
    .tour-gull-name {
      font-size: 8px; font-weight: 800; letter-spacing: 0.18em;
      text-transform: uppercase; color: rgba(255,255,255,0.4);
      margin-bottom: 2px;
    }
    .tour-step-title {
      font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.3;
    }

    /* ─── Progress Dots ───────────────────────────── */
    .tour-dots {
      position: absolute; bottom: 14px; right: 18px;
      display: flex; gap: 5px; align-items: center; z-index: 1;
    }
    .tour-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      transition: all 0.25s;
    }
    .tour-dot.active {
      background: #8bc34a;
      width: 14px;
      border-radius: 3px;
    }

    /* ─── Body ───────────────────────────────────────*/
    .tour-body {
      padding: 16px 20px 20px;
    }
    .tour-body-text {
      font-size: 13px; line-height: 1.65;
      color: #374151;
    }
    .dark .tour-body-text { color: #d4d4d8; }

    /* ─── Actions ────────────────────────────────── */
    .tour-actions {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px 18px;
    }
    .tour-btn-ghost {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; color: #9CA3AF;
      background: none; border: none; cursor: pointer; padding: 4px 0;
      transition: color 0.15s;
    }
    .tour-btn-ghost:hover { color: #374151; }
    .dark .tour-btn-ghost:hover { color: #e4e4e7; }

    .tour-btn-row { display: flex; gap: 8px; }
    .tour-btn-prev {
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #6B7280;
      background: #F3F4F6; border: none; border-radius: 8px;
      padding: 8px 14px; cursor: pointer; transition: all 0.15s;
    }
    .tour-btn-prev:hover { background: #E5E7EB; color: #374151; }
    .dark .tour-btn-prev { background: #27272a; color: #a1a1aa; }
    .dark .tour-btn-prev:hover { background: #3f3f46; color: #e4e4e7; }

    .tour-btn-next {
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #ffffff;
      background: #1C1C1C; border: none; border-radius: 8px;
      padding: 8px 16px; cursor: pointer; transition: all 0.15s;
      display: flex; align-items: center; gap: 5px;
    }
    .tour-btn-next:hover { background: #333; }
    .tour-btn-next--finish { background: #416B1F; }
    .tour-btn-next--finish:hover { background: #4e7d25; }

    /* ─── Spotlight ring ──────────────────────────── */
    .tour-ring {
      position: fixed; border-radius: 14px;
      border: 2px solid rgba(104,159,56,0.7);
      box-shadow: 0 0 0 4px rgba(104,159,56,0.12);
      pointer-events: none; z-index: 9050;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      animation: ring-pulse 2.5s ease-in-out infinite;
    }
    @keyframes ring-pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(104,159,56,0.12); }
      50%       { box-shadow: 0 0 0 8px rgba(104,159,56,0.06); }
    }
  `],
  template: `
    @if (tour.isActive()) {
      <!-- Dark overlay -->
      <div class="tour-backdrop active" (click)="onBackdropClick($event)" role="presentation">
        <!-- Spotlight ring around target -->
        @if (rect()) {
          <div class="tour-ring" [style.top.px]="rect()!.top - 6" [style.left.px]="rect()!.left - 6"
               [style.width.px]="rect()!.width + 12" [style.height.px]="rect()!.height + 12">
          </div>
          <!-- SVG mask: full-screen dark rect with cutout -->
          <svg class="tour-svg" aria-hidden="true">
            <defs>
              <mask id="tour-cutout">
                <rect width="100%" height="100%" fill="white"></rect>
                <rect [attr.x]="rect()!.left - 8" [attr.y]="rect()!.top - 8"
                      [attr.width]="rect()!.width + 16" [attr.height]="rect()!.height + 16"
                      rx="14" ry="14" fill="black">
                </rect>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#tour-cutout)"></rect>
          </svg>
        } @else {
          <!-- No target: full dark overlay -->
          <svg class="tour-svg" aria-hidden="true">
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)"></rect>
          </svg>
        }
      </div>

      <!-- Tooltip card -->
      @if (stepDef()) {
        <div class="tour-card" role="dialog" aria-modal="false" [attr.aria-label]="stepDef()!.title"
             [ngStyle]="cardStyle()" (click)="$event.stopPropagation()">

          <!-- Seagull header -->
          <div class="tour-gull-header">
            <div class="tour-gull-row">
              <!-- Origami Seagull SVG (matches splash screen) -->
              <svg class="tour-gull-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,40 65,15 58,45" fill="#d0d0d0" stroke="#b0b0b0" stroke-width="0.5" stroke-linejoin="round"/>
                <polygon points="20,50 50,40 10,35" fill="#e0e0e0" stroke="#d0d0d0" stroke-width="0.5" stroke-linejoin="round"/>
                <polygon points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f4" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round"/>
                <polygon points="50,40 58,45 35,85" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round"/>
                <polygon points="50,40 35,85 20,50" fill="#f9f9f9" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round"/>
                <polygon points="75,55 58,45 85,38" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round"/>
                <polygon points="85,38 82,45 95,34" fill="#ff4500" stroke="#df3d00" stroke-width="0.5" stroke-linejoin="round"/>
              </svg>
              <div>
                <div class="tour-gull-name">Pocket Gull · Your Guide</div>
                <div class="tour-step-title">{{ stepDef()!.title }}</div>
              </div>
            </div>
            <!-- Progress dots -->
            <div class="tour-dots">
              @for (s of stepsArray; track $index) {
                <div class="tour-dot" [class.active]="$index === tour.currentStep()"></div>
              }
            </div>
          </div>

          <!-- Body -->
          <div class="tour-body">
            <p class="tour-body-text">{{ stepDef()!.body }}</p>
          </div>

          <!-- Actions -->
          <div class="tour-actions">
            <button class="tour-btn-ghost" (click)="tour.dismiss()">Skip Tour</button>
            <div class="tour-btn-row">
              @if (tour.currentStep() > 0) {
                <button class="tour-btn-prev" (click)="tour.prev()">← Back</button>
              }
              <button class="tour-btn-next" [class.tour-btn-next--finish]="isLastStep()"
                      (click)="tour.next()">
                @if (isLastStep()) { Let's go! 🐦 } @else { Next → }
              </button>
            </div>
          </div>
        </div>
      }
    }
  `
})
export class WalkthroughTourComponent implements OnDestroy {
  protected tour = inject(WalkthroughTourService);

  rect = signal<Rect | null>(null);
  stepsArray = TOUR_STEPS;

  stepDef = computed<TourStep | null>(() => {
    const idx = this.tour.currentStep();
    return idx >= 0 && idx < TOUR_STEPS.length ? TOUR_STEPS[idx] : null;
  });

  isLastStep = computed(() => this.tour.currentStep() === TOUR_STEPS.length - 1);

  private _resizeObs: ResizeObserver | null = null;
  private _rafId = 0;

  constructor() {
    // Update rect whenever step changes
    effect(() => {
      const def = this.stepDef();
      if (def) {
        this._updateRect(def.targetId);
      } else {
        this.rect.set(null);
      }
    });

    // Keyboard escape support
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this._onKey);
    }
  }

  private _onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.tour.isActive()) this.tour.dismiss();
  };

  private _updateRect(targetId: string) {
    // Defer one frame so newly-rendered elements are in DOM
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(this._rafId);
      this._rafId = requestAnimationFrame(() => {
        const el = document.getElementById(targetId);
        if (!el) { this.rect.set(null); return; }
        const r = el.getBoundingClientRect();
        this.rect.set({ top: r.top, left: r.left, width: r.width, height: r.height });
      });
    }
  }

  /** Position the card relative to the spotlight */
  cardStyle = computed(() => {
    const r = this.rect();
    const def = this.stepDef();
    const PAD = 20;
    const CARD_W = 320;
    const CARD_H = 240; // estimated

    if (!r || !def) {
      // Centre-screen fallback
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    let top: number, left: number;

    switch (def.position) {
      case 'bottom':
        top = r.top + r.height + PAD;
        left = Math.max(PAD, Math.min(r.left + r.width / 2 - CARD_W / 2, vw - CARD_W - PAD));
        break;
      case 'top':
        top = r.top - CARD_H - PAD;
        left = Math.max(PAD, Math.min(r.left + r.width / 2 - CARD_W / 2, vw - CARD_W - PAD));
        break;
      case 'left':
        top = Math.max(PAD, Math.min(r.top + r.height / 2 - CARD_H / 2, vh - CARD_H - PAD));
        left = r.left - CARD_W - PAD;
        break;
      case 'right':
      default:
        top = Math.max(PAD, Math.min(r.top + r.height / 2 - CARD_H / 2, vh - CARD_H - PAD));
        left = r.left + r.width + PAD;
        break;
    }

    // Clamp to viewport
    top = Math.max(PAD, Math.min(top, vh - CARD_H - PAD));
    left = Math.max(PAD, Math.min(left, vw - CARD_W - PAD));

    return { top: `${top}px`, left: `${left}px` };
  });

  onBackdropClick(e: MouseEvent) {
    // Only dismiss if clicking on actual dark area (not the card)
    if ((e.target as HTMLElement).classList.contains('tour-backdrop')) {
      this.tour.dismiss();
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this._onKey);
    }
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(this._rafId);
    }
  }
}
