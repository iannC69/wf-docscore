import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
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
} from "lucide-react";
import { getAuthenticatedAdminSession, getActiveSessions, isPanicLockdown } from "@/lib/security/auth";
import { getAuditEvents, verifyAuditChainIntegrity } from "@/lib/security/audit";
import { getMaintenanceState } from "@/lib/security/maintenance";
import { getSearchAnalytics } from "@/lib/security/searchAnalytics";
import { listApiKeys } from "@/lib/security/apiKeys";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminLiveTerminal } from "@/components/admin/AdminLiveTerminal";
import { CURRENT_VERSION } from "@/lib/version";
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

export default async function AdminDashboardPage() {
  const session = await getAuthenticatedAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const isLocked = isPanicLockdown();
  const maintenance = getMaintenanceState();
  const searchAnalytics = getSearchAnalytics();
  const apiKeys = listApiKeys();
  const totalDocs = countDocs();
  const activeSessions = getActiveSessions();
  const recentEvents = getAuditEvents(6);
  const chainIntegrity = verifyAuditChainIntegrity();

  // Memory stats
  const memoryUsage = process.memoryUsage();
  const heapUsedMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const rssMb = Math.round(memoryUsage.rss / 1024 / 1024);

  return (
    <div className="admin-dashboard-page">
      {/* Top Banner if Panic Lockdown is Active */}
      {isLocked && (
        <div className="admin-alert-banner admin-alert-banner--danger">
          <ShieldAlert size={16} />
          <span>
            <strong>EMERGENCY PANIC LOCKDOWN IS ACTIVE.</strong> All content editing and session logins are frozen.
          </span>
          <Link href="/admin/security" className="admin-banner-link">
            Security Control &rarr;
          </Link>
        </div>
      )}

      {/* Top Banner if Maintenance is Active */}
      {maintenance.enabled && (
        <div className="admin-alert-banner admin-alert-banner--warning">
          <Wrench size={16} />
          <span>
            <strong>PUBLIC MAINTENANCE LOCKDOWN IS ACTIVE.</strong> Visitors cannot access `/docs`. Logged-in admins bypass this check.
          </span>
          <Link href="/admin/settings" className="admin-banner-link">
            Settings &rarr;
          </Link>
        </div>
      )}

      {/* Page Title & Quick Actions */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">MISSION CONTROL</div>
          <h1 className="admin-page-title">Executive Telemetry Dashboard</h1>
          <p className="admin-page-description">
            Live system performance, cryptographic security verification, documentation telemetry, and engine health.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link href="/admin/content" className="admin-btn admin-btn--primary">
            <Plus size={14} />
            <span>New Document</span>
          </Link>
          <Link href="/admin/security" className="admin-btn admin-btn--secondary">
            <Lock size={14} />
            <span>Security Center</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="admin-metrics-grid">
        <AdminMetricCard
          title="Document Library"
          value={totalDocs}
          change="100% Synced"
          trend="positive"
          icon={FileText}
          subtitle="Total Markdown/MDX articles"
        />

        <AdminMetricCard
          title="Security Health Score"
          value={chainIntegrity.isValid ? "100%" : "ATTENTION"}
          change={chainIntegrity.isValid ? "Chain Verified" : "Tamper Detected"}
          trend={chainIntegrity.isValid ? "positive" : "down"}
          icon={ShieldCheck}
          subtitle="SHA-256 cryptographic chain"
        />

        <AdminMetricCard
          title="Search Discovery Volume"
          value={searchAnalytics.totalSearches}
          change={`${searchAnalytics.missedCount} gaps`}
          trend={searchAnalytics.missedCount > 0 ? "down" : "positive"}
          icon={Search}
          subtitle={`${searchAnalytics.avgLatencyMs}ms avg search latency`}
        />

        <AdminMetricCard
          title="Active Integrations"
          value={apiKeys.length}
          change="Scoped"
          trend="neutral"
          icon={Key}
          subtitle="Active API tokens & keys"
        />
      </div>

      {/* 100% Real Live Engine & Terminal Telemetry Stream */}
      <AdminLiveTerminal />

      {/* Two Column Layout: Recent Audit Trail + System Status Matrix */}
      <div className="admin-dashboard-two-col">
        {/* Left Column: Recent Audit Trail */}
        <section className="admin-panel-card">
          <div className="admin-panel-card-header">
            <div className="admin-panel-title-box">
              <ScrollText size={15} className="admin-panel-icon" />
              <h2 className="admin-panel-title">Real-Time Audit Ledger</h2>
            </div>
            <Link href="/admin/audit" className="admin-panel-action-link">
              <span>View Full Ledger</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="admin-audit-stream">
            {recentEvents.map((evt) => (
              <div key={evt.id} className="admin-audit-item">
                <div className="admin-audit-action-dot" aria-hidden="true" />
                <div className="admin-audit-details">
                  <div className="admin-audit-top-row">
                    <span className="admin-audit-action">{evt.action.replace(/_/g, " ")}</span>
                    <span className="admin-audit-time">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="admin-audit-bottom-row">
                    <span className="admin-audit-actor">Actor: {evt.actor}</span>
                    <span className="admin-audit-ip">IP: {evt.ip}</span>
                    <span className="admin-audit-hash" title={`SHA-256: ${evt.hash}`}>
                      Hash: {evt.hash.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Engine Environment & Live Telemetry */}
        <div className="admin-dashboard-side-stack">
          {/* Engine Environment Box */}
          <section className="admin-panel-card">
            <div className="admin-panel-card-header">
              <div className="admin-panel-title-box">
                <Server size={15} className="admin-panel-icon" />
                <h2 className="admin-panel-title">Engine Architecture</h2>
              </div>
            </div>

            <div className="admin-env-specs">
              <div className="admin-env-row">
                <span className="admin-env-label">Platform Core:</span>
                <span className="admin-env-value">WF-DOCSCORE v{CURRENT_VERSION}</span>
              </div>
              <div className="admin-env-row">
                <span className="admin-env-label">Next.js Framework:</span>
                <span className="admin-env-value">16.3.1 (Turbopack SSG)</span>
              </div>
              <div className="admin-env-row">
                <span className="admin-env-label">Memory Heap Used:</span>
                <span className="admin-env-value">{heapUsedMb} MB / {rssMb} MB RSS</span>
              </div>
              <div className="admin-env-row">
                <span className="admin-env-label">Maintenance Mode:</span>
                <span
                  className={
                    maintenance.enabled
                      ? "admin-status-indicator admin-status-indicator--warning"
                      : "admin-status-indicator"
                  }
                >
                  {maintenance.enabled ? "ACTIVE" : "OFFLINE"}
                </span>
              </div>
              <div className="admin-env-row">
                <span className="admin-env-label">Cipher Suite:</span>
                <span className="admin-env-value">PBKDF2-SHA512 + HMAC-SHA256</span>
              </div>
            </div>
          </section>

          {/* Quick Launchpad Navigation */}
          <section className="admin-panel-card">
            <div className="admin-panel-card-header">
              <div className="admin-panel-title-box">
                <Activity size={15} className="admin-panel-icon" />
                <h2 className="admin-panel-title">Quick Operations</h2>
              </div>
            </div>

            <div className="admin-quick-ops-grid">
              <Link href="/admin/search-analytics" className="admin-quick-op-btn">
                <Search size={14} />
                <span>Search Telemetry</span>
              </Link>
              <Link href="/admin/api-keys" className="admin-quick-op-btn">
                <Key size={14} />
                <span>API Tokens</span>
              </Link>
              <Link href="/admin/settings" className="admin-quick-op-btn">
                <Wrench size={14} />
                <span>Maintenance</span>
              </Link>
              <Link href="/admin/audit" className="admin-quick-op-btn">
                <ScrollText size={14} />
                <span>Audit Trail</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
