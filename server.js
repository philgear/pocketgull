import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Stripe (requires STRIPE_SECRET_KEY in environment)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16',
});

// Mock database to link Users with Stripe Customers
const userDatabase = {
  'user_123': { apigeeAppId: 'app_abc', tier: 'free' }
};

const app = express();
app.use(compression());

// Trust the Google Cloud Run proxy so req.hostname resolves correctly
app.set('trust proxy', true);

// Redirect legacy understory and pocketgull URLs for pocketgull.app domain
app.use((req, res, next) => {
  const host = req.hostname || '';
  if (host.includes('understory') || host.includes('pocketgull') || host.includes('pocketgull.com')) {
    return res.redirect(301, `https://pocketgull.app${req.originalUrl}`);
  }
  next();
});

const port = process.env.PORT || 4200;

// Use process.cwd() to ensure we are looking in the right place
const rootDir = process.cwd();
const distFolder = join(rootDir, 'dist');

console.log(`[SERVER] Starting...`);
console.log(`[SERVER] Current working directory: ${rootDir}`);
console.log(`[SERVER] Expected dist folder: ${distFolder}`);

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
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'DENY');
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

// Stripe Billing API Endpoints
app.post('/api/billing/checkout', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Register user if they do not exist
    if (!userDatabase[userId]) {
      userDatabase[userId] = {
        apigeeAppId: `app_${Math.random().toString(36).substring(7)}`,
        tier: 'free'
      };
    }

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PocketGull Premium Clinical',
              description: 'Unlimited multimodal queries, secure cloud sync, and literature index access.',
            },
            unit_amount: 4900, // $49.00 / month
            recurring: { interval: 'month' }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/?upgrade=success`,
      cancel_url: `${origin}/?upgrade=cancelled`,
      client_reference_id: userId,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('[Billing API] Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/billing/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error(`[Billing API] Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event && event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (userId && userDatabase[userId]) {
      console.log(`[Billing API] Payment successful for user ${userId}.`);
      userDatabase[userId].tier = 'premium';
      userDatabase[userId].stripeCustomerId = session.customer;
    }
  }

  res.json({ received: true });
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
      if (geminiApiKeyCached) {
        // Inject script immediately before closing </head>
        const scriptTag = `<script px-api-key="true">window.GEMINI_API_KEY = "${geminiApiKeyCached}";</script>\n</head>`;
        html = html.replace('</head>', scriptTag);
      }
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
