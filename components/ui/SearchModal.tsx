"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileText,
  Hash,
  ArrowRight,
  Sparkles,
  CornerDownLeft,
  BookOpen,
} from "lucide-react";
import type { SearchChunk } from "@/lib/search";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Highlights matching query terms within a string cleanly
 */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) {
    return <span>{text}</span>;
  }

  const terms = query.trim().split(/\s+/).filter(Boolean);
  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-match-highlight">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [chunks, setChunks] = useState<SearchChunk[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch deep search index for active locale
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/search?locale=${locale}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            setChunks(data.results);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, locale]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Curated quick links per locale
  const defaultQuickLinks = useMemo(() => {
    if (locale === "ro") {
      return [
        {
          id: "quick-getting-started-ro",
          title: "Ghid de Pornire",
          sectionTitle: "Instalare & Configurare",
          category: "Ghid de Pornire",
          href: "/docs/ro/getting-started",
          contentSnippet: "Ghid pas cu pas pentru instalare, variabile de mediu și lansare.",
        },
        {
          id: "quick-config-ro",
          title: "Instalare & CLI",
          sectionTitle: "Mediu de Dezvoltare",
          category: "Ghid de Pornire",
          href: "/docs/ro/getting-started/installation",
          contentSnippet: "Ghid complet de instalare, comenzi CLI și implementare Docker.",
        },
        {
          id: "quick-features-ro",
          title: "Componente MDX",
          sectionTitle: "Referință Componente",
          category: "Funcționalități Principale",
          href: "/docs/ro/features/mdx-components",
          contentSnippet: "Callout-uri interactive, blocuri de cod, tab-uri, carduri și pași secvențiali.",
        },
        {
          id: "quick-github-ro",
          title: "Sincronizare GitHub",
          sectionTitle: "Flux GitOps",
          category: "Funcționalități Principale",
          href: "/docs/ro/features/github-integration",
          contentSnippet: "Sincronizare automată bidirecțională cu GitHub, commit-uri și webhooks.",
        },
        {
          id: "quick-api-ro",
          title: "Referință API",
          sectionTitle: "Endpoint-uri REST",
          category: "Referință API",
          href: "/docs/ro/api-reference",
          contentSnippet: "Acces programmatic la documente, arborele de navigare și revalidare.",
        },
      ];
    }

    return [
      {
        id: "quick-getting-started-en",
        title: "Getting Started",
        sectionTitle: "Introduction & Setup",
        category: "Getting Started",
        href: "/docs/getting-started",
        contentSnippet: "Step-by-step installation, environment setup, and verification guide.",
      },
      {
        id: "quick-config-en",
        title: "Installation & CLI",
        sectionTitle: "Environment Setup",
        category: "Getting Started",
        href: "/docs/getting-started/installation",
        contentSnippet: "Complete installation guides, CLI tools, and Docker containerization.",
      },
      {
        id: "quick-features-en",
        title: "MDX Components",
        sectionTitle: "Component Reference",
        category: "Core Features",
        href: "/docs/features/mdx-components",
        contentSnippet: "Interactive callouts, code blocks, tabs, cards, and sequential steps.",
      },
      {
        id: "quick-github-en",
        title: "GitHub Sync",
        sectionTitle: "GitOps Workflow",
        category: "Core Features",
        href: "/docs/features/github-integration",
        contentSnippet: "Automated two-way GitHub synchronizer, commit-on-save, and webhooks.",
      },
      {
        id: "quick-api-en",
        title: "API Reference",
        sectionTitle: "REST Endpoints",
        category: "API Reference",
        href: "/docs/api-reference",
        contentSnippet: "Programmatic access to documentation content, navigation trees, and revalidation.",
      },
    ];
  }, [locale]);

  // Deep search scoring & filtering
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return defaultQuickLinks;
    }

    const words = q.split(/\s+/).filter(Boolean);

    const scored = chunks.map((item) => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const sectionLower = item.sectionTitle ? item.sectionTitle.toLowerCase() : "";
      const snippetLower = item.contentSnippet.toLowerCase();
      const catLower = item.category.toLowerCase();
      const hrefLower = item.href.toLowerCase();

      // Exact phrase match in title
      if (titleLower === q) score += 100;
      else if (titleLower.startsWith(q)) score += 60;
      else if (titleLower.includes(q)) score += 40;

      // Section or category match
      if (sectionLower.includes(q)) score += 30;
      if (catLower.includes(q)) score += 20;
      if (hrefLower.includes(q)) score += 25;

      // Match each word in title/snippet
      for (const w of words) {
        if (titleLower.includes(w)) score += 15;
        if (sectionLower.includes(w)) score += 10;
        if (snippetLower.includes(w)) score += 8;
        if (item.keywords?.some(k => k.toLowerCase().includes(w))) score += 12;
      }

      return { item, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 16)
      .map((s) => s.item);
  }, [query, chunks, defaultQuickLinks]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        navigate(results[selectedIndex].href);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const navigate = (href: string) => {
    onClose();
    router.push(href);
  };

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="search-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.search.title}
    >
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="search-input-header">
          <Search size={18} className="search-input-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={t.search.placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            aria-label={t.search.placeholder}
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            className="search-esc-badge"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="search-results-wrapper" ref={resultsContainerRef}>
          {loading && (
            <div className="search-status-state">
              <div className="search-spinner" aria-hidden="true" />
              <p>{t.common.loading}</p>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="search-status-state">
              <p className="search-no-results">
                {t.search.noResults} &ldquo;<strong>{query}</strong>&rdquo;
              </p>
              <p className="search-no-results-hint">
                {t.search.noResultsHint}
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <p className="search-section-label">
                {!query ? (locale === "ro" ? "Ghiduri Rapide Recomandate" : "Recommended Guides") : `${results.length} ${locale === "ro" ? "rezultate găsite" : "results found"}`}
              </p>
              <ul role="listbox" className="search-results-list">
                {results.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const isSection = item.href.includes("#");

                  return (
                    <li
                      key={item.id || item.href}
                      data-index={index}
                      role="option"
                      aria-selected={isSelected}
                      className={`search-result-item ${isSelected ? "search-result-item--selected" : ""}`}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="result-item-icon-box">
                        {isSection ? (
                          <Hash size={14} className="result-icon-heading" />
                        ) : (
                          <FileText size={14} />
                        )}
                      </div>

                      <div className="result-item-content">
                        <div className="result-item-title-row">
                          <span className="result-item-title">
                            <HighlightMatch text={item.title} query={query} />
                          </span>
                          {item.sectionTitle && item.sectionTitle !== item.title && (
                            <span className="result-item-parent">
                              in {item.sectionTitle}
                            </span>
                          )}
                          <span className="result-item-category">
                            {item.category}
                          </span>
                        </div>

                        {item.contentSnippet && (
                          <p className="result-item-snippet">
                            <HighlightMatch text={item.contentSnippet} query={query} />
                          </p>
                        )}
                      </div>

                      <div className="result-item-action" aria-hidden="true">
                        <CornerDownLeft size={13} className="result-item-enter-icon" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="search-modal-footer">
          <div className="search-shortcuts-help">
            <span className="shortcut-tag">
              <kbd>↑</kbd> <kbd>↓</kbd> {t.search.navigateArrows}
            </span>
            <span className="shortcut-tag">
              <kbd>↵</kbd> {t.search.selectEnter}
            </span>
            <span className="shortcut-tag">
              <kbd>ESC</kbd> {t.search.pressEscToClose}
            </span>
          </div>

          <span className="search-powered-by">
            {t.search.poweredBy}
          </span>
        </div>
      </div>
    </div>
  );
}
