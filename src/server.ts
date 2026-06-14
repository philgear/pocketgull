process.env['OTEL_SDK_DISABLED'] = 'true';

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import crypto from 'node:crypto';
import { GoogleAuth } from 'google-auth-library';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const browserDistFolder = join(__dirname, '..').replace(/\\/g, '/'); // root dir of dist when built

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['localhost', '0.0.0.0', 'pocketgull.app', '*.pocketgull.app', 'pocketgall.com', 'pocketgall.app', 'pocketgal.app', 'pocketgull.com', 'pocketgal.ai', '*.run.app']
});
app.use(compression());

// Fix for Node 20+ undici fetch rejecting 0.0.0.0 host header during SSR
app.use((req, res, next) => {
  if (req.headers.host && req.headers.host.includes('0.0.0.0')) {
    req.headers.host = req.headers.host.replace('0.0.0.0', 'localhost');
  }
  next();
});

// Trust the Google Cloud Run proxy so req.hostname resolves correctly
app.set('trust proxy', true);

// Forced domain redirect to pocketgull.app
const targetDomain = 'pocketgull.app';
const redirectDomains = [
  'pocketgall.com',
  'pocketgall.app',
  'pocketgal.app',
  'pocketgull.com',
  'pocketgal.ai'
];

app.use((req, res, next) => {
  const host = req.hostname;
  if (redirectDomains.includes(host)) {
    return res.redirect(301, `https://${targetDomain}${req.originalUrl}`);
  }
  next();
});

const rootDir = normalize(resolve(__dirname, '..'));



async function fetchGeminiApiKey() {
  if (process.env['GEMINI_API_KEY']) {
    console.log('[Secrets] Using GEMINI_API_KEY from environment.');
    return process.env['GEMINI_API_KEY'];
  }

  // Search the Angular project root first, then fall back to sibling pocketgull_api dir
  // so a single .env in either location satisfies all services in the monorepo.
  const envFiles = ['.env.local', '.env', 'pocketgull_api/.env.local', 'pocketgull_api/.env'];

  for (const file of envFiles) {
    const joinedPath = join(rootDir, file);
    const envPath = normalize(joinedPath);
    if (!envPath.startsWith(rootDir)) continue;
    try {
      const localEnv = fs.readFileSync(envPath, 'utf8');
      const match = localEnv.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
      if (match) {
        console.log(`[Secrets] Manual load success: ${envPath}`);
        return match[1].trim();
      }
    } catch (e) { /* file not found, try next */ }
  }

  try {
    const client = new SecretManagerServiceClient();
    let projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'];

    if (!projectId) {
      if (process.env['NODE_ENV'] !== 'production' && !process.env['K_SERVICE']) {
          console.warn('[WARN] Not running in GCP (no K_SERVICE). Skipping Secret Manager to prevent auth crash.');
          return '';
      }
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
    const payload = version.payload?.data ? Buffer.from(version.payload.data).toString('utf8') : '';
    console.log('[Secrets] Successfully fetched GEMINI_API_KEY from GCP.');
    return payload;
  } catch (err: any) {
    console.warn(`[WARN] Failed to fetch secret GEMINI_API_KEY from GCP. Returning empty string. Error: ${err.message}`);
    return '';
  }
}

const googleAuth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

async function getGcpAccessToken(): Promise<string | null> {
  try {
    const client = await googleAuth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token || null;
  } catch (err: any) {
    console.warn('[WARN] Failed to retrieve GCP OAuth access token:', err.message);
    return null;
  }
}

function translateToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(translateToSnake);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      newObj[snakeKey] = translateToSnake(obj[key]);
    }
    return newObj;
  }
  return obj;
}

function translateToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(translateToCamel);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
      newObj[camelKey] = translateToCamel(obj[key]);
    }
    return newObj;
  }
  return obj;
}

let geminiApiKeyCached: string | null = null;
let fetchPromise: Promise<string> | null = null;

