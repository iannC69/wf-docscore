---
title: Installation
description: Step-by-step guide to installing and running the Docs Platform locally.
order: 2
---

# Installation

This guide walks you through installing the Docs Platform on your local machine.

## Clone the repository

```bash
git clone https://github.com/your-org/docs-platform.git
cd docs-platform
```

## Install dependencies

```bash
npm install
```

This will install all required packages including Next.js, Tiptap, Octokit, and the MDX pipeline.

## Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure the required variables:

```env
# Required for production (leave empty to use local files in dev)
GITHUB_REPO_OWNER=your-org
GITHUB_REPO_NAME=your-docs-repo
GITHUB_DOCS_BRANCH=main
GITHUB_DOCS_PATH=docs/

# GitHub App credentials (for write access)
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=
GITHUB_INSTALLATION_ID=
GITHUB_WEBHOOK_SECRET=

# Auth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

> [!NOTE]
> In development mode without GitHub credentials, the platform automatically reads from the local `content/docs/` directory. No GitHub setup required to get started.

## Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see your documentation site running.

## Project structure

```
docs-platform/
├── content/          ← Local docs (used in dev mode)
│   └── docs/
├── app/              ← Next.js App Router pages
│   ├── docs/         ← Public docs site
│   └── admin/        ← Admin panel
├── components/       ← React components
├── lib/              ← Utilities (GitHub, MDX, nav)
├── styles/           ← Design system CSS
└── types/            ← TypeScript type definitions
```

## Verify the installation

After starting the dev server, verify that the following operations work:

- Visit `http://localhost:3000/docs` and confirm the documentation home renders.
- Navigate across sidebar categories and verify active link indicators.
- Test the dark and light theme toggle in the top-right header.
- Use `⌘K` or `Ctrl+K` to open the search modal.

If you encounter any build errors or missing dependencies, consult the [configuration reference](/docs/getting-started/configuration).
