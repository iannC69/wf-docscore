"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileWarning,
  Link2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  X,
  Zap,
  Cpu,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";
import type { DocHealthReport, DocHealthIssue } from "@/lib/admin/docHealth";

/* ── helpers ──────────────────────────────────────────────────────────── */
const FILTERS = [
  { key: "all",         label: "Toate" },
  { key: "error",      label: "Erori" },
  { key: "warning",    label: "Avertismente" },
  { key: "broken_link",label: "Link-uri Moarte" },
  { key: "orphan",     label: "Orfane" },
] as const;

type FilterKey = typeof FILTERS[number]["key"];

function IssueIcon({ severity }: { severity: string }) {
  if (severity === "error") return <ShieldAlert size={15} className="dh-icon-error" />;
  if (severity === "warning") return <AlertTriangle size={15} className="dh-icon-warning" />;
  return <FileText size={15} className="dh-icon-info" />;
}

function ScoreArc({ score }: { score: number }) {
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="dh-score-arc">
      {/* track */}
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="8"
      />
      {/* progress */}
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        strokeDashoffset="0"
        transform="rotate(-90 50 50)"
        style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
      />
      {/* text */}
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="900" fill={color} fontFamily="monospace">
        {score}
      </text>
      <text x="50" y="62" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(255,255,255,0.4)" fontFamily="monospace">
        SCORE
      </text>
    </svg>
  );
}

