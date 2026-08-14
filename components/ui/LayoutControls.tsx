"use client";
import React from "react";
import { useLayout } from "@/context/LayoutContext";
import { PanelLeft, PanelRight, Columns3, Columns2, Square } from "lucide-react";

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
          <Columns3 size={13} aria-hidden="true" />
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
          <Columns2 size={13} aria-hidden="true" />
          <span className="layout-btn-label">Focus</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={mode === "full"}
          className={`layout-btn ${mode === "full" ? "layout-btn--active" : ""}`}
          onClick={() => setMode("full")}
          title="Full Reading Mode: Max Width Content"
        >
          <Square size={12} aria-hidden="true" />
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
          <PanelLeft size={15} />
        </button>

        <button
          type="button"
          onClick={toggleToc}
          className={`layout-toggle-btn ${tocOpen ? "layout-toggle-btn--active" : ""}`}
          title={tocOpen ? "Collapse Right TOC (Shortcut: ])" : "Expand Right TOC (Shortcut: ])"}
          aria-label={tocOpen ? "Collapse right table of contents" : "Expand right table of contents"}
        >
          <PanelRight size={15} />
        </button>
      </div>
    </div>
  );
}
