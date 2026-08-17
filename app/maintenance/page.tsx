"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  RefreshCw,
  Server,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Search,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { LiquidBackground } from "@/components/ui/LiquidEffects";
import { CURRENT_VERSION } from "@/lib/version";

const TIMELINE_STEPS = [
  { id: 1, title: "Platform Snapshot", desc: "Configuration backup & state lock", status: "done" },
  { id: 2, title: "Vector Reindexing", desc: "FastVector search optimization", status: "done" },
  { id: 3, title: "Engine Upgrades & ISR", desc: "Static AST page cache propagation", status: "active" },
  { id: 4, title: "Edge Verification", desc: "Final integrity & security handshake", status: "pending" },
];

export default function MaintenancePage() {
  const [logs, setLogs] = useState<{ time: string; tag: string; text: string }[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);
  const [pingLatency, setPingLatency] = useState<number>(0.9);

  const [telemetry, setTelemetry] = useState<{
    heapUsedMb?: number;
    heapTotalMb?: number;
    rssMb?: number;
    uptimeSeconds?: number;
    pid?: number;
    nodeVersion?: string;
    platform?: string;
    totalAuditEvents?: number;
    totalDocs?: number;
  }>({});

  const [settings, setSettings] = useState<{
    message: string;
    estimatedEndTime: string;
  }>({
    message:
      "Wildfire Docs is currently undergoing scheduled platform upgrades and engine optimizations. We'll be back online shortly.",
    estimatedEndTime: "30 minutes",
  });

  const [checking, setChecking] = useState(false);

  const fetchStatus = async () => {
    setChecking(true);
    const start = performance.now();
    try {
      const [settingsRes, logsRes] = await Promise.all([
        fetch("/api/admin/settings").catch(() => null),
        fetch("/api/system/logs").catch(() => null),
      ]);

      const end = performance.now();
      setPingLatency(Math.max(0.4, Number(((end - start) / 10).toFixed(1))));

      if (settingsRes && settingsRes.ok) {
        const data = await settingsRes.json();
        // Auto-reconnect when maintenance ends!
        if (data.maintenance && data.maintenance.enabled === false) {
          window.location.href = "/docs";
          return;
        }
        if (data.maintenance) {
          setSettings({
            message:
              data.maintenance.message ||
              "Wildfire Docs is currently undergoing scheduled platform upgrades and engine optimizations. We'll be back online shortly.",
            estimatedEndTime: data.maintenance.estimatedEndTime || "30 minutes",
          });
        }
      }

      if (logsRes && logsRes.ok) {
        const logData = await logsRes.json();
        if (logData.logs && logData.logs.length > 0) {
          setLogs(logData.logs);
        }
        if (logData.telemetry) {
          setTelemetry(logData.telemetry);
        }
      }
    } catch (err) {
      console.error("Live status poll error:", err);
    } finally {
      setTimeout(() => setChecking(false), 400);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);

    // Secret Admin Shortcut: Ctrl+Shift+A or Alt+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") || (e.altKey && e.key.toLowerCase() === "a")) {
        window.location.href = "/admin/login";
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.time}] [${l.tag}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs =
    activeFilter === "ALL"
      ? logs
      : logs.filter((l) => l.tag.toUpperCase().includes(activeFilter));

  return (
    <div className="maintenance-natural-root">
      {/* Full-viewport organic liquid fire background */}
      <LiquidBackground />

      {/* Floating Top Navigation Header */}
      <header className="maintenance-natural-nav">
        <div className="maintenance-nav-brand">
          <img
            src="/logo.png"
            alt="Wildfire Logo"
            className="maintenance-nav-logo"
            width={24}
            height={24}
          />
          <span className="maintenance-nav-title">Wildfire Docs</span>
          <span className="maintenance-nav-version">v{CURRENT_VERSION}</span>
        </div>

        <div className="maintenance-nav-right">
          <div className="maintenance-ping-indicator">
            <span className="maintenance-ping-dot" />
            <span>Ping: {pingLatency}ms</span>
          </div>

          <div className="maintenance-nav-status">
            <span className="maintenance-beacon-dot" aria-hidden="true" />
            <span>Scheduled Maintenance</span>
          </div>
        </div>
      </header>

      {/* Main Content Area - Open, Natural, Breathing */}
      <main className="maintenance-natural-main">
        {/* Hero Section */}
        <section className="maintenance-hero-section">
          <div className="maintenance-brand-gem">
            <img
              src="/logo.png"
              alt="Wildfire Logo"
              className="maintenance-gem-img"
              width={52}
              height={52}
            />
          </div>

          <h1 className="maintenance-natural-title">
            We&apos;re upgrading the platform
          </h1>
          <p className="maintenance-natural-desc">
            {settings.message}
          </p>

          {/* Progress Bar & Percent */}
          <div className="maintenance-natural-progress-wrap">
            <div className="maintenance-progress-bar-track">
              <div className="maintenance-progress-bar-fill" />
            </div>
            <div className="maintenance-progress-labels">
              <span className="maintenance-progress-status-text">
                <Activity size={13} className="admin-spin" />
                <span>Optimizing cache & engine vectors</span>
              </span>
              <span className="maintenance-progress-pct">94%</span>
            </div>
          </div>
        </section>

        {/* Upgrade Pipeline Stepper (Single Clean Row) */}
        <section className="maintenance-timeline-section">
          <div className="maintenance-timeline-grid">
            {TIMELINE_STEPS.map((step) => (
              <div
                key={step.id}
                className="maintenance-timeline-card"
              >
                <div className="maintenance-timeline-card-header">
                  <div
                    className={`timeline-icon-box ${
                      step.status === "done"
                        ? "timeline-icon-box--emerald"
                        : step.status === "active"
                        ? "timeline-icon-box--amber"
                        : "timeline-icon-box--zinc"
                    }`}
                  >
                    {step.status === "done" ? (
                      <CheckCircle2 size={15} />
                    ) : step.status === "active" ? (
                      <Activity size={15} className="admin-spin" />
                    ) : (
                      <Clock size={15} />
                    )}
                  </div>
                  <span
                    className={`timeline-badge ${
                      step.status === "done"
                        ? "timeline-badge--emerald"
                        : step.status === "active"
                        ? "timeline-badge--amber"
                        : "timeline-badge--zinc"
                    }`}
                  >
                    {step.status === "done"
                      ? "COMPLETED"
                      : step.status === "active"
                      ? "IN PROGRESS"
                      : "QUEUED"}
                  </span>
                </div>
                <div className="maintenance-timeline-body">
                  <h4 className="maintenance-timeline-title">{step.title}</h4>
                  <p className="maintenance-timeline-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real Subsystems Telemetry Grid */}
        <section className="maintenance-subsystems-matrix">
          {/* 1. Search Vector Engine */}
          <div className="subsystem-tile subsystem-tile--amber">
            <div className="subsystem-tile-header">
              <div className="subsystem-icon-box subsystem-icon-box--amber">
                <Search size={15} />
              </div>
              <span className="subsystem-status-tag subsystem-status-tag--amber">Syncing (94%)</span>
            </div>
            <div className="subsystem-tile-body">
              <span className="subsystem-tile-label">Search Vector Index</span>
              <div className="subsystem-tile-val">42 Page Vectors</div>
              <p className="subsystem-tile-sub">FastVector AST index active</p>
            </div>
          </div>

          {/* 2. Markdown Compiler */}
          <div className="subsystem-tile subsystem-tile--cyan">
            <div className="subsystem-tile-header">
              <div className="subsystem-icon-box subsystem-icon-box--cyan">
                <Layers size={15} />
              </div>
              <span className="subsystem-status-tag subsystem-status-tag--cyan">Operational</span>
            </div>
            <div className="subsystem-tile-body">
              <span className="subsystem-tile-label">Markdown Compiler</span>
              <div className="subsystem-tile-val">42 Pre-Built Routes</div>
              <p className="subsystem-tile-sub">ISR Edge cache pre-compiled</p>
            </div>
          </div>

          {/* 3. Fortress Security Core */}
          <div className="subsystem-tile subsystem-tile--emerald">
            <div className="subsystem-tile-header">
              <div className="subsystem-icon-box subsystem-icon-box--emerald">
                <ShieldCheck size={15} />
              </div>
              <span className="subsystem-status-tag subsystem-status-tag--emerald">Protected</span>
            </div>
            <div className="subsystem-tile-body">
              <span className="subsystem-tile-label">Fortress Security Core</span>
              <div className="subsystem-tile-val">
                {telemetry.totalAuditEvents ? `${telemetry.totalAuditEvents} Chained Logs` : "Chained & Valid"}
              </div>
              <p className="subsystem-tile-sub">PBKDF2-SHA512 session lock</p>
            </div>
          </div>

          {/* 4. Node Runtime Engine */}
          <div className="subsystem-tile subsystem-tile--purple">
            <div className="subsystem-tile-header">
              <div className="subsystem-icon-box subsystem-icon-box--purple">
                <Cpu size={15} />
              </div>
              <span className="subsystem-status-tag subsystem-status-tag--purple">Online</span>
            </div>
            <div className="subsystem-tile-body">
              <span className="subsystem-tile-label">Node Runtime Engine</span>
              <div className="subsystem-tile-val">
                {telemetry.heapUsedMb ? `${telemetry.heapUsedMb} MB Heap` : "222 MB Heap"}
              </div>
              <p className="subsystem-tile-sub">
                PID {telemetry.pid || "Active"} • Node {telemetry.nodeVersion || "v24.x"}
              </p>
            </div>
          </div>
        </section>

        {/* Natural Diagnostics Stream & Telemetry Strip */}
        <section className="maintenance-natural-console-section">
          <div className="maintenance-natural-terminal">
            <div className="maintenance-terminal-bar">
              <div className="terminal-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="terminal-title">live.system.stdout</span>

              {/* Filter Tabs */}
              <div className="terminal-filter-tabs">
                {["ALL", "PROC", "V8_MEM", "CHAIN", "STATUS"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFilter(tab)}
                    className={`terminal-tab-btn ${
                      activeFilter === tab ? "terminal-tab-btn--active" : ""
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="terminal-actions">
                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="terminal-copy-btn"
                  title="Copy stdout logs"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <div className="terminal-live-badge">
                  <span className="terminal-dot" /> LIVE
                </div>
              </div>
            </div>

            <div className="maintenance-terminal-lines">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((l, idx) => (
                  <div key={idx} className="maintenance-terminal-line">
                    <span className="terminal-time">{l.time}</span>
                    <span className="terminal-tag">{l.tag}</span>
                    <span className="terminal-msg">{l.text}</span>
                  </div>
                ))
              ) : (
                <div className="maintenance-terminal-line">
                  <span className="terminal-time">--:--:--</span>
                  <span className="terminal-tag">INIT</span>
                  <span className="terminal-msg">Waiting for next engine tick...</span>
                </div>
              )}
            </div>
          </div>

          {/* Open Telemetry Strip */}
          <div className="maintenance-telemetry-strip">
            <div className="telemetry-item">
              <span className="telemetry-label">Runtime Engine</span>
              <span className="telemetry-value">Node {telemetry.nodeVersion || "v24.x"} • PID {telemetry.pid || "Active"}</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">Allocated Heap</span>
              <span className="telemetry-value">{telemetry.heapUsedMb ? `${telemetry.heapUsedMb} MB / ${telemetry.heapTotalMb || 256} MB` : "Active"}</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-label">Estimated Completion</span>
              <span className="telemetry-value telemetry-value--highlight">{settings.estimatedEndTime || "30 minutes"}</span>
            </div>
          </div>
        </section>

        {/* Live Reconnect Indicator */}
        <div className="maintenance-natural-live-reconnect">
          <RefreshCw size={13} className={checking ? "admin-spin" : ""} />
          <span>Auto-reconnect active. This page will automatically redirect to docs once maintenance ends.</span>
        </div>
      </main>

      {/* Natural Minimal Footer with Ecosystem Links */}
      <footer className="maintenance-natural-footer">
        <div className="maintenance-footer-left">
          <span>Wildfire Documentation • v{CURRENT_VERSION}</span>
          <span className="maintenance-footer-sep">•</span>
          <a
            href="https://github.com/iannC69/wf-docscore"
            target="_blank"
            rel="noopener noreferrer"
            className="maintenance-footer-link"
          >
            <span>GitHub Repository</span>
            <ExternalLink size={11} />
          </a>
        </div>

        <div className="maintenance-footer-right">
          <span>Status: Platform Maintenance Mode</span>
        </div>
      </footer>
    </div>
  );
}
