# Publishing Guide

This guide explains how to publish `create-bun-eth` to npm so users can run `bunx create-bun-eth@latest` without cloning the repo.

## Prerequisites

1. **npm account**: Sign up at https://www.npmjs.com/signup
2. **npm CLI**: Should be installed with Bun
3. **GitHub repo**: Push this repo to GitHub first

## Step 1: Update Repository URL

Before publishing, update the GitHub repository URL in these files:

1. **Root `package.json`**:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/Bun-Eth-Community/bun-eth.git"
   }
   ```

2. **`packages/create-bun-eth/package.json`**:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/Bun-Eth-Community/bun-eth.git",
     "directory": "packages/create-bun-eth"
   }
   ```

3. **`packages/create-bun-eth/src/index.ts`**:
   ```typescript
   const REPO_URL = "https://github.com/Bun-Eth-Community/bun-eth.git";
   ```

## Step 2: Push to GitHub

```bash
# Create a new repo on GitHub first, then:
git remote add origin https://github.com/Bun-Eth-Community/bun-eth.git
git branch -M main
git push -u origin main

# Make sure the repo is public so users can clone it
```

## Step 3: Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

## Step 4: Publish the Package

```bash
# Navigate to the create-bun-eth package
cd packages/create-bun-eth

# Publish to npm
npm publish --access public
```

**Important Notes:**
- First time publishing: The package name `create-bun-eth` must be available on npm
- If the name is taken, update the name in `package.json` to something like `@bun-eth-community/create-bun-eth`
- For scoped packages (`@yourusername/`), you don't need `--access public` if you have a paid npm account

## Step 5: Test the Published Package

```bash
# In a different directory, test it works:
bunx create-bun-eth@latest test-project
cd test-project
task setup
```

## Publishing Updates

When you make changes and want to publish a new version:

1. **Update version** in `packages/create-bun-eth/package.json`:
   ```bash
   # For patch updates (0.1.0 -> 0.1.1)
   cd packages/create-bun-eth
   npm version patch

   # For minor updates (0.1.0 -> 0.2.0)
   npm version minor

   # For major updates (0.1.0 -> 1.0.0)
   npm version major
   ```

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "chore: bump version to $(node -p 'require(\"./package.json\").version')"
   git push
   ```

3. **Publish**:
   ```bash
   npm publish
   ```

## Alternative: Using GitHub as Template

If you don't want to publish to npm, you can make the GitHub repo a template:

1. Go to your repo on GitHub
2. Click **Settings** → **General**
3. Check **Template repository**
4. Users can then create projects with:
   ```bash
   git clone https://github.com/Bun-Eth-Community/bun-eth.git my-dapp
   cd my-dapp
   rm -rf .git
   git init
   task setup
   ```

## Scoped Package (Recommended for Organizations)

If you want to publish under your username/org:

1. Update `packages/create-bun-eth/package.json`:
   ```json
   {
     "name": "@bun-eth-community/create-bun-eth"
   }
   ```

2. Users run:
   ```bash
   bunx @bun-eth-community/create-bun-eth@latest my-dapp
   ```

## Troubleshooting

### "Package name already exists"
- Use a scoped name: `@bun-eth-community/create-bun-eth`
- Or choose a different name

### "Need to login"
```bash
npm logout
npm login
```

### "Permission denied"
- Make sure you own the package name
- For scoped packages, you need the right to publish under that scope

### "Repository URL not found"
- Make sure the GitHub repo is public
- Double-check the URL in all files matches your actual repo

## CI/CD Automation (Optional)

To automate publishing with GitHub Actions, create `.github/workflows/publish.yml`:

```yaml
name: Publish Package

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: bun install

      - name: Publish to npm
        working-directory: packages/create-bun-eth
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Then add your npm token to GitHub secrets:
1. Generate npm token: https://www.npmjs.com/settings/bun-eth-community/tokens
2. Add to GitHub: Repo → Settings → Secrets → New repository secret
3. Name: `NPM_TOKEN`, Value: your token

---

**You're ready to publish!** 🚀
