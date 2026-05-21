#!/usr/bin/env bash
# scripts/install-to-test-vault.sh
#
# Builds the plugin and copies the release artifacts into test-plugin-vault
# so you can open it in Obsidian for manual QA.
#
# Usage (from repo root):
#   npm run install-test
#   # or directly:
#   bash scripts/install-to-test-vault.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGIN_DIR="$REPO_ROOT/test-plugin-vault/.obsidian/plugins/rainbow-header-coloring"

echo "→ Building plugin..."
cd "$REPO_ROOT"
npm run build

echo "→ Installing to test-plugin-vault..."
mkdir -p "$PLUGIN_DIR"
cp "$REPO_ROOT/main.js"       "$PLUGIN_DIR/main.js"
cp "$REPO_ROOT/manifest.json" "$PLUGIN_DIR/manifest.json"
cp "$REPO_ROOT/styles.css"    "$PLUGIN_DIR/styles.css"

echo "✔ Done."
echo ""
echo "  Open test-plugin-vault/ as an Obsidian vault."
echo "  Go to Settings → Community plugins and enable 'Rainbow Header Coloring'."
