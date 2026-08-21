import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAllSlugs } from "@/lib/navigation";
import { getDocPage } from "@/lib/content";
import { TableOfContents } from "@/components/layout/TableOfContents";
import { MobileTableOfContents } from "@/components/layout/MobileTableOfContents";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageNav } from "@/components/ui/PageNav";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";
import { getPlatformSettings } from "@/lib/security/settingsStore";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import { DocQuickActions } from "@/components/docs/DocQuickActions";
import { DocIntegritySeal } from "@/components/docs/DocIntegritySeal";
import { DocEndAiExplainer } from "@/components/docs/DocEndAiExplainer";
import { DocAiSummaryCapsule } from "@/components/docs/DocAiSummaryCapsule";
import { CURRENT_VERSION } from "@/lib/version";
import {
  Pencil,
  Clock,
  BookOpen,
  GitCommit,
  Sparkles,
  ExternalLink,
  UserCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug?: string[] }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  "informatii": "Informații",
  "currency": "Currency",
  "systems": "Systems",
  "market": "Market & Donații",
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
  const settings = getPlatformSettings();
  const session = await getAuthenticatedAdminSession();

  if (settings.maintenance.enabled && !session) {
    redirect("/maintenance");
  }

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
          {/* Print Watermark (Visible only during PDF export / print) */}
          <div className="print-watermark" aria-hidden="true">
            <div className="print-watermark-inner">
              <img src="/logo.png" alt="" className="print-watermark-img" width={160} height={160} />
              <span className="print-watermark-text">WILDFIRE DOCS</span>
              <span className="print-watermark-sub">OFFICIAL ARCHITECTURE SPECIFICATION</span>
            </div>
          </div>

          <div className="docs-content-inner">
            {/* Print Header (Visible only during PDF export / print) */}
            <div className="print-sheet-header">
              <div className="print-header-top">
                <div className="print-sheet-brand">
                  <img
                    src="/logo.png"
                    alt="Wildfire"
                    className="print-sheet-logo"
                    width={38}
                    height={38}
                  />
                  <div className="print-sheet-title-wrap">
                    <div className="print-sheet-title-row">
                      <span className="print-sheet-title">WILDFIRE DOCUMENTATION</span>
                      <span className="print-sheet-ver-pill">v{CURRENT_VERSION}</span>
                    </div>
                    <span className="print-sheet-sub">
                      Official Engineering Specification • https://github.com/iannC69/wf-docscore
                    </span>
                  </div>
                </div>

                <div className="print-sheet-meta">
                  <span className="print-sheet-category">{categoryLabel}</span>
                  <span className="print-sheet-hash">Git Commit #{commitHash.slice(0, 7)}</span>
                </div>
              </div>

              <div className="print-header-bottom-meta">
                <div className="print-meta-item">
                  <span className="print-meta-lbl">Path:</span>
                  <span className="print-meta-val">/docs/{slug.join("/")}</span>
                </div>
                <div className="print-meta-item">
                  <span className="print-meta-lbl">Author:</span>
                  <span className="print-meta-val">{authorName} ({relativeTime})</span>
                </div>
                <div className="print-meta-item">
                  <span className="print-meta-lbl">Length:</span>
                  <span className="print-meta-val">{page.readingTime} min read • {page.wordCount} words</span>
                </div>
                <div className="print-meta-item">
                  <span className="print-meta-lbl">Status:</span>
                  <span className="print-meta-val">Fortress Verified</span>
                </div>
              </div>
            </div>

            {/* Top Row: Breadcrumbs + Tag/Badge + Developer Quick Actions Toolbar */}
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

              {/* Developer Quick Actions: Copy Markdown, Export PDF, Admin Edit, GitHub Edit */}
              <DocQuickActions
                rawContent={page.content}
                slug={slug.join("/")}
                githubEditUrl={page.githubEditUrl}
                isAdmin={!!session}
              />
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

              {/* Comprehensive Metadata: Author, Commit, Read Time, Word Count */}
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

                {/* Cryptographic Integrity & GPG Attestation Seal */}
                <DocIntegritySeal
                  sha256={page.sha256}
                  commitHash={commitHash}
                  commitUrl={git?.commitUrl || `https://github.com/iannC69/wf-docscore/commit/${commitHash}`}
                  authorName={authorName}
                  relativeTime={relativeTime}
                  slug={slug.join("/")}
                />

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
                </div>
              </div>
            </header>

            {/* Dynamic In-Page AI Quick Summary / TL;DR Capsule */}
            <DocAiSummaryCapsule
              docTitle={page.frontmatter.title}
              docSlug={slug.join("/")}
              rawContent={page.content}
              variant="top"
            />

            {/* MDX Content Body */}
            <div className="prose">
              {page.mdxSource as React.ReactNode}
            </div>

            {/* End-of-Page AI Explainer & Q&A Callout Card */}
            <DocEndAiExplainer
              docTitle={page.frontmatter.title}
              docSlug={slug.join("/")}
              category={categoryLabel}
              rawContent={page.content}
            />

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

            {/* Print Footer (Visible only during PDF export / print) */}
            <div className="print-sheet-footer">
              <div className="print-footer-left">
                <span>Wildfire Docs • Technical Specification</span>
                <span className="print-footer-dot">·</span>
                <span>Maintainer: iannC69</span>
                <span className="print-footer-dot">·</span>
                <span>/docs/{slug.join("/")}</span>
              </div>
              <div className="print-footer-right">
                <span>Fortress Security Verified • SHA-256 Chained</span>
              </div>
            </div>
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
