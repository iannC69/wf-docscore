import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs } from "@/lib/navigation";
import { getDocPage } from "@/lib/content";
import { TableOfContents } from "@/components/layout/TableOfContents";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageNav } from "@/components/ui/PageNav";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";
import { Pencil, Clock, BookOpen, Tag } from "lucide-react";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  return (
    <div className="docs-page-container">
      <div className="docs-content-wrapper">
        <article className="docs-content" id="main-content">
          <div className="docs-content-inner">
            {/* Top Row: Breadcrumbs + Tag/Badge */}
            <div className="page-header-top-row">
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

            {/* Page header with Title, Description, and Metadata */}
            <header className="page-header">
              <div className="page-title-row">
                <h1>{page.frontmatter.title}</h1>
              </div>

              {page.frontmatter.description && (
                <p className="page-header-desc">
                  {page.frontmatter.description}
                </p>
              )}

              <div className="page-header-meta">
                <span className="page-meta-item">
                  <Clock size={13} aria-hidden="true" />
                  <span>{page.readingTime} min read</span>
                </span>
                <span className="page-header-meta-sep" aria-hidden="true">·</span>
                <span className="page-meta-item">
                  <BookOpen size={13} aria-hidden="true" />
                  <span>{page.wordCount.toLocaleString()} words</span>
                </span>
                <span className="page-header-meta-sep" aria-hidden="true">·</span>
                <span className="page-meta-category">{categoryLabel}</span>
              </div>
            </header>

            {/* MDX Content */}
            <div className="prose">
              {page.mdxSource as React.ReactNode}
            </div>

            {/* Page footer */}
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
                    Edit this page
                  </a>
                )}
              </div>
              <PageNav prev={page.prev} next={page.next} />
            </footer>
          </div>
        </article>
      </div>

      {/* Right TOC — pinned to far right */}
      {showToc && (
        <TableOfContents items={page.toc} />
      )}
    </div>
  );
}
