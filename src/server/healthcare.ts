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
 * Receives the full PocketGull patient JSON payload and uploads it to the GCP Healthcare FHIR Store.
 */
healthcareRouter.post('/fhir/export', express.json({ limit: '50mb' }), async (req, res) => {
   try {
     const payload = req.body;
     const projectId = defaultProjectId;
     if (!projectId) return res.status(400).json({ error: 'GCP Project ID not configured.' });

     const client = await auth.getClient();
     const token = await client.getAccessToken();
     
     const patientId = payload.id || 'unknown';
     const fhirPatientId = `pocket-gull-${patientId}`;

     // 1. Map patient demographics to standard FHIR R4 Patient
     const fhirPatient = {
         resourceType: "Patient",
         id: fhirPatientId,
         active: true,
         name: payload.name ? [
             {
                 use: "official",
                 text: payload.name,
                 family: payload.name.split(' ').pop(),
                 given: payload.name.split(' ').slice(0, -1)
             }
         ] : undefined,
         gender: payload.gender ? (
             payload.gender === 'Male' ? 'male' : 
             payload.gender === 'Female' ? 'female' : 
             payload.gender === 'Non-binary' ? 'other' : 'unknown'
         ) : 'unknown',
         birthDate: payload.age ? `${new Date().getFullYear() - payload.age}-01-01` : undefined,
         extension: [
             {
                 url: 'http://pocketgull.app/fhir/StructureDefinition/last-visit',
                 valueString: payload.lastVisit || new Date().toISOString().split('T')[0]
             }
         ]
     };

     // 2. Map preexisting conditions to standard FHIR R4 Conditions
     const fhirConditions: any[] = [];
     if (Array.isArray(payload.preexistingConditions)) {
         payload.preexistingConditions.forEach((conditionName: string, index: number) => {
             fhirConditions.push({
                 resourceType: "Condition",
                 id: `${fhirPatientId}-cond-${index}`,
                 clinicalStatus: {
                     coding: [
                         {
                             system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                             code: "active",
                             display: "Active"
                         }
                     ]
                 },
                 verificationStatus: {
                     coding: [
                         {
                             system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                             code: "confirmed",
                             display: "Confirmed"
                         }
                     ]
                 },
                 category: [
                     {
                         coding: [
                             {
                                 system: "http://terminology.hl7.org/CodeSystem/condition-category",
                                 code: "problem-list-item",
                                 display: "Problem List Item"
                             }
                         ]
                     }
                 ],
                 code: {
                     text: conditionName
                 },
                 subject: {
                     reference: `Patient/${fhirPatientId}`
                 }
             });
         });
     }

     // 3. Map vitals to standard FHIR R4 Observations
     const fhirObservations: any[] = [];
     const vitals = payload.vitals || {};
     const lastVisitDate = payload.lastVisit ? new Date(payload.lastVisit.replace(/\./g, '-')).toISOString() : new Date().toISOString();

     const addQuantityObservation = (idSuffix: string, loinc: string, display: string, valStr: string, unit: string, code: string) => {
         if (!valStr) return;
         const numericValue = parseFloat(valStr);
         if (isNaN(numericValue)) return;

         fhirObservations.push({
             resourceType: "Observation",
             id: `${fhirPatientId}-obs-${idSuffix}`,
             status: "final",
             category: [
                 {
                     coding: [
                         {
                             system: "http://terminology.hl7.org/CodeSystem/observation-category",
                             code: "vital-signs",
                             display: "Vital Signs"
                         }
                     ]
                 }
             ],
             code: {
                 coding: [
                     {
                         system: "http://loinc.org",
                         code: loinc,
                         display: display
                     }
                 ],
                 text: display
             },
             subject: {
                 reference: `Patient/${fhirPatientId}`
             },
             effectiveDateTime: lastVisitDate,
             valueQuantity: {
                 value: numericValue,
                 unit: unit,
                 system: "http://unitsofmeasure.org",
                 code: code
             }
         });
     };

     // Map simple vital signs
     addQuantityObservation("hr", "8867-4", "Heart Rate", vitals.hr, "bpm", "/min");
     addQuantityObservation("temp", "8310-5", "Body Temperature", vitals.temp, "F", "[degF]");
     addQuantityObservation("spo2", "2708-6", "Oxygen Saturation", vitals.spO2, "%", "%");
     addQuantityObservation("weight", "29463-7", "Body Weight", vitals.weight, "lbs", "[lb_av]");
     addQuantityObservation("height", "8302-2", "Body Height", vitals.height, "in", "[in_i]");

     // Map Blood Pressure panel (Systolic + Diastolic)
     if (vitals.bp) {
         const bpParts = vitals.bp.split('/');
         if (bpParts.length === 2) {
             const sysVal = parseFloat(bpParts[0]);
             const diaVal = parseFloat(bpParts[1]);
             if (!isNaN(sysVal) && !isNaN(diaVal)) {
                 fhirObservations.push({
                     resourceType: "Observation",
                     id: `${fhirPatientId}-obs-bp`,
                     status: "final",
                     category: [
                         {
                             coding: [
                                 {
                                     system: "http://terminology.hl7.org/CodeSystem/observation-category",
                                     code: "vital-signs",
                                     display: "Vital Signs"
                                 }
                             ]
                         }
                     ],
                     code: {
                         coding: [
                             {
                                 system: "http://loinc.org",
                                 code: "85354-9",
                                 display: "Blood pressure panel with all children"
                             }
                         ],
                         text: "Blood Pressure"
                     },
                     subject: {
                         reference: `Patient/${fhirPatientId}`
                     },
                     effectiveDateTime: lastVisitDate,
                     component: [
                         {
                             code: {
                                 coding: [
                                     {
                                         system: "http://loinc.org",
                                         code: "8480-6",
                                         display: "Systolic blood pressure"
                                     }
                                 ]
                             },
                             valueQuantity: {
                                 value: sysVal,
                                 unit: "mmHg",
                                 system: "http://unitsofmeasure.org",
                                 code: "mm[Hg]"
                             }
                         },
                         {
                             code: {
                                 coding: [
                                     {
                                         system: "http://loinc.org",
                                         code: "8462-4",
                                         display: "Diastolic blood pressure"
                                     }
                                 ]
                             },
                             valueQuantity: {
                                 value: diaVal,
                                 unit: "mmHg",
                                 system: "http://unitsofmeasure.org",
                                 code: "mm[Hg]"
                             }
                         }
                     ]
                 });
             }
         }
     }

     // 4. Save Patient to FHIR Store
     const patientUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Patient/${fhirPatient.id}`;
     const patientRes = await fetch(patientUrl, {
         method: 'PUT',
         headers: {
             'Authorization': `Bearer ${token.token}`,
             'Content-Type': 'application/fhir+json;charset=utf-8'
         },
         body: JSON.stringify(fhirPatient)
     });

     if (!patientRes.ok) {
         throw new Error(`FHIR Patient Save Error: ${patientRes.status} - ${await patientRes.text()}`);
     }
     console.log(`[Healthcare FHIR] Synchronized Patient ${fhirPatient.id} to FHIR Store.`);

     // 5. Save Conditions to FHIR Store
     for (const cond of fhirConditions) {
         const condUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Condition/${cond.id}`;
         const condRes = await fetch(condUrl, {
             method: 'PUT',
             headers: {
                 'Authorization': `Bearer ${token.token}`,
                 'Content-Type': 'application/fhir+json;charset=utf-8'
             },
             body: JSON.stringify(cond)
         });
         if (condRes.ok) {
             console.log(`[Healthcare FHIR] Synchronized Condition ${cond.id} to FHIR Store.`);
         } else {
             console.warn(`[Healthcare FHIR Warning] Failed to sync Condition ${cond.id}: ${condRes.status} - ${await condRes.text()}`);
         }
     }

     // 6. Save Observations to FHIR Store
     for (const obs of fhirObservations) {
         const obsUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${defaultLocation}/datasets/${defaultDatasetId}/fhirStores/${fhirStoreId}/fhir/Observation/${obs.id}`;
         const obsRes = await fetch(obsUrl, {
             method: 'PUT',
             headers: {
                 'Authorization': `Bearer ${token.token}`,
                 'Content-Type': 'application/fhir+json;charset=utf-8'
             },
             body: JSON.stringify(obs)
         });
         if (obsRes.ok) {
             console.log(`[Healthcare FHIR] Synchronized Observation ${obs.id} to FHIR Store.`);
         } else {
             console.warn(`[Healthcare FHIR Warning] Failed to sync Observation ${obs.id}: ${obsRes.status} - ${await obsRes.text()}`);
         }
     }

     res.json({ 
         success: true, 
         message: "Patient record successfully synchronized to Google Cloud Healthcare FHIR Store.",
         patient: fhirPatient, 
         conditionsSynced: fhirConditions.length, 
         observationsSynced: fhirObservations.length 
     });
   } catch (error: any) {
     console.error('[Healthcare FHIR Export Error]', error);
     res.status(500).json({ error: error.message });
   }
});