async function getApiKey(req?: express.Request): Promise<string> {
  const clientKey = req?.headers?.['x-gemini-api-key'] || req?.headers?.['X-Gemini-API-Key'];
  if (typeof clientKey === 'string' && clientKey.trim()) {
    const trimmed = clientKey.trim();
    process.env['GEMINI_API_KEY'] = trimmed;
    return trimmed;
  }

  if (geminiApiKeyCached !== null) {
    if (geminiApiKeyCached) {
      process.env['GEMINI_API_KEY'] = geminiApiKeyCached;
    }
    return geminiApiKeyCached;
  }
  if (!fetchPromise) {
    fetchPromise = fetchGeminiApiKey().then(key => {
       geminiApiKeyCached = key;
       if (key) {
         process.env['GEMINI_API_KEY'] = key;
       }
       return key;
    }).catch(err => {
       console.warn('[WARN] Top-level error in fetchGeminiApiKey:', err.message);
       geminiApiKeyCached = '';
       return '';
    });
  }
  return fetchPromise;
}

// Prefetch the API key at boot to ensure all lazy loaded APIs have process.env populated
await getApiKey().catch(console.error);

// Security headers
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals = res.locals || {};
  res.locals['nonce'] = nonce;

  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  const isProd = process.env['NODE_ENV'] === 'production';
  let csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://upload.wikimedia.org https://phil.cdc.gov https://*.wikimedia.org; connect-src 'self' https://generativelanguage.googleapis.com https://commons.wikimedia.org https://eutils.ncbi.nlm.nih.gov wss://generativelanguage.googleapis.com https://*.aiplatform.googleapis.com wss://*.aiplatform.googleapis.com https://fonts.gstatic.com https://huggingface.co https://*.huggingface.co https://cdn-lfs.huggingface.co https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com; frame-src 'self' https://www.ncbi.nlm.nih.gov https://growthyself.firebaseapp.com https://insightspark-82c75.web.app; media-src 'self' blob: data: mediastream: https:; object-src 'none'; base-uri 'self';`;
  
  if (!isProd) {
    res.setHeader('Reporting-Endpoints', 'csp-endpoint="/api/csp-report"');
    csp += " report-uri /api/csp-report; report-to csp-endpoint;";
  }

  res.setHeader('Content-Security-Policy', csp);
  next();
});

// CSP Telemetry Violation Reporting (Disabled in production for patient privacy)
app.post('/api/csp-report', express.json({ type: ['application/json', 'application/csp-report'] }), (req, res: any) => {
  if (process.env['NODE_ENV'] === 'production') {
    return res.status(404).send('Not Found');
  }
  console.log('[CSP Violation Report]:', req.body);
  res.status(204).end();
});

import { dicomRouter } from './server/dicom';
import { healthcareRouter, ensureHealthcareStoresExist } from './server/healthcare';
import { fitbitRouter } from './server/fitbit';
import swaggerUi from 'swagger-ui-express';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Load OpenAPI specification dynamically for Swagger UI
let openApiSpec: any = {};
try {
  const joinedSpec = join(rootDir, 'docs', 'openapi.json');
  const specPath = normalize(joinedSpec);
  if (specPath.startsWith(rootDir)) {
    openApiSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  } else {
    throw new Error('Unauthorized path access');
  }
} catch (err: any) {
  console.warn('[Swagger] Failed to load docs/openapi.json:', err.message);
}

// ── Python Biosignal & Data Bridge Proxy ───────────────────────────────────
// Routes /api/python/* → FastAPI sidecar on :8001 (dev) or PYTHON_API_URL (prod).
// In Cloud Run both processes share a container, so the URL is always internal.
const pythonApiTarget = process.env['PYTHON_API_URL'] ?? 'http://localhost:8001';
app.use('/api/python', createProxyMiddleware({
  target: pythonApiTarget,
  changeOrigin: true,
  pathRewrite: { '^/api/python': '' },
  on: {
    error: (err, req, res: any) => {
      console.warn('[Python Proxy] FastAPI sidecar unavailable:', (err as Error).message);
      res.status(503).json({ error: 'Python data service unavailable. Is the FastAPI sidecar running?' });
    }
  }
}));

