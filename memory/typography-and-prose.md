# 05. Typography & Prose Styling

This document outlines the typographic rules and Markdown prose styling rules in [`styles/prose.css`](file:///c:/Users/iannc/Documents/wf-docscore/styles/prose.css).

---

## 🔤 Font Stack & Sizes

### Primary Fonts
- **Body & Headings**: `'Inter', system-ui, -apple-system, sans-serif`
- **Code & Snippets**: `'JetBrains Mono', 'Fira Code', monospace`

### Typographic Scale
| Token | Rem | Pixel Equivalent | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| `--text-xs` | `0.6875rem` | 11px | 1.3 | +0.02em |
| `--text-sm` | `0.875rem` | 14px | 1.45 | normal |
| `--text-base` | `1.000rem` | 16px | 1.625 (`--leading-relaxed`) | normal |
| `--text-lg` | `1.125rem` | 18px | 1.375 | -0.01em |
| `--text-xl` | `1.250rem` | 20px | 1.3 | -0.015em |
| `--text-2xl` | `1.500rem` | 24px | 1.25 | -0.02em |
| `--text-3xl` | `1.875rem` | 30px | 1.2 | -0.025em |
| `--text-4xl` | `2.250rem` | 36px | 1.15 | -0.03em |

---

## 📑 Headings Hierarchy & Anchors

1. **H1 (`--text-3xl`, 750 weight)**:
   - Primary page title. Rendered cleanly with category pill above and reading time metadata below.
2. **H2 (`--text-2xl`, 650 weight)**:
   - Major content divisions. Underlined with subtle 1px border (`var(--color-border)`).
   - Generates clickable `#` anchor link on hover.
3. **H3 (`--text-xl`, 650 weight)**:
   - Subsections. Also indexed into the right Table of Contents.
4. **H4 (`--text-lg`, 600 weight)**:
   - Minor subsections and parameters.

### Heading Anchor Links
- Hidden by default (`opacity: 0`), reveals on heading hover (`opacity: 0.7`), turns primary orange on direct hover (`opacity: 1`, `color: var(--color-primary-hover)`).
- `scroll-margin-top: calc(var(--header-height) + var(--space-6))` ensures sticky header never overlaps the heading when clicked.

---

## 💻 Inline Code & Code Blocks

- **Inline Code**:
  - Dark: `background: var(--color-primary-subtle)`, `border: 1px solid var(--color-primary-border)`, `color: var(--color-primary)`.
  - Light: `background: hsl(26 100% 52% / 0.06)`, `border-color: hsl(26 100% 52% / 0.15)`, `color: hsl(26 100% 40%)`.
  - Border radius: `5px`, padding: `0.15em 0.4em`.
- **Keyboard Badges (`<kbd>`)**:
  - `background: var(--color-surface-raised)`, `border: 1px solid var(--color-border-strong)`, font-family monospace.

---

## 📊 Tables & Data Grids

- **Header (`<thead>`)**:
  - Background: `var(--color-surface-raised)`.
  - Text: `font-weight: 600`, `letter-spacing: 0.02em`, `color: var(--color-text)`.
- **Borders**:
  - Separate collapsing with `1px solid var(--color-border)`.
  - Rounded outer corners (`border-radius: var(--radius-lg)`).
- **Zebra Striping**:
  - Even rows have subtle alternate surface background `var(--color-surface)`.

---

## 💬 Blockquotes

- Left border: `3px solid var(--color-primary)`.
- Subtle gradient fill: `linear-gradient(135deg, hsl(26 100% 52% / 0.05) 0%, var(--color-surface) 60%)`.
- Text color: `var(--color-text-secondary)`.
