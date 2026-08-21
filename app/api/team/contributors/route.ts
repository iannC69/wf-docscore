import { NextResponse } from "next/server";
import { getAllTeamRepoStats } from "@/lib/repoContributions";
import { getPublicTeamMembers } from "@/lib/security/teamStore";

export const dynamic = "force-dynamic";

const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || "iannC69";
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || "wf-docscore";

export async function GET() {
  try {
    const { statsMap, githubGraphContributors, unlinkedGithubContributors } = await getAllTeamRepoStats();
    const members = getPublicTeamMembers();

    const contributors = members.map((m) => {
      const stats = statsMap[m.username.toLowerCase()];
      return {
        ...m,
        stats: stats || {
          totalCommits: 0,
          docsCommits: 0,
          monthlyActivity: [],
          recentFiles: [],
          recentCommits: [],
          isMatchedWithGithub: false,
          matchType: "unlinked",
        },
      };
    });

    const totalRepoCommits = Object.values(statsMap).reduce((acc, s) => acc + s.totalCommits, 0);

    return NextResponse.json(
      {
        totalRepoCommits,
        contributors,
        githubGraphContributors,
        unlinkedGithubContributors,
        githubGraphUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/graphs/contributors`,
        syncedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    console.error("[API Contributors] Error:", err);
    return NextResponse.json({ error: "Failed to load contributors" }, { status: 500 });
  }
}
