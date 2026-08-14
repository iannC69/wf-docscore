---
title: MDX Components
description: Full reference for all built-in MDX components — Callout, Steps, Tabs, Cards, CodeBlock, and more.
order: 2
---

# MDX Components

All custom components are available in every `.md` and `.mdx` file without any imports. Just use them directly in your markdown.

## Callout

Use callouts to highlight important information. The platform supports GitHub-style alert syntax:

```markdown
> [!NOTE]
> This is a note callout. Use it for supplementary information.

> [!TIP]
> This is a tip. Great for best practices.

> [!WARNING]
> This is a warning. Use for things that could go wrong.

> [!IMPORTANT]
> Critical information the reader must not miss.

> [!DANGER]
> Reserved for destructive or irreversible actions.
```

Or use the JSX component directly with a custom title:

```jsx
<Callout type="tip" title="Pro tip">
  You can nest markdown inside callouts. Even `code` and **bold**!
</Callout>
```

> [!TIP]
> GitHub-style callouts are automatically parsed from standard blockquote syntax. No extra syntax to learn.

## Steps

Use steps for numbered sequential processes:

```jsx
<Steps>
  <Step title="Install dependencies">
    Run `npm install` in your project directory.
  </Step>
  <Step title="Configure environment">
    Copy `.env.example` to `.env.local` and fill in your values.
  </Step>
  <Step title="Start the server">
    Run `npm run dev` and open http://localhost:3000.
  </Step>
</Steps>
```

## Tabs

Group related content into switchable tabs:

```jsx
<Tabs>
  <Tab label="npm">
    Run `npm install @docs-platform/core`
  </Tab>
  <Tab label="pnpm">
    Run `pnpm add @docs-platform/core`
  </Tab>
  <Tab label="yarn">
    Run `yarn add @docs-platform/core`
  </Tab>
</Tabs>
```

## Cards

Use cards for navigation sections on overview pages:

```jsx
<Cards>
  <Card
    title="Getting Started"
    href="/docs/getting-started"
    description="Install and configure in minutes."
    icon="🚀"
  />
  <Card
    title="API Reference"
    href="/docs/api-reference"
    description="Full API documentation."
    icon="📡"
  />
</Cards>
```

## Code blocks

All code blocks automatically get syntax highlighting via Shiki, a copy button, and a language label. Shiki runs server-side — no flash, no JavaScript required.

Supported languages include: `typescript`, `javascript`, `tsx`, `jsx`, `bash`, `json`, `yaml`, `markdown`, `python`, `rust`, `go`, `sql`, `css`, `html`, and [100+ more](https://shiki.style/languages).

> [!NOTE]
> Syntax highlighting runs entirely on the server via Shiki. Readers don't need JavaScript enabled to see highlighted code.

## Tables

Standard GFM tables are fully supported and automatically styled:

| Column A | Column B | Column C |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |

## Task lists

```markdown
- [x] Completed item
- [ ] Pending item
- [ ] Another pending item
```

## Links

Internal links use Next.js `Link` for client-side navigation (instant page transitions). External links automatically get `target="_blank"` and `rel="noopener noreferrer"`.

| Link type | Behavior |
|-----------|----------|
| `/docs/page` | Client-side navigation |
| `./relative` | Client-side navigation |
| `https://...` | Opens in new tab |
| `#heading` | Smooth scroll |

## Frontmatter reference

Every Markdown file supports these frontmatter options:

```yaml
---
title: Page Title
description: Used in sidebar tooltip and SEO
order: 1
badge: New
showToc: true
showFeedback: true
seoTitle: Custom SEO Title
seoDescription: Custom meta description
---
```
