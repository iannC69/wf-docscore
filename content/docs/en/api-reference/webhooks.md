---
title: Webhooks & Events
description: Real-time event notifications for content updates, deployments, and cache invalidation.
order: 2
---

# Webhooks & Events

The Docs Platform supports incoming and outgoing webhooks to synchronize content changes with external services, CI/CD runners, and notification systems.

## Incoming GitHub Webhook

When changes are pushed to your documentation repository, GitHub triggers the webhook endpoint:

```
POST /api/github/webhook
```

### Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `X-Hub-Signature-256` | HMAC SHA-256 signature calculated with your webhook secret |
| `X-GitHub-Event` | The event type (`push`, `ping`) |

### Verification Logic

The platform validates incoming requests against `GITHUB_WEBHOOK_SECRET`:

```typescript
import crypto from "crypto";

export function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature || !process.env.GITHUB_WEBHOOK_SECRET) return false;
  
  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET);
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;
  
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
```

## Outgoing Revalidation Events

When content is modified from the built-in admin editor, an internal event triggers cache invalidation for specific paths:

```typescript
import { revalidatePath } from "next/cache";

export async function onDocumentPublished(slug: string) {
  // Revalidate the specific doc page
  revalidatePath(`/docs/${slug}`);
  // Revalidate navigation tree
  revalidatePath("/docs", "layout");
}
```