/* ── main component ───────────────────────────────────────────────────── */
export default function AdminDocHealthPage() {
  const [report, setReport] = useState<DocHealthReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lastScan, setLastScan] = useState<string>("");

  const fetchHealthReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/health");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const data = await res.json();
      setReport(data);
      setLastScan(new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Failed to load health report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealthReport(); }, []);

  const issues = report?.issues || [];

  const filterCounts = useMemo(() => ({
    all: issues.length,
    error: issues.filter(i => i.severity === "error").length,
    warning: issues.filter(i => i.severity === "warning").length,
    broken_link: issues.filter(i => i.type === "broken_link").length,
    orphan: issues.filter(i => i.type === "orphan_doc").length,
  }), [issues]);

  const filteredIssues = useMemo(() => issues.filter((issue) => {
    if (filter === "error" && issue.severity !== "error") return false;
    if (filter === "warning" && issue.severity !== "warning") return false;
    if (filter === "broken_link" && issue.type !== "broken_link") return false;
    if (filter === "orphan" && issue.type !== "orphan_doc") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.file.toLowerCase().includes(q) ||
        issue.message.toLowerCase().includes(q) ||
        (issue.detail && issue.detail.toLowerCase().includes(q))
      );
    }
    return true;
  }), [issues, filter, searchQuery]);

  const scoreVal = report?.healthScore ?? 100;
  const scoreLabel = scoreVal >= 90 ? "Excelent" : scoreVal >= 70 ? "Atenție" : "Critic";
  const scoreClass = scoreVal >= 90 ? "excellent" : scoreVal >= 70 ? "warning" : "critical";

  return (
    <div className="admin-page-container">

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="dh-page-header">
        <div className="dh-header-left">
          <div className="dh-header-breadcrumb">
            <Cpu size={11} />
            <span>SYSTEM DIAGNOSTICS</span>
            <span className="dh-breadcrumb-sep">/</span>
            <span>DOC HEALTH MATRIX</span>
          </div>
          <h1 className="dh-header-title">
            Inspector Integritate Docs
          </h1>
          <p className="dh-header-sub">
            Scanare automată în timp real a celor {report?.totalPages || "62"}+ articole
            — link-uri moarte, frontmatter, SEO și documente orfane.
          </p>
        </div>

        <div className="dh-header-actions">
          {lastScan && (
            <div className="dh-last-scan-tag">
              <Clock size={11} />
              <span>Ultima scanare: {lastScan}</span>
            </div>
          )}
          <button
            type="button"
            onClick={fetchHealthReport}
            disabled={loading}
            className="dh-scan-btn"
            id="health-rescan-btn"
          >
            <RefreshCw size={13} className={loading ? "dh-spin" : ""} />
            <span>{loading ? "Se scanează..." : "Rescanează"}</span>
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ───────────────────────────────────────────────── */}
      <div className="dh-kpi-strip">

        {/* Score Gauge */}
        <div className={`dh-kpi-score dh-kpi-score--${scoreClass}`}>
          <div className="dh-kpi-score-arc">
            {loading ? (
              <div className="dh-score-placeholder">
                <RefreshCw size={22} className="dh-spin dh-spin--slow" style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
            ) : (
              <ScoreArc score={scoreVal} />
            )}
          </div>
          <div className="dh-kpi-score-info">
            <span className="dh-kpi-score-label">HEALTH SCORE</span>
            <span className={`dh-kpi-score-badge dh-kpi-score-badge--${scoreClass}`}>{scoreLabel}</span>
            <span className="dh-kpi-score-desc">
              {scoreVal >= 90
                ? "Repository în stare excelentă — zero blocante."
                : scoreVal >= 70
                ? "Necesită atenție pe câteva fișiere."
                : "Erori critice detectate — acțiune urgentă."}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="dh-kpi-divider" />

        {/* Stat: Broken Links */}
        <div className="dh-kpi-stat dh-kpi-stat--red">
          <div className="dh-kpi-stat-icon">
            <Link2 size={18} />
          </div>
          <div className="dh-kpi-stat-body">
            <span className="dh-kpi-stat-number">{loading ? "—" : report?.brokenLinks ?? 0}</span>
            <span className="dh-kpi-stat-name">Link-uri Moarte</span>
            <span className="dh-kpi-stat-desc">Ancore și href-uri 404</span>
          </div>
          {(report?.brokenLinks ?? 0) === 0 && !loading && (
            <CheckCircle2 size={14} className="dh-kpi-ok-icon" />
          )}
        </div>

        {/* Stat: Frontmatter */}
        <div className="dh-kpi-stat dh-kpi-stat--amber">
          <div className="dh-kpi-stat-icon">
            <FileWarning size={18} />
          </div>
          <div className="dh-kpi-stat-body">
            <span className="dh-kpi-stat-number">{loading ? "—" : report?.missingFrontmatter ?? 0}</span>
            <span className="dh-kpi-stat-name">Frontmatter Invalid</span>
            <span className="dh-kpi-stat-desc">Titlu / descriere SEO lipsă</span>
          </div>
          {(report?.missingFrontmatter ?? 0) === 0 && !loading && (
            <CheckCircle2 size={14} className="dh-kpi-ok-icon" />
          )}
        </div>

        {/* Stat: Orphans */}
        <div className="dh-kpi-stat dh-kpi-stat--blue">
          <div className="dh-kpi-stat-icon">
            <FileText size={18} />
          </div>
          <div className="dh-kpi-stat-body">
            <span className="dh-kpi-stat-number">{loading ? "—" : report?.orphanDocs ?? 0}</span>
            <span className="dh-kpi-stat-name">Documente Orfane</span>
            <span className="dh-kpi-stat-desc">Fără referințe din alte pagini</span>
          </div>
          {(report?.orphanDocs ?? 0) === 0 && !loading && (
            <CheckCircle2 size={14} className="dh-kpi-ok-icon" />
          )}
        </div>

        {/* Stat: Total Pages */}
        <div className="dh-kpi-stat dh-kpi-stat--purple">
          <div className="dh-kpi-stat-icon">
            <Activity size={18} />
          </div>
          <div className="dh-kpi-stat-body">
            <span className="dh-kpi-stat-number">{loading ? "—" : report?.totalPages ?? 0}</span>
            <span className="dh-kpi-stat-name">Articole Scanate</span>
            <span className="dh-kpi-stat-desc">Fișiere .md / .mdx analizate</span>
          </div>
        </div>
      </div>

      {/* ── ISSUES PANEL ────────────────────────────────────────────── */}
      <div className="dh-issues-panel">

        {/* Panel toolbar */}
        <div className="dh-issues-toolbar">
          <div className="dh-toolbar-left">
            <div className="dh-issues-title">
              <Filter size={14} className="text-[var(--color-primary)]" />
              <span>Probleme Detectate</span>
              {!loading && (
                <span className="dh-issues-total-badge">{filteredIssues.length}</span>
              )}
            </div>

            <div className="dh-filter-tabs">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  id={`health-filter-${key}`}
                  onClick={() => setFilter(key)}
                  className={`dh-filter-tab${filter === key ? " dh-filter-tab--active" : ""}`}
                >
                  <span>{label}</span>
                  <span className={`dh-filter-count${filter === key ? " dh-filter-count--active" : ""}`}>
                    {filterCounts[key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="dh-toolbar-right">
            <div className="dh-search-wrap">
              <Search size={13} className="dh-search-icon" />
              <input
                type="text"
                id="health-search-input"
                placeholder="Caută fișier, mesaj, detaliu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="dh-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="dh-search-clear"
                  title="Șterge căutarea"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Issue list */}
        <div className="dh-issues-list">

          {/* LOADING */}
          {loading && (
            <div className="dh-loading-state">
              <div className="dh-loading-orb">
                <RefreshCw size={20} className="dh-spin" />
              </div>
              <p className="dh-loading-text">Se analizează {report?.totalPages || 62} articole...</p>
              <p className="dh-loading-sub">Verificare frontmatter, link-uri interne și referințe încrucișate</p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && filteredIssues.length === 0 && (
            <div className="dh-empty-state">
              <div className="dh-empty-orb">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="dh-empty-title">
                {searchQuery
                  ? "Nicio potrivire găsită"
                  : filter !== "all"
                  ? `Nicio problemă de tip „${FILTERS.find(f => f.key === filter)?.label}"`
                  : "Repository 100% curat!"}
              </h3>
              <p className="dh-empty-sub">
                {searchQuery
                  ? "Încearcă alt termen de căutare sau elimină filtrul activ."
                  : "Toate verificările de integritate au trecut cu succes."}
              </p>
            </div>
          )}

          {/* ISSUE CARDS */}
          {!loading && filteredIssues.map((issue, idx) => (
            <div key={idx} className={`dh-issue-row dh-issue-row--${issue.severity}`}>

              {/* Left icon */}
              <div className={`dh-issue-icon-col dh-issue-icon-col--${issue.severity}`}>
                <IssueIcon severity={issue.severity} />
              </div>

              {/* Main content */}
              <div className="dh-issue-content">
                <div className="dh-issue-meta-row">
                  <span className="dh-issue-filepath">{issue.file}</span>
                  {issue.line && (
                    <span className="dh-issue-line-tag">Linia {issue.line}</span>
                  )}
                  <span className={`dh-issue-severity-pill dh-issue-severity-pill--${issue.severity}`}>
                    {issue.severity === "error" ? "EROARE" : issue.severity === "warning" ? "AVERTISMENT" : "INFO"}
                  </span>
                  <span className="dh-issue-type-chip">
                    {issue.type.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="dh-issue-message">{issue.message}</p>

                {issue.detail && (
                  <div className="dh-issue-detail">
                    <span className="dh-issue-detail-label">Detaliu:</span>
                    <code className="dh-issue-detail-code">{issue.detail}</code>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="dh-issue-action-col">
                <Link
                  href={`/admin/content?slug=${encodeURIComponent(issue.slug)}`}
                  className="dh-issue-fix-btn"
                  title="Deschide în Content Studio"
                >
                  <Zap size={12} />
                  <span>Remediază</span>
                  <ExternalLink size={11} />
                </Link>
              </div>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
