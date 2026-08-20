import fs from "fs";
import path from "path";

export interface AiInteractionLog {
  id: string;
  timestamp: string;
  querySnippet: string;
  responseChars: number;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: "success" | "error" | "rate_limited";
  model: string;
  estimatedCostUsd: number;
  ip: string;
  errorMessage?: string;
}

export interface DailyUsageItem {
  date: string; // YYYY-MM-DD
  queries: number;
  totalTokens: number;
  costUsd: number;
}

export interface AiTelemetrySummary {
  lifetimeQueries: number;
  todayQueries: number;
  totalPromptTokens: number;
  totalCandidatesTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  successRate: number;
  model: string;
  docsContextCount: number;
  docsContextChars: number;
  dailyUsage: DailyUsageItem[];
  recentLogs: AiInteractionLog[];
  lastUpdated: string;
}

const TELEMETRY_FILE_PATH = path.join(process.cwd(), "content", "ai-telemetry.json");

// Gemini 3.5 Flash Lite Pricing (per 1M tokens)
const COST_PER_1M_PROMPT = 0.075;
const COST_PER_1M_CANDIDATE = 0.30;

function calculateCostUsd(promptTokens: number, candidatesTokens: number): number {
  const promptCost = (promptTokens / 1_000_000) * COST_PER_1M_PROMPT;
  const candidateCost = (candidatesTokens / 1_000_000) * COST_PER_1M_CANDIDATE;
  return Math.round((promptCost + candidateCost) * 1_000_000) / 1_000_000;
}

interface RawTelemetryStore {
  lifetimeQueries: number;
  totalPromptTokens: number;
  totalCandidatesTokens: number;
  totalCostUsd: number;
  logs: AiInteractionLog[];
}

function loadTelemetryStore(): RawTelemetryStore {
  try {
    if (fs.existsSync(TELEMETRY_FILE_PATH)) {
      const raw = fs.readFileSync(TELEMETRY_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("[AI Telemetry] Failed to read ai-telemetry.json:", err);
  }

  return {
    lifetimeQueries: 0,
    totalPromptTokens: 0,
    totalCandidatesTokens: 0,
    totalCostUsd: 0,
    logs: [],
  };
}

function saveTelemetryStore(store: RawTelemetryStore) {
  try {
    const dir = path.dirname(TELEMETRY_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Keep max 500 logs on disk to maintain speed and low size
    store.logs = store.logs.slice(0, 500);
    fs.writeFileSync(TELEMETRY_FILE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[AI Telemetry] Failed to save ai-telemetry.json:", err);
  }
}

export function recordAiInteraction(params: {
  query: string;
  responseChars?: number;
  promptTokens?: number;
  candidatesTokens?: number;
  latencyMs: number;
  status: "success" | "error" | "rate_limited";
  model?: string;
  ip?: string;
  errorMessage?: string;
}): void {
  const promptTokens = params.promptTokens || 0;
  const candidatesTokens = params.candidatesTokens || 0;
  const totalTokens = promptTokens + candidatesTokens;
  const cost = calculateCostUsd(promptTokens, candidatesTokens);

  const log: AiInteractionLog = {
    id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    querySnippet: params.query.slice(0, 100).replace(/[\r\n]+/g, " "),
    responseChars: params.responseChars || 0,
    promptTokens,
    candidatesTokens,
    totalTokens,
    latencyMs: Math.round(params.latencyMs),
    status: params.status,
    model: params.model || "gemini-3.5-flash-lite",
    estimatedCostUsd: cost,
    ip: params.ip ? params.ip.replace(/:\d+$/, "") : "127.0.0.1",
    errorMessage: params.errorMessage,
  };

  const store = loadTelemetryStore();
  store.lifetimeQueries = (store.lifetimeQueries || 0) + 1;
  store.totalPromptTokens = (store.totalPromptTokens || 0) + promptTokens;
  store.totalCandidatesTokens = (store.totalCandidatesTokens || 0) + candidatesTokens;
  store.totalCostUsd = Math.round(((store.totalCostUsd || 0) + cost) * 1_000_000) / 1_000_000;

  store.logs.unshift(log);
  saveTelemetryStore(store);
}

export function getAiTelemetrySummary(): AiTelemetrySummary {
  const store = loadTelemetryStore();
  const logs = store.logs || [];

  const todayStr = new Date().toISOString().slice(0, 10);
  let todayCount = 0;
  let successCount = 0;
  let totalLatency = 0;

  // 7-day aggregation map
  const dailyMap = new Map<string, { queries: number; totalTokens: number; costUsd: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { queries: 0, totalTokens: 0, costUsd: 0 });
  }

  for (const log of logs) {
    const logDate = log.timestamp ? log.timestamp.slice(0, 10) : "";
    if (logDate === todayStr) {
      todayCount++;
    }
    if (log.status === "success") {
      successCount++;
    }
    totalLatency += log.latencyMs || 0;

    if (dailyMap.has(logDate)) {
      const entry = dailyMap.get(logDate)!;
      entry.queries += 1;
      entry.totalTokens += log.totalTokens || 0;
      entry.costUsd = Math.round((entry.costUsd + (log.estimatedCostUsd || 0)) * 1_000_000) / 1_000_000;
    }
  }

  const avgLatency = logs.length > 0 ? Math.round(totalLatency / logs.length) : 0;
  const successRate = logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 100;

  // Context metadata
  let docsCount = 62;
  let docsChars = 151784;
  try {
    const contextPath = path.join(process.cwd(), "content", "ai-context.json");
    if (fs.existsSync(contextPath)) {
      const parsed = JSON.parse(fs.readFileSync(contextPath, "utf-8"));
      docsCount = parsed.docCount || docsCount;
      docsChars = parsed.totalChars || docsChars;
    }
  } catch {
    // default
  }

  const dailyUsage: DailyUsageItem[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    queries: data.queries,
    totalTokens: data.totalTokens,
    costUsd: data.costUsd,
  }));

  const totalTokens = (store.totalPromptTokens || 0) + (store.totalCandidatesTokens || 0);

  return {
    lifetimeQueries: store.lifetimeQueries || logs.length,
    todayQueries: todayCount,
    totalPromptTokens: store.totalPromptTokens || 0,
    totalCandidatesTokens: store.totalCandidatesTokens || 0,
    totalTokens,
    totalCostUsd: store.totalCostUsd || 0,
    avgLatencyMs: avgLatency,
    successRate,
    model: "gemini-3.5-flash-lite",
    docsContextCount: docsCount,
    docsContextChars: docsChars,
    dailyUsage,
    recentLogs: logs.slice(0, 100),
    lastUpdated: new Date().toISOString(),
  };
}

export function clearAiTelemetry(): void {
  const empty: RawTelemetryStore = {
    lifetimeQueries: 0,
    totalPromptTokens: 0,
    totalCandidatesTokens: 0,
    totalCostUsd: 0,
    logs: [],
  };
  saveTelemetryStore(empty);
}
