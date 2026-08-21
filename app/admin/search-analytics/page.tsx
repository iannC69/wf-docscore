"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  AlertTriangle,
  Zap,
  RefreshCw,
  FileQuestion,
  CheckCircle2,
  Plus,
  BarChart3,
  Clock,
  Hash,
  Wifi,
  Activity,
  ChevronRight,
  X,
} from "lucide-react";

/* ── types ──────────────────────────────────────────────────────────── */
interface TopQueryItem {
  query: string;
  count: number;
  resultCount: number;
}

interface SearchLogItem {
  id: string;
  query: string;
  resultCount: number;
  latencyMs: number;
  timestamp: string;
  ip: string;
}

interface AnalyticsData {
  totalSearches: number;
  missedCount: number;
  missedRate: number;
  avgLatencyMs: string;
  topQueries: TopQueryItem[];
  recentLogs: SearchLogItem[];
  missedLogs: SearchLogItem[];
}

type TabKey = "missed" | "top" | "recent";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "missed", label: "Content Gaps",      icon: <FileQuestion size={13} /> },
  { key: "top",    label: "Top Queries",        icon: <TrendingUp   size={13} /> },
  { key: "recent", label: "Recent Searches",   icon: <Activity     size={13} /> },
];

/* ── latency color ──────────────────────────────────────────────────── */
function latencyClass(ms: number): string {
  if (ms < 20)  return "sa-latency--fast";
  if (ms < 80)  return "sa-latency--ok";
  return "sa-latency--slow";
}

