import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  ShieldCheck,
  Users,
  ScrollText,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Server,
  Lock,
  Flame,
  CheckCircle2,
  Search,
  Key,
  Wrench,
  Activity,
  Cpu,
  Brain,
  TrendingUp,
  Eye,
  MessageSquare,
  Clock,
  Database,
  Zap,
  BarChart3,
  Shield,
  Globe,
  Code2,
  GitCommit,
  AlertTriangle,
  ChevronRight,
  Layers,
  Timer,
  Hash,
  Bot,
  Image as ImageIcon,
  DollarSign,
  Wifi,
  HardDrive,
  Trophy,
  Award,
  Medal,
  Webhook,
  ListTodo,
} from "lucide-react";
import { getAuthenticatedAdminSession, getActiveSessions, isPanicLockdown } from "@/lib/security/auth";
import { getAuditEvents, verifyAuditChainIntegrity } from "@/lib/security/audit";
import { getMaintenanceState } from "@/lib/security/maintenance";
import { getSearchAnalytics } from "@/lib/security/searchAnalytics";
import { listApiKeys } from "@/lib/security/apiKeys";
import { AdminLiveTerminal } from "@/components/admin/AdminLiveTerminal";
import { CURRENT_VERSION, PLATFORM_NAME } from "@/lib/version";
import { findTeamMemberByUsername } from "@/lib/security/teamStore";
import { scanMediaLibrary } from "@/lib/admin/mediaScanner";
import fs from "fs";
import path from "path";

function countDocs(dir = path.join(process.cwd(), "content", "docs")): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countDocs(full);
    else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) count++;
  }
  return count;
}

function getDocAnalytics() {
  try {
    const p = path.join(process.cwd(), "data", "doc_analytics.json");
    if (!fs.existsSync(p)) return { totalViews: 0, todayViews: 0, topDocs: [], docCount: 0, helpful: 0, unhelpful: 0, satisfactionRate: 100, totalFeedbacks: 0 };
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    const views = Object.values(raw.views || {}) as any[];
    const totalViews = views.reduce((s: number, v: any) => s + (v.total_views || 0), 0);
    const todayViews = views.reduce((s: number, v: any) => s + (v.today_views || 0), 0);
    const topDocs = [...views]
      .sort((a: any, b: any) => (b.today_views || 0) - (a.today_views || 0))
      .slice(0, 5)
      .map((v: any) => ({
        slug: v.slug,
        todayViews: v.today_views || 0,
        totalViews: v.total_views || 0,
        lastViewedAt: v.last_viewed_at,
      }));
    const feedbacks = raw.feedbacks || [];
    const helpful = feedbacks.filter((f: any) => f.rating === "helpful").length;
    const unhelpful = feedbacks.filter((f: any) => f.rating === "unhelpful").length;
    const satisfactionRate = helpful + unhelpful > 0 ? Math.round((helpful / (helpful + unhelpful)) * 100) : 100;
    return { totalViews, todayViews, topDocs, docCount: views.length, helpful, unhelpful, satisfactionRate, totalFeedbacks: feedbacks.length };
  } catch {
    return { totalViews: 0, todayViews: 0, topDocs: [], docCount: 0, helpful: 0, unhelpful: 0, satisfactionRate: 100, totalFeedbacks: 0 };
  }
}

function getGeoStats() {
  try {
    const p = path.join(process.cwd(), "data", "view-geo-stats.json");
    if (!fs.existsSync(p)) return { countries: [], hourly: {}, daily: {}, peakHour: 0, totalGeoViews: 0 };
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    const countries = Object.values(raw.countries || {}) as any[];
    const sorted = [...countries].sort((a: any, b: any) => b.views - a.views).slice(0, 6);
    const totalGeoViews = countries.reduce((s: number, c: any) => s + (c.views || 0), 0);
    return {
      countries: sorted,
      hourly: raw.hourly || {},
      daily: raw.daily || {},
      peakHour: raw.peakHour || 0,
      totalGeoViews,
    };
  } catch {
    return { countries: [], hourly: {}, daily: {}, peakHour: 0, totalGeoViews: 0 };
  }
}

function getDailyComparison(daily: Record<string, number>) {
  const days = Object.entries(daily).sort((a, b) => a[0].localeCompare(b[0]));
  const labeled = days.map(([date, views]) => {
    const d = new Date(date);
    const dayNames = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
    return {
      date,
      label: dayNames[d.getDay()],
      views,
      isToday: date === new Date().toISOString().split("T")[0],
    };
  });
  const max = Math.max(...labeled.map((d) => d.views), 1);
  return labeled.map((d) => ({ ...d, heightPercent: Math.round((d.views / max) * 100) }));
}

