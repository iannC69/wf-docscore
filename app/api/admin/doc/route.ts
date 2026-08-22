import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { recordAuditEvent } from "@/lib/security/audit";
import { incrementMemberDocCount, findTeamMemberByUsername } from "@/lib/security/teamStore";
import { commitDocChange } from "@/lib/admin/gitCommit";
import { invalidateGitCache } from "@/lib/git";
import { invalidateRepoStatsCache } from "@/lib/repoContributions";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export interface DocFileInfo {
  slug: string;
  relativePath: string;
  fullPath: string;
  category: string;
  title: string;
}

function getAllDocFiles(dir = DOCS_DIR, base = ""): DocFileInfo[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let results: DocFileInfo[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(getAllDocFiles(fullPath, rel));
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      const cleanSlug = rel.replace(/\\/g, "/").replace(/\.(md|mdx)$/, "");
      
      // Extract title and category
      let title = path.basename(cleanSlug).replace(/-/g, " ");
      try {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const titleMatch = raw.match(/title:\s*["']?([^"\n\r]+)["']?/);
        if (titleMatch && titleMatch[1].trim()) {
          title = titleMatch[1].trim();
        }
      } catch {}

      const parts = cleanSlug.split("/");
      const category = parts.length > 1 ? parts[0] : "general";

      results.push({ slug: cleanSlug, relativePath: rel, fullPath, category, title });
    }
  }

  return results;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const all = getAllDocFiles();
    const match = all.find((d) => d.slug === slug || d.slug === slug.replace(/^\//, ""));

    if (!match || !fs.existsSync(match.fullPath)) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const content = fs.readFileSync(match.fullPath, "utf-8");
    return NextResponse.json({
      slug: match.slug,
      relativePath: match.relativePath,
      category: match.category,
      title: match.title,
      content,
      currentUser: {
        username: session.username,
        displayName: session.displayName,
        role: session.role,
        isRoot: session.isRoot,
      },
    });
  }

  const docs = getAllDocFiles();
  return NextResponse.json({
    total: docs.length,
    docs: docs.map((d) => ({
      slug: d.slug,
      relativePath: d.relativePath,
      category: d.category,
      title: d.title,
    })),
    currentUser: {
      username: session.username,
      displayName: session.displayName,
      role: session.role,
      isRoot: session.isRoot,
    },
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canEditDocs) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Acces Refuzat: Nu ai permisiunea canEditDocs pentru a modifica documente." },
      { status: 403 }
    );
  }

  try {
    const { slug, content, action } = await req.json();

    if (!slug || !content) {
      return NextResponse.json({ error: "Slug and content are required." }, { status: 400 });
    }

    const cleanRelPath = `${slug.replace(/^\/+/, "").replace(/\.(md|mdx)$/, "")}.md`;
    const targetPath = path.join(DOCS_DIR, cleanRelPath);

    // Prevent path traversal
    if (!targetPath.startsWith(DOCS_DIR)) {
      return NextResponse.json({ error: "Invalid path security violation." }, { status: 400 });
    }

    const isNew = !fs.existsSync(targetPath);
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, content, "utf-8");

    recordAuditEvent({
      action: isNew ? "DOC_CREATE" : "DOC_UPDATE",
      actor: session.username,
      ip,
      details: { slug, path: cleanRelPath, action },
    });

    // Increment contributor's modified docs counter
    incrementMemberDocCount(session.username);

    // ── Auto-Git Commit with GitHub authorship ──────────────────────────────
    // Resolves the logged-in member's githubUsername for proper attribution.
    // Fails silently — doc save always succeeds regardless of Git status.
    let commitHash: string | undefined;
    try {
      const member = findTeamMemberByUsername(session.username);
      const gitResult = await commitDocChange({
        filePath: `content/docs/${cleanRelPath}`.replace(/\\/g, "/"),
        authorName: member?.displayName || session.username,
        githubUsername: member?.githubUsername,
        username: session.username,
        isRoot: member?.isRoot ?? false,
        slug,
        action: isNew ? "create" : "update",
      });
      if (gitResult.success) {
        commitHash = gitResult.commitHash;
        console.info(`[GitCommit] ${session.username} committed ${slug} → ${commitHash}`);
      } else if (!gitResult.skipped) {
        console.warn(`[GitCommit] Commit failed for ${slug}:`, gitResult.error);
      }
    } catch (gitErr: any) {
      console.warn("[GitCommit] Unexpected error (non-fatal):", gitErr?.message);
    }
    // ────────────────────────────────────────────────────────────────────────

    // Invalidate Git cache so updated author / commit metadata renders fresh
    invalidateGitCache(targetPath);
    invalidateRepoStatsCache();

    return NextResponse.json({
      success: true,
      message: `Document ${isNew ? "created" : "updated"} successfully.`,
      slug,
      ...(commitHash ? { commitHash } : {}),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canDeleteDocs) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Acces Refuzat: Doar administratorii cu permisiunea 'canDeleteDocs' sau Super Administratorul Root pot șterge documente!" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Parametrul 'slug' este obligatoriu." }, { status: 400 });
    }

    const cleanRelPath = `${slug.replace(/^\/+/, "").replace(/\.(md|mdx)$/, "")}.md`;
    const targetPath = path.join(DOCS_DIR, cleanRelPath);

    if (!targetPath.startsWith(DOCS_DIR)) {
      return NextResponse.json({ error: "Violare de securitate la calea fișierului." }, { status: 400 });
    }

    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ error: "Documentul nu există pe disc." }, { status: 404 });
    }

    fs.unlinkSync(targetPath);

    recordAuditEvent({
      action: "DOC_DELETE",
      actor: session.username,
      ip,
      details: { slug, path: cleanRelPath },
    });

    invalidateGitCache(targetPath);
    invalidateRepoStatsCache();

    return NextResponse.json({
      success: true,
      message: `Articolul '${slug}' a fost șters cu succes.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Eroare la ștergerea documentului" }, { status: 500 });
  }
}
