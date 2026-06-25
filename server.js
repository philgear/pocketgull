import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import swaggerUi from 'swagger-ui-express';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(compression());
app.use('/api', cors()); // Enable CORS for API routes so Flutter apps can sync data

// Trust the Google Cloud Run proxy so req.hostname resolves correctly
app.set('trust proxy', 1);

// Redirect legacy URLs and alternative domains to the primary pocketgull.app domain
app.use((req, res, next) => {
  const host = req.hostname || '';
  if (host.includes('understory') || host.includes('pocketgall') || host.includes('pocketgull.com') || (host.includes('pocketgull') && !host.includes('pocketgull.app'))) {
    return res.redirect(301, `https://pocketgull.app${req.originalUrl}`);
  }
  next();
});

const port = process.env.PORT || 3000;

// Use process.cwd() to ensure we are looking in the right place
const rootDir = process.cwd();
const distFolder = join(rootDir, 'dist');

console.log(`[SERVER] Starting...`);
console.log(`[SERVER] Current working directory: ${rootDir}`);
console.log(`[SERVER] Expected dist folder: ${distFolder}`);

// Serve Astro Study Docs independently of Swagger
app.use('/docs/study', (req, res, next) => {
  if (req.path !== '/' && req.path !== '' && !req.path.endsWith('/') && !req.path.includes('.')) {
    return res.redirect(301, `/docs/study${req.path}/`);
  }

  const cleanPath = req.path.endsWith('/') ? req.path : req.path + '/';
  if (req.path === '/' || req.path === '' || !req.path.includes('.')) {
    const indexPath = join(distFolder, 'docs', 'study', cleanPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});
app.use('/docs/study', express.static(join(distFolder, 'docs', 'study')));

// Load OpenAPI documentation dynamically
let swaggerDocument;
try {
  const openApiPath = join(rootDir, 'docs', 'openapi.json');
  if (fs.existsSync(openApiPath)) {
    swaggerDocument = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
    const swaggerAuth = (req, res, next) => {
      const username = process.env.SWAGGER_USERNAME || 'dev-pocketgull';
      const password = process.env.SWAGGER_PASSWORD || 'admin-secure-pocketgull-2026';

      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Pocket Gull Secure Docs"');
        return res.status(401).send('Authentication required.');
      }

      const [type, credentials] = authHeader.split(' ');
      if (type === 'Basic' && credentials) {
        const decoded = Buffer.from(credentials, 'base64').toString('utf8');
        const [u, p] = decoded.split(':');
        if (u === username && p === password) {
          return next();
        }
      }

      res.setHeader('WWW-Authenticate', 'Basic realm="Pocket Gull Secure Docs"');
      return res.status(401).send('Invalid credentials.');
    };

    // Mount the Swagger UI under /api-docs
    app.get(['/docs', '/docs/'], swaggerAuth, (req, res) => {
      res.redirect('/api-docs');
    });
    app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log('[SERVER] Swagger documentation mounted at /api-docs');
  } else {
    console.warn('[SERVER] Warning: docs/openapi.json not found. Swagger docs skipped.');
  }
} catch (err) {
  console.error('[SERVER] Failed to load or parse docs/openapi.json:', err);
}

let geminiApiKeyCached = '';

async function fetchGeminiApiKey() {
  // Layer 1: Process Environment
  if (process.env.GEMINI_API_KEY) {
    console.log('[Secrets] Using GEMINI_API_KEY from environment.');
    return process.env.GEMINI_API_KEY;
  }

  // Layer 2: Local Filesystem (.env or .env.local)
  for (const envFile of ['.env.local', '.env']) {
    try {
      const localEnv = fs.readFileSync(join(rootDir, envFile), 'utf8');
      const match = localEnv.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
      if (match) {
        console.log(`[Secrets] Manual load success: ${envFile}`);
        return match[1].trim();
      }
    } catch (e) { }
  }

  // Layer 3: Cloud Infrastructure (Secret Manager)
  try {
    const client = new SecretManagerServiceClient();
    let projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;

    if (!projectId) {
      console.log('[Secrets] GOOGLE_CLOUD_PROJECT not set, attempting to resolve automatically...');
      projectId = await client.getProjectId();
    }

    if (!projectId) {
      console.warn('[WARN] Could not determine project ID. Returning empty string.');
      return '';
    }

    console.log(`[Secrets] Fetching GEMINI_API_KEY from GCP Secret Manager for project ${projectId}...`);
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`,
    });
    const payload = version.payload.data.toString('utf8');
    console.log('[Secrets] Successfully fetched GEMINI_API_KEY from GCP.');
    return payload;
  } catch (err) {
    console.warn(`[WARN] Failed to fetch secret GEMINI_API_KEY from GCP. Returning empty string. Error: ${err.message}`);
    return '';
  }
}

// Fetch secret on startup
fetchGeminiApiKey().then(key => {
  geminiApiKeyCached = key;
});

if (fs.existsSync(distFolder)) {
  const contents = fs.readdirSync(distFolder);
  console.log(`[SERVER] Contents of ${distFolder}:`, contents);
} else {
  console.error(`[SERVER] ERROR: ${distFolder} does not exist!`);
  console.log(`[SERVER] Contents of ${rootDir}:`, fs.readdirSync(rootDir));
}

// Add security headers
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals = res.locals || {};
  res.locals.nonce = nonce;

  // Strict Transport Security - preloaded via HSTS preload list
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Cross-Origin-Opener-Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Content Security Policy - prevents inline scripts and restricts resource loading
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    `script-src 'self' 'nonce-${nonce}'; ` +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
    "img-src 'self' https: data:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://eutils.ncbi.nlm.nih.gov https://generativelanguage.googleapis.com https://huggingface.co https://*.huggingface.co https://cdn-lfs.huggingface.co https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com; " +
    "frame-src 'self' https://www.ncbi.nlm.nih.gov https://insightspark-82c75.web.app; " +
    "frame-ancestors 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  
  // X-Content-Type-Options - prevents MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer-Policy - controls referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cross-Origin Resource Policy
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Permissions-Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  next();
});

// PubMed Proxy Endpoints
app.get('/api/pubmed/search', async (req, res) => {
  try {
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'Term is required' });
    const eSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=15`;
    const response = await fetch(eSearchUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('PubMed Search Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pubmed/summary', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const eSummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${id}&retmode=json`;
    const response = await fetch(eSummaryUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('PubMed Summary Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ORCID Proxy Endpoint
app.get('/api/orcid/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ORCID iD is required' });
    
    // Clean and validate format
    const cleanId = id.trim().replace(/https?:\/\/orcid\.org\//, '');
    if (!/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(cleanId)) {
      return res.status(400).json({ error: 'Invalid ORCID iD format. Expected: 0000-0002-1825-0097' });
    }

    // Mock Developer Fallback Profile for Phil Gear
    if (cleanId === '0009-0008-1372-5381') {
      console.log('[ORCID Proxy] Serving local mock profile for developer: Phil Gear');
      return res.json({
        person: {
          name: {
            'given-names': { value: 'Phil' },
            'family-name': { value: 'Gear' }
          },
          keywords: {
            keyword: [
              { content: 'Software' },
              { content: 'Clinical Intelligence' },
              { content: 'Care Consultation' }
            ]
          },
          'researcher-urls': {
            'researcher-url': [
              {
                'url-name': 'InsightSpark',
                url: { value: 'https://github.com/philgear/InsightSpark' }
              }
            ]
          }
        },
        'activities-summary': {
          works: {
            group: [
              {
                'work-summary': [
                  {
                    title: {
                      title: { value: 'Pivot & Pulse' }
                    },
                    url: { value: 'https://github.com/philgear/InsightSpark' },
                    type: 'software',
                    'publication-date': {
                      year: { value: '2026' }
                    }
                  }
                ]
              },
              {
                'work-summary': [
                  {
                    title: {
                      title: { value: 'PocketGull Care Consultation Protocol' }
                    },
                    type: 'research-tool',
                    'publication-date': {
                      year: { value: '2026' }
                    }
                  }
                ]
              }
            ]
          }
        }
      });
    }

    const orcidUrl = `https://pub.orcid.org/v3.0/${cleanId}/record`;
    const response = await fetch(orcidUrl, {
      headers: {
        'Accept': 'application/vnd.orcid+json, application/json'
      }
    });

    if (!response.ok) {
      console.error(`ORCID API returned status ${response.status}`);
      if (response.status === 404) {
        return res.status(404).json({ error: 'ORCID profile not found. Please verify the ID.' });
      }
      return res.status(response.status).json({ error: `ORCID API returned error: ${response.statusText || 'Unknown Error'}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('ORCID Proxy Error:', err);
    res.status(500).json({ error: 'Failed to fetch profile from ORCID.' });
  }
});

// Enable parsing JSON bodies for POST requests
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// JSON File Database Configuration
const dataDir = join(rootDir, 'data');
const patientsDbPath = join(dataDir, 'patients.json');

// Ensure data directory and empty DB exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(patientsDbPath)) {
  fs.writeFileSync(patientsDbPath, JSON.stringify([], null, 2));
}

// Patients API Endpoints
app.get('/api/patients', (req, res) => {
  try {
    const data = fs.readFileSync(patientsDbPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('[API] Error reading patients database:', err);
    res.status(500).json({ error: 'Internal server error while reading database' });
  }
});

app.post('/api/patients', (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Body must be a JSON array of patients' });
    }

    // Save exactly what the frontend sends
    fs.writeFileSync(patientsDbPath, JSON.stringify(req.body, null, 2));

    console.log(`[API] Saved ${req.body.length} patients to database.`);
    res.status(200).json({ success: true, count: req.body.length });
  } catch (err) {
    console.error('[API] Error saving patients database:', err);
    res.status(500).json({ error: 'Internal server error while saving database' });
  }
});

app.put('/api/patients/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Body must be a JSON object representing the patient' });
    }

    const data = fs.readFileSync(patientsDbPath, 'utf8');
    const patients = JSON.parse(data);
    const index = patients.findIndex(p => p.id === id);

    if (index !== -1) {
      patients[index] = { ...patients[index], ...req.body, id }; // Ensure ID stays same
    } else {
      // If it doesn't exist, we can create it
      patients.push({ ...req.body, id });
    }

    fs.writeFileSync(patientsDbPath, JSON.stringify(patients, null, 2));
    console.log(`[API] Synced patient ${id} from mobile/app to database.`);
    res.status(200).json({ success: true, patient: patients.find(p => p.id === id) });
  } catch (err) {
    console.error('[API] Error syncing patient to database:', err);
    res.status(500).json({ error: 'Internal server error while syncing patient' });
  }
});

// Serve static files via Express directly to avoid generic filesystem deadlocks
// index: false prevents static middleware from serving index.html on root `/` requests
app.use(express.static(distFolder, { maxAge: '1y', index: false }));

// Fallback to index.html for Angular routing and root requests
app.get(/(.*)/, (req, res) => {
  const indexPath = join(distFolder, 'index.html');

  // A request is a "document" request if it:
  // 1. Is the root '/'
  // 2. Is index.html
  // 3. Doesn't have a file extension (likely an Angular route)
  const isDoc = req.url === '/' || req.url === '/index.html' || !req.url.includes('.');

  if (!isDoc) {
    // If it's not a doc and wasn't caught by express.static, it's a 404
    console.log(`[SERVER] 404 Not Found: ${req.url}`);
    return res.status(404).send('Not Found');
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (fs.existsSync(indexPath)) {
    try {
      let html = fs.readFileSync(indexPath, 'utf8');
      const nonce = res.locals.nonce || '';
      if (geminiApiKeyCached) {
        // Inject script immediately before closing </head>
        const scriptTag = `<script nonce="${nonce}" px-api-key="true">window.GEMINI_API_KEY = "${geminiApiKeyCached}";</script>\n</head>`;
        html = html.replace('</head>', scriptTag);
      }

      // Inject nonce into all script tags that don't have one
      html = html.replace(/<script\b([^>]*)>/gi, (match, attrs) => {
        if (attrs.includes('nonce=')) {
          return match;
        }
        return `<script nonce="${nonce}"${attrs}>`;
      });

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (err) {
      console.error('[SERVER] Error injecting secret into index.html:', err);
    }
  }

  res.sendFile(indexPath);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[SERVER] Listening on port ${port}`);
});
