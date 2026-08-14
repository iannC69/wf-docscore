"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, BookOpen, Layers, Terminal, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
          <span className={`badge badge--${item.badge.toLowerCase()}`}>
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
          <PanelLeftOpen size={16} />
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
        {/* Sidebar Header with Collapse action */}
        <div className="sidebar-top-bar">
          <span className="sidebar-top-title">Navigation</span>
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

        <div className="sidebar-inner">
          <nav aria-label="Docs sections">
            {/* Overview / Introduction Link */}
            <div className="nav-group">
              <p className="nav-group-title">Overview</p>
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
        </div>

        {/* System status pill at bottom */}
        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="status-dot" aria-hidden="true" />
            <span className="status-label">Engine v1.0.0</span>
          </div>
        </div>

        {/* Liquid Fire Wave at bottom of sidebar */}
        <LiquidFireWave height={44} />
      </aside>
    </>
  );
}
