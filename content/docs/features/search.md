---
title: Full-Text Search
description: Fast, local full-text search indexing and optional Algolia integration.
order: 4
---

# Full-Text Search

The Docs Platform features an instant search architecture that works completely client-side in standard setups or interfaces with external search engines like Algolia for large-scale enterprise deployments.

## Architecture

The search system operates in two modes:

### Local In-Memory Index (Default)

At build time, the platform creates an optimized JSON index containing:
- Page titles and URLs
- Section heading anchors
- Text excerpts and keywords

When a user presses `⌘K` or `Ctrl+K`, the modal queries this in-memory index with fuzzy matching algorithms. Queries execute in less than 5ms with zero external network requests.

### Algolia DocSearch (Enterprise)

For large knowledge bases with thousands of pages, configure Algolia in your `.env.local`:

```env
NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your-search-key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=docs_index
```

## Keyboard Navigation

The search modal supports full keyboard accessibility:

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` | Open search dialog |
| `↑` / `↓` | Navigate through search results |
| `Enter` | Select active result and navigate |
| `Esc` | Close search dialog |

## Custom Search Attributes

You can enhance page search relevance by defining custom keywords in frontmatter:

```yaml
---
title: Authentication
description: Setup OAuth and session tokens
keywords: [login, github auth, nextauth, jwt, session]
---
```