// PubMed Proxy 
app.get('/api/pubmed/search', async (req, res) => {
  try {
    const term = req.query['term'] as string;
    if (!term) return res.status(400).json({ error: 'Term is required' });
    const eSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=15`;
    const response = await fetch(eSearchUrl);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('PubMed Search Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const swaggerAuth = (req: any, res: any, next: any) => {
  const username = process.env['SWAGGER_USERNAME'] || 'dev-pocketgull';
  const password = process.env['SWAGGER_PASSWORD'] || 'admin-secure-pocketgull-2026';

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

app.get('/docs', swaggerAuth, (req, res) => {
  res.redirect('/api-docs');
});
app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api/dicom', dicomRouter);
app.use('/api/healthcare', healthcareRouter);
app.use('/api/fitbit', fitbitRouter);

app.get('/api/pubmed/summary', async (req, res) => {
  try {
    const id = req.query['id'] as string;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const eSummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${id}&retmode=json`;
    const response = await fetch(eSummaryUrl);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('PubMed Summary Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/config', async (req, res) => {
  try {
    const key = await getApiKey(req);
    res.json({ apiKey: key });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orcid/:orcid', async (req, res) => {
  try {
    const { orcid } = req.params;
    if (!orcid) return res.status(400).json({ error: 'ORCID iD is required' });
    
    // Clean and validate format
    const cleanId = orcid.trim().replace(/https?:\/\/orcid\.org\//, '');
    if (!/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(cleanId)) {
      return res.status(400).json({ error: 'Invalid ORCID iD format. Expected: 0000-0002-1825-0097' });
    }

    // Mock Developer Fallback Profile for Phil Gear
    if (cleanId === '0009-0008-1372-5381') {
      console.log('[ORCID Proxy] Serving SSR mock profile for developer: Phil Gear');
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
  } catch (err: any) {
    console.error('ORCID Proxy Error:', err);
    res.status(500).json({ error: 'Failed to fetch profile from ORCID.' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/health/baselines', async (req, res) => {
  try {
    const { fetchWorldHealthBaselines } = await import('./server/world-health.js');
    const baselines = await fetchWorldHealthBaselines();
    res.json(baselines);
  } catch (err: any) {
    console.error('Baselines Fetch Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hardware/telemetry', async (req, res) => {
  try {
    const { getHardwareTelemetry } = await import('./server/telemetry.js');
    const telemetry = await getHardwareTelemetry();
    res.json(telemetry);
  } catch (err: any) {
    console.error('Telemetry Fetch Error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Genkit AI Endpoints
app.post('/api/ai/metrics', express.json(), async (req, res) => {
  try {
      await getApiKey(req);
      const { generateMetricsFlow } = await import('./server/genkit.js');
      const result = await generateMetricsFlow(req.body.text);
      res.json(result);
  } catch(e: any) {
      res.status(500).json({error: e.message});
  }
});

app.post('/api/ai/changes', express.json(), async (req, res) => {
  try {
      await getApiKey(req);
      const { detectClinicalChangesFlow } = await import('./server/genkit.js');
      const result = await detectClinicalChangesFlow({
          oldData: req.body.oldData,
          newData: req.body.newData
      });
      res.json({ significant: result });
  } catch(e: any) {
      res.status(500).json({error: e.message});
  }
});

app.post('/api/ai/translate', express.json(), async (req, res) => {
  try {
      await getApiKey(req);
      const { translateReadingLevelFlow } = await import('./server/genkit.js');
      const result = await translateReadingLevelFlow({
          text: req.body.text,
          level: req.body.level
      });
      res.json({ text: result });
  } catch(e: any) {
      res.status(500).json({error: e.message});
  }
});

app.post('/api/ai/analyze-translation', express.json(), async (req, res) => {
  try {
    const { original, translated } = req.body;
    await getApiKey(req); // Ensure the key is loaded into process.env before Genkit initializes

    if (!original || !translated) {
      return res.status(400).json({ error: 'Original and translated text are required' });
    }

    const { analyzeTranslationFlow } = await import('./server/genkit.js');
    const result = await analyzeTranslationFlow({ original, translated });

    res.json({ analysis: result });

  } catch (error) {
    console.error('Error analyzing translation:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/ai/analyze-image', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { base64Image, context } = req.body;
    await getApiKey(req);

    if (!base64Image) {
      return res.status(400).json({ error: 'base64Image is required' });
    }

    const { analyzeImageFlow } = await import('./server/genkit.js');
    const result = await analyzeImageFlow({ base64Image, context });

    res.json({ analysis: result });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});


// Server-Side Streaming Endpoint
app.post('/api/ai/stream', express.json(), async (req, res) => {
  try {
    const { patientData, systemInstruction, model, temperature } = req.body;
    const token = await getGcpAccessToken();
    const key = token ? '' : await getApiKey(req);
    if (!token && !key) {
      res.status(500).json({ error: 'API key or GCP credentials not available on server.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const rawModel = (model || 'gemini-2.5-flash').replace(/^models\//, '');
    let response;

    if (token) {
      const projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'] || 'gen-lang-client-0540208645';
      const location = process.env['GOOGLE_CLOUD_REGION'] || process.env['GCLOUD_REGION'] || 'us-west1';
      const vertexUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${rawModel}:streamGenerateContent?alt=sse`;
      
      console.log(`[Vertex AI] Streaming via regional endpoint: ${vertexUrl}`);
      response = await fetch(vertexUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: patientData }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: temperature ?? 0.1 },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });
    } else {
      console.log(`[Gemini Developer API] Streaming model: ${rawModel}`);
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${rawModel}:streamGenerateContent?alt=sse&key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://pocketgull.app/'
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: patientData }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: temperature ?? 0.1 },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });
    }

    if (!response.ok || !response.body) {
         throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e: any) {
    try { res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`); res.end(); } catch {}
  }
});

// Server-Side Chat Session Management
const chatSessions = new Map<string, { history: any[], systemInstruction: string, model: string, temperature: number }>();

app.post('/api/ai/chat/start', express.json(), async (req, res) => {
  try {
    const { sessionId, systemInstruction, model, temperature } = req.body;
    const token = await getGcpAccessToken();
    const key = token ? '' : await getApiKey(req);
    if (!token && !key) throw new Error('API key or GCP credentials not available on server.');
    
    chatSessions.set(sessionId, {
      history: [],
      systemInstruction,
      model: model || 'gemini-2.5-flash',
      temperature: temperature ?? 0.1
    });

    if (chatSessions.size > 50) {
      const oldestKey = chatSessions.keys().next().value;
      if (oldestKey) chatSessions.delete(oldestKey);
    }
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai/chat/message', express.json(), async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const session = chatSessions.get(sessionId);
    if (!session) throw new Error('Chat session not found. Please refresh and try again.');
    
    const token = await getGcpAccessToken();
    const key = token ? '' : await getApiKey(req);
    if (!token && !key) throw new Error('API key or GCP credentials not available on server.');

    session.history.push({ role: 'user', parts: [{ text: message }] });

    const rawModel = session.model.replace(/^models\//, '');
    let response;

    if (token) {
      const projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'] || 'gen-lang-client-0540208645';
      const location = process.env['GOOGLE_CLOUD_REGION'] || process.env['GCLOUD_REGION'] || 'us-west1';
      const vertexUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${rawModel}:generateContent`;

      console.log(`[Vertex AI] Chat message via regional endpoint: ${vertexUrl}`);
      response = await fetch(vertexUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contents: session.history,
          systemInstruction: { parts: [{ text: session.systemInstruction }] },
          generationConfig: { temperature: session.temperature },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });
    } else {
      console.log(`[Gemini Developer API] Chat message model: ${rawModel}`);
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${rawModel}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Referer': 'https://pocketgull.app/'
        },
        body: JSON.stringify({
          contents: session.history,
          systemInstruction: { parts: [{ text: session.systemInstruction }] },
          generationConfig: { temperature: session.temperature },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });
    }

    if (!response.ok) {
       const errText = await response.text();
       throw new Error(`Gemini API Error: ${errText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    session.history.push({ role: 'model', parts: [{ text: responseText }] });

    res.json({ text: responseText });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
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
  } catch (err: any) {
    console.error('[API] Error reading patients database:', err);
    res.status(500).json({ error: 'Internal server error while reading database' });
  }
});

app.post('/api/patients', express.json({ limit: '50mb' }), (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Body must be a JSON array of patients' });
    }

    // Save exactly what the frontend sends
    fs.writeFileSync(patientsDbPath, JSON.stringify(req.body, null, 2));

    console.log(`[API] Saved ${req.body.length} patients to database.`);
    res.status(200).json({ success: true, count: req.body.length });
  } catch (err: any) {
    console.error('[API] Error saving patients database:', err);
    res.status(500).json({ error: 'Internal server error while saving database' });
  }
});

app.put('/api/patients/:id', express.json({ limit: '50mb' }), (req, res) => {
  try {
    const { id } = req.params;
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Body must be a JSON object representing the patient' });
    }

    const data = fs.readFileSync(patientsDbPath, 'utf8');
    const patients = JSON.parse(data);
    const index = patients.findIndex((p: any) => p.id === id);

    if (index !== -1) {
      patients[index] = { ...patients[index], ...req.body, id }; // Ensure ID stays same
    } else {
      patients.push({ ...req.body, id });
    }

    fs.writeFileSync(patientsDbPath, JSON.stringify(patients, null, 2));
    console.log(`[API] Synced patient ${id} from mobile/app to database.`);
    res.status(200).json({ success: true, patient: patients.find((p: any) => p.id === id) });
  } catch (err: any) {
    console.error('[API] Error syncing patient to database:', err);
    res.status(500).json({ error: 'Internal server error while syncing patient' });
  }
});

// Serve Astro Study Docs independently of Swagger and Angular SSR
app.use('/docs/study', (req, res, next) => {
  if (req.path !== '/' && req.path !== '' && !req.path.endsWith('/') && !req.path.includes('.')) {
    return res.redirect(301, `/docs/study${req.path}/`);
  }

  const cleanPath = req.path.endsWith('/') ? req.path : req.path + '/';
  if (req.path === '/' || req.path === '' || !req.path.includes('.')) {
    const indexPath = join(browserDistFolder, 'docs', 'study', cleanPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});
app.use('/docs/study', express.static(join(browserDistFolder, 'docs', 'study')));

/**
 * Serve static files from /.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then(async (response) => {
      if (!response) {
        return next();
      }

      // If the response is HTML and we have an API key, inject it
      const contentType = response.headers.get('content-type') || '';
      const key = await getApiKey(req);
      if (contentType.includes('text/html') && key) {
        let html = await response.text();
        const safeKey = key.replace(/[^a-zA-Z0-9_\-]/g, '');
        const nonce = res.locals['nonce'] || '';
        const scriptTag = `<script nonce="${nonce}" px-api-key="true">window.GEMINI_API_KEY = "${safeKey}";</script>\n</head>`;
        html = html.replace('</head>', scriptTag);

        const modRes = new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(response.headers)
        });

        modRes.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        modRes.headers.set('Pragma', 'no-cache');
        modRes.headers.set('Expires', '0');

        writeResponseToNodeResponse(modRes, res);
      } else {
        writeResponseToNodeResponse(response, res);
      }
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4200.
 */
if (isMainModule(import.meta.url) || process.env['pm_id'] || process.env['K_SERVICE'] || process.env['PORT']) {
  const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 4200;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
    
    // Auto-provision Cloud Healthcare API datasets and stores
    ensureHealthcareStoresExist().catch(console.error);

    // Setup secure WebSocket proxy for Vertex AI Multimodal Live API
    const wss = new WebSocketServer({ noServer: true });
    
    server.on('upgrade', (request, socket, head) => {
      const { pathname } = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (pathname === '/ws/gemini-live') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    });

    wss.on('connection', async (wsClient, request) => {
      console.log('[WS Proxy] Client connected to /ws/gemini-live');
      
      let vertexClient: WebSocket | null = null;
      const messageQueue: string[] = [];
      let isConnecting = true;
      let token: string | null = null;

      try {
        const projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'] || 'gen-lang-client-0540208645';
        const location = process.env['GOOGLE_CLOUD_REGION'] || process.env['GCLOUD_REGION'] || 'us-west1';
        
        token = await getGcpAccessToken();
        
        if (!token) {
          const urlObj = new URL(request.url || '', 'http://localhost');
          const keyParam = urlObj.searchParams.get('key') || process.env['GEMINI_API_KEY'] || '';
          const devUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${keyParam}`;
          
          console.log('[WS Proxy] Falling back to Developer Live WS API');
          vertexClient = new WebSocket(devUrl);
        } else {
          const vertexUrl = `wss://${location}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent`;
          console.log(`[WS Proxy] Connecting to Vertex AI Live WS: ${vertexUrl}`);
          
          vertexClient = new WebSocket(vertexUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }

        vertexClient.on('open', () => {
          console.log('[WS Proxy] Backend Live WS connection established');
          isConnecting = false;
          while (messageQueue.length > 0) {
            const msg = messageQueue.shift();
            if (msg) vertexClient?.send(msg);
          }
        });

        vertexClient.on('message', (data) => {
          try {
            const text = data.toString();
            const json = JSON.parse(text);
            const camelJson = translateToCamel(json);
            wsClient.send(JSON.stringify(camelJson));
          } catch (err) {
            wsClient.send(data);
          }
        });

        vertexClient.on('close', (code, reason) => {
          console.log(`[WS Proxy] Backend Live WS closed: ${code} - ${reason.toString()}`);
          wsClient.close(code, reason);
        });

        vertexClient.on('error', (err) => {
          console.error('[WS Proxy] Backend Live WS error:', err);
          wsClient.close(1011, 'Backend connection error');
        });

      } catch (err: any) {
        console.error('[WS Proxy] Initialization failed:', err.message);
        wsClient.close(1011, err.message);
        return;
      }

      wsClient.on('message', (message) => {
        try {
          const text = message.toString();
          let json = JSON.parse(text);
          
          if (json.setup && token) {
            const rawModel = (json.setup.model || 'gemini-2.0-flash-exp').replace(/^models\//, '');
            const projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'] || 'gen-lang-client-0540208645';
            const location = process.env['GOOGLE_CLOUD_REGION'] || process.env['GCLOUD_REGION'] || 'us-west1';
            json.setup.model = `projects/${projectId}/locations/${location}/publishers/google/models/${rawModel}`;
          }

          const snakeJson = translateToSnake(json);
          const payload = JSON.stringify(snakeJson);

          if (isConnecting) {
            messageQueue.push(payload);
          } else {
            vertexClient?.send(payload);
          }
        } catch (err) {
          if (isConnecting) {
            messageQueue.push(message.toString());
          } else {
            vertexClient?.send(message);
          }
        }
      });

      wsClient.on('close', (code, reason) => {
        console.log(`[WS Proxy] Client Live WS closed: ${code} - ${reason.toString()}`);
        if (vertexClient && vertexClient.readyState === WebSocket.OPEN) {
          vertexClient.close();
        }
      });

      wsClient.on('error', (err) => {
        console.error('[WS Proxy] Client Live WS error:', err);
        if (vertexClient && vertexClient.readyState === WebSocket.OPEN) {
          vertexClient.close();
        }
      });
    });

    // Explicitly keep the process alive, as something is closing the event loop
    setInterval(() => {}, 1000 * 60 * 60 * 24);
  });

  // Attach Socket.IO for the Colleague Collaboration Room
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Lock this down to pocketgull.app in a real production scenario
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('[Socket.IO] Clinician connected:', socket.id);

    // Join a specific patient's collaboration room
    socket.on('join_patient_room', (patientId: string) => {
      socket.join(patientId);
      console.log(`[Socket.IO] ${socket.id} joined patient room: ${patientId}`);
    });

    // Real-time IVitals Sync
    socket.on('sync_vitals', (data: { patientId: string, vitals: any }) => {
      socket.to(data.patientId).emit('vitals_updated', data.vitals);
    });

    // Colleague Chat & Intelligence Notes
    socket.on('send_note', (data: { patientId: string, note: any }) => {
      socket.to(data.patientId).emit('note_received', data.note);
    });

    // Colleague Presence (e.g. "Dr. Smith is viewing this chart")
    socket.on('presence_update', (data: { patientId: string, clinician: any }) => {
      socket.to(data.patientId).emit('presence_updated', data.clinician);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Clinician disconnected:', socket.id);
    });
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
