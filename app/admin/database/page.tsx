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
} from "lucide-react";
import type { DocViewRecord, DocFeedbackRecord, DatabaseStatus } from "@/lib/db/types";

export default function AdminDatabasePage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [views, setViews] = useState<DocViewRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<DocFeedbackRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [viewSearch, setViewSearch] = useState<string>("");
  const [viewFilter, setViewFilter] = useState<"all" | "top5" | "recent">("all");
  const [feedbackSearch, setFeedbackSearch] = useState<string>("");
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "helpful" | "unhelpful" | "with_comments">("all");

  // Config Tab State
  const [activeTab, setActiveTab] = useState<"views" | "feedbacks" | "config">("views");
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

  // Positive feedback calculations
  const helpfulCount = feedbacks.filter((f) => f.rating === "helpful").length;
  const unhelpfulCount = feedbacks.length - helpfulCount;
  const commentsCount = feedbacks.filter((f) => f.comment && f.comment.trim()).length;
  const helpfulPct = feedbacks.length > 0 ? Math.round((helpfulCount / feedbacks.length) * 100) : 100;

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
    const sql = `-- WildFire Docs Supabase Migration Schema
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
  docs_modified_count integer default 0,
  password_hash text not null,
  salt text not null,
  permissions jsonb not null,
  status text not null default 'active',
  is_root boolean not null default false,
  created_at timestamp with time zone default now(),
  last_login_at timestamp with time zone
);

-- Enable Row Level Security (RLS) & Public Policies
alter table doc_views enable row level security;
alter table doc_feedbacks enable row level security;
alter table team_members enable row level security;

create policy "Allow public read on doc_views" on doc_views for select using (true);
create policy "Allow public insert/update on doc_views" on doc_views for all using (true);

create policy "Allow public read on doc_feedbacks" on doc_feedbacks for select using (true);
create policy "Allow public insert on doc_feedbacks" on doc_feedbacks for insert with check (true);

create policy "Allow read on team_members" on team_members for select using (true);
create policy "Allow all on team_members" on team_members for all using (true);`;

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

      {/* ── TAB 3: Supabase Config & SQL Studio ──────────────────────── */}
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
