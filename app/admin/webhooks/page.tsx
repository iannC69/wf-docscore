"use client";

import React, { useState, useCallback } from "react";
import {
  Webhook,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  BarChart3,
  Shield,
  Bot,
  Image as ImageIcon,
  Activity,
  Zap,
  RefreshCw,
  ChevronRight,
  Hash,
  Globe,
  Bell,
  Calendar,
  Radio,
} from "lucide-react";

interface WebhookResult {
  id: string;
  name: string;
  status: "success" | "error" | "pending" | "idle";
  message?: string;
  triggeredAt?: string;
  duration?: number;
}

interface WebhookDef {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: "GET" | "POST";
  channel: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  category: "reports" | "security" | "ai" | "system";
}

const WEBHOOKS: WebhookDef[] = [
  {
    id: "daily-digest",
    name: "Raport Zilnic de Trafic",
    description: "Trimite un rezumat complet al traficului de azi: top ghiduri citite, vizualizări totale, întrebări AI și integritate sistem.",
    endpoint: "/api/admin/reports/daily-digest",
    method: "POST",
    channel: "#logs",
    icon: <BarChart3 size={18} />,
    color: "hsl(26 100% 52%)",
    badgeColor: "adx-pill--orange",
    category: "reports",
  },
  {
    id: "security-snapshot",
    name: "Security Snapshot",
    description: "Trimite un raport de securitate live: sesiuni active, stare Panic Lockdown, integritate SHA-256 Audit Chain și ultimele 5 evenimente critice.",
    endpoint: "/api/admin/reports/security-snapshot",
    method: "POST",
    channel: "#logs",
    icon: <Shield size={18} />,
    color: "#ef4444",
    badgeColor: "adx-pill--red",
    category: "security",
  },
  {
    id: "ai-telemetry",
    name: "AI Helper Telemetry",
    description: "Trimite un raport detaliat al performanței AI Helper: cost total USD, tokeni, latență medie, success rate și ultimele query-uri.",
    endpoint: "/api/admin/reports/ai-telemetry",
    method: "POST",
    channel: "#logs",
    icon: <Bot size={18} />,
    color: "#a78bfa",
    badgeColor: "adx-pill--purple",
    category: "ai",
  },
  {
    id: "system-health",
    name: "System Health Check",
    description: "Transmite starea live a serverului: memorie heap/RSS, uptime, versiune platformă și integritate date.",
    endpoint: "/api/admin/reports/system-health",
    method: "POST",
    channel: "#logs",
    icon: <Activity size={18} />,
    color: "#10b981",
    badgeColor: "adx-pill--green",
    category: "system",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  reports: "Rapoarte & Analytics",
  security: "Securitate",
  ai: "AI & Telemetry",
  system: "Sistem",
};

function formatDuration(ms?: number): string {
  if (!ms) return "";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function AdminWebhooksPage() {
  const [results, setResults] = useState<Record<string, WebhookResult>>({});
  const [history, setHistory] = useState<Array<{ id: string; name: string; status: "success" | "error"; time: string; duration: number }>>([]);

  const trigger = useCallback(async (wh: WebhookDef) => {
    setResults((prev) => ({
      ...prev,
      [wh.id]: { id: wh.id, name: wh.name, status: "pending" },
    }));

    const start = Date.now();
    try {
      const res = await fetch(wh.endpoint, { method: wh.method });
      const data = await res.json().catch(() => ({}));
      const duration = Date.now() - start;
      const triggeredAt = new Date().toISOString();

      if (res.ok) {
        setResults((prev) => ({
          ...prev,
          [wh.id]: {
            id: wh.id,
            name: wh.name,
            status: "success",
            message: data.message || "Webhook trimis cu succes.",
            triggeredAt,
            duration,
          },
        }));
        setHistory((prev) => [
          { id: wh.id, name: wh.name, status: "success", time: triggeredAt, duration },
          ...prev.slice(0, 19),
        ]);
      } else {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
    } catch (err: any) {
      const duration = Date.now() - start;
      const triggeredAt = new Date().toISOString();
      setResults((prev) => ({
        ...prev,
        [wh.id]: {
          id: wh.id,
          name: wh.name,
          status: "error",
          message: err.message || "A apărut o eroare la trimiterea webhook-ului.",
          triggeredAt,
          duration,
        },
      }));
      setHistory((prev) => [
        { id: wh.id, name: wh.name, status: "error", time: triggeredAt, duration },
        ...prev.slice(0, 19),
      ]);
    }
  }, []);

  const triggerAll = useCallback(async () => {
    for (const wh of WEBHOOKS) {
      await trigger(wh);
      await new Promise((r) => setTimeout(r, 500));
    }
  }, [trigger]);

  const categories = [...new Set(WEBHOOKS.map((w) => w.category))];

  return (
    <div className="whk-page">
      {/* Hero */}
      <div className="whk-hero">
        <div className="whk-hero-left">
          <div className="whk-hero-tag">
            <Radio size={11} />
            <span>Discord Integration</span>
          </div>
          <h1 className="whk-hero-title">Webhooks &amp; Notificări</h1>
          <p className="whk-hero-sub">
            Trimite rapoarte și notificări manual pe Discord <span className="whk-channel">#logs</span> oricând — fără să aștepți ora automată.
          </p>
        </div>
        <button onClick={triggerAll} className="whk-btn whk-btn--fire-all">
          <Zap size={15} />
          Fire All Webhooks
        </button>
      </div>

      {/* Main Grid */}
      <div className="whk-main">

        {/* Webhook Cards */}
        <div className="whk-cards-col">
          {categories.map((cat) => (
            <div key={cat} className="whk-category-section">
              <div className="whk-category-label">
                <span>{CATEGORY_LABELS[cat]}</span>
              </div>
              <div className="whk-cards">
                {WEBHOOKS.filter((w) => w.category === cat).map((wh) => {
                  const result = results[wh.id];
                  const isPending = result?.status === "pending";
                  const isSuccess = result?.status === "success";
                  const isError = result?.status === "error";

                  return (
                    <div
                      key={wh.id}
                      className={`whk-card ${isSuccess ? "whk-card--success" : isError ? "whk-card--error" : ""}`}
                      style={{ "--wh-color": wh.color } as React.CSSProperties}
                    >
                      <div className="whk-card-accent" />
                      <div className="whk-card-body">
                        <div className="whk-card-header">
                          <div className="whk-card-icon-wrap" style={{ color: wh.color, background: `${wh.color}18`, borderColor: `${wh.color}30` }}>
                            {wh.icon}
                          </div>
                          <div className="whk-card-titles">
                            <h3 className="whk-card-name">{wh.name}</h3>
                            <div className="whk-card-meta">
                              <span className={`adx-pill ${wh.badgeColor}`}>{wh.method}</span>
                              <span className="whk-channel-pill">
                                <Hash size={9} />
                                {wh.channel.replace("#", "")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="whk-card-desc">{wh.description}</p>

                        <div className="whk-card-endpoint">
                          <span className="whk-endpoint-path">{wh.endpoint}</span>
                        </div>

                        {/* Result feedback */}
                        {result && result.status !== "idle" && (
                          <div className={`whk-result ${isSuccess ? "whk-result--success" : isError ? "whk-result--error" : "whk-result--pending"}`}>
                            {isPending ? (
                              <>
                                <Loader2 size={13} className="whk-spin" />
                                <span>Se trimite pe Discord...</span>
                              </>
                            ) : isSuccess ? (
                              <>
                                <CheckCircle2 size={13} />
                                <span>{result.message}</span>
                                <span className="whk-result-time">{formatTime(result.triggeredAt)} · {formatDuration(result.duration)}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={13} />
                                <span>{result.message}</span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="whk-card-footer">
                          <div className="whk-card-footer-info">
                            {result?.triggeredAt && !isPending && (
                              <span className="whk-last-trigger">
                                <Clock size={10} />
                                Ultimul trigger: {formatTime(result.triggeredAt)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => trigger(wh)}
                            disabled={isPending}
                            className="whk-btn whk-btn--trigger"
                            style={{ "--wh-color": wh.color } as React.CSSProperties}
                          >
                            {isPending ? (
                              <><Loader2 size={13} className="whk-spin" /> Trimitere...</>
                            ) : (
                              <><Send size={13} /> Trimite</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: History & Info */}
        <div className="whk-sidebar">

          {/* Discord Info Card */}
          <div className="whk-info-card">
            <div className="whk-info-header">
              <Globe size={14} className="whk-info-icon" />
              <span className="whk-info-title">Configurare Discord</span>
            </div>
            <div className="whk-info-rows">
              <div className="whk-info-row">
                <span className="whk-info-key">Channel</span>
                <span className="whk-info-val whk-channel">#logs</span>
              </div>
              <div className="whk-info-row">
                <span className="whk-info-key">Auto Daily</span>
                <span className="whk-info-val" style={{ color: "#10b981" }}>00:00 / zi</span>
              </div>
              <div className="whk-info-row">
                <span className="whk-info-key">Format</span>
                <span className="whk-info-val">Discord Embeds</span>
              </div>
              <div className="whk-info-row">
                <span className="whk-info-key">Webhook URL</span>
                <span className="whk-info-val" style={{ color: "#10b981" }}>Configurat</span>
              </div>
            </div>
          </div>

          {/* Trigger History */}
          <div className="whk-history-card">
            <div className="whk-info-header">
              <Clock size={14} className="whk-info-icon" />
              <span className="whk-info-title">Istoric Triggere</span>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="whk-clear-btn">
                  <RefreshCw size={10} /> Reset
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="whk-history-empty">
                <Bell size={24} />
                <p>Niciun trigger în această sesiune.</p>
                <span>Apasă &quot;Trimite&quot; pentru a declanșa un webhook.</span>
              </div>
            ) : (
              <div className="whk-history-list">
                {history.map((h, i) => {
                  const wh = WEBHOOKS.find((w) => w.id === h.id);
                  return (
                    <div key={i} className="whk-history-row">
                      <div className={`whk-history-dot ${h.status === "success" ? "whk-dot--green" : "whk-dot--red"}`} />
                      <div className="whk-history-info">
                        <span className="whk-history-name">{h.name}</span>
                        <span className="whk-history-meta">{formatTime(h.time)} · {formatDuration(h.duration)}</span>
                      </div>
                      <span className={`adx-pill ${h.status === "success" ? "adx-pill--green" : "adx-pill--red"}`}>
                        {h.status === "success" ? "OK" : "ERR"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Guide */}
          <div className="whk-guide-card">
            <div className="whk-info-header">
              <Zap size={14} className="whk-info-icon" />
              <span className="whk-info-title">Ghid Rapid</span>
            </div>
            <ul className="whk-guide-list">
              <li><ChevronRight size={10} /> Apasă <strong>Trimite</strong> pe orice card pentru a declanșa acel webhook imediat.</li>
              <li><ChevronRight size={10} /> <strong>Fire All</strong> trimite toate webhook-urile în secvență, la 500ms interval.</li>
              <li><ChevronRight size={10} /> Raportul zilnic se trimite automat la <strong>00:00</strong> în fiecare noapte.</li>
              <li><ChevronRight size={10} /> Toate mesajele sunt livrate pe canalul Discord <span className="whk-channel">#logs</span>.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
