import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import {
  localGetNotifications,
  localCreateNotification,
  localMarkNotificationRead,
  localMarkAllNotificationsRead,
  localDeleteNotification,
  localClearOldNotifications,
} from "@/lib/db";
import type { NotificationCategory, NotificationSeverity } from "@/types/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notifications
 * Retrieves notifications visible to the authenticated admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = (searchParams.get("scope") as "all" | "personal" | "global" | "unread") || "all";
    const category = (searchParams.get("category") as NotificationCategory | "all") || "all";
    const severity = (searchParams.get("severity") as NotificationSeverity | "all") || "all";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = localGetNotifications(session.username, {
      scope,
      category,
      severity,
      limit,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[Notifications API] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

/**
 * POST /api/admin/notifications
 * Creates a new notification (broadcast or targeted)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, category, severity, targetUser, isGlobal, link, metadata } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const created = localCreateNotification({
      title,
      message,
      category: category || "system",
      severity: severity || "info",
      targetUser: targetUser || undefined,
      isGlobal: isGlobal ?? (!targetUser),
      link: link || undefined,
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true, notification: created }, { status: 201 });
  } catch (err: any) {
    console.error("[Notifications API] POST error:", err);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/notifications
 * Marks notification(s) as read
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthenticatedAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, id } = body;

    if (action === "read_all") {
      const count = localMarkAllNotificationsRead(session.username);
      return NextResponse.json({ success: true, markedCount: count });
    }

    if (action === "read" && id) {
      const success = localMarkNotificationRead(id, session.username);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });
  } catch (err: any) {
    console.error("[Notifications API] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/notifications
 * Deletes notification(s)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthenticatedAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearDays = searchParams.get("clearDays");

    if (clearDays) {
      const days = parseInt(clearDays, 10) || 30;
      const count = localClearOldNotifications(days);
      return NextResponse.json({ success: true, clearedCount: count });
    }

    if (id) {
      const success = localDeleteNotification(id);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
  } catch (err: any) {
    console.error("[Notifications API] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
