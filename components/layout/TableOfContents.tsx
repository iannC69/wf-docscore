"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
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
  const [pathTotalLength, setPathTotalLength] = useState<number>(0);
  const pathRef = useRef<SVGPathElement>(null);
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

  // Calculate coordinates for every item
  const nodePoints = useMemo(() => {
    return items.map((item, index) => {
      const isNested = item.depth >= 3;
      const x = isNested ? 20 : 8;
      const y = START_OFFSET_Y + index * ITEM_ROW_HEIGHT;
      return { x, y, id: item.id, depth: item.depth, title: item.title, index };
    });
  }, [items]);

  // Construct continuous flowing S-curve path (Fixed geometry, animated via dashoffset)
  const { fullPathD, totalSvgHeight } = useMemo(() => {
    if (nodePoints.length === 0)
      return { fullPathD: "", totalSvgHeight: 100 };

    let fullD = `M ${nodePoints[0].x} ${nodePoints[0].y}`;

    for (let i = 1; i < nodePoints.length; i++) {
      const p0 = nodePoints[i - 1];
      const p1 = nodePoints[i];
      const midY = (p0.y + p1.y) / 2;
      fullD += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
    }

    const totalHeight =
      START_OFFSET_Y * 2 + (nodePoints.length - 1) * ITEM_ROW_HEIGHT;

    return {
      fullPathD: fullD,
      totalSvgHeight: Math.max(totalHeight, 100),
    };
  }, [nodePoints]);

  // Measure path length on SVG mount
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathTotalLength(len);
    }
  }, [fullPathD]);

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
  const activePoint = nodePoints[activeIdx] || nodePoints[0] || { x: 8, y: 14 };

  // Calculate active path length for smooth dashoffset liquid transition
  const activeLength =
    pathTotalLength > 0 && nodePoints.length > 1
      ? (activeIdx / (nodePoints.length - 1)) * pathTotalLength
      : 0;

  const dashOffset =
    pathTotalLength > 0 ? Math.max(0, pathTotalLength - activeLength) : 0;

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
              width="30"
              height={totalSvgHeight}
              viewBox={`0 0 30 ${totalSvgHeight}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="toc-lava-stroke"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="hsl(26 100% 55%)" />
                  <stop offset="100%" stopColor="hsl(42 100% 58%)" />
                </linearGradient>
              </defs>

              {/* Inactive Base River Spine */}
              <path
                d={fullPathD}
                stroke="var(--color-border)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.8"
              />

              {/* Active Smooth Liquid Flow (Animated via CSS strokeDashoffset) */}
              <path
                ref={pathRef}
                d={fullPathD}
                stroke="url(#toc-lava-stroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{
                  strokeDasharray: pathTotalLength > 0 ? pathTotalLength : 1000,
                  strokeDashoffset: dashOffset,
                  transition: "stroke-dashoffset 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  filter: "drop-shadow(0 0 4px hsl(26 100% 52% / 0.6))",
                }}
              />

              {/* Static Background Nodes */}
              {nodePoints.map((pt, idx) => {
                const isPassed = idx <= activeIdx;
                return (
                  <circle
                    key={pt.id}
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.depth >= 3 ? "2" : "2.5"}
                    fill={
                      isPassed
                        ? "hsl(26 100% 52%)"
                        : "var(--color-surface-raised)"
                    }
                    stroke={
                      isPassed
                        ? "hsl(26 100% 52% / 0.4)"
                        : "var(--color-border-strong)"
                    }
                    strokeWidth="1"
                    style={{ transition: "fill 0.3s ease, stroke 0.3s ease" }}
                  />
                );
              })}

              {/* Smooth Gliding Active Ember Bead */}
              <g
                style={{
                  transform: `translate(${activePoint.x}px, ${activePoint.y}px)`,
                  transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Outer Glow Halo */}
                <circle
                  r="7"
                  fill="hsl(26 100% 52% / 0.2)"
                  className="toc-ping-halo"
                />
                {/* Core Glowing Ember Node */}
                <circle
                  r="4"
                  fill="hsl(44 100% 60%)"
                  stroke="hsl(26 100% 52%)"
                  strokeWidth="1.5"
                  style={{
                    filter: "drop-shadow(0 0 6px hsl(26 100% 52%))",
                  }}
                />
              </g>
            </svg>

            {/* List of Titles */}
            <ul role="list" className="toc-flow-list">
              {items.map((item, index) => {
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