function getAiTelemetry() {
  try {
    const p = path.join(process.cwd(), "content", "ai-telemetry.json");
    if (!fs.existsSync(p)) return { lifetimeQueries: 0, totalCostUsd: 0, totalTokens: 0, recentLogs: [], successRate: 100, avgLatency: 0 };
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    const logs: any[] = raw.logs || [];
    const successLogs = logs.filter((l: any) => l.status === "success");
    const avgLatency =
      successLogs.length > 0
        ? Math.round(successLogs.reduce((s: number, l: any) => s + l.latencyMs, 0) / successLogs.length)
        : 0;
    const successRate = logs.length > 0 ? Math.round((successLogs.length / logs.filter((l: any) => l.status !== "rate_limited").length) * 100) : 100;
    return {
      lifetimeQueries: raw.lifetimeQueries || 0,
      totalCostUsd: raw.totalCostUsd || 0,
      totalTokens: (raw.totalPromptTokens || 0) + (raw.totalCandidatesTokens || 0),
      recentLogs: logs.slice(0, 5),
      successRate: isNaN(successRate) ? 100 : Math.min(100, successRate),
      avgLatency,
    };
  } catch {
    return { lifetimeQueries: 0, totalCostUsd: 0, totalTokens: 0, recentLogs: [], successRate: 100, avgLatency: 0 };
  }
}

