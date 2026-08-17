import { NextRequest, NextResponse } from "next/server";
import {
  validateSessionToken,
  getAdminUser,
  updateAdminUser,
  SESSION_COOKIE_NAME,
} from "@/lib/security/auth";
import { generateTotpSecret, verifyTotpCode, getTotpUri } from "@/lib/security/totp";
import { recordAuditEvent } from "@/lib/security/audit";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const admin = getAdminUser();

  if (admin.twoFactorEnabled) {
    return NextResponse.json({
      enabled: true,
      backupCodes: admin.backupCodes,
    });
  }

  // Generate new provisional secret
  const secret = generateTotpSecret();
  const uri = getTotpUri(secret, admin.username, "Wildfire Docs");

  return NextResponse.json({
    enabled: false,
    secret,
    uri,
    backupCodes: admin.backupCodes,
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { action, secret, code } = await req.json();

    if (action === "enable") {
      if (!secret || !code) {
        return NextResponse.json({ error: "Secret and verification code required." }, { status: 400 });
      }

      const isValid = verifyTotpCode(secret, code);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid verification code. Please try again." }, { status: 400 });
      }

      updateAdminUser({
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      });

      recordAuditEvent({
        action: "AUTH_2FA_ENABLED",
        actor: session.username,
        ip,
        details: { method: "TOTP" },
      });

      return NextResponse.json({ success: true, message: "Two-Factor Authentication activated successfully." });
    }

    if (action === "disable") {
      updateAdminUser({
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
      });

      recordAuditEvent({
        action: "AUTH_2FA_DISABLED",
        actor: session.username,
        ip,
      });

      return NextResponse.json({ success: true, message: "Two-Factor Authentication disabled." });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
