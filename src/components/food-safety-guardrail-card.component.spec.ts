import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FoodSafetyGuardrailCardComponent } from './food-safety-guardrail-card.component';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';

describe('FoodSafetyGuardrailCardComponent', () => {
  const createCard = (vitals = { bp: '138/88', hr: '84' }, meds: Array<{ id: string; name: string; value: string }> = [{ id: 'm1', name: 'Atorvastatin', value: '20mg' }], occupation = 'Polymath & Renaissance Scholar') => {
    const mockThemeService = {
      activeTheme: signal<'light' | 'dark'>('dark')
    };

    const mockPatientState = {
      vitals: signal(vitals),
      medications: signal(meds),
      occupation: signal(occupation)
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ActuarialLongevityService, useClass: ActuarialLongevityService }
      ]
    });

    return runInInjectionContext(injector, () => new FoodSafetyGuardrailCardComponent());
  };

  it('should create the food safety guardrail card component', () => {
    const card = createCard();
    expect(card).toBeTruthy();
  });

  it('should dynamically generate food safety rules based on patient vitals and medications', () => {
    const card = createCard({ bp: '138/88', hr: '84' }, [{ id: 'm1', name: 'Atorvastatin', value: '20mg' }], 'Polymath & Renaissance Scholar');
    const rules = card.activeRules();

    expect(rules.length).toBeGreaterThanOrEqual(3);
    expect(rules.some(r => r.id === 'cyp3a4-grapefruit')).toBe(true);
    expect(rules.some(r => r.id === 'hypertension-food')).toBe(true);
    expect(rules.some(r => r.id === 'polymath-hyper-ideation')).toBe(true);
  });
});
