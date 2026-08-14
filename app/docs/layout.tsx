import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LiquidBackground } from "@/components/ui/LiquidEffects";
import { getNavigation } from "@/lib/navigation";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = await getNavigation();

  return (
    <div className="docs-layout">
      {/* Liquid fire background — stays behind everything */}
      <LiquidBackground />

      <Header />
      <Sidebar nav={nav} />
      <div className="docs-main">
        {children}
      </div>
    </div>
  );
}
