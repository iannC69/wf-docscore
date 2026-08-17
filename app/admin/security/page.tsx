"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Users,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

interface SessionInfo {
  sessionId: string;
  username: string;
  role: string;
  ip: string;
  userAgent: string;
  createdAt: number;
  lastActiveAt: number;
}

export default function AdminSecurityPage() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>("");
  const [twoFactorUri, setTwoFactorUri] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [masterPassword, setMasterPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSecurityState = async () => {
    try {
      // 1. Load Sessions
      const sessRes = await fetch("/api/admin/sessions");
      if (sessRes.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const sessData = await sessRes.json();
      setSessions(sessData.sessions || []);
      setCurrentSessionId(sessData.currentSessionId || "");
      if (sessData.currentUser) {
        setCurrentUser(sessData.currentUser);
      }

      // 2. Load 2FA status
      const totpRes = await fetch("/api/admin/auth/totp");
      const totpData = await totpRes.json();
      setTwoFactorEnabled(totpData.enabled || false);
      if (totpData.secret) setTwoFactorSecret(totpData.secret);
      if (totpData.uri) setTwoFactorUri(totpData.uri);
      if (totpData.backupCodes) setBackupCodes(totpData.backupCodes);

      // 3. Load Panic Status
      const panicRes = await fetch("/api/admin/auth/panic");
      const panicData = await panicRes.json();
      setIsLocked(panicData.isLocked || false);
    } catch (err) {
      console.error("Failed to load security state", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityState();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: "Session revoked successfully." });
        loadSecurityState();
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to revoke session." });
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enable",
          secret: twoFactorSecret,
          code: verificationCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: data.message });
        setTwoFactorEnabled(true);
        loadSecurityState();
      } else {
        setStatusMessage({ type: "error", text: data.error });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to verify 2FA code." });
    }
  };

  const handleDisable2FA = async () => {
    try {
      const res = await fetch("/api/admin/auth/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: data.message });
        setTwoFactorEnabled(false);
        loadSecurityState();
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to disable 2FA." });
    }
  };

  const handleTriggerPanic = async () => {
    try {
      const res = await fetch("/api/admin/auth/panic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger" }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/admin/login";
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to trigger panic mode." });
    }
  };

  const handleReleasePanic = async () => {
    try {
      const res = await fetch("/api/admin/auth/panic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release", masterPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: data.message });
        setIsLocked(false);
        setMasterPassword("");
        loadSecurityState();
      } else {
        setStatusMessage({ type: "error", text: data.error });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to release panic mode." });
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(twoFactorSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="admin-security-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">SECURITY COMMAND</div>
          <h1 className="admin-page-title">Access Control & Two-Factor Fortress</h1>
          <p className="admin-page-description">
            Manage active sessions, configure RFC 6238 TOTP two-factor authentication, and monitor panic killswitch protocols.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={loadSecurityState}
            className="admin-btn admin-btn--secondary"
          >
            <RefreshCw size={14} />
            <span>Refresh State</span>
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
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid: 2FA Card + Panic Lockdown Card */}
      <div className="admin-security-grid">
        {/* Two-Factor Authentication Card */}
        <section className="admin-panel-card">
          <div className="admin-panel-card-header">
            <div className="admin-panel-title-box">
              <KeyRound size={16} className="admin-panel-icon" />
              <h2 className="admin-panel-title">Two-Factor Authentication (TOTP)</h2>
            </div>
            <span
              className={`admin-status-pill ${
                twoFactorEnabled
                  ? "admin-status-pill--success"
                  : "admin-status-pill--warning"
              }`}
            >
              {twoFactorEnabled ? "2FA Active" : "2FA Inactive"}
            </span>
          </div>

          <div className="admin-panel-card-body">
            {twoFactorEnabled ? (
              <div className="admin-2fa-active-view">
                <div className="admin-2fa-shield-badge">
                  <ShieldCheck size={28} className="admin-shield-icon" />
                  <div>
                    <h3 className="admin-card-heading">Fortress TOTP is Enabled</h3>
                    <p className="admin-card-text">
                      Your administrator account requires a 6-digit TOTP code on every login.
                    </p>
                  </div>
                </div>

                <div className="admin-backup-codes-box">
                  <h4 className="admin-backup-title">Emergency Recovery Codes</h4>
                  <div className="admin-backup-codes-list">
                    {backupCodes.map((code, idx) => (
                      <span key={idx} className="admin-backup-code-pill">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDisable2FA}
                  className="admin-btn admin-btn--danger-outline"
                >
                  Disable Two-Factor Authentication
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnable2FA} className="admin-2fa-setup-form">
                <p className="admin-card-text">
                  Add an extra layer of security to your admin account using Google Authenticator, 1Password, or Authy.
                </p>

                <div className="admin-totp-secret-box">
                  <span className="admin-totp-label">Provisional Base32 Secret Key:</span>
                  <div className="admin-totp-secret-row">
                    <code className="admin-totp-secret-code">{twoFactorSecret}</code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="verify-totp">
                    Enter 6-Digit Code to Confirm:
                  </label>
                  <input
                    id="verify-totp"
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="e.g. 482910"
                    className="admin-input-field"
                  />
                </div>

                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                >
                  <ShieldCheck size={14} />
                  <span>Verify & Activate 2FA</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Emergency Panic Lockdown Card */}
        <section className="admin-panel-card admin-panel-card--danger">
          <div className="admin-panel-card-header">
            <div className="admin-panel-title-box">
              <ShieldAlert size={16} className="admin-panel-icon admin-panel-icon--danger" />
              <h2 className="admin-panel-title">Panic Lockdown Protocol</h2>
            </div>
            <span
              className={`admin-status-pill ${
                isLocked ? "admin-status-pill--danger" : "admin-status-pill--success"
              }`}
            >
              {isLocked ? "SYSTEM LOCKED" : "ARMED"}
            </span>
          </div>

          <div className="admin-panel-card-body">
            <p className="admin-card-text">
              In the event of a suspected breach, triggering Panic Lockdown will <strong>immediately revoke all active sessions</strong> and suspend all login access until master password override.
            </p>

            {isLocked ? (
              <div className="admin-panic-unlock-box">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="master-pw">
                    Master Password Override to Release Lockdown:
                  </label>
                  <input
                    id="master-pw"
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="Enter master administrator password"
                    className="admin-input-field"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleReleasePanic}
                  className="admin-btn admin-btn--primary"
                >
                  <Unlock size={14} />
                  <span>Release Panic Lockdown</span>
                </button>
              </div>
            ) : currentUser?.isRoot || currentUser?.username?.toLowerCase() === "iannc69" || currentUser?.username?.toLowerCase() === "iannc" ? (
              <button
                type="button"
                onClick={handleTriggerPanic}
                className="admin-btn admin-btn--danger"
              >
                <Lock size={14} />
                <span>Trigger Panic Lockdown Now</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-md text-xs font-mono text-[var(--color-text-tertiary)]">
                <ShieldAlert size={14} className="text-amber-400 flex-shrink-0" />
                <span>Acces Restricționat: Doar Super Administratorul Root (iannC69) poate declanșa Panic Lockdown.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Active Sessions Directory */}
      <section className="admin-panel-card">
        <div className="admin-panel-card-header">
          <div className="admin-panel-title-box">
            <Users size={16} className="admin-panel-icon" />
            <h2 className="admin-panel-title">Active Session Directory ({sessions.length})</h2>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Administrator</th>
                <th>IP Address</th>
                <th>Created</th>
                <th>Last Active</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((sess) => {
                const isCurrent = sess.sessionId === currentSessionId;
                const isTargetRoot =
                  sess.username?.toLowerCase() === "iannc69" ||
                  sess.username?.toLowerCase() === "iannc" ||
                  sess.role === "root_admin";
                const isCurrentRoot =
                  currentUser?.isRoot ||
                  currentUser?.username?.toLowerCase() === "iannc69" ||
                  currentUser?.username?.toLowerCase() === "iannc";

                return (
                  <tr key={sess.sessionId}>
                    <td>
                      <code className="admin-code-cell">{sess.sessionId.slice(0, 16)}...</code>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="admin-user-tag">{sess.username}</span>
                        {isTargetRoot && (
                          <span className="admin-root-badge" title="Root Super Admin (Protejat)">
                            ROOT
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{sess.ip}</td>
                    <td>{new Date(sess.createdAt).toLocaleTimeString()}</td>
                    <td>{new Date(sess.lastActiveAt).toLocaleTimeString()}</td>
                    <td>
                      {isCurrent ? (
                        <span className="admin-status-pill admin-status-pill--success">
                          Current Session
                        </span>
                      ) : (
                        <span className="admin-status-pill">Active</span>
                      )}
                    </td>
                    <td>
                      {isCurrent ? null : isTargetRoot && !isCurrentRoot ? (
                        <span
                          className="admin-status-pill"
                          style={{
                            borderColor: "rgba(245, 158, 11, 0.35)",
                            color: "#f59e0b",
                            background: "rgba(245, 158, 11, 0.08)",
                          }}
                        >
                          PROTEJAT ROOT
                        </span>
                      ) : !isCurrentRoot && !currentUser?.permissions?.canManageSecurity ? (
                        <span className="text-xs text-[var(--color-text-tertiary)] font-mono">Fără Drept</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.sessionId)}
                          className="admin-btn admin-btn--danger-sm"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
