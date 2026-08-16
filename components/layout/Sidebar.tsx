"use client";
import React, { useState, useEffect } from "react";
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
  LayoutGrid,
  ChevronRight,
  Compass,
  Sparkles,
} from "lucide-react";
import { LiquidFireWave } from "@/components/ui/LiquidEffects";
import { useLayout } from "@/context/LayoutContext";
import type { NavGroup, NavItem } from "@/types/docs";
import { getDocIcon } from "@/lib/icons";
import { CURRENT_VERSION } from "@/lib/version";

interface SidebarProps {
  nav: NavGroup[];
}

const GROUP_ICONS: Record<string, React.ReactNode> = {
  "Getting Started": <BookOpen size={13} aria-hidden="true" />,
  "Core Features": <Layers size={13} aria-hidden="true" />,
  "API Reference": <Terminal size={13} aria-hidden="true" />,
};

function closeMobileSidebar() {
  if (typeof window !== "undefined" && window.innerWidth <= 1024) {
    const sidebar = document.getElementById("docs-sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar) sidebar.setAttribute("data-open", "false");
    if (overlay) overlay.setAttribute("data-open", "false");
    document.body.style.overflow = "";
  }
}

/**
 * Collapsible NavItemRow with support for nested children sub-sections
 */
function NavItemRow({
  item,
  pathname,
  depth = 0,
}: {
  item: NavItem;
  pathname: string;
  depth?: number;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExact = pathname === item.href;
  const isAncestor = !isExact && (pathname.startsWith(`${item.href}/`) || pathname.startsWith(`${item.href}?`));
  const isChildActive = hasChildren && item.children?.some(c => pathname === c.href || pathname.startsWith(`${c.href}/`));

  // Default to expanded so sub-pages are immediately accessible, but user can collapse at will
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isExact || isAncestor || isChildActive) {
      setIsOpen(true);
    }
  }, [pathname, isExact, isAncestor, isChildActive]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  return (
    <li className={`nav-item-wrapper ${hasChildren ? "nav-item-wrapper--has-children" : ""}`}>
      <div className="nav-item-row-container">
        <Link
          href={item.href}
          onClick={closeMobileSidebar}
          className={`nav-item${isExact ? " nav-item--active" : ""}${isAncestor ? " nav-item--ancestor" : ""}${depth > 0 ? " nav-item--nested" : ""}`}
          aria-current={isExact ? "page" : undefined}
        >
          <span className="nav-item-indicator" aria-hidden="true" />
          <span className="nav-item-icon">
            {getDocIcon(item.slug, item.title, depth > 0 ? 12 : 14)}
          </span>
          <span className="nav-item-text">{item.title}</span>
          {item.badge && (
            <span className={`nav-item-badge badge--${item.badge.toLowerCase()}`}>
              {item.badge}
            </span>
          )}
        </Link>

        {/* Chevron toggle button for sections with children */}
        {hasChildren && (
          <button
            type="button"
            className={`nav-item-collapse-btn ${isOpen ? "nav-item-collapse-btn--open" : ""}`}
            onClick={toggleOpen}
            aria-label={isOpen ? `Collapse ${item.title} section` : `Expand ${item.title} section`}
            title={isOpen ? "Collapse section" : "Expand section"}
          >
            <ChevronRight size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Nested Children Sublist */}
      {hasChildren && isOpen && (
        <ul role="list" className="nav-sublist" data-open={isOpen}>
          {item.children!.map((child) => (
            <NavItemRow
              key={child.slug}
              item={child}
              pathname={pathname}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Collapsible NavGroup component for top-level groups
 */
function CollapsibleNavGroup({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const [isGroupOpen, setIsGroupOpen] = useState(true);

  return (
    <div className="nav-group">
      <button
        type="button"
        className={`nav-group-header-btn ${isGroupOpen ? "nav-group-header-btn--open" : ""}`}
        onClick={() => setIsGroupOpen(prev => !prev)}
        aria-expanded={isGroupOpen}
      >
        <span className="nav-group-header-left">
          {GROUP_ICONS[group.title] && (
            <span className="nav-group-icon">{GROUP_ICONS[group.title]}</span>
          )}
          <span>{group.title}</span>
        </span>
        <ChevronRight size={12} className="nav-group-chevron" aria-hidden="true" />
      </button>

      {isGroupOpen && (
        <ul role="list" className="nav-list">
          {group.items.map(item => (
            <NavItemRow key={item.slug} item={item} pathname={pathname} />
          ))}
        </ul>
      )}
    </div>
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
        {/* Pinned Top Bar with sleek frosted glass branding & Collapse action */}
        <div className="sidebar-top-bar">
          <div className="sidebar-brand-sub">
            <span className="sidebar-brand-icon-box">
              <img
                src="/logo.png"
                alt="Wildfire Logo"
                className="sidebar-brand-logo-img"
                width={14}
                height={14}
              />
            </span>
            <span className="sidebar-top-title">Navigation</span>
            <span className="sidebar-top-badge">Explorer</span>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="sidebar-collapse-btn"
            title="Collapse Sidebar (Shortcut: [)"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={14} />
            <kbd className="sidebar-collapse-kbd" aria-hidden="true">[</kbd>
          </button>
        </div>

        {/* Scrollable Navigation Area with Smooth Fade-down Mask */}
        <div className="sidebar-scroll-wrapper">
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
                      onClick={closeMobileSidebar}
                      className={`nav-item${pathname === "/docs" ? " nav-item--active" : ""}`}
                      aria-current={pathname === "/docs" ? "page" : undefined}
                    >
                      <span className="nav-item-indicator" aria-hidden="true" />
                      <span className="nav-item-icon">
                        <Compass size={14} aria-hidden="true" />
                      </span>
                      <span className="nav-item-text">Documentation Hub</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/changelog"
                      onClick={closeMobileSidebar}
                      className={`nav-item${pathname === "/changelog" ? " nav-item--active" : ""}`}
                      aria-current={pathname === "/changelog" ? "page" : undefined}
                    >
                      <span className="nav-item-indicator" aria-hidden="true" />
                      <span className="nav-item-icon">
                        <Sparkles size={14} aria-hidden="true" />
                      </span>
                      <span className="nav-item-text">Changelog &amp; Releases</span>
                      <span className="nav-item-badge badge--new">v{CURRENT_VERSION}</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Categorized Collapsible Groups */}
              {nav.map(group => (
                <CollapsibleNavGroup
                  key={group.title}
                  group={group}
                  pathname={pathname}
                />
              ))}
            </nav>
          </div>

          {/* Smooth Fade Down Gradient Overlay */}
          <div className="sidebar-fade-down" aria-hidden="true" />
        </div>

        {/* Pinned Bottom Dock: Always visible */}
        <div className="sidebar-bottom-dock">
          {/* Liquid Glass Info Card */}
          <div className="sidebar-liquid-card">
            <div className="liquid-card-header">
              <span className="liquid-card-dot" aria-hidden="true" />
              <span className="liquid-card-title">Production Edge</span>
            </div>
            <p className="liquid-card-desc">
              Next.js 16 Turbopack engine with instant global cache revalidation.
            </p>
            <div className="liquid-card-footer">
              <span className="liquid-card-tag">
                <GitBranch size={11} aria-hidden="true" />
                <span>main</span>
              </span>
              <span className="liquid-card-status">99.9% ISR</span>
            </div>
          </div>

          {/* System status */}
          <div className="sidebar-footer">
            <div className="system-status-indicator">
              <span className="status-dot" aria-hidden="true" />
              <span className="status-label">WF-DOCSCORE v{CURRENT_VERSION}</span>
            </div>
          </div>

          {/* Seamless Molten Lava Tank */}
          <div className="sidebar-wave-container">
            <LiquidFireWave height={75} />
          </div>
        </div>
      </aside>
    </>
  );
}
