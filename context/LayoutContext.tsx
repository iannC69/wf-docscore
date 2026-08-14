"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type LayoutMode = "standard" | "focus" | "full";

interface LayoutContextType {
  mode: LayoutMode;
  sidebarOpen: boolean;
  tocOpen: boolean;
  setMode: (mode: LayoutMode) => void;
  toggleSidebar: () => void;
  toggleToc: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const STORAGE_KEY = "wf_docs_layout_mode";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<LayoutMode>("standard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tocOpen, setTocOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as LayoutMode | null;
    if (stored && ["standard", "focus", "full"].includes(stored)) {
      applyMode(stored);
    } else {
      applyMode("standard");
    }
  }, []);

  const applyMode = (newMode: LayoutMode) => {
    setModeState(newMode);
    if (newMode === "standard") {
      setSidebarOpen(true);
      setTocOpen(true);
    } else if (newMode === "focus") {
      setSidebarOpen(false);
      setTocOpen(true);
    } else if (newMode === "full") {
      setSidebarOpen(false);
      setTocOpen(false);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newMode);
      document.documentElement.setAttribute("data-layout", newMode);
    }
  };

  const setMode = (newMode: LayoutMode) => {
    applyMode(newMode);
  };

  const toggleSidebar = () => {
    const nextSidebar = !sidebarOpen;
    setSidebarOpen(nextSidebar);
    if (nextSidebar && tocOpen) {
      setModeState("standard");
      localStorage.setItem(STORAGE_KEY, "standard");
      document.documentElement.setAttribute("data-layout", "standard");
    } else if (!nextSidebar && tocOpen) {
      setModeState("focus");
      localStorage.setItem(STORAGE_KEY, "focus");
      document.documentElement.setAttribute("data-layout", "focus");
    } else if (!nextSidebar && !tocOpen) {
      setModeState("full");
      localStorage.setItem(STORAGE_KEY, "full");
      document.documentElement.setAttribute("data-layout", "full");
    }
  };

  const toggleToc = () => {
    const nextToc = !tocOpen;
    setTocOpen(nextToc);
    if (sidebarOpen && nextToc) {
      setModeState("standard");
      localStorage.setItem(STORAGE_KEY, "standard");
      document.documentElement.setAttribute("data-layout", "standard");
    } else if (!sidebarOpen && nextToc) {
      setModeState("focus");
      localStorage.setItem(STORAGE_KEY, "focus");
      document.documentElement.setAttribute("data-layout", "focus");
    } else if (!sidebarOpen && !nextToc) {
      setModeState("full");
      localStorage.setItem(STORAGE_KEY, "full");
      document.documentElement.setAttribute("data-layout", "full");
    }
  };

  // Keyboard shortcuts: 
  // [ to toggle sidebar
  // ] to toggle TOC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "[" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === "]" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
        e.preventDefault();
        toggleToc();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, tocOpen]);

  return (
    <LayoutContext.Provider
      value={{
        mode,
        sidebarOpen,
        tocOpen,
        setMode,
        toggleSidebar,
        toggleToc,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
