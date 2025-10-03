import { test, expect } from '@playwright/test';

test.describe('Basic Web App Rendering', () => {
  test('should load the homepage and display key elements', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Bun-Eth App/);

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: /Bun-Eth Scaffold/i })).toBeVisible();

    // Check that the subtitle is visible
    await expect(page.getByText(/Build Ethereum dApps at lightning speed/i)).toBeVisible();

    // Check that wallet connection section is present
    await expect(page.getByText(/Wallet Status/i)).toBeVisible();
    await expect(page.getByText(/Connect your wallet to get started/i)).toBeVisible();

    // Check that feature cards are rendered
    await expect(page.getByText(/Contract Hot Reload/i)).toBeVisible();
    await expect(page.getByText(/Custom Hooks/i)).toBeVisible();
    await expect(page.getByText(/Web3 Components/i)).toBeVisible();
    await expect(page.getByText(/Bun Runtime/i)).toBeVisible();
    await expect(page.getByText(/Foundry Integration/i)).toBeVisible();
    await expect(page.getByText(/RainbowKit/i)).toBeVisible();

    // Check that Quick Start section is visible
    await expect(page.getByText(/Quick Start/i)).toBeVisible();
    await expect(page.getByText(/task dev:up/i)).toBeVisible();
    await expect(page.getByText(/task contracts:deploy/i)).toBeVisible();
  });

  test('should have working network selector', async ({ page }) => {
    await page.goto('/');

    // Check that network selector button is visible
    const networkButton = page.getByRole('button', { name: /Select Network/i });
    await expect(networkButton).toBeVisible();

    // Check for network indicator element exists
    await expect(page.locator('span.bg-green-500')).toHaveCount(1);
  });
});
