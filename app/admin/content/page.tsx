import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import { AdminContentStudioClient } from "@/components/admin/AdminContentStudioClient";

export const metadata = {
  title: "Content Studio CMS | Wildfire Admin",
  description: "Live Markdown editor and document management for Wildfire CS2 documentation.",
};

export default async function AdminContentPage() {
  const session = await getAuthenticatedAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminContentStudioClient />;
}
