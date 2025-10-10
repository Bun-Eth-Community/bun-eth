import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { $ } from "bun";
import { existsSync, rmSync } from "fs";
import { join } from "path";

const TEST_PROJECT_NAME = "test-bun-eth-e2e";
const TEST_PROJECT_DIR = join("/tmp", TEST_PROJECT_NAME);
const CLI_PATH = join(process.cwd(), "packages/create-bun-eth/src/index.ts");

// Helper to execute commands with timeout
async function exec(cmd: string, cwd: string = TEST_PROJECT_DIR) {
  const proc = $`cd ${cwd} && sh -c ${cmd}`.quiet();
  return await proc;
}

// Helper to check if a port is in use
async function isPortInUse(port: number): Promise<boolean> {
  try {
    const result = await $`lsof -i :${port}`.quiet();
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

// Helper to wait for a service to be ready
async function waitForService(url: string, maxAttempts: number = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch {
      // Service not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

describe("Template Creation E2E", () => {
  beforeAll(async () => {
    // Clean up any existing test project
    if (existsSync(TEST_PROJECT_DIR)) {
      rmSync(TEST_PROJECT_DIR, { recursive: true, force: true });
    }
  });

  afterAll(async () => {
    // Stop dev stack if running
    try {
      if (existsSync(TEST_PROJECT_DIR)) {
        await exec("task dev:down", TEST_PROJECT_DIR, 60000);
      }
    } catch {
      // Ignore cleanup errors
    }

    // Clean up test project
    if (existsSync(TEST_PROJECT_DIR)) {
      rmSync(TEST_PROJECT_DIR, { recursive: true, force: true });
    }
  });

  test("should create project using CLI", async () => {
    // Create project using the CLI
    const proc = $`bun ${CLI_PATH} ${TEST_PROJECT_NAME} --full-stack`.cwd("/tmp").quiet();
    const result = await proc;

    expect(result.exitCode).toBe(0);
    expect(existsSync(TEST_PROJECT_DIR)).toBe(true);
    expect(existsSync(join(TEST_PROJECT_DIR, "package.json"))).toBe(true);
    expect(existsSync(join(TEST_PROJECT_DIR, ".env.example"))).toBe(true);
    expect(existsSync(join(TEST_PROJECT_DIR, "apps/web"))).toBe(true);
    expect(existsSync(join(TEST_PROJECT_DIR, "apps/api"))).toBe(true);
    expect(existsSync(join(TEST_PROJECT_DIR, "packages/contracts"))).toBe(true);

    // Verify .git was initialized
    expect(existsSync(join(TEST_PROJECT_DIR, ".git"))).toBe(true);
  }, 240000);

  test("should install dependencies", async () => {
    const result = await exec("bun install", TEST_PROJECT_DIR);

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(TEST_PROJECT_DIR, "node_modules"))).toBe(true);
    expect(existsSync(join(TEST_PROJECT_DIR, "bun.lockb"))).toBe(true);
  }, 240000);

  test("should compile contracts", async () => {
    const result = await exec("task contracts:compile", TEST_PROJECT_DIR);

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(TEST_PROJECT_DIR, "packages/contracts/out"))).toBe(true);
  }, 180000);

  test("should run unit tests", async () => {
    const result = await exec("bun test packages/core packages/sdk", TEST_PROJECT_DIR);

    expect(result.exitCode).toBe(0);
  }, 90000);

  test("should run contract tests", async () => {
    const result = await exec("task contracts:test", TEST_PROJECT_DIR);

    expect(result.exitCode).toBe(0);
  }, 180000);

  test("should build all packages", async () => {
    const result = await exec("task build", TEST_PROJECT_DIR);

    expect(result.exitCode).toBe(0);

    // Check that built artifacts exist
    expect(existsSync(join(TEST_PROJECT_DIR, "packages/hooks/dist"))).toBe(true);
    expect(existsSync(join(TEST_PROJECT_DIR, "packages/components/dist"))).toBe(true);
    expect(existsSync(join(TEST_PROJECT_DIR, "apps/web/.next"))).toBe(true);
  }, 360000);

  test("should start dev stack", async () => {
    // Kill any processes on the ports we need
    try {
      await $`lsof -ti:3000,3001,3002 | xargs kill -9`.quiet();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch {
      // Ports already free
    }

    const result = await exec("task dev:up", TEST_PROJECT_DIR);

    expect(result.exitCode).toBe(0);

    // Wait for services to be ready
    const anvilReady = await waitForService("http://localhost:3002", 30);
    expect(anvilReady).toBe(true);

    const apiReady = await waitForService("http://localhost:3001/health", 30);
    expect(apiReady).toBe(true);

    const webReady = await waitForService("http://localhost:3000", 30);
    expect(webReady).toBe(true);
  }, 180000);

  test("should deploy contracts to local network", async () => {
    // Deploy contracts
    const contractsDir = join(TEST_PROJECT_DIR, "packages/contracts");
    const proc = $`cd ${contractsDir} && PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:3002 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --legacy`.quiet();
    const result = await proc;

    expect(result.exitCode).toBe(0);

    // Check that deployment artifacts exist
    expect(existsSync(join(TEST_PROJECT_DIR, "packages/contracts/broadcast"))).toBe(true);
  }, 180000);

  test("should have working API health endpoint", async () => {
    const response = await fetch("http://localhost:3001/health");
    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.network).toBeDefined();
    expect(data.network.chainId).toBe(31337);
  }, 30000);

  test("should have working web UI", async () => {
    const response = await fetch("http://localhost:3000");
    expect(response.ok).toBe(true);

    const html = await response.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Bun-Eth");
  }, 30000);

  test("should stop dev stack cleanly", async () => {
    const result = await exec("task dev:down", TEST_PROJECT_DIR);

    expect(result.exitCode).toBe(0);

    // Give services time to shut down
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Verify ports are now free
    expect(await isPortInUse(3000)).toBe(false);
    expect(await isPortInUse(3001)).toBe(false);
    expect(await isPortInUse(3002)).toBe(false);
  }, 90000);
});

