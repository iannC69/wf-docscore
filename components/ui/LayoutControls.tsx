"use client";
import React from "react";
import { useLayout, LayoutMode } from "@/context/LayoutContext";
import { PanelLeft, PanelRight } from "lucide-react";

// Custom SVG Icons for the 3 distinct layout positions
function IconStandardLayout() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 3v18" />
      <path d="M16 3v18" />
    </svg>
  );
}

function IconFocusLayout() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M16 3v18" />
    </svg>
  );
}

function IconFullLayout() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

export function LayoutControls() {
  const { mode, setMode, sidebarOpen, toggleSidebar, tocOpen, toggleToc } = useLayout();

  return (
    <div className="layout-controls-wrapper" aria-label="Layout position options">
      {/* 3 Layout Mode Segmented Control */}
      <div className="layout-mode-group" role="radiogroup" aria-label="Page layout modes">
        <button
          type="button"
          role="radio"
          aria-checked={mode === "standard"}
          className={`layout-btn ${mode === "standard" ? "layout-btn--active" : ""}`}
          onClick={() => setMode("standard")}
          title="Standard Layout: Sidebar + Centered Content + Right TOC (Press [ to toggle sidebar)"
        >
          <IconStandardLayout />
          <span className="layout-btn-label">Standard</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={mode === "focus"}
          className={`layout-btn ${mode === "focus" ? "layout-btn--active" : ""}`}
          onClick={() => setMode("focus")}
          title="Focus Mode: Collapsed Sidebar + Centered Content + Right TOC"
        >
          <IconFocusLayout />
          <span className="layout-btn-label">Focus</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={mode === "full"}
          className={`layout-btn ${mode === "full" ? "layout-btn--active" : ""}`}
          onClick={() => setMode("full")}
          title="Full Reading Mode: Collapsed Sidebar + Collapsed TOC (Max Width Content)"
        >
          <IconFullLayout />
          <span className="layout-btn-label">Full</span>
        </button>
      </div>

      {/* Quick individual sidebar & TOC toggle buttons */}
      <div className="layout-quick-toggles">
        <button
          type="button"
          onClick={toggleSidebar}
          className={`layout-toggle-btn ${sidebarOpen ? "layout-toggle-btn--active" : ""}`}
          title={sidebarOpen ? "Collapse Left Sidebar (Shortcut: [)" : "Expand Left Sidebar (Shortcut: [)"}
          aria-label={sidebarOpen ? "Collapse left sidebar" : "Expand left sidebar"}
        >
          <PanelLeft size={16} />
        </button>

        <button
          type="button"
          onClick={toggleToc}
          className={`layout-toggle-btn ${tocOpen ? "layout-toggle-btn--active" : ""}`}
          title={tocOpen ? "Collapse Right TOC (Shortcut: ])" : "Expand Right TOC (Shortcut: ])"}
          aria-label={tocOpen ? "Collapse right table of contents" : "Expand right table of contents"}
        >
          <PanelRight size={16} />
        </button>
      </div>
    </div>
  );
}
