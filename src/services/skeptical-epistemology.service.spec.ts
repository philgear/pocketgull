import { describe, it, expect } from 'vitest';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';

describe('SkepticalEpistemologyService', () => {
  const service = new SkepticalEpistemologyService();

  it('1. Evaluates Popperian falsifiability and null-hypothesis (H0) p-values', () => {
    const evalResult = service.evaluateFalsifiability('Vagal Heart Rate Deceleration', 62, 72, 25);

    expect(evalResult.metricName).toBe('Vagal Heart Rate Deceleration');
    expect(evalResult.pValue).toBeLessThan(0.05);
    expect(evalResult.isFalsified).toBe(true);
    expect(evalResult.epistemicConfidencePercent).toBeGreaterThan(90);
    expect(evalResult.skepticalWarningNotice).toBeNull();
  });

  it('2. Flags high p-value observations with explicit Skeptical Guardrail notices', () => {
    const evalResult = service.evaluateFalsifiability('Quantum Coherence Frequency', 72.1, 72.0, 5);

    expect(evalResult.pValue).toBeGreaterThan(0.05);
    expect(evalResult.isFalsified).toBe(false);
    expect(evalResult.skepticalWarningNotice).toContain('Null hypothesis H0 cannot be rejected');
  });

  it('3. Generates Cochrane Risk of Bias (RoB 2) academic assessments', () => {
    const biasReport = service.evaluateCochraneRiskOfBias('cit_vagal_rsa_2023');

    expect(biasReport.citationId).toBe('cit_vagal_rsa_2023');
    expect(biasReport.overallRiskOfBias).toBe('Some Concerns');
    expect(biasReport.skepticalSummary).toContain('moderate risk of bias');
  });
});
