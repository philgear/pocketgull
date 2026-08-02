import { Router } from 'express';

export const patientsRouter = Router();

// In a real application, this would interface with Cloud SQL or Firestore
let mockDatabase: any[] = [];

patientsRouter.post('/', (req, res) => {
  try {
    const patientsToSync = req.body;
    
    if (!Array.isArray(patientsToSync)) {
      res.status(400).json({ error: 'Expected an array of patients' });
      return;
    }

    // Replace the database state with the synced state for this demo
    mockDatabase = patientsToSync;
    
    const cleanLength = Number(mockDatabase.length || 0);
    console.log(`[Patients API] Synced ${cleanLength} patients to cloud.`);
    res.status(200).json({ message: 'Patients synced successfully' });
  } catch (error: any) {
    const safeErr = String(error?.message || error || '').replace(/[^a-zA-Z0-9_\-\.\:\s]/g, '_').slice(0, 500);
    console.error('[Patients API] Sync error:', safeErr);
    res.status(500).json({ error: 'Internal server error during sync' });
  }
});

patientsRouter.get('/', (req, res) => {
  res.status(200).json(mockDatabase);
});
