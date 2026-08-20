import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { getAiTelemetrySummary, clearAiTelemetry } from "@/lib/security/aiTelemetry";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const summary = getAiTelemetrySummary();
  return NextResponse.json(summary);
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Super admin root or users with canManageSettings permission can purge AI telemetry
  if (!session.isRoot && !session.permissions?.canManageSettings) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  clearAiTelemetry();
  return NextResponse.json({ success: true, message: "AI Telemetry purged successfully." });
}
