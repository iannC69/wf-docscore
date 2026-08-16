---
title: Installation Overview
description: Step-by-step guide to installing and running the Docs Platform locally.
order: 2
---

# Installation Overview

This guide walks you through installing the Wildfire Docs Platform on your local machine and configuring the local development environment.

## Quick Installation

```bash
git clone https://github.com/iannC69/wf-docscore.git
cd wf-docscore
npm install
npm run dev
```

## Available Sub-Guides

Explore the detailed setup instructions for your specific environment:

- **[Quickstart Guide](/docs/getting-started/installation/quickstart)** — 2-minute rapid bootstrap.
- **[System Prerequisites](/docs/getting-started/installation/prerequisites)** — Node.js, Git, and package manager requirements.
- **[CLI Tool](/docs/getting-started/installation/cli)** — Command-line tools for content and schema scaffolding.
- **[Docker Deployment](/docs/getting-started/installation/docker)** — Containerized multi-stage Docker deployment.
- **[Troubleshooting](/docs/getting-started/installation/troubleshooting)** — Resolving common environment and script execution issues.

## Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure:

```env
# Production GitHub sync (optional in local dev)
GITHUB_REPO_OWNER=iannC69
GITHUB_REPO_NAME=wf-docscore
GITHUB_DOCS_BRANCH=main

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
