import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { loadTeamMembers } from "@/lib/security/teamStore";

export interface GitCommitInfo {
  authorName: string;
  authorEmail: string;
  authorUsername: string;
  authorDisplayName?: string;
  authorGithubUsername?: string;
  authorProfileUrl?: string;
  authorCustomTitle?: string;
  authorRole?: string;
  authorAvatar: string;
  date: string;
  relativeTime: string;
  commitHash: string;
  commitMessage: string;
  commitUrl?: string;
}

export interface RecentDocItem {
  slug: string;
  href: string;
  title: string;
  description: string;
  category: string;
  readingTime: number;
  lastUpdated: string;
  relativeTime: string;
  authorName: string;
  authorAvatar: string;
  commitHash: string;
  badge?: string;
}

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

// Fallback GitHub repo config
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || "iannC69";
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || "wf-docscore";
const DEFAULT_AUTHOR = "iannC69";
const DEFAULT_EMAIL = "iannc@wildfire.ro";

/**
 * Format date into human-readable relative time (e.g. "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Handle future or zero diff
    if (diffMs < 0 || isNaN(diffMs)) return "Recently";

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${diffYears}y ago`;
  } catch {
    return "Recently";
  }
}

export interface ResolvedAuthorProfile {
  username: string;
  displayName: string;
  githubUsername?: string;
  avatarUrl: string;
  profileUrl: string;
  customTitle?: string;
  role?: string;
}

/**
 * Derives team profile, avatar URL, and GitHub metadata dynamically from author name or email.
 * Cross-references with team.json / teamStore.
 */
export function getAuthorProfile(name: string, email: string): ResolvedAuthorProfile {
  try {
    const members = loadTeamMembers();
    const cleanName = (name || "").trim().toLowerCase();
    const cleanEmail = (email || "").trim().toLowerCase();

    // Check for github noreply pattern: e.g. "Yakuza2377@users.noreply.github.com"
    const ghNoreplyMatch = cleanEmail.match(/^(\d+\+)?([a-z0-9_-]+)@users\.noreply\.github\.com$/i);
    const noreplyGhUser = ghNoreplyMatch ? ghNoreplyMatch[2].toLowerCase() : "";

    // Find in teamStore
    const matchedMember = members.find((m) => {
      if (m.username.toLowerCase() === cleanName) return true;
      if (m.displayName.toLowerCase() === cleanName) return true;
      if (m.githubUsername && m.githubUsername.toLowerCase() === cleanName) return true;
      if (noreplyGhUser && m.githubUsername && m.githubUsername.toLowerCase() === noreplyGhUser) return true;
      if (m.email && m.email.toLowerCase() === cleanEmail) return true;
      return false;
    });

    if (matchedMember) {
      const displayName = matchedMember.displayName || matchedMember.username;
      const ghUser = matchedMember.githubUsername;
      const avatar = matchedMember.avatarUrl || (ghUser ? `https://github.com/${ghUser}.png` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff&size=64&bold=true`);
      const profileUrl = ghUser ? `https://github.com/${ghUser}` : `/team`;

      return {
        username: matchedMember.username,
        displayName,
        githubUsername: ghUser,
        avatarUrl: avatar,
        profileUrl,
        customTitle: matchedMember.customTitle,
        role: matchedMember.role,
      };
    }
  } catch (err) {
    console.warn("[GitProfile] Error matching team member:", err);
  }

  // If author is repository owner or matches iannC69
  if (name.toLowerCase().includes("iannc") || email.toLowerCase().includes("solwolfs") || name.toLowerCase().includes("iann")) {
    return {
      username: "iannC69",
      displayName: "iannC",
      githubUsername: "iannC69",
      avatarUrl: "https://avatars.fastly.steamstatic.com/f9a2171998ee2677dae87089953177799dbf7dc1_full.jpg",
      profileUrl: "https://github.com/iannC69",
      customTitle: "Lead Docs & Systems Architect",
      role: "root_admin",
    };
  }

  // Fallback for external or unknown committers
  const cleanFallback = name || "Wildfire Team";
  return {
    username: cleanFallback,
    displayName: cleanFallback,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanFallback)}&background=ff6b00&color=fff&size=64&bold=true`,
    profileUrl: `https://github.com/${encodeURIComponent(cleanFallback)}`,
  };
}

