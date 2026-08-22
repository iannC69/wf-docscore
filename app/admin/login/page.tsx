"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LockKeyhole,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  KeyRound,
  Radio,
  Eye,
  EyeOff,
  Loader2,
  Cpu,
  Lock,
  GitCommit,
  Layers,
} from "lucide-react";
import { CURRENT_VERSION } from "@/lib/version";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          totpCode: totpCode || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(data.message);
        setLockoutTimer(data.lockoutRemainingSeconds || 900);
        setLoading(false);
        return;
      }

      if (data.requireTwoFactor) {
        setRequireTwoFactor(true);
        setLoading(false);
        return;
      }

      if (data.success) {
        window.location.href = "/admin";
      } else {
        setError(data.message || "Credențiale de administrator invalide.");
        setLoading(false);
      }
    } catch {
      setError("Eroare de conexiune la rețea. Te rugăm să reîncerci.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Ambient background layers */}
      <div className="admin-login-aurora-bg" aria-hidden="true">
        <div className="admin-aurora-orb admin-aurora-orb--1" />
        <div className="admin-aurora-orb admin-aurora-orb--2" />
        <div className="admin-aurora-orb admin-aurora-orb--3" />
        <div className="admin-aurora-grid-overlay" />
      </div>

      {/* Split-panel login card */}
      <div className="admin-login-split">

        {/* ── LEFT PANEL: Brand Identity ───────────────────────────────── */}
        <div className="admin-login-left-panel">
          <div className="admin-login-left-glow" aria-hidden="true" />

          <div className="admin-login-brand-stack">
            {/* Logo */}
            <div className="admin-login-brand-icon">
              <div className="admin-brand-icon-glow" aria-hidden="true" />
              <img
                src="/logo.png"
                alt="Wildfire Logo"
                className="admin-login-logo-img"
                width={48}
                height={48}
              />
            </div>

            <div>
              <h1 className="admin-login-title">WILDFIRE ADMIN</h1>
              <p className="admin-login-subtitle">Mission Control &amp; Fortress Security</p>
            </div>

            {/* Status badges */}
            <div className="admin-login-status-pills">
              <div className="admin-login-badge">
                <Radio size={9} className="admin-live-pulse-dot" />
                <span>SECURE GATEWAY</span>
              </div>
              <div className="admin-login-pill-tag">
                <Cpu size={9} />
                <span>v{CURRENT_VERSION}</span>
              </div>
            </div>
          </div>

          {/* Left panel feature list */}
          <ul className="admin-login-features" aria-label="Platform capabilities">
            <li className="admin-login-feature-item">
              <span className="admin-login-feature-icon"><Lock size={13} /></span>
              <span>256-bit HMAC & PBKDF2 SHA-512 Auth</span>
            </li>
            <li className="admin-login-feature-item">
              <span className="admin-login-feature-icon"><ShieldCheck size={13} /></span>
              <span>TOTP 2FA & Session Isolation</span>
            </li>
            <li className="admin-login-feature-item">
              <span className="admin-login-feature-icon"><GitCommit size={13} /></span>
              <span>Live Audit Ledger & Geo-IP Logging</span>
            </li>
            <li className="admin-login-feature-item">
              <span className="admin-login-feature-icon"><Layers size={13} /></span>
              <span>Role-Based Permission Isolation</span>
            </li>
          </ul>

          {/* Left panel footer */}
          <div className="admin-login-left-footer">
            <span className="admin-login-left-footer-text">wf-docscore &copy; 2026 Wildfire.ro</span>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="admin-login-divider" aria-hidden="true" />

        {/* ── RIGHT PANEL: Secure Form ─────────────────────────────────── */}
        <div className="admin-login-right-panel">
          {/* Top shimmer accent */}
          <div className="admin-login-shimmer-beam" aria-hidden="true" />

          <div className="admin-login-form-header">
            <h2 className="admin-login-form-title">
              {requireTwoFactor ? "Two-Factor Auth" : "Administrator Sign In"}
            </h2>
            <p className="admin-login-form-desc">
              {requireTwoFactor
                ? "Introdu codul generat de aplicația ta de autentificare."
                : "Acces restricționat. Numai personal autorizat."}
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="admin-alert-box admin-alert-box--danger" role="alert">
              <ShieldAlert size={15} className="admin-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="admin-login-form">
            {!requireTwoFactor ? (
              <>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="admin-username">
                    Administrator ID
                  </label>
                  <div className="admin-input-wrapper">
                    <User size={15} className="admin-input-icon" />
                    <input
                      id="admin-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Introdu ID-ul de admin"
                      className="admin-input-field"
                      autoComplete="username"
                      spellCheck={false}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="admin-password">
                    Master Password
                  </label>
                  <div className="admin-input-wrapper">
                    <LockKeyhole size={15} className="admin-input-icon" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Introdu parola master"
                      className="admin-input-field admin-input-field--password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="admin-password-toggle-btn"
                      title={showPassword ? "Ascunde parola" : "Afișează parola"}
                      aria-label={showPassword ? "Ascunde parola" : "Afișează parola"}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="admin-totp">
                  Cod de Securitate 2FA
                </label>
                <div className="admin-input-wrapper">
                  <KeyRound size={15} className="admin-input-icon" />
                  <input
                    id="admin-totp"
                    type="text"
                    required
                    maxLength={14}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="000 000"
                    className="admin-input-field admin-input-field--totp"
                    autoFocus
                  />
                </div>
                <p className="admin-form-help">
                  Deschide Google Authenticator, 1Password sau introdu cheia de urgență.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`admin-login-submit-btn ${loading ? "admin-login-submit-btn--loading" : ""}`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="admin-spin" />
                  <span>Se autentifică...</span>
                </>
              ) : requireTwoFactor ? (
                <>
                  <span>Verifică Codul 2FA</span>
                  <ArrowRight size={15} />
                </>
              ) : (
                <>
                  <span>Sign In to Mission Control</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="admin-login-footer">
            <div className="admin-security-seal">
              <ShieldCheck size={12} className="admin-seal-icon" />
              <span>End-to-End Encrypted &amp; HMAC Protected</span>
            </div>
            <Link href="/docs" className="admin-back-btn">
              <ArrowLeft size={12} />
              <span>Înapoi la Documentația Publică</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
