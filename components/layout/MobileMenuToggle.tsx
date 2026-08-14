"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function MobileMenuToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sidebar = document.getElementById("docs-sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar) sidebar.setAttribute("data-open", open ? "true" : "false");
    if (overlay) overlay.setAttribute("data-open", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";

    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on overlay click
  useEffect(() => {
    const overlay = document.getElementById("sidebar-overlay");
    const handler = () => setOpen(false);
    overlay?.addEventListener("click", handler);
    return () => overlay?.removeEventListener("click", handler);
  }, []);

  return (
    <button
      className="mobile-menu-toggle"
      onClick={() => setOpen(o => !o)}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="docs-sidebar"
    >
      {open ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}
