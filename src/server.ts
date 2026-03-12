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

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

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
