import { Page } from '@playwright/test';

/**
 * Common setup for E2E tests.
 * Mocks out hardware telemetry, config, and prevents Service Worker registration.
 */
export async function setupE2ePage(page: Page, options: { mockClinician?: boolean } = { mockClinician: true }) {
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
    } catch (e) {}

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
        ready: new Promise(() => {})
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
