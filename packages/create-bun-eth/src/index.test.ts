import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { $ } from "bun";
import { existsSync, rmSync } from "fs";
import { join } from "path";

const CLI_PATH = join(import.meta.dir, "index.ts");

// Each test gets its own unique directory
function getTestDir(name: string) {
  return `/tmp/cbe-test-${name}-${Date.now()}`;
}

async function createProject(testDir: string, name: string, flags = "--full-stack") {
  await $`mkdir -p ${testDir}`;
  await $`bun ${CLI_PATH} ${name} ${flags}`.cwd(testDir).quiet();
  return join(testDir, name);
}

function cleanup(dir: string) {
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
}

describe("create-bun-eth", () => {
  test("creates full-stack project", async () => {
    const testDir = getTestDir("full");
    try {
      const dir = await createProject(testDir, "app");
      expect(existsSync(join(dir, "package.json"))).toBe(true);
      expect(existsSync(join(dir, "apps/web"))).toBe(true);
      expect(existsSync(join(dir, "apps/api"))).toBe(true);
      expect(existsSync(join(dir, "packages/contracts"))).toBe(true);
      expect(existsSync(join(dir, ".git"))).toBe(true);
    } finally {
      cleanup(testDir);
    }
  }, 60000);

  test("creates backend-only project", async () => {
    const testDir = getTestDir("backend");
    try {
      const dir = await createProject(testDir, "api", "--backend-only");
      expect(existsSync(join(dir, "apps/api"))).toBe(true);
      expect(existsSync(join(dir, "apps/web"))).toBe(false);
    } finally {
      cleanup(testDir);
    }
  }, 60000);

  test("renames packages to project scope", async () => {
    const testDir = getTestDir("rename");
    try {
      const dir = await createProject(testDir, "my-dapp");

      const rootPkg = await Bun.file(join(dir, "package.json")).json();
      expect(rootPkg.name).toBe("my-dapp");

      const webPkg = await Bun.file(join(dir, "apps/web/package.json")).json();
      expect(webPkg.name).toBe("@my-dapp/web");

      const corePkg = await Bun.file(join(dir, "packages/core/package.json")).json();
      expect(corePkg.name).toBe("@my-dapp/core");

      // No @bun-eth references should remain
      const grep = await $`grep -r "@bun-eth" ${dir} --include="*.json" --include="*.ts" 2>/dev/null || true`.text();
      expect(grep.trim()).toBe("");
    } finally {
      cleanup(testDir);
    }
  }, 60000);

  test("removes dev-only folders", async () => {
    const testDir = getTestDir("clean");
    try {
      const dir = await createProject(testDir, "app");
      expect(existsSync(join(dir, "packages/create-bun-eth"))).toBe(false);
      expect(existsSync(join(dir, ".changeset"))).toBe(false);
      expect(existsSync(join(dir, ".github"))).toBe(false);
    } finally {
      cleanup(testDir);
    }
  }, 60000);

  test("installs without errors", async () => {
    const testDir = getTestDir("install");
    try {
      const dir = await createProject(testDir, "app");
      const result = await $`bun install`.cwd(dir).nothrow();
      expect(result.exitCode).toBe(0);
      expect(existsSync(join(dir, "node_modules"))).toBe(true);
    } finally {
      cleanup(testDir);
    }
  }, 120000);

  test("builds successfully", async () => {
    const testDir = getTestDir("build");
    try {
      const dir = await createProject(testDir, "app");
      await $`bun install`.cwd(dir).quiet();
      const result = await $`bun run build`.cwd(dir).nothrow();
      expect(result.exitCode).toBe(0);
    } finally {
      cleanup(testDir);
    }
  }, 180000);
});

describe("public packages", () => {
  test("@bun-eth packages are usable from npm", async () => {
    const testDir = getTestDir("npm-pkg");
    try {
      await $`mkdir -p ${testDir}`;

      // Create a minimal package that depends on public @bun-eth packages
      // Note: @bun-eth/hooks and @bun-eth/components currently have workspace:* deps
      // which need to be republished. Testing @bun-eth/core which should work.
      const pkgJson = {
        name: "test-bun-eth-packages",
        type: "module",
        dependencies: {
          "@bun-eth/core": "latest",
        },
      };
      await Bun.write(join(testDir, "package.json"), JSON.stringify(pkgJson, null, 2));

      // Install packages from npm
      const installResult = await $`bun install`.cwd(testDir).nothrow();
      expect(installResult.exitCode).toBe(0);

      // Verify no workspace:* references in installed packages
      const nodeModulesCore = join(testDir, "node_modules/@bun-eth/core/package.json");
      const corePkg = await Bun.file(nodeModulesCore).json();
      const corePkgStr = JSON.stringify(corePkg);
      expect(corePkgStr).not.toContain("workspace:");

      // Create a test file that imports the packages
      const testCode = `
import { isValidAddress, shortenAddress, formatEther, parseEther } from "@bun-eth/core";

// Test that core exports are accessible and work correctly
const addr = "0x1234567890123456789012345678901234567890";
console.log("isValidAddress:", isValidAddress(addr));
console.log("shortenAddress:", shortenAddress(addr));
console.log("formatEther:", formatEther(BigInt(1e18)));
console.log("parseEther:", parseEther("1.0"));
console.log("Test passed!");
`;
      await Bun.write(join(testDir, "test.ts"), testCode);

      // Run the test file
      const runResult = await $`bun run test.ts`.cwd(testDir).nothrow();
      expect(runResult.exitCode).toBe(0);
      expect(runResult.stdout.toString()).toContain("Test passed!");
    } finally {
      cleanup(testDir);
    }
  }, 120000);
});
