import { Injectable, signal, computed } from '@angular/core';

export interface ITourStep {
  targetId: string;
  title: string;
  body: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: ITourStep[] = [
  {
    targetId: 'tour-patient-dropdown',
    title: 'Welcome to Pocket Gull.',
    body: 'I\'m your clinical co-pilot — built to give you the aerial view when the data gets dense. Start here: this is your patient roster. Switch patients, add new ones, or import a FHIR record at any time.',
    position: 'bottom',
  },
  {
    targetId: 'tour-body-chart',
    title: 'Every flight plan starts with a location.',
    body: 'Tap any region on the anatomical chart to focus our intelligence on a specific body system. The 3D viewer renders skeletal, muscle, and surface layers — dynamic particle intensity maps diagnostic severity in real-time.',
    position: 'right',
  },
  {
    targetId: 'tour-intake-form',
    title: 'The intake is where the story begins.',
    body: 'Review or update the patient\'s chief complaint, vitals, and active conditions here. Every field feeds directly into the AI\'s reasoning — the more context you provide, the more targeted the care plan.',
    position: 'left',
  },
  {
    targetId: 'tour-generate-btn',
    title: 'One tap. Five lenses. A complete care plan.',
    body: 'Press this button when ready. Gemini 2.5 Flash synthesizes the full patient chart into a structured, multi-lens care plan — protocols, nutrition, monitoring, patient education, and more — streamed live as it generates.',
    position: 'bottom',
  },
  {
    targetId: 'tour-lens-tabs',
    title: 'See the plan from every clinical angle.',
    body: 'Each tab is a diagnostic lens: Overview, Interventions, Nutrition, Monitoring, Patient Education. The AI crafts each independently. Switch freely — your evidence trail follows you.',
    position: 'bottom',
  },
  {
    targetId: 'tour-report-node',
    title: 'Every line of the plan is alive.',
    body: 'Hover any recommendation to reveal Evidence Focus — an inline AI assistant that drills deeper into any single claim, cites PubMed studies, or explains the clinical rationale. Double-click to bracket: Accept, Modify, or Remove.',
    position: 'left',
  },
  {
    targetId: 'tour-theme-toggle',
    title: 'Circadian UI & AVS Therapy.',
    body: 'The clinic adapts to the clock: our Circadian UI shifts the ambient palette continuously across the 24-hour cycle to offset fatigue. Click here to switch to the "Spark" theme to reveal the AVS Therapy co-regulator, featuring full Audio-Visual Stimulation protocols.',
    position: 'bottom',
  },
  {
    targetId: 'tour-finalize-btn',
    title: 'When you\'re ready — commit the plan.',
    body: 'Archive the finalized plan to the patient chart. Before printing, adjust the reading level: Standard, Dyslexia-Friendly, Pediatric, or translate into Spanish, German, French, or Mandarin. Export as a clinical PDF or a portable FHIR Bundle. That\'s the full flight path — welcome aboard. 🐦',
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
