"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Database,
  Eye,
  MessageSquare,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Search,
  Save,
  Activity,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Clock,
  Quote,
  Layers,
  Award,
  Server,
  FileText,
  Filter,
  AlertTriangle,
  FilePlus,
  ShieldAlert,
  HelpCircle,
  Zap,
} from "lucide-react";
import type { DocViewRecord, DocFeedbackRecord, DocReportRecord, DatabaseStatus } from "@/lib/db/types";

export default function AdminDatabasePage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [views, setViews] = useState<DocViewRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<DocFeedbackRecord[]>([]);
  const [reports, setReports] = useState<DocReportRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [viewSearch, setViewSearch] = useState<string>("");
  const [viewFilter, setViewFilter] = useState<"all" | "top5" | "recent">("all");
  const [feedbackSearch, setFeedbackSearch] = useState<string>("");
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "helpful" | "unhelpful" | "with_comments">("all");
  const [reportSearch, setReportSearch] = useState<string>("");
  const [reportFilter, setReportFilter] = useState<"all" | "issues" | "requests" | "open" | "resolved">("all");

  // Tab State
  const [activeTab, setActiveTab] = useState<"views" | "feedbacks" | "reports" | "config">("views");

  const [dbProvider, setDbProvider] = useState<"local" | "supabase">("local");
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>("");
  const [testingDb, setTestingDb] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/database");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setViews(data.views || []);
        setFeedbacks(data.feedbacks || []);
        setReports(data.reports || []);
        if (data.config) {
          setDbProvider(data.config.provider || "local");
          setSupabaseUrl(data.config.supabaseUrl || "");
          setSupabaseAnonKey(data.config.supabaseAnonKey || "");
        }
      }
    } catch (err) {
      console.error("[Admin Database] Failed to load data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered views list
  const filteredViews = useMemo(() => {
    let result = [...views];

    if (viewFilter === "top5") {
      result = result.sort((a, b) => b.total_views - a.total_views).slice(0, 5);
    } else if (viewFilter === "recent") {
      result = result.sort((a, b) => new Date(b.last_viewed_at).getTime() - new Date(a.last_viewed_at).getTime());
    } else {
      result = result.sort((a, b) => b.total_views - a.total_views);
    }

    if (viewSearch.trim()) {
      const query = viewSearch.toLowerCase();
      result = result.filter((v) => v.slug.toLowerCase().includes(query));
    }

    return result;
  }, [views, viewSearch, viewFilter]);

  // Filtered feedbacks list
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      if (feedbackFilter === "helpful" && fb.rating !== "helpful") return false;
      if (feedbackFilter === "unhelpful" && fb.rating !== "unhelpful") return false;
      if (feedbackFilter === "with_comments" && (!fb.comment || !fb.comment.trim())) return false;

      if (feedbackSearch.trim()) {
        const q = feedbackSearch.toLowerCase();
        const matchSlug = fb.slug.toLowerCase().includes(q);
        const matchComment = fb.comment?.toLowerCase().includes(q);
        return matchSlug || matchComment;
      }
      return true;
    });
  }, [feedbacks, feedbackFilter, feedbackSearch]);

  // Filtered reports list
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      if (reportFilter === "issues" && rep.type !== "issue") return false;
      if (reportFilter === "requests" && rep.type !== "new_guide_request") return false;
      if (reportFilter === "open" && rep.status === "resolved") return false;
      if (reportFilter === "resolved" && rep.status !== "resolved") return false;

      if (reportSearch.trim()) {
        const q = reportSearch.toLowerCase();
        const matchSlug = rep.slug?.toLowerCase().includes(q);
        const matchDesc = rep.description?.toLowerCase().includes(q);
        const matchTitle = rep.title?.toLowerCase().includes(q);
        const matchDiscord = rep.contactDiscord?.toLowerCase().includes(q);
        return matchSlug || matchDesc || matchTitle || matchDiscord;
      }
      return true;
    });
  }, [reports, reportFilter, reportSearch]);

  // Positive feedback calculations
  const helpfulCount = feedbacks.filter((f) => f.rating === "helpful").length;
  const unhelpfulCount = feedbacks.length - helpfulCount;
  const commentsCount = feedbacks.filter((f) => f.comment && f.comment.trim()).length;
  const helpfulPct = feedbacks.length > 0 ? Math.round((helpfulCount / feedbacks.length) * 100) : 100;

  const openReportsCount = reports.filter((r) => r.status === "open" || r.status === "in_progress").length;
  const newGuidesRequestsCount = reports.filter((r) => r.type === "new_guide_request").length;

  const handleUpdateReportStatus = async (id: string, newStatus: "open" | "in_progress" | "resolved") => {
    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_report_status", id, status: newStatus }),
      });

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error("Failed to update report status", err);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_report", id }),
      });

      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete report", err);
    }
  };


  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setTestResult({ success: false, message: "Te rugăm să introduci Supabase URL și Cheia Anon." });
      return;
    }

    setTestingDb(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_connection",
          url: supabaseUrl,
          anonKey: supabaseAnonKey,
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, message: `Eroare rețea: ${err.message}` });
    } finally {
      setTestingDb(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_config",
          provider: dbProvider,
          supabaseUrl,
          supabaseAnonKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setActionMessage({
          type: "success",
          text: `Configurația bazei a fost salvată cu succes! (${dbProvider === "supabase" ? "Supabase Cloud" : "Local Engine"})`,
        });
      }
    } catch {
      setActionMessage({ type: "error", text: "Eșec la salvarea configurației." });
    } finally {
      setSavingConfig(false);
    }
  };

  const [syncingAll, setSyncingAll] = useState<boolean>(false);

  const handleSyncAllToSupabase = async () => {
    setSyncingAll(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_all_to_supabase" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const c = data.counts || {};
        setActionMessage({
          type: "success",
          text: `Sincronizare completă reușită! ${c.viewsCount || 0} vizualizări, ${c.feedbacksCount || 0} feedback-uri, ${c.reportsCount || 0} rapoarte, ${c.tasksCount || 0} sarcini, ${c.notificationsCount || 0} notificări și ${c.teamCount || 0} membri au fost scriși direct în Supabase.`,
        });
        loadData(true);
      } else {
        setActionMessage({
          type: "error",
          text: data.error || "Eroare la sincronizarea în Supabase. Asigură-te că ai rulat Schema SQL în Supabase!",
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: `Eroare de rețea: ${err.message}`,
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_feedback", id }),
      });

      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete feedback", err);
    }
  };



  const copySqlScript = () => {
    const sql = `-- ══════════════════════════════════════════════════════════════════
-- WILDFIRE DOCS ENGINE — COMPLETE SUPABASE POSTGRESQL SCHEMA (10 TABLES)
-- ══════════════════════════════════════════════════════════════════

-- 1. Tabel Vizualizări Ghiduri (Page Views & Traffic)
create table if not exists doc_views (
  slug text primary key,
  total_views integer default 0,
  today_views integer default 0,
  last_viewed_at timestamp with time zone default now()
);

-- 2. Tabel Feedback Jucători (Ratings & Comments)
create table if not exists doc_feedbacks (
  id text primary key,
  slug text not null,
  rating text not null,
  comment text,
  created_at timestamp with time zone default now()
);

-- 3. Tabel Rapoarte Erori & Cereri Ghiduri (Player Reports)
create table if not exists doc_reports (
  id text primary key,
  type text not null default 'issue', -- 'issue' | 'new_guide_request'
  slug text,
  title text not null,
  description text not null,
  author text not null default 'Vizitator Anonim',
  status text not null default 'open', -- 'open' | 'in_progress' | 'resolved' | 'dismissed'
  created_at timestamp with time zone default now(),
  resolved_at timestamp with time zone,
  resolved_by text
);

-- 4. Tabel Sarcini & TODO Kanban (Admin Tasks)
create table if not exists admin_tasks (
  id text primary key,
  title text not null,
  description text,
  category text not null default 'DOCS_UPDATE',
  priority text not null default 'medium', -- 'low' | 'medium' | 'high' | 'urgent'
  status text not null default 'todo', -- 'todo' | 'in_progress' | 'review' | 'done' | 'completed'
  assigned_to text not null,
  created_by text not null,
  deadline timestamp with time zone,
  subtasks jsonb default '[]'::jsonb,
  comments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. Tabel Notificări & Alerte Administrative (Notification Hub)
create table if not exists admin_notifications (
  id text primary key,
  target_user text,
  is_global boolean default false,
  title text not null,
  message text not null,
  category text not null default 'system', -- 'task' | 'report' | 'feedback' | 'security' | 'system' | 'ai' | 'health'
  severity text not null default 'info', -- 'info' | 'success' | 'warning' | 'urgent'
  link text,
  read_by jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  metadata jsonb default '{}'::jsonb
);

-- 6. Tabel Membri Echipă & Permisiuni (Staff & Team Matrix)
create table if not exists team_members (
  id text primary key,
  username text not null unique,
  display_name text not null,
  email text,
  role text not null default 'content_editor',
  custom_title text,
  avatar_url text,
  avatar_color text,
  bio text,
  responsibilities jsonb default '[]'::jsonb,
  badges jsonb default '[]'::jsonb,
  discord text,
  steam_id text,
  github_username text,
  docs_modified_count integer default 0,
  password_hash text not null,
  salt text not null,
  permissions jsonb not null,
  status text not null default 'active',
  is_root boolean not null default false,
  created_at timestamp with time zone default now(),
  last_login_at timestamp with time zone
);

-- 7. Tabel Setări Platformă (Global Settings)
create table if not exists platform_settings (
  id text primary key default 'global',
  settings jsonb not null,
  updated_at timestamp with time zone default now()
);

-- 8. Tabel Registru de Audit (Audit Ledger SHA-256)
create table if not exists audit_ledger (
  id text primary key,
  event_id text,
  action text not null,
  actor text not null default 'System',
  ip text,
  user_agent text,
  details jsonb default '{}'::jsonb,
  sha256_hash text,
  previous_hash text,
  created_at timestamp with time zone default now()
);

-- 9. Tabel Telemetrie Căutare (Search Telemetry)
create table if not exists search_telemetry (
  id text primary key,
  query text not null,
  hits integer default 1,
  results_count integer default 0,
  category text,
  created_at timestamp with time zone default now()
);

-- 10. Tabel Revizii Articole (Doc Versions & Rollbacks)
create table if not exists doc_versions (
  id text primary key,
  slug text not null,
  version_number integer default 1,
  content text not null,
  summary text,
  author text default 'System',
  created_at timestamp with time zone default now()
);

-- ── Indexuri Performanță ──────────────────────────────────────────
create index if not exists idx_doc_views_total on doc_views(total_views desc);
create index if not exists idx_admin_tasks_status on admin_tasks(status);
create index if not exists idx_team_members_username on team_members(username);
create index if not exists idx_audit_ledger_created on audit_ledger(created_at desc);
create index if not exists idx_search_telemetry_query on search_telemetry(query);
create index if not exists idx_doc_versions_slug on doc_versions(slug);

-- ── Securitate & Politici Row Level Security (RLS) ───────────────
alter table doc_views enable row level security;
alter table doc_feedbacks enable row level security;
alter table doc_reports enable row level security;
alter table admin_tasks enable row level security;
alter table admin_notifications enable row level security;
alter table team_members enable row level security;
alter table platform_settings enable row level security;
alter table audit_ledger enable row level security;
alter table search_telemetry enable row level security;
alter table doc_versions enable row level security;

-- Curățare politici existente
drop policy if exists "Allow public read on doc_views" on doc_views;
drop policy if exists "Allow public insert/update on doc_views" on doc_views;
drop policy if exists "Allow public read on doc_feedbacks" on doc_feedbacks;
drop policy if exists "Allow public insert on doc_feedbacks" on doc_feedbacks;
drop policy if exists "Allow public read on doc_reports" on doc_reports;
drop policy if exists "Allow public insert on doc_reports" on doc_reports;
drop policy if exists "Allow all on admin_tasks" on admin_tasks;
drop policy if exists "Allow all on admin_notifications" on admin_notifications;
drop policy if exists "Allow read on team_members" on team_members;
drop policy if exists "Allow all on team_members" on team_members;
drop policy if exists "Allow all on platform_settings" on platform_settings;
drop policy if exists "Allow all on audit_ledger" on audit_ledger;
drop policy if exists "Allow all on search_telemetry" on search_telemetry;
drop policy if exists "Allow all on doc_versions" on doc_versions;

-- Politici de acces public & admin
create policy "Allow public read on doc_views" on doc_views for select using (true);
create policy "Allow public insert/update on doc_views" on doc_views for all using (true);

create policy "Allow public read on doc_feedbacks" on doc_feedbacks for select using (true);
create policy "Allow public insert on doc_feedbacks" on doc_feedbacks for insert with check (true);

create policy "Allow public read on doc_reports" on doc_reports for select using (true);
create policy "Allow public insert on doc_reports" on doc_reports for insert with check (true);

create policy "Allow all on admin_tasks" on admin_tasks for all using (true);
create policy "Allow all on admin_notifications" on admin_notifications for all using (true);

create policy "Allow read on team_members" on team_members for select using (true);
create policy "Allow all on team_members" on team_members for all using (true);

create policy "Allow all on platform_settings" on platform_settings for all using (true);
create policy "Allow all on audit_ledger" on audit_ledger for all using (true);
create policy "Allow all on search_telemetry" on search_telemetry for all using (true);
create policy "Allow all on doc_versions" on doc_versions for all using (true);`;


    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };


  return (
    <div className="admin-page-container">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-pretitle-tag">
            <Database size={11} className="text-cyan-400" />
            <span>DATABASE &amp; TELEMETRY HUB</span>
          </div>
          <h1 className="admin-page-title">Bază de Date &amp; Telemetrie Docs</h1>
          <p className="admin-page-desc">
            Monitorizare în timp real a traficului pe ghiduri, feedback-ul comunității și sincronizarea Supabase PostgreSQL.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={handleSyncAllToSupabase}
            disabled={syncingAll}
            className="admin-btn admin-btn--primary"
            title="Sincronizează toate datele locale (vizualizări, feedback, rapoarte, sarcini, notificări, echipă) direct în tabelele Supabase"
          >
            <Zap size={13} className={syncingAll ? "admin-spin" : ""} />
            <span>{syncingAll ? "Se sincronizează în Supabase..." : "Auto-Sync în Supabase"}</span>
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="admin-btn admin-btn--secondary"
            title="Reîncarcă datele din baza de date"
          >
            <RefreshCw size={13} className={refreshing ? "admin-spin" : ""} />
            <span>{refreshing ? "Se actualizează..." : "Sincronizează Live"}</span>
          </button>

          <button
            type="button"
            onClick={copySqlScript}
            className="admin-btn admin-btn--secondary"
            title="Copiază scriptul SQL pentru Supabase"
          >
            {copiedSql ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedSql ? "SQL Copiat!" : "Copiază Schema SQL"}</span>
          </button>
        </div>

      </div>

      {actionMessage && (
        <div
          className={`admin-alert-box ${
            actionMessage.type === "success"
              ? "admin-alert-box--success"
              : "admin-alert-box--danger"
          }`}
        >
          {actionMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* ── 4-Metric KPI Grid ───────────────────────────────────────── */}
      <div className="admin-db-kpi-grid">
        {/* Metric 1: Views */}
        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Total Vizualizări Pagini</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--cyan">
              <Eye size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--cyan">
              {(status?.totalViews || 0).toLocaleString()}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--cyan">
              <TrendingUp size={10} /> Live
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">Accesări unice înregistrate în documentație</p>
        </div>

        {/* Metric 2: Feedbacks */}
        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Feedback Comunitate</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--amber">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--amber">
              {(status?.totalFeedbacks || 0).toLocaleString()}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--amber">
              {helpfulPct}% util
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">{helpfulCount} voturi pozitive din {feedbacks.length}</p>
        </div>

        {/* Metric 3: Tracked Docs */}
        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Documente Urmărite</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--purple">
              <FileText size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--purple">
              {(status?.totalTrackedDocs || 0).toLocaleString()}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--purple">
              Tracking
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">Ghiduri active cu tracking live de date</p>
        </div>

        {/* Metric 4: Supabase Engine Status */}
        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Status Motor Bază de Date</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--emerald">
              <Database size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--emerald text-lg">
              {status?.activeProvider === "supabase"
                ? status?.isConnected ? "Supabase Cloud" : "Deconectat"
                : "Local Engine"}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {status?.isConnected ? "200 OK" : "Offline"}
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">
            {status?.activeProvider === "supabase"
              ? "PostgreSQL Cloud • Sincronizare Activă"
              : "Persistent Zero-Config Engine"}
          </p>
        </div>
      </div>

      {/* ── Main Navigation Tabs ────────────────────────────────────── */}
      <div className="admin-db-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab("views")}
          className={`admin-db-tab-btn ${
            activeTab === "views" ? "admin-db-tab-btn--active-cyan" : ""
          }`}
        >
          <Eye size={14} />
          <span>Top Vizualizări Pagini</span>
          <span className="admin-db-tab-badge">{views.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("feedbacks")}
          className={`admin-db-tab-btn ${
            activeTab === "feedbacks" ? "admin-db-tab-btn--active-amber" : ""
          }`}
        >
          <MessageSquare size={14} />
          <span>Recenzii &amp; Sugestii Jucători</span>
          <span className="admin-db-tab-badge">{feedbacks.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`admin-db-tab-btn ${
            activeTab === "reports" ? "admin-db-tab-btn--active-rose" : ""
          }`}
        >
          <AlertTriangle size={14} />
          <span>Rapoarte &amp; Cereri Ghiduri</span>
          <span className="admin-db-tab-badge" style={{ background: openReportsCount > 0 ? "hsl(350 89% 60% / 0.3)" : undefined, color: openReportsCount > 0 ? "#fda4af" : undefined }}>
            {reports.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`admin-db-tab-btn ${
            activeTab === "config" ? "admin-db-tab-btn--active-emerald" : ""
          }`}
        >
          <Server size={14} />
          <span>Configurare Supabase &amp; Migrare SQL</span>
        </button>
      </div>


      {/* ── TAB 1: Top Views Explorer ────────────────────────────────── */}
      {activeTab === "views" && (
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="admin-quota-icon-box admin-quota-icon-box--cyan">
                <Eye size={16} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="admin-section-title">Clasament Accesări Documente</h3>
                <p className="admin-panel-sub">
                  Distribuția completă a traficului și popularitatea ghidurilor din comunitate
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span className="admin-perm-tag admin-perm-tag--cyan">
                <Layers size={11} /> {filteredViews.length} Ghiduri Urmărite
              </span>
              <span className="admin-perm-tag admin-perm-tag--emerald">
                <Eye size={11} /> {(status?.totalViews || 0).toLocaleString()} Total Accesări
              </span>
            </div>
          </div>

          {/* Table Toolbar */}
          <div className="admin-table-toolbar">
            <div className="admin-table-filters">
              <button
                type="button"
                className={`admin-filter-pill ${viewFilter === "all" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setViewFilter("all")}
              >
                Toate ({views.length})
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${viewFilter === "top5" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setViewFilter("top5")}
              >
                Top 5 Populare
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${viewFilter === "recent" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setViewFilter("recent")}
              >
                Recente
              </button>
            </div>

            <div className="admin-table-search">
              <div className="admin-search-input-wrap">
                <Search size={13} className="admin-search-icon" />
                <input
                  type="text"
                  value={viewSearch}
                  onChange={(e) => setViewSearch(e.target.value)}
                  placeholder="Caută după slug (ex: informatii/staff)..."
                  className="admin-search-input"
                />
              </div>
            </div>
          </div>

          {/* Views Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>Rang</th>
                  <th>Ghid / Document</th>
                  <th>Total Vizualizări</th>
                  <th>Ultima Accesare</th>
                  <th style={{ textAlign: "right", width: "90px" }}>Deschide</th>
                </tr>
              </thead>
              <tbody>
                {filteredViews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      <Eye size={24} style={{ margin: "0 auto 8px", opacity: 0.35 }} />
                      <p>{viewSearch ? "Niciun document nu corespunde căutării." : "Nicio vizualizare înregistrată încă."}</p>
                    </td>
                  </tr>
                ) : (
                  filteredViews.map((view, i) => {
                    const rankBadgeClass =
                      i === 0
                        ? "admin-rank-badge--gold"
                        : i === 1
                        ? "admin-rank-badge--silver"
                        : i === 2
                        ? "admin-rank-badge--bronze"
                        : "admin-rank-badge--default";

                    return (
                      <tr key={view.slug}>
                        <td>
                          <span className={`admin-rank-badge ${rankBadgeClass}`}>
                            {i < 3 && <Award size={11} />}
                            #{i + 1}
                          </span>
                        </td>
                        <td>
                          <a
                            href={`/docs/${view.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-perm-tag admin-perm-tag--blue"
                            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <BookOpen size={11} />
                            /docs/{view.slug}
                            <ExternalLink size={10} style={{ opacity: 0.6 }} />
                          </a>
                        </td>
                        <td>
                          <span className="admin-views-metric-pill">
                            <Eye size={12} />
                            {view.total_views.toLocaleString()} accesări
                          </span>
                        </td>
                        <td>
                          <span className="admin-table-mono admin-table-muted" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <Clock size={11} />
                            {new Date(view.last_viewed_at).toLocaleDateString("ro-RO", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <a
                            href={`/docs/${view.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-db-link-btn"
                            title="Deschide documentul în tab nou"
                            style={{ display: "inline-flex" }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Feedbacks & Reviews Center ────────────────────────── */}
      {activeTab === "feedbacks" && (
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="admin-quota-icon-box admin-quota-icon-box--amber">
                <MessageSquare size={16} className="text-amber-400" />
              </div>
              <div>
                <h3 className="admin-section-title">Recenzii &amp; Sugestii Comunitate</h3>
                <p className="admin-panel-sub">
                  Părerile, aprecierile și comentariile trimise de jucători direct de pe paginile din documentație
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span className="admin-perm-tag admin-perm-tag--emerald">
                <ThumbsUp size={11} /> {helpfulCount} Utile ({helpfulPct}%)
              </span>
              <span className="admin-perm-tag admin-perm-tag--rose">
                <ThumbsDown size={11} /> {unhelpfulCount} Inutile
              </span>
              <span className="admin-perm-tag admin-perm-tag--cyan">
                <Quote size={11} /> {commentsCount} Comentarii
              </span>
            </div>
          </div>

          {/* Table Toolbar */}
          <div className="admin-table-toolbar">
            <div className="admin-table-filters">
              <button
                type="button"
                className={`admin-filter-pill ${feedbackFilter === "all" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setFeedbackFilter("all")}
              >
                Toate ({feedbacks.length})
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${feedbackFilter === "helpful" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setFeedbackFilter("helpful")}
              >
                Doar Utile ({helpfulCount})
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${feedbackFilter === "unhelpful" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setFeedbackFilter("unhelpful")}
              >
                Doar Inutile ({unhelpfulCount})
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${feedbackFilter === "with_comments" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setFeedbackFilter("with_comments")}
              >
                Cu Comentarii ({commentsCount})
              </button>
            </div>

            <div className="admin-table-search">
              <div className="admin-search-input-wrap">
                <Search size={13} className="admin-search-icon" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  placeholder="Caută în comentarii sau slug..."
                  className="admin-search-input"
                />
              </div>
            </div>
          </div>

          {/* Feedback Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "120px" }}>Evaluare</th>
                  <th>Ghid Document</th>
                  <th>Comentariu / Opinie Jucător</th>
                  <th style={{ width: "170px" }}>Data Înregistrării</th>
                  <th style={{ textAlign: "right", width: "80px" }}>Șterge</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      <MessageSquare size={24} style={{ margin: "0 auto 8px", opacity: 0.35 }} />
                      <p>
                        {feedbackSearch || feedbackFilter !== "all"
                          ? "Niciun feedback nu corespunde filtrelor selectate."
                          : "Niciun feedback primit încă de la jucători."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map((fb) => (
                    <tr key={fb.id}>
                      <td>
                        <span
                          className={`admin-status-pill ${
                            fb.rating === "helpful" ? "admin-status-pill--success" : "admin-status-pill--danger"
                          }`}
                        >
                          {fb.rating === "helpful" ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />}
                          {fb.rating === "helpful" ? "UTIL" : "INUTIL"}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`/docs/${fb.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-perm-tag admin-perm-tag--blue"
                          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <BookOpen size={11} />
                          /docs/{fb.slug}
                          <ExternalLink size={10} style={{ opacity: 0.6 }} />
                        </a>
                      </td>
                      <td>
                        {fb.comment && fb.comment.trim() ? (
                          <div className="admin-feedback-quote">
                            <Quote size={12} style={{ opacity: 0.6, flexShrink: 0, marginTop: "2px", color: "#fbbf24" }} />
                            <span style={{ color: "#f1f5f9", fontStyle: "italic" }}>&ldquo;{fb.comment}&rdquo;</span>
                          </div>
                        ) : (
                          <span className="admin-table-muted" style={{ fontStyle: "italic", fontSize: "0.74rem" }}>
                            — Fără comentariu atașat
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="admin-table-mono admin-table-muted" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <Clock size={11} />
                          {new Date(fb.created_at).toLocaleDateString("ro-RO", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeedback(fb.id)}
                          className="admin-feedback-delete-action"
                          title="Șterge acest feedback din sistem"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: Reports & Guide Requests Hub ──────────────────────── */}
      {activeTab === "reports" && (
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="admin-quota-icon-box admin-quota-icon-box--rose">
                <AlertTriangle size={16} className="text-rose-400" />
              </div>
              <div>
                <h3 className="admin-section-title">Centru Raportare Erori &amp; Cereri Ghiduri Noi</h3>
                <p className="admin-panel-sub">
                  Semnalări primite direct de la jucători din documentație, sincronizate cu Discord
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span className="admin-perm-tag admin-perm-tag--orange">
                <AlertTriangle size={11} /> {openReportsCount} Deschise / În Lucru
              </span>
              <span className="admin-perm-tag admin-perm-tag--cyan">
                <FilePlus size={11} /> {newGuidesRequestsCount} Cereri Ghid Nou
              </span>
            </div>
          </div>

          {/* Table Toolbar */}
          <div className="admin-table-toolbar">
            <div className="admin-table-filters">
              <button
                type="button"
                className={`admin-filter-pill ${reportFilter === "all" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setReportFilter("all")}
              >
                Toate ({reports.length})
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${reportFilter === "issues" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setReportFilter("issues")}
              >
                Erori Ghiduri
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${reportFilter === "requests" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setReportFilter("requests")}
              >
                Cereri Ghiduri
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${reportFilter === "open" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setReportFilter("open")}
              >
                Doar Active ({openReportsCount})
              </button>
              <button
                type="button"
                className={`admin-filter-pill ${reportFilter === "resolved" ? "admin-filter-pill--active" : ""}`}
                onClick={() => setReportFilter("resolved")}
              >
                Rezolvate
              </button>
            </div>

            <div className="admin-table-search">
              <div className="admin-search-input-wrap">
                <Search size={13} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Caută în rapoarte, slug sau descriere..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "130px" }}>Tip &amp; Severitate</th>
                  <th style={{ width: "200px" }}>Ghid Sursă / Subiect</th>
                  <th>Descriere &amp; Detalii Raport</th>
                  <th style={{ width: "130px" }}>Status</th>
                  <th style={{ textAlign: "right", width: "130px" }}>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table-empty">
                      <AlertTriangle size={24} style={{ margin: "0 auto 8px", opacity: 0.35 }} />
                      <p>
                        {reportSearch || reportFilter !== "all"
                          ? "Niciun raport nu corespunde filtrelor selectate."
                          : "Niciun raport sau cerere de ghid înregistrată încă."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep) => {
                    const isRequest = rep.type === "new_guide_request";

                    return (
                      <tr key={rep.id}>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span
                              className={`admin-status-pill ${
                                isRequest ? "admin-status-pill--cyan" : "admin-status-pill--danger"
                              }`}
                              style={{ fontSize: "0.68rem" }}
                            >
                              {isRequest ? <FilePlus size={10} /> : <AlertTriangle size={10} />}
                              {isRequest ? "CERERE GHID" : "EROARE GHID"}
                            </span>
                            {rep.severity && !isRequest && (
                              <span
                                className="admin-table-mono"
                                style={{
                                  fontSize: "0.65rem",
                                  color: rep.severity === "high" ? "#f43f5e" : rep.severity === "medium" ? "#fbbf24" : "#10b981",
                                  fontWeight: 700,
                                }}
                              >
                                {rep.severity.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            {rep.slug && rep.slug !== "general" ? (
                              <a
                                href={`/docs/${rep.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-perm-tag admin-perm-tag--blue"
                                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                              >
                                <BookOpen size={11} />
                                /docs/{rep.slug}
                                <ExternalLink size={10} style={{ opacity: 0.6 }} />
                              </a>
                            ) : (
                              <span className="admin-perm-tag admin-perm-tag--purple">
                                {rep.category || "General"}
                              </span>
                            )}
                            {rep.title && (
                              <p style={{ margin: "4px 0 0", fontSize: "0.76rem", fontWeight: 600, color: "#f8fafc" }}>
                                {rep.title}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "#f1f5f9", lineHeight: 1.45 }}>
                              {rep.description}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              {rep.contactDiscord && (
                                <span className="admin-table-mono" style={{ fontSize: "0.68rem", color: "#818cf8", background: "hsl(235 85% 65% / 0.12)", padding: "2px 6px", borderRadius: "4px", border: "1px solid hsl(235 85% 65% / 0.25)" }}>
                                  Discord: {rep.contactDiscord}
                                </span>
                              )}
                              <span className="admin-table-mono admin-table-muted" style={{ fontSize: "0.68rem" }}>
                                <Clock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
                                {new Date(rep.created_at).toLocaleDateString("ro-RO", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`admin-status-pill ${
                              rep.status === "resolved"
                                ? "admin-status-pill--success"
                                : rep.status === "in_progress"
                                ? "admin-status-pill--amber"
                                : "admin-status-pill--danger"
                            }`}
                            style={{ fontSize: "0.7rem" }}
                          >
                            {rep.status === "resolved"
                              ? "REZOLVAT"
                              : rep.status === "in_progress"
                              ? "ÎN LUCRU"
                              : "DESCHIS"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            {rep.status !== "resolved" ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateReportStatus(rep.id, "resolved")}
                                className="admin-btn admin-btn--secondary"
                                style={{ padding: "4px 8px", fontSize: "0.7rem", color: "#34d399", borderColor: "hsl(142 71% 45% / 0.3)" }}
                                title="Marchează ca rezolvat"
                              >
                                <Check size={11} />
                                <span>Rezolvă</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateReportStatus(rep.id, "open")}
                                className="admin-btn admin-btn--secondary"
                                style={{ padding: "4px 8px", fontSize: "0.7rem", color: "#94a3b8" }}
                                title="Redeschide raportul"
                              >
                                <span>Redeschide</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteReport(rep.id)}
                              className="admin-feedback-delete-action"
                              title="Șterge raportul"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: Supabase Config & SQL Studio ──────────────────────── */}
      {activeTab === "config" && (

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
          {/* Configuration Card */}
          <div className="admin-panel-card" style={{ marginBottom: 0 }}>
            <div className="admin-panel-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="admin-quota-icon-box admin-quota-icon-box--emerald">
                  <Database size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="admin-section-title">Setări Conexiune Supabase</h3>
                  <p className="admin-panel-sub">
                    Configurează cheile API pentru persistența cloud PostgreSQL
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span className="admin-db-section-label" style={{ display: "block" }}>FURNIZIOR ACTIV</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
                    {dbProvider === "supabase" ? "Supabase Cloud (PostgreSQL)" : "Local Zero-Config Engine"}
                  </span>
                </div>
                <div className="admin-db-provider-group">
                  <button
                    type="button"
                    onClick={() => setDbProvider("local")}
                    className={`admin-db-provider-btn ${
                      dbProvider === "local" ? "admin-db-provider-btn--active-local" : ""
                    }`}
                  >
                    Local Engine
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbProvider("supabase")}
                    className={`admin-db-provider-btn ${
                      dbProvider === "supabase" ? "admin-db-provider-btn--active-supabase" : ""
                    }`}
                  >
                    Supabase Cloud
                  </button>
                </div>
              </div>

              {dbProvider === "supabase" && (
                <>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Supabase Project URL</label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xxxxxxxxxxxx.supabase.co"
                      className="admin-form-input text-xs font-mono"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Supabase Publishable / Anon Key</label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="sb_publishable_... sau eyJhbGci..."
                      className="admin-form-input text-xs font-mono"
                    />
                  </div>

                  {testResult && (
                    <div
                      className={`admin-db-test-result ${
                        testResult.success
                          ? "admin-db-test-result--success"
                          : "admin-db-test-result--error"
                      }`}
                    >
                      {testResult.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      <span>{testResult.message}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testingDb}
                      className="admin-btn admin-btn--secondary"
                      style={{ flex: 1 }}
                    >
                      <Activity size={14} className={testingDb ? "admin-spin" : ""} />
                      <span>{testingDb ? "Se verifică..." : "Test Ping Conexiune"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={copySqlScript}
                      className="admin-btn admin-btn--secondary"
                      title="Copiază codul SQL pentru crearea tabelelor"
                    >
                      {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedSql ? "Copiat!" : "Copiază SQL"}</span>
                    </button>
                  </div>
                </>
              )}

              <div style={{ paddingTop: "14px", borderTop: "1px solid var(--glass-border)" }}>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="admin-btn admin-btn--primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Save size={14} />
                  <span>{savingConfig ? "Se salvează..." : "Salvează Configurația Bazei"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SQL Migration Assistant */}
          <div className="admin-panel-card" style={{ marginBottom: 0 }}>
            <div className="admin-panel-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="admin-quota-icon-box admin-quota-icon-box--cyan">
                  <Layers size={16} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="admin-section-title">Schema SQL PostgreSQL</h3>
                  <p className="admin-panel-sub">
                    Rulează această schemă în Supabase SQL Editor pentru crearea tabelelor
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <pre className="admin-db-sql-block">
{`-- WildFire Docs Supabase Migration Schema
create table if not exists doc_views (
  slug text primary key,
  total_views integer default 0,
  today_views integer default 0,
  last_viewed_at timestamp with time zone default now()
);

create table if not exists doc_feedbacks (
  id text primary key,
  slug text not null,
  rating text not null,
  comment text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table doc_views enable row level security;
alter table doc_feedbacks enable row level security;

create policy "Allow public read on doc_views" 
  on doc_views for select using (true);
create policy "Allow public insert/update on doc_views" 
  on doc_views for all using (true);

create policy "Allow public read on doc_feedbacks" 
  on doc_feedbacks for select using (true);
create policy "Allow public insert on doc_feedbacks" 
  on doc_feedbacks for insert with check (true);`}
              </pre>

              <button
                type="button"
                onClick={copySqlScript}
                className="admin-btn admin-btn--secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedSql ? "Script SQL Copiat în Clipboard!" : "Copiază Scriptul SQL Complet"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
