---
title: GitHub Integration
description: How the platform connects to GitHub for content reading, commit-based saving, and webhook-driven cache invalidation.
order: 3
---

# GitHub Integration

The platform uses GitHub as its content backend. Your Markdown files live in a GitHub repo, and the platform reads, displays, and optionally writes back to them.

## How it works

```
Reader visits /docs/getting-started
        ↓
Next.js checks ISR cache
        ↓ (cache miss or expired)
GitHub API → GET /repos/{owner}/{repo}/contents/docs/getting-started.md
        ↓
Decode base64 content → Parse frontmatter → Compile MDX
        ↓
Store in Upstash Redis (TTL: 5 min)
        ↓
Serve to reader
```

## Authentication modes

### Personal Access Token (read-only)

Simplest setup. Good for public repositories:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> [!NOTE]
> A PAT with `contents:read` permission is sufficient for reading public repos. You don't even need a token for public repos — GitHub's unauthenticated API allows 60 requests/hour.

### GitHub App (read + write)

Required for the editor's save feature. The App authenticates as your installation and gets scoped permissions:

```typescript
// lib/github/client.ts
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

export const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!,
    installationId: process.env.GITHUB_INSTALLATION_ID!,
  },
});
```

## Reading content

Content is fetched via the GitHub Contents API:

```typescript
const { data } = await octokit.repos.getContent({
  owner: process.env.GITHUB_REPO_OWNER!,
  repo: process.env.GITHUB_REPO_NAME!,
  path: `${process.env.GITHUB_DOCS_PATH}${slug}.md`,
  ref: process.env.GITHUB_DOCS_BRANCH ?? "main",
});

const content = Buffer.from(data.content, "base64").toString("utf-8");
```

## Writing content (commit-based save)

When a user saves in the editor, the platform:

1. Gets the current file's SHA from GitHub
2. Encodes the new content as base64
3. Creates a commit via the GitHub API

```typescript
// Create or update a file
await octokit.repos.createOrUpdateFileContents({
  owner,
  repo,
  path: filePath,
  message: `docs: update ${slug}`,
  content: Buffer.from(newContent).toString("base64"),
  sha: currentFileSha,  // Required for updates
  branch: "main",
  committer: {
    name: session.user.name,
    email: session.user.email,
  },
});
```

## Webhook-driven cache invalidation

Register a webhook on your GitHub repo to automatically purge the cache when content changes:

**Webhook URL**: `https://your-docs-site.com/api/github/webhook`  
**Content type**: `application/json`  
**Events**: `push`

When a push event arrives, the platform:

1. Verifies the signature using `GITHUB_WEBHOOK_SECRET`
2. Extracts changed file paths from the commit
3. Maps paths to slugs and calls `revalidatePath()`

```typescript
// app/api/github/webhook/route.ts
export async function POST(req: Request) {
  const signature = req.headers.get("x-hub-signature-256");
  const payload = await req.text();
  
  if (!verifySignature(payload, signature)) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const event = JSON.parse(payload);
  const changedFiles = event.commits.flatMap(c => [...c.added, ...c.modified]);
  
  for (const file of changedFiles) {
    if (file.startsWith("docs/") && file.endsWith(".md")) {
      const slug = file.replace("docs/", "").replace(".md", "");
      await revalidatePath(`/docs/${slug}`);
    }
  }
  
  return new Response("OK");
}
```

## Rate limits

| Auth method | Requests/hour |
|-------------|---------------|
| Unauthenticated | 60 |
| Personal Access Token | 5,000 |
| GitHub App | 5,000 per installation |

> [!TIP]
> With Upstash Redis caching, most requests never hit the GitHub API. In practice, you'll rarely come close to rate limits even on large docs sites.
