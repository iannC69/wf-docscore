import { NextRequest, NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/search";
import { recordSearchQuery } from "@/lib/security/searchAnalytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const index = getSearchIndex();
    return NextResponse.json(
      { results: index, count: index.length, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Search index error:", error);
    return NextResponse.json({ error: "Failed to generate search index" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, resultCount, latencyMs } = await req.json();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    if (query && typeof query === "string") {
      recordSearchQuery({
        query,
        resultCount: Number(resultCount) || 0,
        latencyMs: Number(latencyMs) || 1.5,
        ip,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to log search telemetry" }, { status: 500 });
  }
}
