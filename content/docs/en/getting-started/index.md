---
title: Getting Started
description: Install the Docs Platform in under 5 minutes. Prerequisites, setup, and your first run.
order: 1
---

# Getting Started

This guide walks you through installing and running the Docs Platform locally. By the end you'll have a working docs site connected to your GitHub repository.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 20+** — [download here](https://nodejs.org)
- **Git** installed
- A **GitHub account** (for content source + OAuth)
- A **Turso account** (free tier works) — [turso.tech](https://turso.tech)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/docs-platform.git
cd docs-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the required values. At minimum you need:

```env
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Auth
NEXTAUTH_SECRET=your-32-char-random-string
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth (create at github.com/settings/developers)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Turso database
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-token
```

> [!TIP]
> Generate a secure `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

### 4. Set up the database

Run Drizzle migrations to create your database schema:

```bash
npx drizzle-kit push
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the docs homepage.

## Local content mode

During development, the platform reads content from the `content/docs/` directory in your project. You don't need a GitHub repo configured for local development.

To add a page, create a Markdown file:

```bash
# Creates a new page at /docs/my-page
touch content/docs/my-page.md
```

Add frontmatter at the top:

```markdown
---
title: My Page
description: What this page is about
order: 5
---

# My Page

Your content here...
```

## Directory structure

```
docs-platform/
├── app/                    # Next.js App Router pages
│   ├── docs/               # /docs/* routes
│   └── admin/              # /admin/* routes (Faza 2)
├── components/
│   ├── docs/               # MDX components (Callout, Steps, etc.)
│   ├── layout/             # Header, Sidebar, TOC
│   └── ui/                 # Shared UI components
├── content/
│   └── docs/               # Your markdown files live here
├── lib/
│   ├── mdx.ts              # MDX compilation pipeline
│   ├── navigation.ts       # Nav tree builder
│   └── content.ts          # Page data fetcher
├── styles/                 # Design tokens + component CSS
└── types/                  # TypeScript interfaces
```

## Next steps

- **[Configuration](/docs/getting-started/configuration)** — connect your GitHub repo and configure advanced options
- **[Deployment](/docs/getting-started/deployment)** — deploy to Vercel in one click
