import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { DocViewRecord, DocFeedbackRecord, FeedbackStats } from "./types";

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const clientCache = new Map<string, SupabaseClient>();

function getClient(url: string, anonKey: string): SupabaseClient {
  const cacheKey = `${url}__${anonKey}`;
  let client = clientCache.get(cacheKey);
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    clientCache.set(cacheKey, client);
  }
  return client;
}

/**
 * Test connectivity with Supabase by performing a ping query
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  if (!url || !anonKey) {
    return { success: false, message: "URL-ul sau Cheia Anon sunt goale." };
  }

  const startTime = Date.now();
  try {
    const supabase = getClient(url, anonKey);
    const { error, status } = await supabase.from("doc_views").select("slug").limit(1);

    const latencyMs = Date.now() - startTime;

    if (!error || status === 200) {
      return {
        success: true,
        message: `Conexiune Supabase activă! (Latență: ${latencyMs}ms)`,
        latencyMs,
      };
    }

    if (error.code === "PGRST204" || error.code === "PGRST116" || error.message.includes("does not exist") || error.message.includes("not found")) {
      return {
        success: true,
        message: `Conexiune stabilită (${latencyMs}ms), dar tabelele lipsesc. Rulează scriptul SQL din butonul 'Copiază SQL' în Supabase.`,
        latencyMs,
      };
    }

    if (error.code === "401" || error.message.includes("JWT") || error.message.includes("apikey")) {
      return {
        success: false,
        message: "Eroare de autentificare: Cheia Anon / Publishable Key este invalidă.",
      };
    }

    return {
      success: true,
      message: `Conectat la Supabase (${latencyMs}ms)`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Eșec conectare Supabase: ${err.message || "Timeout rețea"}`,
    };
  }
}

// ─── Remote Supabase Operations ───────────────────────────────────────────────

export async function supabaseIncrementDocView(
  config: SupabaseConfig,
  slug: string
): Promise<DocViewRecord | null> {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  const now = new Date().toISOString();

  try {
    const supabase = getClient(config.url, config.anonKey);
    
    // 1. Fetch current views
    const { data, error } = await supabase
      .from("doc_views")
      .select("total_views, today_views")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.warn("[Supabase] Query doc_views error:", error.message);
    }

    if (data) {
      const updatedTotal = (data.total_views || 0) + 1;
      const updatedToday = (data.today_views || 0) + 1;

      const { error: updateErr } = await supabase
        .from("doc_views")
        .update({
          total_views: updatedTotal,
          today_views: updatedToday,
          last_viewed_at: now,
        })
        .eq("slug", normalizedSlug);

      if (!updateErr) {
        return {
          slug: normalizedSlug,
          total_views: updatedTotal,
          today_views: updatedToday,
          last_viewed_at: now,
        };
      }
    } else {
      const { error: insertErr } = await supabase.from("doc_views").insert({
        slug: normalizedSlug,
        total_views: 1,
        today_views: 1,
        last_viewed_at: now,
      });

      if (!insertErr) {
        return {
          slug: normalizedSlug,
          total_views: 1,
          today_views: 1,
          last_viewed_at: now,
        };
      }
    }
  } catch (err) {
    console.error("[Supabase] Error in incrementDocView", err);
  }

  return null;
}

export async function supabaseGetDocViews(
  config: SupabaseConfig,
  slug: string
): Promise<DocViewRecord | null> {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");

  try {
    const supabase = getClient(config.url, config.anonKey);
    const { data, error } = await supabase
      .from("doc_views")
      .select("*")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (!error && data) {
      return data as DocViewRecord;
    }
  } catch (err) {
    console.error("[Supabase] Error in getDocViews", err);
  }

  return null;
}

export async function supabaseGetAllDocViews(
  config: SupabaseConfig
): Promise<DocViewRecord[] | null> {
  try {
    const supabase = getClient(config.url, config.anonKey);
    const { data, error } = await supabase
      .from("doc_views")
      .select("*")
      .order("total_views", { ascending: false });

    if (!error && data) {
      return data as DocViewRecord[];
    }
  } catch (err) {
    console.error("[Supabase] Error in getAllDocViews", err);
  }

  return null;
}

export async function supabaseSubmitFeedback(
  config: SupabaseConfig,
  slug: string,
  rating: "helpful" | "unhelpful",
  comment?: string,
  feedbackId?: string
): Promise<DocFeedbackRecord | null> {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  const recordId = feedbackId || `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  try {
    const supabase = getClient(config.url, config.anonKey);
    const { error } = await supabase.from("doc_feedbacks").upsert({
      id: recordId,
      slug: normalizedSlug,
      rating,
      comment: comment ? comment.trim() : null,
      created_at: now,
    });

    if (!error) {
      return {
        id: recordId,
        slug: normalizedSlug,
        rating,
        comment: comment ? comment.trim() : undefined,
        created_at: now,
      };
    } else {
      console.warn("[Supabase] Error submitting feedback:", error.message);
    }
  } catch (err) {
    console.error("[Supabase] Error in submitFeedback", err);
  }

  return null;
}

export async function supabaseGetFeedbackStats(
  config: SupabaseConfig,
  slug: string
): Promise<FeedbackStats | null> {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");

  try {
    const supabase = getClient(config.url, config.anonKey);
    const { data, error } = await supabase
      .from("doc_feedbacks")
      .select("rating")
      .eq("slug", normalizedSlug);

    if (!error && data) {
      const helpful = data.filter((d: any) => d.rating === "helpful").length;
      const unhelpful = data.filter((d: any) => d.rating === "unhelpful").length;
      const total = helpful + unhelpful;
      const percentage = total > 0 ? Math.round((helpful / total) * 100) : 100;
      return { helpful, unhelpful, total, percentage };
    }
  } catch (err) {
    console.error("[Supabase] Error in getFeedbackStats", err);
  }

  return null;
}

export async function supabaseGetAllFeedbacks(
  config: SupabaseConfig
): Promise<DocFeedbackRecord[] | null> {
  try {
    const supabase = getClient(config.url, config.anonKey);
    const { data, error } = await supabase
      .from("doc_feedbacks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data as DocFeedbackRecord[];
    }
  } catch (err) {
    console.error("[Supabase] Error in getAllFeedbacks", err);
  }

  return null;
}

export async function supabaseDeleteFeedback(
  config: SupabaseConfig,
  id: string
): Promise<boolean> {
  try {
    const supabase = getClient(config.url, config.anonKey);
    const { error } = await supabase.from("doc_feedbacks").delete().eq("id", id);
    return !error;
  } catch (err) {
    console.error("[Supabase] Error in deleteFeedback", err);
  }

  return false;
}

// ─── Team Members DB Sync ───────────────────────────────────────────────────

export async function supabaseGetTeamMembers(
  config: SupabaseConfig
): Promise<any[] | null> {
  try {
    const supabase = getClient(config.url, config.anonKey);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      return data.map((row: any) => ({
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        email: row.email,
        role: row.role,
        customTitle: row.custom_title,
        avatarUrl: row.avatar_url,
        avatarColor: row.avatar_color,
        bio: row.bio,
        responsibilities: row.responsibilities || [],
        badges: row.badges || [],
        discord: row.discord,
        steamId: row.steam_id,
        docsModifiedCount: row.docs_modified_count || 0,
        passwordHash: row.password_hash,
        salt: row.salt,
        permissions: row.permissions || {},
        status: row.status || "active",
        isRoot: Boolean(row.is_root),
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at,
      }));
    }
  } catch (err) {
    console.error("[Supabase] Error in getTeamMembers", err);
  }
  return null;
}

export async function supabaseSaveTeamMember(
  config: SupabaseConfig,
  member: any
): Promise<boolean> {
  try {
    const supabase = getClient(config.url, config.anonKey);
    const row = {
      id: member.id,
      username: member.username,
      display_name: member.displayName,
      email: member.email || null,
      role: member.role,
      custom_title: member.customTitle || null,
      avatar_url: member.avatarUrl || null,
      avatar_color: member.avatarColor || "#ff6b00",
      bio: member.bio || null,
      responsibilities: member.responsibilities || [],
      badges: member.badges || [],
      discord: member.discord || null,
      steam_id: member.steamId || null,
      docs_modified_count: member.docsModifiedCount || 0,
      password_hash: member.passwordHash,
      salt: member.salt,
      permissions: member.permissions,
      status: member.status || "active",
      is_root: Boolean(member.isRoot),
      created_at: member.createdAt,
      last_login_at: member.lastLoginAt || null,
    };

    const { error } = await supabase.from("team_members").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("[Supabase] Failed to upsert team member:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] Error in saveTeamMember", err);
    return false;
  }
}

export async function supabaseDeleteTeamMember(
  config: SupabaseConfig,
  id: string
): Promise<boolean> {
  try {
    const supabase = getClient(config.url, config.anonKey);
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    return !error;
  } catch (err) {
    console.error("[Supabase] Error in deleteTeamMember", err);
    return false;
  }
}

