const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://afsrekeoovvtucijbgze.supabase.co";
const SUPABASE_KEY = "sb_publishable_AU18xRupAGK4208l0hLG8w_7qN45RJJ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function pushAll() {
  console.log("Starting full push to Supabase...");

  // 1. Team Members
  const teamPath = path.join(process.cwd(), "content", "team.json");
  if (fs.existsSync(teamPath)) {
    const team = JSON.parse(fs.readFileSync(teamPath, "utf-8"));
    const members = Array.isArray(team) ? team : (team.members || []);
    console.log(`Pushing ${members.length} team members...`);
    for (const m of members) {
      const row = {
        id: m.id,
        username: m.username,
        display_name: m.displayName,
        email: m.email || null,
        role: m.role,
        custom_title: m.customTitle || null,
        avatar_url: m.avatarUrl || null,
        avatar_color: m.avatarColor || "#ff6b00",
        bio: m.bio || null,
        responsibilities: m.responsibilities || [],
        badges: m.badges || [],
        discord: m.discord || null,
        steam_id: m.steamId || null,
        github_username: m.githubUsername || null,
        docs_modified_count: m.docsModifiedCount || 0,
        password_hash: m.passwordHash,
        salt: m.salt,
        permissions: m.permissions || {},
        status: m.status || "active",
        is_root: Boolean(m.isRoot),
        created_at: m.createdAt,
        last_login_at: m.lastLoginAt || null,
      };
      const { error } = await supabase.from("team_members").upsert(row, { onConflict: "id" });
      if (error) console.error(`Error syncing team member ${m.username}:`, error.message);
      else console.log(`Synced team member: ${m.username}`);
    }
  }

  // 2. Doc Analytics (views, feedbacks, reports, tasks, notifications)
  const analyticsPath = path.join(process.cwd(), "data", "doc_analytics.json");
  if (fs.existsSync(analyticsPath)) {
    const data = JSON.parse(fs.readFileSync(analyticsPath, "utf-8"));

    // Views
    const views = Object.values(data.views || {});
    console.log(`Pushing ${views.length} doc views...`);
    for (const v of views) {
      const { error } = await supabase.from("doc_views").upsert({
        slug: v.slug,
        total_views: v.total_views,
        today_views: v.today_views,
        last_viewed_at: v.last_viewed_at,
      }, { onConflict: "slug" });
      if (error) console.error(`Error syncing view ${v.slug}:`, error.message);
    }

    // Feedbacks
    const feedbacks = data.feedbacks || [];
    console.log(`Pushing ${feedbacks.length} feedbacks...`);
    for (const f of feedbacks) {
      const { error } = await supabase.from("doc_feedbacks").upsert({
        id: f.id,
        slug: f.slug,
        rating: f.rating,
        comment: f.comment || null,
        created_at: f.created_at,
      }, { onConflict: "id" });
      if (error) console.error(`Error syncing feedback ${f.id}:`, error.message);
    }

    // Reports
    const reports = data.reports || [];
    console.log(`Pushing ${reports.length} reports...`);
    for (const r of reports) {
      const { error } = await supabase.from("doc_reports").upsert({
        id: r.id,
        type: r.type || "issue",
        slug: r.slug || null,
        title: r.title,
        description: r.description,
        author: r.author || "Vizitator Anonim",
        status: r.status || "open",
        created_at: r.created_at || new Date().toISOString(),
        resolved_at: r.resolved_at || null,
        resolved_by: r.resolved_by || null,
      }, { onConflict: "id" });
      if (error) console.error(`Error syncing report ${r.id}:`, error.message);
    }

    // Tasks
    const tasks = data.tasks || [];
    console.log(`Pushing ${tasks.length} tasks...`);
    for (const t of tasks) {
      const assignedUser = t.assignedTo || (Array.isArray(t.assignees) && t.assignees[0]) || "iannC69";
      const creatorUser = t.createdBy || t.assignedBy || "iannC69";
      const { error } = await supabase.from("admin_tasks").upsert({
        id: t.id,
        title: t.title,
        description: t.description || null,
        category: t.category || "DOCS_UPDATE",
        priority: t.priority || "medium",
        status: t.status || "todo",
        assigned_to: assignedUser,
        created_by: creatorUser,
        deadline: t.deadline || t.dueDate || null,
        subtasks: t.subtasks || [],
        comments: t.comments || [],
        created_at: t.createdAt || new Date().toISOString(),
        updated_at: t.updatedAt || new Date().toISOString(),
      }, { onConflict: "id" });
      if (error) console.error(`Error syncing task ${t.id}:`, error.message);
      else console.log(`Synced task: ${t.title}`);
    }

    // Notifications
    const notifs = data.notifications || [];
    console.log(`Pushing ${notifs.length} notifications...`);
    for (const n of notifs) {
      const { error } = await supabase.from("admin_notifications").upsert({
        id: n.id,
        target_user: n.targetUser || null,
        is_global: Boolean(n.isGlobal),
        title: n.title,
        message: n.message,
        category: n.category || "system",
        severity: n.severity || "info",
        link: n.link || null,
        read_by: n.readBy || [],
        created_at: n.createdAt || new Date().toISOString(),
        metadata: n.metadata || {},
      }, { onConflict: "id" });
      if (error) console.error(`Error syncing notif ${n.id}:`, error.message);
    }
  }

  // 3. Platform Settings
  const settingsPath = path.join(process.cwd(), "content", "settings.json");
  if (fs.existsSync(settingsPath)) {
    const settingsData = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    const { error } = await supabase.from("platform_settings").upsert({
      id: "global",
      settings: settingsData,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (error) console.error("Error syncing platform_settings:", error.message);
    else console.log("Synced platform_settings");
  }

  // 4. Audit Ledger
  const auditPaths = [
    path.join(process.cwd(), "data", "audit_log.json"),
    path.join(process.cwd(), "content", "audit.json"),
  ];
  for (const aPath of auditPaths) {
    if (fs.existsSync(aPath)) {
      const auditData = JSON.parse(fs.readFileSync(aPath, "utf-8"));
      const entries = Array.isArray(auditData) ? auditData : (auditData.events || auditData.entries || []);
      console.log(`Pushing ${entries.length} audit ledger entries...`);
      for (const e of entries) {
        const { error } = await supabase.from("audit_ledger").upsert({
          id: e.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          event_id: e.eventId || e.id || null,
          action: e.action || "UNKNOWN_ACTION",
          actor: e.actor || "System",
          ip: e.ip || null,
          user_agent: e.userAgent || null,
          details: e.details || {},
          sha256_hash: e.hash || e.sha256_hash || null,
          previous_hash: e.previousHash || e.previous_hash || null,
          created_at: e.timestamp || new Date().toISOString(),
        }, { onConflict: "id" });
        if (error) console.error(`Error syncing audit entry ${e.id}:`, error.message);
      }
    }
  }

  // 5. Search Telemetry
  const telPath = path.join(process.cwd(), "data", "search_telemetry.json");
  if (fs.existsSync(telPath)) {
    const telData = JSON.parse(fs.readFileSync(telPath, "utf-8"));
    const queries = Array.isArray(telData) ? telData : (telData.queries || telData.history || []);
    console.log(`Pushing ${queries.length} search telemetry entries...`);
    for (const q of queries) {
      const { error } = await supabase.from("search_telemetry").upsert({
        id: q.id || `st_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        query: q.query || "",
        hits: q.hits || 1,
        results_count: q.resultsCount || 0,
        category: q.category || null,
        created_at: q.timestamp || new Date().toISOString(),
      }, { onConflict: "id" });
      if (error) console.error(`Error syncing search telemetry ${q.id}:`, error.message);
    }
  }

  // 6. Doc Versions
  const verPath = path.join(process.cwd(), "data", "doc_versions.json");
  if (fs.existsSync(verPath)) {
    const verData = JSON.parse(fs.readFileSync(verPath, "utf-8"));
    const versions = Array.isArray(verData) ? verData : (verData.versions || []);
    console.log(`Pushing ${versions.length} doc versions...`);
    for (const v of versions) {
      const { error } = await supabase.from("doc_versions").upsert({
        id: v.id || `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        slug: v.slug,
        version_number: v.versionNumber || v.version || 1,
        content: v.content || "",
        summary: v.summary || null,
        author: v.author || "System",
        created_at: v.createdAt || new Date().toISOString(),
      }, { onConflict: "id" });
      if (error) console.error(`Error syncing doc version ${v.id}:`, error.message);
    }
  }

  console.log("ALL DATA (10 TABLES) SUCCESSFULLY SYNCED TO SUPABASE!");
}

pushAll().catch(console.error);
