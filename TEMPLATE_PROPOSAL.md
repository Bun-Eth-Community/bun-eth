# Bun-Eth Template & Improvements Proposal

## Executive Summary

This proposal outlines recommended changes to improve the **bun-eth** repository based on optimizations made in **eth-crowdsale**, and suggests migrating from a cloning-based approach to GitHub's native template repository feature for `create-bun-eth`.

---

## 1. Improvements to Backport to bun-eth

### 1.1 Enhanced `.env.example` Configuration

**Current Issues:**
- Contains legacy `HARDHAT_NODE` reference
- Missing detailed comments for configuration options
- Less organized structure

**Proposed Changes:**
```bash
# From eth-crowdsale/.env.example

# Private Key Configuration
# For local development: Use Anvil's default private key (safe to commit)
# For testnet/mainnet: Replace with your own private key (⚠️ NEVER commit!)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Foundry Configuration
FOUNDRY_DISABLE_NIGHTLY_WARNING=true

# Sepolia Testnet Configuration (for deployment)
# Get RPC URL from: https://infura.io or https://alchemy.com
SEPOLIA_RPC_URL=
# Get from: https://etherscan.io/myapikey
ETHERSCAN_API_KEY=

# Optional: Multi-chain deployment
BASESCAN_API_KEY=
ARBISCAN_API_KEY=
```

**Benefits:**
- Clearer documentation for developers
- Better security warnings
- Organized by deployment context
- Removes legacy Hardhat references

---

### 1.2 Improved Sepolia Deployment Task

**Current Version (bun-eth):**
```yaml
contracts:deploy:sepolia:
  desc: Deploy contracts to Sepolia testnet
  dir: packages/contracts
  cmds:
    - forge script script/Deploy.s.sol:DeployScript --rpc-url ${SEPOLIA_RPC_URL} --broadcast --verify
```

**Proposed Version (from eth-crowdsale):**
```yaml
contracts:deploy:sepolia:
  desc: Deploy contracts to Sepolia testnet
  dir: packages/contracts
  cmds:
    - |
      if [ -z "$SEPOLIA_RPC_URL" ]; then
        echo "❌ Error: SEPOLIA_RPC_URL not set"
        echo ""
        echo "Quick setup:"
        echo "  1. cp .env.example .env"
        echo "  2. Add SEPOLIA_RPC_URL to .env"
        echo "  3. Add PRIVATE_KEY to .env"
        echo ""
        echo "See docs/DEPLOYMENT_GUIDE.md for detailed instructions"
        exit 1
      fi
    - |
      if [ -z "$PRIVATE_KEY" ]; then
        echo "❌ Error: PRIVATE_KEY not set"
        echo ""
        echo "Add your wallet private key to .env file"
        echo "See docs/DEPLOYMENT_GUIDE.md for instructions"
        exit 1
      fi
    - FOUNDRY_DISABLE_NIGHTLY_WARNING=true forge script script/Deploy.s.sol:DeployScript --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key ${ETHERSCAN_API_KEY:-}
```

**Benefits:**
- Prevents cryptic errors when env vars are missing
- Provides helpful setup instructions
- Better developer experience
- Explicit private key usage (more secure)

---

### 1.3 Remove Legacy Hardhat References

**Files to Update:**
- `apps/api/src/config.ts` - Remove `process.env.HARDHAT_NODE` fallback
- `.env.example` - Remove `HARDHAT_NODE` reference
- Documentation - Update all references to use Anvil terminology

**Current (bun-eth/apps/api/src/config.ts):**
```typescript
ethNode: process.env.ANVIL_NODE || process.env.HARDHAT_NODE || `http://localhost:${process.env.ANVIL_PORT || "3002"}`,
```

**Proposed:**
```typescript
ethNode: process.env.ANVIL_NODE || `http://localhost:${process.env.ANVIL_PORT || "3002"}`,
```

**Benefits:**
- Clearer that bun-eth is Foundry-first
- Reduces confusion for new developers
- Cleaner codebase

---

### 1.4 Improved Test Commands

**Current Version (bun-eth):**
```yaml
test:watch:
  desc: Run tests in watch mode
  cmds:
    - bun test --watch
```

**Proposed Version:**
```yaml
test:watch:
  desc: Run tests in watch mode
  cmds:
    - bun test --watch packages/core packages/sdk
