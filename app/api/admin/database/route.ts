import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import {
  getDatabaseStatus,
  getAllDocViews,
  getAllFeedbacks,
  deleteFeedback,
  updateDatabaseConfig,
  testSupabaseConnection,
} from "@/lib/db";
import { getLocalDatabaseConfig } from "@/lib/db/localStore";

export async function GET(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = await getDatabaseStatus();
    const views = await getAllDocViews();
    const feedbacks = await getAllFeedbacks();
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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("[API Admin Database POST] Error:", err);
    return NextResponse.json({ error: "Failed to execute database action" }, { status: 500 });
  }
}
