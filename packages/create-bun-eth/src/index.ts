#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";

const REPO_URL = "https://github.com/Bun-Eth-Community/bun-eth/archive/refs/heads/main.tar.gz";

// Folders to remove (dev-only, not needed in template)
const REMOVE_FOLDERS = [
  "packages/create-bun-eth",
  "packages/foundry-deployer",
  "scripts",
  ".changeset",
  ".github",
  "tests",
];

type ProjectType = "full-stack" | "backend-only";

function parseArgs() {
  const args = Bun.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    process.exit(0);
  }

  const projectName = args.find(a => !a.startsWith("-")) || "";
  const type = args.includes("--backend-only") ? "backend-only"
             : args.includes("--full-stack") ? "full-stack"
             : undefined;

  return { projectName, type };
}

async function promptProjectType(): Promise<ProjectType> {
  console.log("\n What type of project?\n");
  console.log("  1  Full-Stack (Next.js + API + Contracts)");
  console.log("  2  Backend-Only (API + Contracts)\n");

  process.stdout.write("Select (1 or 2): ");
  for await (const line of console) {
    const choice = line.trim();
    return choice === "2" ? "backend-only" : "full-stack";
  }
  return "full-stack";
}

function printHelp() {
  console.log(`
create-bun-eth - Scaffold a Bun-first Ethereum project

Usage:
  bunx create-bun-eth@latest <project-name> [--full-stack|--backend-only]

Examples:
  bunx create-bun-eth@latest my-dapp
  bunx create-bun-eth@latest my-dapp --full-stack
  bunx create-bun-eth@latest my-api --backend-only
`);
}

async function downloadAndExtract(targetDir: string) {
  console.log("Downloading template...");

  const response = await fetch(REPO_URL);
  if (!response.ok) throw new Error(`Failed to download: ${response.status}`);

  const tempTar = join(targetDir, "..", "template.tar.gz");
  await Bun.write(tempTar, response);

  await $`mkdir -p ${targetDir}`;
  await $`tar -xzf ${tempTar} -C ${targetDir} --strip-components=1`;
  await $`rm ${tempTar}`;
}

async function renamePackageScope(targetDir: string, projectName: string) {
  console.log(`Renaming to @${projectName}/*...`);

  const oldScope = "@bun-eth";
  const newScope = `@${projectName}`;

  // Find all files that might need updating
  const result = await $`grep -rl "${oldScope}" ${targetDir} --include="*.json" --include="*.ts" --include="*.tsx" 2>/dev/null || true`.text();
  const files = result.trim().split("\n").filter(f => f && !f.includes("node_modules"));

  for (const filePath of files) {
    if (!existsSync(filePath)) continue;

    let content = await Bun.file(filePath).text();
    content = content.replaceAll(oldScope, newScope);

    // Ensure JSON files have trailing newline
    if (filePath.endsWith(".json") && !content.endsWith("\n")) {
      content += "\n";
    }

    await Bun.write(filePath, content);
  }
}

async function cleanupTemplate(targetDir: string, projectName: string) {
  console.log("Cleaning up...");

  for (const folder of REMOVE_FOLDERS) {
    const path = join(targetDir, folder);
    if (existsSync(path)) {
      await $`rm -rf ${path}`.quiet();
    }
  }

  // Update root package.json
  const pkgPath = join(targetDir, "package.json");
  const pkg = await Bun.file(pkgPath).json();
  pkg.name = projectName;
  delete pkg.mcp;
  pkg.scripts = {
    dev: "turbo run dev",
    build: "turbo run build",
    lint: "turbo run lint && sherif",
    test: "bun test packages/sdk",
    clean: "turbo run clean",
  };
  await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // Fix package versions for React 19 compatibility
  const webPkgPath = join(targetDir, "apps/web/package.json");
  if (existsSync(webPkgPath)) {
    const webPkg = await Bun.file(webPkgPath).json();
    const deps = webPkg.dependencies;
    if (deps) {
      // Update packages that need React 19 support
      if (deps["lucide-react"]) deps["lucide-react"] = "^0.469.0";
      if (deps["@radix-ui/react-avatar"]) deps["@radix-ui/react-avatar"] = "^1.1.0";
      if (deps["@radix-ui/react-dropdown-menu"]) deps["@radix-ui/react-dropdown-menu"] = "^2.1.0";
      if (deps["@radix-ui/react-label"]) deps["@radix-ui/react-label"] = "^2.1.0";
      if (deps["@radix-ui/react-slot"]) deps["@radix-ui/react-slot"] = "^1.1.0";
      if (deps["@radix-ui/react-toast"]) deps["@radix-ui/react-toast"] = "^1.2.0";
    }
    await Bun.write(webPkgPath, JSON.stringify(webPkg, null, 2) + "\n");
  }

  // Fix lint formatting in page.tsx
  const pagePath = join(targetDir, "apps/web/src/app/page.tsx");
  if (existsSync(pagePath)) {
    let content = await Bun.file(pagePath).text();
    // Fix multi-line import to single line
    content = content.replace(
      /import\s*\{\s*\n\s*Address,\s*\n\s*Balance,\s*\n\s*BurnerWalletInfo,\s*\n\s*FaucetButton,\s*\n\s*\}/,
      "import { Address, Balance, BurnerWalletInfo, FaucetButton }"
    );
    await Bun.write(pagePath, content);
  }
}

async function removeWebApp(targetDir: string) {
  console.log("Removing web app...");

  await $`rm -rf ${join(targetDir, "apps/web")}`.quiet();

  const pkgPath = join(targetDir, "package.json");
  const pkg = await Bun.file(pkgPath).json();
  pkg.workspaces = pkg.workspaces.filter((ws: string) => ws !== "apps/web");
  await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

async function initGit(targetDir: string) {
  console.log("Initializing git...");
  await $`git -C ${targetDir} init`.quiet();
  await $`git -C ${targetDir} add .`.quiet();
  await $`git -C ${targetDir} commit -m "feat: initialize project"`.quiet();
}

async function scaffold(projectName: string, projectType: ProjectType) {
  const targetDir = join(process.cwd(), projectName);

  if (existsSync(targetDir)) {
    console.error(`Error: "${projectName}" already exists`);
    process.exit(1);
  }

  const isFullStack = projectType === "full-stack";
  console.log(`\nCreating ${isFullStack ? "full-stack" : "backend-only"}: ${projectName}\n`);

  await downloadAndExtract(targetDir);
  await cleanupTemplate(targetDir, projectName);
  await renamePackageScope(targetDir, projectName);

  if (!isFullStack) {
    await removeWebApp(targetDir);
  }

  await initGit(targetDir);

  console.log(`
Done! Next steps:

  cd ${projectName}
  task install
  task dev:local

Services:
  ${isFullStack ? "Web: http://localhost:3000\n  " : ""}API: http://localhost:3001
  Anvil: http://localhost:3002
`);
}

// Main
const args = parseArgs();
const projectType = args.type || await promptProjectType();
await scaffold(args.projectName, projectType);
