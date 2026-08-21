import fs from "fs";
import path from "path";
import type { DocViewRecord, DocFeedbackRecord, FeedbackStats, DatabaseConfig } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const ANALYTICS_FILE = path.join(DATA_DIR, "doc_analytics.json");
const DB_CONFIG_FILE = path.join(DATA_DIR, "db_config.json");

interface LocalAnalyticsStore {
  views: Record<string, DocViewRecord>;
  feedbacks: DocFeedbackRecord[];
  updatedAt: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAnalyticsStore(): LocalAnalyticsStore {
  ensureDataDir();
  if (fs.existsSync(ANALYTICS_FILE)) {
    try {
      const raw = fs.readFileSync(ANALYTICS_FILE, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      console.error("[LocalDB] Error reading analytics file, initializing new store", err);
    }
  }

  const initial: LocalAnalyticsStore = {
    views: {},
    feedbacks: [],
    updatedAt: new Date().toISOString(),
  };
  saveAnalyticsStore(initial);
  return initial;
}

function saveAnalyticsStore(store: LocalAnalyticsStore) {
  ensureDataDir();
  try {
    store.updatedAt = new Date().toISOString();
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[LocalDB] Error saving analytics file", err);
  }
}

// ─── Views Operations ─────────────────────────────────────────────────────────

export function localIncrementDocView(slug: string): DocViewRecord {
  const store = readAnalyticsStore();
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  const now = new Date().toISOString();

  let record = store.views[normalizedSlug];
  if (!record) {
    record = {
      slug: normalizedSlug,
      total_views: 1,
      today_views: 1,
      last_viewed_at: now,
    };
  } else {
    record.total_views += 1;
    record.today_views += 1;
    record.last_viewed_at = now;
  }

  store.views[normalizedSlug] = record;
  saveAnalyticsStore(store);
  return record;
}

export function localGetDocViews(slug: string): DocViewRecord {
  const store = readAnalyticsStore();
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  return (
    store.views[normalizedSlug] || {
      slug: normalizedSlug,
      total_views: 0,
      today_views: 0,
      last_viewed_at: new Date().toISOString(),
    }
  );
}

export function localGetAllDocViews(): DocViewRecord[] {
  const store = readAnalyticsStore();
  return Object.values(store.views).sort((a, b) => b.total_views - a.total_views);
}

// ─── Feedback Operations ──────────────────────────────────────────────────────

export function localSubmitDocFeedback(
  slug: string,
  rating: "helpful" | "unhelpful",
  comment?: string,
  ipHash?: string,
  feedbackId?: string
): DocFeedbackRecord {
  const store = readAnalyticsStore();
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");

  // If existing feedbackId provided, update it in place
  if (feedbackId) {
    const existing = store.feedbacks.find((f) => f.id === feedbackId);
    if (existing) {
      existing.rating = rating;
      if (comment !== undefined) existing.comment = comment.trim();
      saveAnalyticsStore(store);
      return existing;
    }
  }

  const record: DocFeedbackRecord = {
    id: feedbackId || `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    slug: normalizedSlug,
    rating,
    comment: comment ? comment.trim() : undefined,
    created_at: new Date().toISOString(),
    ip_hash: ipHash,
  };

  store.feedbacks.unshift(record);
  saveAnalyticsStore(store);
  return record;
}

export function localGetDocFeedbackStats(slug: string): FeedbackStats {
  const store = readAnalyticsStore();
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  const docFeedbacks = store.feedbacks.filter((f) => f.slug === normalizedSlug);

  const helpful = docFeedbacks.filter((f) => f.rating === "helpful").length;
  const unhelpful = docFeedbacks.filter((f) => f.rating === "unhelpful").length;
  const total = helpful + unhelpful;
  const percentage = total > 0 ? Math.round((helpful / total) * 100) : 100;

  return { helpful, unhelpful, total, percentage };
}

export function localGetAllFeedbacks(): DocFeedbackRecord[] {
  const store = readAnalyticsStore();
  return store.feedbacks;
}

export function localDeleteFeedback(id: string): boolean {
  const store = readAnalyticsStore();
  const initialCount = store.feedbacks.length;
  store.feedbacks = store.feedbacks.filter((f) => f.id !== id);
  const deleted = store.feedbacks.length < initialCount;
  if (deleted) {
    saveAnalyticsStore(store);
  }
  return deleted;
}

// ─── Database Config Operations ───────────────────────────────────────────────

export function getLocalDatabaseConfig(): DatabaseConfig {
  ensureDataDir();
  if (fs.existsSync(DB_CONFIG_FILE)) {
    try {
      const raw = fs.readFileSync(DB_CONFIG_FILE, "utf-8");
      return JSON.parse(raw);
    } catch {}
  }
  return {
    provider: (process.env.SUPABASE_URL ? "supabase" : "local") as "local" | "supabase",
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  };
}

export function saveLocalDatabaseConfig(config: DatabaseConfig): void {
  ensureDataDir();
  try {
    fs.writeFileSync(DB_CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("[LocalDB] Error saving db config", err);
  }
}
