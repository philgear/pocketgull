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
    
    console.log(`[Patients API] Synced ${mockDatabase.length} patients to cloud.`);
    res.status(200).json({ message: 'Patients synced successfully' });
  } catch (error: any) {
    console.error('[Patients API] Sync error:', error);
    res.status(500).json({ error: 'Internal server error during sync' });
  }
});

patientsRouter.get('/', (req, res) => {
  res.status(200).json(mockDatabase);
});
