import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs } from "@/lib/navigation";
import { getDocPage } from "@/lib/content";
import { TableOfContents } from "@/components/layout/TableOfContents";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageNav } from "@/components/ui/PageNav";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";
import { Pencil, Clock, BookOpen } from "lucide-react";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

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

  const showToc = page.frontmatter.showToc !== false && page.toc.length > 1;
  const showFeedback = page.frontmatter.showFeedback !== false;
  // Mark current breadcrumb
  const breadcrumbs = page.breadcrumbs.map((b, i) => ({
    ...b,
    isCurrent: i === page.breadcrumbs.length - 1,
  }));

  return (
    <>
      <article className="docs-content" id="main-content">
        <div className="docs-content-inner">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <Breadcrumbs items={breadcrumbs} />
          )}

          {/* Page header */}
          <header className="page-header">
            <h1>{page.frontmatter.title}</h1>
            <div className="page-header-meta">
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={13} aria-hidden="true" />
                {page.readingTime} min read
              </span>
              <span className="page-header-meta-sep" aria-hidden="true">·</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <BookOpen size={13} aria-hidden="true" />
                {page.wordCount.toLocaleString()} words
              </span>
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

      {/* Right TOC */}
      {showToc && (
        <TableOfContents items={page.toc} />
      )}
    </>
  );
}
