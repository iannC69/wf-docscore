import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { getSearchAnalytics } from "@/lib/security/searchAnalytics";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const analytics = getSearchAnalytics();
  return NextResponse.json(analytics);
}
