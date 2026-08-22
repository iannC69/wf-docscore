"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import type { TeamMemberPermissions } from "@/lib/security/teamStore";

interface AdminBodyProps {
  session: {
    permissions: TeamMemberPermissions;
    isRoot: boolean;
  } | null;
  children: React.ReactNode;
}

export function AdminBody({ session, children }: AdminBodyProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login" || pathname?.startsWith("/admin/login");

  return (
    <div className="admin-body-container">
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
                marginLeft: 0,
                padding: 0,
                width: "100%",
                maxWidth: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }
            : undefined
        }
      >
        {children}
      </main>
    </div>
  );
}
