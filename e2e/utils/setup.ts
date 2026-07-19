import { Page } from '@playwright/test';

/**
 * Polls the backend until it is fully responsive to prevent E2E race conditions on CI.
 */
async function waitForBackendToBeReady() {
  const url = 'http://localhost:4200/api/config';
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

  page.on('console', msg => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
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
