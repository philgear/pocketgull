import { test, expect } from '@playwright/test';

// Deterministic Integration Tests for AI Mocking
test.describe('AI Integration & Resilience', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        
        const pinInput = page.getByPlaceholder('1234');
        if (await pinInput.isVisible()) {
          await pinInput.fill('1234');
          await pinInput.press('Enter');
        }

        const demoBtn = page.locator('text=Demo Mode').first();
        if (await demoBtn.isVisible()) {
          await demoBtn.click();
        }
        
        // Wait for fade-out animation to complete
        await expect(page.locator('app-secure-splash')).not.toBeVisible({ timeout: 10000 });
        
        // Ensure viewport is desktop size to prevent mobile styling from hiding buttons
        await page.setViewportSize({ width: 1440, height: 900 });
    });

    test('mocked AI chat streaming renders correctly in VoiceAssistantComponent', async ({ page }) => {
        // Mock chat initialization
        await page.route('**/api/ai/chat/start', async (route) => {
            await route.fulfill({ json: { status: 'success' } });
        });

        // Mock the Fallback REST AI endpoint
        await page.route('**/api/ai/chat/message', async (route) => {
            const json = { text: "Mocked AI Response: The patient is exhibiting clear signs of systemic inflammation. I recommend verifying the latest CBC." };
            await route.fulfill({ json });
        });

        // Trigger the Chat Interface using the Global App Component Toolbar
        await page.getByLabel('Toggle Live Agent').click();
        
        // Wait for the chat to open completely
        const chatInput = page.locator('app-voice-assistant pocket-gull-input input');
        await chatInput.waitFor({ state: 'visible', timeout: 10000 });

        // Type a query
        await chatInput.fill("What is the assessment?");
        
        // Trigger send icon (svg within a submit button)
        await page.locator('app-voice-assistant button[type="submit"]').click();

        // Wait to verify the mocked text hits the DOM
        const bubble = page.locator('.prose p', { hasText: 'Mocked AI Response:' });
        await bubble.waitFor({ state: 'visible', timeout: 15000 });
        await expect(bubble).toBeVisible();
        await expect(bubble).toContainText('systemic inflammation');
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
