import Link from "next/link";
import {
  Rocket,
  Sliders,
  Layers,
  Terminal,
  GitBranch,
  Cloud,
  Cpu,
  Shield,
  Search,
  BookOpen,
  ArrowRight,
  Code2,
  Clock,
  Sparkles,
  GitCommit,
  Flame,
} from "lucide-react";
import { getRecentlyUpdatedDocs } from "@/lib/git";

export default function DocsHomePage() {
  const recentDocs = getRecentlyUpdatedDocs(6);

  return (
    <div className="docs-home-wrapper">
      <main className="docs-home" id="main-content">
        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <section className="docs-home-hero">
          <div className="docs-home-badge">
            <span className="docs-badge-dot" aria-hidden="true" />
            <span>Documentation Portal</span>
          </div>
          <h1 className="docs-home-title">
            Wildfire Documentation &amp; Developer Hub
          </h1>
          <p className="docs-home-desc">
            Complete guides, architecture blueprints, API specifications, and
            component references for the custom documentation engine.
          </p>

          {/* Quick Search / Command hint */}
          <div className="docs-home-search-hint">
            <div className="search-hint-left">
              <Search size={15} className="search-hint-icon" aria-hidden="true" />
              <span>Press <kbd>Ctrl K</kbd> or <kbd>⌘K</kbd> anywhere to search documentation</span>
            </div>
            <Link href="/docs/getting-started" className="docs-hero-btn">
              <span>Get Started</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ── Recently Updated Section (Dynamic Commit / File Tracking) ── */}
        {recentDocs.length > 0 && (
          <section className="docs-home-section">
            <div className="section-header section-header--flex">
              <div>
                <div className="section-title-badge-row">
                  <h2 className="docs-home-section-title">Recently Updated</h2>
                  <span className="live-pulse-badge">
                    <span className="pulse-dot" aria-hidden="true" />
                    <span>Live Git Sync</span>
                  </span>
                </div>
                <span className="section-sub">Latest changes, updated guides, and revised API docs</span>
              </div>
            </div>

            <div className="recent-updates-grid">
              {recentDocs.map((doc) => (
                <Link key={doc.slug} href={doc.href} className="recent-update-card">
                  {/* Top Bar: Category Pill + Relative Time */}
                  <div className="recent-card-top">
                    <span className="recent-card-category">{doc.category}</span>
                    <span className="recent-card-time">
                      <Clock size={11} aria-hidden="true" />
                      <span>{doc.relativeTime}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <div className="recent-card-title-row">
                    <h3 className="recent-card-title">{doc.title}</h3>
                    <ArrowRight size={14} className="recent-card-arrow" aria-hidden="true" />
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
                        <span className="recent-author-by">by</span> {doc.authorName}
                      </span>
                    </div>

                    <div className="recent-card-meta-right">
                      {doc.commitHash && doc.commitHash !== "HEAD" && (
                        <span className="recent-commit-badge" title={`Commit ${doc.commitHash}`}>
                          <GitCommit size={11} aria-hidden="true" />
                          <span>#{doc.commitHash.slice(0, 7)}</span>
                        </span>
                      )}
                      <span className="recent-read-time">{doc.readingTime}m read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Core Modules Navigation Cards ─────────────────────────────── */}
        <section className="docs-home-section">
          <div className="section-header">
            <h2 className="docs-home-section-title">Core Sections</h2>
            <span className="section-sub">Explore the foundational architecture modules</span>
          </div>

          <div className="home-cards-grid">
            <Link href="/docs/getting-started" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--orange">
                  <Rocket size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Guide</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Getting Started</h3>
              <p className="home-card-desc">
                Step-by-step walkthrough to clone, install dependencies, and run the platform locally in minutes.
              </p>
            </Link>

            <Link href="/docs/getting-started/configuration" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--yellow">
                  <Sliders size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Setup</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Configuration</h3>
              <p className="home-card-desc">
                Configure environment variables, GitHub App credentials, database connection strings, and theming.
              </p>
            </Link>

            <Link href="/docs/features" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--purple">
                  <Layers size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Architecture</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Core Features</h3>
              <p className="home-card-desc">
                Discover built-in MDX rendering, interactive components, responsive navigation, and dark mode engine.
              </p>
            </Link>

            <Link href="/docs/features/github-integration" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--teal">
                  <GitBranch size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">GitOps</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">GitHub Sync</h3>
              <p className="home-card-desc">
                Bidirectional GitOps workflow with automated commit-on-save and webhook-driven cache invalidation.
              </p>
            </Link>

            <Link href="/docs/api-reference" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--blue">
                  <Terminal size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">API</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">API Reference</h3>
              <p className="home-card-desc">
                Comprehensive REST API contracts for programmatic content retrieval, revalidation, and webhooks.
              </p>
            </Link>

            <Link href="/docs/getting-started/deployment" className="home-card">
              <div className="home-card-header">
                <div className="home-card-icon-wrap home-card-icon--red">
                  <Cloud size={18} aria-hidden="true" />
                </div>
                <span className="home-card-tag">Production</span>
                <ArrowRight size={15} className="home-card-arrow" aria-hidden="true" />
              </div>
              <h3 className="home-card-title">Deployment</h3>
              <p className="home-card-desc">
                Production deployment strategy on Vercel, edge static generation, custom domain setup, and ISR.
              </p>
            </Link>
          </div>
        </section>

        {/* ── Architecture Highlights ───────────────────────────────────── */}
        <section className="docs-home-section">
          <div className="section-header">
            <h2 className="docs-home-section-title">Platform Architecture</h2>
            <span className="section-sub">Engineered for speed, control, and reliability</span>
          </div>

          <div className="home-features-list">
            <div className="feature-item">
              <div className="feature-item-icon">
                <Cpu size={16} aria-hidden="true" />
              </div>
              <div className="feature-item-content">
                <h3 className="feature-item-title">Next.js 16 App Router &amp; Turbopack</h3>
                <p className="feature-item-desc">
                  Static Site Generation pre-renders all documentation pages at build time for sub-millisecond TTFB.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">
                <Code2 size={16} aria-hidden="true" />
              </div>
              <div className="feature-item-content">
                <h3 className="feature-item-title">Shiki Server Syntax Highlighting</h3>
                <p className="feature-item-desc">
                  Zero client-side highlighting JavaScript overhead. Code blocks are parsed server-side with precise tokens.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">
                <Shield size={16} aria-hidden="true" />
              </div>
              <div className="feature-item-content">
                <h3 className="feature-item-title">Type-Safe Content Layer</h3>
                <p className="feature-item-desc">
                  TypeScript schemas for frontmatter, navigation structures, and API responses prevent broken links.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">
                <BookOpen size={16} aria-hidden="true" />
              </div>
              <div className="feature-item-content">
                <h3 className="feature-item-title">Customizable Design System</h3>
                <p className="feature-item-desc">
                  HSL tokens and CSS custom properties allow effortless retheming matching any corporate brand identity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
