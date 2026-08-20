import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FALLBACK_SUGGESTIONS = [
  "Cum aplic în staff și ce cerințe sunt?",
  "Care sunt beneficiile la gradele VIP?",
  "Cum pot obține Phoenix Coins?",
  "Cum funcționează comenzile !ws și !knife?",
  "Care sunt sancțiunile pentru cheat?",
];

export async function GET() {
  try {
    const telemetryPath = path.join(process.cwd(), "content", "ai-telemetry.json");
    if (!fs.existsSync(telemetryPath)) {
      return NextResponse.json({ suggestions: FALLBACK_SUGGESTIONS });
    }

    const data = JSON.parse(fs.readFileSync(telemetryPath, "utf-8"));
    const logs: Array<{ querySnippet?: string; status?: string }> = data.logs || [];

    const uniqueQueries: string[] = [];
    const seen = new Set<string>();

    for (const log of logs) {
      const q = log.querySnippet?.trim();
      if (!q || log.status !== "success") continue;
      if (q.length < 12 || q.length > 90) continue;
      const lower = q.toLowerCase().trim();
      const BLACKLIST_TERMS = [
        "salut", "hello", "bonjour", "ciao", "buna", "hey", "hi",
        "test", "secret", "parol", "cod backend", "ignora", "jailbreak",
        "prompt", "bypass", "system prompt", "instructiun", "developer mode",
        "dan", "token", "leak", "cheia", "gemini", "env", "credential", "admin pass",
        "can you help me", "ma poti ajuta"
      ];
      if (BLACKLIST_TERMS.some((term) => lower.includes(term))) {
        continue;
      }

      const normalized = lower.replace(/[?.!]/g, "").trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueQueries.push(q);
      }
      if (uniqueQueries.length >= 5) break;
    }

    const finalSuggestions = uniqueQueries.length >= 3 ? uniqueQueries : FALLBACK_SUGGESTIONS;
    return NextResponse.json({ suggestions: finalSuggestions });
  } catch {
    return NextResponse.json({ suggestions: FALLBACK_SUGGESTIONS });
  }
}