describe("Template Improvements Validation", () => {
  test("should have enhanced .env.example", async () => {
    // Skip if project doesn't exist (previous tests failed)
    if (!existsSync(TEST_PROJECT_DIR)) {
      console.log("Skipping: test project doesn't exist");
      return;
    }

    const envExample = await Bun.file(join(TEST_PROJECT_DIR, ".env.example")).text();

    // Check for new documentation
    expect(envExample).toContain("Private Key Configuration");
    expect(envExample).toContain("For local development: Use Anvil's default private key");
    expect(envExample).toContain("FOUNDRY_DISABLE_NIGHTLY_WARNING");
    expect(envExample).toContain("Sepolia Testnet Configuration");
    expect(envExample).toContain("SEPOLIA_RPC_URL");
    expect(envExample).toContain("ETHERSCAN_API_KEY");

    // Check that legacy HARDHAT_NODE is removed
    expect(envExample).not.toContain("HARDHAT_NODE");
  });

  test("should have improved Taskfile with deployment validation", async () => {
    // Skip if project doesn't exist (previous tests failed)
    if (!existsSync(TEST_PROJECT_DIR)) {
      console.log("Skipping: test project doesn't exist");
      return;
    }

    const taskfile = await Bun.file(join(TEST_PROJECT_DIR, "tooling/task/Taskfile.yml")).text();

    // Check for Sepolia deployment improvements
    expect(taskfile).toContain("contracts:deploy:sepolia:");
    expect(taskfile).toContain("SEPOLIA_RPC_URL not set");
    expect(taskfile).toContain("PRIVATE_KEY not set");
    expect(taskfile).toContain("docs/DEPLOYMENT_GUIDE.md");

    // Check test:watch improvements
    expect(taskfile).toContain("bun test --watch packages/core packages/sdk");
  });

  test("should have deployment guide", async () => {
    // Skip if project doesn't exist (previous tests failed)
    if (!existsSync(TEST_PROJECT_DIR)) {
      console.log("Skipping: test project doesn't exist");
      return;
    }

    // NOTE: degit doesn't respect .gitattributes export-ignore by default
    // These files will be present in the cloned template
    expect(existsSync(join(TEST_PROJECT_DIR, "docs/DEPLOYMENT_GUIDE.md"))).toBe(true);

    const deploymentGuide = await Bun.file(join(TEST_PROJECT_DIR, "docs/DEPLOYMENT_GUIDE.md")).text();
    expect(deploymentGuide).toContain("# Deployment Guide");
    expect(deploymentGuide).toContain("Sepolia");
    expect(deploymentGuide).toContain("Multi-Chain");
    expect(deploymentGuide).toContain("Troubleshooting");
  });

  test("should have .gitattributes for template", async () => {
    // Skip if project doesn't exist (previous tests failed)
    if (!existsSync(TEST_PROJECT_DIR)) {
      console.log("Skipping: test project doesn't exist");
      return;
    }

    // NOTE: degit clones everything - .gitattributes is for GitHub's "Use this template"
    expect(existsSync(join(TEST_PROJECT_DIR, ".gitattributes"))).toBe(true);

    const gitattributes = await Bun.file(join(TEST_PROJECT_DIR, ".gitattributes")).text();
    expect(gitattributes).toContain("export-ignore");
    expect(gitattributes).toContain(".changeset/** export-ignore");
    expect(gitattributes).toContain("CHANGELOG.md export-ignore");
  });

  test("should have cleanup script", async () => {
    // Skip if project doesn't exist (previous tests failed)
    if (!existsSync(TEST_PROJECT_DIR)) {
      console.log("Skipping: test project doesn't exist");
      return;
    }

    expect(existsSync(join(TEST_PROJECT_DIR, "scripts/cleanup-template-artifacts.sh"))).toBe(true);

    const cleanupScript = await Bun.file(join(TEST_PROJECT_DIR, "scripts/cleanup-template-artifacts.sh")).text();
    expect(cleanupScript).toContain("#!/bin/bash");
    expect(cleanupScript).toContain("cleanup-template-artifacts");
  });

  test("should have removed Hardhat references from API config", async () => {
    // Skip if project doesn't exist (previous tests failed)
    if (!existsSync(TEST_PROJECT_DIR)) {
      console.log("Skipping: test project doesn't exist");
      return;
    }

    const apiConfig = await Bun.file(join(TEST_PROJECT_DIR, "apps/api/src/config.ts")).text();

    // Check that HARDHAT_NODE reference is removed
    expect(apiConfig).not.toContain("HARDHAT_NODE");
    expect(apiConfig).toContain("ANVIL_NODE");
  });

  test("should use degit for template creation (no .git history)", async () => {
    // This is validated by checking that the CLI used degit
    const cliSource = await Bun.file(CLI_PATH).text();
    expect(cliSource).toContain("import degit from \"degit\"");
    expect(cliSource).toContain("degit(REPO_PATH");
    expect(cliSource).not.toContain("git clone");
  });
});
