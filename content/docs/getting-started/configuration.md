---
title: Configuration
description: Full reference for all environment variables, GitHub App setup, theming, and navigation configuration.
order: 2
---

# Configuration

This page covers every configuration option available in the Docs Platform.

## Environment variables

### Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Your site's public URL (no trailing slash) |
| `NEXTAUTH_SECRET` | Random 32-char string for session encryption |
| `NEXTAUTH_URL` | Same as `NEXT_PUBLIC_SITE_URL` |
| `TURSO_DATABASE_URL` | Your Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |

### GitHub — Read Access

Used to fetch content from a GitHub repository instead of the local `content/` folder.

| Variable | Description |
|----------|-------------|
| `GITHUB_REPO_OWNER` | GitHub username or org (e.g. `my-org`) |
| `GITHUB_REPO_NAME` | Repository name (e.g. `docs`) |
| `GITHUB_DOCS_BRANCH` | Branch to read from (default: `main`) |
| `GITHUB_DOCS_PATH` | Path inside repo (default: `docs/`) |

### GitHub App — Write Access

Required for the editor's save-as-commit feature. Create a GitHub App at `github.com/settings/apps/new`.

| Variable | Description |
|----------|-------------|
| `GITHUB_APP_ID` | Your GitHub App's ID |
| `GITHUB_PRIVATE_KEY` | PEM private key (paste full key with newlines) |
| `GITHUB_INSTALLATION_ID` | Installation ID from your App's settings |
| `GITHUB_WEBHOOK_SECRET` | Secret for verifying webhook payloads |

### GitHub OAuth — User Login

Create a separate OAuth App at `github.com/settings/developers`.

```env
GITHUB_CLIENT_ID=Ov23liXXXXXXXXXX
GITHUB_CLIENT_SECRET=abc123...
```

> [!WARNING]
> Never commit `.env.local` to your repository. It's already in `.gitignore`, but double-check with `git status`.

## Navigation configuration

The sidebar navigation is auto-generated from your `content/docs/` directory structure. You can override it by creating `content/nav.json`:

```json
{
  "nav": [
    {
      "title": "Getting Started",
      "items": [
        { "title": "Introduction", "slug": "getting-started", "order": 1 },
        { "title": "Configuration", "slug": "getting-started/configuration", "order": 2 },
        { "title": "Deployment", "slug": "getting-started/deployment", "order": 3 }
      ]
    },
    {
      "title": "Features",
      "items": [
        { "title": "MDX Components", "slug": "features/mdx-components", "order": 1 }
      ]
    }
  ]
}
```

If `nav.json` doesn't exist, the platform auto-discovers all `.md` files and sorts by:
1. Frontmatter `order` field (ascending)
2. Alphabetically by filename

## Frontmatter reference

Every Markdown file can include these frontmatter fields:

```yaml
---
title: Page Title              # Required — shown in sidebar and <h1>
description: Short description # Used for SEO meta and og:description
order: 1                       # Sidebar sort order (lower = higher)
badge: New                     # Shows a badge in sidebar: New | Beta | Deprecated
showToc: true                  # Show right-side table of contents (default: true)
showFeedback: true             # Show thumbs up/down widget (default: true)
seoTitle: Custom SEO Title     # Overrides title for <title> tag
seoDescription: Custom desc    # Overrides description for meta
---
```

## Theming

The design system uses CSS custom properties. Override them in `styles/tokens.css`:

```css
:root {
  /* Change primary color */
  --color-primary: hsl(200 90% 50%);  /* teal instead of orange */
  
  /* Change sidebar width */
  --sidebar-width: 300px;
}
```

## GitHub App setup

1. Go to `github.com/settings/apps/new`
2. Set **Homepage URL** to your site URL
3. Set **Webhook URL** to `https://your-site.com/api/github/webhook`
4. Under **Permissions**, enable:
   - **Contents**: Read & Write
   - **Metadata**: Read-only
5. Generate and download a **private key**
6. Install the App on your repository
7. Copy the **Installation ID** from the App's install page URL

> [!NOTE]
> The Installation ID is in the URL when you view your App's installation: `github.com/settings/installations/12345678`