```

**Benefits:**
- More explicit about what's being tested
- Faster feedback during development
- Consistent with main `test` task

---

## 2. GitHub Template Repository Approach

### 2.1 Why Move Away from Cloning?

**Current Issues with Cloning:**
1. **Brings unnecessary artifacts:**
   - `.changeset/` directory and configuration
   - `CHANGELOG.md` files in all packages
   - `.task/` directory with log files
   - Template-specific documentation
   - Publishing-related files

2. **Git history pollution:**
   - Even with `--depth 1`, still brings in initial history
   - Requires removal of `.git` directory
   - Extra step to initialize new repo

3. **Slower initialization:**
   - Full clone even with shallow depth
   - More data to download
   - Additional cleanup steps required

4. **Maintenance overhead:**
   - Need to manually clean up artifacts
   - Risk of leaving template-specific files
   - Complex removal logic in CLI

---

### 2.2 GitHub Template Repository Benefits

**Advantages:**
1. **Clean slate:**
   - No git history at all
   - Only includes relevant files
   - No cleanup needed

2. **Native GitHub integration:**
   - "Use this template" button in UI
   - Can work with `create-bun-eth` CLI
   - Better GitHub ecosystem integration

3. **Explicit exclusions:**
   - `.gitattributes` controls what's templated
   - Cleaner starting point for users
   - Less confusion

4. **Faster initialization:**
   - No git history to download
   - Smaller payload
   - Quicker setup

---

### 2.3 Implementation Plan

#### Step 1: Configure GitHub Template

Create `.gitattributes` in bun-eth root:

```gitattributes
# Template Configuration
# Files/directories to exclude when using "Use this template"

# Development artifacts
.changeset/** export-ignore
.task/** export-ignore
*.log export-ignore

# Package changelogs (template shouldn't have history)
**/CHANGELOG.md export-ignore

# Publishing & contribution docs (template-specific)
docs/PUBLISHING.md export-ignore
CONTRIBUTING.md export-ignore

