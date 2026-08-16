# 01. Design Tokens & Color Palette

This document defines all active CSS custom properties, color palettes, surface tiers, and design tokens used across the **Wildfire Docs Platform**.

---

## 🎨 Color Palette (HSL Tailored)

### 1. Primary Fire & Ember
- `--color-primary`: `hsl(26 100% 52%)` (#F47B00)
- `--color-primary-hover`: `hsl(26 100% 46%)`
- `--color-primary-dim`: `hsl(26 100% 52% / 0.12)`
- `--color-primary-subtle`: `hsl(26 100% 52% / 0.06)`
- `--color-primary-border`: `hsl(26 100% 52% / 0.22)`
- `--color-primary-fg`: `#ffffff`

### 2. Semantic Accents
| Accent | Variable | Dark Mode Value | Use Case |
| :--- | :--- | :--- | :--- |
| **Fire Orange** | `--color-accent-orange` | `hsl(26 100% 52%)` | Primary brand, active tabs, guides |
| **Teal / Cyan** | `--color-accent-teal` | `hsl(168 80% 44%)` | GitOps, branches, webhooks, success |
| **Purple** | `--color-accent-purple` | `hsl(258 75% 62%)` | Architecture, components, features |
| **Yellow / Amber** | `--color-accent-yellow` | `hsl(44 100% 52%)` | Config, setup, warnings, embers |
| **Red / Crimson** | `--color-accent-red` | `hsl(4 90% 52%)` | Deployment, danger, breaking changes |
| **Blue / Sky** | `--color-accent-blue` | `hsl(210 85% 56%)` | API Reference, endpoints, info |

---

## 🌑 Dark Mode Surface Hierarchy

| Surface Level | Variable | Color (HSL) | Purpose |
| :--- | :--- | :--- | :--- |
| **Base Canvas** | `--color-bg` | `hsl(0 0% 6.5%)` (#111111) | Main document background |
| **Subtle Canvas** | `--color-bg-subtle` | `hsl(0 0% 8.5%)` (#161616) | Secondary sections, nested blocks |
| **Card Surface** | `--color-surface` | `hsl(0 0% 10%)` (#1a1a1a) | Default card & container background |
| **Raised Surface** | `--color-surface-raised` | `hsl(0 0% 12.5%)` (#202020) | Active cards, table headers, dropdowns |
| **Overlay Surface**| `--color-surface-overlay`| `hsl(0 0% 14.5%)` (#252525) | Modals, floating menus, popovers |

---

## ☀️ Light Mode Surface Hierarchy

| Surface Level | Variable | Color (HSL) |
| :--- | :--- | :--- |
| **Base Canvas** | `--color-bg` | `hsl(0 0% 98.5%)` |
| **Subtle Canvas** | `--color-bg-subtle` | `hsl(0 0% 95%)` |
| **Card Surface** | `--color-surface` | `#ffffff` |
| **Raised Surface** | `--color-surface-raised` | `hsl(0 0% 96%)` |
| **Overlay Surface**| `--color-surface-overlay`| `#ffffff` |

---

## 🪟 Glassmorphism Tokens

```css
/* Dark Mode */
--glass-bg:              hsl(0 0% 100% / 0.035);
--glass-bg-hover:        hsl(0 0% 100% / 0.065);
--glass-border:          hsl(0 0% 100% / 0.08);
--glass-border-hover:    hsl(26 100% 52% / 0.30);
--glass-active-bg:       linear-gradient(135deg, hsl(26 100% 52% / 0.13) 0%, hsl(26 100% 52% / 0.04) 100%);
--glass-active-border:   hsl(26 100% 52% / 0.32);

/* Backdrop filter rule */
backdrop-filter: blur(12px) saturate(140%);
-webkit-backdrop-filter: blur(12px) saturate(140%);
```

---

## 🔲 Borders, Radii, & Spacing

### Border Radii
- `--radius-sm`: `5px` (Badges, inline code, small buttons)
- `--radius-md`: `8px` (Icon boxes, inputs, tooltips)
- `--radius-lg`: `11px` (Cards, Callouts, Code blocks)
- `--radius-xl`: `14px` (Search Modal, Layout wrappers)
- `--radius-full`: `9999px` (Pills, Category dots, Avatars)

### Spacing Scale
- `--space-1`: `0.25rem` (4px)
- `--space-2`: `0.5rem` (8px)
- `--space-3`: `0.75rem` (12px)
- `--space-4`: `1rem` (16px)
- `--space-5`: `1.25rem` (20px)
- `--space-6`: `1.5rem` (24px)
- `--space-8`: `2rem` (32px)
- `--space-10`: `2.5rem` (40px)
- `--space-12`: `3rem` (48px)
- `--space-16`: `4rem` (64px)

---

## ⚡ Shadows & Liquid Glows

```css
/* Natural Depth Shadows */
--shadow-xs: 0 1px 2px hsl(0 0% 0% / 0.20);
--shadow-sm: 0 2px 6px hsl(0 0% 0% / 0.25);
--shadow-md: 0 4px 16px hsl(0 0% 0% / 0.35);
--shadow-lg: 0 8px 32px hsl(0 0% 0% / 0.45);
--shadow-xl: 0 16px 48px hsl(0 0% 0% / 0.55);

/* Warm Liquid Fire Glows (Restrained, never blown out) */
--glow-fire:  0 0 16px hsl(26 100% 52% / 0.12);
--glow-ember: 0 0 8px hsl(26 100% 52% / 0.18);
```

---

## 📐 Transitions & Timing Curves

```css
--transition-fast:   100ms ease;
--transition-base:   180ms ease;
--transition-slow:   320ms ease;
--transition-spring: 320ms cubic-bezier(0.16, 1, 0.3, 1);
```
Always use `--transition-spring` for smooth layout collapses and modal reveals.
