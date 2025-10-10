#!/bin/bash

# Test script to create a project from local template
# Usage: ./scripts/test-local-template.sh my-test-project [--backend-only]

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <project-name> [--backend-only]"
  exit 1
fi

PROJECT_NAME=$1
PROJECT_TYPE=${2:---full-stack}
TARGET_DIR="/tmp/$PROJECT_NAME"

echo "🚀 Creating local test project: $PROJECT_NAME"
echo "📦 Type: $PROJECT_TYPE"
echo "📂 Location: $TARGET_DIR"
echo ""

# Remove existing test directory
if [ -d "$TARGET_DIR" ]; then
  echo "🗑️  Removing existing test directory..."
  rm -rf "$TARGET_DIR"
fi

# Copy the template (excluding development artifacts)
echo "📦 Copying local template..."
rsync -av \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.task' \
  --exclude='*.log' \
  --exclude='.changeset' \
  --exclude='CHANGELOG.md' \
  --exclude='TEMPLATE_PROPOSAL.md' \
  --exclude='docs/PUBLISHING.md' \
  --exclude='CONTRIBUTING.md' \
  --exclude='.git' \
  ./ "$TARGET_DIR/"

cd "$TARGET_DIR"

# Remove backend-only files if needed
if [ "$PROJECT_TYPE" = "--backend-only" ]; then
  echo "🗑️  Removing frontend packages..."
  rm -rf apps/web
  rm -rf packages/hooks
  rm -rf packages/components
  rm -rf packages/burner-connector
fi

# Update package.json name
echo "📝 Updating project name..."
bun run -e "
const pkg = await Bun.file('package.json').json();
pkg.name = '$PROJECT_NAME';
await Bun.write('package.json', JSON.stringify(pkg, null, 2));
"

# Initialize git
echo "🔧 Initializing Git repository..."
git init
git add .
git commit -m "feat: initialize bun-eth project"

echo ""
echo "✅ Project created at: $TARGET_DIR"
echo ""
echo "Next steps:"
echo "  cd $TARGET_DIR"
echo "  task install"
echo "  task dev:up"
echo "  task contracts:deploy"
echo ""
