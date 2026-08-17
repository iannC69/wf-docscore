"use client";

import React, { useState, useEffect } from "react";
import {
  FileEdit,
  Save,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code,
  Bold,
  Italic,
  Heading2,
  Quote,
  Link2,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface DocItem {
  slug: string;
  relativePath: string;
}

export default function AdminContentStudioPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newSlug, setNewSlug] = useState<string>("");

  // Load Doc List
  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch("/api/admin/doc");
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        const data = await res.json();
        setDocs(data.docs || []);
        if (data.docs && data.docs.length > 0) {
          setSelectedSlug(data.docs[0].slug);
        }
      } catch (err) {
        console.error("Failed to load docs", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  // Load Content when selectedSlug changes
  useEffect(() => {
    if (!selectedSlug || isCreatingNew) return;

    async function loadDocContent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/doc?slug=${encodeURIComponent(selectedSlug)}`);
        const data = await res.json();
        if (data.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error("Failed to load content", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocContent();
  }, [selectedSlug, isCreatingNew]);

  const handleSave = async () => {
    const slugToSave = isCreatingNew ? newSlug : selectedSlug;
    if (!slugToSave || !content) {
      setStatusMessage({ type: "error", text: "Slug and content are required." });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugToSave,
          content,
          action: isCreatingNew ? "create" : "update",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: data.message });
        if (isCreatingNew) {
          setIsCreatingNew(false);
          setSelectedSlug(slugToSave);
          // Refresh list
          const refreshRes = await fetch("/api/admin/doc");
          const refreshData = await refreshRes.json();
          setDocs(refreshData.docs || []);
        }
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to save document." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network connection error." });
    } finally {
      setSaving(false);
    }
  };

  const handleStartNewDoc = () => {
    setIsCreatingNew(true);
    setNewSlug("getting-started/my-new-guide");
    setContent(`---
title: "My New Guide"
description: "Comprehensive guide to configuring Wildfire Docs."
date: "2026-08-17"
author: "iannC69"
tags: ["guide", "docs"]
---

# My New Guide

Welcome to the new documentation article.

## Overview
Write your documentation content here using GitHub-flavored Markdown.
`);
  };

  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + "\n" + snippet);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));
  const charCount = content.length;

  const filteredDocs = docs.filter((d) =>
    d.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-content-studio-page">
      {/* Studio Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">DOC STUDIO</div>
          <h1 className="admin-page-title">Documentation CMS & Markdown Studio</h1>
          <p className="admin-page-description">
            Edit, create, and publish live Markdown articles with automatic frontmatter and cryptographic audit tracking.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={handleStartNewDoc}
            className="admin-btn admin-btn--secondary"
          >
            <Plus size={14} />
            <span>New Article</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="admin-btn admin-btn--primary"
          >
            <Save size={14} />
            <span>{saving ? "Publishing..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`admin-alert-box ${
            statusMessage.type === "success"
              ? "admin-alert-box--success"
              : "admin-alert-box--danger"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Split-Screen Studio Layout */}
      <div className="admin-studio-grid">
        {/* Left Panel: Document Tree & Filter */}
        <aside className="admin-studio-sidebar">
          <div className="admin-studio-search-box">
            <Search size={14} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Filter doc articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-studio-search-input"
            />
          </div>

          <div className="admin-studio-doc-list">
            {filteredDocs.map((doc) => {
              const isSelected = !isCreatingNew && selectedSlug === doc.slug;
              return (
                <button
                  key={doc.slug}
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setSelectedSlug(doc.slug);
                  }}
                  className={`admin-doc-list-item ${
                    isSelected ? "admin-doc-list-item--active" : ""
                  }`}
                >
                  <FileText size={14} className="admin-doc-item-icon" />
                  <span className="admin-doc-item-slug">{doc.slug}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Panel: Editor & Live Preview */}
        <div className="admin-studio-editor-pane">
          {/* Document Path / Slug Bar */}
          <div className="admin-editor-toolbar">
            <div className="admin-editor-slug-box">
              <span className="admin-editor-prefix">/docs/</span>
              {isCreatingNew ? (
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="category/my-article-slug"
                  className="admin-slug-input"
                />
              ) : (
                <span className="admin-editor-slug-current">{selectedSlug}</span>
              )}
            </div>

            {/* Quick Formatting Helpers */}
            <div className="admin-editor-format-bar">
              <button
                type="button"
                onClick={() => insertSnippet("## New Section Header")}
                className="admin-format-btn"
                title="Insert Heading 2"
              >
                <Heading2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("**Bold Text**")}
                className="admin-format-btn"
                title="Insert Bold"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("*Italic Text*")}
                className="admin-format-btn"
                title="Insert Italic"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("```typescript\n// code here\n```")}
                className="admin-format-btn"
                title="Insert Code Block"
              >
                <Code size={13} />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("> [!NOTE]\n> Detailed background explanation.")}
                className="admin-format-btn"
                title="Insert Callout Alert"
              >
                <Quote size={13} />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("[Link Text](https://...)")}
                className="admin-format-btn"
                title="Insert Markdown Link"
              >
                <Link2 size={13} />
              </button>
            </div>

            <div className="admin-editor-mode-toggle">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`admin-tab-btn ${
                  activeTab === "edit" ? "admin-tab-btn--active" : ""
                }`}
              >
                <Code size={13} />
                <span>Markdown</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`admin-tab-btn ${
                  activeTab === "preview" ? "admin-tab-btn--active" : ""
                }`}
              >
                <Eye size={13} />
                <span>Raw Preview</span>
              </button>
            </div>
          </div>

          {/* Main Textarea / Preview Pane */}
          {activeTab === "edit" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter markdown content..."
              className="admin-markdown-editor"
              spellCheck={false}
            />
          ) : (
            <div className="admin-markdown-preview-pane">
              <pre className="admin-preview-code">
                <code>{content}</code>
              </pre>
            </div>
          )}

          {/* Editor Status Bar */}
          <div className="admin-editor-status-bar">
            <div className="admin-editor-status-item">
              <span>Words:</span>
              <strong>{wordCount}</strong>
            </div>
            <div className="admin-editor-status-item">
              <span>Characters:</span>
              <strong>{charCount}</strong>
            </div>
            <div className="admin-editor-status-item">
              <span>Est. Read Time:</span>
              <strong>{readingTimeMin} min</strong>
            </div>
            <div className="admin-editor-status-item admin-editor-status-item--right">
              <span>Format:</span>
              <strong>GitHub Flavored Markdown (GFM)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
