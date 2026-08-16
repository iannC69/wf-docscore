# 02. Layout System & Responsive Architecture

The **Wildfire Docs Platform** utilizes a fluid, customizable multi-mode layout engine managed via `LayoutContext` ([`context/LayoutContext.tsx`](file:///c:/Users/iannc/Documents/wf-docscore/context/LayoutContext.tsx)).

---

## 🎛️ Three Layout Modes

| Mode | Shortcut | Left Sidebar | Center Content | Right TOC | Typical Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard** | default | `268px` (Expanded) | Max `760px` centered | `250px` (Expanded) | Default desktop reading & browsing |
| **Focus** | Mode Switch | `0px` (Collapsed) | Max `840px` centered | `250px` (Expanded) | Distraction-free reading with quick outline |
| **Full** | Mode Switch | `0px` (Collapsed) | Max `1100px` expanded | `0px` (Collapsed) | Broad API specifications & wide tables |

### Keyboard Shortcuts
- <kbd>[</kbd> : Quick toggle left sidebar
- <kbd>]</kbd> : Quick toggle right table of contents
- <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘K</kbd> or <kbd>/</kbd> : Open global search dialog

---

## 🏛️ Layout Structure & CSS Grid

```
┌────────────────────────────────────────────────────────────────────────┐
│ Header (height: 58px, sticky top, glassmorphism backdrop)             │
├──────────────┬──────────────────────────────────────────┬──────────────┤
│ Left Sidebar │ Document Content Area                    │ Right TOC    │
│ (268px)      │ (Max 760px / 840px / 1100px)             │ (250px)      │
│              │                                          │              │
│ - Nav Groups │ - Breadcrumbs & Tag                      │ - Heading    │
│ - Edge Card  │ - H1 Title & Meta (read time, words)     │   outline    │
│ - Molten     │ - Prose MDX Body                         │ - Scroll-spy │
│   Lava Tank  │ - Feedback Widget & Github Edit link     │   active     │
│              │ - Previous / Next PageNav Cards          │   indicator  │
└──────────────┴──────────────────────────────────────────┴──────────────┘
```

---

## 🧭 Header Dimensions & Elements

## 📐 1. Fixed Top Navigation Bar (`components/layout/Header.tsx`)

- Height: `58px` (`--header-height`).
- Background: `var(--glass-bg)` with `backdrop-filter: blur(18px)` and hairline bottom border.
- **Brand Identity**:
  - Official brand logo image (`/logo.png`) housed in a frosted glass badge with hover elevation.
  - Bold uppercase typography: `WILDFIRE` with amber `DOCS` badge and a frosted `v1.0` version pill tag.
  - Dynamic Browser Tab Title: `Wildfire Docs — Developer Documentation Engine` (with sub-page template `%s — Wildfire Docs`).
  - App Favicon: Custom `/logo.png` generated at `/icon.png` and `/apple-icon.png`.
- **Center Search Dialog Trigger**:
  - Frosted glass input pill (`max-width: 440px`) with animated search icon and keyboard shortcut key (`⌘K` on Mac, `Ctrl K` on Windows/Linux) that glows with an amber border on hover.
- **Right Controls**:
  - Segmented tri-mode glass switcher (`Standard`, `Focus`, `Full`).
  - Mobile search trigger icon button (`.header-mobile-search-btn`) for `<= 1024px`.
  - GitHub repository icon button with subtle frosted hover ring.
  - Smooth light/dark theme toggle button.

---

## 📱 4. Mobile & Tablet 100% Responsive Adaptation

- **Header Breakpoints**:
  - `> 1024px` (Desktop): Full center search input (`max-width: 440px`), segmented tri-mode controls, GitHub link, and theme toggle.
  - `769px - 1024px` (Tablets & iPads):
    - Replaces desktop center input with a frosted glass search icon button (`.header-mobile-search-btn`).
    - Hides segmented tri-mode controls to preserve clean horizontal space.
    - Displays the hamburger menu toggle (`.mobile-menu-toggle`) on the left.
  - `<= 768px` (Mobile & Phablets):
    - Compact 12px header padding.
    - Collapses version pill and sub-text badges to maintain a clean single-row header.
- **Mobile Sidebar Touch Drawer (`components/layout/Sidebar.tsx`)**:
  - Smooth slide-in drawer (`transform: translateX(0)` with `0.28s cubic-bezier` easing) width `min(300px, 85vw)` with a deep frosted backdrop blur overlay (`.sidebar-overlay`).
  - Auto-closes automatically whenever a reader taps any navigation link (`closeMobileSidebar()`).
  - Touch-friendly tap targets (`min-height: 38px` per item).
- **Mobile In-Page Table of Contents (`components/layout/MobileTableOfContents.tsx`)**:
  - Automatically activates on `<= 1200px` screens replacing the desktop right sidebar.
  - Renders a frosted glass accordion bar (`📑 On this page: Heading Title`) right above the article title.
  - Tapping expands the animated table of contents and smoothly scrolls to headings on tap before auto-closing.
- **Content & Grid Responsiveness**:
  - "Recently Updated" Cards: `1 column` on phones (`<= 768px`), `2 columns` on tablets (`769px - 1024px`), `3 columns` on desktops (`> 1024px`).
  - Code blocks: Horizontal scrolling with sticky copy buttons (`-webkit-overflow-scrolling: touch`).
  - Tables: Touch-scrollable wrappers with clean hairline borders.
  - Page Navigation & Metadata: Responsive wrap prevents clipping on small viewports.

---

## 📐 2. Left Sidebar Navigation (`components/layout/Sidebar.tsx`)

- Fixed width: `268px` (`--sidebar-width`).
- Position: `fixed`, top: `var(--header-height)`, left: `0`, height: `calc(100vh - var(--header-height))`, `overflow: hidden`.
- Background: `var(--glass-bg)` with `backdrop-filter: blur(16px)` and `border-right: 1px solid var(--glass-border)`.
- **Three-Tier Architecture**:
  1. **Pinned Top Bar**: Frosted glass flame icon box (`22px`), uppercase `NAVIGATION` title, amber `EXPLORER` badge, and sidebar collapse button with `[` shortcut hint.
  2. **Independent Scroll Area (`.sidebar-scroll-wrapper`)**:
     - Middle navigation tree scrolls independently with smooth thin scrollbar.
     - **Fade-Down Gradient Overlay (`.sidebar-fade-down`)**: Smooth mask gradient (`height: 36px`) that cleanly dissolves long section lists as they scroll behind the bottom dock.
  3. **Pinned Bottom Dock (`.sidebar-bottom-dock`)**:
     - **Always visible** at the bottom of the sidebar (never gets pushed off-screen).
     - Houses the **Production Edge status card**, the **system status indicator** ("Wildfire Docs v1.0"), and the **seamless Molten Lava Wave Tank** (`LiquidFireWave`, `height: 60px`).
- **Collapsible Hierarchies**:
  - **Category Groups** (`CollapsibleNavGroup`): Clicking group titles (e.g. `GETTING STARTED`, `CORE FEATURES`, `API REFERENCE`) collapses/expands the section with smooth chevron rotation.
  - **Nested Sections & Sub-Pages** (`NavItemRow`): Any document item with child files or companion subfolders (e.g., `Installation` → `Quickstart Guide`, `Docker Deployment`) renders an interactive expand/collapse toggle (`ChevronRight`) and an indented sub-list with a subtle vertical connector tree line (`border-left: 1px solid var(--color-border)`).
  - **Auto-Expansion**: When visiting any child page or parent page, active sections automatically expand to display the active route.

---

## 📋 Table of Contents (TOC)

- **Width**: `250px`
- **Position**: `sticky top: calc(var(--header-height) + 24px)`
- **Behavior**:
  - Automatically extracts `h2`, `h3`, and `h4` headings from MDX.
  - Active scroll spy highlights current heading based on viewport intersection.
  - Smooth click-to-scroll with `scroll-margin-top` offset for the sticky header.

---

## 📱 Responsive Breakpoints

| Breakpoint | Target Device | Layout Adjustments |
| :--- | :--- | :--- |
| **> 1280px** | Large Desktop | All columns (Sidebar, Content, TOC) visible. |
| **1024px – 1279px** | Small Desktop / Tablet Landscape | Right TOC collapses automatically, toggleable via header button. |
| **768px – 1023px** | Tablet Portrait | Sidebar collapses into drawer, full width reading content. |
| **< 768px** | Mobile | Sidebar transforms to sliding off-canvas drawer with backdrop mask; header hamburger visible. |
