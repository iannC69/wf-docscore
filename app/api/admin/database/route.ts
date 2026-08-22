import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import {
  getDatabaseStatus,
  getAllDocViews,
  getAllFeedbacks,
  deleteFeedback,
  getAllDocReports,
  updateDocReportStatus,
  deleteDocReport,
  updateDatabaseConfig,
  testSupabaseConnection,
} from "@/lib/db";
import { getLocalDatabaseConfig } from "@/lib/db/localStore";

export async function GET(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageDb) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Acces Refuzat: Nu ai permisiunea canManageDb pentru a vizualiza datele bazei de date." },
      { status: 403 }
    );
  }

  try {
    const status = await getDatabaseStatus();
    const views = await getAllDocViews();
    const feedbacks = await getAllFeedbacks();
    const reports = await getAllDocReports();
    const config = getLocalDatabaseConfig();

    return NextResponse.json({
      status,
      config: {
        provider: config.provider,
        supabaseUrl: config.supabaseUrl || "",
        supabaseAnonKey: config.supabaseAnonKey ? "••••••••••••••••" : "",
        hasKey: Boolean(config.supabaseAnonKey),
      },
      views,
      feedbacks,
      reports,
    });
  } catch (err: any) {
    console.error("[API Admin Database GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch database information" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageDb) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Acces Refuzat: Nu ai permisiunea canManageDb pentru a modifica configurările bazei de date." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Test Supabase Connection
    if (action === "test_connection") {
      const { url, anonKey } = body;
      const result = await testSupabaseConnection(url, anonKey);
      return NextResponse.json(result);
    }

    // 2. Save Database Config
    if (action === "save_config") {
      const { provider, supabaseUrl, supabaseAnonKey } = body;
      
      const current = getLocalDatabaseConfig();
      const newKey = supabaseAnonKey === "••••••••••••••••" || !supabaseAnonKey 
        ? current.supabaseAnonKey 
        : supabaseAnonKey;

      const updated = updateDatabaseConfig({
        provider: provider || "local",
        supabaseUrl: supabaseUrl || "",
        supabaseAnonKey: newKey || "",
      });

      const status = await getDatabaseStatus();
      return NextResponse.json({ success: true, updated, status });
    }

    // 3. Delete Feedback
    if (action === "delete_feedback") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
      }

      const deleted = await deleteFeedback(id);
      return NextResponse.json({ success: deleted });
    }

    // 4. Update Report Status
    if (action === "update_report_status") {
      const { id, status: reportStatus } = body;
      if (!id || !reportStatus) {
        return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
      }

      const updated = await updateDocReportStatus(id, reportStatus, session.username || "Admin");
      return NextResponse.json({ success: Boolean(updated), report: updated });
    }

    // 5. Delete Report
    if (action === "delete_report") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
      }

      const deleted = await deleteDocReport(id);
      return NextResponse.json({ success: deleted });
    }

    // 6. Full Sync All Local Data to Supabase Tables
    if (action === "sync_all_to_supabase") {
      const { syncAllLocalDataToSupabase } = await import("@/lib/db/localStore");
      const counts = await syncAllLocalDataToSupabase();
      return NextResponse.json({ success: true, counts });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("[API Admin Database POST] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to execute database action" }, { status: 500 });
  }
}


