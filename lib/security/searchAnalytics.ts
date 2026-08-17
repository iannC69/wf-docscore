export interface SearchQueryLog {
  id: string;
  query: string;
  resultCount: number;
  latencyMs: number;
  timestamp: string;
  ip: string;
}

// Global in-memory search log
const globalSearchLogs: SearchQueryLog[] = (globalThis as any).__wf_search_logs || [
  {
    id: "srch_1",
    query: "authentication tokens",
    resultCount: 4,
    latencyMs: 3.2,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ip: "127.0.0.1",
  },
  {
    id: "srch_2",
    query: "rate limiting config",
    resultCount: 2,
    latencyMs: 2.8,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ip: "127.0.0.1",
  },
  {
    id: "srch_3",
    query: "turbopack ssg deployment",
    resultCount: 6,
    latencyMs: 4.1,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    ip: "127.0.0.1",
  },
  {
    id: "srch_4",
    query: "webhooks zapier integration",
    resultCount: 0,
    latencyMs: 2.1,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    ip: "127.0.0.1",
  },
  {
    id: "srch_5",
    query: "graphql api reference",
    resultCount: 0,
    latencyMs: 2.4,
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    ip: "127.0.0.1",
  },
];
(globalThis as any).__wf_search_logs = globalSearchLogs;

export function recordSearchQuery(params: {
  query: string;
  resultCount: number;
  latencyMs: number;
  ip?: string;
}): void {
  const log: SearchQueryLog = {
    id: `srch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    query: params.query.trim().toLowerCase(),
    resultCount: params.resultCount,
    latencyMs: Math.round(params.latencyMs * 10) / 10,
    timestamp: new Date().toISOString(),
    ip: params.ip || "127.0.0.1",
  };

  globalSearchLogs.unshift(log);
  if (globalSearchLogs.length > 500) globalSearchLogs.pop();
}

export function getSearchAnalytics() {
  const logs = (globalThis as any).__wf_search_logs as SearchQueryLog[];
  const totalSearches = logs.length;
  const missedSearches = logs.filter((l) => l.resultCount === 0);
  const avgLatency =
    totalSearches > 0
      ? (logs.reduce((acc, l) => acc + l.latencyMs, 0) / totalSearches).toFixed(1)
      : "0.0";

  // Compute top queries
  const queryCounts = new Map<string, { count: number; lastResultCount: number }>();
  for (const log of logs) {
    const existing = queryCounts.get(log.query) || { count: 0, lastResultCount: log.resultCount };
    existing.count += 1;
    existing.lastResultCount = log.resultCount;
    queryCounts.set(log.query, existing);
  }

  const topQueries = Array.from(queryCounts.entries())
    .map(([query, data]) => ({ query, count: data.count, resultCount: data.lastResultCount }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalSearches,
    missedCount: missedSearches.length,
    missedRate: totalSearches > 0 ? Math.round((missedSearches.length / totalSearches) * 100) : 0,
    avgLatencyMs: avgLatency,
    topQueries,
    recentLogs: logs.slice(0, 30),
    missedLogs: missedSearches.slice(0, 20),
  };
}
