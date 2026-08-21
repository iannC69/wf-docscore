import React from "react";
import { getPublicTeamMembers } from "@/lib/security/teamStore";
import { TeamView } from "@/components/team/TeamView";

export const metadata = {
  title: "Our Team & Contributors — Wildfire Docs",
  description:
    "Cunoaște echipa și contribuitorii oficiali din spatele documentației și sistemelor WildFire.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DocsTeamPage() {
  const members = getPublicTeamMembers();

  return <TeamView initialMembers={members} />;
}
