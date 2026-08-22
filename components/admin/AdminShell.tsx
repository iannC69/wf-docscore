"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { AdminAccessDenied } from "./AdminAccessDenied";
import { LiquidBackground } from "@/components/ui/LiquidEffects";
import { checkRoutePermission } from "@/lib/security/permissionsGuard";
import type { TeamMemberPermissions } from "@/lib/security/teamStore";

interface AdminShellProps {
  session: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
    role: string;
    isRoot: boolean;
    permissions: TeamMemberPermissions;
  } | null;
  children: React.ReactNode;
}

export function AdminShell({ session, children }: AdminShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login" || pathname?.startsWith("/admin/login");
  const authCheck = checkRoutePermission(pathname, session);

  return (
    <div
      className={`admin-root-container ${isLoginPage ? "admin-root-container--auth" : ""}`}
      style={isLoginPage ? { paddingTop: 0, minHeight: "100vh", background: "hsl(220 22% 4%)" } : undefined}
    >
      {/* Liquid organic waves & fire background */}
      <LiquidBackground />

      {session && !isLoginPage && (
        <AdminHeader
          username={session.username}
          displayName={session.displayName}
          avatarUrl={session.avatarUrl}
          role={session.role}
          isRoot={session.isRoot}
        />
      )}

      <div
        className={`admin-body-container ${isLoginPage ? "admin-body-container--auth" : ""}`}
        style={isLoginPage ? { minHeight: "100vh", width: "100%" } : undefined}
      >
        {session && !isLoginPage && (
          <AdminSidebar
            permissions={session.permissions}
            isRoot={session.isRoot}
          />
        )}
        <main
          className={`admin-main-content ${!session || isLoginPage ? "admin-main-content--auth" : ""}`}
          style={
            isLoginPage
              ? {
                  minHeight: "100vh",
                  padding: 0,
                  margin: 0,
                  width: "100%",
                  maxWidth: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }
              : undefined
          }
        >
          {session && !isLoginPage && !authCheck.allowed ? (
            <AdminAccessDenied
              username={session.username}
              displayName={session.displayName}
              role={session.role}
              pathname={pathname}
              requiredSpec={authCheck.requiredSpec}
              canEditDocs={session.permissions?.canEditDocs}
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
