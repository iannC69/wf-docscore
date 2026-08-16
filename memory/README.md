# Wildfire Docs Platform — Design System & Theme Memory

> **System Core Directive**: This memory directory serves as the immutable single source of truth for the **Wildfire Docs Platform** aesthetic, theme tokens, visual effects, and component styling rules. Whenever building new features, routes, or components, consult these guidelines to maintain 100% visual consistency.

---

## 🧭 Memory Index

| Document | Purpose & Contents |
| :--- | :--- |
| **[01. Design Tokens](file:///c:/Users/iannc/Documents/wf-docscore/memory/design-tokens.md)** | HSL color palette, dark/light mode surfaces, glassmorphism tokens, shadows, and radii. |
| **[02. Layout System](file:///c:/Users/iannc/Documents/wf-docscore/memory/layout-system.md)** | Tri-mode layout engine (Standard, Focus, Full), header, sidebar, TOC, and breakpoints. |
| **[03. Liquid & Lava Effects](file:///c:/Users/iannc/Documents/wf-docscore/memory/liquid-effects.md)** | 4-layer SVG Molten Lava Tank, floating ember particles, and ambient liquid glow background. |
| **[04. Component Specs](file:///c:/Users/iannc/Documents/wf-docscore/memory/component-specs.md)** | Callout variations, Tabs, Steps, Cards, CodeBlocks, PageNav, Search Modal, and badges. |
| **[05. Typography & Prose](file:///c:/Users/iannc/Documents/wf-docscore/memory/typography-and-prose.md)** | Font hierarchy, heading anchors, inline code, tables, blockquotes, and prose rules. |
| **[06. Future Roadmap](file:///c:/Users/iannc/Documents/wf-docscore/memory/future-roadmap.md)** | Architectural plan for upcoming features (WYSIWYG Editor, Turso DB, API Playground). |

---

## 🎨 Core Design Philosophy

1. **Restrained Warmth over Harsh Neon**:
   - Primary fire accent is **Warm Ember Orange** (`hsl(26 100% 52%)` / `#F47B00`).
   - Surfaces are deep charcoal and frosted dark obsidian (`hsl(0 0% 6.5%)` to `hsl(0 0% 12.5%)`), **never pure black (#000) or purple/violet backgrounds**.
   - Glows and highlights use low opacity shimmers (`hsl(26 100% 52% / 0.12)`).

2. **Liquid Glassmorphism**:
   - Ultra-subtle hair-thin frosted borders (`1px solid hsl(0 0% 100% / 0.07)`).
   - Semi-transparent glass backdrops (`backdrop-filter: blur(12px)`).
   - Dynamic aurora top-light beams on interactive cards and callouts.

3. **Alive & Tactile Interface**:
   - Fluid keyframe physics for sidebar liquid tank and ember particles.
   - Smooth cubic-bezier transitions (`320ms cubic-bezier(0.16, 1, 0.3, 1)`).
   - Delightful micro-interactions on hover, active states, and keyboard navigation.

4. **Zero Fluff / High Utility**:
   - Keyboard shortcuts for all power tools (<kbd>Ctrl</kbd>+<kbd>K</kbd> for search, <kbd>[</kbd> for sidebar, <kbd>]</kbd> for TOC).
   - Content and code readability always take precedence.
