"use client";
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { AlignLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import type { TocItem } from "@/types/docs";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [nodePositions, setNodePositions] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const { tocOpen, toggleToc } = useLayout();

  // 1. Measure real DOM item centers (0 glitch, 100% accurate alignment)
  const measureNodes = useCallback(() => {
    if (!containerRef.current || items.length === 0) return;
    const containerTop = containerRef.current.getBoundingClientRect().top;

    const positions = items.map((item, idx) => {
      const el = itemRefs.current[idx];
      const isNested = item.depth >= 3;
      const x = isNested ? 18 : 7;
      if (el) {
        const rect = el.getBoundingClientRect();
        const y = rect.top - containerTop + rect.height / 2;
        return { x, y: Math.round(y) };
      }
      return { x, y: 13 + idx * 26 };
    });

    setNodePositions(positions);
  }, [items]);

  useEffect(() => {
    measureNodes();
    window.addEventListener("resize", measureNodes, { passive: true });
    return () => window.removeEventListener("resize", measureNodes);
  }, [measureNodes]);

  // 2. High-Performance Deterministic Scroll Spy (0 Jitter, 0 Spike, 0 Delay)
  useEffect(() => {
    if (items.length === 0) return;

    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowH = window.innerHeight;
        const docH = document.documentElement.scrollHeight;
        const totalHeight = docH - windowH;

        // Reading progress percentage
        if (totalHeight > 0) {
          const current = (scrollY / totalHeight) * 100;
          setScrollProgress(Math.min(100, Math.max(0, Math.round(current))));
        }

        // Bottom of page lock
        if (scrollY + windowH >= docH - 50) {
          setActiveId(items[items.length - 1].id);
          return;
        }

        // Find currently active heading closest to top viewport trigger
        const offsetTrigger = 110;
        let matchedId = items[0].id;

        for (let i = 0; i < items.length; i++) {
          const el = document.getElementById(items[i].id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= offsetTrigger) {
              matchedId = items[i].id;
            } else {
              break;
            }
          }
        }

        setActiveId(matchedId);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 75;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeIdx = activeIndex >= 0 ? activeIndex : 0;

  // Use measured positions or calculated fallbacks
  const points = nodePositions.length === items.length
    ? nodePositions
    : items.map((item, idx) => ({
        x: item.depth >= 3 ? 18 : 7,
        y: 13 + idx * 26,
      }));

  const activePoint = points[activeIdx] || points[0] || { x: 7, y: 13 };
  const totalSvgHeight = points.length > 0 ? points[points.length - 1].y + 16 : 60;

  // Construct full background curve
  let fullPathD = "";
  if (points.length > 0) {
    fullPathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const midY = (p0.y + p1.y) / 2;
      fullPathD += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
    }
  }

  // Construct active flowing curve up to active index
  let activePathD = "";
  if (points.length > 0 && activeIdx >= 0) {
    activePathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i <= activeIdx; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const midY = (p0.y + p1.y) / 2;
      activePathD += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
    }
  }

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

          {/* Continuous Flowing Curved S-Track Navigation */}
          <nav className="toc-river-container" ref={containerRef}>
            {/* SVG Flow River Curves */}
            <svg
              className="toc-flow-svg"
              width="26"
              height={totalSvgHeight}
              viewBox={`0 0 26 ${totalSvgHeight}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="toc-clean-lava"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="hsl(26 100% 52%)" />
                  <stop offset="100%" stopColor="hsl(38 100% 55%)" />
                </linearGradient>
              </defs>

              {/* Inactive Base River Spine */}
              {fullPathD && (
                <path
                  d={fullPathD}
                  stroke="var(--color-border)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.8"
                />
              )}

              {/* Active Clean Liquid Flow Line */}
              {activePathD && (
                <path
                  d={activePathD}
                  stroke="url(#toc-clean-lava)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}

              {/* Background Node Markers */}
              {points.map((pt, idx) => {
                const isPassed = idx <= activeIdx;
                return (
                  <circle
                    key={items[idx]?.id || idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={items[idx]?.depth >= 3 ? "1.8" : "2.2"}
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
                  />
                );
              })}

              {/* Gliding Active Indicator Dot */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="3.5"
                fill="hsl(26 100% 52%)"
                stroke="var(--color-bg)"
                strokeWidth="1.5"
                style={{
                  transition: "cx 0.22s cubic-bezier(0.2, 0, 0, 1), cy 0.22s cubic-bezier(0.2, 0, 0, 1)",
                }}
              />
            </svg>

            {/* List of Titles */}
            <ul role="list" className="toc-flow-list">
              {items.map((item, index) => {
                const isActive = activeId === item.id;
                const isNested = item.depth >= 3;

                return (
                  <li
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={`toc-flow-item-wrap ${isNested ? "toc-flow-item-wrap--nested" : ""}`}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={handleClick(item.id)}
                      className={`toc-flow-link ${isActive ? "toc-flow-link--active" : ""} ${isNested ? "toc-flow-link--nested" : ""}`}
                      aria-current={isActive ? "location" : undefined}
                    >
                      <span className="toc-flow-text">{item.title}</span>
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
