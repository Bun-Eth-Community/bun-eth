#!/usr/bin/env bun
/**
 * Resolves workspace:* dependencies to actual versions before publishing.
 * This script is run automatically before `changeset publish`.
 *
 * Usage: bun scripts/resolve-workspace-versions.ts
 */

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

async function getWorkspacePackages(): Promise<Map<string, string>> {
  const packages = new Map<string, string>();
  const dirs = await readdir(PACKAGES_DIR, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;

    const packageJsonPath = join(PACKAGES_DIR, dir.name, 'package.json');
    try {
      const content = await readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content) as PackageJson;
      packages.set(pkg.name, pkg.version);
    } catch {
      // Skip if no package.json
    }
  }

  return packages;
}

function resolveWorkspaceVersion(
  version: string,
  packageName: string,
  workspacePackages: Map<string, string>
): string {
  if (!version.startsWith('workspace:')) {
    return version;
  }

  const actualVersion = workspacePackages.get(packageName);
  if (!actualVersion) {
    console.warn(`  Warning: Could not find version for ${packageName}`);
    return version;
  }

  // workspace:* -> ^version
  // workspace:^ -> ^version
  // workspace:~ -> ~version
  const modifier = version.replace('workspace:', '');
  if (modifier === '*' || modifier === '^') {
    return `^${actualVersion}`;
  }
  if (modifier === '~') {
    return `~${actualVersion}`;
  }

  return `^${actualVersion}`;
}

async function processPackage(
  packagePath: string,
  workspacePackages: Map<string, string>
): Promise<boolean> {
  const packageJsonPath = join(packagePath, 'package.json');
  const content = await readFile(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(content) as PackageJson;

  // Skip private packages
  if (pkg.private) {
    console.log(`  Skipping private package: ${pkg.name}`);
    return false;
  }

  let modified = false;

  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
    const deps = pkg[depType];
    if (!deps) continue;

    for (const [depName, version] of Object.entries(deps)) {
      if (version.startsWith('workspace:')) {
        const resolved = resolveWorkspaceVersion(version, depName, workspacePackages);
        if (resolved !== version) {
          console.log(`  ${pkg.name}: ${depName} ${version} -> ${resolved}`);
          deps[depName] = resolved;
          modified = true;
        }
      }
    }
  }

  if (modified) {
    await writeFile(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  }

  return modified;
}

async function main() {
  console.log('Resolving workspace versions...\n');

  const workspacePackages = await getWorkspacePackages();
  console.log('Found workspace packages:');
  for (const [name, version] of workspacePackages) {
    console.log(`  ${name}@${version}`);
  }
  console.log('');

  const dirs = await readdir(PACKAGES_DIR, { withFileTypes: true });
  let modifiedCount = 0;

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;

    const packagePath = join(PACKAGES_DIR, dir.name);
    const modified = await processPackage(packagePath, workspacePackages);
    if (modified) modifiedCount++;
  }

  console.log(`\nResolved workspace versions in ${modifiedCount} package(s)`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
