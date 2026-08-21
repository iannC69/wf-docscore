import { NextResponse } from "next/server";
import { resetAllRateLimits } from "@/lib/security/rateLimit";

export async function GET() {
  resetAllRateLimits();
  return NextResponse.json({
    success: true,
    message: "Toate cooldown-urile și blocările IP au fost resetate cu succes.",
  });
}

export async function POST() {
  resetAllRateLimits();
  return NextResponse.json({
    success: true,
    message: "Toate cooldown-urile și blocările IP au fost resetate cu succes.",
  });
}
