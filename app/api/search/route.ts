import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/search";

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