function getAllTeamMembers() {
  try {
    const p = path.join(process.cwd(), "content", "team.json");
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

function formatRelativeTime(isoStr: string): string {
  if (!isoStr) return "—";
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "acum";
  if (mins < 60) return `acum ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `acum ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `acum ${days}z`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function getActionColor(action: string): string {
  if (action.includes("FAILURE") || action.includes("PANIC") || action.includes("ABUSE") || action.includes("DELETE")) return "#ef4444";
  if (action.includes("SUCCESS") || action.includes("CREATE") || action.includes("VERIFIED")) return "#10b981";
  if (action.includes("UPDATE") || action.includes("TOGGLE") || action.includes("MAINTENANCE")) return "#f59e0b";
  if (action.includes("MEDIA") || action.includes("BACKUP") || action.includes("SNAPSHOT")) return "#3b82f6";
  if (action.includes("AI") || action.includes("REPORT")) return "#8b5cf6";
  return "hsl(26 100% 52%)";
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getAuthenticatedAdminSession();
  if (!session) redirect("/admin/login");

  const member = findTeamMemberByUsername(session.username);
  const isRoot = Boolean(session.isRoot || member?.isRoot || session.username.toLowerCase() === "iannc69" || session.username.toLowerCase() === "iannc");
  const isLocked = isPanicLockdown();
  const maintenance = getMaintenanceState();
  const searchAnalytics = getSearchAnalytics();
  const apiKeys = listApiKeys();
  const totalDocs = countDocs();
  const activeSessions = getActiveSessions();
  const recentEvents = getAuditEvents(8);
  const chainIntegrity = verifyAuditChainIntegrity();
  const docAnalytics = getDocAnalytics();
  const aiTelemetry = getAiTelemetry();
  const allTeamMembers = getAllTeamMembers();
  const mediaStats = scanMediaLibrary();
  const geoStats = getGeoStats();
  const dailyChart = getDailyComparison(geoStats.daily as Record<string, number>);

  const memoryUsage = process.memoryUsage();
  const heapUsedMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMb = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const rssMb = Math.round(memoryUsage.rss / 1024 / 1024);
  const heapPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

  const activeSessionCount = activeSessions.length;
  const uptimeSeconds = process.uptime();
  const uptimeHrs = Math.floor(uptimeSeconds / 3600);
  const uptimeMins = Math.floor((uptimeSeconds % 3600) / 60);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Bună dimineața" : now.getHours() < 17 ? "Bună ziua" : "Bună seara";

  return (
    <div className="adx-dashboard">
      {/* ── EMERGENCY BANNERS ────────────────────────────── */}
      {isLocked && (
        <div className="adx-banner adx-banner--danger">
          <ShieldAlert size={15} />
          <span><strong>EMERGENCY PANIC LOCKDOWN ACTIV.</strong> Toate sesiunile noi sunt blocate.</span>
          <Link href="/admin/security" className="adx-banner-link">Security Control <ChevronRight size={12} /></Link>
        </div>
      )}
      {maintenance.enabled && (
        <div className="adx-banner adx-banner--warning">
          <Wrench size={15} />
          <span><strong>MAINTENANCE MODE ACTIV.</strong> Platforma publică este offline pentru jucători.</span>
          <Link href="/admin/settings" className="adx-banner-link">Setări <ChevronRight size={12} /></Link>
        </div>
      )}

      {/* ── HERO HEADER ──────────────────────────────────── */}
      <div className="adx-hero">
        <div className="adx-hero-left">
          <div className="adx-hero-greeting">
            <div className="adx-live-indicator">
              <span className="adx-live-dot" />
              <span>LIVE</span>
            </div>
            <span className="adx-greeting-text">{greeting}, <strong>{session.displayName || session.username}</strong></span>
          </div>
          <h1 className="adx-hero-title">Mission Control</h1>
          <p className="adx-hero-subtitle">
            WF-DOCSCORE v{CURRENT_VERSION} &nbsp;·&nbsp; Cryptographic Audit Chain{" "}
            <span className={chainIntegrity.isValid ? "adx-badge adx-badge--green" : "adx-badge adx-badge--red"}>
              {chainIntegrity.isValid ? "VERIFIED" : "COMPROMIS"}
            </span>
            &nbsp;·&nbsp; Uptime <span className="adx-mono">{uptimeHrs}h {uptimeMins}m</span>
          </p>
        </div>
        <div className="adx-hero-actions">
          {(isRoot || session.permissions?.canEditDocs) && (
            <Link href="/admin/content" className="adx-btn adx-btn--primary">
              <Plus size={14} /> New Document
            </Link>
          )}
          {(isRoot || session.permissions?.canManageTasks) && (
            <Link href="/admin/tasks" className="adx-btn adx-btn--ghost">
              <ListTodo size={14} /> Task Hub
            </Link>
          )}
          {(isRoot || session.permissions?.canManageWebhooks) && (
            <Link href="/admin/webhooks" className="adx-btn adx-btn--ghost">
              <Webhook size={14} /> Webhooks
            </Link>
          )}
          {(isRoot || session.permissions?.canManageSecurity) && (
            <Link href="/admin/security" className="adx-btn adx-btn--ghost">
              <Lock size={14} /> Security
            </Link>
          )}
          {(isRoot || session.permissions?.canViewAudit) && (
            <Link href="/admin/audit" className="adx-btn adx-btn--ghost">
              <ScrollText size={14} /> Audit Trail
            </Link>
          )}
        </div>
      </div>

      {/* ── ROW 1: PRIMARY METRIC CARDS ──────────────────── */}
      <div className="adx-metrics-row">
        {/* Docs */}
        <div className="adx-metric-card adx-metric-card--orange">
          <div className="adx-metric-top">
            <span className="adx-metric-label">Document Library</span>
            <div className="adx-metric-icon-wrap adx-metric-icon--orange"><FileText size={16} /></div>
          </div>
          <div className="adx-metric-big">{totalDocs}</div>
          <div className="adx-metric-sub">
            <span className="adx-pill adx-pill--green">100% Synced</span>
            <span className="adx-metric-desc">Ghiduri publicate</span>
          </div>
        </div>

        {/* Views */}
        <div className="adx-metric-card adx-metric-card--blue">
          <div className="adx-metric-top">
            <span className="adx-metric-label">Vizualizări Astăzi</span>
            <div className="adx-metric-icon-wrap adx-metric-icon--blue"><Eye size={16} /></div>
          </div>
          <div className="adx-metric-big">{docAnalytics.todayViews}</div>
          <div className="adx-metric-sub">
            <span className="adx-pill adx-pill--blue">{formatNumber(docAnalytics.totalViews)} total</span>
            <span className="adx-metric-desc">Lectori activi</span>
          </div>
        </div>

        {/* AI Queries */}
        <div className="adx-metric-card adx-metric-card--purple">
          <div className="adx-metric-top">
            <span className="adx-metric-label">AI Helper Queries</span>
            <div className="adx-metric-icon-wrap adx-metric-icon--purple"><Brain size={16} /></div>
          </div>
          <div className="adx-metric-big">{aiTelemetry.lifetimeQueries}</div>
          <div className="adx-metric-sub">
            <span className="adx-pill adx-pill--purple">{aiTelemetry.successRate}% success</span>
            <span className="adx-metric-desc">~{aiTelemetry.avgLatency}ms latency</span>
          </div>
        </div>

        {/* Security */}
        <div className="adx-metric-card adx-metric-card--green">
          <div className="adx-metric-top">
            <span className="adx-metric-label">Security Score</span>
            <div className="adx-metric-icon-wrap adx-metric-icon--green"><ShieldCheck size={16} /></div>
          </div>
          <div className="adx-metric-big">{chainIntegrity.isValid ? "100%" : "!"}</div>
          <div className="adx-metric-sub">
            <span className={chainIntegrity.isValid ? "adx-pill adx-pill--green" : "adx-pill adx-pill--red"}>
              {chainIntegrity.isValid ? "Chain OK" : "TAMPERED"}
            </span>
            <span className="adx-metric-desc">SHA-256 Chain</span>
          </div>
        </div>

        {/* Search */}
        <div className="adx-metric-card adx-metric-card--amber">
          <div className="adx-metric-top">
            <span className="adx-metric-label">Search Queries</span>
            <div className="adx-metric-icon-wrap adx-metric-icon--amber"><Search size={16} /></div>
          </div>
          <div className="adx-metric-big">{searchAnalytics.totalSearches}</div>
          <div className="adx-metric-sub">
            <span className={searchAnalytics.missedCount > 0 ? "adx-pill adx-pill--red" : "adx-pill adx-pill--green"}>
              {searchAnalytics.missedCount} gaps
            </span>
            <span className="adx-metric-desc">{searchAnalytics.avgLatencyMs}ms avg</span>
          </div>
        </div>

        {/* Media */}
        <div className="adx-metric-card adx-metric-card--cyan">
          <div className="adx-metric-top">
            <span className="adx-metric-label">Asset Vault</span>
            <div className="adx-metric-icon-wrap adx-metric-icon--cyan"><ImageIcon size={16} /></div>
          </div>
          <div className="adx-metric-big">{mediaStats.totalAssets}</div>
          <div className="adx-metric-sub">
            <span className="adx-pill adx-pill--cyan">{mediaStats.totalSizeFormatted}</span>
            <span className="adx-metric-desc">{mediaStats.imagesCount} images · {mediaStats.videosCount} videos</span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: LIVE TERMINAL ─────────────────────────── */}
      <AdminLiveTerminal />

      {/* ── ROW 3: THREE COLUMN LAYOUT ───────────────────── */}
      <div className="adx-three-col">

        {/* ── LEFT: AUDIT LEDGER ───────────────────────── */}
        <div className="adx-panel adx-audit-panel">
          <div className="adx-panel-header">
            <div className="adx-panel-title-row">
              <ScrollText size={14} className="adx-panel-icon" />
              <h2 className="adx-panel-title">Real-Time Audit Ledger</h2>
              <span className="adx-live-dot adx-live-dot--sm" />
            </div>
            <Link href="/admin/audit" className="adx-panel-link">
              Full Ledger <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="adx-audit-list">
            {recentEvents.map((evt) => {
              const color = getActionColor(evt.action);
              return (
                <div key={evt.id} className="adx-audit-row">
                  <div className="adx-audit-marker" style={{ background: color, boxShadow: `0 0 8px ${color}60` }} />
                  <div className="adx-audit-content">
                    <div className="adx-audit-header-row">
                      <span className="adx-audit-action" style={{ color }}>
                        {evt.action.replace(/_/g, " ")}
                      </span>
                      <span className="adx-audit-time">{formatRelativeTime(evt.timestamp)}</span>
                    </div>
                    <div className="adx-audit-meta">
                      <span className="adx-mono-sm">{evt.actor}</span>
                      <span className="adx-mono-sm adx-text-dim">{evt.hash.slice(0, 8)}…</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MIDDLE: DEEP ANALYTICS PANEL ─────────── */}
        <div className="adx-middle-stack">

          {/* ── MEGA ANALYTICS: Traffic Intelligence ── */}
          <div className="adx-panel adx-analytics-mega">
            <div className="adx-panel-header">
              <div className="adx-panel-title-row">
                <BarChart3 size={14} className="adx-panel-icon" />
                <h2 className="adx-panel-title">Traffic Intelligence</h2>
                <span className="adx-live-dot adx-live-dot--sm" />
              </div>
              <Link href="/admin/ai-analytics" className="adx-panel-link">
                Analytics Complet <ArrowUpRight size={12} />
              </Link>
            </div>

            {/* ── Day-Over-Day Bar Chart ── */}
            <div className="adx-section-header">
              <TrendingUp size={11} />
              <span>Comparativ pe Zile — Ultimele 7 Zile</span>
            </div>
            <div className="adx-bar-chart-wrap">
              <div className="adx-bar-chart">
                {dailyChart.length === 0 ? (
                  <div className="adx-empty">Date insuficiente pentru comparativ.</div>
                ) : (
                  dailyChart.map((day) => (
                    <div key={day.date} className="adx-bar-col">
                      <div className="adx-bar-value">{day.views > 0 ? day.views : ""}</div>
                      <div
                        className={`adx-bar ${day.isToday ? "adx-bar--today" : "adx-bar--past"}`}
                        style={{ height: `${Math.max(day.heightPercent, day.views > 0 ? 8 : 3)}%` }}
                      />
                      <div className={`adx-bar-label ${day.isToday ? "adx-bar-label--today" : ""}`}>{day.label}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Top Docs Leaderboard (Lucide Vector Ranks) ── */}
            <div className="adx-section-header">
              <TrendingUp size={11} />
              <span>Top Ghiduri Citite Astăzi</span>
              <span className="adx-section-badge">{docAnalytics.todayViews} vizualizări</span>
            </div>
            <div className="adx-doc-list">
              {docAnalytics.topDocs.length === 0 ? (
                <div className="adx-empty">Nicio vizualizare înregistrată azi.</div>
              ) : (
                docAnalytics.topDocs.map((doc, i) => {
                  const barWidth = docAnalytics.todayViews > 0
                    ? Math.round((doc.todayViews / docAnalytics.topDocs[0].todayViews) * 100)
                    : 0;
                  return (
                    <div key={doc.slug} className="adx-top-doc-row">
                      <div className={`adx-top-doc-rank-pill ${i === 0 ? "adx-rank--gold" : i === 1 ? "adx-rank--silver" : i === 2 ? "adx-rank--bronze" : ""}`}>
                        {i === 0 ? <Trophy size={13} /> : i === 1 ? <Award size={13} /> : i === 2 ? <Medal size={13} /> : `#${i + 1}`}
                      </div>
                      <div className="adx-top-doc-info">
                        <div className="adx-top-doc-name-row">
                          <span className="adx-doc-slug">{doc.slug.split("/").pop()?.replace(/-/g, " ")}</span>
                          <div className="adx-top-doc-badges">
                            <span className="adx-pill adx-pill--blue">{doc.todayViews} azi</span>
                            <span className="adx-pill adx-pill--orange">{doc.totalViews} total</span>
                          </div>
                        </div>
                        <div className="adx-top-doc-bar-wrap">
                          <div className="adx-top-doc-bar" style={{ width: `${barWidth}%` }} />
                        </div>
                        <span className="adx-doc-path adx-text-dim">/{doc.slug}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Satisfaction Score ── */}
            <div className="adx-section-header">
              <Activity size={11} />
              <span>Scor Satisfacție Jucători</span>
            </div>
            <div className="adx-satisfaction-row">
              <div className="adx-satisfaction-score">
                <span className={`adx-satisfaction-pct ${(docAnalytics as any).satisfactionRate >= 70 ? "adx-text-green" : "adx-text-red"}`}>
                  {(docAnalytics as any).satisfactionRate}%
                </span>
                <span className="adx-satisfaction-label">Ghiduri Utile</span>
              </div>
              <div className="adx-satisfaction-bar-wrap">
                <div className="adx-satisfaction-track">
                  <div
                    className={`adx-satisfaction-fill ${(docAnalytics as any).satisfactionRate >= 70 ? "adx-satisfaction--green" : "adx-satisfaction--red"}`}
                    style={{ width: `${(docAnalytics as any).satisfactionRate}%` }}
                  />
                </div>
                <div className="adx-satisfaction-counts">
                  <span className="adx-text-green adx-mono-sm">{(docAnalytics as any).helpful} helpful</span>
                  <span className="adx-text-red adx-mono-sm">{(docAnalytics as any).unhelpful} unhelpful</span>
                  <span className="adx-text-dim adx-mono-sm">{(docAnalytics as any).totalFeedbacks} total</span>
                </div>
              </div>
            </div>

            {/* ── Hourly Activity Heatmap ── */}
            <div className="adx-section-header">
              <Clock size={11} />
              <span>Activitate pe Ore — Azi</span>
              <span className="adx-section-badge">Peak ora {geoStats.peakHour}:00</span>
            </div>
            <div className="adx-hourly-heatmap">
              {Array.from({ length: 24 }, (_, h) => {
                const val = (geoStats.hourly as any)[String(h)] || 0;
                const max = Math.max(...Object.values(geoStats.hourly as Record<string, number>), 1);
                const intensity = max > 0 ? val / max : 0;
                const isPeak = h === geoStats.peakHour && val > 0;
                return (
                  <div key={h} className={`adx-hour-cell ${isPeak ? "adx-hour-cell--peak" : ""}`}
                    style={{ opacity: intensity > 0 ? 0.25 + intensity * 0.75 : 0.12, background: intensity > 0.6 ? "hsl(26 100% 52%)" : intensity > 0.3 ? "#f59e0b" : intensity > 0 ? "#3b82f6" : "hsl(220 14% 20%)" }}
                    title={`${h}:00 — ${val} vizualizări`}
                  />
                );
              })}
            </div>
            <div className="adx-hourly-labels">
              {["00", "06", "12", "18", "23"].map((h) => (
                <span key={h} className="adx-mono-sm adx-text-dim">{h}:00</span>
              ))}
            </div>
          </div>

          {/* AI Cost & Telemetry */}
          <div className="adx-panel adx-ai-panel">
            <div className="adx-panel-header">
              <div className="adx-panel-title-row">
                <Bot size={14} className="adx-panel-icon adx-panel-icon--purple" />
                <h2 className="adx-panel-title">AI Helper Telemetry</h2>
              </div>
              <Link href="/admin/ai-analytics" className="adx-panel-link">
                Stats <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="adx-ai-stats-grid">
              <div className="adx-ai-stat">
                <span className="adx-ai-stat-val adx-text-purple">{formatNumber(aiTelemetry.totalTokens)}</span>
                <span className="adx-ai-stat-label">Tokeni Totali</span>
              </div>
              <div className="adx-ai-stat">
                <span className="adx-ai-stat-val adx-text-green">${aiTelemetry.totalCostUsd.toFixed(3)}</span>
                <span className="adx-ai-stat-label">Cost Total USD</span>
              </div>
              <div className="adx-ai-stat">
                <span className="adx-ai-stat-val adx-text-blue">{aiTelemetry.avgLatency}ms</span>
                <span className="adx-ai-stat-label">Latenta Medie</span>
              </div>
              <div className="adx-ai-stat">
                <span className="adx-ai-stat-val adx-text-amber">{aiTelemetry.successRate}%</span>
                <span className="adx-ai-stat-label">Success Rate</span>
              </div>
            </div>
            <div className="adx-ai-recent">
              {aiTelemetry.recentLogs.slice(0, 3).map((log: any) => (
                <div key={log.id} className="adx-ai-log-row">
                  <div className={`adx-ai-status-dot adx-ai-status--${log.status}`} />
                  <span className="adx-ai-query">{log.querySnippet?.slice(0, 45) || "—"}…</span>
                  <span className="adx-mono-sm adx-text-dim">{formatRelativeTime(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: SYSTEM + TEAM ─────────────────────── */}
        <div className="adx-right-stack">

          {/* System Health */}
          <div className="adx-panel adx-system-panel">
            <div className="adx-panel-header">
              <div className="adx-panel-title-row">
                <Cpu size={14} className="adx-panel-icon" />
                <h2 className="adx-panel-title">System Health</h2>
              </div>
              <span className="adx-pill adx-pill--green">Operational</span>
            </div>
            <div className="adx-system-body">
              {/* Memory Bar */}
              <div className="adx-sys-row">
                <div className="adx-sys-row-label">
                  <HardDrive size={12} />
                  <span>Heap Memory</span>
                </div>
                <div className="adx-sys-row-right">
                  <div className="adx-progress-bar">
                    <div className="adx-progress-fill adx-progress--orange" style={{ width: `${heapPercent}%` }} />
                  </div>
                  <span className="adx-mono-sm">{heapUsedMb}/{heapTotalMb}MB</span>
                </div>
              </div>
              <div className="adx-sys-divider" />
              {/* Specs */}
              <div className="adx-spec-list">
                <div className="adx-spec-row">
                  <span className="adx-spec-key">Platform</span>
                  <span className="adx-spec-val">WF-DOCSCORE v{CURRENT_VERSION}</span>
                </div>
                <div className="adx-spec-row">
                  <span className="adx-spec-key">Framework</span>
                  <span className="adx-spec-val">Next.js 16.3 Turbopack</span>
                </div>
                <div className="adx-spec-row">
                  <span className="adx-spec-key">RSS Memory</span>
                  <span className="adx-spec-val">{rssMb} MB</span>
                </div>
                <div className="adx-spec-row">
                  <span className="adx-spec-key">Cipher Suite</span>
                  <span className="adx-spec-val">PBKDF2-SHA512</span>
                </div>
                <div className="adx-spec-row">
                  <span className="adx-spec-key">Active Sessions</span>
                  <span className="adx-spec-val">{activeSessionCount}</span>
                </div>
                <div className="adx-spec-row">
                  <span className="adx-spec-key">API Keys</span>
                  <span className="adx-spec-val">{apiKeys.length} active</span>
                </div>
                <div className="adx-spec-row">
                  <span className="adx-spec-key">Maintenance</span>
                  <span className={maintenance.enabled ? "adx-spec-val adx-text-amber" : "adx-spec-val adx-text-green"}>
                    {maintenance.enabled ? "ACTIVE" : "OFFLINE"}
                  </span>
                </div>
                <div className="adx-spec-row">
                  <span className="adx-spec-key">Panic Lock</span>
                  <span className={isLocked ? "adx-spec-val adx-text-red" : "adx-spec-val adx-text-green"}>
                    {isLocked ? "LOCKED" : "CLEAR"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Country Breakdown (100% Vector Icons & Exact Dynamic Data) */}
          <div className="adx-panel adx-geo-panel">
            <div className="adx-panel-header">
              <div className="adx-panel-title-row">
                <Globe size={14} className="adx-panel-icon adx-panel-icon--cyan" />
                <h2 className="adx-panel-title">Origine Vizitatori</h2>
              </div>
              <span className="adx-pill adx-pill--cyan">{geoStats.totalGeoViews} total</span>
            </div>
            <div className="adx-geo-list">
              {geoStats.countries.length === 0 ? (
                <div className="adx-empty">Fără date geo. Vizitează platforma pentru a popula.</div>
              ) : (
                geoStats.countries.map((c: any, idx: number) => (
                  <div key={c.code} className="adx-geo-row">
                    <span className="adx-geo-code-badge">
                      <Globe size={11} />
                      {c.code}
                    </span>
                    <div className="adx-geo-info">
                      <div className="adx-geo-name-row">
                        <span className="adx-geo-name">{c.name}</span>
                        <span className="adx-geo-views adx-mono-sm">{c.views}</span>
                      </div>
                      <div className="adx-geo-bar-track">
                        <div
                          className={`adx-geo-bar-fill ${idx === 0 ? "adx-geo--top" : ""}`}
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className={`adx-geo-pct ${idx === 0 ? "adx-text-orange" : "adx-text-dim"}`}>{c.percentage}%</span>
                  </div>
                ))
              )}
            </div>
            <div className="adx-geo-note">
              <Globe size={10} />
              <span>Rezolvare WAN live automată via ipwho.is MaxMind</span>
            </div>
          </div>

          {/* Team Roster */}
          <div className="adx-panel adx-team-panel">
            <div className="adx-panel-header">
              <div className="adx-panel-title-row">
                <Users size={14} className="adx-panel-icon" />
                <h2 className="adx-panel-title">Echipa ({allTeamMembers.length})</h2>
              </div>
              <Link href="/admin/team" className="adx-panel-link">
                Gestionare <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="adx-team-list">
              {allTeamMembers.map((m: any) => (
                <div key={m.id} className="adx-team-member">
                  <div className="adx-team-avatar-wrap">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt={m.displayName} className="adx-team-avatar" />
                    ) : (
                      <div className="adx-team-avatar adx-team-avatar--placeholder" style={{ background: m.avatarColor || "hsl(26 100% 52%)" }}>
                        {m.displayName?.[0]}
                      </div>
                    )}
                    <div className={`adx-team-online-dot ${m.status === "active" ? "adx-online--green" : "adx-online--gray"}`} />
                  </div>
                  <div className="adx-team-info">
                    <div className="adx-team-name-row">
                      <span className="adx-team-name">{m.displayName}</span>
                      {m.isRoot && <span className="adx-badge adx-badge--orange">ROOT</span>}
                    </div>
                    <span className="adx-team-role">{m.customTitle || m.role}</span>
                  </div>
                  <div className="adx-team-meta">
                    <span className="adx-text-dim adx-mono-sm">{formatRelativeTime(m.lastLoginAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 4: QUICK NAVIGATION LAUNCHPAD ────────────── */}
      <div className="adx-launchpad">
        <div className="adx-panel-header" style={{ padding: "0 0 14px 0", borderBottom: "1px solid hsl(220 14% 20% / 0.6)" }}>
          <div className="adx-panel-title-row">
            <Layers size={14} className="adx-panel-icon" />
            <h2 className="adx-panel-title">Control Center — Acces Rapid</h2>
          </div>
        </div>
        <div className="adx-launchpad-grid">
          {(isRoot || session.permissions?.canEditDocs) && (
            <Link href="/admin/content" className="adx-launch-card adx-launch--orange">
              <FileText size={20} />
              <span className="adx-launch-title">Conținut & Docs</span>
              <span className="adx-launch-desc">{totalDocs} ghiduri publicate</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canManageTasks) && (
            <Link href="/admin/tasks" className="adx-launch-card adx-launch--orange">
              <ListTodo size={20} />
              <span className="adx-launch-title">Task Hub & TODO</span>
              <span className="adx-launch-desc">Gestiune sarcini & Kanban</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canManageWebhooks) && (
            <Link href="/admin/webhooks" className="adx-launch-card adx-launch--cyan">
              <Webhook size={20} />
              <span className="adx-launch-title">Webhooks & Alerte</span>
              <span className="adx-launch-desc">Trigger Discord #logs manual</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canManageTeam) && (
            <Link href="/admin/team" className="adx-launch-card adx-launch--emerald">
              <Users size={20} />
              <span className="adx-launch-title">Echipa</span>
              <span className="adx-launch-desc">{allTeamMembers.length} membri activi</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canManageMedia) && (
            <Link href="/admin/media" className="adx-launch-card adx-launch--cyan">
              <ImageIcon size={20} />
              <span className="adx-launch-title">Asset Vault</span>
              <span className="adx-launch-desc">{mediaStats.totalAssets} fișiere · {mediaStats.totalSizeFormatted}</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canViewAudit) && (
            <Link href="/admin/audit" className="adx-launch-card adx-launch--violet">
              <ScrollText size={20} />
              <span className="adx-launch-title">Audit Trail</span>
              <span className="adx-launch-desc">SHA-256 cryptographic chain</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canManageSecurity) && (
            <Link href="/admin/security" className="adx-launch-card adx-launch--red">
              <Shield size={20} />
              <span className="adx-launch-title">Security</span>
              <span className="adx-launch-desc">{isLocked ? "PANIC LOCKDOWN ACTIV" : "Systeme operationale"}</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canViewAnalytics) && (
            <Link href="/admin/search-analytics" className="adx-launch-card adx-launch--amber">
              <Search size={20} />
              <span className="adx-launch-title">Search Analytics</span>
              <span className="adx-launch-desc">{searchAnalytics.totalSearches} cautari · {searchAnalytics.missedCount} gaps</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canManageApiKeys) && (
            <Link href="/admin/api-keys" className="adx-launch-card adx-launch--blue">
              <Key size={20} />
              <span className="adx-launch-title">API Keys</span>
              <span className="adx-launch-desc">{apiKeys.length} integrari active</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canManageSettings) && (
            <Link href="/admin/settings" className="adx-launch-card adx-launch--gray">
              <Wrench size={20} />
              <span className="adx-launch-title">Settings</span>
              <span className="adx-launch-desc">{maintenance.enabled ? "Maintenance activ" : "Platform config"}</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canManageSnapshots) && (
            <Link href="/admin/backups" className="adx-launch-card adx-launch--teal">
              <Database size={20} />
              <span className="adx-launch-title">Backups</span>
              <span className="adx-launch-desc">Snapshots & export</span>
            </Link>
          )}
          {(isRoot || session.permissions?.canViewAiStats) && (
            <Link href="/admin/ai-analytics" className="adx-launch-card adx-launch--fuchsia">
              <Brain size={20} />
              <span className="adx-launch-title">AI Analytics</span>
              <span className="adx-launch-desc">{aiTelemetry.lifetimeQueries} queries lifetime</span>
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}
