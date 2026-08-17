import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { getMaintenanceState, setMaintenanceState } from "@/lib/security/maintenance";

export async function GET() {
  const state = getMaintenanceState();
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { enabled, message, estimatedEndTime } = body;

    const updated = setMaintenanceState(
      {
        enabled: typeof enabled === "boolean" ? enabled : undefined,
        message: message || undefined,
        estimatedEndTime: estimatedEndTime || undefined,
      },
      session.username
    );

    const res = NextResponse.json({
      success: true,
      message: `Maintenance mode ${updated.enabled ? "ACTIVATED" : "DEACTIVATED"}.`,
      state: updated,
    });

    // Set or clear the public edge maintenance cookie
    if (updated.enabled) {
      res.cookies.set("wf_maintenance_mode", "true", {
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        maxAge: 30 * 24 * 60 * 60,
      });
    } else {
      res.cookies.set("wf_maintenance_mode", "false", {
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        maxAge: 0,
      });
    }

    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
