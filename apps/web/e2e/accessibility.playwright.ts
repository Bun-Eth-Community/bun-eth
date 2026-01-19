import * as fs from 'node:fs';
import * as path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Accessibility Testing Suite (WCAG 2.1 AA Compliance)
 *
 * Tests the application for accessibility issues following:
 * - WCAG 2.0 Level A & AA
 * - WCAG 2.1 Level A & AA
 * - Keyboard navigation
 * - Screen reader compatibility
 * - Color contrast ratios
 * - ARIA attributes
 *
 * Run with: bunx playwright test accessibility.spec.ts
 */

test.describe('Accessibility Testing (WCAG 2.1 AA)', () => {
  test.beforeAll(() => {
    // Ensure test results directory exists
    const resultsDir = path.join(__dirname, '../../docs/test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
  });

  test('Homepage WCAG 2.1 AA Compliance', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Save detailed report
    fs.writeFileSync(
      path.join(__dirname, '../../docs/test-results/accessibility-report.json'),
      JSON.stringify(accessibilityScanResults, null, 2)
    );

    // Generate human-readable summary
    const summary = {
      url: page.url(),
      timestamp: new Date().toISOString(),
      violations: {
        total: accessibilityScanResults.violations.length,
        critical: accessibilityScanResults.violations.filter((v) => v.impact === 'critical').length,
        serious: accessibilityScanResults.violations.filter((v) => v.impact === 'serious').length,
        moderate: accessibilityScanResults.violations.filter((v) => v.impact === 'moderate').length,
        minor: accessibilityScanResults.violations.filter((v) => v.impact === 'minor').length,
      },
      passes: accessibilityScanResults.passes.length,
    };

    fs.writeFileSync(
      path.join(__dirname, '../../docs/test-results/accessibility-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('\nAccessibility Violations Found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`   ${violation.description}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Affected elements: ${violation.nodes.length}`);
      });
    }

    // Fail on critical or serious violations only
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(
      criticalViolations.length,
      `Found ${criticalViolations.length} critical/serious accessibility violations. See docs/test-results/accessibility-report.json for details.`
    ).toBe(0);
  });

  test('Keyboard Navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Test tab navigation
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocusedElement).toBeDefined();
    expect(firstFocusedElement).not.toBe('BODY');

    // Test multiple tab presses
    const focusedElements: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const element = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName + (el?.getAttribute('role') ? `:${el.getAttribute('role')}` : '');
      });
      focusedElements.push(element);
    }

    // Should have focused multiple different elements
    const uniqueElements = new Set(focusedElements);
    expect(uniqueElements.size).toBeGreaterThan(1);

    // Test reverse tab
    await page.keyboard.press('Shift+Tab');
    const reverseFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(reverseFocused).toBeDefined();
  });

  test('Color Contrast', async ({ page }) => {
    await page.goto('/');

    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    const contrastViolations = contrastResults.violations.filter((v) =>
      v.id.includes('color-contrast')
    );

    expect(contrastViolations.length, 'Color contrast should meet WCAG AA standards').toBe(0);
  });

  test('Form Labels and ARIA', async ({ page }) => {
    await page.goto('/');

    const formResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('body')
      .analyze();

    const formViolations = formResults.violations.filter(
      (v) => v.id.includes('label') || v.id.includes('aria')
    );

    if (formViolations.length > 0) {
      console.log('\nForm/ARIA Violations:');
      formViolations.forEach((v) => {
        console.log(`- ${v.id}: ${v.description}`);
      });
    }

    expect(
      formViolations.length,
      'All form elements should have proper labels and ARIA attributes'
    ).toBe(0);
  });

  test('Heading Hierarchy', async ({ page }) => {
    await page.goto('/');

    const headings = await page.evaluate(() => {
      const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headingElements.map((h) => ({
        level: Number.parseInt(h.tagName.substring(1)),
        text: h.textContent?.trim().substring(0, 50),
      }));
    });

    // Should have at least one h1
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count, 'Page should have exactly one h1 element').toBe(1);

    // Check for proper heading hierarchy (no skipped levels)
    for (let i = 1; i < headings.length; i++) {
      const currentLevel = headings[i].level;
      const previousLevel = headings[i - 1].level;
      const levelDiff = currentLevel - previousLevel;

      expect(
        levelDiff,
        `Heading hierarchy broken: h${previousLevel} followed by h${currentLevel}`
      ).toBeLessThanOrEqual(1);
    }
  });

  test('Alt Text for Images', async ({ page }) => {
    await page.goto('/');

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter((img) => !img.hasAttribute('alt')).length;
    });

    expect(imagesWithoutAlt, 'All images should have alt attributes').toBe(0);
  });

  test('Focus Indicators', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Check if focused element has visible focus indicator
    const hasFocusIndicator = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);

      // Check for outline or box-shadow (common focus indicators)
      const hasOutline = styles.outline !== 'none' && styles.outline !== '';
      const hasBoxShadow = styles.boxShadow !== 'none';
      const hasFocusVisible = el.matches(':focus-visible');

      return hasOutline || hasBoxShadow || hasFocusVisible;
    });

    expect(hasFocusIndicator, 'Focused elements should have visible focus indicators').toBe(true);
  });

  test('Skip to Main Content Link', async ({ page }) => {
    await page.goto('/');

    // Press tab to focus first element (usually skip link)
    await page.keyboard.press('Tab');

    // Check if skip link exists
    const skipLink = await page.evaluate(() => {
      const el = document.activeElement;
      const text = el?.textContent?.toLowerCase();
      return text?.includes('skip') || el?.getAttribute('href') === '#main';
    });

    // This is optional but recommended for accessibility
    if (!skipLink) {
      console.log('⚠️  Consider adding a "Skip to main content" link');
    }
  });
});
