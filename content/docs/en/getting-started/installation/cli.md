---
title: CLI Commands & Tooling
description: Overview of developer CLI scripts, build pipelines, and maintenance utilities.
order: 3
---

# CLI Commands & Tooling

The Docs Platform provides native npm scripts and automation utilities for rapid iteration.

## Available NPM Scripts

```bash
# Start Turbopack dev server with hot-reload
npm run dev

# Compile optimized static production build
npm run build

# Start production server
npm start

# Run TypeScript typechecks
npm run typecheck
```

## Useful Git Shortcuts

The engine reads your Git commit history dynamically:

```bash
# View last 5 commits for content verification
git log --oneline -n 5

# Check working tree status
git status
```
