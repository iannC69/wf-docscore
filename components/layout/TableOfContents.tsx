"use client";
import { useEffect, useState } from "react";
import { AlignLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import type { TocItem } from "@/types/docs";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const { tocOpen, toggleToc } = useLayout();

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items.map(item => document.getElementById(item.id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-64px 0% -70% 0%",
        threshold: 0,
      }
    );

    headings.forEach(h => h && observer.observe(h));
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
          <div className="toc-header">
            <AlignLeft size={13} className="toc-header-icon" aria-hidden="true" />
            <span className="toc-title">On this page</span>
            <button
              type="button"
              onClick={toggleToc}
              className="toc-collapse-btn"
              title="Collapse Table of Contents (Shortcut: ])"
              aria-label="Collapse table of contents"
            >
              <PanelRightClose size={14} />
            </button>
          </div>
          <nav>
            <ul role="list" className="toc-list">
              {items.map(item => (
                <li key={item.id} data-depth={item.depth}>
                  <a
                    href={`#${item.id}`}
                    onClick={handleClick(item.id)}
                    className={`toc-item${activeId === item.id ? " toc-item--active" : ""}`}
                    data-depth={item.depth}
                    aria-current={activeId === item.id ? "location" : undefined}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}
    </>
  );
}
