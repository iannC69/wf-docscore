import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminSession,
  getAdminUser,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  isPanicLockdown,
} from "@/lib/security/auth";
import { checkRateLimit, registerFailedAttempt, resetRateLimit } from "@/lib/security/rateLimit";
import { verifyTotpCode } from "@/lib/security/totp";
import { recordAuditEvent } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown";
  const rateLimitKey = `login:ip:${ip}`;

  // 1. Check Panic Mode
  if (isPanicLockdown()) {
    return NextResponse.json(
      { error: "SYSTEM_LOCKED", message: "Emergency Panic Lockdown is active. All administrative logins are suspended." },
      { status: 403 }
    );
  }

  // 2. Check Rate Limits (Anti-Brute Force)
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: `Too many failed attempts. Account access is locked for ${rateCheck.lockoutRemainingSeconds} seconds.`,
        lockoutRemainingSeconds: rateCheck.lockoutRemainingSeconds,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { username, password, totpCode } = body;

    const admin = getAdminUser();

    // 3. Timing-safe password check
    const isPasswordValid = verifyAdminCredentials(password || "");
    const isUsernameValid =
      username === admin.username ||
      username.toLowerCase() === "iannc" ||
      username.toLowerCase() === "iannc69" ||
      username.toLowerCase() === "admin";

    if (!isPasswordValid || !isUsernameValid) {
      const failedResult = registerFailedAttempt(rateLimitKey);
      recordAuditEvent({
        action: "AUTH_LOGIN_FAILURE",
        actor: username || "anonymous",
        ip,
        userAgent,
        details: { reason: "Invalid credentials", remainingAttempts: failedResult.remainingAttempts },
      });

      return NextResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Invalid administrator credentials.",
          remainingAttempts: failedResult.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 4. Check 2FA if enabled
    if (admin.twoFactorEnabled) {
      if (!totpCode) {
        return NextResponse.json(
          { requireTwoFactor: true, message: "Two-factor authentication code required." },
          { status: 200 }
        );
      }

      const isTotpValid =
        admin.twoFactorSecret && verifyTotpCode(admin.twoFactorSecret, totpCode);
      const isBackupCodeValid = admin.backupCodes?.includes(totpCode.trim().toUpperCase());

      if (!isTotpValid && !isBackupCodeValid) {
        registerFailedAttempt(rateLimitKey);
        recordAuditEvent({
          action: "AUTH_LOGIN_FAILURE",
          actor: username,
          ip,
          userAgent,
          details: { reason: "Invalid 2FA TOTP code" },
        });

        return NextResponse.json(
          { error: "INVALID_2FA", message: "Invalid 2FA authentication code or backup token." },
          { status: 401 }
        );
      }
    }

    // 5. Success: Create Session & Reset Rate Limit
    resetRateLimit(rateLimitKey);

    const { token, session } = createAdminSession({
      username: admin.username,
      role: admin.role,
      ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        username: admin.username,
        role: admin.role,
        twoFactorEnabled: admin.twoFactorEnabled,
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
      { error: "SERVER_ERROR", message: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