# Example-specific documentation (remove project-specific docs)
docs/screenshots/** export-ignore
docs/CROWDSALE_*.md export-ignore
docs/SCREENSHOTS.md export-ignore
docs/STATUS_INDICATORS.md export-ignore
docs/CSS_FIXES.md export-ignore
docs/E2E_TESTS.md export-ignore
docs/DEPLOYMENT_GUIDE.md export-ignore

# Keep these core docs
# docs/ARCHITECTURE.md
# docs/FEATURES.md
# docs/QUICKSTART.md
# README.md
```

#### Step 2: Enable GitHub Template

1. Go to repository settings
2. Check "Template repository" option
3. Users can now click "Use this template"

#### Step 3: Update create-bun-eth CLI

**Current Approach:**
```typescript
// Clone the template repository
await $`git clone --depth 1 ${REPO_URL} ${targetDir}`;

// Remove .git directory
await $`rm -rf ${join(targetDir, ".git")}`;
```

**Proposed Approach:**
```typescript
import { Octokit } from "@octokit/rest";

// Use GitHub's template API
const octokit = new Octokit();

// Generate repository from template
const response = await octokit.repos.createUsingTemplate({
  template_owner: "Bun-Eth-Community",
  template_repo: "bun-eth",
  owner: "user", // or organization
  name: projectName,
  description: `${typeLabel} - Built with Bun-Eth`,
  private: false,
});

// Clone the newly created repo
await $`git clone ${response.data.clone_url} ${targetDir}`;
```

**Alternative Simpler Approach (No GitHub API):**
```typescript
// Use degit for template cloning (no git history)
// Install: bun add degit
import degit from "degit";

const emitter = degit("Bun-Eth-Community/bun-eth", {
  cache: false,
  force: true,
});

await emitter.clone(targetDir);

// Initialize fresh git repo
await $`cd ${targetDir} && git init`;
await $`cd ${targetDir} && git add .`;
await $`cd ${targetDir} && git commit -m "feat: initialize bun-eth project"`;
```

**Benefits of degit approach:**
- No GitHub API authentication needed
- Respects `.gitattributes` export-ignore
- No git history downloaded
- Faster and simpler
- Works offline with cache

---

### 2.4 Files to Exclude from Template

#### Development & Release Artifacts
```
.changeset/
.task/
*.log
**/CHANGELOG.md
```

#### Template-Specific Documentation
```
CONTRIBUTING.md
docs/PUBLISHING.md
```

#### Example Project Artifacts
```
# If bun-eth has example-specific docs
docs/screenshots/
docs/*_GUIDE.md (deployment guides for specific examples)
docs/CROWDSALE_*.md (crowdsale-specific docs)
```

#### Keep These Essential Docs
```
README.md
docs/ARCHITECTURE.md
docs/FEATURES.md
docs/QUICKSTART.md
LICENSE
```

---

## 3. Additional Recommendations

### 3.1 Create Minimal Template Variant

Consider offering two template variants:

1. **Full Template** (Current)
   - All packages included
   - Full documentation
   - Example contracts and UI

2. **Minimal Template** (New)
   - Only essential packages
   - Minimal documentation
   - Empty contracts folder with just basic setup
   - Ideal for starting from scratch

### 3.2 Template-Specific README

Create a `README.template.md` that replaces `README.md` when template is used:

```markdown
# {{PROJECT_NAME}}

> Built with [Bun-Eth](https://github.com/Bun-Eth-Community/bun-eth)

## Quick Start

\`\`\`bash
task setup
task dev:up
task contracts:deploy
\`\`\`

## Documentation

See [Bun-Eth documentation](https://github.com/Bun-Eth-Community/bun-eth) for full details.
```

### 3.3 Deployment Guide Addition

The improved deployment error handling references `docs/DEPLOYMENT_GUIDE.md`.
Consider creating this guide in bun-eth with:

- Step-by-step Sepolia deployment
- How to get RPC URLs (Infura, Alchemy)
- How to get Etherscan API keys
- Funding your deployer address
- Verifying contracts
- Multi-chain deployment guide

---

## 4. Implementation Checklist

### Phase 1: Backport Improvements to bun-eth
- [ ] Update `.env.example` with better documentation
- [ ] Improve `contracts:deploy:sepolia` task with error handling
- [ ] Remove Hardhat legacy references
- [ ] Update `test:watch` command
- [ ] Add `DEPLOYMENT_GUIDE.md`

### Phase 2: Configure GitHub Template
- [ ] Create `.gitattributes` with export-ignore rules
- [ ] Enable template repository in GitHub settings
- [ ] Test "Use this template" functionality
- [ ] Verify excluded files are not copied

### Phase 3: Update create-bun-eth CLI
- [ ] Add `degit` dependency
- [ ] Replace git clone with degit approach
- [ ] Update CLI documentation
- [ ] Test with both full-stack and backend-only modes
- [ ] Verify .gitattributes exclusions work

### Phase 4: Documentation & Release
- [ ] Update main README with template approach
- [ ] Create migration guide for existing projects
- [ ] Update CLI help text
- [ ] Publish new version of create-bun-eth
- [ ] Announce changes to community

---

## 5. Migration for Existing Projects

For projects already created with the old approach, provide a migration script:

```bash
#!/bin/bash
# scripts/cleanup-template-artifacts.sh

echo "Cleaning up template-specific artifacts..."

# Remove changesets
rm -rf .changeset
echo "✓ Removed .changeset"

# Remove changelogs
find . -name "CHANGELOG.md" -not -path "./node_modules/*" -delete
echo "✓ Removed CHANGELOG.md files"

# Remove task artifacts
rm -rf .task
echo "✓ Removed .task directory"

# Remove publishing docs
rm -f docs/PUBLISHING.md
echo "✓ Removed publishing docs"

echo ""
echo "Cleanup complete!"
echo "Your project is now cleaner and ready for development."
```

---

## 6. Expected Outcomes

### Developer Experience
- **Faster setup:** 30-50% faster initialization
- **Less confusion:** No template artifacts in project
- **Clearer errors:** Better error messages for deployment
- **Better docs:** Improved .env and deployment documentation

### Maintenance
- **Easier updates:** Template changes automatically reflected
- **Less code:** Remove cleanup logic from CLI
- **Better structure:** Clear separation of template vs. project concerns

### Community
- **Lower barrier to entry:** "Use this template" button
- **Professional appearance:** Cleaner starting point
- **Better adoption:** Faster, cleaner setup encourages use

---

## 7. Alternatives Considered

### Alternative 1: Keep Cloning, Improve Cleanup
**Pros:** Less change to existing system
**Cons:** Still downloads unnecessary data, requires maintenance

### Alternative 2: Monorepo with Multiple Templates
**Pros:** Could offer more template variants
**Cons:** More complex to maintain, confusing structure

### Alternative 3: Custom Template Server
**Pros:** Full control over templating
**Cons:** Infrastructure overhead, maintenance burden

**Conclusion:** GitHub templates + degit provides the best balance of simplicity, speed, and maintainability.

---

## 8. Next Steps

1. **Review this proposal** with maintainers and community
2. **Create issues** for each improvement
3. **Implement in phases** to allow testing and feedback
4. **Document changes** thoroughly
5. **Communicate** updates to existing users

---

## Appendix: Quick Reference

### Degit Installation
```bash
cd packages/create-bun-eth
bun add degit
```

### Testing Template Locally
```bash
# Test degit approach
bunx degit ../bun-eth test-project
cd test-project
task setup
```

### Verifying .gitattributes
```bash
# Check what would be exported
git archive HEAD | tar -t
```

---

**Document Version:** 1.0
**Date:** 2025-10-09
**Author:** Bun-Eth Community
**Status:** Proposal - Pending Review
