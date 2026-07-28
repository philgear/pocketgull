import { describe, it, expect } from 'vitest';
import { KaggleChallengeCardComponent } from './kaggle-challenge-card.component';

describe('KaggleChallengeCardComponent', () => {
  const component = new KaggleChallengeCardComponent();

  it('1. Provides curated Kaggle and PhysioNet 2026 competition benchmarks', () => {
    const challenges = component.challenges();
    expect(challenges.length).toBe(8);

    const physioNet = challenges.find(c => c.id === 'physionet_2026');
    expect(physioNet).toBeDefined();
    expect(physioNet?.pocketGullScore).toContain('0.9943');
    expect(physioNet?.status).toBe('Gold Tier (Exceeds)');
  });

  it('2. Exposes Kaggle submission CSV exporter', () => {
    expect(typeof component.exportKaggleSubmissionCsv).toBe('function');
  });
});
