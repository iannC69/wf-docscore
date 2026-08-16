import React from "react";
import Link from "next/link";
import { getAllReleases, type ChangeType } from "@/lib/changelog";
import {
  Sparkles,
  GitCommit,
  Tag,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Zap,
  AlertTriangle,
  Bug,
  ArrowRight,
  BookOpen,
  Flame,
  Layers,
} from "lucide-react";

export const metadata = {
  title: "Changelog & Releases — Wildfire Docs",
  description:
    "A chronological timeline of updates, features, improvements, and fixes shipped to the Wildfire documentation engine.",
};

function getChangeBadge(type: ChangeType) {
  switch (type) {
    case "feature":
      return {
        label: "Feature",
        icon: <Sparkles size={11} aria-hidden="true" />,
        className: "change-badge--feature",
      };
    case "improvement":
      return {
        label: "Improvement",
        icon: <Zap size={11} aria-hidden="true" />,
        className: "change-badge--improvement",
      };
    case "breaking":
      return {
        label: "Breaking",
        icon: <AlertTriangle size={11} aria-hidden="true" />,
        className: "change-badge--breaking",
      };
    case "fix":
      return {
        label: "Bug Fix",
        icon: <Bug size={11} aria-hidden="true" />,
        className: "change-badge--fix",
      };
  }
}

export default async function ChangelogPage() {
  const releases = await getAllReleases();
  const latestRelease = releases.find((r) => r.isLatest) || releases[0];

  return (
    <div className="changelog-page-wrapper">
      <div className="changelog-container">
        {/* Hero Header */}
        <header className="changelog-hero">
          <div className="changelog-hero-pill">
            <Flame size={13} className="hero-flame-icon" aria-hidden="true" />
            <span>Wildfire Release Pipeline</span>
            <span className="hero-version-tag">{latestRelease.version}</span>
          </div>

          <h1 className="changelog-hero-title">
            Changelog <span className="title-amp">&amp;</span> Releases
          </h1>

          <p className="changelog-hero-subtitle">
            A chronological timeline of every new capability, performance boost,
            and bug fix shipped to the Wildfire Docs ecosystem.
          </p>

          <div className="changelog-hero-meta-row">
            <div className="hero-stat-chip">
              <Layers size={13} className="stat-icon" aria-hidden="true" />
              <span>{releases.length} Official Releases</span>
            </div>
            <div className="hero-stat-chip">
              <GitCommit size={13} className="stat-icon" aria-hidden="true" />
              <span>Live Git Synchronized</span>
            </div>
            <a
              href="https://github.com/iannC69/wf-docscore/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-github-releases-btn"
            >
              <span>GitHub Releases</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </header>

        {/* Vertical Timeline */}
        <div className="changelog-timeline">
          {releases.map((release, idx) => {
            return (
              <article
                key={release.slug}
                id={release.slug}
                className={`changelog-item ${release.isLatest ? "changelog-item--latest" : ""}`}
              >
                {/* Timeline node marker */}
                <div className="timeline-node" aria-hidden="true">
                  <div className="timeline-node-dot">
                    {release.isLatest && <span className="node-pulse" />}
                  </div>
                  {idx < releases.length - 1 && (
                    <div className="timeline-line-stem" />
                  )}
                </div>

                {/* Release Card */}
                <div className="changelog-card">
                  {/* Top Bar: Version, Date, Author & Git Commit */}
                  <div className="changelog-card-header">
                    <div className="release-version-wrap">
                      <span className="release-version-pill">
                        <Tag size={12} aria-hidden="true" />
                        <span>{release.version}</span>
                      </span>
                      {release.isLatest && (
                        <span className="release-latest-tag">
                          <Sparkles size={11} aria-hidden="true" />
                          <span>Latest Release</span>
                        </span>
                      )}
                    </div>

                    <div className="release-meta-items">
                      <div className="release-meta-date">
                        <Calendar size={12} aria-hidden="true" />
                        <span>{release.date}</span>
                      </div>

                      {/* Author Chip */}
                      <a
                        href={`https://github.com/${release.author.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="release-author-chip"
                        title={`Released by @${release.author.username}`}
                      >
                        <img
                          src={release.author.avatar}
                          alt={release.author.name}
                          className="release-author-avatar"
                          width={18}
                          height={18}
                        />
                        <span>@{release.author.username}</span>
                      </a>

                      {/* Git Commit Hash Link */}
                      <a
                        href={release.git.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="release-commit-chip"
                        title={`View commit ${release.git.commitHash} on GitHub`}
                      >
                        <GitCommit size={12} aria-hidden="true" />
                        <code>{release.git.commitHash}</code>
                        <ExternalLink size={10} aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h2 className="release-title">{release.title}</h2>
                  <p className="release-summary">{release.summary}</p>

                  {/* Highlights List if present */}
                  {release.highlights && release.highlights.length > 0 && (
                    <div className="release-highlights-box">
                      <p className="highlights-title">Key Highlights</p>
                      <ul className="highlights-list">
                        {release.highlights.map((h, i) => (
                          <li key={i} className="highlight-item">
                            <CheckCircle2
                              size={13}
                              className="highlight-icon"
                              aria-hidden="true"
                            />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Categorized Changes List */}
                  <div className="release-changes-section">
                    <p className="changes-section-label">Included Changes</p>
                    <div className="changes-list">
                      {release.changes.map((item, cIdx) => {
                        const badge = getChangeBadge(item.type);
                        return (
                          <div key={cIdx} className="change-item-row">
                            <div className="change-item-header">
                              <span className={`change-badge ${badge.className}`}>
                                {badge.icon}
                                <span>{badge.label}</span>
                              </span>
                              <span className="change-item-title">
                                {item.title}
                              </span>
                            </div>
                            {item.description && (
                              <p className="change-item-desc">
                                {item.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="changelog-card-footer">
                    <a
                      href={release.git.tagUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="release-tag-link"
                    >
                      <span>View tag on GitHub</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA Box */}
        <section className="changelog-bottom-cta">
          <div className="cta-content">
            <div className="cta-icon-box">
              <BookOpen size={20} />
            </div>
            <div className="cta-text">
              <h3 className="cta-title">Explore Full Documentation</h3>
              <p className="cta-desc">
                Learn how to integrate Wildfire components, write MDX articles,
                and deploy to production edge.
              </p>
            </div>
          </div>
          <Link href="/docs" className="cta-btn">
            <span>Go to Documentation Hub</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
