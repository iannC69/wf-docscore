import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import { getSnapshotPayload } from "@/lib/backup";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/backups/download?id=...
 * Streams the full backup payload JSON directly as a downloadable attachment
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.isRoot && !session.permissions?.canManageSnapshots) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "Acces Refuzat: Nu ai permisiunea canManageSnapshots pentru a descărca backup-uri." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Snapshot ID parameter is required." }, { status: 400 });
    }

    const payload = getSnapshotPayload(id);
    if (!payload) {
      return NextResponse.json({ error: "Snapshot payload not found on disk." }, { status: 404 });
    }

    const filename = `wildfire_docs_backup_${id}.json`;
    const jsonString = JSON.stringify(payload, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[Backup Download API] Error:", err);
    return NextResponse.json({ error: "Failed to download backup snapshot." }, { status: 500 });
  }
}
