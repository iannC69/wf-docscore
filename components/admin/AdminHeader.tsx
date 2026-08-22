"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Flame,
  ArrowUpRight,
  Lock,
  Radio,
  Wrench,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { AdminNotificationsCenter } from "./AdminNotificationsCenter";
import { AdminThemeToggle } from "./AdminThemeToggle";


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
  const pathname = usePathname();
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

  if (pathname === "/admin/login" || pathname?.startsWith("/admin/login")) {
    return null;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      setLoggingOut(false);
    }
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileNav = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-toggle-mobile-nav"));
    }
  };

  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    const handleClose = () => setMobileOpen(false);

    window.addEventListener("admin-toggle-mobile-nav", handleToggle);
    window.addEventListener("admin-close-mobile-nav", handleClose);
    return () => {
      window.removeEventListener("admin-toggle-mobile-nav", handleToggle);
      window.removeEventListener("admin-close-mobile-nav", handleClose);
    };
  }, []);

  return (
    <>
      <header className="admin-header">
        <div className="admin-header-left">
          {/* Mobile Navigation Toggle */}
          <button
            type="button"
            className="admin-mobile-nav-toggle"
            onClick={toggleMobileNav}
            aria-label={mobileOpen ? "Închide Meniul Admin" : "Deschide Meniul Admin"}
            aria-expanded={mobileOpen}
          >
            <Menu size={18} />
          </button>

          <Link href="/admin" className="admin-brand-link">
            <span className="admin-brand-icon-box">
              <img
                src="/logo.png"
                alt="Wildfire Logo"
                className="admin-brand-logo-img"
                width={20}
                height={20}
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
            title="Deschide Documentația Publică (Live Docs)"
          >
            <BookOpen size={14} className="admin-header-docs-icon" />
            <span className="admin-header-nav-link-text">Live Docs</span>
            <ArrowUpRight size={11} className="admin-header-docs-arrow" />
          </a>

          {/* Centru de Notificări & Alerte Interactive */}
          <AdminNotificationsCenter currentUsername={username} />

          {/* Admin Dark / Light Mode Switch */}
          <AdminThemeToggle />

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

