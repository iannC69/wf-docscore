import React from "react";
import { getAuthenticatedAdminSession, isPanicLockdown } from "@/lib/security/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LiquidBackground } from "@/components/ui/LiquidEffects";

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

  return (
    <div className="admin-root-container">
      {/* Liquid organic waves & fire background */}
      <LiquidBackground />

      {session && (
        <AdminHeader
          username={session.username}
          role={session.role}
          isPanicLocked={isLocked}
        />
      )}

      <div className="admin-body-container">
        {session && <AdminSidebar />}
        <main className={`admin-main-content ${!session ? "admin-main-content--auth" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
