import { NextRequest, NextResponse } from "next/server";
import { getPublicTeamMembers } from "@/lib/security/teamStore";
import { getMemberRepoStats, getGithubGraphContributors, getLocalRepoCommits } from "@/lib/repoContributions";
import { calculateMemberAchievements } from "@/lib/badgesEngine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const usernameParam = searchParams.get("username") || "";

  if (!usernameParam) {
    return NextResponse.json({ error: "Missing username parameter" }, { status: 400 });
  }

  const members = getPublicTeamMembers();
  const member = members.find(
    (m) => m.username.toLowerCase() === usernameParam.toLowerCase()
  );

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const allCommits = getLocalRepoCommits();
  const graphContributors = await getGithubGraphContributors();
  const gitStats = getMemberRepoStats(member, allCommits, graphContributors);
  const achievements = calculateMemberAchievements(member, gitStats, gitStats.githubGraph);

  return NextResponse.json(
    { member, gitStats, achievements },
    { headers: { "Cache-Control": "no-store" } }
  );
}

