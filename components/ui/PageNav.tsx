"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PageNavProps {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export function PageNav({ prev, next }: PageNavProps) {
  const { t } = useLanguage();

  if (!prev && !next) return null;

  return (
    <nav className="page-nav" aria-label="Page navigation">
      {prev ? (
        <Link href={prev.href} className="page-nav-card page-nav-card--prev">
          <div className="page-nav-icon-box">
            <ArrowLeft size={16} className="page-nav-arrow" aria-hidden="true" />
          </div>
          <div className="page-nav-text-col">
            <span className="page-nav-sub">{t.docPage.previousPage}</span>
            <span className="page-nav-title">{prev.title}</span>
          </div>
        </Link>
      ) : (
        <div className="page-nav-placeholder" aria-hidden="true" />
      )}

      {next ? (
        <Link href={next.href} className="page-nav-card page-nav-card--next">
          <div className="page-nav-text-col page-nav-text-col--right">
            <span className="page-nav-sub">{t.docPage.nextPage}</span>
            <span className="page-nav-title">{next.title}</span>
          </div>
          <div className="page-nav-icon-box">
            <ArrowRight size={16} className="page-nav-arrow" aria-hidden="true" />
          </div>
        </Link>
      ) : (
        <div className="page-nav-placeholder" aria-hidden="true" />
      )}
    </nav>
  );
}
