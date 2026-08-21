import { NextRequest, NextResponse } from "next/server";
import { recordAiFeedback } from "@/lib/security/aiTelemetry";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interactionId, querySnippet, feedback, reason } = body || {};

    if (feedback !== "helpful" && feedback !== "unhelpful") {
      return NextResponse.json(
        {
          success: false,
          error: "Tipul de feedback este invalid. Sunt acceptate doar 'helpful' sau 'unhelpful'.",
        },
        { status: 400 }
      );
    }

    const result = recordAiFeedback({
      interactionId: typeof interactionId === "string" ? interactionId : undefined,
      querySnippet: typeof querySnippet === "string" ? querySnippet : undefined,
      feedback,
      reason: typeof reason === "string" ? reason : undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[AI Feedback] Error processing feedback:", error);
    return NextResponse.json(
      {
        success: false,
        error: "A apărut o problemă internă la înregistrarea evaluării.",
      },
      { status: 500 }
    );
  }
}
