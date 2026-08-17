import { NextRequest, NextResponse } from "next/server";
import {
  validateSessionToken,
  getActiveSessions,
  revokeSession,
  SESSION_COOKIE_NAME,
} from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const sessions = getActiveSessions();
  return NextResponse.json({
    currentSessionId: session.sessionId,
    total: sessions.length,
    sessions,
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const success = revokeSession(sessionId, session.username);
  return NextResponse.json({ success, message: "Session revoked successfully." });
}
