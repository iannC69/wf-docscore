---
title: System Prerequisites
description: Verify your system environment, runtime engines, and package managers.
order: 1
---

# System Prerequisites

Before installing the Docs Platform, ensure that your system meets the following software requirements.

## Runtime Requirements

| Dependency | Minimum Version | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.18.0` | `20.x LTS` or `22.x` | Turbopack compatibility |
| **Git** | `>= 2.30.0` | Latest | Git metadata and live commit tracking |
| **Package Manager** | `npm 9+`, `pnpm 8+`, or `bun` | `npm` / `pnpm` | Fast dependency resolution |

## Checking Versions

Run the following commands in PowerShell or Bash:

```bash
node -v
npm -v
git --version
```

If any tool is missing, download the latest version from official providers:
- [Node.js Official Downloads](https://nodejs.org)
- [Git for Windows](https://git-scm.com/download/win)
