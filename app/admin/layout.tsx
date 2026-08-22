import React from "react";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import { findTeamMemberByUsername } from "@/lib/security/teamStore";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin Mission Control | Wildfire Docs",
  description: "Secure administrative management center for Wildfire Docs platform.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthenticatedAdminSession();
  const member = session ? findTeamMemberByUsername(session.username) : null;

  const shellSession = session
    ? {
        username: session.username,
        displayName: session.displayName || member?.displayName,
        avatarUrl: member?.avatarUrl,
        role: session.role,
        isRoot: session.isRoot,
        permissions: session.permissions,
      }
    : null;

  return (
    <AdminShell session={shellSession}>
      {children}
    </AdminShell>
  );
}
