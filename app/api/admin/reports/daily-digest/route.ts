import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import { dispatchDailyTrafficDigest } from "@/lib/notifications/discordDigestWebhook";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session?.isRoot && !session?.permissions?.canManageWebhooks) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const res = await dispatchDailyTrafficDigest();
  if (!res.success) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }
  return NextResponse.json({
    success: true,
    message: "Raportul zilnic de trafic a fost transmis cu succes pe Discord (#logs).",
  });
}

export async function POST(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session?.isRoot && !session?.permissions?.canManageWebhooks) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const res = await dispatchDailyTrafficDigest();
  if (!res.success) {
    return NextResponse.json({ error: res.error }, { status: 500 });
  }
  return NextResponse.json({
    success: true,
    message: "Raportul zilnic de trafic a fost transmis cu succes pe Discord (#logs).",
  });
}
