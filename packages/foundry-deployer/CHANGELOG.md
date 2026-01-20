# @bun-eth/foundry-deployer

## 0.3.0

### Minor Changes

- Build system overhaul and SSR fixes:
  - Add tsup build with dual CJS/ESM exports for npm compatibility
  - Add ContractsProvider for configurable contract imports
  - Add SSR protection to all wagmi-dependent components
  - Add proper TypeScript declarations

## 0.2.2

### Patch Changes

- 5a70aea: 1. tooling/env Package

## 0.2.1

### Patch Changes

- d7a1664: Add comprehensive E2E testing infrastructure to template

  This release adds production-grade testing infrastructure to the bun-eth template.

  ## Major Features

  ### Comprehensive E2E Testing Suite

  - Multi-layer testing: Visual Regression, Accessibility, Performance, Responsive
  - WCAG 2.1 AA compliance testing with axe-core
  - Performance metrics: FP, FCP, LCP, bundle size tracking
  - Responsive design validation: 9+ viewport sizes
  - RPC mocking for contract state testing
  - Time manipulation for blockchain testing

  ### Developer Experience Improvements

  - Enhanced deployment script with rich console output
  - Centralized .env management with comprehensive documentation
  - Forge lint integration with auto-formatting
  - Comprehensive documentation (E2E guide, improvements summary)

  ### New Task Commands

  - `test:e2e:complete` - Run complete E2E test suite
  - `test:e2e:visual` - Visual regression testing
  - `test:e2e:accessibility` - WCAG 2.1 AA compliance testing
  - `test:e2e:performance` - Performance metrics tracking
  - `test:e2e:responsive` - Responsive design testing
  - `test:e2e:screenshots` - Generate UI screenshots
  - `contracts:lint` - Check Solidity formatting
  - `contracts:format` - Format Solidity files

  ### Template Files Added

  - `apps/web/e2e/` - Complete E2E test suite (6 test files)
  - `apps/web/playwright.screenshots.config.ts` - Separate config (no webServer conflicts)
  - `apps/web/e2e/helpers/mock-wallet.ts` - RPC mocking utilities
  - `docs/E2E_TESTING_GUIDE.md` - Comprehensive testing guide (528 lines)
  - `docs/IMPROVEMENTS_SUMMARY.md` - Implementation summary (346 lines)
  - `docs/screenshots/` - Visual regression baselines
  - `docs/test-results/` - Test report directory

  ### Template Files Modified

  - `.env.example` - Centralized configuration with documentation
  - `.github/workflows/ci.yml` - Added Solidity linting to CI
  - `README.md` - Updated with E2E testing features
  - `packages/contracts/foundry.toml` - Added formatter configuration
  - `packages/contracts/script/Deploy.s.sol` - Enhanced deployment output
  - `tooling/tasks/test.yml` - Added E2E task commands
  - `tooling/tasks/contracts.yml` - Added lint and format tasks
  - `tooling/tasks/build.yml` - Integrated Solidity linting

  ### Dependencies Added to Template

  - `@axe-core/playwright@4.10.2` - Accessibility testing library
  - `@biomejs/biome@1.9.4` - Fast linter and formatter (replaces ESLint)

  ### Linting Infrastructure

  - Replaced Next.js ESLint with Biome for faster, Bun-native linting
  - Added `biome.json` configuration at project root
  - Updated all package lint scripts to use Biome
  - Biome handles TypeScript, JavaScript, JSON formatting and linting
  - 10-100x faster than ESLint, better suited for Bun-first projects

  ## Testing Results

  - ✅ Contract tests: 10/10 passing
  - ✅ Forge lint: All contracts formatted
  - ✅ CI/CD: Updated with Solidity linting
  - ✅ 23 files changed, 2,347 insertions

  ## Migration Guide

  New projects created with `bunx create-bun-eth@latest` will automatically include all new features.

  Existing projects can manually adopt these improvements:

  1. Install `@axe-core/playwright` in `apps/web`
  2. Copy E2E test files from `apps/web/e2e/`
  3. Copy `playwright.screenshots.config.ts`
  4. Update task files with new commands
  5. Add formatter config to `foundry.toml`
  6. See `docs/IMPROVEMENTS_SUMMARY.md` for full details

  Based on learnings from eth-crowdsale project.

## 0.2.0

### Minor Changes

- Upgrade to Next.js 15 with Turbopack and fix package exports
  - Upgraded from Next.js 14 to Next.js 15.5.4 with Turbopack (Rust-based bundler)
  - Upgraded React from 18 to 19
  - Removed webpack configuration in favor of Turbopack
  - Fixed export conditions order (types before import/require) in all packages
  - Added node-fetch as dev dependency
  - Made @bun-eth/core publishable for use in other packages
