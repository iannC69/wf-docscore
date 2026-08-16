"use client";
import React, { useEffect, useState } from "react";
import { AlignLeft, PanelRightClose, PanelRightOpen, Flame } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import type { TocItem } from "@/types/docs";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const { tocOpen, toggleToc } = useLayout();

  // Scroll Progress Calculator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, Math.round(current))));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for Active Heading
  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-64px 0% -70% 0%",
        threshold: 0,
      }
    );

    headings.forEach((h) => h && observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <>
      {/* Floating reopen button if TOC is closed on wide screens */}
      {!tocOpen && (
        <button
          type="button"
          onClick={toggleToc}
          className="toc-floating-toggle"
          title="Expand Right Table of Contents (Shortcut: ])"
          aria-label="Expand table of contents"
        >
          <PanelRightOpen size={16} />
          <span className="floating-toggle-label">Contents</span>
        </button>
      )}

      {tocOpen && (
        <aside
          className="toc"
          aria-label="Table of contents"
          data-collapsed={!tocOpen}
        >
          {/* Curved Glass Header */}
          <div className="toc-header">
            <div className="toc-header-left">
              <span className="toc-header-icon-box">
                <AlignLeft size={12} className="toc-header-icon" aria-hidden="true" />
              </span>
              <span className="toc-title">On this page</span>
            </div>

            <div className="toc-header-right">
              {scrollProgress > 0 && (
                <span className="toc-progress-chip" title="Reading Progress">
                  {scrollProgress}%
                </span>
              )}
              <button
                type="button"
                onClick={toggleToc}
                className="toc-collapse-btn"
                title="Collapse Table of Contents (Shortcut: ])"
                aria-label="Collapse table of contents"
              >
                <PanelRightClose size={13} />
                <kbd className="toc-collapse-kbd" aria-hidden="true">]</kbd>
              </button>
            </div>
          </div>

          {/* Curved Reading Progress Gauge Line */}
          <div className="toc-progress-track">
            <div
              className="toc-progress-fill"
              style={{ width: `${scrollProgress}%` }}
              aria-hidden="true"
            />
          </div>

          {/* Curved Tree Navigation */}
          <nav className="toc-tree-container">
            <div className="toc-spine-line" aria-hidden="true" />
            <ul role="list" className="toc-list">
              {items.map((item) => {
                const isActive = activeId === item.id;
                const isNested = item.depth === 3;

                return (
                  <li
                    key={item.id}
                    className={`toc-item-wrapper ${isNested ? "toc-item-wrapper--nested" : ""}`}
                  >
                    {isNested && (
                      <span
                        className={`toc-curved-branch ${isActive ? "toc-curved-branch--active" : ""}`}
                        aria-hidden="true"
                      />
                    )}
                    <a
                      href={`#${item.id}`}
                      onClick={handleClick(item.id)}
                      className={`toc-item ${isActive ? "toc-item--active" : ""} ${isNested ? "toc-item--nested" : ""}`}
                      aria-current={isActive ? "location" : undefined}
                    >
                      <span
                        className={`toc-node-dot ${isActive ? "toc-node-dot--active" : ""}`}
                        aria-hidden="true"
                      />
                      <span className="toc-item-text">{item.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      )}
    </>
  );
}
