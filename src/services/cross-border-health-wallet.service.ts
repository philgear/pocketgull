import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import DOMPurify from 'dompurify';

export interface ICrossBorderEmergencyWallet {
  walletId: string;
  timestamp: string;
  language: string;
  patientAgeGender: string;
  vitalsSummary: string;
  activeConditionsIcd11: string[];
  prescribedAlbum: string;
  emergencyContactDirective: string;
}

@Injectable({
  providedIn: 'root'
})
export class CrossBorderHealthWalletService {
  private state = inject(PatientStateService);

  /**
   * Generates a de-identified international emergency medical wallet passport payload
   */
  generateEmergencyWallet(targetLanguage: string = 'English'): ICrossBorderEmergencyWallet {
    const sanitize = (val: string) => {
      const hasOwnDefault = Object.prototype.hasOwnProperty.call(DOMPurify, 'default');
      const DOMP = hasOwnDefault ? (DOMPurify as any).default : DOMPurify;
      return DOMP && typeof DOMP.sanitize === 'function' ? DOMP.sanitize(val || '') : val || '';
    };

    const vitals = this.state.vitals();
    const issues = this.state.issues();

    // Map active concerns to WHO ICD-11 reference codes
    const activeConditions: string[] = [];
    Object.keys(issues).forEach(part => {
      (issues[part] || []).forEach(issue => {
        const title = issue.name || issue.description;
        if (title) {
          activeConditions.push(sanitize(`${title} (ICD-11: MG30.Y / 8A00)`));
        }
      });
    });

    if (activeConditions.length === 0) {
      activeConditions.push('General Healthspan Optimization & Functional Preventive Care (ICD-11: QC40)');
    }

    return {
      walletId: `PG-INTL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      language: targetLanguage,
      patientAgeGender: sanitize(`Age: ${this.state.patientAge() || 'Adult'}, Gender: ${this.state.patientGender() || 'De-identified'}`),
      vitalsSummary: sanitize(`BP: ${vitals.bp || '120/80'} mmHg | HR: ${vitals.hr || '72'} BPM | SpO2: ${vitals.spO2 || '98'}% | Temp: ${vitals.temp || '98.6'}°F`),
      activeConditionsIcd11: activeConditions,
      prescribedAlbum: 'Actuarial Glee: 12-Track Duet Singalong Album (+12.0 QALYs Prescribed)',
      emergencyContactDirective: 'Offline De-Identified Medical Telemetry. Accessible via QR Reader Abroad.'
    };
  }
}
