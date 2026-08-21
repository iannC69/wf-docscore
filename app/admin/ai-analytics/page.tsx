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
  Sparkles,
  Play,
  Terminal,
  FileCode,
  Check,
  Folder,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import type { AiTelemetrySummary, AiInteractionLog } from "@/lib/security/aiTelemetry";

// Gemini 2.5 Flash Lite Free Tier Limits
const FREE_TIER_RPD_LIMIT = 1500; // Requests per day
const FREE_TIER_RPM_LIMIT = 15;   // Requests per minute
const CONTEXT_WINDOW_LIMIT = 1048576; // 1M tokens

interface KnowledgeDoc {
  path: string;
  title: string;
  category: string;
  charCount: number;
  estTokens: number;
  lastModified: string;
}

interface KnowledgeBaseData {
  docCount: number;
  totalChars: number;
  totalTokens: number;
  generatedAt: string;
  docs: KnowledgeDoc[];
}

interface FullTelemetryData extends AiTelemetrySummary {
  knowledgeBase?: KnowledgeBaseData;
}

export default function AdminAiAnalyticsPage() {
  const [data, setData] = useState<FullTelemetryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(10);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error" | "rate_limited" | "helpful" | "unhelpful">("all");
  const [purgeLoading, setPurgeLoading] = useState<boolean>(false);

  // Knowledge Explorer State
  const [kbCategoryFilter, setKbCategoryFilter] = useState<string>("all");
  const [kbSearchFilter, setKbSearchFilter] = useState<string>("");
  const [rebuildLoading, setRebuildLoading] = useState<boolean>(false);
  const [rebuildMsg, setRebuildMsg] = useState<string | null>(null);

  // Sandbox State
  const [sandboxPrompt, setSandboxPrompt] = useState<string>("Care sunt cerințele minime pentru a aplica ca Helper?");
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<{
    success: boolean;
    answer?: string;
    error?: string;
    latencyMs?: number;
    model?: string;
    usage?: { promptTokens: number; candidatesTokens: number; totalTokens: number };
  } | null>(null);

  const loadAnalytics = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-analytics");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json: FullTelemetryData = await res.json();
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

  const handleRebuildContext = async () => {
    setRebuildLoading(true);
    setRebuildMsg(null);
    try {
      const res = await fetch("/api/admin/ai-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rebuild_context" }),
      });
      const json = await res.json();
      if (json.success) {
        setRebuildMsg(json.message);
        await loadAnalytics(false);
        setTimeout(() => setRebuildMsg(null), 4000);
      }
    } catch (e: any) {
      setRebuildMsg("Eroare la recompilare index.");
    } finally {
      setRebuildLoading(false);
    }
  };

  const handleRunSandbox = async () => {
    if (!sandboxPrompt.trim() || sandboxLoading) return;
    setSandboxLoading(true);
    setSandboxResult(null);
    try {
      const res = await fetch("/api/admin/ai-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_prompt", prompt: sandboxPrompt }),
      });
      const json = await res.json();
      setSandboxResult(json);
      // Reload logs in background
      loadAnalytics(false);
    } catch (e: any) {
      setSandboxResult({
        success: false,
        error: e?.message || "Eroare la execuția testului sandbox",
      });
    } finally {
      setSandboxLoading(false);
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
        statusFilter === "all"
          ? true
          : statusFilter === "helpful"
          ? log.feedback === "helpful"
          : statusFilter === "unhelpful"
          ? log.feedback === "unhelpful"
          : log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data?.recentLogs, searchFilter, statusFilter]);

  const filteredKbDocs = useMemo(() => {
    if (!data?.knowledgeBase?.docs) return [];
    return data.knowledgeBase.docs.filter((doc) => {
      const matchesCat = kbCategoryFilter === "all" || doc.category.toLowerCase() === kbCategoryFilter.toLowerCase();
      const matchesSearch =
        !kbSearchFilter ||
        doc.title.toLowerCase().includes(kbSearchFilter.toLowerCase()) ||
        doc.path.toLowerCase().includes(kbSearchFilter.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [data?.knowledgeBase?.docs, kbCategoryFilter, kbSearchFilter]);

  // Quota Calculations
  const todayQueries = data?.todayQueries || 0;
  const rpdPercent = Math.min(100, Math.round((todayQueries / FREE_TIER_RPD_LIMIT) * 100));
  const remainingToday = Math.max(0, FREE_TIER_RPD_LIMIT - todayQueries);

  const contextTokens = data?.knowledgeBase?.totalTokens || 38000;
  const contextWindowPercent = ((contextTokens / CONTEXT_WINDOW_LIMIT) * 100).toFixed(1);

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-pretitle-tag">
            <Sparkles size={11} className="text-amber-400" />
            <span>INTELLIGENCE & QUOTA CONTROL</span>
          </div>
          <h1 className="admin-page-title">AI Engine Telemetry & Knowledge Inspector</h1>
          <p className="admin-page-desc">
            Monitor real-time Gemini token consumption, remaining API quota, response latencies, inspect grounded documentation knowledge base, and run diagnostic sandbox prompts.
          </p>
        </div>

        <div className="admin-header-actions">
          <div className="admin-sync-pill">
            <span className="admin-sync-dot" />
            <span>Live Sync:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="admin-sync-select"
            >
              <option value="5">Every 5s</option>
              <option value="10">Every 10s</option>
              <option value="30">Every 30s</option>
              <option value="0">Manual</option>
            </select>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            onClick={() => loadAnalytics(true)}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? "admin-spin" : ""} />
            <span>Actualizează</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={handlePurge}
            disabled={purgeLoading || !data?.lifetimeQueries}
          >
            <Trash2 size={13} />
            <span>Reset Telemetry</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Metrics */}
      <div className="admin-metrics-grid">
        <AdminMetricCard
          title="Total Interogări AI"
          value={data ? data.lifetimeQueries.toLocaleString() : "—"}
          change={data ? `${todayQueries} astăzi` : undefined}
          trend="positive"
          subtitle="Interogări procesate prin Gemini"
          icon={Cpu}
        />

        <AdminMetricCard
          title="Satisfacție Răspunsuri"
          value={data ? `${data.satisfactionRate}%` : "100%"}
          change={data ? `${data.totalHelpful} Utile / ${data.totalUnhelpful} Inutile` : undefined}
          trend={data && data.satisfactionRate >= 80 ? "positive" : data && data.satisfactionRate >= 50 ? "neutral" : "down"}
          subtitle="Evaluări înregistrate live"
          icon={ThumbsUp}
        />

        <AdminMetricCard
          title="Consum Total Tokeni"
          value={data ? data.totalTokens.toLocaleString() : "—"}
          change={data ? `${(data.totalTokens / 1000).toFixed(1)}k tokens` : undefined}
          trend="neutral"
          subtitle={`In: ${data ? data.totalPromptTokens.toLocaleString() : 0} | Out: ${data ? data.totalCandidatesTokens.toLocaleString() : 0}`}
          icon={Zap}
        />

        <AdminMetricCard
          title="Cost Estimat (Valoare)"
          value={data ? `$${data.totalCostUsd.toFixed(4)}` : "$0.0000"}
          change="100% Free Tier"
          trend="positive"
          subtitle="Tarif Gemini: $0.075 / $0.30 per 1M"
          icon={DollarSign}
        />

        <AdminMetricCard
          title="Latență Medie Motor"
          value={data ? `${data.avgLatencyMs}ms` : "—"}
          change={data ? `${data.successRate}% Rata Succes` : undefined}
          trend={data && data.successRate >= 90 ? "positive" : "neutral"}
          subtitle="Timp mediu de execuție per request"
          icon={Clock}
        />
      </div>

      {/* Quota & Capacity Overview Cards */}
      <div className="admin-quota-section">
        <div className="admin-section-header">
          <div className="admin-section-title-wrap">
            <div className="admin-section-icon-box admin-section-icon-box--emerald">
              <Gauge size={16} />
            </div>
            <div>
              <span className="admin-section-tag admin-section-tag--emerald">LIVE CAPACITY METRICS</span>
              <h2 className="admin-section-title">Cât mai ai disponibil (Cote & Limite Gemini Free Tier)</h2>
            </div>
          </div>
          <span className="admin-status-pill admin-status-pill--success">
            <CheckCircle2 size={11} />
            <span>COTE ÎN PARAMETRII OPTIMI</span>
          </span>
        </div>

        <div className="admin-quota-grid">
          {/* 1. Daily Requests Card */}
          <div className="admin-quota-card">
            <div className="admin-quota-top">
              <div className="admin-quota-icon-box admin-quota-icon-box--emerald">
                <Flame size={15} className="text-emerald-400" />
              </div>
              <div>
                <div className="admin-quota-title">Cota Zilnică de Cereri</div>
                <div className="admin-quota-sub">Max 1,500 cereri / zi (RPD)</div>
              </div>
              <div className="admin-quota-num">
                {todayQueries} <span className="admin-quota-denom">/ 1500</span>
              </div>
            </div>

            <div className="admin-progress-track">
              <div
                className="admin-progress-bar admin-progress-bar--emerald"
                style={{ width: `${Math.max(2, rpdPercent)}%` }}
              />
            </div>

            <div className="admin-quota-meta">
              <span>{remainingToday.toLocaleString()} cereri rămase astăzi</span>
              <span className="text-emerald-400">{(100 - rpdPercent).toFixed(1)}% disponibil</span>
            </div>
          </div>

          {/* 2. Rate Limit & Token Budget Policy */}
          <div className="admin-quota-card">
            <div className="admin-quota-top">
              <div className="admin-quota-icon-box admin-quota-icon-box--cyan">
                <Zap size={15} className="text-cyan-400" />
              </div>
              <div>
                <div className="admin-quota-title">Buget & Cooldown Client</div>
                <div className="admin-quota-sub">Sliding window rate limiter</div>
              </div>
              <div className="admin-quota-num">
                <span className="admin-perm-tag admin-perm-tag--cyan">180k tok / 3 min</span>
              </div>
            </div>

            <div className="admin-progress-track">
              <div className="admin-progress-bar admin-progress-bar--cyan" style={{ width: "24%" }} />
            </div>

            <div className="admin-quota-meta">
              <span>Max 6 interogări / 3 minute per IP</span>
              <span className="text-cyan-400">Protecție Activă</span>
            </div>
          </div>

          {/* 3. Context Window Size */}
          <div className="admin-quota-card">
            <div className="admin-quota-top">
              <div className="admin-quota-icon-box admin-quota-icon-box--amber">
                <Layers size={15} className="text-amber-400" />
              </div>
              <div>
                <div className="admin-quota-title">Fereastră Context</div>
                <div className="admin-quota-sub">Capacitate max 1,048,576 tokens</div>
              </div>
              <div className="admin-quota-num">
                <span className="admin-perm-tag admin-perm-tag--amber">~{(contextTokens / 1000).toFixed(1)}k / 1M</span>
              </div>
            </div>

            <div className="admin-progress-track">
              <div
                className="admin-progress-bar admin-progress-bar--amber"
                style={{ width: `${Math.max(3, Number(contextWindowPercent))}%` }}
              />
            </div>

            <div className="admin-quota-meta">
              <span>{(CONTEXT_WINDOW_LIMIT - contextTokens).toLocaleString()} tokens liberi per prompt</span>
              <span className="text-amber-400">Doar {contextWindowPercent}% ocupat</span>
            </div>
          </div>

          {/* 4. Billing & Free Tier Status */}
          <div className="admin-quota-card">
            <div className="admin-quota-top">
              <div className="admin-quota-icon-box admin-quota-icon-box--purple">
                <DollarSign size={15} className="text-purple-400" />
              </div>
              <div>
                <div className="admin-quota-title">Buget & Facturare</div>
                <div className="admin-quota-sub">Status Google AI Studio</div>
              </div>
              <div className="admin-quota-num">
                <span className="admin-perm-tag admin-perm-tag--purple">FREE TIER</span>
              </div>
            </div>

            <div className="admin-progress-track">
              <div className="admin-progress-bar admin-progress-bar--purple" style={{ width: "100%" }} />
            </div>

            <div className="admin-quota-meta">
              <span>Cost facturat: $0.00 USD</span>
              <span className="text-purple-400">Nelimitat în cota Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEW: AI Knowledge Base Inspector & Index Explorer ────────── */}
      <div className="admin-panel-card mb-6">
        <div className="admin-panel-header">
          <div className="admin-section-title-wrap">
            <div className="admin-section-icon-box admin-section-icon-box--amber">
              <BookOpen size={16} />
            </div>
            <div>
              <span className="admin-section-tag admin-section-tag--amber">GROUNDED CONTEXT REPO</span>
              <h2 className="admin-section-title">Inspector Cunoștințe & Explorer Documente Indexate</h2>
              <p className="admin-panel-sub">
                Toate cele {data?.knowledgeBase?.docCount || 62} ghiduri oficiale sunt compilate în memorie și furnizate asistentului AI.
              </p>
            </div>
          </div>

          <div className="admin-header-actions">
            {rebuildMsg && (
              <span className="admin-status-pill admin-status-pill--success">
                <Check size={11} />
                <span>{rebuildMsg}</span>
              </span>
            )}
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={handleRebuildContext}
              disabled={rebuildLoading}
              title="Recompilează fișierul ai-context.json"
            >
              <RefreshCw size={13} className={rebuildLoading ? "admin-spin" : ""} />
              <span>Recompilare Index ({data?.knowledgeBase?.docCount || 62} Ghiduri)</span>
            </button>
          </div>
        </div>

        {/* KB Filter & Search Toolbar */}
        <div className="admin-table-toolbar">
          <div className="admin-table-filters">
            {["all", "informatii", "currency", "systems", "market-donatii"].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`admin-filter-pill ${kbCategoryFilter === cat ? "admin-filter-pill--active" : ""}`}
                onClick={() => setKbCategoryFilter(cat)}
              >
                {cat === "all" ? "Toate Categoriile" : cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="admin-table-search">
            <div className="admin-search-input-wrap">
              <Search size={13} className="admin-search-icon" />
              <input
                type="text"
                placeholder="Caută în ghiduri indexate..."
                value={kbSearchFilter}
                onChange={(e) => setKbSearchFilter(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>
        </div>

        {/* KB Table */}
        <div className="admin-table-container max-h-[360px] overflow-y-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titlu Ghid</th>
                <th>Categorie</th>
                <th>Cale Internă</th>
                <th>Caractere</th>
                <th>Tokeni Estimați</th>
              </tr>
            </thead>
            <tbody>
              {filteredKbDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-empty">
                    <p>Nu s-au găsit ghiduri corespunzătoare filtrului.</p>
                  </td>
                </tr>
              ) : (
                filteredKbDocs.map((doc, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="flex items-center gap-2">
                        <BookOpen size={12} className="text-amber-400/70" />
                        <span className="font-semibold text-white">{doc.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-perm-tag admin-perm-tag--emerald">
                        {doc.category}
                      </span>
                    </td>
                    <td className="admin-table-mono admin-table-muted">/docs/{doc.path.replace(/\.md$/, "")}</td>
                    <td className="admin-table-mono">{doc.charCount.toLocaleString()} chars</td>
                    <td className="admin-table-mono text-amber-400">~{doc.estTokens.toLocaleString()} tokens</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── NEW: AI Sandbox & Diagnostic Prompt Tester ───────────────── */}
      <div className="admin-panel-card mb-6">
        <div className="admin-panel-header">
          <div className="admin-section-title-wrap">
            <div className="admin-section-icon-box admin-section-icon-box--cyan">
              <Terminal size={16} />
            </div>
            <div>
              <span className="admin-section-tag admin-section-tag--cyan">PROMPT DIAGNOSTICS & LATENCY</span>
              <h2 className="admin-section-title">AI Sandbox & Prompt Diagnostic Tester</h2>
              <p className="admin-panel-sub">
                Testează răspunsurile asistentului în timp real și măsoară latența, consumul de tokeni și împământarea documentației.
              </p>
            </div>
          </div>
        </div>

        <div className="admin-sandbox-body">
          {/* Quick Preset Chips */}
          <div className="admin-sandbox-presets">
            <span className="admin-sandbox-presets-label">Întrebări Test Rapide:</span>
            {[
              "Care sunt cerințele minime pentru Helper?",
              "Ce beneficii oferă gradul VIP Mythic?",
              "Cum funcționează comanda !mvp pe server?",
              "Câte Phoenix Coins primesc la donație?",
            ].map((q, qIdx) => (
              <button
                key={qIdx}
                type="button"
                className="admin-sandbox-preset-btn"
                onClick={() => setSandboxPrompt(q)}
              >
                <Sparkles size={11} className="text-cyan-400" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          <div className="admin-sandbox-form">
            <div className="admin-sandbox-textarea-wrap">
              <textarea
                className="admin-sandbox-textarea"
                placeholder="Scrie o întrebare de test pentru asistentul AI..."
                value={sandboxPrompt}
                onChange={(e) => setSandboxPrompt(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="admin-sandbox-submit-btn"
              onClick={handleRunSandbox}
              disabled={sandboxLoading || !sandboxPrompt.trim()}
            >
              {sandboxLoading ? (
                <>
                  <RefreshCw size={14} className="admin-spin" />
                  <span>Rulează...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Execută Sandbox</span>
                </>
              )}
            </button>
          </div>

          {/* Sandbox Result View */}
          {sandboxResult && (
            <div className="admin-sandbox-result-card">
              <div className="admin-sandbox-result-header">
                <div className="admin-sandbox-result-badges">
                  <span
                    className={`admin-status-pill ${
                      sandboxResult.success
                        ? "admin-status-pill--success"
                        : "admin-status-pill--danger"
                    }`}
                  >
                    {sandboxResult.success ? (
                      <CheckCircle2 size={11} />
                    ) : (
                      <AlertCircle size={11} />
                    )}
                    <span>
                      {sandboxResult.success ? "DIAGNOSTIC REUȘIT" : "EROARE EXECUTARE"}
                    </span>
                  </span>
                  {sandboxResult.model && (
                    <span className="admin-perm-tag admin-perm-tag--cyan">
                      {sandboxResult.model}
                    </span>
                  )}
                </div>

                <div className="admin-sandbox-result-meta">
                  {sandboxResult.latencyMs !== undefined && (
                    <span>
                      Latență: <strong className="text-white">{sandboxResult.latencyMs}ms</strong>
                    </span>
                  )}
                  {sandboxResult.usage && (
                    <span>
                      Tokeni:{" "}
                      <strong className="text-amber-400">
                        {sandboxResult.usage.totalTokens.toLocaleString()}
                      </strong>{" "}
                      ({sandboxResult.usage.promptTokens.toLocaleString()} in /{" "}
                      {sandboxResult.usage.candidatesTokens.toLocaleString()} out)
                    </span>
                  )}
                </div>
              </div>

              {sandboxResult.success && sandboxResult.answer && (
                <div className="admin-sandbox-result-content">
                  {sandboxResult.answer}
                </div>
              )}

              {!sandboxResult.success && sandboxResult.error && (
                <div className="admin-sandbox-result-error">
                  {sandboxResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live AI Logs Audit Table */}
      <div className="admin-panel-card">
        <div className="admin-panel-header">
          <div className="admin-section-title-wrap">
            <div className="admin-section-icon-box admin-section-icon-box--orange">
              <Activity size={16} />
            </div>
            <div>
              <span className="admin-section-tag admin-section-tag--orange">REAL-TIME AUDIT LOGS</span>
              <h2 className="admin-section-title">Istoric Interogări AI & Audit Live</h2>
              <p className="admin-panel-sub">
                Ultimele 100 de interogări procesate, statusul de execuție, consumul de tokeni și IP-ul clientului.
              </p>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="admin-table-toolbar">
          <div className="admin-table-filters">
            <button
              type="button"
              className={`admin-filter-pill ${statusFilter === "all" ? "admin-filter-pill--active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              Toate ({data?.recentLogs.length || 0})
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${statusFilter === "success" ? "admin-filter-pill--active" : ""}`}
              onClick={() => setStatusFilter("success")}
            >
              Succes
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${statusFilter === "helpful" ? "admin-filter-pill--active" : ""}`}
              onClick={() => setStatusFilter("helpful")}
            >
              <ThumbsUp size={11} className="text-emerald-400" />
              <span>Utile ({data?.recentLogs.filter((l) => l.feedback === "helpful").length || 0})</span>
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${statusFilter === "unhelpful" ? "admin-filter-pill--active" : ""}`}
              onClick={() => setStatusFilter("unhelpful")}
            >
              <ThumbsDown size={11} className="text-rose-400" />
              <span>Inutile ({data?.recentLogs.filter((l) => l.feedback === "unhelpful").length || 0})</span>
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${statusFilter === "error" ? "admin-filter-pill--active" : ""}`}
              onClick={() => setStatusFilter("error")}
            >
              Erori
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${statusFilter === "rate_limited" ? "admin-filter-pill--active" : ""}`}
              onClick={() => setStatusFilter("rate_limited")}
            >
              Limited
            </button>
          </div>

          <div className="admin-table-search">
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
                <th>Feedback</th>
                <th>Latență</th>
                <th>Tokeni (In / Out / Tot)</th>
                <th>Cost Estimat</th>
                <th>IP Client</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-table-empty">
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
                      <td>
                        {log.feedback === "helpful" && (
                          <span className="admin-status-pill admin-status-pill--success" title="Utilizatorul a marcat răspunsul ca util">
                            <ThumbsUp size={11} />
                            <span>UTIL</span>
                          </span>
                        )}
                        {log.feedback === "unhelpful" && (
                          <span className="admin-status-pill admin-status-pill--danger" title={log.feedbackReason ? `Motiv: ${log.feedbackReason}` : "Utilizatorul a marcat răspunsul ca nesatisfăcător"}>
                            <ThumbsDown size={11} />
                            <span>INUTIL</span>
                          </span>
                        )}
                        {!log.feedback && (
                          <span className="admin-table-muted text-xs">—</span>
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
