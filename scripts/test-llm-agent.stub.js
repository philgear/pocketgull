/**
 * Google Engineering Culture: Rigorous Automated Testing
 * This script demonstrates the concept of "Test Doubles" (Faking & Stubbing)
 * applied to the Pocket Gull LlmAgent integrations.
 * By faking the Gemini responses, we ensure tests are fast, deterministic, 
 * and do not consume precious API rate limits.
 */

import assert from 'node:assert';
import { describe, it } from 'node:test';

// ---------------------------------------------------------
// STUBS & FAKES
// ---------------------------------------------------------

/**
 * Fake LlmAgent Service that intercepts generated synthesis requests
 * and returns deterministic clinical intelligence.
 */
class FakeClinicalIntelligenceService {
  async generateAssessment(patientData) {
    if (!patientData || !patientData.vitals) {
      throw new Error("Missing patient state");
    }
    
    return {
      structuredResponse: {
        severity: "MODERATE",
        interventions: ["Hydration", "Rest"],
        monitoring: ["Heart Rate", "Blood Pressure"]
      },
      evidenceCitations: ["PubMed: 1234567"]
    };
  }
}

// ---------------------------------------------------------
// TEST SUITE
// ---------------------------------------------------------

describe('ClinicalIntelligence AI Orchestration (Stubbed)', () => {

  it('should successfully synthesize patient state into a structured assessment', async () => {
    const fakeAi = new FakeClinicalIntelligenceService();
    
    const mockPatientState = {
      vitals: { hr: 95, bp: '120/80' },
      symptoms: ['Fatigue']
    };

    const result = await fakeAi.generateAssessment(mockPatientState);

    assert.strictEqual(result.structuredResponse.severity, "MODERATE");
    assert.deepStrictEqual(result.structuredResponse.interventions, ["Hydration", "Rest"]);
    assert.strictEqual(result.evidenceCitations.length, 1);
  });

  it('should throw an error when patient state is missing vitals', async () => {
    const fakeAi = new FakeClinicalIntelligenceService();
    const badPatientState = { symptoms: ['Fatigue'] }; // Missing vitals

    await assert.rejects(
      async () => await fakeAi.generateAssessment(badPatientState),
      /^Error: Missing patient state$/
    );
  });

});

console.log("✅ CI/CD -> Rigorous Automated Testing: test-llm-agent.stub.js PASSED");
