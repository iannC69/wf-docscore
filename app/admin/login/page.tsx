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
  Flame,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Cpu,
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
      {/* Dynamic Aurora Ambient Background Orbs */}
      <div className="admin-login-aurora-bg" aria-hidden="true">
        <div className="admin-aurora-orb admin-aurora-orb--1" />
        <div className="admin-aurora-orb admin-aurora-orb--2" />
        <div className="admin-aurora-grid-overlay" />
      </div>

      <div className="admin-login-card">
        {/* Top Shimmer Beam */}
        <div className="admin-login-shimmer-beam" aria-hidden="true" />

        {/* Header with Official Wildfire Emblem */}
        <div className="admin-login-header">
          <div className="admin-login-brand-icon">
            <div className="admin-brand-icon-glow" aria-hidden="true" />
            <img
              src="/logo.png"
              alt="Wildfire Logo"
              className="admin-login-logo-img"
              width={44}
              height={44}
            />
          </div>

          <div className="admin-login-title-group">
            <h1 className="admin-login-title">WILDFIRE ADMIN</h1>
            <p className="admin-login-subtitle">Fortress Security &amp; Mission Control</p>
          </div>

          <div className="admin-login-status-pills">
            <div className="admin-login-badge">
              <Radio size={10} className="admin-live-pulse-dot" />
              <span>SECURE ACCESS GATEWAY</span>
            </div>
            <div className="admin-login-pill-tag">
              <Cpu size={10} />
              <span>v{CURRENT_VERSION}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="admin-alert-box admin-alert-box--danger" role="alert">
            <ShieldAlert size={16} className="admin-alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          {!requireTwoFactor ? (
            <>
              {/* Username field */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="admin-username">
                  Administrator ID
                </label>
                <div className="admin-input-wrapper">
                  <User size={16} className="admin-input-icon" />
                  <input
                    id="admin-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Introdu ID-ul de admin (ex. iannC69)"
                    className="admin-input-field"
                    autoComplete="username"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Password field with show/hide toggle */}
              <div className="admin-form-group">
                <div className="admin-label-row">
                  <label className="admin-form-label" htmlFor="admin-password">
                    Master Password
                  </label>
                </div>
                <div className="admin-input-wrapper">
                  <LockKeyhole size={16} className="admin-input-icon" />
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
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="admin-totp">
                Cod de Securitate 2FA (TOTP)
              </label>
              <div className="admin-input-wrapper">
                <KeyRound size={16} className="admin-input-icon" />
                <input
                  id="admin-totp"
                  type="text"
                  required
                  maxLength={14}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="Cod 6 cifre sau cheie de backup"
                  className="admin-input-field admin-input-field--totp"
                  autoFocus
                />
              </div>
              <p className="admin-form-help">
                Deschide Google Authenticator, 1Password sau introdu cheia de urgență.
              </p>
            </div>
          )}

          {/* Submit Button */}
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

        {/* Security Seals & Public Docs Link */}
        <div className="admin-login-footer">
          <div className="admin-security-seal">
            <ShieldCheck size={13} className="admin-seal-icon" />
            <span>256-bit Cryptographic Salt &amp; HMAC Protected</span>
          </div>

          <Link href="/docs" className="admin-back-btn">
            <ArrowLeft size={13} />
            <span>Înapoi la Documentația Publică</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
