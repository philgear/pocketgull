import { test, expect } from '@playwright/test';

test.describe('Medical Chart Vitals and AI Nodes', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Initial Load
    await page.goto('/');
    await expect(page.locator('app-root')).toBeVisible();

    // Base PIN bypass logic using explicit .waitFor()
    const pinInput = page.getByPlaceholder('1234');
    try {
      await pinInput.waitFor({ state: 'visible', timeout: 3000 });
      await pinInput.fill('1234');
      await pinInput.press('Enter');
    } catch (e) {}

    // Bypass Splash Screen by clicking Demo Mode
    const demoBtn = page.locator('text=Demo Mode').first();
    try {
      await demoBtn.waitFor({ state: 'visible', timeout: 3000 });
      await demoBtn.click();
    } catch(e) {}

    
    // Wait for the animation to complete
    await expect(page.locator('app-secure-splash')).not.toBeVisible({ timeout: 10000 });
    await page.setViewportSize({ width: 1440, height: 900 });

    // Open directory and select a patient safely
    const directoryToggle = page.getByRole('button', { name: 'Toggle Patient Directory' }).first();
    await directoryToggle.click();
    
    // Select Sarah Jenkins to get AI nodes
    const patientCard = page.locator('text=Sarah Jenkins').first();
    await expect(patientCard).toBeVisible();
    await patientCard.click();

    // Wait for the Medical Summary to settle
    const currentVisitHeading = page.locator('text=Current Visit / Chief Complaint').first();
    await expect(currentVisitHeading).toBeVisible();
  });

  test('can edit vitals and interact with AI summary nodes', async ({ page }) => {
    // 1. Test Vitals Editing
    // We target the internal input inside the pocket-gull-input mapped via the wrapper id
    const bpInput = page.locator('#vitals-bp input').first();
    const hrInput = page.locator('#vitals-hr input').first();
    
    // Ensure they are visible
    await expect(bpInput).toBeVisible();
    
    // Update Blood Pressure
    await bpInput.fill('120/80');
    // Blur to save state
    await bpInput.blur();
    
    // Update Heart Rate
    await hrInput.fill('75');
    await hrInput.blur();

    // Verify the inputs retain the updated values
    await expect(bpInput).toHaveValue('120/80');
    await expect(hrInput).toHaveValue('75');

    // 2. Test AI Summary Node Interaction
    // Since we are under Sarah Jenkins, she should have existing clinical summary nodes.
    // The nodes are rendered inside app-summary-node
    const summaryNodes = page.locator('app-summary-node');
    // Wait for at least one node to be present
    await expect(summaryNodes.first()).toBeVisible();

    // Hover over the first node to reveal the toolbar
    const firstNode = summaryNodes.first();
    await firstNode.hover();

    // Find the Flag Issue (Reject) button
    const flagBtn = firstNode.locator('[aria-label="Flag Issue"]').first();
    await expect(flagBtn).toBeVisible();
    await flagBtn.click();

    // After flagging, the node wrapper should have class 'opacity-50' or 'grayscale' based on isRejected()
    const nodeWrapper = firstNode.locator('.node-wrapper').first();
    await expect(nodeWrapper).toHaveClass(/opacity-50|grayscale/);

    // Find the Finalize (Bracket/Accept) button
    const finalizeBtn = firstNode.locator('[aria-label="Finalize"]').first();
    await expect(finalizeBtn).toBeVisible();
    await finalizeBtn.click();

    // Clicking Finalize should add the 'bracket-added' class to the internal p or div
    // We check if the bracket-added class is present inside the node-wrapper
    const bracketedContent = nodeWrapper.locator('.bracket-added').first();
    await expect(bracketedContent).toBeVisible();
  });

});
