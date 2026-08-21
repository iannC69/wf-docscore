import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LiquidBackground } from "@/components/ui/LiquidEffects";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { LayoutProvider } from "@/context/LayoutContext";
import { getNavigation } from "@/lib/navigation";
import { getPlatformSettings } from "@/lib/security/settingsStore";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import { AnnouncementBanner } from "@/components/ui/AnnouncementBanner";
import { LightboxProvider } from "@/components/docs/MediaLightbox";
import { TextSelectionAskAi } from "@/components/docs/TextSelectionAskAi";
import { DocsTransitionWrapper } from "@/components/docs/DocsTransitionWrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getPlatformSettings();
  const session = await getAuthenticatedAdminSession();

  // If maintenance is enabled and visitor is not authenticated admin, redirect to dedicated /maintenance page
  if (settings.maintenance.enabled && !session) {
    redirect("/maintenance");
  }

  const nav = await getNavigation();

  return (
    <LayoutProvider>
      <LightboxProvider>
        <div className="docs-layout">
          {/* Instant scroll to top on page navigation */}
          <ScrollToTop />

          {/* Liquid fire background */}
          <LiquidBackground />

          {/* Contextual Ask AI on text selection */}
          <TextSelectionAskAi />

          <Header />
          <Sidebar nav={nav} />
          <div className="docs-main" id="docs-main-container">
            <DocsTransitionWrapper>{children}</DocsTransitionWrapper>
          </div>
        </div>
      </LightboxProvider>
    </LayoutProvider>
  );
}
