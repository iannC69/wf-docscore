import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LiquidBackground } from "@/components/ui/LiquidEffects";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { LayoutProvider } from "@/context/LayoutContext";
import { getNavigation } from "@/lib/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog & Release Notes",
  description:
    "All the latest updates, features, improvements, and bug fixes shipped to Wildfire Docs.",
};

export default async function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = await getNavigation();

  return (
    <LayoutProvider>
      <div className="docs-layout">
        <ScrollToTop />
        <LiquidBackground />
        <Header />
        <Sidebar nav={nav} />
        <div className="docs-main" id="docs-main-container">
          {children}
        </div>
      </div>
    </LayoutProvider>
  );
}
