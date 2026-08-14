---
title: API Reference
description: Programmatic access to your documentation content via the REST API.
order: 1
---

# API Reference

The Docs Platform exposes a lightweight REST API for fetching content, triggering revalidation, and managing users.

## Base URL

```
https://your-docs-site.com/api
```

All API routes return `application/json`. Error responses include a `message` field.

## Authentication

Protected endpoints require a Bearer token. Pass it in the `Authorization` header:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Generate an API token in the Admin Panel under **Settings → API Keys**.

## Endpoints

### GET /api/content/[slug]

Fetch a single doc page by its slug.

**Request**

```http
GET /api/content/getting-started/configuration
Authorization: Bearer YOUR_TOKEN
```

**Response**

```json
{
  "slug": "getting-started/configuration",
  "href": "/docs/getting-started/configuration",
  "frontmatter": {
    "title": "Configuration",
    "description": "Full reference for all environment variables...",
    "order": 2
  },
  "content": "---\ntitle: Configuration\n...",
  "readingTime": 4,
  "wordCount": 820,
  "toc": [
    { "id": "environment-variables", "title": "Environment variables", "depth": 2 },
    { "id": "required", "title": "Required", "depth": 3 }
  ],
  "prev": {
    "title": "Getting Started",
    "href": "/docs/getting-started"
  },
  "next": {
    "title": "Deployment",
    "href": "/docs/getting-started/deployment"
  }
}
```

**Error responses**

| Status | Meaning |
|--------|---------|
| `404` | Page not found |
| `401` | Missing or invalid token |
| `500` | Internal error |

### GET /api/navigation

Returns the full navigation tree.

**Response**

```json
{
  "nav": [
    {
      "title": "Getting Started",
      "items": [
        {
          "title": "Introduction",
          "slug": "getting-started",
          "href": "/docs/getting-started",
          "order": 1
        }
      ]
    }
  ]
}
```

### POST /api/github/webhook

GitHub webhook endpoint. Registers with your repo and handles `push` events to invalidate ISR cache.

**Headers required by GitHub**

```http
Content-Type: application/json
X-Hub-Signature-256: sha256=...
X-GitHub-Event: push
```

This endpoint is called automatically by GitHub — you don't call it yourself.

### POST /api/revalidate

Manually trigger revalidation for a specific page or the entire site.

**Request**

```http
POST /api/revalidate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "slug": "getting-started/configuration"
}
```

Pass `"slug": "*"` to revalidate all pages.

**Response**

```json
{
  "revalidated": true,
  "slug": "getting-started/configuration"
}
```

## TypeScript types

Install the types package for typed API responses:

```typescript
// Types are exported from the platform's type file
import type { DocPage, NavGroup, TocItem, Frontmatter } from "@/types/docs";

interface DocPage {
  slug: string;
  href: string;
  frontmatter: Frontmatter;
  content: string;
  readingTime: number;
  wordCount: number;
  toc: TocItem[];
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
  breadcrumbs: Breadcrumb[];
  githubPath?: string;
  githubEditUrl?: string;
}
```

## Rate limiting

API endpoints are rate-limited to **100 requests per minute** per IP. The response includes rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1723671600
```
