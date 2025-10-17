import { devices, expect, test } from '@playwright/test';

/**
 * Responsive Design Testing Suite
 *
 * Tests the application across different viewport sizes to ensure:
 * - No horizontal scrolling
 * - Readable text
 * - Accessible interactive elements
 * - Proper layout adaptation
 *
 * Run with: bunx playwright test responsive.spec.ts
 */

const viewports = [
  { name: 'Mobile Small', width: 320, height: 568 }, // iPhone SE
  { name: 'Mobile Medium', width: 375, height: 667 }, // iPhone 8
  { name: 'Mobile Large', width: 390, height: 844 }, // iPhone 12/13
  { name: 'Tablet Portrait', width: 768, height: 1024 }, // iPad
  { name: 'Tablet Landscape', width: 1024, height: 768 }, // iPad Landscape
  { name: 'Desktop Small', width: 1280, height: 720 }, // HD
  { name: 'Desktop Medium', width: 1920, height: 1080 }, // Full HD
  { name: 'Desktop Large', width: 2560, height: 1440 }, // QHD
  { name: '4K Desktop', width: 3840, height: 2160 }, // 4K
];

for (const viewport of viewports) {
  test.describe(`Responsive: ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
    });

    test('No horizontal scrolling', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Check for horizontal scrollbar
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      // Allow 1px difference for rounding
      expect(
        scrollWidth,
        `Horizontal scroll detected: scrollWidth (${scrollWidth}) > clientWidth (${clientWidth})`
      ).toBeLessThanOrEqual(clientWidth + 1);
    });

    test('Text is readable (font size check)', async ({ page }) => {
      await page.goto('/');

      // Check minimum font sizes
      const textElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('p, span, div, a, button'));
        return elements
          .filter((el) => el.textContent && el.textContent.trim().length > 0)
          .map((el) => {
            const styles = window.getComputedStyle(el);
            return {
              fontSize: Number.parseFloat(styles.fontSize),
              lineHeight: styles.lineHeight,
            };
          });
      });

      // Minimum font size should be at least 12px (14px recommended)
      const minFontSize = Math.min(...textElements.map((e) => e.fontSize));
      expect(
        minFontSize,
        'Minimum font size should be at least 12px for readability'
      ).toBeGreaterThanOrEqual(12);
    });

    test('Interactive elements are accessible', async ({ page }) => {
      await page.goto('/');

      // Check button and link sizes (at least 44x44px for touch targets)
      const interactiveElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('button, a'));
        return elements.map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            width: rect.width,
            height: rect.height,
          };
        });
      });

      // For mobile viewports, check touch target size
      if (viewport.width < 768) {
        const tooSmallElements = interactiveElements.filter(
          (el) => el.width < 44 || el.height < 44
        );

        if (tooSmallElements.length > 0) {
          console.log(
            `⚠️  ${tooSmallElements.length} interactive elements smaller than 44x44px on ${viewport.name}`
          );
        }

        // Most elements should meet touch target size
        expect(
          tooSmallElements.length,
          'Most interactive elements should be at least 44x44px for touch'
        ).toBeLessThan(interactiveElements.length / 2);
      }
    });

    test('Screenshot capture', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      const filename = viewport.name.toLowerCase().replace(/\s+/g, '-');
      await page.screenshot({
        path: `../../docs/screenshots/responsive-${filename}.jpg`,
        fullPage: true,
        type: 'jpeg',
        quality: 90,
      });
    });
  });
}

test.describe('Responsive: Orientation Changes', () => {
  test('Portrait to Landscape transition', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Rotate to landscape
    await page.setViewportSize({ width: 812, height: 375 });
    await page.waitForTimeout(1000);

    // Check no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

test.describe('Responsive: Device Presets', () => {
  const deviceTests = [
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPad Pro', device: devices['iPad Pro'] },
    { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
  ];

  for (const { name, device } of deviceTests) {
    test(`Device preset: ${name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();

      await page.goto('/');
      await page.waitForTimeout(2000);

      // Verify page loaded correctly
      await expect(page).toHaveTitle(/.+/);

      // Capture screenshot
      const filename = name.toLowerCase().replace(/\s+/g, '-');
      await page.screenshot({
        path: `../../docs/screenshots/device-${filename}.jpg`,
        fullPage: true,
        type: 'jpeg',
        quality: 90,
      });

      await context.close();
    });
  }
});

test.describe('Responsive: Breakpoint Testing', () => {
  const breakpoints = [
    { name: 'xs', width: 375 },
    { name: 'sm', width: 640 },
    { name: 'md', width: 768 },
    { name: 'lg', width: 1024 },
    { name: 'xl', width: 1280 },
    { name: '2xl', width: 1536 },
  ];

  test('Layout adapts at each breakpoint', async ({ page }) => {
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: 800 });
      await page.goto('/');
      await page.waitForTimeout(500);

      // Verify no layout issues
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(
        hasHorizontalScroll,
        `Layout should adapt properly at ${breakpoint.name} breakpoint (${breakpoint.width}px)`
      ).toBe(false);

      console.log(`✓ ${breakpoint.name}: ${breakpoint.width}px`);
    }
  });
});
