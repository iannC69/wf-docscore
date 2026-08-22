import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { recordAuditEvent } from "@/lib/security/audit";

const VERSIONS_DIR = path.join(process.cwd(), "content", ".versions");

export interface DocVersion {
  id: string;
  slug: string;
  timestamp: string;
  savedBy: string;
  content: string;
  charCount: number;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Root Super Admin Isolation: Only Root (iannC69) has access to view versions & rollback
  if (!session.isRoot) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Doar Root Super Admin (iannC69) are acces la istoricul de revizii." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const cleanSlug = slug.replace(/^\/+/, "").replace(/\.(md|mdx)$/, "");
  const targetDir = path.join(VERSIONS_DIR, cleanSlug);

  if (!fs.existsSync(targetDir)) {
    return NextResponse.json({ versions: [] });
  }

  const files = fs.readdirSync(targetDir);
  const versions: DocVersion[] = [];

  for (const f of files) {
    if (f.endsWith(".json")) {
      try {
        const raw = fs.readFileSync(path.join(targetDir, f), "utf-8");
        const parsed = JSON.parse(raw);
        versions.push(parsed);
      } catch { }
    }
  }

  // Sort newest first
  versions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json({ versions });
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
      return NextResponse.json({ error: "Slug and content are required" }, { status: 400 });
    }

    const cleanSlug = slug.replace(/^\/+/, "").replace(/\.(md|mdx)$/, "");
    const targetDir = path.join(VERSIONS_DIR, cleanSlug);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const versionId = `rev-${Date.now()}`;
    const versionData: DocVersion = {
      id: versionId,
      slug: cleanSlug,
      timestamp,
      savedBy: session.username,
      content,
      charCount: content.length,
    };

    fs.writeFileSync(
      path.join(targetDir, `${versionId}.json`),
      JSON.stringify(versionData, null, 2),
      "utf-8"
    );

    recordAuditEvent({
      action: action === "rollback" ? "DOC_ROLLBACK" : "DOC_VERSION_SAVE",
      actor: session.username,
      ip,
      details: { slug: cleanSlug, versionId },
    });

    return NextResponse.json({
      success: true,
      versionId,
      timestamp,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save version" }, { status: 500 });
  }
}
