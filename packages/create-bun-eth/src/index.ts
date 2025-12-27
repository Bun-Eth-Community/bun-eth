#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import * as readline from "readline";
import degit from "degit";

const REPO_PATH = "Bun-Eth-Community/bun-eth";

// Published packages that should be installed from npm instead of copied
const PUBLISHED_PACKAGES = [
  "core",
  "hooks",
  "components",
  "burner-connector",
  "foundry-deployer",
  "create-bun-eth",
];

// Package name to npm package name mapping with latest version
const NPM_PACKAGES: Record<string, string> = {
  "@bun-eth/core": "^0.2.0",
  "@bun-eth/hooks": "^0.2.0",
  "@bun-eth/components": "^0.2.0",
  "@bun-eth/burner-connector": "^0.2.0",
};

type ProjectType = "full-stack" | "backend-only";

interface CliArgs {
  projectName: string;
  type?: ProjectType;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    process.exit(0);
  }

  // Check for --backend-only or --full-stack flags
  let type: ProjectType | undefined;
  if (args.includes("--backend-only")) {
    type = "backend-only";
  } else if (args.includes("--full-stack")) {
    type = "full-stack";
  }

  return {
    projectName: args[0],
    type,
  };
}

async function promptProjectType(): Promise<ProjectType> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n📦 What type of project would you like to create?\n");
    console.log("  1️⃣  Full-Stack dApp");
    console.log("     → Next.js frontend + Elysia backend + Foundry contracts");
    console.log("     → RainbowKit + wagmi + Custom hooks & components");
    console.log("     → Burner wallet + Local faucet");
    console.log("     → Contract hot reload\n");
    console.log("  2️⃣  Backend-Only");
    console.log("     → Elysia API + Foundry contracts only");
    console.log("     → Perfect for APIs, bots, or custom frontends\n");

    rl.question("Select (1 or 2): ", (answer) => {
      rl.close();
      const choice = answer.trim();

      if (choice === "1") {
        resolve("full-stack");
      } else if (choice === "2") {
        resolve("backend-only");
      } else {
        console.log("\n⚠️  Invalid choice, defaulting to Full-Stack");
        resolve("full-stack");
      }
    });
  });
}

function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                      create-bun-eth                           ║
║          Scaffold a Bun-first Ethereum project                ║
╚═══════════════════════════════════════════════════════════════╝

Usage:
  bunx create-bun-eth@latest <project-name> [options]

Examples:
  # Interactive (choose project type)
  bunx create-bun-eth@latest my-dapp

  # Full-stack dApp
  bunx create-bun-eth@latest my-dapp --full-stack

  # Backend-only API
  bunx create-bun-eth@latest my-api --backend-only

Options:
  --full-stack      Create full-stack dApp with Next.js frontend
  --backend-only    Create backend-only with API and contracts
  -h, --help        Show this help message

Full-Stack includes:
  🔥 Contract hot reload
  🎣 Custom React hooks (@bun-eth/hooks)
  🧱 Web3 UI components (@bun-eth/components)
  💰 Burner wallet + Local faucet
  🌈 RainbowKit wallet connection
  🎨 Next.js + shadcn/ui
  🚀 Elysia backend API
  📜 Foundry smart contracts
  🐳 Docker Compose (Anvil + API + Web)

