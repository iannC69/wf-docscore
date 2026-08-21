import { NextRequest, NextResponse } from "next/server";
import { submitDocFeedback, getDocFeedbackStats, getAllFeedbacks } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, rating, comment, feedbackId } = body;

    if (!slug || !rating || !["helpful", "unhelpful"].includes(rating)) {
      return NextResponse.json(
        { error: "Slug and valid rating ('helpful' | 'unhelpful') are required." },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const ipHash = Buffer.from(ip).toString("base64").substring(0, 10);

    const feedback = await submitDocFeedback(slug, rating, comment, ipHash, feedbackId);
    const stats = await getDocFeedbackStats(slug);

    return NextResponse.json({ success: true, feedback, stats });
  } catch (err: any) {
    console.error("[API Docs Feedback POST] Error:", err);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      const stats = await getDocFeedbackStats(slug);
      return NextResponse.json({ success: true, stats });
    }

    const feedbacks = await getAllFeedbacks();
    return NextResponse.json({ success: true, total: feedbacks.length, feedbacks });
  } catch (err: any) {
    console.error("[API Docs Feedback GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
