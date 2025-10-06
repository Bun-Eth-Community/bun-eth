#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import * as readline from "readline";

const REPO_URL = "https://github.com/Bun-Eth-Community/bun-eth.git";

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

async function removeBackendOnlyFiles(targetDir: string) {
  console.log("🗑️  Removing frontend packages...");

  // Remove frontend-related directories
  await $`rm -rf ${join(targetDir, "apps/web")}`;
  await $`rm -rf ${join(targetDir, "packages/hooks")}`;
  await $`rm -rf ${join(targetDir, "packages/components")}`;
  await $`rm -rf ${join(targetDir, "packages/burner-connector")}`;

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
    // Clone the template repository
    console.log("📦 Cloning template repository...");
    await $`git clone --depth 1 ${REPO_URL} ${targetDir}`;

    // Remove .git directory to start fresh
    console.log("🧹 Cleaning up...");
    await $`rm -rf ${join(targetDir, ".git")}`;

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
