import { Injectable, signal } from '@angular/core';

export interface IGcpHealthcareConfig {
  projectId: string;
  location: string;
  datasetId: string;
  fhirStoreId: string;
  dicomStoreId: string;
  apiEndpoint: string;
}

@Injectable({
  providedIn: 'root'
})
export class GcpHealthcareApiService {
  readonly config = signal<IGcpHealthcareConfig>({
    projectId: 'gen-lang-client-0540208645',
    location: 'us-central1',
    datasetId: 'pocketgull-clinical-dataset',
    fhirStoreId: 'pocketgull-fhir-r4-store',
    dicomStoreId: 'pocketgull-dicom-store',
    apiEndpoint: 'https://healthcare.googleapis.com/v1'
  });

  /**
   * Generates the canonical Google Cloud Healthcare API FHIR Store REST Base URL.
   * e.g., https://healthcare.googleapis.com/v1/projects/{project}/locations/{location}/datasets/{dataset}/fhirStores/{fhirStore}/fhir
   */
  getFhirStoreBaseUrl(): string {
    const cfg = this.config();
    return `${cfg.apiEndpoint}/projects/${cfg.projectId}/locations/${cfg.location}/datasets/${cfg.datasetId}/fhirStores/${cfg.fhirStoreId}/fhir`;
  }

  /**
   * Generates the canonical Google Cloud Healthcare API DICOM Store WADO-RS Base URL.
   */
  getDicomStoreBaseUrl(): string {
    const cfg = this.config();
    return `${cfg.apiEndpoint}/projects/${cfg.projectId}/locations/${cfg.location}/datasets/${cfg.datasetId}/dicomStores/${cfg.dicomStoreId}/dicomWeb`;
  }

  /**
   * Formats a FHIR R4 resource for ingestion into GCP Cloud Healthcare API FHIR Store.
   */
  formatGcpFhirIngestPayload(resourceType: string, fhirBody: Record<string, any>): Record<string, any> {
    return {
      resourceType: resourceType,
      meta: {
        profile: [`http://hl7.org/fhir/StructureDefinition/${resourceType}`],
        source: 'https://pocketgull.app/gcp-healthcare-api',
        lastUpdated: new Date().toISOString()
      },
      ...fhirBody
    };
  }
}
