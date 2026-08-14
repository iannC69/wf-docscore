import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LiquidBackground } from "@/components/ui/LiquidEffects";
import { LayoutProvider } from "@/context/LayoutContext";
import { getNavigation } from "@/lib/navigation";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = await getNavigation();

  return (
    <LayoutProvider>
      <div className="docs-layout">
        {/* Liquid fire background */}
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
