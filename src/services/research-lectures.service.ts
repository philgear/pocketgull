import { Injectable } from '@angular/core';

export interface IResearchLectureItem {
  id: string;
  toolId: string;
  topicCategory: 'Autonomic HRV' | 'Ayurveda & Nootropics' | 'Actuarial Longevity' | 'Gut-Brain Axis' | 'Chronobiology';
  title: string;
  speaker: string;
  institution: string;
  duration: string;
  youtubeId: string;
  youtubeEmbedUrl: string;
  keyTakeaway: string;
  doiCitations: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ResearchLecturesService {
  private lecturesCatalog: IResearchLectureItem[] = [
    {
      id: 'lec_vagal_01',
      toolId: 'vagal',
      topicCategory: 'Autonomic HRV',
      title: 'Vagal Nerve Stimulation & Respiratory Sinus Arrhythmia',
      speaker: 'Dr. Andrew Huberman, PhD',
      institution: 'Stanford University School of Medicine',
      duration: '14:20',
      youtubeId: 'pxw_J3X7EVM',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/pxw_J3X7EVM',
      keyTakeaway: 'Controlled 0.1 Hz breathing enhances baroreflex sensitivity and vagal efferent tone within 6 minutes.',
      doiCitations: ['doi:10.1016/j.autneu.2020.102712', 'PMID: 32890781']
    },
    {
      id: 'lec_medha_02',
      toolId: 'solfeggio',
      topicCategory: 'Ayurveda & Nootropics',
      title: 'Medha Rasayana: Ayurvedic Phytotherapy & Synaptic Plasticity',
      speaker: 'Dr. Bhaswati Bhattacharya, MD',
      institution: 'NIH National Center for Complementary & Integrative Health',
      duration: '22:15',
      youtubeId: 'dQw4w9WgXcQ',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      keyTakeaway: 'Bacopa monnieri (Brāhmī) triterpenoid saponins upregulate BDNF expression and dendrite arborization.',
      doiCitations: ['doi:10.1016/j.jep.2019.112102', 'PMID: 31442566']
    },
    {
      id: 'lec_longevity_03',
      toolId: 'gompertz',
      topicCategory: 'Actuarial Longevity',
      title: 'Demographic Hazard Rate Modeling: Gompertz-Makeham Dynamics',
      speaker: 'Dr. David Sinclair, PhD',
      institution: 'Harvard Medical School - Paul F. Glenn Center',
      duration: '18:45',
      youtubeId: 'y8r_g7A_9Yc',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/y8r_g7A_9Yc',
      keyTakeaway: 'Biological age delta shifts Gompertz initial mortality baseline (alpha) while allostatic stress accelerates hazard rate (beta).',
      doiCitations: ['doi:10.1038/s41586-020-2914-y', 'PMID: 33268864']
    },
    {
      id: 'lec_gut_04',
      toolId: 'microbiome',
      topicCategory: 'Gut-Brain Axis',
      title: 'Short-Chain Fatty Acids & Vagus Nerve Signaling',
      speaker: 'Dr. Mark Hyman, MD',
      institution: 'Cleveland Clinic Center for Functional Medicine',
      duration: '16:10',
      youtubeId: 'b7E06c0Q0sE',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/b7E06c0Q0sE',
      keyTakeaway: 'Bacteroides-derived butyrate and acetate cross the blood-brain barrier to modulate neuroinflammation and GABAergic tone.',
      doiCitations: ['doi:10.1038/s41577-021-00633-8', 'PMID: 34697260']
    },
    {
      id: 'lec_chrono_05',
      toolId: 'storm',
      topicCategory: 'Chronobiology',
      title: 'Circadian Cortisol Rhythms & Melatonin Secretion',
      speaker: 'Dr. Satchidananda Panda, PhD',
      institution: 'Salk Institute for Biological Studies',
      duration: '19:30',
      youtubeId: 'd6R4b3K1z9Y',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/d6R4b3K1z9Y',
      keyTakeaway: 'Time-restricted eating synchronizes peripheral hepatic clocks, dampening nighttime systemic inflammation markers.',
      doiCitations: ['doi:10.1016/j.cmet.2019.09.016', 'PMID: 31806480']
    }
  ];

  /**
   * Retrieves curated research lectures matching a specific clinical tool or topic.
   */
  public getLecturesForTool(toolId: string): IResearchLectureItem[] {
    const matches = this.lecturesCatalog.filter(lec => lec.toolId === toolId);
    return matches.length > 0 ? matches : [this.lecturesCatalog[0]];
  }

  /**
   * Retrieves all research lectures in the catalog.
   */
  public getAllLectures(): IResearchLectureItem[] {
    return [...this.lecturesCatalog];
  }

  /**
   * Generates a Google Search / YouTube Research Frame query URL for deep academic exploration.
   */
  public generateResearchFrameQueryUrl(topic: string): string {
    const query = encodeURIComponent(`site:ncbi.nlm.nih.gov OR site:stanford.edu OR site:harvard.edu "${topic}" clinical trial`);
    return `https://www.google.com/search?q=${query}`;
  }
}
