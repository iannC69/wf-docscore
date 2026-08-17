import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminSession,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  isPanicLockdownActive,
} from "@/lib/security/auth";
import { checkRateLimit, registerFailedAttempt, resetRateLimit } from "@/lib/security/rateLimit";
import { recordAuditEvent } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";
  const rateLimitKey = `login:ip:${ip}`;

  // 1. Check Panic Mode
  if (isPanicLockdownActive()) {
    return NextResponse.json(
      { error: "SYSTEM_LOCKED", message: "Emergency Panic Lockdown este activ. Toate autentificările sunt suspendate." },
      { status: 403 }
    );
  }

  // 2. Check Rate Limits (Anti-Brute Force)
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: `Prea multe încercări eșuate. Accesul este blocat temporar pentru ${rateCheck.lockoutRemainingSeconds} secunde.`,
        lockoutRemainingSeconds: rateCheck.lockoutRemainingSeconds,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { username, password } = body;

    const authResult = verifyAdminCredentials(password || "", username || "");

    if (!authResult.valid || !authResult.member) {
      const failedResult = registerFailedAttempt(rateLimitKey);
      recordAuditEvent({
        action: "AUTH_LOGIN_FAILURE",
        actor: username || "anonymous",
        ip,
        userAgent,
        details: { reason: authResult.error || "Invalid credentials", remainingAttempts: failedResult.remainingAttempts },
      });

      return NextResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: authResult.error || "Nume de utilizator sau parolă incorectă.",
          remainingAttempts: failedResult.remainingAttempts,
        },
        { status: 401 }
      );
    }

    const member = authResult.member;

    // 3. Success: Create Session & Reset Rate Limit
    resetRateLimit(rateLimitKey);

    const { token, session } = createAdminSession({
      username: member.username,
      displayName: member.displayName,
      role: member.role,
      isRoot: member.isRoot,
      permissions: member.permissions,
      ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        username: member.username,
        displayName: member.displayName,
        role: member.role,
        isRoot: member.isRoot,
        permissions: member.permissions,
      },
      sessionId: session.sessionId,
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Eroare internă de server la autentificare." },
      { status: 500 }
    );
  }
}
