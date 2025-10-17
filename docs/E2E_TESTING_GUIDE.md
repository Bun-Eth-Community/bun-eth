# E2E Testing Guide

Comprehensive guide for end-to-end testing in the bun-eth template.

## Table of Contents

- [Overview](#overview)
- [Test Layers](#test-layers)
- [Quick Start](#quick-start)
- [Test Commands](#test-commands)
- [Writing Tests](#writing-tests)
- [Advanced Features](#advanced-features)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The bun-eth template includes a comprehensive E2E testing suite that covers multiple quality dimensions:

1. **Visual Regression** - Detect unintended UI changes
2. **Accessibility** - WCAG 2.1 AA compliance
3. **Performance** - Load times, bundle sizes, metrics
4. **Responsive Design** - Cross-device compatibility
5. **Functional** - Core app functionality

## Test Layers

### 1. Visual Regression Testing

Captures screenshots for visual comparison to detect UI changes.

**Files:**
- `apps/web/e2e/visual-regression.spec.ts`

**Features:**
- Full page screenshots
- Component-level captures
- Dark mode baselines
- Interactive state captures

**Run:**
```bash
task test:e2e:visual
```

### 2. Accessibility Testing (WCAG 2.1 AA)

Ensures the application is accessible to all users.

**Files:**
- `apps/web/e2e/accessibility.spec.ts`

**Tests:**
- WCAG 2.0/2.1 Level A & AA compliance
- Keyboard navigation
- Color contrast ratios
- Screen reader compatibility
- ARIA attributes
- Focus indicators
- Heading hierarchy

**Run:**
```bash
task test:e2e:accessibility
```

**Results:**
- `docs/test-results/accessibility-report.json` - Detailed violations
- `docs/test-results/accessibility-summary.json` - Summary stats

### 3. Performance Testing

Measures and validates performance metrics.

**Files:**
- `apps/web/e2e/performance.spec.ts`

**Metrics:**
- Total load time
- First Paint (FP)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- DOM Interactive time
- Bundle sizes (total, JS, CSS)
- Network request counts
- Memory usage

**Run:**
```bash
task test:e2e:performance
```

**Results:**
- `docs/test-results/performance-metrics.json`
- `docs/test-results/bundle-size.json`

**Thresholds:**
- Load time: < 10s
- First Paint: < 3s
- Total bundle: < 5 MB
- JS bundle: < 2 MB

### 4. Responsive Design Testing

Tests the application across different viewport sizes.

**Files:**
- `apps/web/e2e/responsive.spec.ts`

**Viewports:**
- Mobile: 320px, 375px, 390px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px, 2560px, 3840px

**Tests:**
- No horizontal scrolling
- Readable text (min 12px)
- Touch target sizes (44x44px on mobile)
- Layout adaptation at breakpoints

**Run:**
```bash
task test:e2e:responsive
```

**Screenshots:**
- Saved to `docs/screenshots/responsive-*.jpg`

### 5. Complete Test Suite

Runs all test layers in a single command.

**Files:**
- `apps/web/e2e/complete-test-suite.spec.ts`

**Run:**
```bash
task test:e2e:complete
```

## Quick Start

### Prerequisites

1. **Start Development Stack:**
   ```bash
   task dev:up
   ```

2. **Deploy Contracts:**
   ```bash
   task contracts:deploy
   ```

3. **Verify Services:**
   ```bash
   task dev:status
   ```

### Running Tests

**Run all tests:**
```bash
task test:e2e:complete
```

**Run specific test layer:**
```bash
task test:e2e:visual        # Visual regression
task test:e2e:accessibility  # Accessibility
task test:e2e:performance    # Performance
task test:e2e:responsive     # Responsive design
```

**Generate screenshots:**
```bash
task test:e2e:screenshots
```

**View test report:**
```bash
cd apps/web
bunx playwright show-report
```

## Test Commands

### Available Commands

```bash
# Complete test suite
task test:e2e:complete

# Individual test layers
task test:e2e:visual
task test:e2e:accessibility
task test:e2e:performance
task test:e2e:responsive

# Screenshot generation
task test:e2e:screenshots

# Standard e2e tests
task test:e2e           # With webServer
task test:e2e:ui        # UI mode

# All tests
task test:all           # Unit + Contracts + E2E
```

### Playwright Commands

```bash
cd apps/web

# Run all tests
bunx playwright test

# Run specific file
bunx playwright test e2e/accessibility.spec.ts

# Run with UI
bunx playwright test --ui

# Run specific test
bunx playwright test -g "WCAG"

# Show report
bunx playwright show-report

# Debug mode
bunx playwright test --debug
```

## Writing Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');

    // Your test code
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

### Using Mock Helpers

```typescript
import { mockContractCalls } from './helpers/mock-wallet';

test('Contract state test', async ({ page }) => {
  // Mock contract state
  await mockContractCalls(page, {
    isOpen: true,
    price: '1000000000000000', // 0.001 ETH
    cap: '1000000000000000000000', // 1000 ETH
  });

  await page.goto('/');

  // Test with mocked state
});
```

### Screenshot Capture

```typescript
test('Screenshot test', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);

  // Full page screenshot
  await page.screenshot({
    path: '../../docs/screenshots/my-screenshot.jpg',
    fullPage: true,
    type: 'jpeg',
    quality: 90,
  });

  // Component screenshot
  const element = page.locator('[data-testid="my-component"]');
  await element.screenshot({
    path: '../../docs/screenshots/component.png',
  });
});
```

## Advanced Features

### Blockchain Time Manipulation

Test time-dependent contracts by manipulating Anvil time:

```typescript
import { increaseTime } from './helpers/mock-wallet';

test('Time-dependent test', async ({ page }) => {
  // Increase time by 2 hours
  await increaseTime(7200);

  await page.goto('/');
  // Test contract state after time increase
});
```

**Requirements:**
- Anvil must be running
- `cast` CLI must be installed (part of Foundry)

### RPC Mocking

Test different contract states without real transactions:

```typescript
import { mockContractCalls } from './helpers/mock-wallet';

test('Sale closed state', async ({ page }) => {
  await mockContractCalls(page, {
    isOpen: false,
    hasClosed: true,
    weiRaised: '1000000000000000000000', // Cap reached
  });

  await page.goto('/');
  await expect(page.getByText(/sale has ended/i)).toBeVisible();
});
```

### Multiple Viewports

```typescript
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1920, height: 1080 },
];

for (const viewport of viewports) {
  test(`Test on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    // Test code
  });
}
```

## CI/CD Integration

### GitHub Actions

The CI workflow automatically runs E2E tests:

```yaml
# .github/workflows/ci.yml
- name: Install Playwright browsers
  working-directory: apps/web
  run: bunx playwright install chromium --with-deps

- name: Run e2e tests
  working-directory: apps/web
  run: bun run test:e2e
```

### Test Artifacts

Test results and screenshots are uploaded as artifacts:

```yaml
- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: apps/web/playwright-report/
    retention-days: 30
```

## Troubleshooting

### Tests Hanging

**Problem:** Tests hang indefinitely

**Solutions:**
1. Use the screenshot config (no webServer):
   ```bash
   bunx playwright test --config=playwright.screenshots.config.ts
   ```

2. Ensure dev server is running:
   ```bash
   task dev:up
   ```

3. Check port conflicts:
   ```bash
   lsof -i :3000  # Check if port is in use
   ```

### Accessibility Violations

**Problem:** Tests fail with accessibility violations

**Solutions:**
1. Check the detailed report:
   ```bash
   cat docs/test-results/accessibility-report.json
   ```

2. Common fixes:
   - Add alt text to images
   - Use proper heading hierarchy (h1 → h2 → h3)
   - Ensure sufficient color contrast
   - Add ARIA labels to interactive elements
   - Make sure focus indicators are visible

### Performance Failures

**Problem:** Performance tests fail thresholds

**Solutions:**
1. Check metrics:
   ```bash
   cat docs/test-results/performance-metrics.json
   cat docs/test-results/bundle-size.json
   ```

2. Optimization tips:
   - Enable Next.js optimizations
   - Use dynamic imports for large components
   - Optimize images (use Next.js Image component)
   - Remove unused dependencies
   - Enable bundle analyzer

### Screenshot Differences

**Problem:** Visual regression tests show differences

**Solutions:**
1. Review screenshots in `docs/screenshots/`
2. If changes are intentional, update baselines
3. Consider using visual regression services:
   - Percy (https://percy.io)
   - Chromatic (https://www.chromatic.com)

### Responsive Test Failures

**Problem:** Horizontal scrolling detected

**Solutions:**
1. Check CSS:
   ```css
   /* Prevent overflow */
   html, body {
     overflow-x: hidden;
   }
   ```

2. Find overflow elements:
   ```javascript
   // In browser console
   document.querySelectorAll('*').forEach(el => {
     if (el.scrollWidth > el.clientWidth) {
       console.log(el);
     }
   });
   ```

## Best Practices

1. **Run tests before commits:**
   ```bash
   task test:e2e:complete
   ```

2. **Keep tests fast:**
   - Use `waitUntil: 'networkidle'` sparingly
   - Use `waitForTimeout` only when necessary
   - Prefer specific selectors over generic ones

3. **Maintain accessibility:**
   - Run accessibility tests frequently
   - Fix critical violations immediately
   - Use semantic HTML

4. **Monitor performance:**
   - Track bundle sizes
   - Set performance budgets
   - Optimize continuously

5. **Screenshot organization:**
   - Use descriptive filenames
   - Separate by feature/component
   - Keep screenshots up-to-date

## Resources

- [Playwright Documentation](https://playwright.dev)
- [axe-core Accessibility Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance Metrics](https://web.dev/metrics/)
- [Responsive Design Best Practices](https://web.dev/responsive-web-design-basics/)

## Next Steps

1. **Add more test coverage:**
   - Test wallet connection flows
   - Test contract interactions
   - Test error states

2. **Integrate visual regression service:**
   - Set up Percy or Chromatic
   - Add to CI/CD pipeline

3. **Monitor performance:**
   - Set up performance tracking
   - Create performance budgets
   - Add alerts for regressions

4. **Enhance accessibility:**
   - Add skip links
   - Improve keyboard navigation
   - Test with screen readers
