---
title: Features Overview
description: A complete overview of every feature in the Docs Platform.
order: 1
---

# Features Overview

The Docs Platform ships with everything a modern documentation site needs — and nothing it doesn't.

## Core features

### MDX content pipeline

Write in Markdown, get full React component support. Every page supports:

- **GitHub Flavored Markdown** (tables, task lists, strikethrough)
- **Syntax highlighting** via Shiki — 100+ languages, line numbers, diff support
- **Autolinked headings** with anchor links
- **Custom components** — Callout, Steps, Tabs, Cards, CodeBlock
- **GitHub-style alerts** — `> [!NOTE]`, `> [!WARNING]`, etc.

### Navigation

The sidebar is auto-generated from your file structure with support for:

- Nested sections (unlimited depth)
- Badges (`New`, `Beta`, `Deprecated`)  
- Custom ordering via frontmatter `order` field
- Manual override via `nav.json`

### Search

Full-text search powered by a local index:

- **Instant results** — sub-10ms local search
- **Fuzzy matching** — finds results even with typos
- **Keyboard shortcut** — `⌘K` / `Ctrl+K`
- **Optional Algolia** — for large documentation sites

### Table of Contents

Sticky right-side TOC with:

- Active heading detection via `IntersectionObserver`
- Smooth scroll on click
- Supports H2 and H3 headings

## Writing features

| Feature | Description |
|---------|-------------|
| Reading time | Auto-calculated based on word count |
| Word count | Shown in page header |
| Breadcrumbs | Auto-generated from slug hierarchy |
| Prev / Next | Navigate between adjacent pages |
| Feedback | Thumbs up/down widget per page |
| Edit on GitHub | Direct link to edit file on GitHub |

## Admin features *(coming in v2)*

- **Visual editor** — Tiptap WYSIWYG with slash commands
- **Save as commit** — editor saves go directly to GitHub via API
- **Role-based access** — Owner, Admin, Editor, Viewer
- **User management** — invite team members via email

## Performance

All public pages are **statically generated** at build time:

- First Contentful Paint < 0.5s on Vercel Edge Network
- Zero JavaScript required to read content (progressive enhancement)
- Images optimized with `next/image` + Cloudflare R2

## Coming soon

- `[ ]` AI-powered search with semantic matching
- `[ ]` Multi-language support (i18n)
- `[ ]` Page-level analytics (views, bounce rate)
- `[ ]` Comment threads on pages
- `[ ]` PDF export