/* ── relative time ──────────────────────────────────────────────────── */
function relTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "chiar acum";
  if (m < 60) return `${m}m în urmă`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h în urmă`;
  return new Date(ts).toLocaleDateString("ro-RO");
}

/* ── component ──────────────────────────────────────────────────────── */
export default function AdminSearchAnalyticsPage() {
  const [data,      setData]      = useState<AnalyticsData | null>(null);
  const [loading,   setLoading]   = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabKey>("missed");
  const [lastRefresh, setLastRefresh] = useState<string>("");

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/search-analytics");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Failed to load search analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, []);

  /* Active table rows */
  const activeRows: SearchLogItem[] | TopQueryItem[] = useMemo(() => {
    if (!data) return [];
    if (activeTab === "missed") return data.missedLogs;
    if (activeTab === "top")    return data.topQueries as any;
    return data.recentLogs;
  }, [data, activeTab]);

  /* Coverage rate */
  const coverageRate = data
    ? Math.max(0, 100 - (data.missedRate ?? 0))
    : 100;

  return (
    <div className="admin-page-container">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="sa-header">
        <div className="sa-header-left">
          <div className="sa-breadcrumb">
            <BarChart3 size={11} />
            <span>DISCOVERY TELEMETRY</span>
            <span className="sa-breadcrumb-sep">/</span>
            <span>SEARCH ANALYTICS</span>
          </div>
          <h1 className="sa-title">Search Telemetry &amp; Content Gap Inspector</h1>
          <p className="sa-subtitle">
            Analizează interogările în timp real, identifică articolele lipsă
            (căutări fără rezultate) și monitorizează latența motorului de căutare.
          </p>
        </div>

        <div className="sa-header-actions">
          {lastRefresh && (
            <div className="sa-last-refresh">
              <Clock size={11} />
              <span>{lastRefresh}</span>
            </div>
          )}
          <button
            type="button"
            id="sa-refresh-btn"
            onClick={loadAnalytics}
            disabled={loading}
            className="sa-refresh-btn"
          >
            <RefreshCw size={13} className={loading ? "sa-spin" : ""} />
            <span>{loading ? "Se încarcă..." : "Refresh Telemetry"}</span>
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ───────────────────────────────────────────────── */}
      <div className="sa-kpi-strip">

        {/* Total searches */}
        <div className="sa-kpi-cell">
          <div className="sa-kpi-icon sa-kpi-icon--purple">
            <Search size={20} />
          </div>
          <div className="sa-kpi-body">
            <span className="sa-kpi-number">{loading ? "—" : (data?.totalSearches ?? 0)}</span>
            <span className="sa-kpi-label">Total Căutări</span>
            <span className="sa-kpi-desc">Interogări indexate</span>
          </div>
        </div>

        <div className="sa-kpi-sep" />

        {/* Coverage Rate */}
        <div className="sa-kpi-cell sa-kpi-cell--coverage">
          <div className="sa-kpi-icon sa-kpi-icon--green">
            <CheckCircle2 size={20} />
          </div>
          <div className="sa-kpi-body">
            <span className="sa-kpi-number sa-kpi-number--green">{loading ? "—" : `${coverageRate.toFixed(0)}%`}</span>
            <span className="sa-kpi-label">Coverage Rate</span>
            <div className="sa-coverage-bar-wrap">
              <div className="sa-coverage-bar">
                <div
                  className="sa-coverage-bar-fill"
                  style={{ width: loading ? "0%" : `${coverageRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sa-kpi-sep" />

        {/* Missed queries */}
        <div className="sa-kpi-cell">
          <div className="sa-kpi-icon sa-kpi-icon--red">
            <AlertTriangle size={20} />
          </div>
          <div className="sa-kpi-body">
            <span className="sa-kpi-number sa-kpi-number--red">{loading ? "—" : (data?.missedCount ?? 0)}</span>
            <span className="sa-kpi-label">Căutări Ratate (0 Rezultate)</span>
            <span className="sa-kpi-desc">
              {loading ? "—" : `${data?.missedRate ?? 0}% miss rate · Oportunități noi`}
            </span>
          </div>
        </div>

        <div className="sa-kpi-sep" />

        {/* Avg latency */}
        <div className="sa-kpi-cell">
          <div className="sa-kpi-icon sa-kpi-icon--cyan">
            <Zap size={20} />
          </div>
          <div className="sa-kpi-body">
            <span className="sa-kpi-number sa-kpi-number--cyan">{loading ? "—" : `${data?.avgLatencyMs ?? 0}ms`}</span>
            <span className="sa-kpi-label">Latență Medie</span>
            <span className="sa-kpi-desc">Viteză motor in-memory</span>
          </div>
        </div>

        <div className="sa-kpi-sep" />

        {/* Top query */}
        <div className="sa-kpi-cell">
          <div className="sa-kpi-icon sa-kpi-icon--amber">
            <TrendingUp size={20} />
          </div>
          <div className="sa-kpi-body">
            <span className="sa-kpi-number sa-kpi-number--sm">
              {loading ? "—" : (data?.topQueries?.[0]?.count ?? 0)}
            </span>
            <span className="sa-kpi-label">Top Interogare</span>
            <span className="sa-kpi-desc sa-kpi-desc--query">
              {data?.topQueries?.[0]?.query ? `"${data.topQueries[0].query}"` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN PANEL ──────────────────────────────────────────────── */}
      <div className="sa-panel">

        {/* Panel header with tabs */}
        <div className="sa-panel-toolbar">
          <div className="sa-panel-title">
            <Activity size={14} className="sa-panel-title-icon" />
            <span>Query Stream</span>
            {!loading && (
              <span className="sa-panel-count">
                {activeTab === "missed" ? data?.missedCount ?? 0
                  : activeTab === "top"    ? data?.topQueries?.length ?? 0
                  : data?.recentLogs?.length ?? 0}
              </span>
            )}
          </div>

          <div className="sa-tab-group">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                id={`sa-tab-${key}`}
                onClick={() => setActiveTab(key)}
                className={`sa-tab${activeTab === key ? " sa-tab--active" : ""}`}
              >
                {icon}
                <span>{label}</span>
                {key === "missed" && (data?.missedCount ?? 0) > 0 && (
                  <span className="sa-tab-alert">{data!.missedCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div className="sa-loading">
            <div className="sa-loading-orb">
              <RefreshCw size={20} className="sa-spin" />
            </div>
            <p className="sa-loading-text">Se încarcă telemetria de căutare...</p>
          </div>
        )}

        {/* ── MISSED CONTENT GAPS ── */}
        {!loading && activeTab === "missed" && (
          <>
            {(!data?.missedLogs || data.missedLogs.length === 0) ? (
              <div className="sa-empty">
                <div className="sa-empty-orb sa-empty-orb--green">
                  <CheckCircle2 size={26} />
                </div>
                <p className="sa-empty-title">Nicio căutare ratată!</p>
                <p className="sa-empty-sub">Acoperirea documentației este optimă. Toate interogările returnează rezultate.</p>
              </div>
            ) : (
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th><Hash size={12} /> Interogare Ratată (0 Rezultate)</th>
                      <th><Clock size={12} /> Timestamp</th>
                      <th><Wifi size={12} /> IP</th>
                      <th><Zap size={12} /> Latență</th>
                      <th>Acțiune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.missedLogs.map((log) => (
                      <tr key={log.id} className="sa-table-row sa-table-row--missed">
                        <td>
                          <div className="sa-query-cell">
                            <div className="sa-query-dot sa-query-dot--missed" />
                            <span className="sa-query-missed">"{log.query}"</span>
                          </div>
                        </td>
                        <td>
                          <div className="sa-time-cell">
                            <span className="sa-time-rel">{relTime(log.timestamp)}</span>
                            <span className="sa-time-abs">{new Date(log.timestamp).toLocaleString("ro-RO")}</span>
                          </div>
                        </td>
                        <td>
                          <code className="sa-ip-chip">{log.ip}</code>
                        </td>
                        <td>
                          <span className={`sa-latency-pill ${latencyClass(log.latencyMs)}`}>
                            {log.latencyMs}ms
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/admin/content?newDoc=true&slug=${encodeURIComponent(
                              log.query.toLowerCase().replace(/[^a-z0-9-_]/g, "-")
                            )}&title=${encodeURIComponent(log.query)}&category=informatii`}
                            className="sa-create-btn"
                          >
                            <Plus size={11} />
                            <span>Creează Doc</span>
                            <ChevronRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── TOP QUERIES ── */}
        {!loading && activeTab === "top" && (
          <>
            {(!data?.topQueries || data.topQueries.length === 0) ? (
              <div className="sa-empty">
                <div className="sa-empty-orb">
                  <TrendingUp size={26} />
                </div>
                <p className="sa-empty-title">Nicio interogare înregistrată încă.</p>
                <p className="sa-empty-sub">Top-ul se va popula automat pe măsură ce utilizatorii caută în docs.</p>
              </div>
            ) : (
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th><Search size={12} /> Interogare</th>
                      <th><BarChart3 size={12} /> Total Căutări</th>
                      <th><Hash size={12} /> Rezultate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topQueries.map((item, idx) => (
                      <tr key={idx} className="sa-table-row">
                        <td>
                          <span className="sa-rank-badge">#{idx + 1}</span>
                        </td>
                        <td>
                          <div className="sa-query-cell">
                            <div className={`sa-query-dot ${item.resultCount > 0 ? "sa-query-dot--ok" : "sa-query-dot--missed"}`} />
                            <span className="sa-query-text">"{item.query}"</span>
                          </div>
                        </td>
                        <td>
                          <div className="sa-count-cell">
                            <span className="sa-count-bar-bg">
                              <span
                                className="sa-count-bar-fill"
                                style={{
                                  width: `${Math.min(100, (item.count / (data.topQueries[0]?.count || 1)) * 100)}%`
                                }}
                              />
                            </span>
                            <span className="sa-count-num">{item.count}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`sa-result-pill ${item.resultCount > 0 ? "sa-result-pill--covered" : "sa-result-pill--missing"}`}>
                            {item.resultCount} {item.resultCount === 1 ? "articol" : "articole"}
                          </span>
                        </td>
                        <td>
                          {item.resultCount > 0 ? (
                            <span className="sa-status-pill sa-status-pill--covered">
                              <CheckCircle2 size={10} />
                              Acoperit
                            </span>
                          ) : (
                            <span className="sa-status-pill sa-status-pill--missing">
                              <AlertTriangle size={10} />
                              Lipsă Doc
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── RECENT SEARCHES ── */}
        {!loading && activeTab === "recent" && (
          <>
            {(!data?.recentLogs || data.recentLogs.length === 0) ? (
              <div className="sa-empty">
                <div className="sa-empty-orb">
                  <Activity size={26} />
                </div>
                <p className="sa-empty-title">Nicio căutare recentă înregistrată.</p>
                <p className="sa-empty-sub">Activitatea de căutare va apărea imediat ce utilizatorii caută în platformă.</p>
              </div>
            ) : (
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th><Clock size={12} /> Timp</th>
                      <th><Search size={12} /> Interogare</th>
                      <th><Hash size={12} /> Rezultate</th>
                      <th><Zap size={12} /> Latență</th>
                      <th><Wifi size={12} /> IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLogs.map((log) => (
                      <tr key={log.id} className="sa-table-row">
                        <td>
                          <div className="sa-time-cell">
                            <span className="sa-time-rel">{relTime(log.timestamp)}</span>
                            <span className="sa-time-abs">
                              {new Date(log.timestamp).toLocaleTimeString("ro-RO")}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="sa-query-cell">
                            <div className={`sa-query-dot ${log.resultCount > 0 ? "sa-query-dot--ok" : "sa-query-dot--missed"}`} />
                            <span className="sa-query-text">"{log.query}"</span>
                          </div>
                        </td>
                        <td>
                          {log.resultCount > 0 ? (
                            <span className="sa-result-pill sa-result-pill--covered">
                              {log.resultCount} docs
                            </span>
                          ) : (
                            <span className="sa-result-pill sa-result-pill--missing">
                              0 docs
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`sa-latency-pill ${latencyClass(log.latencyMs)}`}>
                            {log.latencyMs}ms
                          </span>
                        </td>
                        <td>
                          <code className="sa-ip-chip">{log.ip}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
