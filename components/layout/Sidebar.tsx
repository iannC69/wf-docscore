import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LiquidFireWave } from "@/components/ui/LiquidEffects";
import type { NavGroup, NavItem } from "@/types/docs";

interface SidebarProps {
  nav: NavGroup[];
  currentSlug?: string;
}

function NavItemRow({ item, currentSlug, depth = 0 }: {
  item: NavItem;
  currentSlug?: string;
  depth?: number;
}) {
  const isActive = item.slug === currentSlug ||
    item.href === `/docs/${currentSlug}` ||
    (currentSlug && currentSlug.startsWith(item.slug + "/"));
  const isExact = item.slug === currentSlug || item.href === `/docs/${currentSlug}`;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li>
      <Link
        href={item.href}
        className={`nav-item${isExact ? " nav-item--active" : ""}${isActive && !isExact ? " nav-item--ancestor" : ""}`}
        data-depth={depth}
        aria-current={isExact ? "page" : undefined}
      >
        <span className="nav-item-text">{item.title}</span>
        {item.badge && (
          <span className={`badge badge--${item.badge.toLowerCase()}`}>
            {item.badge}
          </span>
        )}
        {hasChildren && !isExact && (
          <ChevronRight size={12} className="nav-item-chevron" aria-hidden="true" />
        )}
      </Link>
      {hasChildren && isActive && (
        <ul className="nav-children" role="list">
          {item.children!.map(child => (
            <NavItemRow key={child.slug} item={child} currentSlug={currentSlug} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Sidebar({ nav, currentSlug }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div id="sidebar-overlay" className="sidebar-overlay" aria-hidden="true" data-open="false" />

      <aside
        id="docs-sidebar"
        className="sidebar"
        aria-label="Documentation navigation"
        data-open="false"
      >
        <div className="sidebar-inner">
          <nav>
            {nav.map(group => (
              <div key={group.title} className="nav-group">
                <p className="nav-group-title">{group.title}</p>
                <ul role="list" className="nav-list">
                  {group.items.map(item => (
                    <NavItemRow key={item.slug} item={item} currentSlug={currentSlug} />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Liquid Fire Wave at bottom of sidebar */}
        <LiquidFireWave height={52} />
      </aside>
    </>
  );
}
