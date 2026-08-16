import { NextRequest, NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/search";
import type { Locale } from "@/lib/i18n";

export async function GET(req: NextRequest) {
  try {
    const localeParam = req.nextUrl.searchParams.get("locale") as Locale | null;
    const locale: Locale = localeParam === "ro" ? "ro" : "en";
    const index = getSearchIndex(locale);

    return NextResponse.json({ results: index }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate search index" }, { status: 500 });
  }
}
