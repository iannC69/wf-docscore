import React from "react";

export function DocSkeleton() {
  return (
    <div className="doc-skeleton-container" aria-hidden="true">
      <div className="doc-skeleton-main">
        {/* Breadcrumb Skeleton */}
        <div className="doc-skeleton-breadcrumbs">
          <div className="doc-skeleton-box doc-skeleton-crumb-1" />
          <div className="doc-skeleton-crumb-sep">/</div>
          <div className="doc-skeleton-box doc-skeleton-crumb-2" />
        </div>

        {/* Article Title & Description Skeleton */}
        <div className="doc-skeleton-header">
          <div className="doc-skeleton-box doc-skeleton-title" />
          <div className="doc-skeleton-box doc-skeleton-desc-1" />
          <div className="doc-skeleton-box doc-skeleton-desc-2" />
        </div>

        {/* Metadata Badges Skeleton */}
        <div className="doc-skeleton-meta-row">
          <div className="doc-skeleton-box doc-skeleton-badge" />
          <div className="doc-skeleton-box doc-skeleton-badge" />
          <div className="doc-skeleton-box doc-skeleton-badge" />
          <div className="doc-skeleton-box doc-skeleton-badge-sm" />
        </div>

        <div className="doc-skeleton-divider" />

        {/* Paragraph 1 */}
        <div className="doc-skeleton-paragraph">
          <div className="doc-skeleton-box doc-skeleton-line doc-skeleton-w-full" />
          <div className="doc-skeleton-box doc-skeleton-line doc-skeleton-w-92" />
          <div className="doc-skeleton-box doc-skeleton-line doc-skeleton-w-85" />
          <div className="doc-skeleton-box doc-skeleton-line doc-skeleton-w-60" />
        </div>

        {/* Heading 2 Skeleton */}
        <div className="doc-skeleton-box doc-skeleton-h2" />

        {/* Code Block Skeleton */}
        <div className="doc-skeleton-code-block">
          <div className="doc-skeleton-code-header">
            <div className="doc-skeleton-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="doc-skeleton-box doc-skeleton-code-lang" />
          </div>
          <div className="doc-skeleton-code-body">
            <div className="doc-skeleton-box doc-skeleton-code-line doc-skeleton-w-75" />
            <div className="doc-skeleton-box doc-skeleton-code-line doc-skeleton-w-50" />
            <div className="doc-skeleton-box doc-skeleton-code-line doc-skeleton-w-90" />
            <div className="doc-skeleton-box doc-skeleton-code-line doc-skeleton-w-65" />
            <div className="doc-skeleton-box doc-skeleton-code-line doc-skeleton-w-40" />
          </div>
        </div>

        {/* Callout Alert Skeleton */}
        <div className="doc-skeleton-callout">
          <div className="doc-skeleton-box doc-skeleton-callout-icon" />
          <div className="doc-skeleton-callout-text">
            <div className="doc-skeleton-box doc-skeleton-line doc-skeleton-w-95" />
            <div className="doc-skeleton-box doc-skeleton-line doc-skeleton-w-70" />
          </div>
        </div>

        {/* Paragraph 2 */}
        <div className="doc-skeleton-paragraph">
          <div className="doc-skeleton-box doc-skeleton-line doc-skeleton-w-full" />
          <div className="doc-skeleton-box doc-skeleton-line doc-skeleton-w-90" />
          <div className="doc-skeleton-box doc-skeleton-line doc-skeleton-w-78" />
        </div>

        {/* Page Nav Skeleton (Prev / Next) */}
        <div className="doc-skeleton-footer-nav">
          <div className="doc-skeleton-nav-card">
            <div className="doc-skeleton-box doc-skeleton-nav-sub" />
            <div className="doc-skeleton-box doc-skeleton-nav-title" />
          </div>
          <div className="doc-skeleton-nav-card">
            <div className="doc-skeleton-box doc-skeleton-nav-sub" />
            <div className="doc-skeleton-box doc-skeleton-nav-title" />
          </div>
        </div>
      </div>

      {/* Right Column: Table of Contents Skeleton */}
      <aside className="doc-skeleton-toc">
        <div className="doc-skeleton-box doc-skeleton-toc-header" />
        <div className="doc-skeleton-toc-list">
          <div className="doc-skeleton-box doc-skeleton-toc-item doc-skeleton-toc-item--active" />
          <div className="doc-skeleton-box doc-skeleton-toc-item doc-skeleton-w-80" />
          <div className="doc-skeleton-box doc-skeleton-toc-item doc-skeleton-w-65 doc-skeleton-toc-sub" />
          <div className="doc-skeleton-box doc-skeleton-toc-item doc-skeleton-w-70 doc-skeleton-toc-sub" />
          <div className="doc-skeleton-box doc-skeleton-toc-item doc-skeleton-w-85" />
          <div className="doc-skeleton-box doc-skeleton-toc-item doc-skeleton-w-55" />
        </div>
      </aside>
    </div>
  );
}
