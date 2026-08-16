#!/usr/bin/env node

/**
 * Wildfire Docs — Release Automation Engine
 *
 * Usage:
 *   node scripts/release.mjs <version> [title]
 *   npm run release 1.3.0 "Mobile Optimization & Liquid Glass Upgrades"
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// 1. Parse CLI arguments
const rawVersion = process.argv[2];
const customTitle = process.argv[3];

if (!rawVersion) {
  console.error("\x1b[31m[ERROR] Please specify a version number.\x1b[0m");
  console.log("Usage: npm run release <version> [title]");
  console.log("Example: npm run release 1.3.0 \"Mobile Optimization & Header Upgrades\"");
  process.exit(1);
}

const cleanVersion = rawVersion.startsWith("v") ? rawVersion.slice(1) : rawVersion;
const formattedVersion = `v${cleanVersion}`;
const versionSlug = `v${cleanVersion.replace(/\./g, "-")}`;

console.log(`\n\x1b[36m>>> Starting Release Process for ${formattedVersion}...\x1b[0m`);

// 2. Read current version from lib/version.ts
const versionFilePath = path.join(ROOT_DIR, "lib", "version.ts");
let previousVersion = "1.2.0";
if (fs.existsSync(versionFilePath)) {
  const versionFileContent = fs.readFileSync(versionFilePath, "utf-8");
  const match = versionFileContent.match(/CURRENT_VERSION = "(.*?)"/);
  if (match) previousVersion = match[1];
}

console.log(`Previous Version: v${previousVersion}`);
console.log(`Target Version:   ${formattedVersion}`);

// 3. Extract Git commits since last release or recent commits
let gitCommits = [];
try {
  const rawLog = execSync(`git log -n 25 --oneline`, { encoding: "utf-8" }).trim();
  const lines = rawLog.split("\n").filter(Boolean);

  for (const line of lines) {
    const spaceIdx = line.indexOf(" ");
    if (spaceIdx === -1) continue;
    const hash = line.slice(0, spaceIdx).trim();
    const rawMsg = line.slice(spaceIdx + 1).trim();

    // Skip automated release commits
    if (rawMsg.startsWith("chore(release):") || rawMsg.startsWith("release:")) continue;

    // Categorize commit
    let type = "improvement";
    let title = rawMsg;

    const lower = rawMsg.toLowerCase();
    if (lower.startsWith("feat:") || lower.startsWith("feat(")) {
      type = "feature";
      title = rawMsg.replace(/^feat(\(.*?\))?:\s*/i, "");
    } else if (lower.startsWith("fix:") || lower.startsWith("fix(")) {
      type = "fix";
      title = rawMsg.replace(/^fix(\(.*?\))?:\s*/i, "");
    } else if (lower.startsWith("breaking:") || lower.includes("breaking change")) {
      type = "breaking";
      title = rawMsg.replace(/^breaking(\(.*?\))?:\s*/i, "");
    } else if (lower.startsWith("perf:") || lower.startsWith("perf(")) {
      type = "improvement";
      title = rawMsg.replace(/^perf(\(.*?\))?:\s*/i, "");
    } else if (lower.startsWith("style:") || lower.startsWith("style(")) {
      type = "improvement";
      title = rawMsg.replace(/^style(\(.*?\))?:\s*/i, "");
    } else if (lower.startsWith("docs:") || lower.startsWith("docs(")) {
      type = "improvement";
      title = rawMsg.replace(/^docs(\(.*?\))?:\s*/i, "");
    } else if (lower.startsWith("refactor:") || lower.startsWith("refactor(")) {
      type = "improvement";
      title = rawMsg.replace(/^refactor(\(.*?\))?:\s*/i, "");
    }

    // Clean any accidental emojis from title
    const cleanedTitle = title
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]/gu, "")
      .trim();

    // Capitalize first letter
    const formattedTitle =
      cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

    gitCommits.push({
      hash,
      type,
      title: formattedTitle,
    });
  }
} catch (e) {
  console.warn("Could not retrieve full git history, using fallback commit.", e);
}

