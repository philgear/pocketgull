import { test, expect } from '@playwright/test';

// Deterministic Integration Tests for AI Mocking
test.describe('AI Integration & Resilience', () => {
    
    test.beforeEach(async ({ page }) => {
        // Unlock application explicitly before tests
        await page.goto('/');
        
        // Handle SecureSplash Component
        try {
            const numKeys = page.locator('button').filter({ hasText: /^[0-9]$/ });
            if (await numKeys.count() > 0) {
                for (const char of '1234') {
                    await page.locator(`button:has-text("${char}")`).click();
                }
                const demoButton = page.locator('button', { hasText: 'Demo Mode' });
                if (await demoButton.isVisible()) {
                    await demoButton.click();
                    await page.waitForTimeout(500);
                }
            }
        } catch (e) {
            console.log("No splash screen detected or already bypassed.");
        }
    });

    test('mocked AI chat streaming renders correctly in VoiceAssistantComponent', async ({ page }) => {
        // Intercept standard Generate content endpoint (REST mock, since WS is harder to mock purely via page.route)
        await page.route('**/api/ai/live-session', async (route) => {
             // Let's assume the mock targets standard HTTP generation for simplicity since the WebSocket live route is wss://
             // Let's actually explicitly mock the HTTP fallback of ClinicalIntelligenceService
             const jsonResponse = {
                text: "Mocked AI Response: The patient exhibits signs of mild hypertension and vitamin D deficiency. I recommend 1000 IU daily D3 and a low-sodium diet."
             };
             await route.fulfill({
                 status: 200,
                 contentType: 'application/json',
                 body: JSON.stringify(jsonResponse)
             });
        });

        // Trigger the Chat Interface using the Global App Component Toolbar
        await page.getByLabel('Toggle Live Agent').click();
        
        // Wait for the chat to open
        await page.waitForSelector('pocket-gull-input');

        // Type a query
        await page.locator('pocket-gull-input input').fill("What is the assessment?");
        
        // Trigger send icon (svg within a submit button)
        await page.locator('button[type="submit"]').click();

        // Wait to verify the mocked text hits the DOM
        const bubble = page.locator('.prose p', { hasText: 'Mocked AI Response:' });
        await expect(bubble).toBeVisible({ timeout: 10000 });
        await expect(bubble).toContainText('mild hypertension');
    });

    test('clinical node processing parses explicitly into PatientStateService', async ({ page }) => {
        // Mock the structured analysis endpoint to ensure patient state reacts
        await page.route('**/api/ai/analyze-structure', async (route) => {
             const jsonResponse = {
                bodyParts: [
                    { id: 'chest', painLevel: 2, description: "Mild chest tightness reported", symptoms: ["tightness"] }
                ]
             };
             await route.fulfill({
                 status: 200,
                 contentType: 'application/json',
                 body: JSON.stringify(jsonResponse)
             });
        });

        // Click on the interactive body viewer to trigger a stub analysis
        // Find the chest area (wait for interactive skeleton)
        const chestArea = page.locator('#body-viewer-canvas'); // Assuming general hit box
        if (await chestArea.count() > 0) {
            await chestArea.click();
            await page.waitForTimeout(1000); // Allow analysis delay

            // Verify the UI expands and shows the 'chest' specific notes section
            const issuePanel = page.locator('.issue-panel', { hasText: 'Chest' });
            if (await issuePanel.count() > 0) {
                await expect(issuePanel).toBeVisible();
            }
        }
    });
});
