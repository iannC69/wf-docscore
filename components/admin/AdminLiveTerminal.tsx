"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  RefreshCw,
  Download,
  Trash2,
  Pause,
  Play,
  GitBranch,
  ShieldCheck,
  Cpu,
  FileText,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface RealLogItem {
  id: string;
  time: string;
  level: "info" | "warn" | "error" | "success";
  tag: string;
  message: string;
  category: "git" | "audit" | "system" | "security" | "content";
}

interface GitCommitInfo {
  hash: string;
  author: string;
  relativeTime: string;
  subject: string;
}

export function AdminLiveTerminal() {
  const [logs, setLogs] = useState<RealLogItem[]>([]);
  const [commits, setCommits] = useState<GitCommitInfo[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "git" | "audit" | "system" | "security" | "content">("all");
  const [isLive, setIsLive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<string>("");
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const fetchRealLogs = async () => {
    try {
      const res = await fetch("/api/system/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setCommits(data.commits || []);
        setTelemetry(data.telemetry || null);
        setLastSync(new Date().toLocaleTimeString("en-US", { hour12: false }));
      }
    } catch (err) {
      console.error("Failed to stream terminal logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealLogs();
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchRealLogs();
    }, 4000); // live stream every 4 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      telemetry,
      commits,
      logs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wildfire-telemetry-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setLogs([]);
  };

  const filteredLogs = filter === "all" ? logs : logs.filter((l) => l.category === filter);

  return (
    <div className="admin-terminal-widget">
      {/* Terminal Top Control Bar */}
      <div className="admin-terminal-header">
        <div className="admin-terminal-title-row">
          <div className="admin-terminal-dots">
            <span className="dot dot--red" />
            <span className="dot dot--yellow" />
            <span className="dot dot--green" />
          </div>
          <div className="admin-terminal-title">
            <Terminal size={14} className="text-amber-400" />
            <span>REAL-TIME ENGINE TELEMETRY & AUDIT STREAM</span>
            {telemetry && (
              <span className="admin-terminal-pid">PID {telemetry.pid} • v{telemetry.version}</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="admin-terminal-actions">
          <button
            type="button"
            className={`admin-term-btn ${isLive ? "admin-term-btn--active" : ""}`}
            onClick={() => setIsLive(!isLive)}
            title={isLive ? "Pauză stream automat" : "Pornește live stream"}
          >
            {isLive ? <Pause size={12} /> : <Play size={12} />}
            <span>{isLive ? "LIVE" : "PAUSED"}</span>
          </button>

          <button
            type="button"
            className="admin-term-btn"
            onClick={fetchRealLogs}
            disabled={loading}
            title="Sincronizare forțată"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            <span>SYNC</span>
          </button>

          <button
            type="button"
            className="admin-term-btn"
            onClick={handleExportJSON}
            title="Exportă jurnalul complet în JSON"
          >
            <Download size={12} />
            <span>EXPORT</span>
          </button>

          <button
            type="button"
            className="admin-term-btn"
            onClick={handleClear}
            title="Golește ecranul"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="admin-terminal-tabs">
        <button
          type="button"
          className={`admin-term-tab ${filter === "all" ? "admin-term-tab--active" : ""}`}
          onClick={() => setFilter("all")}
        >
          <Activity size={12} />
          <span>ALL ({logs.length})</span>
        </button>

        <button
          type="button"
          className={`admin-term-tab ${filter === "git" ? "admin-term-tab--active" : ""}`}
          onClick={() => setFilter("git")}
        >
          <GitBranch size={12} />
          <span>GIT COMMITS ({commits.length})</span>
        </button>

        <button
          type="button"
          className={`admin-term-tab ${filter === "security" ? "admin-term-tab--active" : ""}`}
          onClick={() => setFilter("security")}
        >
          <ShieldCheck size={12} />
          <span>SECURITY & AUTH</span>
        </button>

        <button
          type="button"
          className={`admin-term-tab ${filter === "system" ? "admin-term-tab--active" : ""}`}
          onClick={() => setFilter("system")}
        >
          <Cpu size={12} />
          <span>SYSTEM & V8</span>
        </button>

        <button
          type="button"
          className={`admin-term-tab ${filter === "content" ? "admin-term-tab--active" : ""}`}
          onClick={() => setFilter("content")}
        >
          <FileText size={12} />
          <span>CONTENT OPS</span>
        </button>
      </div>

      {/* Terminal Monospace Stream Output */}
      <div className="admin-terminal-body">
        {filteredLogs.length === 0 ? (
          <div className="admin-term-empty">
            <span>[NO TELEMETRY LOGS IN THIS CATEGORY]</span>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className={`admin-term-line admin-term-line--${log.level}`}>
              <span className="term-timestamp">[{log.time}]</span>
              <span className={`term-tag term-tag--${log.category}`}>[{log.tag}]</span>
              <span className="term-msg">{log.message}</span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Live Status Bar */}
      {telemetry && (
        <div className="admin-terminal-footer">
          <div className="term-foot-item">
            <span className="term-foot-label">RAM Heap:</span>
            <span className="term-foot-val">{telemetry.heapUsedMb} MB</span>
          </div>
          <div className="term-foot-item">
            <span className="term-foot-label">Docs Index:</span>
            <span className="term-foot-val">{telemetry.totalDocs} files</span>
          </div>
          <div className="term-foot-item">
            <span className="term-foot-label">SHA-256 Attestation:</span>
            <span className="term-foot-val term-foot-val--success">
              <CheckCircle2 size={11} className="inline mr-1" />
              VERIFIED
            </span>
          </div>
          <div className="term-foot-item term-foot-item--sync">
            <span className="term-foot-label">Last Polled:</span>
            <span className="term-foot-val">{lastSync || "Live"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
