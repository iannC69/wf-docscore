"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function AdminThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial = stored || document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: next } }));
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="admin-header-theme-btn"
        aria-label="Schimbă tema"
        disabled
      >
        <Moon size={15} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`admin-header-theme-btn ${theme === "light" ? "admin-header-theme-btn--light" : "admin-header-theme-btn--dark"}`}
      aria-label={theme === "light" ? "Comută pe Modul Întunecat (Dark Mode)" : "Comută pe Modul Luminos (Light Mode)"}
      title={theme === "light" ? "Comută pe Modul Întunecat" : "Comută pe Modul Luminos"}
    >
      {theme === "light" ? (
        <Moon size={15} className="admin-header-theme-icon admin-header-theme-icon--moon" />
      ) : (
        <Sun size={15} className="admin-header-theme-icon admin-header-theme-icon--sun" />
      )}
    </button>
  );
}
