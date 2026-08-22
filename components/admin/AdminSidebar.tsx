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
  Activity,
  Folder,
  Users,
  Terminal,
  Cpu,
  Database,
  ListTodo,
  Archive,
  Webhook,
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

  // Filter navigation items by active permissions
  const allowedNavItems = NAV_ITEMS.filter((item) => {
    if (isRoot) return true;
    if (!item.permKey) return true;
    return Boolean(permissions?.[item.permKey]);
  });

  return (
    <aside className="admin-sidebar" aria-label="Admin Navigation">
      <div className="admin-sidebar-section-title">
        <Terminal size={12} />
        <span>NAVIGATION MATRIX</span>
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
