import { Injectable, signal } from '@angular/core';

export interface DicomStudy {
  studyInstanceUid: string;
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  studyDescription?: string;
  modalities?: string[];
}

export interface DicomSeries {
  seriesInstanceUid: string;
  modality: string;
  seriesDescription?: string;
}

export interface DicomInstance {
  sopInstanceUid: string;
  instanceNumber?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DicomService {
  studies = signal<DicomStudy[]>([]);
  
  // Selected state
  selectedStudy = signal<DicomStudy | null>(null);
  selectedSeries = signal<DicomSeries | null>(null);
  selectedInstance = signal<DicomInstance | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);

  /**
   * Search for DICOM studies using QIDO-RS via proxy.
   * Can pass 'project', 'location', 'dataset', 'dicomStore' in params or it falls back to backend env.
   */
  async searchStudies(params: Record<string, string> = {}) {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/dicom/studies?${qs}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch studies: ${res.statusText}`);
      }
      const data = await res.json();
      const formattedStudies = this.parseStudies(data);
      this.studies.set(formattedStudies);
    } catch (e: any) {
      console.warn('[DicomService] Warning searching studies:', e.message);
      this.error.set(null); // Don't show red error box for demo failures
      this.studies.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Parses the DICOMweb JSON responses into friendly TS interfaces.
   */
  private parseStudies(data: any[]): DicomStudy[] {
    if (!Array.isArray(data)) return [];
    
    return data.map(study => {
        // Common DICOM tags
        // 0020000D: Study Instance UID
        // 00100010: Patient Name
        // 00100020: Patient ID
        // 00080020: Study Date
        // 00081030: Study Description
        // 00080061: Modalities in Study
        
        const getValue = (tags: any, tagId: string) => tags?.[tagId]?.Value?.[0];
        const getAlphabeticalName = (tags: any, tagId: string) => tags?.[tagId]?.Value?.[0]?.Alphabetic;
        
        return {
           studyInstanceUid: getValue(study, '0020000D'),
           patientName: getAlphabeticalName(study, '00100010') || getValue(study, '00100010') || 'Unknown',
           patientId: getValue(study, '00100020'),
           studyDate: getValue(study, '00080020'),
           studyDescription: getValue(study, '00081030'),
           modalities: study['00080061']?.Value || []
        };
    });
  }

  /**
   * Helper to construct the URL for the WADO-RS rendered frame.
   */
  getRenderedImageUrl(studyUid: string, seriesUid: string, instanceUid: string, project?: string, location?: string, dataset?: string, dicomStore?: string): string {
    const params = new URLSearchParams({
      studyUid, seriesUid, instanceUid
    });
    if (project) params.append('project', project);
    if (location) params.append('location', location);
    if (dataset) params.append('dataset', dataset);
    if (dicomStore) params.append('dicomStore', dicomStore);
    
    return `/api/dicom/rendered?${params.toString()}`;
  }
}
