import { Page } from '@playwright/test';

/**
 * Polls the backend until it is fully responsive to prevent E2E race conditions on CI.
 */
async function waitForBackendToBeReady() {
  const baseUrl = process.env['BASE_URL'] || 'http://127.0.0.1:4000';
  const url = `${baseUrl}/api/config`;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.warn('⚠️ E2E Setup: Backend API did not become ready in time.');
}

/**
 * Common setup for E2E tests.
 * Mocks out hardware telemetry, config, and prevents Service Worker registration.
 */
export async function setupE2ePage(page: Page, options: { mockClinician?: boolean } = { mockClinician: true }) {
  // Wait for the local Express server backend to finish booting and seeding
  await waitForBackendToBeReady();

  page.on('console', async msg => {
    const parts = [];
    for (const arg of msg.args()) {
      try {
        const val = await arg.jsonValue();
        if (val && typeof val === 'object') {
          parts.push(JSON.stringify(val));
        } else {
          parts.push(val);
        }
      } catch (e) {
        parts.push(arg.toString());
      }
    }
    console.log(`PAGE LOG [${msg.type()}]:`, parts.join(' '));
  });

  page.on('pageerror', err => {
    console.error('PAGE ERROR EXCEPTION:', err.stack || err.message);
  });

  page.on('requestfailed', request => {
    console.error(`REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText || 'unknown error'}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.error(`HTTP ERROR: ${response.request().method()} ${response.url()} status ${response.status()}`);
    }
  });

  // Intercept Firebase Data Connect emulator requests to prevent ERR_CONNECTION_REFUSED
  await page.route('**9399/v1/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} })
    });
  });

  // Intercept config endpoint to return empty API key so splash screen shows Demo Mode
  await page.route('**/api/config', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ apiKey: '' })
    });
  });

  // Intercept hardware telemetry to prevent 500 error warnings
  await page.route('**/api/hardware/telemetry', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gpus: [],
        cpuName: 'Mock CPU',
        cpuLoadPercent: 12,
        systemMemoryUsedGb: 4.5,
        systemMemoryTotalGb: 16.0
      })
    });
  });

  // Intercept current patient loci endpoint to avoid 503 sidecar errors
  await page.route('**/api/loci/current_patient', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  // Intercept AI Metrics endpoint
  await page.route('**/api/ai/metrics', async route => {
    console.log('E2E MOCK: Intercepted POST /api/ai/metrics');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ complexity: 5, stability: 5, certainty: 5 })
    });
  });

  // Intercept AI Stream endpoint to return standard test keywords for all lens verification
  await page.route('**/api/ai/stream', async route => {
    console.log('E2E MOCK: Intercepted POST /api/ai/stream');
    const mockMarkdown = `# Clinical Assessment\nDetails of clinical assessment.\n\n# Diagnostic Workup\nDetails of diagnostic workup.\n\n# Nutritional Interventions\nDetails of nutritional interventions.\n\n# Biomarker Matrix\nDetails of biomarker matrix: Magnesium.\n\n# Immediate (24-72 hours)\nDetails of immediate monitoring.\n\n# Understanding Your health plan\nDetails of patient education.`;
    const chunk = {
      candidates: [{
        content: {
          parts: [{
            text: mockMarkdown
          }]
        }
      }]
    };
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `data: ${JSON.stringify(chunk)}\ndata: [DONE]\n`
    });
  });

  // Intercept AI Changes detection endpoint
  await page.route('**/api/ai/changes', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ significant: false })
    });
  });

  // Intercept AI Chat Start endpoint
  await page.route('**/api/ai/chat/start', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ sessionId: 'mock-session-id' })
    });
  });

  // Intercept AI Chat Message endpoint
  await page.route('**/api/ai/chat/message', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ text: 'This is a mock clinical intelligence response.' })
    });
  });

  // Set local storage flags and disable service workers
  await page.addInitScript((mockClinician) => {
    try {
      window.indexedDB.deleteDatabase('PocketGullDB');
      window.indexedDB.deleteDatabase('pocket-gull-cache');
    } catch (e) {}

    // Mock API key so the Voice Assistant doesn't abort initialization
    (window as any).GEMINI_API_KEY = 'mock-api-key';

    window.localStorage.setItem('pg_tour_seen', '1');
    window.localStorage.setItem('pg_data_consent_v1', 'true');
    if (mockClinician) {
      window.localStorage.setItem('pg_mock_clinician', '1');
    }

    // Disable service worker during tests so Playwright can intercept API requests reliably
    try {
      const mockSW = {
        register: () => Promise.reject(new Error('Service worker disabled for testing')),
        addEventListener: () => {},
        removeEventListener: () => {},
        getRegistration: () => Promise.resolve(undefined),
        getRegistrations: () => Promise.resolve([]),
        controller: null,
        ready: Promise.resolve({ active: null } as any)
      };
      Object.defineProperty(navigator, 'serviceWorker', {
        get() { return mockSW; },
        configurable: true
      });
    } catch (e) {
      console.error('Failed to disable service worker:', e);
    }
  }, options.mockClinician);
}

/** Shared login + demo mode entry flow for all E2E tests */
export async function enterDemoMode(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  let hasAttemptedPin = false;
  const startTime = Date.now();
  while (Date.now() - startTime < 30000) {
    // 0. If splash screen is no longer visible, app is unlocked!
    const splashMain = page.locator('.secure-splash-main');
    const isSplashVisible = await splashMain.isVisible().catch(() => false);
    if (!isSplashVisible) {
      return;
    }

    // 1. PIN entry (only submit once to allow fade-out animation to complete)
    const pinInput = page.locator('input[placeholder="1234"]');
    if (!hasAttemptedPin && await pinInput.isVisible().catch(() => false)) {
      hasAttemptedPin = true;
      await pinInput.fill('1234').catch(() => {});
      await pinInput.press('Enter').catch(() => {});
      await page.waitForTimeout(1000).catch(() => {});
      continue;
    }

    // 2. Demo Mode button
    const demoBtn = page.locator('button', { hasText: 'Demo Mode' });
    if (await demoBtn.isVisible().catch(() => false)) {
      await demoBtn.click().catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      continue;
    }

    // 3. Skip KSS button
    const skipBtn = page.locator('button', { hasText: 'Skip' });
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click().catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      continue;
    }

    // 4. Ethics pledge checkbox & Accept button
    const pledgeCheckbox = page.locator('#pledge-accepted, input[type="checkbox"]').first();
    if (await pledgeCheckbox.isVisible().catch(() => false)) {
      if (!(await pledgeCheckbox.isChecked().catch(() => false))) {
        await pledgeCheckbox.check().catch(() => {});
      }
    }

    const acceptBtn = page.locator('button', { hasText: 'Accept & Enter System' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click().catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      continue;
    }

    await page.waitForTimeout(300).catch(() => {});
  }

  // Final wait for splash screen to disappear
  await page.locator('.secure-splash-main').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
}
