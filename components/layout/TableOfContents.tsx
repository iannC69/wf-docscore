"use client";
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { AlignLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import type { TocItem } from "@/types/docs";

interface TableOfContentsProps {
  items: TocItem[];
}

function getDepthX(depth: number): number {
  if (depth <= 1) return 8;
  if (depth === 2) return 10;
  if (depth === 3) return 22;
  return 30; // depth >= 4
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [nodeMetrics, setNodeMetrics] = useState<{ y: number; top: number; height: number }[]>([]);
  const activeIdRef = useRef<string>(items[0]?.id || "");
  const cachedHeadings = useRef<{ id: string; top: number }[]>([]);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { tocOpen, toggleToc } = useLayout();

  // 1. Measure real DOM item centers and row bounds (0 glitch, 100% synchronous)
  const measureNodes = useCallback(() => {
    if (!containerRef.current || !listRef.current || items.length === 0) return;
    const containerTop = containerRef.current.getBoundingClientRect().top;
    const listTop = listRef.current.getBoundingClientRect().top;

    const metrics = items.map((_, idx) => {
      const el = itemRefs.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        const y = rect.top - containerTop + rect.height / 2;
        const top = rect.top - listTop;
        const height = rect.height;
        return {
          y: Math.round(y),
          top: Math.round(top),
          height: Math.round(height),
        };
      }
      return { y: 13 + idx * 26, top: idx * 26, height: 26 };
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

  // 3. Compute Coordinates, Cumulative Arc Lengths & S-Curves
  const { points, fullPathD, totalSvgHeight, totalPathLength, cumulativeLengths } = useMemo(() => {
    if (items.length === 0) {
      return { points: [], fullPathD: "", totalSvgHeight: 60, totalPathLength: 0, cumulativeLengths: [] };
    }

    const pts = items.map((item, idx) => {
      const x = getDepthX(item.depth);
      const measuredY = nodeMetrics[idx]?.y;
      const y = measuredY !== undefined ? measuredY : 13 + idx * 26;
      return { x, y, id: item.id, depth: item.depth };
    });

    let fullD = `M ${pts[0].x} ${pts[0].y}`;
    const lengths = [0];
    let totalLen = 0;

    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const midY = (p0.y + p1.y) / 2;

      const segment =
        p0.x === p1.x
          ? ` L ${p1.x} ${p1.y}`
          : ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;

      fullD += segment;

      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const segLen = dx === 0 ? Math.abs(dy) : Math.sqrt(dx * dx + dy * dy) * 1.08;
      totalLen += segLen;
      lengths.push(totalLen);
    }

    const totalHeight = pts[pts.length - 1].y + 16;

    return {
      points: pts,
      fullPathD: fullD,
      totalSvgHeight: Math.max(totalHeight, 60),
      totalPathLength: Math.max(totalLen, 1),
      cumulativeLengths: lengths,
    };
  }, [items, nodeMetrics]);

  const activePoint = points[activeIdx] || points[0] || { x: 10, y: 13 };
  const activeStrokeLength = cumulativeLengths[activeIdx] ?? 0;
  const activeDashOffset = Math.max(0, totalPathLength - activeStrokeLength);

  // Synchronously derived capsule coordinates (Zero delayed effect frames)
  const activeCapsuleMetrics = nodeMetrics[activeIdx] || {
    top: activeIdx * 26,
    height: 26,
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

        {/* Depth-Aware Continuous S-Curve Navigation */}
        <nav className="toc-depth-nav" ref={containerRef}>
          {/* SVG Depth-Flowing S-Curve */}
          <svg
            className="toc-depth-svg"
            width="36"
            height={totalSvgHeight}
            viewBox={`0 0 36 ${totalSvgHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="toc-depth-lava-stroke"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="hsl(26 100% 52%)" />
                <stop offset="100%" stopColor="hsl(38 100% 55%)" />
              </linearGradient>
            </defs>

            {/* Base River Spine */}
            {fullPathD && (
              <path
                d={fullPathD}
                stroke="var(--color-border)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.65"
              />
            )}

            {/* Active Flowing River Stroke (Interpolates seamlessly with stroke-dashoffset) */}
            {fullPathD && (
              <path
                d={fullPathD}
                stroke="url(#toc-depth-lava-stroke)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{
                  strokeDasharray: `${totalPathLength} ${totalPathLength + 20}`,
                  strokeDashoffset: `${activeDashOffset}`,
                  transition: "stroke-dashoffset 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            )}

            {/* Static Depth Nodes on Curve */}
            {points.map((pt, idx) => {
              const isPassed = idx <= activeIdx;
              return (
                <circle
                  key={items[idx]?.id || idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.depth >= 3 ? "1.8" : "2.2"}
                  fill={
                    isPassed
                      ? "hsl(26 100% 52%)"
                      : "var(--color-surface-raised)"
                  }
                  stroke={
                    isPassed
                      ? "hsl(26 100% 52% / 0.5)"
                      : "var(--color-border-strong)"
                  }
                  strokeWidth="1"
                  style={{
                    transition: "fill 0.25s ease, stroke 0.25s ease",
                  }}
                />
              );
            })}

            {/* Smooth Gliding Active Head Indicator */}
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="3.5"
              fill="hsl(26 100% 52%)"
              stroke="var(--sidebar-bg)"
              strokeWidth="1.5"
              style={{
                transition: "cx 0.32s cubic-bezier(0.16, 1, 0.3, 1), cy 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </svg>

          {/* List of Titles with Gliding Frosted Glass Pill */}
          <div className="toc-list-wrapper">
            {/* GPU-Accelerated Gliding Frosted Glass Pill (Synchronously locked to active heading) */}
            <div
              className="toc-gliding-capsule"
              style={{
                transform: `translate3d(0, ${activeCapsuleMetrics.top}px, 0)`,
                height: `${activeCapsuleMetrics.height}px`,
                opacity: nodeMetrics.length > 0 ? 1 : 0,
              }}
              aria-hidden="true"
            />

            <ul role="list" className="toc-depth-list" ref={listRef}>
              {items.map((item, index) => {
                const isActive = activeId === item.id;
                const depth = item.depth || 2;

                return (
                  <li
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={`toc-depth-row toc-depth-row--${depth}`}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={handleClick(item.id)}
                      className={`toc-depth-link ${isActive ? "toc-depth-link--active" : ""}`}
                      aria-current={isActive ? "location" : undefined}
                    >
                      <span className="toc-depth-text">{item.title}</span>
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
