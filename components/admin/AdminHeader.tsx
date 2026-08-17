"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Flame,
  ArrowUpRight,
  Lock,
  Radio,
  Wrench,
} from "lucide-react";

interface AdminHeaderProps {
  username?: string;
  role?: string;
  isPanicLocked?: boolean;
}

export function AdminHeader({
  username = "admin",
  role = "super_admin",
  isPanicLocked = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [panicModalOpen, setPanicModalOpen] = useState(false);
  const [panicError, setPanicError] = useState("");
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const res = await fetch("/api/admin/maintenance");
        const data = await res.json();
        setIsMaintenance(data.enabled || false);
      } catch {}
    }
    checkMaintenance();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      setLoggingOut(false);
    }
  };

  const handleTriggerPanic = async () => {
    setPanicError("");
    try {
      const res = await fetch("/api/admin/auth/panic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger" }),
      });
      const data = await res.json();
      if (data.success) {
        setPanicModalOpen(false);
        window.location.href = "/admin/login";
      } else {
        setPanicError(data.error || "Failed to trigger panic mode.");
      }
    } catch {
      setPanicError("Connection error.");
    }
  };

  return (
    <>
      <header className="admin-header">
        <div className="admin-header-left">
          <Link href="/admin" className="admin-brand-link">
            <span className="admin-brand-icon-box">
              <img
                src="/logo.png"
                alt="Wildfire Logo"
                className="admin-brand-logo-img"
                width={18}
                height={18}
              />
            </span>
            <span className="admin-brand-text">WILDFIRE ADMIN</span>
            <span className="admin-brand-pill">FORTRESS</span>
          </Link>

          <div className="admin-header-divider" aria-hidden="true" />

          {isMaintenance ? (
            <div className="admin-telemetry-badge admin-telemetry-badge--warning">
              <Wrench size={12} />
              <span>MAINTENANCE ACTIVE</span>
            </div>
          ) : (
            <div className="admin-telemetry-badge">
              <Radio size={12} className="admin-live-pulse-dot" />
              <span>SYSTEM LIVE</span>
            </div>
          )}
        </div>

        <div className="admin-header-right">
          {/* Main Docs Link */}
          <Link
            href="/docs"
            target="_blank"
            className="admin-header-nav-link"
            title="Open Live Documentation"
          >
            <span>Live Docs</span>
            <ArrowUpRight size={13} />
          </Link>

          {/* Panic Killswitch Button */}
          <button
            type="button"
            onClick={() => setPanicModalOpen(true)}
            className="admin-panic-btn"
            title="Emergency Panic Lockdown: Invalidate all sessions immediately"
          >
            <ShieldAlert size={14} />
            <span>Panic Lockdown</span>
          </button>

          {/* User Session Pill */}
          <div className="admin-user-pill">
            <span className="admin-user-avatar-indicator">
              <ShieldCheck size={13} className="admin-user-shield" />
            </span>
            <div className="admin-user-details">
              <span className="admin-user-name">{username}</span>
              <span className="admin-user-role">{role.replace("_", " ")}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="admin-logout-btn"
            title="Sign Out of Admin Mission Control"
          >
            <LogOut size={14} />
            <span>{loggingOut ? "Exiting..." : "Logout"}</span>
          </button>
        </div>
      </header>

      {/* Panic Modal */}
      {panicModalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card admin-modal-card--danger">
            <div className="admin-modal-header">
              <span className="admin-modal-danger-icon">
                <ShieldAlert size={24} />
              </span>
              <h3 className="admin-modal-title">Trigger Emergency Panic Lockdown?</h3>
            </div>
            <p className="admin-modal-body">
              This action will <strong>immediately revoke all active sessions</strong>, kick out all logged-in administrators, and freeze all content mutations.
            </p>
            {panicError && <div className="admin-alert-box admin-alert-box--danger">{panicError}</div>}
            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={() => setPanicModalOpen(false)}
                className="admin-btn admin-btn--secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerPanic}
                className="admin-btn admin-btn--danger"
              >
                <Lock size={14} />
                <span>Confirm Panic Lockdown</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
