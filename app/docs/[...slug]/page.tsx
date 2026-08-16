import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs } from "@/lib/navigation";
import { getDocPage } from "@/lib/content";
import { TableOfContents } from "@/components/layout/TableOfContents";
import { MobileTableOfContents } from "@/components/layout/MobileTableOfContents";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageNav } from "@/components/ui/PageNav";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";
import {
  Pencil,
  Clock,
  BookOpen,
  GitCommit,
  Sparkles,
  ExternalLink,
  UserCheck,
} from "lucide-react";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  "getting-started": "Getting Started",
  "features": "Core Features",
  "api-reference": "API Reference",
};

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = await getDocPage(slug);
  if (!page) return { title: "Not Found" };

  const title = page.frontmatter.seoTitle ?? page.frontmatter.title;
  const description = page.frontmatter.seoDescription ?? page.frontmatter.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description: description ?? undefined,
      type: "article",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${page.href}`,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function DocPage({ params }: Props) {
  const { slug = [] } = await params;
  const page = await getDocPage(slug);

  if (!page) {
    notFound();
  }

  const showToc = page.frontmatter.showToc !== false && page.toc.length > 0;
  const showFeedback = page.frontmatter.showFeedback !== false;
  
  // Category label derived from top slug
  const rootSlug = slug[0] || "";
  const categoryLabel = CATEGORY_NAMES[rootSlug] || (rootSlug ? rootSlug.replace(/-/g, " ") : "Documentation");

  // Mark current breadcrumb
  const breadcrumbs = page.breadcrumbs.map((b, i) => ({
    ...b,
    isCurrent: i === page.breadcrumbs.length - 1,
  }));

  const git = page.gitInfo;
  const authorName = page.frontmatter.authors?.[0] || git?.authorUsername || "iannC69";
  const authorAvatar = git?.authorAvatar || `https://github.com/${authorName}.png`;
  const relativeTime = git?.relativeTime || "Recently";
  const commitHash = git?.commitHash || "HEAD";

  return (
    <div className="docs-page-container">
      <div className="docs-content-wrapper">
        <article className="docs-content" id="main-content">
          <div className="docs-content-inner">
            
            {/* Top Row: Breadcrumbs + Tag/Badge + Top Edit Action */}
            <div className="page-header-top-row">
              <div className="page-header-breadcrumbs-wrap">
                {breadcrumbs.length > 1 ? (
                  <Breadcrumbs items={breadcrumbs} />
                ) : (
                  <div className="page-category-pill">
                    <span className="pill-dot" aria-hidden="true" />
                    <span>{categoryLabel}</span>
                  </div>
                )}
                {page.frontmatter.badge && (
                  <span className={`badge badge--${page.frontmatter.badge.toLowerCase()} page-tag-badge`}>
                    {page.frontmatter.badge}
                  </span>
                )}
              </div>

              {/* Prominent Header Edit Page Button */}
              {page.githubEditUrl && (
                <a
                  href={page.githubEditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="page-top-edit-btn"
                  title={`Edit ${page.frontmatter.title} on GitHub`}
                >
                  <Pencil size={12} aria-hidden="true" />
                  <span>Edit Page</span>
                  <ExternalLink size={10} className="edit-btn-ext" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* Mobile Table of Contents Accordion (Visible on <= 1200px) */}
            {showToc && <MobileTableOfContents items={page.toc} />}

            {/* Page Header: Title, Description, Author Meta, & Commit Chips */}
            <header className="page-header">
              <div className="page-title-row">
                <h1>{page.frontmatter.title}</h1>
              </div>

              {page.frontmatter.description && (
                <p className="page-header-desc">
                  {page.frontmatter.description}
                </p>
              )}

              {/* Comprehensive Metadata: Author, Commit, Read Time, Category */}
              <div className="page-header-meta-bar">
                {/* Author Card / Updated By */}
                <div className="page-author-chip">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="author-avatar-img"
                    width={20}
                    height={20}
                    loading="lazy"
                  />
                  <span className="author-text-wrap">
                    <span className="author-action-label">Updated by</span>
                    <a
                      href={`https://github.com/${authorName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="author-name-link"
                    >
                      {authorName}
                    </a>
                  </span>
                  <span className="author-dot-sep" aria-hidden="true">·</span>
                  <time className="author-time" title={git?.date ? new Date(git.date).toLocaleString() : undefined}>
                    {relativeTime}
                  </time>
                </div>

                {/* Git Commit Hash Link */}
                {git?.commitHash && git.commitHash !== "HEAD" && (
                  <a
                    href={git.commitUrl || `https://github.com/iannC69/wf-docscore/commit/${git.commitHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="page-commit-chip"
                    title={`Commit: ${git.commitMessage || git.commitHash}`}
                  >
                    <GitCommit size={12} className="commit-chip-icon" aria-hidden="true" />
                    <span>#{git.commitHash.slice(0, 7)}</span>
                  </a>
                )}

                <div className="page-meta-right-group">
                  {/* Reading Time */}
                  <span className="page-meta-item">
                    <Clock size={12} aria-hidden="true" />
                    <span>{page.readingTime} min read</span>
                  </span>
                  <span className="page-header-meta-sep" aria-hidden="true">·</span>

                  {/* Word Count */}
                  <span className="page-meta-item">
                    <BookOpen size={12} aria-hidden="true" />
                    <span>{page.wordCount.toLocaleString()} words</span>
                  </span>
                  <span className="page-header-meta-sep" aria-hidden="true">·</span>

                  {/* Category */}
                  <span className="page-meta-category">{categoryLabel}</span>
                </div>
              </div>
            </header>

            {/* MDX Content Body */}
            <div className="prose">
              {page.mdxSource as React.ReactNode}
            </div>

            {/* Page Footer */}
            <footer className="page-footer">
              <div className="page-footer-actions">
                {showFeedback && <FeedbackWidget />}
                {page.githubEditUrl && (
                  <a
                    href={page.githubEditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="edit-page-link"
                    style={{ marginLeft: "auto" }}
                  >
                    <Pencil size={13} aria-hidden="true" />
                    Edit this page on GitHub
                  </a>
                )}
              </div>
              <PageNav prev={page.prev} next={page.next} />
            </footer>
          </div>
        </article>
      </div>

      {/* Right Table of Contents */}
      {showToc && (
        <TableOfContents items={page.toc} />
      )}
    </div>
  );
}
