import * as fs from 'node:fs';
import * as path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Complete Test Suite
 *
 * A comprehensive test suite that runs all quality checks:
 * 1. Visual Regression
 * 2. Accessibility (WCAG 2.1 AA)
 * 3. Performance
 * 4. Responsive Design
 * 5. Functional Tests
 *
 * This is ideal for CI/CD pipelines and production deployments.
 *
 * Run with: bunx playwright test complete-test-suite.spec.ts
 */

test.describe('Complete Test Suite', () => {
  test.beforeAll(() => {
    // Ensure directories exist
    const dirs = [
      path.join(__dirname, '../../docs/test-results'),
      path.join(__dirname, '../../docs/screenshots'),
    ];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });

  test.describe('Visual Regression', () => {
    test('Full page baseline', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: '../../docs/screenshots/regression-full-page.jpg',
        fullPage: true,
        type: 'jpeg',
        quality: 90,
      });
    });

    test('Hero section baseline', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: '../../docs/screenshots/regression-hero.jpg',
        clip: { x: 0, y: 0, width: 1920, height: 900 },
        type: 'jpeg',
        quality: 95,
      });
    });
  });

  test.describe('Accessibility (WCAG 2.1 AA)', () => {
    test('Homepage scan', async ({ page }) => {
      await page.goto('/');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Save report
      fs.writeFileSync(
        path.join(__dirname, '../../docs/test-results/accessibility-report.json'),
        JSON.stringify(results, null, 2)
      );

      // Log violations
      if (results.violations.length > 0) {
        console.log(`\n⚠️  Found ${results.violations.length} accessibility violations:`);
        results.violations.forEach((v, i) => {
          console.log(`  ${i + 1}. ${v.id} (${v.impact}): ${v.description}`);
        });
      }

      // Fail on critical/serious only
      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(
        criticalViolations.length,
        `Found ${criticalViolations.length} critical/serious accessibility violations`
      ).toBe(0);
    });

    test('Keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);

      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);

      expect(firstFocused).toBeDefined();
      expect(firstFocused).not.toBe('BODY');
    });
  });

  test.describe('Performance', () => {
    test('Load time < 10s', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      const metrics = await page.evaluate(() => {
        const perfData = window.performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');

        return {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
          firstPaint: Math.round(
            paintEntries.find((e) => e.name === 'first-paint')?.startTime || 0
          ),
          firstContentfulPaint: Math.round(
            paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime || 0
          ),
        };
      });

      const performanceData = {
        timestamp: new Date().toISOString(),
        loadTime,
        ...metrics,
      };

      fs.writeFileSync(
        path.join(__dirname, '../../docs/test-results/performance-metrics.json'),
        JSON.stringify(performanceData, null, 2)
      );

      console.log(
        `\nPerformance: Load ${loadTime}ms | FP ${metrics.firstPaint}ms | FCP ${metrics.firstContentfulPaint}ms`
      );

      expect(loadTime).toBeLessThan(10000);
      expect(metrics.firstPaint).toBeLessThan(3000);
    });

    test('Bundle size analysis', async ({ page }) => {
      await page.goto('/');

      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map((r: any) => ({
          name: r.name,
          size: r.transferSize || 0,
          type: r.initiatorType,
        }));
      });

      const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
      const jsSize = resources
        .filter((r) => r.type === 'script')
        .reduce((sum, r) => sum + r.size, 0);

      const analysis = {
        timestamp: new Date().toISOString(),
        totalResources: resources.length,
        totalSize: Math.round(totalSize / 1024), // KB
        jsSize: Math.round(jsSize / 1024), // KB
      };

      fs.writeFileSync(
        path.join(__dirname, '../../docs/test-results/bundle-size.json'),
        JSON.stringify(analysis, null, 2)
      );

      console.log(
        `\nBundle: ${analysis.totalSize}KB total | ${analysis.jsSize}KB JS | ${analysis.totalResources} requests`
      );

      expect(totalSize).toBeLessThan(5 * 1024 * 1024); // 5 MB
      expect(jsSize).toBeLessThan(2 * 1024 * 1024); // 2 MB
    });
  });

  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      test(`${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Check for horizontal scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        expect(scrollWidth, `No horizontal scroll on ${viewport.name}`).toBeLessThanOrEqual(
          clientWidth + 1
        );

        // Capture screenshot
        await page.screenshot({
          path: `../../docs/screenshots/responsive-${viewport.name}.jpg`,
          fullPage: true,
          type: 'jpeg',
          quality: 90,
        });
      });
    }
  });

  test.describe('Functional', () => {
    test('Homepage loads successfully', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveTitle(/.+/);
      await expect(page.getByRole('heading').first()).toBeVisible();
    });

    test('Navigation is accessible', async ({ page }) => {
      await page.goto('/');

      // Should have navigation elements
      const links = await page.getByRole('link').count();
      expect(links).toBeGreaterThan(0);
    });

    test('Connect wallet section is visible', async ({ page }) => {
      await page.goto('/');

      // Should have wallet-related content
      const walletElements = page.getByText(/wallet/i);
      await expect(walletElements.first()).toBeVisible();
    });
  });

  test.afterAll(() => {
    // Generate test summary
    const summary = {
      timestamp: new Date().toISOString(),
      testRun: 'Complete Test Suite',
      status: 'completed',
      artifacts: {
        screenshots: 'docs/screenshots/',
        testResults: 'docs/test-results/',
      },
    };

    fs.writeFileSync(
      path.join(__dirname, '../../docs/test-results/test-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n✅ Complete test suite finished!');
    console.log('📊 Results saved to docs/test-results/');
    console.log('📸 Screenshots saved to docs/screenshots/');
  });
});
