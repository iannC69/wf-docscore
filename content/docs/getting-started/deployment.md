---
title: Deployment
description: Deploy your docs platform to Vercel, configure custom domains, and set up CI/CD.
order: 3
---

# Deployment

The Docs Platform is optimized for deployment on **Vercel** with static generation and ISR. All public pages are pre-rendered at build time for maximum performance.

## Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from your project directory
vercel deploy --prod
```

### Step-by-step

1. Push your project to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import your repo
3. Vercel auto-detects Next.js — no build config needed
4. Add all your environment variables in the **Environment Variables** section
5. Click **Deploy**

> [!IMPORTANT]
> Make sure to add ALL environment variables from your `.env.local` to Vercel. Missing variables will cause build failures.

## Environment variables on Vercel

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

| Variable | Environment |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Production, Preview |
| `NEXTAUTH_SECRET` | Production, Preview, Development |
| `NEXTAUTH_URL` | Production (set to your domain) |
| `TURSO_DATABASE_URL` | Production, Preview |
| `TURSO_AUTH_TOKEN` | Production, Preview |
| `GITHUB_CLIENT_ID` | Production, Preview |
| `GITHUB_CLIENT_SECRET` | Production, Preview |

## Custom domain

1. Go to your Vercel project → **Settings → Domains**
2. Add your domain (e.g. `docs.yoursite.com`)
3. Add the CNAME record to your DNS provider:
   ```
   CNAME  docs  cname.vercel-dns.com
   ```
4. Update `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` to your domain

## Build output

The platform generates:

```
/docs                  → Static HTML
/docs/getting-started  → Static HTML  
/docs/[...slug]        → SSG (one file per doc page)
```

All pages are **static HTML** — no server-side rendering on each request. Updates to content trigger an ISR revalidation.

## ISR — Incremental Static Regeneration

When a GitHub webhook fires (content update), the platform revalidates only the affected pages:

```typescript
// app/api/github/webhook/route.ts
await revalidatePath(`/docs/${updatedSlug}`);
```

Configure the revalidation period in `lib/content.ts`:

```typescript
// Default: revalidate every 60 seconds
export const revalidate = 60;
```

## CI/CD pipeline

A typical CI setup with GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx drizzle-kit push  # Run DB migrations
        env:
          TURSO_DATABASE_URL: ${{ secrets.TURSO_DATABASE_URL }}
          TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN }}
```

## Performance checklist

Before going to production:

- [ ] Set up Upstash Redis for caching (`UPSTASH_REDIS_REST_URL`)
- [ ] Configure Cloudflare R2 for image uploads
- [ ] Set `GITHUB_WEBHOOK_SECRET` and register the webhook on your repo
- [ ] Enable Vercel Analytics
- [ ] Test all OAuth flows in production
- [ ] Set up error monitoring (Sentry recommended)
