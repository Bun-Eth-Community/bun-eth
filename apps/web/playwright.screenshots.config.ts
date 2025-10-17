import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for screenshot tests
 *
 * This config is specifically for screenshot generation and visual regression testing.
 * It does NOT start a webServer, assuming the dev server is already running.
 *
 * Usage:
 *   bunx playwright test --config=playwright.screenshots.config.ts
 *
 * Prerequisites:
 *   - Dev server must be running (task dev:up or bun run dev)
 *   - Contracts must be deployed
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'line',
  timeout: 60000,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'off',
    screenshot: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // NO webServer - assumes it's already running
  // This prevents conflicts with running dev servers
});
