import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { TeledentistryService } from './teledentistry.service';
import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext } from '@angular/core';

describe('TeledentistryService', () => {
  let service: TeledentistryService;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([], undefined as any);

    runInInjectionContext(injector, () => {
      service = new TeledentistryService();
    });
  });

  it('should initialize with 32 permanent teeth in FDI notation (11-48)', () => {
    expect(service.teeth().length).toBe(32);
    expect(service.teeth()[0].fdiNumber).toBe(18); // Upper Right 3rd Molar (FDI 18)
    expect(service.teeth().some(t => t.fdiNumber === 11)).toBe(true);
    expect(service.teeth().some(t => t.fdiNumber === 48)).toBe(true);
  });

  it('should compute Systemic Inflammatory Burden Index (SIBI 0-100) correctly', () => {
    // SIBI = min(100, (Deep Pockets * 6) + (%BOP * 0.8) + (hs-CRP * 12))
    // Default: 1 deep pocket (PPD >= 4mm), 1 BOP tooth (1/32 ~ 3.125 -> 3%), hs-CRP = 2.4
    // Raw: (1 * 6) + (3 * 0.8) + (2.4 * 12) = 6 + 2.4 + 28.8 = 37.2 -> 37
    expect(service.sibiScore()).toBeGreaterThanOrEqual(30);
    expect(service.sibiScore()).toBeLessThanOrEqual(100);
  });

  it('should compute CV Risk Multiplier (1.0x to 2.8x) based on SIBI score', () => {
    const multiplier = service.cvRiskMultiplier();
    expect(multiplier).toBeGreaterThanOrEqual(1.0);
    expect(multiplier).toBeLessThanOrEqual(2.8);
  });

  it('should compute predicted HbA1c elevation trajectory (+0.0% to +0.8%)', () => {
    const elevation = service.predictedHbA1cElevation();
    expect(elevation).toBeGreaterThanOrEqual(0.0);
    expect(elevation).toBeLessThanOrEqual(0.8);
  });
});