Backend-Only includes:
  🚀 Elysia backend API
  📜 Foundry smart contracts
  🐳 Docker Compose (Anvil + API)
  📦 TypeScript SDK
  ⚡ Taskfile orchestration
  🧪 Bun-native testing
  `);
}

async function removePublishedPackages(targetDir: string) {
  console.log("📦 Removing published packages (will use npm instead)...");

  // Remove published packages - they'll be installed from npm
  for (const pkg of PUBLISHED_PACKAGES) {
    const pkgPath = join(targetDir, "packages", pkg);
    if (existsSync(pkgPath)) {
      await $`rm -rf ${pkgPath}`;
    }
  }

  // Update root package.json workspaces - only keep contracts and sdk
  const packageJsonPath = join(targetDir, "package.json");
  const packageJson = await Bun.file(packageJsonPath).json();

  // Remove scripts, turbo.json, and other dev-only files not needed in template
  await $`rm -rf ${join(targetDir, "scripts")}`;
  await $`rm -rf ${join(targetDir, ".changeset")}`;
  await $`rm -rf ${join(targetDir, ".github")}`;
  await $`rm -rf ${join(targetDir, "tests")}`;

  // Clean up package.json for template
  delete packageJson.mcp;
  packageJson.scripts = {
    dev: "turbo run dev",
    build: "turbo run build",
    lint: "turbo run lint && sherif",
    test: "bun test packages/sdk",
    clean: "turbo run clean",
  };

  await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log("✅ Published packages removed");
}

async function updateWorkspaceDependencies(targetDir: string) {
  console.log("📝 Updating dependencies to use npm packages...");

  // Update web app package.json
  const webPkgPath = join(targetDir, "apps/web/package.json");
  if (existsSync(webPkgPath)) {
    const webPkg = await Bun.file(webPkgPath).json();

    // Replace workspace:* with npm versions for published packages
    if (webPkg.dependencies) {
      for (const [name, version] of Object.entries(NPM_PACKAGES)) {
        if (webPkg.dependencies[name]) {
          webPkg.dependencies[name] = version;
        }
      }
    }

    await Bun.write(webPkgPath, JSON.stringify(webPkg, null, 2));
  }

  // Update api app package.json
  const apiPkgPath = join(targetDir, "apps/api/package.json");
  if (existsSync(apiPkgPath)) {
    const apiPkg = await Bun.file(apiPkgPath).json();

    // Replace workspace:* with npm versions for published packages
    if (apiPkg.dependencies) {
      for (const [name, version] of Object.entries(NPM_PACKAGES)) {
        if (apiPkg.dependencies[name]) {
          apiPkg.dependencies[name] = version;
        }
      }
    }

    await Bun.write(apiPkgPath, JSON.stringify(apiPkg, null, 2));
  }

  console.log("✅ Dependencies updated to use npm packages");
}

async function removeBackendOnlyFiles(targetDir: string) {
  console.log("🗑️  Removing frontend packages...");

  // Remove frontend-related directories
  await $`rm -rf ${join(targetDir, "apps/web")}`;

  // Update root package.json to remove web workspace
  const packageJsonPath = join(targetDir, "package.json");
  const packageJson = await Bun.file(packageJsonPath).json();
  packageJson.workspaces = packageJson.workspaces.filter((ws: string) => ws !== "apps/web");
  await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Update docker-compose.yml to remove web service
  const dockerComposePath = join(targetDir, "docker/docker-compose.yml");
  let dockerCompose = await Bun.file(dockerComposePath).text();

  // Remove web service section
  const lines = dockerCompose.split('\n');
  const filteredLines: string[] = [];
  let skipLines = false;

  for (const line of lines) {
    if (line.includes('# Next.js Web UI')) {
      skipLines = true;
      continue;
    }
    if (skipLines && line.startsWith('networks:')) {
      skipLines = false;
    }
    if (!skipLines) {
      filteredLines.push(line);
    }
  }

  await Bun.write(dockerComposePath, filteredLines.join('\n'));

  console.log("✅ Backend-only setup complete");
}

async function scaffoldProject(projectName: string, projectType: ProjectType) {
  const targetDir = join(process.cwd(), projectName);

  // Check if directory already exists
  if (existsSync(targetDir)) {
    console.error(`❌ Error: Directory "${projectName}" already exists`);
    process.exit(1);
  }

  const isFullStack = projectType === "full-stack";
  const typeLabel = isFullStack ? "Full-Stack dApp" : "Backend-Only API";

  console.log(`\n🚀 Creating ${typeLabel}: ${projectName}\n`);

  try {
    // Clone the template repository using degit (no git history)
    console.log("📦 Downloading template...");
    const emitter = degit(REPO_PATH, {
      cache: false,
      force: true,
    });

    await emitter.clone(targetDir);

    // Remove published packages and use npm instead
    await removePublishedPackages(targetDir);
    await updateWorkspaceDependencies(targetDir);

    // Remove frontend files if backend-only
    if (!isFullStack) {
      await removeBackendOnlyFiles(targetDir);
    }

    // Update package.json with project name
    console.log("📝 Updating project configuration...");
    const packageJsonPath = join(targetDir, "package.json");
    const packageJson = await Bun.file(packageJsonPath).json();
    packageJson.name = projectName;
    await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Initialize new git repository
    console.log("🔧 Initializing Git repository...");
    await $`cd ${targetDir} && git init`;
    await $`cd ${targetDir} && git add .`;
    await $`cd ${targetDir} && git commit -m "feat: initialize bun-eth project"`;

    // Success message
    const webUrl = isFullStack ? "\n   - Web UI: http://localhost:3000" : "";
    const webStep = isFullStack ? "\n\n  5️⃣  Open your browser:\n      http://localhost:3000" : "";

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                  ✅ Project Created!                          ║
╚═══════════════════════════════════════════════════════════════╝

📁 Project: ${projectName}
📍 Type: ${typeLabel}
📂 Location: ${targetDir}

Next steps:

  1️⃣  Navigate to project:
      cd ${projectName}

  2️⃣  Install dependencies:
      task install

  3️⃣  Start development stack:
      task dev:up

  4️⃣  Deploy contracts:
      task contracts:deploy${webStep}

📚 Documentation:
   - README.md for full documentation
   - docs/FEATURES.md for feature list
   - docs/ARCHITECTURE.md for system design
   - task --list for all available commands

🌐 Services will be available at:${webUrl}
   - API: http://localhost:3001
   - Anvil Node: http://localhost:3002

${isFullStack ? "🎨 Frontend stack: Next.js + RainbowKit + wagmi + shadcn/ui" : ""}
${isFullStack ? "🔥 Contract hot reload enabled!" : ""}
${isFullStack ? "💰 Burner wallet + Local faucet included!" : ""}

Happy building! 🎉
    `);
  } catch (error) {
    console.error("\n❌ Failed to create project:", error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log(`
  ██████╗ ██╗   ██╗███╗   ██╗      ███████╗████████╗██╗  ██╗
  ██╔══██╗██║   ██║████╗  ██║      ██╔════╝╚══██╔══╝██║  ██║
  ██████╔╝██║   ██║██╔██╗ ██║█████╗█████╗     ██║   ███████║
  ██╔══██╗██║   ██║██║╚██╗██║╚════╝██╔══╝     ██║   ██╔══██║
  ██████╔╝╚██████╔╝██║ ╚████║      ███████╗   ██║   ██║  ██║
  ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝      ╚══════╝   ╚═╝   ╚═╝  ╚═╝
  `);

  const args = parseArgs();

  // Prompt for project type if not provided
  const projectType = args.type || await promptProjectType();

  await scaffoldProject(args.projectName, projectType);
}

main().catch(console.error);
