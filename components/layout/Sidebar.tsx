"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Layers,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
  Flame,
  GitBranch,
  Search,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { LiquidFireWave } from "@/components/ui/LiquidEffects";
import { useLayout } from "@/context/LayoutContext";
import type { NavGroup, NavItem } from "@/types/docs";

interface SidebarProps {
  nav: NavGroup[];
}

const GROUP_ICONS: Record<string, React.ReactNode> = {
  "Getting Started": <BookOpen size={13} aria-hidden="true" />,
  "Core Features": <Layers size={13} aria-hidden="true" />,
  "API Reference": <Terminal size={13} aria-hidden="true" />,
};

function NavItemRow({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const isExact = pathname === item.href;
  const isAncestor = !isExact && pathname.startsWith(`${item.href}/`);

  return (
    <li>
      <Link
        href={item.href}
        className={`nav-item${isExact ? " nav-item--active" : ""}${isAncestor ? " nav-item--ancestor" : ""}`}
        aria-current={isExact ? "page" : undefined}
      >
        <span className="nav-item-indicator" aria-hidden="true" />
        <span className="nav-item-text">{item.title}</span>
        {item.badge && (
          <span className={`nav-item-badge badge--${item.badge.toLowerCase()}`}>
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

export function Sidebar({ nav }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useLayout();

  return (
    <>
      {/* Mobile overlay */}
      <div id="sidebar-overlay" className="sidebar-overlay" aria-hidden="true" data-open="false" />

      {/* Floating expand button when sidebar is collapsed */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="sidebar-floating-toggle"
          title="Expand Left Sidebar (Shortcut: [)"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen size={15} />
          <span className="floating-toggle-label">Sidebar</span>
        </button>
      )}

      <aside
        id="docs-sidebar"
        className={`sidebar ${sidebarOpen ? "sidebar--open" : "sidebar--collapsed"}`}
        aria-label="Documentation navigation"
        data-open="false"
        data-collapsed={!sidebarOpen}
      >
        {/* Sidebar Header with subtle glass branding & Collapse action */}
        <div className="sidebar-top-bar">
          <div className="sidebar-brand-sub">
            <Flame size={13} className="brand-fire-icon" aria-hidden="true" />
            <span className="sidebar-top-title">Navigation</span>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="sidebar-collapse-btn"
            title="Collapse Sidebar (Shortcut: [)"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="sidebar-inner">
          <nav aria-label="Docs sections">
            {/* Overview / Introduction Link */}
            <div className="nav-group">
              <p className="nav-group-title">
                <LayoutGrid size={12} className="nav-group-icon" aria-hidden="true" />
                <span>Overview</span>
              </p>
              <ul role="list" className="nav-list">
                <li>
                  <Link
                    href="/docs"
                    className={`nav-item${pathname === "/docs" ? " nav-item--active" : ""}`}
                    aria-current={pathname === "/docs" ? "page" : undefined}
                  >
                    <span className="nav-item-indicator" aria-hidden="true" />
                    <span className="nav-item-text">Documentation Hub</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categorized Groups */}
            {nav.map(group => (
              <div key={group.title} className="nav-group">
                <p className="nav-group-title">
                  {GROUP_ICONS[group.title] && (
                    <span className="nav-group-icon">{GROUP_ICONS[group.title]}</span>
                  )}
                  <span>{group.title}</span>
                </p>
                <ul role="list" className="nav-list">
                  {group.items.map(item => (
                    <NavItemRow key={item.slug} item={item} pathname={pathname} />
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Liquid Glass Info Card in Sidebar */}
          <div className="sidebar-liquid-card">
            <div className="liquid-card-header">
              <span className="liquid-card-dot" aria-hidden="true" />
              <span className="liquid-card-title">Production Edge</span>
            </div>
            <p className="liquid-card-desc">
              Next.js 15 SSG engine with instant global cache revalidation.
            </p>
            <div className="liquid-card-footer">
              <span className="liquid-card-tag">
                <GitBranch size={11} aria-hidden="true" />
                <span>main</span>
              </span>
              <span className="liquid-card-status">99.9% ISR</span>
            </div>
          </div>
        </div>

        {/* System status at bottom */}
        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="status-dot" aria-hidden="true" />
            <span className="status-label">Wildfire Docs v1.0</span>
          </div>
        </div>

        {/* Seamless Liquid Fire Wave Container */}
        <div className="sidebar-wave-container">
          <LiquidFireWave height={95} />
        </div>
      </aside>
    </>
  );
}
