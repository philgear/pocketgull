import { Router } from 'express';
import { GoogleAuth } from 'google-auth-library';
import express from 'express';

export const healthcareRouter = Router();

// Initialize Google Auth with the Healthcare API scope
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-healthcare']
});

const defaultProjectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'];
const defaultLocation = process.env['HC_LOCATION'] || 'us-west1';
const defaultDatasetId = process.env['HC_DATASET'] || 'pocket_gull_clinical';
const dicomStoreId = process.env['HC_DICOM_STORE'] || 'dicom_primary';
const fhirStoreId = process.env['HC_FHIR_STORE'] || 'fhir_primary';

/**
 * Automatically provisions the GCP Healthcare Dataset, DICOM Store, and FHIR Store.
 */
export async function ensureHealthcareStoresExist() {
  try {
    const projectId = defaultProjectId;
    if (!projectId) {
      console.warn('[Healthcare Auto-Provision] No GCP Project ID found, skipping auto-provisioning.');
      return;
    }

    console.log('[Healthcare Auto-Provision] Checking Cloud Healthcare API datasets & stores...');
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const headers = { 'Authorization': `Bearer ${token.token}`, 'Content-Type': 'application/json' };

    // 1. Create Dataset
    const datasetUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets?datasetId=${defaultDatasetId}`;
    let res = await fetch(datasetUrl, { method: 'POST', headers });
    if (res.ok) {
        console.log(`[Healthcare Auto-Provision] Created Dataset: ${defaultDatasetId}`);
    } else if (res.status !== 409) {
        console.warn(`[Healthcare Auto-Provision] Dataset creation warning. Is billing/HC API enabled?`, await res.text());
        return; // if dataset fails, the stores will fail too
    }

    // 2. Create DICOM Store
    const dicomUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/dicomStores?dicomStoreId=${dicomStoreId}`;
    res = await fetch(dicomUrl, { method: 'POST', headers });
    if (res.ok) console.log(`[Healthcare Auto-Provision] Created DICOM Store: ${dicomStoreId}`);

    // 3. Create FHIR Store (R4)
    const fhirUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores?fhirStoreId=${fhirStoreId}`;
    res = await fetch(fhirUrl, { 
        method: 'POST', 
        headers,
        body: JSON.stringify({ version: 'R4', enableUpdateCreate: true })
    });
    if (res.ok) console.log(`[Healthcare Auto-Provision] Created FHIR Store: ${fhirStoreId} (R4)`);
    
  } catch (error: any) {
    console.warn(`[Healthcare Auto-Provision Error]`, error.message);
  }
}

/**
 * POST /api/healthcare/fhir/export
 * Receives the generic PocketGull patient JSON payload and uploads it to the FHIR Store.
 */
healthcareRouter.post('/fhir/export', express.json({ limit: '50mb' }), async (req, res) => {
   try {
     const payload = req.body;
     const projectId = defaultProjectId;
     if (!projectId) return res.status(400).json({ error: 'GCP Project ID not configured.' });

     const client = await auth.getClient();
     const token = await client.getAccessToken();
     
     // Minimum viable FHIR Patient mapping
     const fhirPatient = {
         resourceType: "Patient",
         id: payload.patient_id || 'unknown',
         active: true,
         gender: payload.gender === 'M' ? 'male' : (payload.gender === 'F' ? 'female' : 'unknown')
     };

     const fhirUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Patient/${fhirPatient.id}`;
     
     const fhirRes = await fetch(fhirUrl, {
         method: 'PUT', // PUT allows upsert with 'enableUpdateCreate' on the FHIR store
         headers: {
             'Authorization': `Bearer ${token.token}`,
             'Content-Type': 'application/fhir+json;charset=utf-8'
         },
         body: JSON.stringify(fhirPatient)
     });

     if (!fhirRes.ok) {
         throw new Error(`FHIR Store Error: ${fhirRes.status} - ${await fhirRes.text()}`);
     }

     console.log(`[Healthcare FHIR] Exported Patient ${fhirPatient.id} to FHIR Store.`);
     res.json({ success: true, resource: fhirPatient });
   } catch (error: any) {
     console.error('[Healthcare FHIR Export Error]', error);
     res.status(500).json({ error: error.message });
   }
});
