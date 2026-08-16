"use client";
import React, { useEffect, useState, useMemo } from "react";
import { AlignLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import type { TocItem } from "@/types/docs";

interface TableOfContentsProps {
  items: TocItem[];
}

const ITEM_ROW_HEIGHT = 28;
const START_OFFSET_Y = 14;

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

  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeIdx = activeIndex >= 0 ? activeIndex : 0;

  // Calculate coordinates for every item
  const nodePoints = useMemo(() => {
    return items.map((item, index) => {
      const isNested = item.depth >= 3;
      const x = isNested ? 20 : 8;
      const y = START_OFFSET_Y + index * ITEM_ROW_HEIGHT;
      return { x, y, id: item.id, depth: item.depth, title: item.title };
    });
  }, [items]);

  // Construct continuous flowing S-curve path
  const { fullPathD, activePathD, totalSvgHeight } = useMemo(() => {
    if (nodePoints.length === 0)
      return { fullPathD: "", activePathD: "", totalSvgHeight: 100 };

    let fullD = `M ${nodePoints[0].x} ${nodePoints[0].y}`;
    let activeD = `M ${nodePoints[0].x} ${nodePoints[0].y}`;

    for (let i = 1; i < nodePoints.length; i++) {
      const p0 = nodePoints[i - 1];
      const p1 = nodePoints[i];
      const midY = (p0.y + p1.y) / 2;
      const curveSegment = ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
      fullD += curveSegment;

      if (i <= activeIdx) {
        activeD += curveSegment;
      }
    }

    const totalHeight =
      START_OFFSET_Y * 2 + (nodePoints.length - 1) * ITEM_ROW_HEIGHT;

    return {
      fullPathD: fullD,
      activePathD: activeD,
      totalSvgHeight: Math.max(totalHeight, 100),
    };
  }, [nodePoints, activeIdx]);

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
          {/* Header */}
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

          {/* Continuous Flowing Curved S-Track Navigation */}
          <nav className="toc-river-container">
            {/* SVG Flow River Curves */}
            <svg
              className="toc-flow-svg"
              width="32"
              height={totalSvgHeight}
              viewBox={`0 0 32 ${totalSvgHeight}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="toc-active-lava-gradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="hsl(26 100% 55%)" />
                  <stop offset="100%" stopColor="hsl(38 100% 55%)" />
                </linearGradient>
                <filter id="toc-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Inactive Base Track Curve */}
              <path
                d={fullPathD}
                stroke="var(--color-border)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Active Glowing Flow Curve */}
              <path
                d={activePathD}
                stroke="url(#toc-active-lava-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                filter="url(#toc-glow)"
                className="toc-active-flow-path"
              />

              {/* River Node Dots */}
              {nodePoints.map((pt, idx) => {
                const isActive = activeId === pt.id;
                const isPassed = idx <= activeIdx;

                return (
                  <g key={pt.id} transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle
                      r={isActive ? "4" : "2.5"}
                      fill={
                        isActive
                          ? "hsl(38 100% 55%)"
                          : isPassed
                          ? "hsl(26 100% 52%)"
                          : "var(--color-surface-raised)"
                      }
                      stroke={
                        isActive
                          ? "hsl(26 100% 52%)"
                          : isPassed
                          ? "hsl(26 100% 52% / 0.5)"
                          : "var(--color-border-strong)"
                      }
                      strokeWidth={isActive ? "2" : "1.5"}
                    />
                    {isActive && (
                      <circle
                        r="7"
                        fill="none"
                        stroke="hsl(26 100% 52%)"
                        strokeWidth="1"
                        opacity="0.6"
                        className="toc-ping-ring"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* List of Titles */}
            <ul role="list" className="toc-flow-list">
              {items.map((item) => {
                const isActive = activeId === item.id;
                const isNested = item.depth >= 3;

                return (
                  <li
                    key={item.id}
                    className={`toc-flow-item-wrap ${isNested ? "toc-flow-item-wrap--nested" : ""}`}
                    style={{ height: `${ITEM_ROW_HEIGHT}px` }}
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
