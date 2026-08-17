import { NextRequest, NextResponse } from "next/server";
import {
  validateSessionToken,
  revokeSession,
  SESSION_COOKIE_NAME,
} from "@/lib/security/auth";
import { recordAuditEvent } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  if (token) {
    const session = validateSessionToken(token);
    if (session) {
      revokeSession(session.sessionId, session.username);
      recordAuditEvent({
        action: "AUTH_LOGOUT",
        actor: session.username,
        ip,
        details: { sessionId: session.sessionId },
      });
    }
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully." });

  // Delete HttpOnly cookie
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
