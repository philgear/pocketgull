import { Injectable, signal, computed, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { PatientStateService } from './patient-state.service';

export interface ITourStep {
  targetId: string;
  title: string;
  body: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_SEEN_KEY = 'pg_tour_seen';

@Injectable({ providedIn: 'root' })
export class WalkthroughTourService {
  private theme = inject(ThemeService);
  private state = inject(PatientStateService);

  /** -1 = inactive, 0..N = active step index */
  currentStep = signal<number>(-1);
  isActive = computed(() => this.currentStep() >= 0);

  steps = computed<ITourStep[]>(() => {
    const isSpark = this.theme.currentTheme() === 'spark';
    const list: ITourStep[] = [
      {
        targetId: 'tour-body-chart',
        title: 'Every journey starts with the body.',
        body: 'I\'ve soared over many clinics. The first thing I always check: where does it hurt? Tap any region on this anatomical chart to focus our intelligence on a specific system.',
        position: 'right',
      },
      {
        targetId: 'tour-patient-dropdown',
        title: 'Meet your patient.',
        body: 'The patient\'s story lives here (history, vitals, prior visits). Patients flagged for epidemiological/outbreak threats (Sentinels) feature high-priority amber outlines and dedicated tags to activate containment workflows.',
        position: 'bottom',
      },
      {
        targetId: 'tour-intake-form',
        title: 'The intake is where the story begins.',
        body: 'Review or edit the patient\'s chief complaint, vitals, and conditions here. Our intelligence engine analyzes every detail in this form to generate personalized, context-aware clinical recommendations.',
        position: 'left',
      }
    ];

    if (isSpark) {
      list.push({
        targetId: 'tour-avs-therapy',
        title: 'AVS Biometric Neuro-Therapy',
        body: 'In Spark mode, you have access to real-time audio-visual entrainment. Generate a clinical co-regulation protocol or adjust brainwave frequencies and respiratory pacing to guide your patient\'s autonomic state.',
        position: 'left',
      });
    }

    list.push(
      {
        targetId: 'tour-generate-btn',
        title: 'One tap. Five lenses. A complete care plan.',
        body: 'When you\'re ready, press this button. Gemini synthesizes the full chart into a structured, multi-lens care plan — protocols, nutrition, monitoring, education, and more. Watch it stream in live.',
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
        title: 'Drill deeper and refine tasks.',
        body: 'Every recommendation is alive. Hover to open Evidence Focus for inline research/verification. Double-click any care plan task to cycle its verification state (Normal -> Approved green checkmark -> Excluded red cross) for custom refinement.',
        position: 'left',
      },
      {
        targetId: 'tour-voice-assistant',
        title: 'Voice & Consult Assistant',
        body: 'Engage in real-time, bi-directional clinical chat. Ask questions, log feedback, or trigger hands-free dictation. In Demo Mode, local mock answers intercept calls to simulate full consult strategy flows.',
        position: 'left',
      },
      {
        targetId: 'tour-finalize-btn',
        title: 'When you\'re satisfied — commit it.',
        body: 'Archive the finalized plan to the patient chart. You can also adjust the reading level for the patient copy: simplified, dyslexia-friendly, or pediatric. That\'s the full flight path. Welcome aboard.',
        position: 'bottom',
      }
    );

    return list;
  });

  totalSteps = computed(() => this.steps().length);

  start() {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function' && localStorage.getItem(TOUR_SEEN_KEY)) return;
    this.currentStep.set(0);
  }

  /** Force-start regardless of seen status (e.g. from a help button) */
  forceStart() {
    this.currentStep.set(0);
  }

  next() {
    const step = this.currentStep();
    if (step < 0) return;
    
    const nextIdx = step + 1;
    const nextStep = nextIdx < this.steps().length ? this.steps()[nextIdx] : null;
    
    if (nextStep && nextStep.targetId === 'tour-voice-assistant') {
      this.state.toggleLiveAgent(true);
    } else {
      this.state.toggleLiveAgent(false);
    }

    if (step >= this.steps().length - 1) {
      this.dismiss();
    } else {
      this.currentStep.set(nextIdx);
    }
  }

  prev() {
    const step = this.currentStep();
    if (step > 0) {
      const prevIdx = step - 1;
      const prevStep = this.steps()[prevIdx];
      
      if (prevStep.targetId === 'tour-voice-assistant') {
        this.state.toggleLiveAgent(true);
      } else {
        this.state.toggleLiveAgent(false);
      }
      
      this.currentStep.set(prevIdx);
    }
  }

  dismiss() {
    this.currentStep.set(-1);
    this.state.toggleLiveAgent(false);
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(TOUR_SEEN_KEY, '1');
    }
  }
}

