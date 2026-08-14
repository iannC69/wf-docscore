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
  Command,
  CornerDownLeft,
} from "lucide-react";
import type { SearchDocument } from "@/lib/search";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  href: string;
  isHeading?: boolean;
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
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch search index on first open
  useEffect(() => {
    if (isOpen && documents.length === 0) {
      setLoading(true);
      fetch("/api/search")
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            setDocuments(data.results);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, documents.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter results based on query
  const results = useMemo<SearchResultItem[]>(() => {
    if (!query.trim()) {
      // Default suggested items when query is empty
      return [
        {
          id: "quick-getting-started",
          title: "Getting Started",
          subtitle: "Install and run the documentation platform locally",
          category: "Getting Started",
          href: "/docs/getting-started",
        },
        {
          id: "quick-config",
          title: "Configuration Reference",
          subtitle: "Environment variables, GitHub App credentials, and setup",
          category: "Getting Started",
          href: "/docs/getting-started/configuration",
        },
        {
          id: "quick-features",
          title: "MDX Components",
          subtitle: "Callouts, code blocks, steps, and interactive tabs",
          category: "Core Features",
          href: "/docs/features/mdx-components",
        },
        {
          id: "quick-api",
          title: "API Reference",
          subtitle: "REST API endpoints for programmatic content access",
          category: "API Reference",
          href: "/docs/api-reference",
        },
      ];
    }

    const q = query.toLowerCase().trim();
    const matches: SearchResultItem[] = [];

    for (const doc of documents) {
      const titleMatch = doc.title.toLowerCase().includes(q);
      const descMatch = doc.description.toLowerCase().includes(q);
      const catMatch = doc.category.toLowerCase().includes(q);
      const keywordMatch = doc.keywords.some((k) => k.toLowerCase().includes(q));

      if (titleMatch || descMatch || catMatch || keywordMatch) {
        matches.push({
          id: doc.href,
          title: doc.title,
          subtitle: doc.description || doc.category,
          category: doc.category,
          href: doc.href,
          isHeading: false,
        });
      }

      // Check headings inside document
      for (const h of doc.headings) {
        if (h.title.toLowerCase().includes(q)) {
          matches.push({
            id: `${doc.href}#${h.id}`,
            title: h.title,
            subtitle: `In ${doc.title}`,
            category: doc.category,
            href: `${doc.href}#${h.id}`,
            isHeading: true,
          });
        }
      }
    }

    return matches.slice(0, 12); // Limit to top 12 results
  }, [query, documents]);

  // Handle keyboard navigation inside search dialog
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
        {/* Search Input Bar */}
        <div className="search-input-header">
          <Search size={18} className="search-input-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search documentation, guides, APIs..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
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
              <X size={14} />
            </button>
          )}
          <kbd className="search-esc-badge" onClick={onClose}>
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="search-results-wrapper" ref={resultsContainerRef}>
          {loading && (
            <div className="search-status-state">
              <div className="search-spinner" aria-hidden="true" />
              <span>Indexing documentation...</span>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="search-status-state">
              <p className="search-no-results">
                No results found for &ldquo;<strong>{query}</strong>&rdquo;
              </p>
              <span className="search-no-results-hint">
                Try searching for general keywords like &ldquo;setup&rdquo;, &ldquo;config&rdquo;, or &ldquo;api&rdquo;.
              </span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="search-results-list" role="listbox">
              <div className="search-section-label">
                {!query.trim() ? "Suggested Quicklinks" : `Results (${results.length})`}
              </div>

              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
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
                      {item.isHeading ? (
                        <Hash size={15} className="result-icon-heading" aria-hidden="true" />
                      ) : (
                        <FileText size={15} className="result-icon-doc" aria-hidden="true" />
                      )}
                    </div>

                    <div className="result-item-content">
                      <div className="result-item-title-row">
                        <span className="result-item-title">{item.title}</span>
                        <span className="result-item-category">{item.category}</span>
                      </div>
                      {item.subtitle && (
                        <p className="result-item-subtitle">{item.subtitle}</p>
                      )}
                    </div>

                    <CornerDownLeft
                      size={14}
                      className="result-item-enter-icon"
                      aria-hidden="true"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Modal Footer */}
        <div className="search-modal-footer">
          <div className="search-shortcuts-help">
            <span className="shortcut-tag">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="shortcut-tag">
              <kbd>↵</kbd>
              <span>Select</span>
            </span>
            <span className="shortcut-tag">
              <kbd>ESC</kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="search-powered-by">
            <span>Wildfire FastSearch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
