import { expect, test } from '@playwright/test';

/**
 * Visual Regression Testing Suite
 *
 * Captures screenshots for visual comparison to detect unintended UI changes.
 * These baselines can be used with visual regression services like:
 * - Percy (https://percy.io)
 * - Chromatic (https://www.chromatic.com)
 * - Playwright's built-in toHaveScreenshot()
 *
 * Run with: bunx playwright test visual-regression.spec.ts --config=playwright.screenshots.config.ts
 */

test.describe('Visual Regression Testing', () => {
  test('Full page baseline - Desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for any animations to complete
    await page.waitForTimeout(2000);

    // Capture full page JPEG (smaller file size for docs)
    await page.screenshot({
      path: '../../docs/screenshots/regression-full-page.jpg',
      fullPage: true,
      type: 'jpeg',
      quality: 90,
    });

    // Capture PNG for pixel-perfect comparison
    await page.screenshot({
      path: '../../docs/screenshots/regression-full-page.png',
      fullPage: true,
    });
  });

  test('Above the fold - Hero section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Capture hero section (first 900px)
    await page.screenshot({
      path: '../../docs/screenshots/regression-hero.jpg',
      clip: { x: 0, y: 0, width: 1920, height: 900 },
      type: 'jpeg',
      quality: 95,
    });
  });

  test('Component baselines', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Capture wallet status section
    const walletSection = page.locator('text=Wallet Status').locator('..');
    if (await walletSection.isVisible()) {
      await walletSection.screenshot({
        path: '../../docs/screenshots/regression-wallet-section.png',
      });
    }

    // Capture feature cards if they exist
    const featuresSection = page.locator('text=Contract Hot Reload').locator('..').locator('..');
    if (await featuresSection.isVisible()) {
      await featuresSection.screenshot({
        path: '../../docs/screenshots/regression-features.png',
      });
    }
  });

  test('Dark mode baseline (if supported)', async ({ page }) => {
    await page.goto('/');

    // Try to enable dark mode
    const darkModeToggle = page.getByRole('button', { name: /theme|dark|light/i });
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: '../../docs/screenshots/regression-dark-mode.jpg',
        fullPage: true,
        type: 'jpeg',
        quality: 90,
      });
    }
  });

  test('Interactive states - Hover', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Find first interactive button
    const button = page.getByRole('button').first();
    if (await button.isVisible()) {
      await button.hover();
      await page.waitForTimeout(500);

      await button.screenshot({
        path: '../../docs/screenshots/regression-button-hover.png',
      });
    }
  });
});
