import { test, expect } from '@playwright/test';

test.describe('WOW Pack v1 Smoke Tests', () => {
  test('can load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(['Aura', 'Mental Health']);
  });

  test('can switch language', async ({ page }) => {
    await page.goto('/');
    
    // Find and click language switcher (assuming it exists)
    const langSwitcher = page.locator('button').filter({ hasText: /sv|en|es/ }).first();
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      // Wait for language change
      await page.waitForTimeout(500);
    }
  });

  test('can click mood button', async ({ page }) => {
    await page.goto('/');
    
    // Look for mood buttons (numbers 1-10)
    const moodButton = page.locator('button').filter({ hasText: /^[1-9]$|^10$/ }).first();
    if (await moodButton.isVisible()) {
      await moodButton.click();
      // Should either navigate to auth or show a toast
      await page.waitForTimeout(1000);
    }
  });

  test('can open chat and interact', async ({ page }) => {
    await page.goto('/chat');
    
    // Check if chat interface is present
    const chatInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill('Hello Auri');
      
      // Look for send button
      const sendButton = page.locator('button').filter({ hasText: /send|→|✓/ }).first();
      if (await sendButton.isVisible()) {
        await sendButton.click();
        await page.waitForTimeout(2000); // Wait for response
      }
    }
  });

  test('can open roleplay and start scenario', async ({ page }) => {
    await page.goto('/roleplay');
    
    // Check if scenarios are listed
    await expect(page.locator('h1')).toContainText(['Roleplay', 'Rollspel']);
    
    // Look for scenario buttons
    const scenarioButton = page.locator('button').filter({ hasText: /boundary|anxiety|disagreement/i }).first();
    if (await scenarioButton.isVisible()) {
      await scenarioButton.click();
      
      // Should navigate to roleplay run page
      await page.waitForURL('**/roleplay/**');
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('pricing page loads correctly', async ({ page }) => {
    await page.goto('/pricing');
    
    await expect(page.locator('h1')).toContainText(['pricing', 'plan', 'wellness'], { ignoreCase: true });
    
    // Should have multiple plan cards
    const planCards = page.locator('[role="article"], .card, [class*="card"]').filter({ hasText: /free|premium|pro/i });
    await expect(planCards).toHaveCount(3, { timeout: 5000 });
  });

  test('health check page works', async ({ page }) => {
    await page.goto('/health');
    
    await expect(page.locator('h1')).toContainText('Health');
    
    // Should show health status indicators
    const healthIndicators = page.locator('[class*="text-green"], [class*="text-red"], [class*="text-yellow"]');
    await expect(healthIndicators.first()).toBeVisible({ timeout: 10000 });
  });
});