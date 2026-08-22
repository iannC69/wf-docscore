import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { scanMediaLibrary } from "@/lib/admin/mediaScanner";
import { recordAuditEvent } from "@/lib/security/audit";

const PUBLIC_DIR = path.join(process.cwd(), "public");

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageMedia && !session.permissions?.canEditDocs) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const result = scanMediaLibrary();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageMedia && !session.permissions?.canEditDocs) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetFolder = (formData.get("folder") as string) || "media";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uploadDir = path.join(PUBLIC_DIR, targetFolder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const finalPath = path.join(uploadDir, safeName);
    fs.writeFileSync(finalPath, buffer);

    const relativeUrl = `/${targetFolder}/${safeName}`;

    recordAuditEvent({
      action: "MEDIA_UPLOAD",
      actor: session.username,
      ip,
      details: {
        filename: safeName,
        url: relativeUrl,
        sizeBytes: buffer.length,
        sizeFormatted: `${(buffer.length / 1024).toFixed(1)} KB`,
        extension: path.extname(safeName),
      },
    });

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      filename: safeName,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const relPath = searchParams.get("path");

    if (!relPath) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const cleanRel = relPath.replace(/^\/+/, "");
    const fullPath = path.join(PUBLIC_DIR, cleanRel);

    if (!fullPath.startsWith(PUBLIC_DIR) || !fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
    }

    const stats = fs.statSync(fullPath);
    fs.unlinkSync(fullPath);

    recordAuditEvent({
      action: "MEDIA_DELETE",
      actor: session.username,
      ip,
      details: {
        filename: path.basename(cleanRel),
        path: cleanRel,
        sizeBytes: stats.size,
        sizeFormatted: `${(stats.size / 1024).toFixed(1)} KB`,
      },
    });

    return NextResponse.json({ success: true, message: "Asset deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 500 });
  }
}
