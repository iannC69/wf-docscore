import { getRawPage, getAdjacentPages, getNavigation } from "@/lib/navigation";
import { compileMdxContent } from "@/lib/mdx";
import type { DocPage, Breadcrumb, NavItem } from "@/types/docs";

// ─── Build breadcrumbs from slug ───────────────────────────────────────────────

async function buildBreadcrumbs(slug: string[]): Promise<Breadcrumb[]> {
  const nav = await getNavigation();
  const breadcrumbs: Breadcrumb[] = [{ title: "Docs", href: "/docs" }];

  // Walk the slug to build breadcrumb trail
  const flat: NavItem[] = [];
  function flatten(items: NavItem[]) {
    for (const item of items) {
      flat.push(item);
      if (item.children) flatten(item.children);
    }
  }
  nav.forEach(g => flatten(g.items));

  for (let i = 0; i < slug.length - 1; i++) {
    const partialSlug = slug.slice(0, i + 1).join("/");
    const match = flat.find(item => item.slug === partialSlug);
    if (match) {
      breadcrumbs.push({ title: match.title, href: match.href });
    }
  }

  return breadcrumbs;
}

// ─── Main content fetcher ──────────────────────────────────────────────────────

/**
 * Get a fully compiled doc page with MDX, TOC, adjacent pages, and breadcrumbs.
 * This is the single source of truth for page data.
 */
export async function getDocPage(slug: string[]): Promise<DocPage | null> {
  const raw = await getRawPage(slug);
  if (!raw) return null;

  const { content: compiledContent, frontmatter, readingTime, wordCount, toc } =
    await compileMdxContent(raw.content);

  const slugStr = slug.join("/") || "index";
  const { prev, next } = await getAdjacentPages(slugStr);
  const breadcrumbs = await buildBreadcrumbs(slug);

  // GitHub edit URL (populated in production)
  const githubRepo = process.env.GITHUB_REPO_OWNER && process.env.GITHUB_REPO_NAME
    ? `${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`
    : null;
  const githubBranch = process.env.GITHUB_DOCS_BRANCH || "main";
  const docsPath = process.env.GITHUB_DOCS_PATH || "docs/";
  const githubPath = `${docsPath}${slugStr}.md`;
  const githubEditUrl = githubRepo
    ? `https://github.com/${githubRepo}/edit/${githubBranch}/${githubPath}`
    : null;

  return {
    slug: slugStr,
    href: `/docs/${slugStr}`,
    frontmatter,
    content: raw.content,
    mdxSource: compiledContent,
    readingTime,
    wordCount,
    toc,
    prev: prev ? { title: prev.title, href: prev.href } : undefined,
    next: next ? { title: next.title, href: next.href } : undefined,
    breadcrumbs,
    githubPath,
    githubEditUrl: githubEditUrl ?? undefined,
  };
}
