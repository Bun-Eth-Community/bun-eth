#!/bin/bash

# Script to clean up template-specific artifacts from projects
# created with the old cloning approach
#
# Usage: bash scripts/cleanup-template-artifacts.sh

echo "🧹 Cleaning up template-specific artifacts..."
echo ""

# Function to safely remove files/directories
safe_remove() {
    local path=$1
    local description=$2

    if [ -e "$path" ]; then
        rm -rf "$path"
        echo "✓ Removed $description"
    else
        echo "⊘ $description not found (already clean)"
    fi
}

# Remove changesets
safe_remove ".changeset" ".changeset directory"

# Remove changelogs
echo ""
echo "🔍 Looking for CHANGELOG.md files..."
if find . -name "CHANGELOG.md" -not -path "./node_modules/*" | grep -q .; then
    find . -name "CHANGELOG.md" -not -path "./node_modules/*" -delete
    echo "✓ Removed CHANGELOG.md files"
else
    echo "⊘ No CHANGELOG.md files found"
fi

# Remove task artifacts
safe_remove ".task" ".task directory"

# Remove publishing docs
echo ""
safe_remove "docs/PUBLISHING.md" "publishing documentation"

# Remove CONTRIBUTING.md if it exists
safe_remove "CONTRIBUTING.md" "CONTRIBUTING.md"

# Remove template proposal
safe_remove "TEMPLATE_PROPOSAL.md" "template proposal"

echo ""
echo "═══════════════════════════════════════════════"
echo "✨ Cleanup complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "Your project is now cleaner and ready for development."
echo ""
echo "Removed artifacts:"
echo "  - .changeset/ (version management)"
echo "  - CHANGELOG.md files (version history)"
echo "  - .task/ (task logs)"
echo "  - docs/PUBLISHING.md (publishing guide)"
echo "  - CONTRIBUTING.md (contribution guide)"
echo "  - TEMPLATE_PROPOSAL.md (template proposal)"
echo ""
echo "Next steps:"
echo "  1. Review the changes with: git status"
echo "  2. Commit the cleanup: git add -A && git commit -m 'chore: cleanup template artifacts'"
echo "  3. Continue building your project!"
echo ""
