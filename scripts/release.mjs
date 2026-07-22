#!/usr/bin/env node
/**
 * Release preparation script.
 *
 * Run with: npm run prepare-release
 *
 * What it does:
 *   1. Determines the next version via conventional-recommended-bump
 *   2. Updates manifest.json, package.json, and versions.json
 *   3. Prepends a CHANGELOG.md entry
 *   4. Commits all changes with a chore(release): message
 *
 * Does NOT tag or push — that is done by CI after the PR merges to main.
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(file) {
  return JSON.parse(readFileSync(resolve(root, file), "utf8"));
}

function writeJson(file, data) {
  writeFileSync(resolve(root, file), JSON.stringify(data, null, "\t") + "\n");
}

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, encoding: "utf8", stdio: opts.pipe ? "pipe" : "inherit", ...opts });
}

// ---------------------------------------------------------------------------
// 1. Determine release type
// ---------------------------------------------------------------------------

let bumpOutput;
try {
  bumpOutput = run("npx --no conventional-recommended-bump -p conventionalcommits", { pipe: true });
} catch {
  console.error("conventional-recommended-bump failed. Ensure you have conventional commits since the last tag.");
  process.exit(1);
}

// Output is a JSON object like {"releaseType":"patch","reason":"...","level":2}
let releaseType;
try {
  const parsed = JSON.parse(bumpOutput.trim());
  releaseType = parsed.releaseType;
} catch {
  // Older versions may just print the type
  releaseType = bumpOutput.trim();
}

if (!releaseType || !["major", "minor", "patch"].includes(releaseType)) {
  console.log("No releasable commits found (bump type: %s). Nothing to do.", releaseType ?? "none");
  process.exit(0);
}

console.log("Release type:", releaseType);

// ---------------------------------------------------------------------------
// 2. Compute new version
// ---------------------------------------------------------------------------

const { inc } = await import("semver");

const manifest = readJson("manifest.json");
const pkg = readJson("package.json");
const versions = readJson("versions.json");

const current = manifest.version;
const next = inc(current, releaseType);
if (!next) {
  console.error("semver.inc failed for version", current);
  process.exit(1);
}

console.log(`Version: ${current} → ${next}`);

// ---------------------------------------------------------------------------
// 3. Write version into manifest.json, package.json, versions.json
// ---------------------------------------------------------------------------

manifest.version = next;
writeJson("manifest.json", manifest);

pkg.version = next;
writeJson("package.json", pkg);

versions[next] = manifest.minAppVersion;
writeJson("versions.json", versions);

// ---------------------------------------------------------------------------
// 4. Generate/update CHANGELOG.md
// ---------------------------------------------------------------------------

console.log("Updating CHANGELOG.md…");
run("npx --no conventional-changelog-cli -p conventionalcommits -i CHANGELOG.md -s");

// ---------------------------------------------------------------------------
// 5. Commit
// ---------------------------------------------------------------------------

run("git add manifest.json package.json versions.json CHANGELOG.md package-lock.json");
run(`git commit -m "chore(release): v${next}"`);

console.log(`
✅  Release commit created: chore(release): v${next}

Next steps:
  git push origin dev
  Open a PR from dev → main titled "chore(release): v${next}"
  Merge the PR — CI will tag, build, and publish the GitHub release automatically.
`);
