#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";

const REPO_URL = "https://github.com/yourusername/bun-eth.git";

interface CliArgs {
  projectName: string;
  template?: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    process.exit(0);
  }

  return {
    projectName: args[0],
    template: args[1],
  };
}

function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                      create-bun-eth                           ║
║          Scaffold a Bun-first Ethereum project                ║
╚═══════════════════════════════════════════════════════════════╝

Usage:
  bunx create-bun-eth@latest <project-name>

Example:
  bunx create-bun-eth@latest my-dapp
  cd my-dapp
  task install
  task dev:up

Options:
  -h, --help    Show this help message

What you get:
  📦 Bun-native monorepo setup
  🚀 Elysia backend API
  📜 Hardhat smart contracts
  🐳 Docker Compose configuration
  ⚡ Taskfile for orchestration
  🧪 Bun-native testing
  `);
}

async function scaffoldProject(projectName: string) {
  const targetDir = join(process.cwd(), projectName);

  // Check if directory already exists
  if (existsSync(targetDir)) {
    console.error(`❌ Error: Directory "${projectName}" already exists`);
    process.exit(1);
  }

  console.log(`\n🚀 Creating Bun-Eth project: ${projectName}\n`);

  try {
    // Clone the template repository
    console.log("📦 Cloning template repository...");
    await $`git clone --depth 1 ${REPO_URL} ${targetDir}`;

    // Remove .git directory to start fresh
    console.log("🧹 Cleaning up...");
    await $`rm -rf ${join(targetDir, ".git")}`;

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
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                  ✅ Project Created!                          ║
╚═══════════════════════════════════════════════════════════════╝

📁 Project: ${projectName}
📍 Location: ${targetDir}

Next steps:

  1️⃣  Navigate to project:
      cd ${projectName}

  2️⃣  Install dependencies:
      task install

  3️⃣  Start development stack:
      task dev:up

  4️⃣  Compile & deploy contracts:
      task contracts:compile
      task contracts:deploy

  5️⃣  Check API health:
      task check:health

  6️⃣  Run tests:
      task test

📚 Documentation:
   - README.md for full documentation
   - task --list for all available commands

🌐 Services will be available at:
   - API: http://localhost:3001
   - Hardhat Node: http://localhost:8545

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
  await scaffoldProject(args.projectName);
}

main().catch(console.error);
