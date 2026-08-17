"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileEdit,
  Search,
  ShieldCheck,
  Key,
  ScrollText,
  Sliders,
  Terminal,
  Activity,
} from "lucide-react";
import { CURRENT_VERSION } from "@/lib/version";

const NAV_ITEMS = [
  {
    label: "Mission Control",
    href: "/admin",
    icon: LayoutDashboard,
    badge: "Live",
  },
  {
    label: "Content Studio",
    href: "/admin/content",
    icon: FileEdit,
  },
  {
    label: "Search Telemetry",
    href: "/admin/search-analytics",
    icon: Search,
  },
  {
    label: "Security & 2FA",
    href: "/admin/security",
    icon: ShieldCheck,
  },
  {
    label: "API Tokens",
    href: "/admin/api-keys",
    icon: Key,
  },
  {
    label: "Audit Ledger",
    href: "/admin/audit",
    icon: ScrollText,
  },
  {
    label: "Engine Settings",
    href: "/admin/settings",
    icon: Sliders,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar" aria-label="Admin Navigation">
      <div className="admin-sidebar-section-title">
        <Terminal size={12} />
        <span>NAVIGATION MATRIX</span>
      </div>

      <nav className="admin-nav-list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`}
            >
              <Icon size={15} className="admin-nav-icon" />
              <span className="admin-nav-text">{item.label}</span>
              {item.badge && (
                <span className="admin-nav-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-engine-status-box">
          <div className="admin-engine-status-header">
            <Activity size={12} className="admin-engine-pulse" />
            <span className="admin-engine-title">WF-DOCSCORE</span>
          </div>
          <div className="admin-engine-meta">
            <span>Engine v{CURRENT_VERSION}</span>
            <span className="admin-status-indicator">SECURE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
