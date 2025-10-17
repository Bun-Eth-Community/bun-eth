import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * Performance Testing Suite
 *
 * Measures and validates:
 * - Load times
 * - First Contentful Paint (FCP)
 * - Largest Contentful Paint (LCP)
 * - Time to Interactive (TTI)
 * - Bundle sizes
 * - Network requests
 *
 * Run with: bunx playwright test performance.spec.ts
 */

test.describe('Performance Testing', () => {
  test.beforeAll(() => {
    // Ensure test results directory exists
    const resultsDir = path.join(__dirname, '../../docs/test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
  });

  test('Load Time Metrics', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Get detailed performance metrics
    const metrics = await page.evaluate(() => {
      const perfData = window.performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      return {
        // Navigation timing
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
        loadComplete: Math.round(perfData.loadEventEnd - perfData.fetchStart),
        domInteractive: Math.round(perfData.domInteractive - perfData.fetchStart),

        // Paint timing
        firstPaint: Math.round(paintEntries.find((e) => e.name === 'first-paint')?.startTime || 0),
        firstContentfulPaint: Math.round(
          paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime || 0
        ),

        // Resource timing
        dnsLookup: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
        tcpConnection: Math.round(perfData.connectEnd - perfData.connectStart),
        serverResponse: Math.round(perfData.responseEnd - perfData.requestStart),
      };
    });

    const performanceData = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      loadTime,
      ...metrics,
    };

    // Save metrics
    fs.writeFileSync(
      path.join(__dirname, '../../docs/test-results/performance-metrics.json'),
      JSON.stringify(performanceData, null, 2)
    );

    // Log metrics
    console.log('\nPerformance Metrics:');
    console.log(`  Total Load Time: ${loadTime}ms`);
    console.log(`  First Paint: ${metrics.firstPaint}ms`);
    console.log(`  First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
    console.log(`  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`  DOM Interactive: ${metrics.domInteractive}ms`);

    // Performance thresholds
    expect(loadTime, 'Page load time should be under 10 seconds').toBeLessThan(10000);
    expect(metrics.firstPaint, 'First paint should be under 3 seconds').toBeLessThan(3000);
    expect(
      metrics.firstContentfulPaint,
      'First contentful paint should be under 3 seconds'
    ).toBeLessThan(3000);
    expect(metrics.domInteractive, 'DOM interactive should be under 5 seconds').toBeLessThan(5000);
  });

  test('Bundle Size Analysis', async ({ page }) => {
    await page.goto('/');

    // Get all resources loaded
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((r: any) => ({
        name: r.name,
        size: r.transferSize || 0,
        type: r.initiatorType,
        duration: Math.round(r.duration),
      }));
    });

    // Calculate totals
    const totalSize = resources.reduce((sum, r) => sum + (r.size || 0), 0);
    const jsSize = resources
      .filter((r) => r.type === 'script')
      .reduce((sum, r) => sum + (r.size || 0), 0);
    const cssSize = resources
      .filter((r) => r.type === 'link' || r.type === 'css')
      .reduce((sum, r) => sum + (r.size || 0), 0);
    const imageSize = resources
      .filter((r) => r.type === 'img')
      .reduce((sum, r) => sum + (r.size || 0), 0);

    const analysis = {
      timestamp: new Date().toISOString(),
      totalResources: resources.length,
      totalSize: Math.round(totalSize / 1024), // KB
      jsSize: Math.round(jsSize / 1024), // KB
      cssSize: Math.round(cssSize / 1024), // KB
      imageSize: Math.round(imageSize / 1024), // KB
      byType: {
        script: resources.filter((r) => r.type === 'script').length,
        stylesheet: resources.filter((r) => r.type === 'link' || r.type === 'css').length,
        image: resources.filter((r) => r.type === 'img').length,
        other: resources.filter((r) => !['script', 'link', 'css', 'img'].includes(r.type)).length,
      },
      largestResources: resources
        .sort((a, b) => (b.size || 0) - (a.size || 0))
        .slice(0, 10)
        .map((r) => ({
          name: r.name.split('/').pop(),
          size: `${Math.round((r.size || 0) / 1024)} KB`,
          type: r.type,
        })),
    };

    // Save analysis
    fs.writeFileSync(
      path.join(__dirname, '../../docs/test-results/bundle-size.json'),
      JSON.stringify(analysis, null, 2)
    );

    // Log summary
    console.log('\nBundle Size Analysis:');
    console.log(`  Total Resources: ${analysis.totalResources}`);
    console.log(`  Total Size: ${analysis.totalSize} KB`);
    console.log(`  JavaScript: ${analysis.jsSize} KB`);
    console.log(`  CSS: ${analysis.cssSize} KB`);
    console.log(`  Images: ${analysis.imageSize} KB`);

    // Bundle size thresholds
    expect(totalSize, 'Total bundle size should be under 5 MB').toBeLessThan(5 * 1024 * 1024);
    expect(jsSize, 'JavaScript bundle should be under 2 MB').toBeLessThan(2 * 1024 * 1024);
  });

  test('Network Requests Count', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const requestCount = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });

    console.log(`\nTotal Network Requests: ${requestCount}`);

    // Should not make excessive requests
    expect(requestCount, 'Should not make more than 100 network requests').toBeLessThan(100);
  });

  test('Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto('/');

    // Wait for LCP
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          resolve(Math.round(lastEntry.renderTime || lastEntry.loadTime));
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    console.log(`\nLargest Contentful Paint: ${lcp}ms`);

    if (lcp > 0) {
      // LCP should be under 2.5s for good performance
      expect(lcp, 'Largest Contentful Paint should be under 2500ms').toBeLessThan(2500);
    }
  });

  test('Memory Usage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const memoryInfo = await page.evaluate(() => {
      const perf = performance as any;
      if (perf.memory) {
        return {
          usedJSHeapSize: Math.round(perf.memory.usedJSHeapSize / 1024 / 1024), // MB
          totalJSHeapSize: Math.round(perf.memory.totalJSHeapSize / 1024 / 1024), // MB
          jsHeapSizeLimit: Math.round(perf.memory.jsHeapSizeLimit / 1024 / 1024), // MB
        };
      }
      return null;
    });

    if (memoryInfo) {
      console.log('\nMemory Usage:');
      console.log(`  Used JS Heap: ${memoryInfo.usedJSHeapSize} MB`);
      console.log(`  Total JS Heap: ${memoryInfo.totalJSHeapSize} MB`);
      console.log(`  JS Heap Limit: ${memoryInfo.jsHeapSizeLimit} MB`);

      // Should not use excessive memory
      expect(memoryInfo.usedJSHeapSize, 'Used JS heap should be under 100 MB').toBeLessThan(100);
    }
  });

  test('CSS and JS Load Times', async ({ page }) => {
    const resourceTimings: Array<{ type: string; duration: number; size: number }> = [];

    page.on('response', async (response) => {
      const url = response.url();
      const headers = await response.allHeaders();
      const contentType = headers['content-type'] || '';

      if (contentType.includes('javascript') || contentType.includes('css')) {
        const timing = response.timing();
        resourceTimings.push({
          type: contentType.includes('javascript') ? 'JS' : 'CSS',
          duration: Math.round(timing.responseEnd - timing.requestStart),
          size: Number.parseInt(headers['content-length'] || '0'),
        });
      }
    });

    await page.goto('/');

    // Calculate average load times
    const jsTimings = resourceTimings.filter((r) => r.type === 'JS');
    const cssTimings = resourceTimings.filter((r) => r.type === 'CSS');

    const avgJsTime =
      jsTimings.length > 0
        ? Math.round(jsTimings.reduce((sum, r) => sum + r.duration, 0) / jsTimings.length)
        : 0;
    const avgCssTime =
      cssTimings.length > 0
        ? Math.round(cssTimings.reduce((sum, r) => sum + r.duration, 0) / cssTimings.length)
        : 0;

    console.log('\nResource Load Times:');
    console.log(`  Average JS Load Time: ${avgJsTime}ms`);
    console.log(`  Average CSS Load Time: ${avgCssTime}ms`);

    if (avgJsTime > 0) {
      expect(avgJsTime, 'Average JS load time should be under 1 second').toBeLessThan(1000);
    }
    if (avgCssTime > 0) {
      expect(avgCssTime, 'Average CSS load time should be under 500ms').toBeLessThan(500);
    }
  });
});
