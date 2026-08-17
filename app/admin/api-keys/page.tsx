"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  ShieldCheck,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt: string;
  revoked: boolean;
}

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [scope, setScope] = useState<"full_access" | "read_only" | "ci_cd">("read_only");
  const [expiresInDays, setExpiresInDays] = useState<number>(90);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadKeys = async () => {
    try {
      const res = await fetch("/api/admin/api-keys");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (err) {
      console.error("Failed to load API keys", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name,
          scope,
          expiresInDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewlyCreatedToken(data.rawToken);
        setName("");
        loadKeys();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to generate key." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error occurred." });
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", keyId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: "API Key revoked successfully." });
        loadKeys();
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to revoke key." });
    }
  };

  const copyToken = () => {
    if (newlyCreatedToken) {
      navigator.clipboard.writeText(newlyCreatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="admin-api-keys-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">ACCESS INTEGRATIONS</div>
          <h1 className="admin-page-title">API Tokens & Webhook Credentials</h1>
          <p className="admin-page-description">
            Generate and manage cryptographically signed access tokens for CI/CD deployment pipelines, automated doc publishing, and external services.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={() => {
              setShowCreateModal(true);
              setNewlyCreatedToken(null);
            }}
            className="admin-btn admin-btn--primary"
          >
            <Plus size={14} />
            <span>Generate New API Key</span>
          </button>
        </div>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`admin-alert-box ${
            statusMessage.type === "success"
              ? "admin-alert-box--success"
              : "admin-alert-box--danger"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Modal: Generate Token */}
      {showCreateModal && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <Key size={20} className="admin-panel-icon" />
              <h3 className="admin-modal-title">Generate Fortress API Token</h3>
            </div>

            {!newlyCreatedToken ? (
              <form onSubmit={handleCreateKey}>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="key-name">
                    Token Name / Description
                  </label>
                  <input
                    id="key-name"
                    type="text"
                    required
                    placeholder="e.g. GitHub Actions CI Deploy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="admin-input-field"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="key-scope">
                    Access Permission Scope
                  </label>
                  <select
                    id="key-scope"
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    className="admin-select-field"
                  >
                    <option value="read_only">Read-Only (Query & Fetch Docs)</option>
                    <option value="ci_cd">CI/CD Pipeline (Deploy & Invalidate Cache)</option>
                    <option value="full_access">Full Access (Manage Everything)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="key-expiry">
                    Expiration Period
                  </label>
                  <select
                    id="key-expiry"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10))}
                    className="admin-select-field"
                  >
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days (Recommended)</option>
                    <option value={365}>1 Year</option>
                  </select>
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="admin-btn admin-btn--secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn--primary">
                    <ShieldCheck size={14} />
                    <span>Create Token</span>
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="admin-alert-box admin-alert-box--success">
                  <CheckCircle2 size={16} />
                  <span>API Key generated! Copy this token now as you won't be able to see it again.</span>
                </div>

                <div className="admin-totp-secret-box">
                  <div className="admin-totp-secret-row">
                    <code className="admin-totp-secret-code">{newlyCreatedToken}</code>
                    <button
                      type="button"
                      onClick={copyToken}
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copied ? "Copied" : "Copy Token"}</span>
                    </button>
                  </div>
                </div>

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewlyCreatedToken(null);
                    }}
                    className="admin-btn admin-btn--primary"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Directory Card */}
      <section className="admin-panel-card">
        <div className="admin-panel-card-header">
          <div className="admin-panel-title-box">
            <Key size={16} className="admin-panel-icon" />
            <h2 className="admin-panel-title">Active API Tokens ({keys.length})</h2>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Token Prefix</th>
                <th>Description</th>
                <th>Scope</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-table-empty">
                    No active API keys created yet.
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id}>
                    <td>
                      <code className="admin-code-cell">{k.prefix}...</code>
                    </td>
                    <td>
                      <strong className="admin-user-tag">{k.name}</strong>
                    </td>
                    <td>
                      <span className="admin-status-pill">
                        {k.scope.replace("_", " ")}
                      </span>
                    </td>
                    <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td>
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                    </td>
                    <td>{new Date(k.expiresAt).toLocaleDateString()}</td>
                    <td>
                      {k.revoked ? (
                        <span className="admin-status-pill admin-status-pill--danger">
                          Revoked
                        </span>
                      ) : (
                        <span className="admin-status-pill admin-status-pill--success">
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      {!k.revoked && (
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(k.id)}
                          className="admin-btn admin-btn--danger-sm"
                        >
                          Revoke
                        </button>
                      )}
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
