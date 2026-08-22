import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "@/lib/security/settingsStore";
import { recordAuditEvent } from "@/lib/security/audit";
import { dispatchRestorationAlerts } from "@/lib/notifications/email";

const NOTIFICATIONS_FILE = path.join(process.cwd(), "content", "maintenance-subscribers.json");

function getSubscribers() {
  if (fs.existsSync(NOTIFICATIONS_FILE)) {
    try {
      const raw = fs.readFileSync(NOTIFICATIONS_FILE, "utf-8");
      return JSON.parse(raw);
    } catch {}
  }
  return [];
}

export async function GET() {
  const settings = getPlatformSettings();
  const subscribers = getSubscribers();
  return NextResponse.json({ ...settings, subscribersCount: subscribers.length, subscribers });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageSettings) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Acces Refuzat: Nu ai permisiunea canManageSettings pentru a modifica setările platformei." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { maintenance, announcement } = body;
    const previous = getPlatformSettings();

    const updated = updatePlatformSettings(
      {
        maintenance: maintenance || undefined,
        announcement: announcement || undefined,
      },
      session.username
    );

    // If maintenance was turned OFF from ON, dispatch notification audit & emails
    if (previous.maintenance.enabled && !updated.maintenance.enabled) {
      const subscribers = getSubscribers();
      dispatchRestorationAlerts(subscribers).catch((err) =>
        console.error("Restoration alert dispatch error:", err)
      );

      recordAuditEvent({
        action: "MAINTENANCE_TOGGLED",
        actor: session.username,
        details: {
          event: "PLATFORM_RESTORED",
          dispatchedToSubscribers: subscribers.length,
          subscribers: subscribers.map((s: any) => s.email),
        },
      });
    }

    const res = NextResponse.json({
      success: true,
      message: "Platform settings saved successfully.",
      settings: updated,
    });

    if (updated.maintenance.enabled) {
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
  } catch (err) {
    console.error("Settings save error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
