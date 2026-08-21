import { NextResponse } from "next/server";
import { dispatchDailyTrafficDigest } from "@/lib/notifications/discordDigestWebhook";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await dispatchDailyTrafficDigest();
  if (!res.success) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }
  return NextResponse.json({
    success: true,
    message: "Raportul zilnic de trafic a fost transmis cu succes pe Discord (#logs).",
  });
}

export async function POST() {
  const res = await dispatchDailyTrafficDigest();
  if (!res.success) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }
  return NextResponse.json({
    success: true,
    message: "Raportul zilnic de trafic a fost transmis cu succes pe Discord (#logs).",
  });
}
