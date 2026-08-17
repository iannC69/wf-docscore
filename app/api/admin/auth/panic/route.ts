import { NextRequest, NextResponse } from "next/server";
import {
  validateSessionToken,
  triggerPanicLockdown,
  releasePanicLockdown,
  isPanicLockdown,
  verifyAdminCredentials,
  SESSION_COOKIE_NAME,
} from "@/lib/security/auth";

export async function GET() {
  return NextResponse.json({ isLocked: isPanicLockdown() });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const { action, masterPassword } = await req.json();

  if (action === "trigger") {
    // Requires an active admin session OR master password verification
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? validateSessionToken(token) : null;
    const isPwValid = masterPassword ? verifyAdminCredentials(masterPassword) : false;

    if (!session && !isPwValid) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    triggerPanicLockdown(session?.username || "emergency_override", ip);

    const response = NextResponse.json({
      success: true,
      message: "EMERGENCY PANIC LOCKDOWN TRIGGERED. All sessions invalidated.",
      isLocked: true,
    });

    // Clear session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  }

  if (action === "release") {
    // Releasing lockdown REQUIRES the master password
    if (!masterPassword || !verifyAdminCredentials(masterPassword)) {
      return NextResponse.json({ error: "Master password verification failed." }, { status: 401 });
    }

    releasePanicLockdown("master_override", ip);

    return NextResponse.json({
      success: true,
      message: "Panic lockdown released. Administrative login is now available.",
      isLocked: false,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
