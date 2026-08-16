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
  const [query, setQuery] = useState("");
  const [chunks, setChunks] = useState<SearchChunk[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch deep search index on initial open
  useEffect(() => {
    if (isOpen && chunks.length === 0) {
      setLoading(true);
      fetch("/api/search")
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            setChunks(data.results);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, chunks.length]);

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

  // Deep search scoring & filtering
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) {
      // Default curated quicklinks when query is empty
      return [
        {
          id: "quick-getting-started",
          title: "Getting Started",
          sectionTitle: "Introduction & Setup",
          category: "Getting Started",
          href: "/docs/getting-started",
          contentSnippet: "Step-by-step installation, environment setup, and verification guide.",
        },
        {
          id: "quick-config",
          title: "Configuration",
          sectionTitle: "Environment & Keys",
          category: "Getting Started",
          href: "/docs/getting-started/configuration",
          contentSnippet: "Configure GitHub App tokens, Turso database connection, and theme presets.",
        },
        {
          id: "quick-features",
          title: "MDX Components",
          sectionTitle: "Component Reference",
          category: "Core Features",
          href: "/docs/features/mdx-components",
          contentSnippet: "Interactive callouts, code blocks, tabs, cards, and sequential steps.",
        },
        {
          id: "quick-github",
          title: "GitHub Sync",
          sectionTitle: "GitOps Workflow",
          category: "Core Features",
          href: "/docs/features/github-integration",
          contentSnippet: "Automated two-way GitHub synchronizer, commit-on-save, and webhooks.",
        },
        {
          id: "quick-api",
          title: "API Reference",
          sectionTitle: "REST Endpoints",
          category: "API Reference",
          href: "/docs/api-reference",
          contentSnippet: "Programmatic access to documentation content, navigation trees, and revalidation.",
        },
      ];
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
        if (item.keywords.some(k => k.toLowerCase().includes(w))) score += 12;
      }

      return { item, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 16)
      .map((s) => s.item);
  }, [query, chunks]);

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
      aria-label="Search documentation"
    >
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight-style Search Input Header */}
        <div className="search-input-header">
          <Search size={19} className="search-input-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search documentation, guides, APIs, code..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search query"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="button"
            className="search-esc-badge"
            onClick={onClose}
            aria-label="Close search"
          >
            ESC
          </button>
        </div>

        {/* Search Results / Status */}
        <div className="search-results-wrapper" ref={resultsContainerRef}>
          {loading && (
            <div className="search-status-state">
              <div className="search-spinner" aria-hidden="true" />
              <span>Indexing documentation database...</span>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="search-status-state">
              <p className="search-no-results">
                No matching results found for &ldquo;<strong>{query}</strong>&rdquo;
              </p>
              <span className="search-no-results-hint">
                Search across all topics, variables, API routes, and code blocks.
              </span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="search-results-list" role="listbox">
              <div className="search-section-label">
                {!query.trim() ? "Suggested Quicklinks" : `Search Results (${results.length})`}
              </div>

              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isHeading = item.href.includes("#");

                return (
                  <div
                    key={item.id}
                    data-index={idx}
                    role="option"
                    aria-selected={isSelected}
                    className={`search-result-item ${isSelected ? "search-result-item--selected" : ""}`}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="result-item-icon-box">
                      {isHeading ? (
                        <Hash size={14} className="result-icon-heading" aria-hidden="true" />
                      ) : (
                        <FileText size={14} className="result-icon-doc" aria-hidden="true" />
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
                        <span className="result-item-category">{item.category}</span>
                      </div>

                      {item.contentSnippet && (
                        <p className="result-item-snippet">
                          <HighlightMatch text={item.contentSnippet} query={query} />
                        </p>
                      )}
                    </div>

                    <div className="result-item-action">
                      <CornerDownLeft
                        size={13}
                        className="result-item-enter-icon"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Keyboard Helper Footer */}
        <div className="search-modal-footer">
          <div className="search-shortcuts-help">
            <span className="shortcut-tag">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="shortcut-tag">
              <kbd>↵</kbd>
              <span>Open</span>
            </span>
            <span className="shortcut-tag">
              <kbd>ESC</kbd>
              <span>Dismiss</span>
            </span>
          </div>

          <div className="search-powered-by">
            <span>Wildfire DeepSearch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
