"use client";

import React, { useState, useEffect } from "react";
import {
  ScrollText,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";

interface AuditEventItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  ip: string;
  userAgent?: string;
  details?: Record<string, any>;
  previousHash: string;
  hash: string;
}

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [integrity, setIntegrity] = useState<{ isValid: boolean; totalEvents: number } | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const url = actionFilter
        ? `/api/admin/audit?action=${encodeURIComponent(actionFilter)}`
        : `/api/admin/audit?limit=100`;
      const res = await fetch(url);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setEvents(data.events || []);
      setIntegrity(data.integrity || null);
    } catch (err) {
      console.error("Failed to load audit events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, [actionFilter]);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wildfire-audit-ledger-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-audit-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">AUDIT TRAIL</div>
          <h1 className="admin-page-title">Cryptographic Audit Ledger</h1>
          <p className="admin-page-description">
            Tamper-evident, SHA-256 hash-chained log of all administrative actions, logins, and documentation updates.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={handleExportJSON}
            className="admin-btn admin-btn--secondary"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={loadAuditData}
            className="admin-btn admin-btn--secondary"
          >
            <RefreshCw size={14} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Integrity Badge Banner */}
      {integrity && (
        <div
          className={`admin-alert-banner ${
            integrity.isValid
              ? "admin-alert-banner--success"
              : "admin-alert-banner--danger"
          }`}
        >
          {integrity.isValid ? (
            <ShieldCheck size={18} />
          ) : (
            <ShieldAlert size={18} />
          )}
          <span>
            {integrity.isValid
              ? `Cryptographic Hash Chain Integrity: 100% VERIFIED across ${integrity.totalEvents} events.`
              : `CRITICAL ALERT: Audit ledger tampering detected! Hash chain mismatch.`}
          </span>
        </div>
      )}

      {/* Audit Table Card */}
      <section className="admin-panel-card">
        <div className="admin-panel-card-header">
          <div className="admin-panel-title-box">
            <ScrollText size={16} className="admin-panel-icon" />
            <h2 className="admin-panel-title">Event Ledger ({events.length})</h2>
          </div>

          <div className="admin-filter-box">
            <Filter size={13} className="admin-filter-icon" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="admin-select-field"
            >
              <option value="">All Event Actions</option>
              <option value="AUTH_LOGIN_SUCCESS">AUTH_LOGIN_SUCCESS</option>
              <option value="AUTH_LOGIN_FAILURE">AUTH_LOGIN_FAILURE</option>
              <option value="AUTH_LOGOUT">AUTH_LOGOUT</option>
              <option value="DOC_CREATE">DOC_CREATE</option>
              <option value="DOC_UPDATE">DOC_UPDATE</option>
              <option value="AUTH_2FA_ENABLED">AUTH_2FA_ENABLED</option>
              <option value="SESSION_REVOKED">SESSION_REVOKED</option>
              <option value="PANIC_LOCKDOWN_TRIGGERED">PANIC_LOCKDOWN_TRIGGERED</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Actor</th>
                <th>IP Address</th>
                <th>SHA-256 Hash</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table-empty">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id}>
                    <td className="admin-table-time">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className="admin-action-pill">
                        {evt.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <span className="admin-user-tag">{evt.actor}</span>
                    </td>
                    <td>{evt.ip}</td>
                    <td>
                      <code
                        className="admin-code-cell"
                        title={`Full SHA-256: ${evt.hash}\nPrevious Hash: ${evt.previousHash}`}
                      >
                        {evt.hash.slice(0, 12)}...
                      </code>
                    </td>
                    <td>
                      <span className="admin-details-json">
                        {JSON.stringify(evt.details || {})}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
