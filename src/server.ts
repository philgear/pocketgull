import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

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

const rootDir = process.cwd();



async function fetchGeminiApiKey() {
  if (process.env['GEMINI_API_KEY']) {
    console.log('[Secrets] Using GEMINI_API_KEY from environment.');
    return process.env['GEMINI_API_KEY'];
  }

  // Search the Angular project root first, then fall back to sibling pocketgull_api dir
  // so a single .env in either location satisfies all services in the monorepo.
  const envSearchPaths = [
    join(rootDir, '.env.local'),
    join(rootDir, '.env'),
    join(rootDir, 'pocketgull_api', '.env.local'),
    join(rootDir, 'pocketgull_api', '.env'),
  ];

  for (const envPath of envSearchPaths) {
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

// ── Security Headers (Mozilla HTTP Observatory A+) ─────────────────────────
// Generate a cryptographically random nonce for each request. This is used
// by the CSP `script-src` directive to allow only Angular-rendered inline
// scripts while blocking any injected third-party scripts (XSS mitigation).
app.use((req, res, next) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  // Expose the nonce so downstream middleware (e.g. the HTML injector) can use it.
  (res as any).locals = (res as any).locals ?? {};
  (res as any).locals['cspNonce'] = nonce;

  // ── HTTP Strict Transport Security ──────────────────────────────────────
  // max-age of 2 years + includeSubDomains. Add `preload` once the domain is
  // submitted to https://hstspreload.org — it gives an Observatory bonus.
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // ── Anti-Clickjacking ────────────────────────────────────────────────────
  // X-Frame-Options is a legacy fallback. CSP `frame-ancestors` takes
  // precedence in modern browsers, but Observatory still checks this header.
  res.setHeader('X-Frame-Options', 'DENY');

  // ── MIME-Type Sniffing Prevention ────────────────────────────────────────
  // One of the most-penalized missing headers on the Observatory.
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // ── Referrer Policy ──────────────────────────────────────────────────────
  // Sends the full URL on same-origin requests but only the origin on
  // cross-origin requests (e.g. outbound Gemini API calls).
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // ── Content Security Policy ──────────────────────────────────────────────
  // Strategy: nonce-based `strict-dynamic` so Angular's SSR-injected scripts
  // are trusted automatically, while eval and arbitrary inline scripts are
  // blocked. Update the allow-list below if new external origins are added.
  const csp = [
    // Default: block everything not explicitly allowed
    `default-src 'self'`,

    // Scripts: only nonce-tagged scripts (Angular SSR) + their children via
    // strict-dynamic. Blocks eval and data: URI scripts entirely.
    `script-src 'nonce-${nonce}' 'strict-dynamic' https:`,

    // Styles: self + Google Fonts + allow inline styles (Angular uses them)
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,

    // Fonts: self + Google Fonts CDN
    `font-src 'self' https://fonts.gstatic.com`,

    // Images: self + data URIs (used for chart.js canvas exports) + blob:
    `img-src 'self' data: blob: https:`,

    // Connections: Gemini REST, Firebase, PubMed, own origin
    `connect-src 'self' https://generativelanguage.googleapis.com https://firestore.googleapis.com https://firebase.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://eutils.ncbi.nlm.nih.gov https://*.run.app wss://generativelanguage.googleapis.com`,

    // Media/Worker: blob: for Web Workers (WebLLM / ADK audio)
    `media-src 'self' blob:`,
    `worker-src 'self' blob:`,

    // Frames: nobody may frame this app
    `frame-src 'none'`,
    `frame-ancestors 'none'`,

    // Object/Embed: block plugins entirely
    `object-src 'none'`,

    // Base URI: prevent base-tag injection
    `base-uri 'self'`,

    // Form action: only submit to own origin
    `form-action 'self'`,

    // Upgrade all HTTP sub-resources to HTTPS
    `upgrade-insecure-requests`,
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);

  // ── Cross-Origin Policies ────────────────────────────────────────────────
  // COOP: prevents cross-origin window references (e.g. OAuth popup attacks)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  // COEP: required alongside COOP to enable cross-origin isolation
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  // CORP: restricts which origins can embed our resources
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // ── Permissions Policy ───────────────────────────────────────────────────
  // Lock down powerful browser APIs not used by the app. The microphone is
  // intentionally left unlocked here because the ADK Live voice feature uses
  // getUserMedia(). Remove `microphone=*` if audio is removed.
  res.setHeader(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'autoplay=()',
      'camera=()',
      'display-capture=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'keyboard-map=()',
      'magnetometer=()',
      'microphone=(self)',   // Required for ADK Live voice input
      'midi=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'xr-spatial-tracking=()',
    ].join(', '),
  );

  next();
});

import { dicomRouter } from './server/dicom';
import { healthcareRouter, ensureHealthcareStoresExist } from './server/healthcare';
import swaggerUi from 'swagger-ui-express';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Load OpenAPI specification dynamically for Swagger UI
let openApiSpec: any = {};
try {
  const specPath = join(rootDir, 'docs', 'openapi.json');
  openApiSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
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
    const key = await getApiKey(req);
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
    const key = await getApiKey(req);
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
    
    const key = await getApiKey(req);
    if (!key) throw new Error('API key not available on server.');

    // Append user message
    session.history.push({ role: 'user', parts: [{ text: message }] });

    // Strip models/ prefix if already there, so we can reliably prepend it
    const rawModel = session.model.replace(/^models\//, '');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${rawModel}:generateContent?key=${key}`, {
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

    if (!response.ok) {
       const errText = await response.text();
       throw new Error(`Gemini API Error: ${errText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Append model response
    session.history.push({ role: 'model', parts: [{ text: responseText }] });

    res.json({ text: responseText });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

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

      // If the response is HTML, inject API key + stamp CSP nonce onto all
      // inline scripts so they are trusted by the strict-dynamic CSP policy.
      const contentType = response.headers.get('content-type') || '';
      const key = await getApiKey(req);
      const cspNonce: string = (res as any).locals?.['cspNonce'] ?? '';

      if (contentType.includes('text/html')) {
        let html = await response.text();

        // Inject Gemini API key (nonce-tagged so CSP allows it)
        if (key) {
          const scriptTag = `<script nonce="${cspNonce}" px-api-key="true">window.GEMINI_API_KEY = "${key}";</script>\n</head>`;
          html = html.replace('</head>', scriptTag);
        }

        // Stamp the nonce onto any existing inline <script> tags that Angular
        // SSR emitted (e.g. transfer-state JSON blobs) so they pass CSP.
        if (cspNonce) {
          html = html.replace(/<script(?![^>]*\snonce=)/g, `<script nonce="${cspNonce}"`);
        }

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

    // Real-time Vitals Sync
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
