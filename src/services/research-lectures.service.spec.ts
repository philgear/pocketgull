import { describe, it, expect } from 'vitest';
import { ResearchLecturesService } from './research-lectures.service';

describe('ResearchLecturesService', () => {
  const service = new ResearchLecturesService();

  it('1. Retrieves curated YouTube research lectures for a valid toolId', () => {
    const vagalLectures = service.getLecturesForTool('vagal');
    expect(vagalLectures.length).toBeGreaterThan(0);
    expect(vagalLectures[0].title).toContain('Vagal Nerve Stimulation');
    expect(vagalLectures[0].speaker).toContain('Huberman');
  });

  it('2. Returns default lecture fallback if toolId has no exact match', () => {
    const fallbackLectures = service.getLecturesForTool('unknown_tool');
    expect(fallbackLectures.length).toBe(1);
    expect(fallbackLectures[0].id).toBe('lec_vagal_01');
  });

  it('3. Generates valid Google Search / Research Frame query URL with NCBI / Stanford grounding', () => {
    const url = service.generateResearchFrameQueryUrl('Medha Rasayana');
    expect(url).toContain('https://www.google.com/search?q=');
    expect(url).toContain('site%3Ancbi.nlm.nih.gov');
    expect(url).toContain('Medha%20Rasayana');
  });
});
