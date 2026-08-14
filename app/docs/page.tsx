import { getDocPage } from "@/lib/content";
import { redirect } from "next/navigation";
import { Card, Cards } from "@/components/docs/Card";

export default async function DocsHomePage() {
  const page = await getDocPage([]);

  if (!page) {
    redirect("/docs/getting-started");
  }

  return (
    <main className="docs-home" id="main-content">
      <div className="docs-home-hero">
        <p className="docs-home-eyebrow">Documentation</p>
        <h1 className="docs-home-title">
          {page.frontmatter.title ?? "Welcome to Docs"}
        </h1>
        {page.frontmatter.description && (
          <p className="docs-home-desc">{page.frontmatter.description}</p>
        )}
      </div>

      <p className="docs-home-section-title">Quick start</p>
      <Cards>
        <Card
          title="Getting Started"
          href="/docs/getting-started"
          description="Install and configure the platform in minutes."
          icon="🚀"
        />
        <Card
          title="Configuration"
          href="/docs/getting-started/configuration"
          description="Connect GitHub, configure themes, and set up your admin panel."
          icon="⚙️"
        />
        <Card
          title="API Reference"
          href="/docs/api-reference"
          description="Full reference for content fetching, GitHub, and webhooks."
          icon="📡"
        />
      </Cards>
    </main>
  );
}
