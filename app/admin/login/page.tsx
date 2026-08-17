"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  Radio,
  Flame,
} from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="admin-login-card">
        {/* Header with Official Wildfire Logo */}
        <div className="admin-login-header">
          <div className="admin-login-brand-icon">
            <img
              src="/logo.png"
              alt="Wildfire Logo"
              className="admin-login-logo-img"
              width={42}
              height={42}
            />
          </div>
          <h1 className="admin-login-title">WILDFIRE ADMIN</h1>
          <p className="admin-login-subtitle">Fortress Security & Mission Control</p>
          <div className="admin-login-badge">
            <Radio size={10} className="admin-live-pulse-dot" />
            <span>SECURE ACCESS GATEWAY</span>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="admin-alert-box admin-alert-box--danger">
            <ShieldAlert size={16} className="admin-alert-icon" />
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
                  <User size={16} className="admin-input-icon" />
                  <input
                    id="admin-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Introdu ID-ul de admin (ex. iannC)"
                    className="admin-input-field"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="admin-password">
                  Master Password
                </label>
                <div className="admin-input-wrapper">
                  <Lock size={16} className="admin-input-icon" />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introdu parola master"
                    className="admin-input-field"
                    autoComplete="current-password"
                  />
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
                  placeholder="Cod de autentificare din 6 cifre sau cheie de backup"
                  className="admin-input-field font-mono tracking-widest text-center"
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
            className="admin-login-submit-btn"
          >
            <span>
              {loading
                ? "Se autentifică..."
                : requireTwoFactor
                ? "Verifică Codul 2FA"
                : "Sign In to Mission Control"}
            </span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Footer */}
        <div className="admin-login-footer">
          <div className="admin-security-seal">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>256-bit Cryptographic Salt & HMAC Protected</span>
          </div>

          <Link href="/docs" className="admin-back-link">
            &larr; Înapoi la Documentația Publică
          </Link>
        </div>
      </div>
    </div>
  );
}
