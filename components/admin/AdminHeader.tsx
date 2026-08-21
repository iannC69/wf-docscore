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
import { AdminNotificationsCenter } from "./AdminNotificationsCenter";


interface AdminHeaderProps {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  role?: string;
  isRoot?: boolean;
}

export function AdminHeader({
  username = "admin",
  displayName,
  avatarUrl,
  role = "super_admin",
  isRoot = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
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
            <span className="admin-brand-pill">ADMIN CENTER</span>
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
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-header-nav-link"
            title="Open Live Documentation"
          >
            <span>Live Docs</span>
            <ArrowUpRight size={13} />
          </a>

          {/* Centru de Notificări & Alerte Interactive */}
          <AdminNotificationsCenter currentUsername={username} />

          {/* User Session Profile Pill */}
          <div className="admin-user-pill">
            {avatarUrl ? (
              <div className="admin-user-avatar-wrap">
                <img
                  src={avatarUrl}
                  alt={displayName || username}
                  className="admin-user-avatar-img"
                  width={24}
                  height={24}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://cdn.discordapp.com/embed/avatars/0.png";
                  }}
                />
              </div>
            ) : (
              <span className="admin-user-avatar-indicator">
                <ShieldCheck size={13} className="admin-user-shield" />
              </span>
            )}
            <div className="admin-user-details">
              <span className="admin-user-name">{displayName || username}</span>
              <span className={`admin-user-role ${isRoot ? "admin-user-role--root" : ""}`}>
                {isRoot ? "ROOT ADMIN" : role.replace("_", " ")}
              </span>
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
    </>
  );
}

