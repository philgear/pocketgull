import { Injectable, signal, computed } from '@angular/core';

export interface TourStep {
  targetId: string;
  title: string;
  body: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-body-chart',
    title: 'Every journey starts with the body.',
    body: 'I\'ve soared over many clinics. The first thing I always check: where does it hurt? Tap any region on this anatomical chart to focus our intelligence on a specific system.',
    position: 'right',
  },
  {
    targetId: 'tour-patient-dropdown',
    title: 'Meet your patient.',
    body: 'The patient\'s full story lives here — history, vitals, prior visits. Today we\'re following Sarah Jenkins. You can switch patients, or add a new one, any time.',
    position: 'bottom',
  },
  {
    targetId: 'tour-intake-form',
    title: 'The intake is where the story begins.',
    body: 'Review or edit the patient\'s chief complaint, vitals, and conditions here. Our intelligence engine analyzes every detail in this form to generate personalized, context-aware clinical recommendations.',
    position: 'left',
  },
  {
    targetId: 'tour-generate-btn',
    title: 'One tap. Five lenses. A complete care plan.',
    body: 'When you\'re ready, press this button. Gemini synthesizes Sarah\'s full chart into a structured, multi-lens care plan — protocols, nutrition, monitoring, education, and more. Watch it stream in live.',
    position: 'bottom',
  },
  {
    targetId: 'tour-lens-tabs',
    title: 'See the plan from every angle.',
    body: 'Each tab is a different clinical lens: Overview, Interventions, Nutrition, Monitoring, Patient Education. The AI crafts each one independently. Explore freely.',
    position: 'bottom',
  },
  {
    targetId: 'tour-report-node',
    title: 'Drill deeper into the analysis.',
    body: 'Every line of the plan is alive. Hover over any recommendation to open Evidence Focus — an inline AI assistant that lets you drill deeper into any single claim, cite medical studies, or explain the rationale.',
    position: 'left',
  },
  {
    targetId: 'tour-finalize-btn',
    title: 'When you\'re satisfied — commit it.',
    body: 'Archive the finalized plan to the patient chart. You can also adjust the reading level for the patient copy: simplified, dyslexia-friendly, or pediatric. That\'s the full flight path. Welcome aboard.',
    position: 'bottom',
  },
];

const TOUR_SEEN_KEY = 'pg_tour_seen';

@Injectable({ providedIn: 'root' })
export class WalkthroughTourService {
  /** -1 = inactive, 0..N = active step index */
  currentStep = signal<number>(-1);
  isActive = computed(() => this.currentStep() >= 0);
  totalSteps = TOUR_STEPS.length;

  start() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(TOUR_SEEN_KEY)) return;
    this.currentStep.set(0);
  }

  /** Force-start regardless of seen status (e.g. from a help button) */
  forceStart() {
    this.currentStep.set(0);
  }

  next() {
    const step = this.currentStep();
    if (step < 0) return;
    if (step >= TOUR_STEPS.length - 1) {
      this.dismiss();
    } else {
      this.currentStep.set(step + 1);
    }
  }

  prev() {
    const step = this.currentStep();
    if (step > 0) this.currentStep.set(step - 1);
  }

  dismiss() {
    this.currentStep.set(-1);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOUR_SEEN_KEY, '1');
    }
  }
}
