"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { AlignLeft, PanelRightClose, PanelRightOpen, AlertTriangle, FilePlus } from "lucide-react";

import { useLayout } from "@/context/LayoutContext";
import type { TocItem } from "@/types/docs";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [capsuleMetrics, setCapsuleMetrics] = useState<{ top: number; height: number }>({
    top: 0,
    height: 28,
  });

  const activeIdRef = useRef<string>(items[0]?.id || "");
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement>(null);
  const tocAsideRef = useRef<HTMLElement>(null);
  const isClickingRef = useRef<boolean>(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { tocOpen, toggleToc } = useLayout();

  // 1. Update active gliding capsule metrics based on real DOM item position
  const updateCapsulePosition = useCallback(() => {
    if (items.length === 0) return;
    const activeIndex = items.findIndex((i) => i.id === activeId);
    const targetIdx = activeIndex >= 0 ? activeIndex : 0;
    const activeEl = itemRefs.current[targetIdx];

    if (activeEl) {
      setCapsuleMetrics({
        top: activeEl.offsetTop,
        height: activeEl.offsetHeight || 28,
      });
    }
  }, [activeId, items]);

  useEffect(() => {
    updateCapsulePosition();
    window.addEventListener("resize", updateCapsulePosition, { passive: true });
    return () => window.removeEventListener("resize", updateCapsulePosition);
  }, [updateCapsulePosition]);

  // 2. High-Performance Live Viewport Scroll Spy
  useEffect(() => {
    if (items.length === 0) return;

    let ticking = false;

    const onScroll = () => {
      // If user clicked a TOC link, let smooth scroll complete before spy takes over
      if (isClickingRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowH = window.innerHeight;
          const docH = document.documentElement.scrollHeight;
          const totalHeight = docH - windowH;

          // Calculate reading progress percentage
          if (totalHeight > 0) {
            setScrollProgress(Math.min(100, Math.max(0, Math.round((scrollY / totalHeight) * 100))));
          }

          // Bottom of page lock: if scrolled to the very bottom, highlight the last heading
          if (scrollY + windowH >= docH - 30) {
            const lastId = items[items.length - 1].id;
            if (activeIdRef.current !== lastId) {
              activeIdRef.current = lastId;
              setActiveId(lastId);
            }
            ticking = false;
            return;
          }

          // Dynamic live check against headings in viewport
          const triggerLine = 120; // 120px from top
          let candidateId = items[0]?.id || "";

          for (let i = 0; i < items.length; i++) {
            const el = document.getElementById(items[i].id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= triggerLine) {
                candidateId = items[i].id;
              } else {
                break;
              }
            }
          }

          if (candidateId && candidateId !== activeIdRef.current) {
            activeIdRef.current = candidateId;
            setActiveId(candidateId);
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

  // 3. Smooth Click Handler with Lock
  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      isClickingRef.current = true;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

      activeIdRef.current = id;
      setActiveId(id);

      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);

      clickTimeoutRef.current = setTimeout(() => {
        isClickingRef.current = false;
      }, 700);
    }
  };

  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeIdx = activeIndex >= 0 ? activeIndex : 0;

  // Auto-scroll TOC container if active heading goes out of view
  useEffect(() => {
    if (itemRefs.current[activeIdx] && tocAsideRef.current) {
      const itemEl = itemRefs.current[activeIdx]!;
      const asideEl = tocAsideRef.current;
      const asideRect = asideEl.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();

      if (itemRect.bottom > asideRect.bottom - 16 || itemRect.top < asideRect.top + 16) {
        itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIdx]);

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

        {/* Clean, Orderly, Ultra-Refined TOC Navigation */}
        <nav className="toc-clean-nav">
          <div className="toc-clean-list-wrapper">
            {/* GPU-Accelerated Gliding Frosted Glass Capsule */}
            <div
              className="toc-gliding-capsule"
              style={{
                transform: `translate3d(0, ${capsuleMetrics.top}px, 0)`,
                height: `${capsuleMetrics.height}px`,
              }}
              aria-hidden="true"
            />

            <ul role="list" className="toc-clean-list" ref={listRef}>
              {items.map((item, index) => {
                const isActive = activeId === item.id;
                const depth = Math.min(Math.max(item.depth || 2, 1), 4);

                return (
                  <li
                    key={`${item.id}-${index}`}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={`toc-clean-row toc-clean-row--${depth}`}
                  >
                    <a
                      href={`#${item.id}`}
                      onClick={handleClick(item.id)}
                      className={`toc-clean-link toc-clean-link--${depth} ${isActive ? "toc-clean-link--active" : ""}`}
                      aria-current={isActive ? "location" : undefined}
                    >
                      {depth >= 3 && (
                        <span className={`toc-nested-pip toc-nested-pip--${depth}`} aria-hidden="true" />
                      )}
                      <span className="toc-clean-text">{item.title}</span>
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


