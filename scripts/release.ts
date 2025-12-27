#!/usr/bin/env bun
/**
 * Release script that handles workspace:* resolution for npm publishing.
 *
 * This script:
 * 1. Runs the build
 * 2. Resolves workspace:* dependencies to actual versions
 * 3. Publishes packages via changesets
 * 4. Restores the original workspace:* dependencies
 *
 * Usage: bun scripts/release.ts
 */

import { $ } from 'bun';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const PACKAGES_DIR = join(import.meta.dir, '..', 'packages');

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

async function getPackagePaths(): Promise<string[]> {
  const dirs = await readdir(PACKAGES_DIR, { withFileTypes: true });
  return dirs
    .filter((d) => d.isDirectory())
    .map((d) => join(PACKAGES_DIR, d.name, 'package.json'));
}

async function backupPackageJsons(): Promise<Map<string, string>> {
  const backups = new Map<string, string>();
  const packagePaths = await getPackagePaths();

  for (const path of packagePaths) {
    try {
      const content = await readFile(path, 'utf-8');
      backups.set(path, content);
    } catch {
      // Skip if no package.json
    }
  }

  return backups;
}

async function restorePackageJsons(backups: Map<string, string>): Promise<void> {
  for (const [path, content] of backups) {
    await writeFile(path, content);
  }
}

async function main() {
  console.log('Starting release process...\n');

  // Step 1: Build packages
  console.log('Step 1: Building packages...');
  await $`bun run build`;

  // Step 2: Backup package.json files
  console.log('\nStep 2: Backing up package.json files...');
  const backups = await backupPackageJsons();
  console.log(`Backed up ${backups.size} package.json files`);

  try {
    // Step 3: Resolve workspace versions
    console.log('\nStep 3: Resolving workspace versions...');
    await $`bun scripts/resolve-workspace-versions.ts`;

    // Step 4: Publish via changesets
    console.log('\nStep 4: Publishing packages...');
    await $`changeset publish`;

    console.log('\nRelease completed successfully!');
  } finally {
    // Step 5: Always restore original package.json files
    console.log('\nStep 5: Restoring original package.json files...');
    await restorePackageJsons(backups);
    console.log('Package.json files restored');
  }
}

main().catch((error) => {
  console.error('Release failed:', error);
  process.exit(1);
});
