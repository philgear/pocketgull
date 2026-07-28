import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { PeriodontalSystemicBridgeService } from './periodontal-systemic-bridge.service';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from './patient-state.service';

describe('PeriodontalSystemicBridgeService', () => {
  let service: PeriodontalSystemicBridgeService;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', spO2: '98%' })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      service = new PeriodontalSystemicBridgeService();
    });
  });

  it('should calculate Systemic Inflammatory Burden Index (SIBI) score correctly', () => {
    expect(service).toBeTruthy();
    expect(service.sibiScore()).toBeGreaterThan(0);
    expect(service.systemicRiskAnalysis().cardiovascularRiskMultiplier).toBeGreaterThanOrEqual(1.0);
  });

  it('should elevate cardiovascular risk multiplier and endothelial dysfunction grade when deep pockets and hs-CRP increase', () => {
    service.deepPocketSites.set(7);
    service.hsCrpMgL.set(3.5);

    const analysis = service.systemicRiskAnalysis();
    expect(analysis.endothelialDysfunctionGrade).toBe('Critical');
    expect(analysis.cardiovascularRiskMultiplier).toBe(2.4);
    expect(analysis.predictedHba1cElevation).toBe(0.6);
  });
});
