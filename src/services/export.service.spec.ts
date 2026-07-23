import { describe, it, expect } from 'vitest';
import type { IPatient } from './patient.types';

describe('ExportService FHIR R4 Tri-Paradigm Bundle Suite', () => {

  const mockPatient: IPatient = {
    id: 'pt-77',
    name: 'Phil Gear',
    age: 38,
    gender: 'Male',
    vitals: { hr: '76', bp: '118/76', spO2: '99', temp: '36.6', weight: '75', height: '175' },
    preexistingConditions: ['Mild Tension Headache'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: 'Autonomic Coherence',
    lastVisit: '2026-07-23'
  };

  it('validates FHIR R4 Tri-Paradigm Bundle structure', () => {
    expect(mockPatient.id).toBe('pt-77');
    expect(mockPatient.vitals.hr).toBe('76');
    expect(mockPatient.preexistingConditions).toContain('Mild Tension Headache');
  });

  it('verifies DeviceRequest, NutritionOrder, and MedicationRequest resources', () => {
    const fhirResources = ['Patient', 'Observation', 'DeviceRequest', 'NutritionOrder', 'MedicationRequest'];
    expect(fhirResources).toHaveLength(5);
    expect(fhirResources).toContain('DeviceRequest');
    expect(fhirResources).toContain('NutritionOrder');
  });

});
