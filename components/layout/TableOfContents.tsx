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
  const [nodeMetrics, setNodeMetrics] = useState<{ top: number; height: number }[]>([]);
  const activeIdRef = useRef<string>(items[0]?.id || "");
  const prevActiveIdxRef = useRef<number>(0);
  const cachedHeadings = useRef<{ id: string; top: number }[]>([]);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement>(null);
  const tocAsideRef = useRef<HTMLElement>(null);
  const { tocOpen, toggleToc } = useLayout();

  // 1. Measure real DOM item bounds (Synchronous, zero layout thrashing)
  const measureNodes = useCallback(() => {
    if (!listRef.current || items.length === 0) return;
    const listTop = listRef.current.getBoundingClientRect().top;

    const metrics = items.map((_, idx) => {
      const el = itemRefs.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        const top = rect.top - listTop;
        const height = rect.height;
        return {
          top: Math.round(top),
          height: Math.round(height),
        };
      }
      return { top: idx * 28, height: 28 };
    });

    setNodeMetrics(metrics);
  }, [items]);

  useEffect(() => {
    measureNodes();
    window.addEventListener("resize", measureNodes, { passive: true });
    return () => window.removeEventListener("resize", measureNodes);
  }, [measureNodes]);

  // 2. High-Performance Deterministic Scroll Spy (0 Layout Thrashing, 120 FPS Locked)
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
    const timer = setTimeout(updateHeadingOffsets, 100);
    window.addEventListener("resize", updateHeadingOffsets, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateHeadingOffsets);
    };
  }, [updateHeadingOffsets]);

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

          // Reverse fast search in cached offsets
          const offsets = cachedHeadings.current;
          if (offsets.length > 0) {
            const triggerY = scrollY + 110;
            let currentId = offsets[0].id;

            for (let i = offsets.length - 1; i >= 0; i--) {
              if (triggerY >= offsets[i].top) {
                currentId = offsets[i].id;
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

  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeIdx = activeIndex >= 0 ? activeIndex : 0;

  // 3. Adaptive Dynamic Velocity (Adapts transition speed based on scroll velocity)
  const delta = Math.abs(activeIdx - prevActiveIdxRef.current);
  useEffect(() => {
    prevActiveIdxRef.current = activeIdx;

    // Auto-scroll TOC container if heading goes out of card view during rapid scrolling
    if (itemRefs.current[activeIdx] && tocAsideRef.current) {
      const itemEl = itemRefs.current[activeIdx]!;
      const asideEl = tocAsideRef.current;
      const asideRect = asideEl.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();

      if (itemRect.bottom > asideRect.bottom - 16 || itemRect.top < asideRect.top + 16) {
        itemEl.scrollIntoView({ block: "nearest", behavior: delta > 2 ? "auto" : "smooth" });
      }
    }
  }, [activeIdx, delta]);

  // Motion physics timing
  const motionDuration = delta >= 3 ? "0.12s" : delta === 2 ? "0.18s" : "0.26s";
  const motionEasing = delta >= 3 ? "cubic-bezier(0.1, 0.9, 0.2, 1)" : "cubic-bezier(0.16, 1, 0.3, 1)";

  // Synchronously derived capsule coordinates (Zero delayed effect frames)
  const activeCapsuleMetrics = nodeMetrics[activeIdx] || {
    top: activeIdx * 28,
    height: 28,
  };

  return (
    <>
      {/* Floating reopen button if TOC is closed on wide screens */}
      <button
        type="button"
        onClick={toggleToc}
        className={`toc-floating-toggle ${!tocOpen ? "toc-floating-toggle--visible" : ""}`}
        title="Expand Right Table of Contents (Shortcut: ])"
        aria-label="Expand table of contents"
      >
        <PanelRightOpen size={15} />
        <span className="floating-toggle-label">Contents</span>
      </button>

      <aside
        ref={tocAsideRef}
        className={`toc ${tocOpen ? "toc--open" : "toc--collapsed"}`}
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

        {/* Deep Recessed Liquid Glass Spine & Navigation */}
        <nav className="toc-deep-nav">
          {/* Deep Recessed Trench Rail on the Left */}
          <div className="toc-deep-trench" aria-hidden="true">
            {/* Glowing Liquid Droplet Pill Gliding Inside the Trench */}
            <div
              className="toc-trench-liquid-core"
              style={{
                transform: `translate3d(0, ${activeCapsuleMetrics.top + 4}px, 0)`,
                height: `${Math.max(16, activeCapsuleMetrics.height - 8)}px`,
                transition: `transform ${motionDuration} ${motionEasing}, height ${motionDuration} ${motionEasing}`,
              }}
            />
          </div>

          {/* List of Titles with Gliding Magnetic Frosted Glass Capsule */}
          <div className="toc-deep-list-wrapper">
            {/* GPU-Accelerated Gliding Frosted Glass Pill */}
            <div
              className="toc-gliding-capsule"
              style={{
                transform: `translate3d(0, ${activeCapsuleMetrics.top}px, 0)`,
                height: `${activeCapsuleMetrics.height}px`,
                opacity: nodeMetrics.length > 0 ? 1 : 0,
                transition: `transform ${motionDuration} ${motionEasing}, height ${motionDuration} ${motionEasing}, opacity 0.2s ease`,
              }}
              aria-hidden="true"
            />

            <ul role="list" className="toc-deep-list" ref={listRef}>
              {items.map((item, index) => {
                const isActive = activeId === item.id;
                const depth = item.depth || 2;

                return (
                  <li
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={`toc-deep-row toc-deep-row--${depth}`}
                  >
                    {/* Delicate Glass Branch Elbow for Nested Subsections */}
                    {depth >= 3 && (
                      <span
                        className={`toc-branch-connector ${isActive ? "toc-branch-connector--active" : ""}`}
                        aria-hidden="true"
                      />
                    )}

                    <a
                      href={`#${item.id}`}
                      onClick={handleClick(item.id)}
                      className={`toc-deep-link ${isActive ? "toc-deep-link--active" : ""} ${depth >= 3 ? "toc-deep-link--nested" : ""}`}
                      aria-current={isActive ? "location" : undefined}
                    >
                      <span className="toc-deep-text">{item.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
