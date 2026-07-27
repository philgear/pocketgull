import { describe, it, expect } from 'vitest';
import { GcpHealthcareApiService } from './gcp-healthcare-api.service';

describe('GcpHealthcareApiService', () => {
  const service = new GcpHealthcareApiService();

  it('1. Generates canonical GCP Cloud Healthcare API FHIR Store REST Base URL', () => {
    const fhirUrl = service.getFhirStoreBaseUrl();
    expect(fhirUrl).toContain('gen-lang-client-0540208645');
    expect(fhirUrl).toContain('us-central1');
    expect(fhirUrl).toContain('pocketgull-fhir-r4-store/fhir');
  });

  it('2. Formats FHIR payload for GCP Healthcare API ingestion', () => {
    const payload = service.formatGcpFhirIngestPayload('Observation', { id: 'obs-001', valueQuantity: { value: 72 } });
    expect(payload['resourceType']).toBe('Observation');
    expect(payload['meta']['profile'][0]).toContain('Observation');
  });
});
