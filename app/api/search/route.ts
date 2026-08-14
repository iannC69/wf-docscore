import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/search";

export async function GET() {
  try {
    const index = getSearchIndex();
    return NextResponse.json({ results: index }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate search index" }, { status: 500 });
  }
}
