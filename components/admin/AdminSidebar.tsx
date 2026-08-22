"use client";

import React, { useState, useEffect } from "react";
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
  Activity,
  Folder,
  Users,
  Terminal,
  Cpu,
  Database,
  ListTodo,
  Archive,
  Webhook,
  X,
} from "lucide-react";
import { CURRENT_VERSION } from "@/lib/version";

import type { TeamMemberPermissions } from "@/lib/security/teamStore";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  permKey?: keyof TeamMemberPermissions;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Mission Control",
    href: "/admin",
    icon: LayoutDashboard,
    badge: "Live",
  },
  {
    label: "Task Hub & TODO",
    href: "/admin/tasks",
    icon: ListTodo,
    badge: "TODO",
    permKey: "canManageTasks",
  },
  {
    label: "AI Engine Telemetry",
    href: "/admin/ai-analytics",
    icon: Cpu,
    badge: "AI",
    permKey: "canViewAiStats",
  },
  {
    label: "Database & Metrics",
    href: "/admin/database",
    icon: Database,
    badge: "SQL",
    permKey: "canManageDb",
  },
  {
    label: "Snapshot Vault",
    href: "/admin/backups",
    icon: Archive,
    badge: "Vault",
    permKey: "canManageSnapshots",
  },
  {
    label: "My Team & Access",
    href: "/admin/team",
    icon: Users,
    permKey: "canManageTeam",
  },
  {
    label: "Content Studio",
    href: "/admin/content",
    icon: FileEdit,
    permKey: "canEditDocs",
  },
  {
    label: "Doc Health & Linter",
    href: "/admin/health",
    icon: Activity,
    permKey: "canManageHealth",
  },
  {
    label: "Media & Asset Vault",
    href: "/admin/media",
    icon: Folder,
    permKey: "canManageMedia",
  },
  {
    label: "Search Telemetry",
    href: "/admin/search-analytics",
    icon: Search,
    permKey: "canViewAnalytics",
  },
  {
    label: "Security & 2FA",
    href: "/admin/security",
    icon: ShieldCheck,
    permKey: "canManageSecurity",
  },
  {
    label: "API Tokens",
    href: "/admin/api-keys",
    icon: Key,
    permKey: "canManageApiKeys",
  },
  {
    label: "Audit Ledger",
    href: "/admin/audit",
    icon: ScrollText,
    permKey: "canViewAudit",
  },
  {
    label: "Webhooks",
    href: "/admin/webhooks",
    icon: Webhook,
    permKey: "canManageWebhooks",
  },
  {
    label: "Engine Settings",
    href: "/admin/settings",
    icon: Sliders,
    permKey: "canManageSettings",
  },
];

export function AdminSidebar({
  permissions,
  isRoot = false,
}: {
  permissions?: TeamMemberPermissions;
  isRoot?: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setMobileOpen((prev) => {
        const next = !prev;
        document.body.style.overflow = next ? "hidden" : "";
        return next;
      });
    };

    const handleClose = () => {
      setMobileOpen(false);
      document.body.style.overflow = "";
    };

    window.addEventListener("admin-toggle-mobile-nav", handleToggle);
    window.addEventListener("admin-close-mobile-nav", handleClose);

    return () => {
      window.removeEventListener("admin-toggle-mobile-nav", handleToggle);
      window.removeEventListener("admin-close-mobile-nav", handleClose);
      document.body.style.overflow = "";
    };
  }, []);

  // Auto close on route change
  useEffect(() => {
    setMobileOpen(false);
    document.body.style.overflow = "";
  }, [pathname]);

  const handleClose = () => {
    setMobileOpen(false);
    document.body.style.overflow = "";
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-close-mobile-nav"));
    }
  };

  // Filter navigation items by active permissions
  const allowedNavItems = NAV_ITEMS.filter((item) => {
    if (isRoot) return true;
    if (!item.permKey) return true;
    return Boolean(permissions?.[item.permKey]);
  });

  return (
    <>
      <div
        id="admin-sidebar-overlay"
        className={`admin-sidebar-overlay ${mobileOpen ? "admin-sidebar-overlay--open" : ""}`}
        data-open={mobileOpen ? "true" : "false"}
        onClick={handleClose}
        aria-hidden="true"
      />

      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${mobileOpen ? "admin-sidebar--open" : ""}`}
        data-open={mobileOpen ? "true" : "false"}
        aria-label="Admin Navigation"
      >
        <div className="admin-sidebar-header-row">
          <div className="admin-sidebar-section-title">
            <Terminal size={13} />
            <span>NAVIGATION MATRIX</span>
          </div>

          <button
            type="button"
            className="admin-mobile-sidebar-close"
            onClick={handleClose}
            aria-label="Închide meniul de navigare"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="admin-nav-list">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className={`admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`}
              >
                <Icon size={16} className="admin-nav-icon" />
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
              <Activity size={13} className="admin-engine-pulse" />
              <span className="admin-engine-title">WF-DOCSCORE</span>
            </div>
            <div className="admin-engine-meta">
              <span>Engine v{CURRENT_VERSION}</span>
              <span className="admin-status-indicator">SECURE</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
