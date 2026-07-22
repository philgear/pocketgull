import { describe, it, expect } from 'vitest';
import { ActuarialLongevityService } from '../src/services/actuarial-longevity.service';

describe('ActuarialLongevityService', () => {
  const service = new ActuarialLongevityService();

  it('should calculate biological age delta and projected QALY gains', () => {
    const vitals = { hr: '60', spO2: '99', bp: '118/76' };
    const profile = service.calculateActuarialProfile(vitals, 85, 50);

    expect(profile.biologicalAge).toBeLessThan(50);
    expect(profile.biologicalAgeDelta).toBeLessThan(0);
    expect(profile.projectedQalyGain).toBeGreaterThan(2.0);
    expect(profile.projectedLifespan).toBeGreaterThan(77.5);
  });

  it('should accurately return CDC 4-driver hazard reductions', () => {
    const profile = service.calculateActuarialProfile({}, 75, 40);
    expect(profile.hazardReductions.cardiovascular).toBe(0.62);
    expect(profile.hazardReductions.metabolic).toBe(0.55);
    expect(profile.hazardReductions.neurodegenerative).toBe(0.68);
    expect(profile.hazardReductions.oncological).toBe(0.74);
  });
});
