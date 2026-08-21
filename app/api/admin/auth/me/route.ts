import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { findTeamMemberByUsername } from "@/lib/security/teamStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? validateSessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const member = findTeamMemberByUsername(session.username);
    const avatarUrl =
      member?.avatarUrl ||
      (member?.githubUsername ? `https://github.com/${member.githubUsername}.png` : null) ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${session.username}`;

    return NextResponse.json({
      authenticated: true,
      user: {
        username: session.username,
        displayName: session.displayName || member?.displayName || session.username,
        role: session.role,
        isRoot: Boolean(session.isRoot || member?.isRoot),
        avatarUrl,
        customTitle: member?.customTitle || (session.isRoot ? "Root Super Admin" : "Staff Member"),
      },
    });
  } catch (err) {
    console.error("[API Auth Me] Error:", err);
    return NextResponse.json({ authenticated: false });
  }
}
