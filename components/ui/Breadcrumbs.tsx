import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Breadcrumb } from "@/types/docs";

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {items.map((item, i) => (
          <li key={item.href}>
            {i > 0 && (
              <ChevronRight size={14} className="breadcrumb-sep" aria-hidden="true" />
            )}
            {item.isCurrent ? (
              <span aria-current="page">{item.title}</span>
            ) : (
              <Link href={item.href}>{item.title}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
