"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Copy,
  Check,
  Printer,
  Pencil,
  ExternalLink,
  Sparkles,
  Share2,
  MoreHorizontal,
  ChevronDown,
  FileCode,
  ShieldCheck,
} from "lucide-react";

interface DocQuickActionsProps {
  rawContent: string;
  slug: string;
  githubEditUrl?: string;
  isAdmin?: boolean;
}

export function DocQuickActions({
  rawContent,
  slug,
  githubEditUrl,
  isAdmin = false,
}: DocQuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(rawContent);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setDropdownOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy markdown:", err);
    }
  };

  const handleShareLink = async () => {
    const cleanUrl = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";

    // Native mobile share if supported
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      /mobile|android|iphone|ipad/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({
          title: document.title,
          url: cleanUrl,
        });
        setDropdownOpen(false);
        return;
      } catch {
        // user cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(cleanUrl);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
        setDropdownOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handlePrintPdf = () => {
    setDropdownOpen(false);
    window.print();
  };

  return (
    <div className="doc-quick-actions-toolbar" aria-label="Page quick actions" ref={menuRef}>
      {/* 1. AI Quick Summary Button */}
      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("wf:toggle-ai-summary", {
              detail: { slug },
            })
          );
        }}
        className="doc-quick-btn doc-quick-btn--ai"
        title="Generează sau afișează rezumatul inteligent pe scurt (30 secunde)"
      >
        <Sparkles size={12} className="text-amber-400 doc-quick-ai-sparkle" />
        <span>Rezumat AI</span>
      </button>

      {/* 2. Public Player Edit Page Button (GitHub Contribution) */}
      {githubEditUrl && (
        <a
          href={githubEditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="doc-quick-btn doc-quick-btn--github"
          title="Propune o modificare pentru această pagină pe GitHub"
        >
          <Pencil size={12} />
          <span>Edit Page</span>
          <ExternalLink size={10} className="quick-btn-ext" />
        </a>
      )}

      {/* 3. Combined Options Dropdown Menu (Admin Live Edit, Share, Copy Markdown, PDF Export) */}
      <div className="doc-quick-dropdown-wrap">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`doc-quick-btn doc-quick-btn--menu ${dropdownOpen ? "doc-quick-btn--active" : ""}`}
          title="Opțiuni suplimentare (Admin, Share, Export PDF, Copiere Markdown)"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <MoreHorizontal size={13} />
          <span className="sr-only">Opțiuni</span>
          <ChevronDown size={10} className={`doc-quick-chevron ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="doc-quick-dropdown-menu" role="menu">
            {/* Admin Live Editor Quick Option */}
            {isAdmin && (
              <>
                <a
                  href={`/admin/content?slug=${slug}`}
                  className="doc-quick-dropdown-item doc-quick-dropdown-item--admin"
                  role="menuitem"
                >
                  <ShieldCheck size={13} className="text-amber-400" />
                  <span className="flex-1 font-semibold text-amber-400">Editează în Admin</span>
                  <span className="admin-menu-badge">LIVE</span>
                </a>
                <div className="doc-quick-dropdown-divider" role="separator" />
              </>
            )}

            {/* Share / Copy Canonical Link */}
            <button
              type="button"
              onClick={handleShareLink}
              className="doc-quick-dropdown-item"
              role="menuitem"
            >
              {linkCopied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link Copiat!</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Distribuie Link-ul</span>
                </>
              )}
            </button>

            {/* Copy Raw Markdown */}
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="doc-quick-dropdown-item"
              role="menuitem"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Markdown Copiat!</span>
                </>
              ) : (
                <>
                  <FileCode size={13} />
                  <span>Copiază Markdown</span>
                </>
              )}
            </button>

            {/* Export PDF / Print */}
            <button
              type="button"
              onClick={handlePrintPdf}
              className="doc-quick-dropdown-item"
              role="menuitem"
            >
              <Printer size={13} />
              <span>Exportă PDF / Print</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
