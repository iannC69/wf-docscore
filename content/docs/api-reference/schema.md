---
title: Database Schema
description: Drizzle ORM schemas and Turso LibSQL table specifications.
order: 3
---

# Database Schema

The platform utilizes Drizzle ORM connected to a Turso (LibSQL) distributed database for user permissions, session management, and analytics.

## Schema Definitions

### Users Table

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["owner", "admin", "editor", "viewer"] }).default("viewer"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

### Documents Metadata Table

```typescript
export const docMetadata = sqliteTable("doc_metadata", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  viewsCount: integer("views_count").default(0),
  helpfulYes: integer("helpful_yes").default(0),
  helpfulNo: integer("helpful_no").default(0),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
});
```

## Running Migrations

Apply schema updates to your database with Drizzle Kit:

```bash
# Generate SQL migration files
npx drizzle-kit generate

# Push changes directly to Turso database
npx drizzle-kit push
```
