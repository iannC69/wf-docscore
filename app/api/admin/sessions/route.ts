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

  const isActorRoot =
    session.isRoot ||
    session.username.toLowerCase() === "iannc69" ||
    session.username.toLowerCase() === "iannc";

  const allSessions = getActiveSessions();
  const visibleSessions =
    isActorRoot || session.permissions?.canManageSecurity
      ? allSessions
      : allSessions.filter((s) => s.sessionId === session.sessionId);

  return NextResponse.json({
    currentSessionId: session.sessionId,
    currentUser: {
      username: session.username,
      displayName: session.displayName,
      role: session.role,
      isRoot: session.isRoot,
      permissions: session.permissions,
    },
    total: visibleSessions.length,
    sessions: visibleSessions,
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

  const sessions = getActiveSessions();
  const targetSession = sessions.find((s) => s.sessionId === sessionId);

  if (targetSession) {
    const isTargetRoot =
      targetSession.isRoot ||
      targetSession.username.toLowerCase() === "iannc69" ||
      targetSession.username.toLowerCase() === "iannc";

    const isActorRoot =
      session.isRoot ||
      session.username.toLowerCase() === "iannc69" ||
      session.username.toLowerCase() === "iannc";

    // STRICT RULE: Non-root admins CANNOT revoke a Root admin's session
    if (isTargetRoot && !isActorRoot) {
      return NextResponse.json(
        {
          error: "FORBIDDEN",
          message: "Securitate Refuzată: Nu ai permisiunea de a revoca sesiunea Super Administratorului Root (iannC69)!",
        },
        { status: 403 }
      );
    }

    // Non-root members can only revoke their own session unless they have canManageSecurity
    if (!isActorRoot && !session.permissions?.canManageSecurity && targetSession.sessionId !== session.sessionId) {
      return NextResponse.json(
        {
          error: "FORBIDDEN",
          message: "Nu ai permisiunea 'canManageSecurity' pentru a revoca sesiunile altor administratori!",
        },
        { status: 403 }
      );
    }
  }

  const success = revokeSession(sessionId, session.username);
  return NextResponse.json({ success, message: "Sesiune revocată cu succes." });
}