function runGitCommand(cmd: string): string | null {
  const gitPaths = [
    "git",
    "\"C:\\Program Files\\Git\\cmd\\git.exe\"",
    "\"C:\\Program Files (x86)\\Git\\cmd\\git.exe\"",
  ];

  for (const gitBin of gitPaths) {
    try {
      const output = execSync(`${gitBin} ${cmd}`, {
        cwd: process.cwd(),
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
        windowsHide: true,
        timeout: 3000,
      });
      if (output) {
        return output.trim();
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Invalidate all git info caches (called after doc saves).
 */
export function invalidateGitCache(_filePath?: string): void {
  _firstCommitCache.clear();
  _recentDocsCache = null;
}

/**
 * Get latest git commit info for a specific file.
 * Queries Git live so the latest committer is always immediately reflected.
 */
export function getFileGitInfo(filePath: string): GitCommitInfo {
  // Relative path from repo root
  const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

  // Try fetching latest commit via git log
  const gitLog = runGitCommand(`log -1 --format="%an|%ae|%ad|%h|%s" --date=iso -- "${relPath}"`);

  if (gitLog) {
    const parts = gitLog.split("|");
    if (parts.length >= 5) {
      const authorName = parts[0] || DEFAULT_AUTHOR;
      const authorEmail = parts[1] || DEFAULT_EMAIL;
      const date = parts[2] || new Date().toISOString();
      const commitHash = parts[3] || "HEAD";
      const commitMessage = parts.slice(4).join("|") || "Update documentation";
      const profile = getAuthorProfile(authorName, authorEmail);

      const result: GitCommitInfo = {
        authorName: profile.displayName || profile.username,
        authorEmail,
        authorUsername: profile.username,
        authorDisplayName: profile.displayName,
        authorGithubUsername: profile.githubUsername,
        authorProfileUrl: profile.profileUrl,
        authorCustomTitle: profile.customTitle,
        authorRole: profile.role,
        authorAvatar: profile.avatarUrl,
        date,
        relativeTime: formatRelativeTime(date),
        commitHash,
        commitMessage,
        commitUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commit/${commitHash}`,
      };
      return result;
    }
  }

  // Fallback to file filesystem stats if git is unavailable or file uncommitted
  try {
    const stats = fs.statSync(filePath);
    const date = stats.mtime.toISOString();
    const profile = getAuthorProfile(DEFAULT_AUTHOR, DEFAULT_EMAIL);

    const fallback: GitCommitInfo = {
      authorName: profile.displayName || DEFAULT_AUTHOR,
      authorEmail: DEFAULT_EMAIL,
      authorUsername: DEFAULT_AUTHOR,
      authorDisplayName: profile.displayName,
      authorGithubUsername: profile.githubUsername,
      authorProfileUrl: profile.profileUrl,
      authorCustomTitle: profile.customTitle,
      authorRole: profile.role,
      authorAvatar: profile.avatarUrl,
      date,
      relativeTime: formatRelativeTime(date),
      commitHash: "latest",
      commitMessage: "Documentation update",
      commitUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
    };
    return fallback;
  } catch {
    const profile = getAuthorProfile(DEFAULT_AUTHOR, DEFAULT_EMAIL);
    const err: GitCommitInfo = {
      authorName: profile.displayName || DEFAULT_AUTHOR,
      authorEmail: DEFAULT_EMAIL,
      authorUsername: DEFAULT_AUTHOR,
      authorDisplayName: profile.displayName,
      authorGithubUsername: profile.githubUsername,
      authorProfileUrl: profile.profileUrl,
      authorCustomTitle: profile.customTitle,
      authorRole: profile.role,
      authorAvatar: profile.avatarUrl,
      date: new Date().toISOString(),
      relativeTime: "Recently",
      commitHash: "main",
      commitMessage: "Documentation update",
      commitUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
    };
    return err;
  }
}

/**
 * Get the first commit info ("Posted by" / "Created by") for a specific file.
 * Cached per file path.
 */
const _firstCommitCache = new Map<string, GitCommitInfo>();

export function getFileFirstCommitInfo(filePath: string): GitCommitInfo {
  if (_firstCommitCache.has(filePath)) return _firstCommitCache.get(filePath)!;

  const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

  // Fetch earliest commit for this file
  const gitLog = runGitCommand(`log --reverse --format="%an|%ae|%ad|%h|%s" --date=iso -- "${relPath}"`);

  if (gitLog) {
    const firstLine = gitLog.split("\n")[0];
    const parts = firstLine.split("|");
    if (parts.length >= 5) {
      const authorName = parts[0] || DEFAULT_AUTHOR;
      const authorEmail = parts[1] || DEFAULT_EMAIL;
      const date = parts[2] || new Date().toISOString();
      const commitHash = parts[3] || "init";
      const commitMessage = parts.slice(4).join("|") || "Initial documentation";
      const profile = getAuthorProfile(authorName, authorEmail);

      const firstResult: GitCommitInfo = {
        authorName: profile.username,
        authorEmail,
        authorUsername: profile.username,
        authorAvatar: profile.avatarUrl,
        date,
        relativeTime: formatRelativeTime(date),
        commitHash,
        commitMessage,
        commitUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commit/${commitHash}`,
      };
      _firstCommitCache.set(filePath, firstResult);
      return firstResult;
    }
  }

  // Fallback to latest info
  const fallback = getFileGitInfo(filePath);
  _firstCommitCache.set(filePath, fallback);
  return fallback;
}

/**
 * Get all docs pages sorted by last updated time.
 * Cached in-memory — heavy operation (runs git for all 62 files) done only once per server instance.
 */
let _recentDocsCache: RecentDocItem[] | null = null;

export function getRecentlyUpdatedDocs(limit?: number): RecentDocItem[] {
  if (_recentDocsCache) {
    if (typeof limit === "number" && limit > 0) return _recentDocsCache.slice(0, limit);
    return _recentDocsCache;
  }
  const items: RecentDocItem[] = [];

  function scanDir(dir: string, baseSlug: string = "") {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subSlug = baseSlug ? `${baseSlug}/${entry.name}` : entry.name;
        scanDir(fullPath, subSlug);
      } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const { data, content } = matter(raw);

        const cleanExt = entry.name.replace(/\.(md|mdx)$/, "");
        const fileSlug = cleanExt === "index" 
          ? (baseSlug || "")
          : (baseSlug ? `${baseSlug}/${cleanExt}` : cleanExt);

        // Derive category from first slug segment (ignoring language subfolders if present)
        const cleanSlug = fileSlug.replace(/^(en|ro)\//, "");
        const firstSegment = cleanSlug.split("/")[0] || "";
        const categoryMap: Record<string, string> = {
          "informatii": "Informații",
          "currency": "Currency",
          "systems": "Systems",
          "market": "Market & Donații",
        };
        const category = categoryMap[firstSegment] || (firstSegment ? firstSegment.replace(/-/g, " ") : "Informații");

        const gitInfo = getFileGitInfo(fullPath);

        // Approximate reading time
        const words = content.trim().split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(words / 200));

        items.push({
          slug: fileSlug,
          href: fileSlug ? `/docs/${fileSlug}` : "/docs",
          title: data.title || (fileSlug ? fileSlug.replace(/-/g, " ") : "Documentation Home"),
          description: data.description || (data.seoDescription || "Ghid detaliat si documentatie pentru serverul Wildfire."),
          category,
          readingTime,
          lastUpdated: gitInfo.date,
          relativeTime: gitInfo.relativeTime,
          authorName: gitInfo.authorName,
          authorAvatar: gitInfo.authorAvatar,
          commitHash: gitInfo.commitHash,
          badge: data.badge,
        });
      }
    }
  }

  scanDir(DOCS_DIR);

  // Exclude root /docs index from recently updated cards to avoid pointing to itself
  const filtered = items.filter(item => item.slug !== "");

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  // Store in cache
  _recentDocsCache = filtered;

  if (typeof limit === "number" && limit > 0) {
    return filtered.slice(0, limit);
  }
  return filtered;
}
