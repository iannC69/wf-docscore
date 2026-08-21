import React from "react";
import { getAuthenticatedAdminSession, isPanicLockdown } from "@/lib/security/auth";
import { findTeamMemberByUsername } from "@/lib/security/teamStore";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LiquidBackground } from "@/components/ui/LiquidEffects";

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
  const isLocked = isPanicLockdown();
  const member = session ? findTeamMemberByUsername(session.username) : null;

  return (
    <div className="admin-root-container">
      {/* Liquid organic waves & fire background */}
      <LiquidBackground />

      {session && (
        <AdminHeader
          username={session.username}
          displayName={session.displayName || member?.displayName}
          avatarUrl={member?.avatarUrl}
          role={session.role}
          isRoot={session.isRoot}
        />
      )}



      <div className="admin-body-container">
        {session && (
          <AdminSidebar
            permissions={session.permissions}
            isRoot={session.isRoot}
          />
        )}
        <main className={`admin-main-content ${!session ? "admin-main-content--auth" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
