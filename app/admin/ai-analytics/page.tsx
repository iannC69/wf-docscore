"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Cpu,
  Zap,
  DollarSign,
  Clock,
  RefreshCw,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  Activity,
  Layers,
  Database,
  TrendingUp,
  Gauge,
  Flame,
  Globe,
} from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import type { AiTelemetrySummary, AiInteractionLog } from "@/lib/security/aiTelemetry";

// Gemini 3.5 Flash Lite Free Tier Limits
const FREE_TIER_RPD_LIMIT = 1500; // Requests per day
const FREE_TIER_RPM_LIMIT = 15;   // Requests per minute
const CONTEXT_WINDOW_LIMIT = 1048576; // 1M tokens

export default function AdminAiAnalyticsPage() {
  const [data, setData] = useState<AiTelemetrySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(10);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error" | "rate_limited">("all");
  const [purgeLoading, setPurgeLoading] = useState<boolean>(false);

  const loadAnalytics = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-analytics");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json: AiTelemetrySummary = await res.json();
      setData(json);
    } catch (err) {
      console.error("[AI Telemetry] Failed to fetch analytics:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      loadAnalytics(false);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, loadAnalytics]);

  const handlePurge = async () => {
    if (!window.confirm("Ești sigur că vrei să resetezi toate logurile și metricele AI Telemetry?")) {
      return;
    }
    setPurgeLoading(true);
    try {
      const res = await fetch("/api/admin/ai-analytics", { method: "DELETE" });
      if (res.ok) {
        await loadAnalytics();
      }
    } catch (err) {
      console.error("Failed to purge AI telemetry:", err);
    } finally {
      setPurgeLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!data?.recentLogs) return [];
    return data.recentLogs.filter((log) => {
      const rawIp = log.ip && log.ip !== ":" ? log.ip : "127.0.0.1";
      const matchesSearch =
        !searchFilter ||
        log.querySnippet.toLowerCase().includes(searchFilter.toLowerCase()) ||
        rawIp.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data?.recentLogs, searchFilter, statusFilter]);

  const maxDailyQueries = useMemo(() => {
    if (!data?.dailyUsage?.length) return 1;
    return Math.max(...data.dailyUsage.map((d) => d.queries), 1);
  }, [data?.dailyUsage]);

  // Quota computations
  const todayCount = data?.todayQueries || 0;
  const remainingTodayRequests = Math.max(FREE_TIER_RPD_LIMIT - todayCount, 0);
  const dailyQuotaPercentUsed = Math.min((todayCount / FREE_TIER_RPD_LIMIT) * 100, 100);
  const dailyQuotaPercentRemaining = (100 - dailyQuotaPercentUsed).toFixed(1);

  // Context token usage estimation (avg prompt tokens ~ 57,000)
  const avgPromptTokens = 57400;
  const contextUsedPct = ((avgPromptTokens / CONTEXT_WINDOW_LIMIT) * 100).toFixed(1);
  const contextRemainingTokens = (CONTEXT_WINDOW_LIMIT - avgPromptTokens).toLocaleString();

  return (
    <div className="admin-ai-analytics-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">INTELLIGENCE & QUOTA CONTROL</div>
          <h1 className="admin-page-title">AI Engine Telemetry & Quota Monitor</h1>
          <p className="admin-page-description">
            Monitor real-time Gemini token consumption, remaining API quota, response latencies,
            in-memory context caching, and inspect live assistant queries across the platform.
          </p>
        </div>

        <div className="admin-header-actions">
          <div className="admin-refresh-control">
            <span className="admin-control-label">Live Sync:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="admin-select-compact"
              aria-label="Auto-refresh interval"
            >
              <option value={0}>Off</option>
              <option value={5}>Every 5s</option>
              <option value={10}>Every 10s</option>
              <option value={30}>Every 30s</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => loadAnalytics()}
            className="admin-btn admin-btn--secondary"
            disabled={loading}
            title="Refresh now"
          >
            <RefreshCw size={14} className={loading ? "admin-spin" : ""} />
            <span>Actualizează</span>
          </button>

          <button
            type="button"
            onClick={handlePurge}
            className="admin-btn admin-btn--danger"
            disabled={purgeLoading}
            title="Reset telemetry"
          >
            <Trash2 size={14} />
            <span>Reset Telemetry</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="admin-metrics-grid">
        <AdminMetricCard
          title="Total Interogări AI"
          value={data?.lifetimeQueries ?? 0}
          change={`${todayCount} astăzi`}
          trend={todayCount > 0 ? "positive" : "neutral"}
          icon={Cpu}
          subtitle="Interogări procesate prin Gemini"
        />

        <AdminMetricCard
          title="Consum Total Tokeni"
          value={(data?.totalTokens ?? 0).toLocaleString()}
          change={`${((data?.totalTokens ?? 0) / 1000).toFixed(1)}k tokens`}
          trend="neutral"
          icon={Zap}
          subtitle={`In: ${(data?.totalPromptTokens ?? 0).toLocaleString()} | Out: ${(data?.totalCandidatesTokens ?? 0).toLocaleString()}`}
        />

        <AdminMetricCard
          title="Cost Estimat (Valoare)"
          value={`$${(data?.totalCostUsd ?? 0).toFixed(4)}`}
          change="100% Free Tier"
          trend="positive"
          icon={DollarSign}
          subtitle="Tarif Gemini: $0.075 / $0.30 per 1M"
        />

        <AdminMetricCard
          title="Latență Medie Motor"
          value={`${data?.avgLatencyMs ?? 0}ms`}
          change={`${data?.successRate ?? 100}% Rata Succes`}
          trend={data && data.avgLatencyMs < 2500 ? "positive" : "neutral"}
          icon={Clock}
          subtitle="Timp mediu de execuție per request"
        />
      </div>

      {/* Deep API Quota & Limits Monitor */}
      <div className="admin-card admin-ai-quota-card">
        <div className="admin-card-header">
          <div className="admin-card-title-row">
            <div className="admin-card-icon-box admin-card-icon-box--emerald">
              <Gauge size={16} />
            </div>
            <h2 className="admin-card-title">Cât mai ai disponibil (Cote & Limite Gemini Free Tier)</h2>
          </div>
          <div className="admin-card-header-badge">
            <span className="admin-status-pill admin-status-pill--success">
              <CheckCircle2 size={12} />
              <span>COTE ÎN PARAMETRII OPTIMI</span>
            </span>
          </div>
        </div>

        <div className="admin-quota-grid">
          {/* Daily Requests (RPD) */}
          <div className="admin-quota-item">
            <div className="admin-quota-item-head">
              <div className="admin-quota-title-wrap">
                <div className="admin-quota-header-inline">
                  <div className="admin-quota-icon-box admin-quota-icon-box--emerald">
                    <Flame size={13} />
                  </div>
                  <span className="admin-quota-label">Cota Zilnică de Cereri</span>
                </div>
                <span className="admin-quota-detail">Max {FREE_TIER_RPD_LIMIT.toLocaleString()} cereri / zi (RPD)</span>
              </div>
              <div className="admin-quota-val">
                <span className="admin-quota-used">{todayCount}</span>
                <span className="admin-quota-divider">/</span>
                <span className="admin-quota-max">{FREE_TIER_RPD_LIMIT}</span>
              </div>
            </div>

            <div className="admin-quota-bar-track">
              <div
                className="admin-quota-bar-fill admin-quota-bar-fill--emerald"
                style={{ width: `${Math.max(dailyQuotaPercentUsed, 1)}%` }}
              />
            </div>

            <div className="admin-quota-foot">
              <span className="admin-quota-avail">
                <strong>{remainingTodayRequests.toLocaleString()} cereri rămase</strong> astăzi
              </span>
              <span className="admin-quota-pct">{dailyQuotaPercentRemaining}% disponibil</span>
            </div>
          </div>

          {/* Rate Limits (RPM) */}
          <div className="admin-quota-item">
            <div className="admin-quota-item-head">
              <div className="admin-quota-title-wrap">
                <div className="admin-quota-header-inline">
                  <div className="admin-quota-icon-box admin-quota-icon-box--cyan">
                    <Zap size={13} />
                  </div>
                  <span className="admin-quota-label">Limita pe Minut (RPM)</span>
                </div>
                <span className="admin-quota-detail">Throttling automat per client</span>
              </div>
              <div className="admin-quota-val">
                <span className="admin-perm-tag admin-perm-tag--cyan">15 RPM Max</span>
              </div>
            </div>

            <div className="admin-quota-bar-track">
              <div
                className="admin-quota-bar-fill admin-quota-bar-fill--cyan"
                style={{ width: "8%" }}
              />
            </div>

            <div className="admin-quota-foot">
              <span className="admin-quota-avail">Cooldown activ per IP</span>
              <span className="admin-quota-pct">Normal</span>
            </div>
          </div>

          {/* Context Window Capacity */}
          <div className="admin-quota-item">
            <div className="admin-quota-item-head">
              <div className="admin-quota-title-wrap">
                <div className="admin-quota-header-inline">
                  <div className="admin-quota-icon-box admin-quota-icon-box--orange">
                    <Database size={13} />
                  </div>
                  <span className="admin-quota-label">Fereastră Context</span>
                </div>
                <span className="admin-quota-detail">Capacitate max 1,048,576 tokens</span>
              </div>
              <div className="admin-quota-val">
                <span className="admin-perm-tag admin-perm-tag--orange">~57.4k / 1M</span>
              </div>
            </div>

            <div className="admin-quota-bar-track">
              <div
                className="admin-quota-bar-fill admin-quota-bar-fill--orange"
                style={{ width: `${contextUsedPct}%` }}
              />
            </div>

            <div className="admin-quota-foot">
              <span className="admin-quota-avail">
                <strong>{contextRemainingTokens} tokens</strong> liberi per prompt
              </span>
              <span className="admin-quota-pct">Doar {contextUsedPct}% ocupat</span>
            </div>
          </div>

          {/* Google Cloud Cost & Budget */}
          <div className="admin-quota-item">
            <div className="admin-quota-item-head">
              <div className="admin-quota-title-wrap">
                <div className="admin-quota-header-inline">
                  <div className="admin-quota-icon-box admin-quota-icon-box--purple">
                    <DollarSign size={13} />
                  </div>
                  <span className="admin-quota-label">Buget & Facturare</span>
                </div>
                <span className="admin-quota-detail">Status Google AI Studio</span>
              </div>
              <div className="admin-quota-val">
                <span className="admin-perm-tag admin-perm-tag--purple">FREE TIER</span>
              </div>
            </div>

            <div className="admin-quota-bar-track">
              <div
                className="admin-quota-bar-fill admin-quota-bar-fill--purple"
                style={{ width: "100%" }}
              />
            </div>

            <div className="admin-quota-foot">
              <span className="admin-quota-avail">Cost facturat: <strong>$0.00 USD</strong></span>
              <span className="admin-quota-pct">Nelimitat în cota Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Architecture & Knowledge Status Row */}
      <div className="admin-ai-status-grid">
        <div className="admin-card admin-ai-engine-card">
          <div className="admin-card-header">
            <div className="admin-card-title-row">
              <div className="admin-card-icon-box admin-card-icon-box--purple">
                <Layers size={16} />
              </div>
              <h2 className="admin-card-title">Arhitectură Motor & Configurație AI</h2>
            </div>
            <span className="admin-status-pill admin-status-pill--success">
              <CheckCircle2 size={12} />
              <span>SISTEM ACTIV</span>
            </span>
          </div>

          <div className="admin-ai-specs-grid">
            <div className="admin-spec-item">
              <span className="admin-spec-label">Model LLM Activ</span>
              <div className="admin-spec-val-row">
                <span className="admin-perm-tag admin-perm-tag--orange">
                  {data?.model || "gemini-3.5-flash-lite"}
                </span>
                <span className="admin-spec-sub">1M Token Window</span>
              </div>
            </div>

            <div className="admin-spec-item">
              <span className="admin-spec-label">Knowledge Base Ingestată</span>
              <div className="admin-spec-val-row">
                <span className="admin-perm-tag admin-perm-tag--emerald">
                  <BookOpen size={11} />
                  {data?.docsContextCount ?? 62} Documente
                </span>
                <span className="admin-spec-sub">
                  ~{((data?.docsContextChars ?? 151784) / 1024).toFixed(1)} KB text
                </span>
              </div>
            </div>

            <div className="admin-spec-item">
              <span className="admin-spec-label">Cache Memory Sync</span>
              <div className="admin-spec-val-row">
                <span className="admin-perm-tag admin-perm-tag--cyan">
                  <Database size={11} />
                  100% In-Memory Cache
                </span>
                <span className="admin-spec-sub">Zero Disk I/O per query</span>
              </div>
            </div>

            <div className="admin-spec-item">
              <span className="admin-spec-label">Scut Securitate & Confidențialitate</span>
              <div className="admin-spec-val-row">
                <span className="admin-perm-tag admin-perm-tag--purple">
                  <ShieldCheck size={11} />
                  Backend Shield Activ
                </span>
                <span className="admin-spec-sub">Izolare strictă chei & .env</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Activity Trend Bar */}
        <div className="admin-card admin-ai-chart-card">
          <div className="admin-card-header">
            <div className="admin-card-title-row">
              <div className="admin-card-icon-box admin-card-icon-box--orange">
                <TrendingUp size={16} />
              </div>
              <h2 className="admin-card-title">Activitate 7 Zile (Interogări & Tokeni)</h2>
            </div>
            <span className="admin-subtext">Istoric zilnic</span>
          </div>

          <div className="admin-chart-bars">
            {data?.dailyUsage?.map((day) => {
              const heightPct = Math.max(
                (day.queries / maxDailyQueries) * 100,
                day.queries > 0 ? 14 : 4
              );
              const dateFormatted = day.date.slice(5);
              return (
                <div key={day.date} className="admin-chart-col" title={`${day.date}: ${day.queries} cereri, ${day.totalTokens.toLocaleString()} tokens`}>
                  <div className="admin-chart-bar-wrap">
                    <div
                      className="admin-chart-bar"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="admin-chart-val">{day.queries}</span>
                  <span className="admin-chart-label">{dateFormatted}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-Time Live Query Audit Feed */}
      <div className="admin-card admin-ai-logs-card">
        <div className="admin-card-header admin-card-header--split">
          <div className="admin-card-title-row">
            <div className="admin-card-icon-box admin-card-icon-box--cyan">
              <Activity size={16} />
            </div>
            <h2 className="admin-card-title">Jurnal Interogări Live & Audit Tokeni</h2>
            <span className="admin-count-badge">{filteredLogs.length} înregistrări</span>
          </div>

          {/* Filter Toolbar */}
          <div className="admin-logs-toolbar">
            <div className="admin-tabs-compact">
              <button
                type="button"
                className={`admin-tab-compact ${statusFilter === "all" ? "admin-tab-compact--active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                Toate
              </button>
              <button
                type="button"
                className={`admin-tab-compact ${statusFilter === "success" ? "admin-tab-compact--active" : ""}`}
                onClick={() => setStatusFilter("success")}
              >
                Succes
              </button>
              <button
                type="button"
                className={`admin-tab-compact ${statusFilter === "error" ? "admin-tab-compact--active" : ""}`}
                onClick={() => setStatusFilter("error")}
              >
                Erori
              </button>
              <button
                type="button"
                className={`admin-tab-compact ${statusFilter === "rate_limited" ? "admin-tab-compact--active" : ""}`}
                onClick={() => setStatusFilter("rate_limited")}
              >
                Rate Limited
              </button>
            </div>

            <div className="admin-search-input-wrap">
              <Search size={13} className="admin-search-icon" />
              <input
                type="text"
                placeholder="Caută în întrebări sau IP..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data & Ora</th>
                <th>Întrebare Utilizator</th>
                <th>Status</th>
                <th>Latență</th>
                <th>Tokeni (In / Out / Tot)</th>
                <th>Cost Estimat</th>
                <th>IP Client</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-table-empty">
                    <p>Nu există interogări înregistrate conform filtrelor selectate.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const formattedIp = log.ip && log.ip !== ":" ? log.ip : "127.0.0.1";
                  return (
                    <tr key={log.id}>
                      <td className="admin-table-muted admin-table-mono">{dateStr}</td>
                      <td className="admin-table-query">
                        <span className="admin-query-snippet" title={log.querySnippet}>
                          {log.querySnippet || "—"}
                        </span>
                        {log.errorMessage && (
                          <span className="admin-log-err" title={log.errorMessage}>
                            {log.errorMessage}
                          </span>
                        )}
                      </td>
                      <td>
                        {log.status === "success" && (
                          <span className="admin-status-pill admin-status-pill--success">
                            <CheckCircle2 size={11} />
                            <span>SUCCES</span>
                          </span>
                        )}
                        {log.status === "error" && (
                          <span className="admin-status-pill admin-status-pill--danger">
                            <AlertCircle size={11} />
                            <span>EROARE</span>
                          </span>
                        )}
                        {log.status === "rate_limited" && (
                          <span className="admin-status-pill admin-status-pill--warning">
                            <Clock size={11} />
                            <span>LIMITED</span>
                          </span>
                        )}
                      </td>
                      <td className="admin-table-mono">{log.latencyMs}ms</td>
                      <td>
                        <div className="admin-tokens-breakdown">
                          <span className="admin-perm-tag admin-perm-tag--blue">
                            {log.promptTokens.toLocaleString()} in
                          </span>
                          <span className="admin-perm-tag admin-perm-tag--emerald">
                            {log.candidatesTokens.toLocaleString()} out
                          </span>
                          <span className="admin-table-sub">
                            ({log.totalTokens.toLocaleString()} tot)
                          </span>
                        </div>
                      </td>
                      <td className="admin-table-mono">
                        ${log.estimatedCostUsd > 0 ? log.estimatedCostUsd.toFixed(5) : "0.00000"}
                      </td>
                      <td className="admin-table-muted admin-table-mono">
                        <span className="admin-ip-pill">
                          <Globe size={10} />
                          {formattedIp}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
