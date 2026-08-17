---
title: Welcome to Docs Platform
description: >-
  A fully custom documentation platform with GitHub integration, visual editor,
  and admin panel — built from the ground up.
order: 0
---
## Welcome to Docs Platform
A powerful, self-hosted documentation platform built with **Next.js 15**, **GitHub integration**, and a **visual WYSIWYG editor**. Designed to replace tools like Fumadocs and VitePress with something completely yours.

## What makes this different?
Unlike hosted solutions, this platform gives you **complete control** over your content pipeline, editor experience, and deployment strategy.

- **GitHub as source of truth** — content lives in your repo as Markdown/MDX files
- **Visual editor** — non-technical writers can edit without touching code
- **Auto-commit** — saving in the editor creates a real GitHub commit
- **Admin panel** — manage users, roles, and permissions
- **Full-text search** — powered by local index + optional Algolia
- **Analytics** — track page views, reading time, and popular content

## Architecture overview
```
Content Request
↓
Next.js App Router (SSG/ISR)
↓
Cache Layer (Upstash Redis)
↓
GitHub API (Octokit) — reads .md files from your repo
↓
MDX Pipeline (Shiki + GFM + autolink headings)
↓
React Components (Callout, CodeBlock, Steps, Tabs)
```

## Tech stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | Turso (libSQL) + Drizzle ORM |
| Auth | NextAuth v5 + GitHub OAuth |
| Editor | Tiptap (WYSIWYG) |
| Content | GitHub API via Octokit |
| Cache | Upstash Redis |
| Storage | Cloudflare R2 |
| Deploy | Vercel |

## Quick navigation
- **[Getting Started](/docs/getting-started)** — install and run in 5 minutes
- **[Configuration](/docs/getting-started/configuration)** — connect GitHub and configure environment
- **[Features](/docs/features)** — overview of all platform capabilities
- **[API Reference](/docs/api-reference)** — programmatic access to your content
