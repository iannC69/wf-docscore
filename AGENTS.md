<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# PERMANENT PROJECT RULES & USER DIRECTIVES

## 1. STRICTLY NO EMOJIS — ONLY VECTOR ICONS (LUCIDE REACT)
- Never use Unicode emojis anywhere in the UI, components, buttons, dropdowns, templates, markdown content, code, or assistant responses.
- Always use professional, clean vector SVG icons from `lucide-react` (e.g. `<BookOpen />`, `<Coins />`, `<Cpu />`, `<ShoppingBag />`, `<Folder />`, `<Save />`, `<Plus />`, `<Wand2 />`, `<ExternalLink />`).
- Maintain a clean, professional, enterprise-grade dark aesthetic.

## 2. STRICTLY NO GIT COMMIT / NO GIT PUSH WITHOUT EXPLICIT USER PERMISSION
- Never execute `git commit` or `git push` without explicit user instruction and confirmation in the chat prompt.

## 3. MANDATORY LIQUID GLASS AESTHETIC ACROSS ENTIRE PLATFORM
- Always preserve and enforce the signature **Liquid Glass** theme (`var(--glass-bg)`, `var(--glass-border)`, `backdrop-filter: blur(16px)`, subtle gradient glows, soft specular borders) across all public documentation pages AND all admin dashboard views.
- No flat, raw, or default browser elements (e.g. native unstyled selects, plain unstyled borders, or basic Windows form controls).

## 4. VIBRANT PILLS & TAGS ARCHITECTURE — NO PLAIN BLANK WHITE TEXT
- Never display raw, sterile, unstyled white text blocks or long plain lists.
- Always organize data, statuses, actions, permissions, metadata, and key identifiers into colorful, refined glass pills, tags, chips, and micro-badges (`.admin-perm-tag`, `.admin-status-pill`, `.toc-progress-chip`).
- Use category-specific vibrant color accents with matching tinted backgrounds (e.g. emerald for content, cyan for media, amber/orange for root & settings, purple for telemetry, rose/red for panic & delete, blue for security).

## 5. ZERO COMPILER ERRORS, ZERO WARNINGS, ZERO TYPOS
- Guarantee 100% build integrity across all Next.js routes with zero compilation errors, zero Turbopack/TypeScript errors, zero MDX hydration issues, and zero missing CSS rules.
- Maintain meticulous spelling, casing, and proper Romanian diacritics/translations without typos or broken string formatting.

## 6. ROOT SUPER ADMIN IMMUNITY & PERMISSION ISOLATION
- Super Admin `iannC69` (and `iannC`) is the absolute root authority (`isRoot: true`).
- Root sessions and credentials are permanently immune from non-root revocation or tampering.
- Panic Lockdown controls and high-privilege operations remain strictly restricted to Root verification.

