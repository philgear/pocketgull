import { describe, it, expect, beforeEach } from 'vitest';
import { ExportService } from '../src/services/export.service';

describe('Enterprise Feature Suite Tests', () => {
  let exportService: ExportService;

  beforeEach(() => {
    exportService = new ExportService();
  });

  it('should correctly format FHIR R4 bundle data payload', () => {
    const patientData = {
      id: 'p001',
      name: 'Test Patient',
      issues: {
        'head': [{ id: 'head', noteId: 'n1', name: 'Migraine Pain', painLevel: 8, description: 'Acute cranial pressure', symptoms: [] }]
      }
    };

    const bundle = exportService.buildFhirR4Bundle(patientData);
    expect(bundle).toBeDefined();
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBeGreaterThan(0);
    expect(bundle.entry[0].resource.resourceType).toBe('Patient');
  });

  it('should sanitize HTML before PDF generation', () => {
    const rawHtml = '<script>alert("XSS")</script><h3>Patient Care Plan</h3>';
    const sanitized = exportService.sanitizeForExport(rawHtml);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Patient Care Plan');
  });
});
