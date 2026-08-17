import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { recordAuditEvent } from "@/lib/security/audit";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

function getAllDocFiles(dir = DOCS_DIR, base = ""): { slug: string; relativePath: string; fullPath: string }[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let results: { slug: string; relativePath: string; fullPath: string }[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(getAllDocFiles(fullPath, rel));
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      const cleanSlug = rel.replace(/\\/g, "/").replace(/\.(md|mdx)$/, "");
      results.push({ slug: cleanSlug, relativePath: rel, fullPath });
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
      content,
    });
  }

  const docs = getAllDocFiles();
  return NextResponse.json({
    total: docs.length,
    docs: docs.map((d) => ({ slug: d.slug, relativePath: d.relativePath })),
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
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

    return NextResponse.json({
      success: true,
      message: `Document ${isNew ? "created" : "updated"} successfully.`,
      slug,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save document" }, { status: 500 });
  }
}
