import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pubmedRouter } from './routes/pubmed.js';
import { patientsRouter } from './routes/patients.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { triageRouter } from './routes/triage.js';
import { orcidRouter } from './routes/orcid.js';

const app = express();
const port = process.env.PORT || 8080;

// Middleware
// In a true enterprise setup, this CORS would only allow the Apigee proxy or the trusted domains
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
}));
app.use(express.json());

// Routes
app.use('/api/pubmed', pubmedRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/triage', triageRouter);
app.use('/api/orcid', orcidRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(port, () => {
  console.log(`PocketGull API listening on port ${port}`);
});
