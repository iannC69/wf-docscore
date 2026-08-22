import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { getAuditEvents, verifyAuditChainIntegrity, AuditAction } from "@/lib/security/audit";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canViewAudit) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Acces Refuzat: Nu ai permisiunea canViewAudit pentru a accesa Audit Ledger." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const actionFilter = searchParams.get("action") as AuditAction | undefined;

  const events = getAuditEvents(limit, actionFilter);
  const integrity = verifyAuditChainIntegrity();

  return NextResponse.json({
    integrity,
    total: events.length,
    events,
  });
}
