# 04. Component Specifications & MDX Elements

This document outlines the React components, properties, and styling guidelines for all custom MDX and UI components.

---

## 📢 1. Callout Component ([`components/docs/Callout.tsx`](file:///c:/Users/iannc/Documents/wf-docscore/components/docs/Callout.tsx))

Used for alerts, tips, warnings, and notes in Markdown documentation.

### Variants:
| Variant | Accent Color | Default Title | Icon |
| :--- | :--- | :--- | :--- |
| `tip` | Fire Orange (`hsl(26 100% 52%)`) | *Tip* | `Sparkles` |
| `important` | Amber (`hsl(32 100% 50%)`) | *Important* | `Flame` |
| `note` | Sky Blue (`hsl(210 85% 56%)`) | *Note* | `Info` |
| `warning` | Yellow (`hsl(44 100% 52%)`) | *Warning* | `AlertTriangle` |
| `danger` | Crimson (`hsl(4 90% 52%)`) | *Danger* | `AlertCircle` |
| `success` | Emerald (`hsl(142 72% 42%)`) | *Success* | `CheckCircle2` |

### MDX Usage:
```jsx
<Callout type="tip" title="Pro Tip">
  Use `npm run dev` to start the live Turbopack development server.
</Callout>
```

---

## 🗂️ 2. Tabs Component ([`components/docs/Tabs.tsx`](file:///c:/Users/iannc/Documents/wf-docscore/components/docs/Tabs.tsx))

Provides tabbed code snippets or alternative flows (e.g. `npm`, `pnpm`, `yarn`, `bun`).

### MDX Usage:
```jsx
<Tabs items={["npm", "pnpm", "yarn", "bun"]}>
  ```bash
  npm install
  ```
  ```bash
  pnpm install
  ```
  ```bash
  yarn install
  ```
  ```bash
  bun install
  ```
</Tabs>
```

### Styling Details:
- Active tab has bottom border glow and subtle warm background.
- Preserves smooth tab switching without content jump.

---

## 🪜 3. Steps Component ([`components/docs/Steps.tsx`](file:///c:/Users/iannc/Documents/wf-docscore/components/docs/Steps.tsx))

Creates numbered step-by-step walkthroughs with vertical connecting guide lines.

### MDX Usage:
```jsx
<Steps>
  ### Clone the Repository
  Run `git clone https://github.com/iannC69/wf-docscore.git`.

  ### Install Dependencies
  Run `npm install`.

  ### Launch App
  Run `npm run dev`.
</Steps>
```

---

## 🎴 4. Card & Cards Grid ([`components/docs/Card.tsx`](file:///c:/Users/iannc/Documents/wf-docscore/components/docs/Card.tsx))

Interactive link cards for documentation navigation and external resources.

### MDX Usage:
```jsx
<Cards>
  <Card title="Quickstart" href="/docs/getting-started" icon="Rocket">
    Install and run in under 5 minutes.
  </Card>
  <Card title="Configuration" href="/docs/getting-started/configuration" icon="Sliders">
    Setup your environment and GitHub App.
  </Card>
</Cards>
```

### Styling Rules:
- Hover raises card `translateY(-2px)`, highlights border with `var(--color-primary-border)`, and glows arrow icon.

---

## 💻 5. Code Block & Copyable Pre ([`components/docs/CopyablePre.tsx`](file:///c:/Users/iannc/Documents/wf-docscore/components/docs/CopyablePre.tsx))

- Server-side pre-rendered syntax highlighting with Shiki.
- Top bar displays language badge (e.g. `typescript`, `bash`, `json`).
- Copy button in top right with animated checkmark feedback on click.
- Monospace font: `'JetBrains Mono', 'Fira Code', monospace`.

---

## 🔍 6. Global Search Modal ([`components/ui/SearchModal.tsx`](file:///c:/Users/iannc/Documents/wf-docscore/components/ui/SearchModal.tsx))

- Opened via <kbd>Ctrl</kbd>+<kbd>K</kbd>, <kbd>⌘K</kbd>, or <kbd>/</kbd>.
- Searches document titles, descriptions, headings, and full text with fuzzy matching.
- Highlights matching keyword substrings.
- Keyboard accessible: Arrow keys to navigate results, Enter to jump, Escape to close.

---

## 🚀 7. Previous / Next PageNav ([`components/ui/PageNav.tsx`](file:///c:/Users/iannc/Documents/wf-docscore/components/ui/PageNav.tsx))

- Dual bottom cards linking to previous and next sequential document pages.
- Features aurora hover beam and directional arrows.

---

## 👤 8. Author & Commit Metadata Chip (`.page-author-chip`, `.page-commit-chip`)

- Displays in the page header meta bar on every documentation page.
- Features:
  - Author Avatar with frosted ring and subtle ember glow.
  - "Updated by" or "Posted by" label + GitHub profile link (`@iannC69`).
  - Relative updated time (e.g. `2d ago`, `1h ago`) with full ISO timestamp tooltip.
  - Direct Commit Hash Chip (`#4a740e3`) linking to GitHub commit.

---

## ✏️ 9. Header "Edit Page" Action Button (`.page-top-edit-btn`)

- Positioned in the top row alongside breadcrumbs and status badges.
- Frosted glass button with fire ember hover elevation and external link icon.
- Directly opens the GitHub web editor for that exact Markdown file in the repo.

---

## 🕒 10. Recently Updated Documentation Cards (`.recent-update-card`)

- Rendered dynamically on the Documentation Hub (`/docs`, `app/docs/page.tsx`).
- Powered by `getRecentlyUpdatedDocs()` in `lib/git.ts`.
- Features:
  - Aurora top light beam on hover.
  - Category pill + relative time badge (`Clock` icon + `2h ago`).
  - Document title and excerpt description.
  - Footer with author avatar, author name, commit hash badge, and reading time.
