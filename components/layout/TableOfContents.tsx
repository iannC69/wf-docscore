"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { AlignLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import type { TocItem } from "@/types/docs";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const activeIdRef = useRef<string>(items[0]?.id || "");
  const cachedHeadings = useRef<{ id: string; top: number }[]>([]);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number; opacity: number }>({
    top: 0,
    height: 24,
    opacity: 0,
  });
  const { tocOpen, toggleToc } = useLayout();

  // 1. Cache heading offsets on load & on resize (Zero layout thrashing during scroll)
  const updateHeadingOffsets = useCallback(() => {
    if (typeof window === "undefined" || items.length === 0) return;

    cachedHeadings.current = items
      .map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          id: item.id,
          top: rect.top + window.scrollY,
        };
      })
      .filter(Boolean) as { id: string; top: number }[];
  }, [items]);

  useEffect(() => {
    // Initial measure after DOM paints
    const timer = setTimeout(updateHeadingOffsets, 100);
    window.addEventListener("resize", updateHeadingOffsets, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateHeadingOffsets);
    };
  }, [updateHeadingOffsets]);

  // 2. Ultra-Lightweight Passive Scroll Listener (Pure arithmetic, 120 FPS GPU locked)
  useEffect(() => {
    if (items.length === 0) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowH = window.innerHeight;
          const docH = document.documentElement.scrollHeight;
          const totalHeight = docH - windowH;

          // Reading progress
          if (totalHeight > 0) {
            setScrollProgress(Math.min(100, Math.max(0, Math.round((scrollY / totalHeight) * 100))));
          }

          // Bottom of page lock
          if (scrollY + windowH >= docH - 40) {
            const lastId = items[items.length - 1].id;
            if (activeIdRef.current !== lastId) {
              activeIdRef.current = lastId;
              setActiveId(lastId);
            }
            ticking = false;
            return;
          }

          // Fast arithmetic search in cached offsets
          const offsets = cachedHeadings.current;
          if (offsets.length > 0) {
            const triggerY = scrollY + 110;
            let currentId = offsets[0].id;

            for (let i = 0; i < offsets.length; i++) {
              if (triggerY >= offsets[i].top) {
                currentId = offsets[i].id;
              } else {
                break;
              }
            }

            if (currentId !== activeIdRef.current) {
              activeIdRef.current = currentId;
              setActiveId(currentId);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  // 3. Update Hardware-Accelerated Indicator Position
  useEffect(() => {
    const activeIdx = items.findIndex((item) => item.id === activeId);
    if (activeIdx >= 0 && itemRefs.current[activeIdx] && containerRef.current) {
      const itemEl = itemRefs.current[activeIdx]!;
      const containerEl = containerRef.current;
      const itemRect = itemEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      setIndicatorStyle({
        top: itemRect.top - containerRect.top,
        height: itemRect.height,
        opacity: 1,
      });
    }
  }, [activeId, items]);

  if (items.length === 0) return null;

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 75;
      window.scrollTo({ top, behavior: "smooth" });
      activeIdRef.current = id;
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
          <PanelRightOpen size={15} />
          <span className="floating-toggle-label">Contents</span>
        </button>
      )}

      {tocOpen && (
        <aside
          className="toc"
          aria-label="Table of contents"
          data-collapsed={!tocOpen}
        >
          {/* Header */}
          <div className="toc-header">
            <div className="toc-header-left">
              <span className="toc-header-icon-box">
                <AlignLeft size={11} className="toc-header-icon" aria-hidden="true" />
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
                <PanelRightClose size={12} />
                <kbd className="toc-collapse-kbd" aria-hidden="true">]</kbd>
              </button>
            </div>
          </div>

          {/* Ultra-Smooth Tree Navigation with Hardware-Accelerated Indicator */}
          <nav className="toc-tree-nav" ref={containerRef}>
            {/* Background Rail */}
            <div className="toc-rail-track" aria-hidden="true" />

            {/* GPU-Accelerated Sliding Indicator Slug */}
            <div
              className="toc-active-indicator-slug"
              style={{
                transform: `translate3d(0, ${indicatorStyle.top}px, 0)`,
                height: `${indicatorStyle.height}px`,
                opacity: indicatorStyle.opacity,
              }}
              aria-hidden="true"
            />

            {/* List of Headings */}
            <ul role="list" className="toc-list-items">
              {items.map((item, index) => {
                const isActive = activeId === item.id;
                const isNested = item.depth >= 3;

                return (
                  <li
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={`toc-node-row ${isNested ? "toc-node-row--nested" : ""}`}
                  >
                    {/* Curved Connector Elbow for Nested Subsections */}
                    {isNested && (
                      <span
                        className={`toc-curved-elbow ${isActive ? "toc-curved-elbow--active" : ""}`}
                        aria-hidden="true"
                      />
                    )}

                    <a
                      href={`#${item.id}`}
                      onClick={handleClick(item.id)}
                      className={`toc-node-link ${isActive ? "toc-node-link--active" : ""} ${isNested ? "toc-node-link--nested" : ""}`}
                      aria-current={isActive ? "location" : undefined}
                    >
                      <span
                        className={`toc-node-pip ${isActive ? "toc-node-pip--active" : ""}`}
                        aria-hidden="true"
                      />
                      <span className="toc-node-label">{item.title}</span>
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
