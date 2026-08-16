# Release Workflow & Commit Tracking System

## 📌 Strict Project Directives
1. **NO EMOJIS ANYWHERE**:
   - Never use emojis in badges, titles, buttons, UI elements, changelogs, commit messages, or metadata.
   - Use clean Lucide SVG icons exclusively (e.g., `Sparkles`, `Zap`, `AlertTriangle`, `Bug`, `Flame`, `BookOpen`, `Terminal`, `Layers`, `Tag`, `Calendar`, etc.).

2. **Commit Isolation & Changelog Synchronization**:
   - Commits made during ongoing development stay in Git history.
   - The `/changelog` page remains pinned to the latest published release (e.g. `v1.2.0`) until the user triggers the official release update.
   - When the user gives the command to update / publish the release, the release automation bundles all commits made since the previous version into the new release entry on `/changelog`.

---

## 🚀 Release Automation Command

To trigger an official release update:

```bash
npm run release <version> [title]
```

### Examples:
```bash
npm run release 1.3.0 "Mobile Optimization & Liquid Glass Upgrades"
npm run release 1.4.0 "Interactive API Console & Multi-Language Sync"
```

### What the script (`scripts/release.mjs`) automatically does:
1. Gathers all Git commits since the previous version.
2. Categorizes commits into:
   - `feature` (`feat:`)
   - `fix` (`fix:`)
   - `improvement` (`perf:`, `style:`, `refactor:`, `docs:`)
   - `breaking` (`breaking:`)
3. Sanitizes commit messages (strips prefixes and emojis).
4. Appends the new release card to `lib/changelog.ts` with today's date, maintainer `@iannC69`, and commit hash links.
5. Updates `lib/version.ts` (`CURRENT_VERSION`) — automatically updating:
   - Fixed Top Navbar (`components/layout/Header.tsx`)
   - Left Sidebar Changelog badge (`components/layout/Sidebar.tsx`)
   - Browser tab and metadata
6. Updates `package.json` version.
