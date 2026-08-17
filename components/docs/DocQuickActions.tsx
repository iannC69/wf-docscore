"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, Printer, Pencil, ExternalLink, Sparkles, Share2 } from "lucide-react";

interface DocQuickActionsProps {
  rawContent: string;
  slug: string;
  githubEditUrl?: string;
  isAdmin?: boolean;
}

export function DocQuickActions({
  rawContent,
  slug,
  githubEditUrl,
  isAdmin = false,
}: DocQuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(rawContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy markdown:", err);
    }
  };

  const handleShareLink = async () => {
    const cleanUrl = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
    
    // Use native device share if on mobile or supported browser
    if (typeof navigator !== "undefined" && navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: document.title,
          url: cleanUrl,
        });
        return;
      } catch {
        // user cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(cleanUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="doc-quick-actions-toolbar" aria-label="Page quick actions">
      {/* 1. Share / Copy Clean Link */}
      <button
        type="button"
        onClick={handleShareLink}
        className={`doc-quick-btn ${linkCopied ? "doc-quick-btn--copied" : ""}`}
        title="Share or copy clean canonical link"
      >
        {linkCopied ? (
          <>
            <Check size={12} className="text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 size={12} />
            <span>Share</span>
          </>
        )}
      </button>

      {/* 2. Copy Markdown */}
      <button
        type="button"
        onClick={handleCopyMarkdown}
        className={`doc-quick-btn ${copied ? "doc-quick-btn--copied" : ""}`}
        title="Copy raw Markdown to clipboard (ideal for AI prompt or notes)"
      >
        {copied ? (
          <>
            <Check size={12} className="text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Copy size={12} />
            <span>Copy Markdown</span>
          </>
        )}
      </button>

      {/* 3. Export PDF */}
      <button
        type="button"
        onClick={handlePrintPdf}
        className="doc-quick-btn"
        title="Export document as PDF or Print"
      >
        <Printer size={12} />
        <span>Export PDF</span>
      </button>

      {/* 4. Quick Edit in Admin (when logged in as admin) */}
      {isAdmin && (
        <Link
          href={`/admin/content?slug=${slug}`}
          className="doc-quick-btn doc-quick-btn--admin"
          title="Direct live edit in Wildfire Admin Panel"
        >
          <Sparkles size={12} className="text-amber-400" />
          <span>Edit in Admin</span>
        </Link>
      )}

      {/* 5. Edit on GitHub (Fallback / Public) */}
      {githubEditUrl && (
        <a
          href={githubEditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="doc-quick-btn doc-quick-btn--github"
          title="Edit this page on GitHub"
        >
          <Pencil size={12} />
          <span>Edit Page</span>
          <ExternalLink size={10} className="quick-btn-ext" />
        </a>
      )}
    </div>
  );
}
