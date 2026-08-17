"use client";

import React, { useState, useEffect } from "react";
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
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import type { DocHealthReport, DocHealthIssue } from "@/lib/admin/docHealth";

export default function AdminDocHealthPage() {
  const [report, setReport] = useState<DocHealthReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchHealthReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/health");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("Failed to load health report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthReport();
  }, []);

  const issues = report?.issues || [];

  const filteredIssues = issues.filter((issue) => {
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
  });

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 70) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-red-400 border-red-500/40 bg-red-500/10";
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">DIAGNOSTIC & LINTER MATRIX</div>
          <h1 className="admin-page-title">Inspector de Integritate & Calitate Docs</h1>
          <p className="admin-page-description">
            Scanează în timp real cele {report?.totalPages || 62}+ de articole din repository pentru link-uri moarte, frontmatter lipsă și documente orfane.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={fetchHealthReport}
            disabled={loading}
            className="admin-btn admin-btn--primary"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Se scanează..." : "Rescanează Repository"}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="admin-health-metrics-grid">
        {/* Health Score */}
        <div className="admin-health-card">
          <div className="admin-health-card-header">
            <span className="admin-health-card-label">HEALTH SCORE GLOBAL</span>
            <ShieldCheck size={16} className="text-[var(--color-primary)]" />
          </div>
          <div className="admin-health-score-value">
            <span className={`admin-health-score-pill ${getScoreColorClass(report?.healthScore ?? 100)}`}>
              {report?.healthScore ?? "--"}%
            </span>
            <span className="admin-health-score-subtext">
              {report && report.healthScore >= 90
                ? "Repository în stare excelentă"
                : report && report.healthScore >= 70
                ? "Necesită atenție minoră"
                : "Erori critice detectate"}
            </span>
          </div>
        </div>

        {/* Broken Links */}
        <div className="admin-health-card">
          <div className="admin-health-card-header">
            <span className="admin-health-card-label">LINK-URI MOARTE (404)</span>
            <Link2 size={16} className="text-red-400" />
          </div>
          <div className="admin-health-metric-number text-red-400">
            {report?.brokenLinks ?? 0}
          </div>
          <div className="admin-health-metric-meta">
            {report?.brokenLinks === 0 ? "Toate link-urile interne sunt valide" : "Link-uri către pagini inexistente"}
          </div>
        </div>

        {/* Missing Frontmatter */}
        <div className="admin-health-card">
          <div className="admin-health-card-header">
            <span className="admin-health-card-label">FRONTMATTER INVALID</span>
            <FileWarning size={16} className="text-amber-400" />
          </div>
          <div className="admin-health-metric-number text-amber-400">
            {report?.missingFrontmatter ?? 0}
          </div>
          <div className="admin-health-metric-meta">
            Articole fără titlu sau descriere
          </div>
        </div>

        {/* Orphan Docs */}
        <div className="admin-health-card">
          <div className="admin-health-card-header">
            <span className="admin-health-card-label">DOCUMENTE ORFANE</span>
            <FileText size={16} className="text-blue-400" />
          </div>
          <div className="admin-health-metric-number text-blue-400">
            {report?.orphanDocs ?? 0}
          </div>
          <div className="admin-health-metric-meta">
            Fără trimiteri din alte pagini
          </div>
        </div>
      </div>

      {/* Issues Panel */}
      <div className="admin-health-issues-section">
        <div className="admin-health-issues-header">
          <div className="admin-health-filter-group">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`admin-filter-pill ${filter === "all" ? "admin-filter-pill--active" : ""}`}
            >
              Toate ({issues.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("error")}
              className={`admin-filter-pill ${filter === "error" ? "admin-filter-pill--active" : ""}`}
            >
              Erori ({report?.issuesCount.errors ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setFilter("broken_link")}
              className={`admin-filter-pill ${filter === "broken_link" ? "admin-filter-pill--active" : ""}`}
            >
              Link-uri Moarte ({report?.brokenLinks ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setFilter("warning")}
              className={`admin-filter-pill ${filter === "warning" ? "admin-filter-pill--active" : ""}`}
            >
              Avertismente ({report?.issuesCount.warnings ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setFilter("orphan")}
              className={`admin-filter-pill ${filter === "orphan" ? "admin-filter-pill--active" : ""}`}
            >
              Orfane ({report?.orphanDocs ?? 0})
            </button>
          </div>

          <div className="admin-health-search-box">
            <Search size={14} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Caută în probleme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-health-search-input"
            />
          </div>
        </div>

        {/* Issue Items List */}
        <div className="admin-health-issues-list">
          {loading ? (
            <div className="admin-health-loading">
              <RefreshCw size={24} className="animate-spin text-[var(--color-primary)]" />
              <span>Se analizează cele {report?.totalPages || 62} articole...</span>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="admin-health-empty">
              <CheckCircle2 size={36} className="text-emerald-400 mb-2" />
              <h3 className="text-base font-bold text-white">Nicio problemă detectată!</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Toate regulile de integritate și linter trec cu succes pe filtrul selectat.
              </p>
            </div>
          ) : (
            filteredIssues.map((issue, idx) => (
              <div key={idx} className={`admin-issue-card admin-issue-card--${issue.severity}`}>
                <div className="admin-issue-card-left">
                  <div className="admin-issue-icon-box">
                    {issue.severity === "error" ? (
                      <ShieldAlert size={16} className="text-red-400" />
                    ) : issue.severity === "warning" ? (
                      <AlertTriangle size={16} className="text-amber-400" />
                    ) : (
                      <FileText size={16} className="text-blue-400" />
                    )}
                  </div>

                  <div className="admin-issue-details">
                    <div className="admin-issue-title-row">
                      <span className="admin-issue-file">{issue.file}</span>
                      {issue.line && (
                        <span className="admin-issue-line">Linia {issue.line}</span>
                      )}
                      <span className={`admin-issue-badge admin-issue-badge--${issue.severity}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="admin-issue-type-tag">{issue.type.replace(/_/g, " ")}</span>
                    </div>

                    <p className="admin-issue-message">{issue.message}</p>
                    {issue.detail && (
                      <p className="admin-issue-detail-text">{issue.detail}</p>
                    )}
                  </div>
                </div>

                <div className="admin-issue-card-right">
                  <Link
                    href={`/admin/content?slug=${encodeURIComponent(issue.slug)}`}
                    className="admin-issue-action-btn"
                  >
                    <span>Editează în Studio</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
