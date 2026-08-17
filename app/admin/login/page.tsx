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
} from "lucide-react";
import { LiquidBackground } from "@/components/ui/LiquidEffects";

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
        setError(data.message || "Invalid administrator credentials.");
        setLoading(false);
      }
    } catch {
      setError("Network connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Signature Liquid Fire Background */}
      <LiquidBackground />

      <div className="admin-login-card">
        {/* Header with Official Wildfire Logo */}
        <div className="admin-login-header">
          <div className="admin-login-brand-icon">
            <img
              src="/logo.png"
              alt="Wildfire Logo"
              className="admin-login-logo-img"
              width={38}
              height={38}
            />
          </div>
          <h1 className="admin-login-title">WILDFIRE ADMIN</h1>
          <p className="admin-login-subtitle">Fortress Security & Mission Control</p>
          <div className="admin-login-badge">
            <Radio size={11} className="admin-live-pulse-dot" />
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
                  <User size={15} className="admin-input-icon" />
                  <input
                    id="admin-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin ID (e.g. iannC)"
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
                  <Lock size={15} className="admin-input-icon" />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter master password"
                    className="admin-input-field"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="admin-totp">
                Two-Factor Security Code (TOTP)
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
                  placeholder="6-digit authenticator code or backup key"
                  className="admin-input-field"
                  autoFocus
                />
              </div>
              <p className="admin-form-help">
                Open Google Authenticator, 1Password, or enter a backup emergency recovery key.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn--primary admin-btn--block"
          >
            <span>
              {loading
                ? "Authenticating..."
                : requireTwoFactor
                ? "Verify Security Code"
                : "Sign In to Mission Control"}
            </span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Footer */}
        <div className="admin-login-footer">
          <div className="admin-security-seal">
            <ShieldCheck size={13} />
            <span>256-bit Cryptographic Salt & HMAC Protected</span>
          </div>

          <Link href="/docs" className="admin-back-link">
            &larr; Back to Public Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
