"use client";
import { useEffect, useState } from "react";
import type { TocItem } from "@/types/docs";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items.map(item => document.getElementById(item.id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting heading
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-64px 0% -80% 0%",
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
    }
  };

  return (
    <aside className="toc" aria-label="On this page">
      <p className="toc-title">On this page</p>
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
  );
}
