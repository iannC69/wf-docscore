import { NextRequest, NextResponse } from "next/server";
import { submitDocFeedback, getDocFeedbackStats, getAllFeedbacks, localCreateNotification } from "@/lib/db";

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

    // Emit live notification in Admin Notification Hub
    try {
      if (comment) {
        localCreateNotification({
          isGlobal: true,
          title: `Sugestie / Comentariu Feedback pe /docs/${slug}`,
          message: `Un jucător a lăsat o sugestie: "${comment.slice(0, 140)}${comment.length > 140 ? "..." : ""}" (Vot: ${rating === "helpful" ? "Util" : "Neutru/Incomplet"})`,
          category: "feedback",
          severity: rating === "unhelpful" ? "warning" : "info",
          link: `/docs/${slug}`,
          metadata: { slug, rating, comment, stats },
        });
      } else if (rating === "unhelpful") {
        localCreateNotification({
          isGlobal: true,
          title: `Feedback Negativ pe /docs/${slug}`,
          message: `Un jucător a marcat ghidul ca nefiind util. Scorul actual de satisfacție este ${stats.percentage}% (${stats.helpful} Da / ${stats.unhelpful} Nu).`,
          category: "feedback",
          severity: "warning",
          link: `/docs/${slug}`,
          metadata: { slug, rating, stats },
        });
      } else if (rating === "helpful") {
        localCreateNotification({
          isGlobal: true,
          title: `Feedback Pozitiv pe /docs/${slug}`,
          message: `Un jucător a marcat ghidul ca util! Scorul curent de satisfacție este ${stats.percentage}% (${stats.helpful} voturi pozitive).`,
          category: "feedback",
          severity: "success",
          link: `/docs/${slug}`,
          metadata: { slug, rating, stats },
        });
      }
    } catch (notifErr) {
      console.error("[Feedback Notification] Failed to create notification:", notifErr);
    }

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
