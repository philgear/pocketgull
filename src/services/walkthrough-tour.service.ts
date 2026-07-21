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
        title: 'Interactive 3D Anatomical & Dermatome Raycaster',
        body: 'Tap any region on this 3D mannequin model (Skin, Muscle, Bone, Organs, Spine & Dermatomes) or use the Search Bar to focus the camera. Selecting an organ isolates relevant telemetry and metabolic CMP lab panels without covering the mannequin.',
        position: 'right',
      },
      {
        targetId: 'tour-patient-dropdown',
        title: 'Patient Story & Sentinel Epidemiological Triage',
        body: 'The patient\'s story lives here (history, vitals, prior visits). Patients flagged for epidemiological or outbreak threats (Sentinels) feature high-priority amber outlines and dedicated tags to activate containment workflows.',
        position: 'bottom',
      },
      {
        targetId: 'tour-intake-form',
        title: 'Viewport-Contextual Organ Telemetry & CMP Labs',
        body: 'Review organ-specific metabolic lab panels (Troponin, ALT/AST, eGFR/Creatinine, Fasting Glucose) and tap one-click clinical symptom shortcuts. Our intelligence engine analyzes every detail to generate context-aware care plans.',
        position: 'right',
      }
    ];

    if (isSpark) {
      list.push({
        targetId: 'tour-avs-therapy',
        title: 'AVS Biometric Neuro-Therapy',
        body: 'In Spark mode, access real-time audio-visual entrainment. Generate a clinical co-regulation protocol or adjust brainwave frequencies and respiratory pacing to guide your patient\'s autonomic state.',
        position: 'right',
      });
    }

    list.push(
      {
        targetId: 'tour-generate-btn',
        title: 'One Tap. Multi-Lens Synthesis.',
        body: 'When ready, press this button. Gemini synthesizes the full patient chart into structured clinical lenses — protocols, nutrition, monitoring, education, and digital telemetry. Watch it stream in live.',
        position: 'bottom',
      },
      {
        targetId: 'tour-lens-tabs',
        title: 'Lens 1: Summary Overview',
        body: 'Synthesizes documented conditions, diagnostic priorities, and immediate therapeutic targets into a clear executive summary for the attending clinician.',
        position: 'bottom',
      },
      {
        targetId: 'tour-lens-tabs',
        title: 'Lens 2: Functional Protocols',
        body: 'Integrates biochemical pathway targets, bio-energetic balances (TCM Zang-Fu / Ayurvedic Doshas), and high-evidence medical interventions.',
        position: 'bottom',
      },
      {
        targetId: 'tour-lens-tabs',
        title: 'Lens 3: Therapeutic Nutrition',
        body: 'Custom anti-inflammatory, DASH, or elimination diets tailored to metabolic CMP lab markers, liver enzymes, and renal clearance limits.',
        position: 'bottom',
      },
      {
        targetId: 'tour-lens-tabs',
        title: 'Lens 4: Precision Nutrients & Botanicals',
        body: 'Targeted bioavailable micronutrients (Methylcobalamin, L-5-MTHF), adaptogens, and active botanical compounds translated into clinical dosages.',
        position: 'bottom',
      },
      {
        targetId: 'tour-lens-tabs',
        title: 'Lens 5: Biometric Monitoring & Follow-Up',
        body: 'Defines continuous BLE wearable parameters, lab re-check windows, and red-flag clinical escalation rules.',
        position: 'bottom',
      },
      {
        targetId: 'tour-lens-tabs',
        title: 'Lens 6: Patient Education Guide',
        body: 'Translates complex clinical strategies into plain-language 6th-grade patient guides with everyday analogies.',
        position: 'bottom',
      },
      {
        targetId: 'tour-report-node',
        title: 'Interactive Evidence Focus & Verification',
        body: 'Every recommendation is interactive. Hover to open Evidence Focus for inline PubMed research/verification. Double-click any task to cycle its verification state (Approved checkmark vs Excluded cross).',
        position: 'left',
      },
      {
        targetId: 'tour-voice-assistant',
        title: 'Voice & Multimodal WebRTC Consult Assistant',
        body: 'Engage in real-time, bi-directional clinical audio streaming (`AdkLiveService`). Ask questions, log feedback, or trigger hands-free voice dictation with client-side speech barge-in.',
        position: 'left',
      },
      {
        targetId: 'tour-finalize-btn',
        title: 'Global Research Export & Companion App Sync',
        body: 'Archive the finalized plan to the patient chart and FHIR R4 Bundle. Export care plans into global research languages or sync directly to the mobile app (`pocketgull_flutter`).',
        position: 'bottom',
      }
    );

    return list;
  });

  totalSteps = computed(() => this.steps().length);

  start() {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function' && localStorage.getItem(TOUR_SEEN_KEY)) return;
    this.currentStep.set(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /** Force-start regardless of seen status (e.g. from a help button) */
  forceStart() {
    this.currentStep.set(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

