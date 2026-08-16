"use client";
import React, { useState, useEffect } from "react";
import { AlignLeft, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { TocItem } from "@/types/docs";

interface MobileTableOfContentsProps {
  items: TocItem[];
}

export function MobileTableOfContents({ items }: MobileTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const { t } = useLanguage();

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

  if (!items || items.length === 0) return null;

  const handleLinkClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
      window.history.pushState(null, "", `#${id}`);
      setIsOpen(false);
    }
  };

  const activeItem = items.find((i) => i.id === activeId);

  return (
    <div className="mobile-toc-container">
      <button
        type="button"
        className={`mobile-toc-btn ${isOpen ? "mobile-toc-btn--open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle page navigation"
      >
        <span className="mobile-toc-left">
          <AlignLeft size={13} className="mobile-toc-icon" aria-hidden="true" />
          <span className="mobile-toc-label">
            {t.docPage.onThisPage}{activeItem ? `: ` : ""}
            {activeItem && <span className="mobile-toc-active-title">{activeItem.title}</span>}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`mobile-toc-chevron ${isOpen ? "mobile-toc-chevron--open" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="mobile-toc-dropdown">
          <ul role="list" className="mobile-toc-list">
            {items.map((item) => (
              <li
                key={item.id}
                className={`mobile-toc-item ${item.depth === 3 ? "mobile-toc-item--nested" : ""}`}
              >
                <a
                  href={`#${item.id}`}
                  onClick={handleLinkClick(item.id)}
                  className={`mobile-toc-link ${activeId === item.id ? "mobile-toc-link--active" : ""}`}
                >
                  <span className="mobile-toc-indicator" aria-hidden="true" />
                  <span>{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
