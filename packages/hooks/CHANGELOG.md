# @bun-eth/hooks

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
