"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  GitCommit,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { getDocIcon, getCategoryIcon, getDocColorVariant } from "@/lib/icons";

export interface RecentDocItem {
  slug: string;
  href: string;
  title: string;
  description: string;
  category: string;
  authorName: string;
  authorAvatar: string;
  relativeTime: string;
  commitHash: string;
  readingTime: number;
}

interface RecentlyUpdatedSectionProps {
  recentDocs: RecentDocItem[];
  totalDocsCount: number;
}

export function RecentlyUpdatedSection({
  recentDocs,
  totalDocsCount,
}: RecentlyUpdatedSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(recentDocs.length / ITEMS_PER_PAGE);

  if (recentDocs.length === 0) return null;

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentDocs = recentDocs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <section className="docs-home-section">
      <div className="section-header section-header--flex">
        <div className="section-header-left-col">
          <div className="section-title-badge-row">
            <h2 className="docs-home-section-title">Recently Updated</h2>
            
            {/* Live Git Sync Badge */}
            <span className="live-pulse-badge">
              <span className="pulse-dot" aria-hidden="true" />
              <span>Live Git Sync</span>
            </span>

            {/* Changed Count Badge */}
            <span className="recent-count-pill" title="Toate documentele modificate și sincronizate recent">
              <Sparkles size={12} className="text-amber-400" aria-hidden="true" />
              <span><strong>{recentDocs.length}</strong> documente actualizate</span>
              <span className="count-pill-divider">/</span>
              <span><strong>{totalDocsCount}</strong> totale</span>
            </span>
          </div>
          <span className="section-sub">
            Toate cele <strong>{recentDocs.length}</strong> pagini sincronizate și adaptate recent • Navighează cu săgețile stânga / dreapta
          </span>
        </div>

        {/* Header Controls: Pagination Arrows + Collapse Toggle */}
        <div className="section-header-actions">
          {/* Pagination Arrows */}
          {!isCollapsed && totalPages > 1 && (
            <div className="recent-pagination-controls">
              <button
                type="button"
                className="recent-page-nav-btn"
                onClick={handlePrev}
                aria-label="Pagina anterioară"
                title="Pagina anterioară"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>

              <span className="recent-page-indicator">
                {currentPage + 1} / {totalPages}
              </span>

              <button
                type="button"
                className="recent-page-nav-btn"
                onClick={handleNext}
                aria-label="Pagina următoare"
                title="Pagina următoare"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Collapse Toggle Button */}
          <button
            type="button"
            className="recent-collapse-toggle-btn"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Extinde secțiunea" : "Restrânge secțiunea"}
          >
            <span>{isCollapsed ? `Afișează (${recentDocs.length})` : "Restrânge"}</span>
            {isCollapsed ? (
              <ChevronDown size={14} aria-hidden="true" />
            ) : (
              <ChevronUp size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Grid of Updated Documents with smooth page change animation */}
      {!isCollapsed && (
        <>
          <div key={currentPage} className="recent-updates-grid animate-fade-in">
            {currentDocs.map((doc) => {
              const color = getDocColorVariant(doc.slug, doc.title);

              return (
                <Link
                  key={doc.slug}
                  href={doc.href}
                  className="recent-update-card"
                >
                  {/* Top Bar: Category Pill + Relative Time */}
                  <div className="recent-card-top">
                    <span className="recent-card-category">
                      <span className="recent-card-cat-icon">
                        {getCategoryIcon(doc.category, 11)}
                      </span>
                      <span>{doc.category}</span>
                    </span>
                    <span className="recent-card-time">
                      <Clock size={11} aria-hidden="true" />
                      <span>{doc.relativeTime}</span>
                    </span>
                  </div>

                  {/* Title Row with Dynamic Colored Icon from Sidebar */}
                  <div className="recent-card-title-row">
                    <div className="recent-card-title-wrap">
                      <span
                        className={`recent-card-item-icon recent-card-item-icon--${color}`}
                      >
                        {getDocIcon(doc.slug, doc.title, 14)}
                      </span>
                      <h3 className="recent-card-title">{doc.title}</h3>
                    </div>
                    <ArrowRight
                      size={14}
                      className="recent-card-arrow"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Excerpt Description */}
                  <p className="recent-card-desc">{doc.description}</p>

                  {/* Bottom Footer: Author Avatar + Commit Hash + Read Time */}
                  <div className="recent-card-footer">
                    <div className="recent-card-author">
                      <img
                        src={doc.authorAvatar}
                        alt={doc.authorName}
                        className="recent-author-avatar"
                        width={18}
                        height={18}
                      />
                      <span className="recent-author-name">
                        <span className="recent-author-by">by</span>{" "}
                        {doc.authorName}
                      </span>
                    </div>

                    <div className="recent-card-meta-right">
                      {doc.commitHash && doc.commitHash !== "HEAD" && (
                        <span
                          className="recent-commit-badge"
                          title={`Commit ${doc.commitHash}`}
                        >
                          <GitCommit size={11} aria-hidden="true" />
                          <span>#{doc.commitHash.slice(0, 7)}</span>
                        </span>
                      )}
                      <span className="recent-read-time">
                        {doc.readingTime}m read
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom Pagination Bar */}
          {totalPages > 1 && (
            <div className="recent-bottom-pagination">
              <button
                type="button"
                className="recent-bottom-nav-btn"
                onClick={handlePrev}
              >
                <ChevronLeft size={15} />
                <span>Anterior</span>
              </button>

              <div className="recent-page-pills">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`recent-page-dot ${i === currentPage ? "recent-page-dot--active" : ""}`}
                    onClick={() => setCurrentPage(i)}
                    aria-label={`Sari la pagina ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="recent-bottom-nav-btn"
                onClick={handleNext}
              >
                <span>Următor</span>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
