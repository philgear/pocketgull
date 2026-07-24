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
        targetId: 'tour-patient-dropdown',
        title: 'Step 1: Patient Chart & Sentinel Triage Selection',
        body: 'Begin the clinical loop by selecting a patient profile. Patients flagged for outbreak or epidemiological threats (Sentinels) feature high-priority amber tags and containment protocols.',
        position: 'bottom',
      },
      {
        targetId: 'tour-body-chart',
        title: 'Step 2: 3D Anatomical & Dermatome Symptom Isolation',
        body: 'Investigate the 3D anatomical model (Skin, Muscle, Bone, Visceral Organs, Dermatomes). Tapping an organ focuses the camera and filters metabolic CMP lab panels (Troponin, ALT/AST, eGFR, Fasting Glucose).',
        position: 'right',
      },
      {
        targetId: 'tour-generate-btn',
        title: 'Step 3: One-Tap Gemini Multi-Lens Synthesis',
        body: 'Click "Refresh Analysis". Google Gemini 2.5 Flash streams real-time evidence-grounded directives across Western Allopathic, TCM Zang-Fu, and Ayurvedic Vedic paradigms.',
        position: 'bottom',
      },
      {
        targetId: 'tour-lens-tabs',
        title: 'Step 4: Explore 11 Specialized Clinical Lenses',
        body: 'Navigate through Overview, Treatment Matrix, Functional Protocols, Nutrition, Precision Nutrients, Follow-up, Patient Education, Assessments, Maternal, and Longevity lenses.',
        position: 'bottom',
      },
      {
        targetId: 'tour-report-node',
        title: 'Step 5: Double-Click Prescriptions & Dual Perspective Toggle',
        body: 'Single-click tools to view guidelines; double-click to cycle state (Unassigned ➔ 💊 Prescribed ➔ 🙈 Hidden). Toggle 🌱 Plain Language / 🔬 Deep Rationale for clinician vs patient literacy.',
        position: 'left',
      },
      {
        targetId: 'tour-voice-agent-window',
        title: 'Step 6: Live Avian Agent Consult Indicator',
        body: 'The Avian Voice Consult panel is active. You can interact with personas like Gulliver (🔭) or Swoop (⚡) using full-duplex WebSocket audio streams.',
        position: 'left',
      },
      {
        targetId: 'tour-research-frame-window',
        title: 'Step 7: Literature Research Panel & Experience Suite',
        body: 'The Literature Research panel is open and draggable. Explore integrated clinical research engines across PubMed, bioRxiv preprints, TCM herbology, and Vedic Samhita studies.',
        position: 'left',
      },
      {
        targetId: 'tour-docs-trigger',
        title: 'Step 8: Interactive Medical Studies & Docs',
        body: 'Click "Docs" to view the comprehensive, integrated clinical protocol guidelines and study pages.',
        position: 'bottom',
      },
      {
        targetId: 'tour-theme-trigger',
        title: 'Step 9: High-Contrast Texture & Theme Suite',
        body: 'Configure the interface aesthetics with options like Organic Hemp, Rice Paper, Cardstock, and Dark Mode.',
        position: 'bottom',
      },
      {
        targetId: 'tour-footer-lens-navigation',
        title: 'Step 10: Footer Lens Stepper Navigation',
        body: 'Quickly switch and navigate sequentially through the 11 specialized clinical lenses using the bottom bar stepper.',
        position: 'top',
      },
      {
        targetId: 'tour-finalize-btn',
        title: 'Step 11: Patient QR Handoff & FHIR R4 Bundle Archival',
        body: 'Archive the care plan, generate HL7 FHIR R4 Bundle exports, and scan the QR code to hand off the plan to the patient\'s mobile device. Loop complete!',
        position: 'bottom',
      }
    ];

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
    
    if (nextStep && (nextStep.targetId === 'tour-voice-agent-window' || nextStep.targetId === 'tour-voice-agent-trigger')) {
      this.state.toggleLiveAgent(true);
    } else {
      this.state.toggleLiveAgent(false);
    }

    if (nextStep && (nextStep.targetId === 'tour-research-frame-window' || nextStep.targetId === 'tour-research-frame-trigger')) {
      this.state.toggleResearchFrame(true);
    } else {
      this.state.toggleResearchFrame(false);
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
      
      if (prevStep.targetId === 'tour-voice-agent-window' || prevStep.targetId === 'tour-voice-agent-trigger') {
        this.state.toggleLiveAgent(true);
      } else {
        this.state.toggleLiveAgent(false);
      }
      
      if (prevStep.targetId === 'tour-research-frame-window' || prevStep.targetId === 'tour-research-frame-trigger') {
        this.state.toggleResearchFrame(true);
      } else {
        this.state.toggleResearchFrame(false);
      }
      
      this.currentStep.set(prevIdx);
    }
  }

  dismiss() {
    this.currentStep.set(-1);
    this.state.toggleLiveAgent(false);
    this.state.toggleResearchFrame(false);
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(TOUR_SEEN_KEY, '1');
    }
  }
}
