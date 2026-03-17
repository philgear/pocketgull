import { Router } from 'express';
import { GoogleAuth } from 'google-auth-library';

export const dicomRouter = Router();

// Initialize Google Auth with the Healthcare API scope
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-healthcare']
});

/**
 * GET /api/dicom/studies
 * Proxy for searching DICOM studies via QIDO-RS.
 */
dicomRouter.get('/studies', async (req, res) => {
  try {
    const projectId = req.query['project'] || process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'];
    const location = req.query['location'] || process.env['HC_LOCATION'] || 'us-west1';
    const datasetId = req.query['dataset'] || process.env['HC_DATASET'];
    const dicomStoreId = req.query['dicomStore'] || process.env['HC_DICOM_STORE'];

    if (!projectId || !datasetId || !dicomStoreId) {
      return res.status(400).json({ error: 'Missing Healthcare API configuration parameters (project, dataset, dicomStore).' });
    }

    // Pass along query parameters for filtering (like PatientName, PatientID, etc.)
    const searchParams = new URLSearchParams(req.query as any);
    // Remove our proxy-specific params
    searchParams.delete('project');
    searchParams.delete('location');
    searchParams.delete('dataset');
    searchParams.delete('dicomStore');

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies?${searchParams.toString()}`;
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const response = await fetch(dicomWebUrl, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'application/dicom+json'
      }
    });

    if (!response.ok) {
        throw new Error(`Healthcare API Error: ${response.status} ${response.statusText} - ${await response.text()}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('[DICOM] Proxy Error (Studies):', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dicom/rendered
 * Proxy for retrieving rendered JPEGs via WADO-RS.
 */
dicomRouter.get('/rendered', async (req, res) => {
  try {
    const projectId = req.query['project'] || process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'];
    const location = req.query['location'] || process.env['HC_LOCATION'] || 'us-west1';
    const datasetId = req.query['dataset'] || process.env['HC_DATASET'];
    const dicomStoreId = req.query['dicomStore'] || process.env['HC_DICOM_STORE'];
    
    const studyUid = req.query['studyUid'];
    const seriesUid = req.query['seriesUid'];
    const instanceUid = req.query['instanceUid'];

    if (!projectId || !datasetId || !dicomStoreId || !studyUid || !seriesUid || !instanceUid) {
      return res.status(400).json({ error: 'Missing required parameters (project, dataset, dicomStore, studyUid, seriesUid, instanceUid).' });
    }

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}/rendered`;
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const response = await fetch(dicomWebUrl, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'image/jpeg'
      }
    });

    if (!response.ok) {
        throw new Error(`Healthcare API Error: ${response.status} ${response.statusText} - ${await response.text()}`);
    }
    
    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache JPEGs for 24 hours
    res.send(Buffer.from(buffer));
  } catch (error: any) {
    console.error('[DICOM] Proxy Error (Rendered):', error);
    res.status(500).json({ error: error.message });
  }
});
