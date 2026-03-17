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
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const browserDistFolder = join(__dirname, '..').replace(/\\/g, '/'); // root dir of dist when built

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
  next();
});

const rootDir = process.cwd();



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
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

import { dicomRouter } from './server/dicom';

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

app.use('/api/dicom', dicomRouter);

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
    
    const key = await getApiKey();
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
        generationConfig: { temperature: session.temperature }
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
