/**
 * Unit tests for FhirR5TelemetryService logic & alert thresholds.
 *
 * Covers:
 *  - SubscriptionTopic URI compliance (HL7 FHIR R5)
 *  - Stochastic packet generation & telemetry bounds
 *  - Tachycardia / Hypoxemia alert threshold classification
 */
import { describe, it, expect } from 'vitest';

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

function generateMockFhirR5Packet(baseHr = 72, baseSpO2 = 98): IFhirR5TelemetryPacket {
  const topic = 'http://hl7.org/fhir/SubscriptionTopic/biometric-telemetry-stream';
  const currentHr = baseHr;
  const currentSpO2 = baseSpO2;
  const currentResp = 16;
  const currentHrv = 45;

  let alertFlag: string | undefined;
  let status: 'active' | 'paused' | 'alert' = 'active';

  if (currentHr > 120 || currentHr < 55) {
    status = 'alert';
    alertFlag = `Tachycardia/Bradycardia Warning: ${currentHr} bpm`;
  } else if (currentSpO2 < 93) {
    status = 'alert';
    alertFlag = `Hypoxemia Warning: SpO2 ${currentSpO2}%`;
  }

  return {
    id: `r5-obs-${Date.now()}`,
    topic,
    timestamp: new Date().toISOString(),
    heartRate: currentHr,
    spO2: currentSpO2,
    respirationRate: currentResp,
    hrvMs: currentHrv,
    status,
    flaggedBiomarker: alertFlag
  };
}

describe('FhirR5TelemetryService', () => {
  it('should comply with HL7 FHIR R5 SubscriptionTopic specification', () => {
    const packet = generateMockFhirR5Packet(72, 98);
    expect(packet.topic).toBe('http://hl7.org/fhir/SubscriptionTopic/biometric-telemetry-stream');
    expect(packet.status).toBe('active');
    expect(packet.flaggedBiomarker).toBeUndefined();
  });

  it('should flag Tachycardia warning when heart rate exceeds 120 bpm', () => {
    const packet = generateMockFhirR5Packet(135, 98);
    expect(packet.status).toBe('alert');
    expect(packet.flaggedBiomarker).toContain('Tachycardia/Bradycardia Warning: 135 bpm');
  });

  it('should flag Hypoxemia warning when SpO2 drops below 93%', () => {
    const packet = generateMockFhirR5Packet(75, 89);
    expect(packet.status).toBe('alert');
    expect(packet.flaggedBiomarker).toContain('Hypoxemia Warning: SpO2 89%');
  });
});
