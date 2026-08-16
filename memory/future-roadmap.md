# 06. Future Roadmap & Feature Integrations

This document maps out upcoming features and architectural extensions while maintaining strict adherence to the **Wildfire liquid glass & ember theme**.

---

## 🎯 High-Priority Features

### 1. Visual WYSIWYG Editor (`/editor`)
- **Engine**: Tiptap editor with Markdown/MDX parser.
- **GitOps Integration**: Edit pages visually and trigger direct GitHub commits via Octokit with custom commit messages.
- **Styling**: Frosted floating toolbar matching the header glass design tokens, live preview pane with synchronized scroll.

### 2. Turso (libSQL) & Drizzle ORM Database
- **Entities**:
  - `page_views` / `analytics`: Track page hits, reading times, popular queries.
  - `feedback`: Thumbs up/down votes + qualitative user comments.
  - `users` & `permissions`: Admin, Editor, and Viewer roles.
- **Edge Compatibility**: Fully compatible with Vercel Edge runtime and Turso serverless SQL.

### 3. Interactive API Playground / OpenAPI Specification Viewer
- **Spec Parser**: Read OpenAPI 3.0 / Swagger JSON & YAML specifications.
- **Interactive Console**: Live `curl` / `fetch` request builder with environment variable switching (e.g. Production vs Staging).
- **Theme Consistency**: Method pills matching semantic accents (`GET` in Teal, `POST` in Orange, `DELETE` in Red, `PUT` in Amber).

### 4. Admin Management Dashboard (`/admin`)
- Real-time GitHub sync status monitor.
- Search query analytics & zero-result search query alerts.
- Broken link detector and content health scoring engine.

---

## 🔒 Aesthetic Consistency Checklist for New Features

Whenever implementing a new component or page:
1. [ ] Use HSL color variables from `styles/tokens.css` (never hardcoded hex codes).
2. [ ] Apply frosted glass backdrops (`backdrop-filter: blur(12px)`) to floating panels, modals, and toolbars.
3. [ ] Include the signature aurora top-light shimmer beam (`::before` gradient) on interactive card elements.
4. [ ] Support both Dark Mode (`[data-theme="dark"]`) and Light Mode (`[data-theme="light"]`).
5. [ ] Provide responsive handling for mobile and desktop screens.
6. [ ] Include keyboard shortcuts where applicable for power users.
