import { redirect } from "next/navigation";
import { getPlatformSettings } from "@/lib/security/settingsStore";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = getPlatformSettings();
  const session = await getAuthenticatedAdminSession();

  if (settings.maintenance.enabled && !session) {
    redirect("/maintenance");
  }

  redirect("/docs");
}
