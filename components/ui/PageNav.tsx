import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageNavProps {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export function PageNav({ prev, next }: PageNavProps) {
  if (!prev && !next) return null;

  return (
    <nav className="page-nav" aria-label="Page navigation">
      {prev ? (
        <Link href={prev.href} className="page-nav-item page-nav-prev">
          <span className="page-nav-label">
            <ChevronLeft size={14} aria-hidden="true" />
            Previous
          </span>
          <span className="page-nav-title">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={next.href} className="page-nav-item page-nav-next">
          <span className="page-nav-label">
            Next
            <ChevronRight size={14} aria-hidden="true" />
          </span>
          <span className="page-nav-title">{next.title}</span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
