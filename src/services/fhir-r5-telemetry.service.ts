import { Injectable, signal, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface IFhirR5TelemetryPacket {
  id: string;
  topic: string;
  timestamp: string;
  heartRate: number;
  spO2: number;
  respirationRate: number;
  hrvMs: number;
  status: 'active' | 'paused' | 'alert';
  flaggedBiomarker?: string;
}

@Injectable({ providedIn: 'root' })
export class FhirR5TelemetryService {
  private patientState = inject(PatientStateService);

  private intervalId: any = null;

  /** Status signal for R5 subscription topic */
  isStreaming = signal<boolean>(false);
  
  /** Latest FHIR R5 observation packet */
  latestPacket = signal<IFhirR5TelemetryPacket | null>(null);

  /** Subscription topic URI complying with FHIR R5 SubscriptionTopic specification */
  subscriptionTopic = signal<string>('http://hl7.org/fhir/SubscriptionTopic/biometric-telemetry-stream');

  startStreaming(intervalMs = 2000): void {
    if (this.isStreaming()) return;
    this.isStreaming.set(true);

    this.intervalId = setInterval(() => {
      this.generatePacket();
    }, intervalMs);

    // Initial packet
    this.generatePacket();
  }

  stopStreaming(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isStreaming.set(false);
  }

  toggleStreaming(): void {
    if (this.isStreaming()) {
      this.stopStreaming();
    } else {
      this.startStreaming();
    }
  }

  private generatePacket(): void {
    const currentVitals = this.patientState.vitals();
    const baseHr = parseInt(String(currentVitals.hr || '72'), 10);
    const baseSpO2 = parseInt(String(currentVitals.spO2 || '98'), 10);

    // Small stochastic variance simulating continuous sensor telemetry
    const hrDelta = Math.floor(Math.random() * 5) - 2;
    const spO2Delta = Math.floor(Math.random() * 3) - 1;
    const respDelta = Math.floor(Math.random() * 3) - 1;

    const currentHr = Math.max(50, Math.min(160, baseHr + hrDelta));
    const currentSpO2 = Math.max(88, Math.min(100, baseSpO2 + spO2Delta));
    const currentResp = Math.max(8, Math.min(32, 16 + respDelta));
    const currentHrv = Math.max(15, Math.min(95, 45 + Math.floor(Math.random() * 10) - 5));

    let alertFlag: string | undefined;
    let status: 'active' | 'paused' | 'alert' = 'active';

    if (currentHr > 120 || currentHr < 55) {
      status = 'alert';
      alertFlag = `Tachycardia/Bradycardia Warning: ${currentHr} bpm`;
    } else if (currentSpO2 < 93) {
      status = 'alert';
      alertFlag = `Hypoxemia Warning: SpO2 ${currentSpO2}%`;
    }

    const packet: IFhirR5TelemetryPacket = {
      id: `r5-obs-${Date.now()}`,
      topic: this.subscriptionTopic(),
      timestamp: new Date().toISOString(),
      heartRate: currentHr,
      spO2: currentSpO2,
      respirationRate: currentResp,
      hrvMs: currentHrv,
      status,
      flaggedBiomarker: alertFlag
    };

    this.latestPacket.set(packet);

    // Update patient state vitals dynamically if streaming
    this.patientState.updateVital('hr', String(currentHr));
    this.patientState.updateVital('spO2', String(currentSpO2));
  }
}
