# @bun-eth/hooks

## 0.3.0

### Minor Changes

- Build system overhaul and SSR fixes:
  - Add tsup build with dual CJS/ESM exports for npm compatibility
  - Add ContractsProvider for configurable contract imports
  - Add SSR protection to all wagmi-dependent components
  - Add proper TypeScript declarations

### Patch Changes

- Updated dependencies
  - @bun-eth/core@0.3.0

## 0.2.3

### Patch Changes

- React performance optimizations: memoization, proper viem types, logger integration

## 0.2.2

### Patch Changes

- fix: update dependencies and improve quality gates

  - Update Radix UI packages to React 19 compatible versions
  - Fix workspace:\* references in published packages (use npm versions)
  - Add test for verifying public packages are usable from npm
  - Add proper timeouts to create-bun-eth tests
  - Rename Playwright tests to .playwright.ts to avoid conflicts with Bun test runner
  - Fix Next.js build by using dynamic import for wagmi-dependent components

- 5a70aea: 1. tooling/env Package
- Updated dependencies [5a70aea]
  - @bun-eth/core@0.2.1

## 0.2.1

### Patch Changes

- feat: add Turborepo, Sherif, and @t3-oss/env integration

  - Components and hooks now have proper @types/react dependencies
  - create-bun-eth now uses npm packages instead of copying source
  - Improved monorepo tooling with Turbo and Sherif

## 0.2.0

### Minor Changes

- Upgrade to Next.js 15 with Turbopack and fix package exports
  - Upgraded from Next.js 14 to Next.js 15.5.4 with Turbopack (Rust-based bundler)
  - Upgraded React from 18 to 19
  - Removed webpack configuration in favor of Turbopack
  - Fixed export conditions order (types before import/require) in all packages
  - Added node-fetch as dev dependency
  - Made @bun-eth/core publishable for use in other packages

### Patch Changes

- Updated dependencies
  - @bun-eth/core@0.2.0
