import { NextRequest, NextResponse } from "next/server";
import { incrementDocView, getDocViews, getAllDocViews } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const record = await incrementDocView(slug, ip);

    return NextResponse.json({ success: true, views: record.total_views, record });
  } catch (err: any) {
    console.error("[API Analytics View] Error:", err);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      const record = await getDocViews(slug);
      return NextResponse.json({ success: true, views: record.total_views, record });
    }

    const allViews = await getAllDocViews();
    return NextResponse.json({ success: true, total: allViews.length, views: allViews });
  } catch (err: any) {
    console.error("[API Analytics View GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch views" }, { status: 500 });
  }
}
