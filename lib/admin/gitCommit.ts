import { execSync } from "child_process";
import path from "path";

const REPO_ROOT = process.cwd();

export interface GitCommitResult {
  success: boolean;
  commitHash?: string;
  pushed?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
}

/**
 * Builds the Git author string for a team member.
 *
 * Priority:
 * 1. githubUsername → "<displayName> <githubUsername@users.noreply.github.com>"
 *    GitHub recognizes the noreply email and links the commit to the real profile.
 * 2. No githubUsername → "<displayName> <username@wildfire.ro>"
 *    Commit shows the name as plain text author, not linked to a GitHub profile.
 */
function buildAuthorString(displayName: string, githubUsername: string | undefined, fallbackUsername: string): string {
  const name = displayName || fallbackUsername;
  if (githubUsername && githubUsername.trim()) {
    const ghUser = githubUsername.trim();
    return `${name} <${ghUser}@users.noreply.github.com>`;
  }
  return `${name} <${fallbackUsername.toLowerCase()}@wildfire.ro>`;
}

/**
 * Builds the commit message.
 *
 * Format: "docs(username): <action> <slug>"
 * Examples:
 *   docs(yakuza): update currency/sistem-credite
 *   docs(v1ccx): create informatii/reguli-server
 *   docs(iannc69): update market/vip-gold [root]
 */
function buildCommitMessage(
  username: string,
  action: "create" | "update" | "delete",
  slug: string,
  isRoot: boolean
): string {
  const cleanSlug = slug.replace(/^\/+/, "").replace(/\.(md|mdx)$/, "");
  const actor = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const suffix = isRoot ? " [root]" : "";
  return `docs(${actor}): ${action} ${cleanSlug}${suffix}`;
}

/**
 * Checks if the current directory is a valid Git repository.
 */
function isGitRepo(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      cwd: REPO_ROOT,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the file has any staged/unstaged changes worth committing.
 */
function hasChanges(filePath: string): boolean {
  try {
    // Check both staged and unstaged diff for this specific file
    const status = execSync(`git status --porcelain "${filePath}"`, {
      cwd: REPO_ROOT,
      encoding: "utf-8",
    }).trim();
    return status.length > 0;
  } catch {
    return false;
  }
}

/**
 * Commits a document change to Git with the correct GitHub authorship.
 *
 * This is called server-side by the /api/admin/doc POST handler after writing
 * the file to disk. It automatically stages and commits the file with the
 * logged-in team member as the Git author.
 *
 * Failure is always silent — if Git is not available, the file save still
 * succeeds and the function returns { success: false, skipped: true }.
 */
export async function commitDocChange(opts: {
  /** Relative path from repo root, e.g. "content/docs/currency/credite.md" */
  filePath: string;
  /** Team member's displayName */
  authorName: string;
  /** Team member's GitHub username (optional — used for noreply email) */
  githubUsername?: string;
  /** Team member's admin panel username (used as fallback) */
  username: string;
  /** Whether this member is root */
  isRoot?: boolean;
  /** The document slug, used in commit message */
  slug: string;
  action: "create" | "update" | "delete";
}): Promise<GitCommitResult> {
  try {
    // 1. Bail out silently if not a git repo (e.g. first run, no git init)
    if (!isGitRepo()) {
      return { success: false, skipped: true, reason: "Not a Git repository." };
    }

    const absoluteFilePath = path.join(REPO_ROOT, opts.filePath);
    const relativeFilePath = opts.filePath.replace(/\\/g, "/");

    // 2. Check if there's actually something to commit for this file
    if (!hasChanges(relativeFilePath)) {
      return { success: false, skipped: true, reason: "No changes detected in file." };
    }

    // 3. Stage the specific file
    execSync(`git add "${relativeFilePath}"`, {
      cwd: REPO_ROOT,
      stdio: "ignore",
    });

    // 4. Build author string and commit message
    const authorStr = buildAuthorString(opts.authorName, opts.githubUsername, opts.username);
    const message = buildCommitMessage(opts.username, opts.action, opts.slug, opts.isRoot ?? false);

    // 5. Commit with author override — does not change the repo's global git config
    execSync(`git commit --author="${authorStr}" -m "${message}"`, {
      cwd: REPO_ROOT,
      stdio: "ignore",
      env: {
        ...process.env,
        // Ensure git doesn't prompt for anything
        GIT_TERMINAL_PROMPT: "0",
      },
    });

    // 6. Read the resulting commit hash
    const commitHash = execSync("git rev-parse --short HEAD", {
      cwd: REPO_ROOT,
      encoding: "utf-8",
    }).trim();

    // 7. Auto-push to GitHub origin (non-fatal, local commit preserved)
    let pushed = false;
    try {
      const branch = process.env.GITHUB_DOCS_BRANCH || "main";
      execSync(`git push origin ${branch}`, {
        cwd: REPO_ROOT,
        stdio: "ignore",
        timeout: 10000,
        env: {
          ...process.env,
          GIT_TERMINAL_PROMPT: "0",
        },
      });
      pushed = true;
    } catch (pushErr: any) {
      console.warn("[GitCommit] Push to remote skipped or failed (local commit preserved):", pushErr?.message);
    }

    return { success: true, commitHash, pushed };
  } catch (err: any) {
    // Always silent — doc save must not fail because of git issues
    console.warn("[GitCommit] Auto-commit failed (non-fatal):", err?.message || err);
    return { success: false, error: err?.message || "Unknown git error." };
  }
}
