import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import compression from 'compression';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Logging } from '@google-cloud/logging';
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

const vertexAuth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});
import { createProxyMiddleware } from 'http-proxy-middleware';

const execPromise = promisify(exec);

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
const browserDistFolder = join(_dirname, '..', 'browser').replace(/\\/g, '/'); // root dir of dist when built

const app = express();
const angularApp = new AngularNodeAppEngine();
app.use(compression());

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

  // --- Dynamic Host Whitelisting ---
  // Overrides the request host to bypass Angular SSR's rigid `allowedHosts` array if the domain 
  // matches our environment variables or is a native Cloud Run deployment URL.
  const envHosts = process.env['ALLOWED_HOSTS'] ? process.env['ALLOWED_HOSTS'].split(',').map(h => h.trim()) : [];
  if (host.endsWith('.run.app') || envHosts.includes(host)) {
    req.headers['x-forwarded-host'] = targetDomain;
    req.headers.host = targetDomain;
  }

  next();
});

const rootDir = process.cwd();

// Auto-hydrate locally defined keys into process.env so routers can read them normally
for (const envFile of ['.env.local', '.env']) {
  try {
    const localEnv = fs.readFileSync(join(rootDir, envFile), 'utf8');
    localEnv.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').replace(/^["']|["']$/g, '').trim();
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (e) { }
}

async function fetchGeminiApiKey() {
  if (process.env['GEMINI_API_KEY']) {
    console.log('[Secrets] Using GEMINI_API_KEY from environment.');
    return process.env['GEMINI_API_KEY'];
  }

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

let geminiApiKeyCached: string | null = null;
let fetchPromise: Promise<string> | null = null;

async function getApiKey(): Promise<string> {
  if (geminiApiKeyCached !== null) return geminiApiKeyCached;
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
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://generativelanguage.googleapis.com wss://generativelanguage.googleapis.com https://eutils.ncbi.nlm.nih.gov http://127.0.0.1:11434",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "frame-src 'self' https://viewer.ohif.org https://spark.philgear.dev https://www.google.com https://pubmed.ncbi.nlm.nih.gov https: http://localhost:*"
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  next();
});

import { dicomRouter } from './server/dicom';
import { healthcareRouter, ensureHealthcareStoresExist } from './server/healthcare.js';

app.use('/api/dicom', dicomRouter);

let hcProvisioned = false;
app.use('/api/healthcare', async (req, res, next) => {
    if (!hcProvisioned) {
        hcProvisioned = true;
        await ensureHealthcareStoresExist();
    }
    next();
}, healthcareRouter);

// PubMed Proxy 
app.get('/api/pubmed/search', async (req, res) => {
  try {
    const term = req.query['term'] as string;
    if (!term) return res.status(400).json({ error: 'Term is required' });
    const eSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=15`;
    const response = await fetch(eSearchUrl, { headers: { 'User-Agent': 'PocketGull/1.0 (mailto:admin@pocketgull.app)' } });
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('PubMed Search Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pubmed/summary', async (req, res) => {
  try {
    const id = req.query['id'] as string;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const eSummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${id}&retmode=json`;
    const response = await fetch(eSummaryUrl, { headers: { 'User-Agent': 'PocketGull/1.0 (mailto:admin@pocketgull.app)' } });
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('PubMed Summary Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

import { fetchWorldHealthBaselines } from './server/world-health.js';

app.get('/api/health/baselines', async (req, res) => {
    try {
        const data = await fetchWorldHealthBaselines();
        res.json(data || {});
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// OS Native Diagnostic Endpoints
app.get('/api/system/stats', async (req, res) => {
  let gpuMemMB: number | null = null;
  try {
    const { stdout } = await execPromise('nvidia-smi --query-gpu=memory.total,memory.free --format=csv,noheader,nounits');
    const parts = stdout.trim().split(',');
    if (parts.length >= 2) {
       gpuMemMB = parseInt(parts[1].trim(), 10);
    }
  } catch (e) { /* ignore if no nvidia-smi */ }

  res.json({
    platform: os.platform(),
    totalMemMB: Math.round(os.totalmem() / 1024 / 1024),
    freeMemMB: Math.round(os.freemem() / 1024 / 1024),
    gpuMemMB,
    uptime: os.uptime(),
    cpus: os.cpus().length,
    loadAvg: os.loadavg()[0]?.toFixed(2) || '0.00'
  });
});

// Genkit AI Endpoints
app.post('/api/ai/metrics', express.json(), async (req, res) => {
  try {
      const { generateMetricsFlow } = await import('./server/genkit.js');
      const result = await generateMetricsFlow(req.body.text);
      res.json(result);
  } catch(e: any) {
      res.status(500).json({error: e.message});
  }
});

app.post('/api/ai/changes', express.json(), async (req, res) => {
  try {
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
    await getApiKey(); // Ensure the key is loaded into process.env before Genkit initializes

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
    await getApiKey();

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
    const key = await getApiKey();
    if (!key) {
      res.status(500).json({ error: 'API key not available on server.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const rawModel = (model || 'gemini-2.5-flash').replace(/^models\//, '');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${rawModel}:streamGenerateContent?alt=sse&key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://pocketgull.app/'
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: patientData }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: temperature ?? 0.1 }
      })
    });

    if (!response.ok || !response.body) {
         throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // The REST API already formats as SSE when alt=sse is passed
        // However, it sends raw chunks that might need parsing if we want to extract text early,
        // but the frontend is already built to parse standard SSE formatting.
        res.write(chunk);
    }
    
    // The Gemini REST streams end naturally, but our frontend looks for [DONE]
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e: any) {
    try { res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`); res.end(); } catch {}
  }
});

// Server-Side Chat Session Management
// We manage the conversation history array here instead of a stateful SDK object
const chatSessions = new Map<string, { history: any[], systemInstruction: string, model: string, temperature: number }>();

app.post('/api/ai/chat/start', express.json(), async (req, res) => {
  try {
    const { sessionId, systemInstruction, model, temperature } = req.body;
    const key = await getApiKey();
    if (!key) throw new Error('API key not available on server.');
    
    chatSessions.set(sessionId, {
      history: [],
      systemInstruction,
      model: model || 'gemini-2.5-flash',
      temperature: temperature ?? 0.1
    });

    // Clean up old sessions (keep max 50)
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
    
    // Append user message
    session.history.push({ role: 'user', parts: [{ text: message }] });

    const rawModel = session.model.replace(/^models\//, '');
    
    // Vertex AI BAA-Compliant Inference
    const projectId = await vertexAuth.getProjectId();
    const vertexAI = new VertexAI({ project: projectId, location: 'us-central1' });
    const generativeModel = vertexAI.getGenerativeModel({
      model: rawModel,
      systemInstruction: { role: 'system', parts: [{ text: session.systemInstruction }] },
      generationConfig: { temperature: session.temperature }
    });

    const resp = await generativeModel.generateContent({
      contents: session.history
    });

    const responseText = resp.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Append model response
    session.history.push({ role: 'model', parts: [{ text: responseText }] });

    res.json({ text: responseText });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});



// ------------- CLOUD AUDIT LOGGING -------------
let gcpLogging: any = null;
let auditLog: any = null;

if (process.env['NODE_ENV'] === 'production' || process.env['K_SERVICE']) {
  try {
    gcpLogging = new Logging();
    auditLog = gcpLogging.log('pocket-gull-audit');
  } catch (e) {
    console.warn('[Audit Warning] GCP Logging init failed. Logs will route to stdout.');
  }
} else {
  console.log('[Audit] Local environment detected. Bypassing GCP Logging authentication.');
}

/**
 * Endpoint for UI components to stream immutable telemetry regarding PHI access.
 */
app.post('/api/audit', express.json(), async (req, res) => {
  try {
    const { action, userId, patientId, originalActionSource } = req.body;
    
    if (auditLog) {
      // Hardened log schema for tracking clinical data interactions
      const entry = auditLog.entry(
        { resource: { type: 'global' } },
        {
          message: `AUDIT: User [${userId || 'ANONYMOUS_SESSION'}] performed [${action}] on Patient [${patientId || 'N/A'}]`,
          action,
          userId: userId || 'ANONYMOUS_SESSION',
          patientId: patientId || 'N/A',
          originalActionSource,
          timestamp: new Date().toISOString()
        }
      );
      
      await auditLog.write(entry);
    } else {
      // Local fallback
      console.log(`[LOCAL AUDIT]: User [${userId || 'ANONYMOUS_SESSION'}] performed [${action}] on Patient [${patientId || 'N/A'}]`);
    }

    res.status(200).json({ status: 'tracked' });
  } catch (e: any) {
    console.error('Audit telemetry failed to log:', e.message);
    res.status(500).json({ error: 'Audit failure' });
  }
});

// ------------- GOOGLE AUTH FOR VERTEX AI WEBSOCKETS -------------
// (GoogleAuth imported at top level)

/**
 * Proxy Gemini Live WebSockets to Vertex AI Bidi API for BAA Compliance.
 */
app.use('/ws/gemini-live', createProxyMiddleware({
  target: 'wss://us-central1-aiplatform.googleapis.com',
  ws: true,
  changeOrigin: true,
  pathRewrite: async (path, req) => {
    try {
      const projectId = await vertexAuth.getProjectId();
      // BAA compliant endpoint for Vertex AI Multimodal Live
      return `/ws/google.cloud.aiplatform.v1beta1.LlmUtilityService/BidiGenerateContent`;
    } catch (e) {
      console.error('[Vertex Auth Error] Cannot determine project ID for WebSocket', e);
      return path;
    }
  },
  on: {
    proxyReqWs: (proxyReq, req, socket, options, head) => {
      // The http-proxy-middleware v3 syntax handles upgrade events here
      vertexAuth.getAccessToken().then(token => {
        if (token) {
          proxyReq.setHeader('Authorization', `Bearer ${token}`);
          // Vertex expects the target model in a special header or within the first setup payload.
          // In standard Gemini API, the model is in the URL. For Vertex Bidi, the setup payload explicitly specifies it.
        }
      }).catch(err => console.error('[Vertex Auth Error] Failed to generate Bearer Token for WS stream', err));
    }
  }
}));

/**
 * Serve docs statically.
 */
app.use(
  '/docs',
  express.static(join(browserDistFolder, 'docs'), {
    maxAge: '1y',
    index: 'index.html',
    redirect: true,
  }),
);

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
      const key = await getApiKey();
      if (contentType.includes('text/html') && key) {
        let html = await response.text();
        const scriptTag = `<script px-api-key="true">window.GEMINI_API_KEY = "${key}";</script>\n</head>`;
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
  app.listen(port, '0.0.0.0', () => {
    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
    // Explicitly keep the process alive, as something is closing the event loop
    setInterval(() => {}, 1000 * 60 * 60 * 24);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