// 4. Format current date
const now = new Date();
const formattedDate = now.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

// 5. Build Changes list
const changes = (gitCommits.slice(0, 8)).map((c) => ({
  type: c.type,
  title: c.title,
  description: `Included in commit ${c.hash}.`,
}));

if (changes.length === 0) {
  changes.push({
    type: "feature",
    title: "Platform enhancements and updates",
    description: `Release updates for ${formattedVersion}.`,
  });
}

const latestCommitHash = gitCommits[0]?.hash || "HEAD";
const releaseTitle =
  customTitle ||
  (changes[0] ? changes[0].title : `Wildfire Docs Platform Update`);

const newRelease = {
  version: formattedVersion,
  isLatest: true,
  date: formattedDate,
  title: releaseTitle,
  summary: `Official ${formattedVersion} update introducing platform enhancements, performance optimizations, and documentation refinements.`,
  author: {
    name: "iannC69",
    username: "iannC69",
    avatar: "https://github.com/iannC69.png",
  },
  git: {
    commitHash: latestCommitHash,
    commitUrl: `https://github.com/iannC69/wf-docscore/commit/${latestCommitHash}`,
    tagUrl: `https://github.com/iannC69/wf-docscore/releases/tag/${formattedVersion}`,
  },
  changes: changes,
  highlights: [
    `Full release packaging for ${formattedVersion}`,
    `Live synchronization with GitHub commit ${latestCommitHash}`,
  ],
  slug: versionSlug,
};

// 6. Update lib/changelog.ts
const changelogPath = path.join(ROOT_DIR, "lib", "changelog.ts");
if (fs.existsSync(changelogPath)) {
  let changelogContent = fs.readFileSync(changelogPath, "utf-8");

  // Read existing RELEASES_DATA or append
  const match = changelogContent.match(/export const RELEASES_DATA: ReleaseEntry\[\] = (\[[\s\S]*?\]);/);
  if (match) {
    let existingReleases = [];
    try {
      // Safely evaluate or regex replace isLatest
      changelogContent = changelogContent.replace(/isLatest:\s*true/g, "isLatest: false");

      const newReleaseBlock = `  ${JSON.stringify(newRelease, null, 2).replace(/\n/g, "\n  ")},\n`;
      changelogContent = changelogContent.replace(
        "export const RELEASES_DATA: ReleaseEntry[] = [",
        `export const RELEASES_DATA: ReleaseEntry[] = [\n${newReleaseBlock}`
      );

      fs.writeFileSync(changelogPath, changelogContent, "utf-8");
      console.log(`\x1b[32m[OK] Updated lib/changelog.ts with ${formattedVersion}\x1b[0m`);
    } catch (err) {
      console.error("Failed to parse existing releases:", err);
    }
  }
}

// 7. Update lib/version.ts
const newVersionContent = `/**
 * Single source of truth for the Wildfire Docs platform version.
 * Updated automatically via the release automation script (\`npm run release\`).
 */
export const CURRENT_VERSION = "${cleanVersion}";
export const PLATFORM_NAME = "Wildfire Docs";
`;
fs.writeFileSync(versionFilePath, newVersionContent, "utf-8");
console.log(`\x1b[32m[OK] Updated lib/version.ts to ${cleanVersion}\x1b[0m`);

// 8. Update package.json
const pkgPath = path.join(ROOT_DIR, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.version = cleanVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  console.log(`\x1b[32m[OK] Updated package.json version to ${cleanVersion}\x1b[0m`);
}

console.log(`\n\x1b[32m====================================================\x1b[0m`);
console.log(`\x1b[32m Release ${formattedVersion} successfully created!\x1b[0m`);
console.log(`\x1b[32m Date:     ${formattedDate}\x1b[0m`);
console.log(`\x1b[32m Commit:   ${latestCommitHash}\x1b[0m`);
console.log(`\x1b[32m Changes:  ${changes.length} items categorized\x1b[0m`);
console.log(`\x1b[32m====================================================\x1b[0m\n`);
