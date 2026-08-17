import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { recordAuditEvent } from "@/lib/security/audit";

const NOTIFICATIONS_FILE = path.join(process.cwd(), "content", "maintenance-subscribers.json");

export async function GET() {
  let subscribers: { email: string; createdAt: string }[] = [];
  if (fs.existsSync(NOTIFICATIONS_FILE)) {
    try {
      const raw = fs.readFileSync(NOTIFICATIONS_FILE, "utf-8");
      subscribers = JSON.parse(raw);
    } catch {}
  }
  return NextResponse.json({ total: subscribers.length, subscribers });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    let subscribers: { email: string; createdAt: string }[] = [];
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      try {
        const raw = fs.readFileSync(NOTIFICATIONS_FILE, "utf-8");
        subscribers = JSON.parse(raw);
      } catch {}
    }

    const cleanEmail = email.trim().toLowerCase();

    // Deduplicate
    if (!subscribers.some((s) => s.email.toLowerCase() === cleanEmail)) {
      subscribers.push({
        email: cleanEmail,
        createdAt: new Date().toISOString(),
      });
      const dir = path.dirname(NOTIFICATIONS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(subscribers, null, 2), "utf-8");

      // Record in cryptographic audit ledger
      recordAuditEvent({
        action: "MAINTENANCE_TOGGLED",
        actor: cleanEmail,
        details: { type: "MAINTENANCE_SUBSCRIBE", totalSubscribers: subscribers.length },
      });
    }

    return NextResponse.json({
      success: true,
      message: "You will receive an instant notification when Wildfire Docs is restored!",
      totalSubscribers: subscribers.length,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
