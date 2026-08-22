import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { runDocHealthCheck } from "@/lib/admin/docHealth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageHealth && !session.permissions?.canEditDocs) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const report = runDocHealthCheck();
  return NextResponse.json(report);
}
