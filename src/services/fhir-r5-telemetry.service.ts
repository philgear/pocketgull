import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientStateService } from './patient-state.service';

export interface IFhirR5TelemetryPacket {
  id: string;
  topic: string;
  timestamp: string;
  heartRate: number;
  spO2: number;
  respirationRate: number;
  hrvMs: number;
  eegAlphaHz?: number;
  eegBetaHz?: number;
  hdf5BufferId?: string;
  ecgWaveform?: number[];
  status: 'active' | 'paused' | 'alert';
  flaggedBiomarker?: string;
  isWebSocketConnected?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FhirR5TelemetryService {
  private patientState = inject(PatientStateService);
  private platformId = inject(PLATFORM_ID);

  private intervalId: any = null;
  private ws: WebSocket | null = null;

  /** Status signal for R5 subscription topic */
  isStreaming = signal<boolean>(false);
  
  /** WebSocket connection state: 'disconnected' | 'connecting' | 'connected' | 'fallback' */
  wsConnectionStatus = signal<'disconnected' | 'connecting' | 'connected' | 'fallback'>('disconnected');

  /** Latest FHIR R5 observation packet */
  latestPacket = signal<IFhirR5TelemetryPacket | null>(null);

  /** Subscription topic URI complying with FHIR R5 SubscriptionTopic specification */
  subscriptionTopic = signal<string>('http://hl7.org/fhir/SubscriptionTopic/biometric-telemetry-stream');

  startStreaming(intervalMs = 2000): void {
    if (this.isStreaming()) return;
    this.isStreaming.set(true);

    if (isPlatformBrowser(this.platformId)) {
      this.initWebSocketConnection();
    }

    this.intervalId = setInterval(() => {
      this.generatePacket();
    }, intervalMs);

    // Initial packet
    this.generatePacket();
  }

  stopStreaming(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isStreaming.set(false);
    this.wsConnectionStatus.set('disconnected');
  }

  toggleStreaming(): void {
    if (this.isStreaming()) {
      this.stopStreaming();
    } else {
      this.startStreaming();
    }
  }

  private initWebSocketConnection(): void {
    try {
      this.wsConnectionStatus.set('connecting');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/telemetry/ws`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[FhirR5TelemetryService] WebSocket connection established.');
        this.wsConnectionStatus.set('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const packet: IFhirR5TelemetryPacket = {
            id: raw.id || `r5-obs-${Date.now()}`,
            topic: this.subscriptionTopic(),
            timestamp: new Date().toISOString(),
            heartRate: raw.heartRate || 72,
            spO2: raw.spO2 || 98,
            respirationRate: raw.respirationRate || 16,
            hrvMs: raw.hrvMs || 55,
            eegAlphaHz: raw.eegAlphaHz || 10.5,
            eegBetaHz: raw.eegBetaHz || 18.2,
            hdf5BufferId: raw.hdf5BufferId || `hdf5_chunk_${Date.now()}`,
            ecgWaveform: raw.ecgWaveform || [0, 0.2, 0.8, -0.4, 0, 0.1],
            status: raw.status || 'active',
            flaggedBiomarker: raw.flaggedBiomarker,
            isWebSocketConnected: true
          };

          this.latestPacket.set(packet);
          this.patientState.updateVital('hr', String(packet.heartRate));
          this.patientState.updateVital('spO2', String(packet.spO2));
        } catch (e) {
          console.warn('[FhirR5TelemetryService] Invalid WS JSON payload, using fallback generator.');
        }
      };

      this.ws.onerror = () => {
        console.warn('[FhirR5TelemetryService] WebSocket error, switching to continuous HDF5 simulation mode.');
        this.wsConnectionStatus.set('fallback');
      };

      this.ws.onclose = () => {
        if (this.isStreaming()) {
          this.wsConnectionStatus.set('fallback');
        }
      };
    } catch (e) {
      this.wsConnectionStatus.set('fallback');
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
      eegAlphaHz: 10.2 + (Math.random() * 0.8 - 0.4),
      eegBetaHz: 18.0 + (Math.random() * 1.2 - 0.6),
      hdf5BufferId: `hdf5_chunk_${Date.now()}`,
      ecgWaveform: Array.from({ length: 12 }, () => Math.sin(Date.now() / 100) * 0.5),
      status,
      flaggedBiomarker: alertFlag,
      isWebSocketConnected: this.wsConnectionStatus() === 'connected'
    };

    this.latestPacket.set(packet);

    // Update patient state vitals dynamically if streaming
    this.patientState.updateVital('hr', String(currentHr));
    this.patientState.updateVital('spO2', String(currentSpO2));
  }
}
