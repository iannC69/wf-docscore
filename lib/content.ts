import { getRawPage, getAdjacentPages, getNavigation } from "@/lib/navigation";
import { compileMdxContent } from "@/lib/mdx";
import { getFileGitInfo, getFileFirstCommitInfo } from "@/lib/git";
import type { DocPage, Breadcrumb, NavItem } from "@/types/docs";
import type { Locale } from "@/lib/i18n";
import path from "path";

// ─── Build breadcrumbs from slug & locale ─────────────────────────────────────

async function buildBreadcrumbs(slug: string[], locale: Locale = "en"): Promise<Breadcrumb[]> {
  const nav = await getNavigation(locale);
  const homeHref = locale === "ro" ? "/docs/ro" : "/docs";
  const homeTitle = locale === "ro" ? "Documentație" : "Docs";
  const breadcrumbs: Breadcrumb[] = [{ title: homeTitle, href: homeHref }];

  let cleanSlug = [...slug];
  if (cleanSlug[0] === "ro" || cleanSlug[0] === "en") {
    cleanSlug = cleanSlug.slice(1);
  }

  // Walk the slug to build breadcrumb trail
  const flat: NavItem[] = [];
  function flatten(items: NavItem[]) {
    for (const item of items) {
      flat.push(item);
      if (item.children) flatten(item.children);
    }
  }
  nav.forEach(g => flatten(g.items));

  for (let i = 0; i < cleanSlug.length - 1; i++) {
    const partialSlug = cleanSlug.slice(0, i + 1).join("/");
    const match = flat.find(
      item => item.slug === partialSlug || item.href.endsWith(`/${partialSlug}`)
    );
    if (match) {
      breadcrumbs.push({ title: match.title, href: match.href });
    }
  }

  return breadcrumbs;
}

// ─── Main content fetcher ──────────────────────────────────────────────────────

/**
 * Get a fully compiled doc page with MDX, TOC, adjacent pages, breadcrumbs, and git commit history.
 * This is the single source of truth for page data.
 */
export async function getDocPage(slug: string[]): Promise<DocPage | null> {
  const raw = await getRawPage(slug);
  if (!raw) return null;

  const locale = raw.locale;
  const { content: compiledContent, frontmatter, readingTime, wordCount, toc } =
    await compileMdxContent(raw.content);

  const slugStr = slug.join("/") || "index";
  const { prev, next } = await getAdjacentPages(slugStr, locale);
  const breadcrumbs = await buildBreadcrumbs(slug, locale);

  // Extract real Git commit & author history
  const gitInfo = getFileGitInfo(raw.path);
  const firstCommit = getFileFirstCommitInfo(raw.path);

  // GitHub repo & edit URL
  const githubRepo = (process.env.GITHUB_REPO_OWNER && process.env.GITHUB_REPO_NAME)
    ? `${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`
    : "iannC69/wf-docscore";
  const githubBranch = process.env.GITHUB_DOCS_BRANCH || "main";
  
  // Calculate relative repo path
  const relPath = path.relative(process.cwd(), raw.path).replace(/\\/g, "/");
  const githubEditUrl = `https://github.com/${githubRepo}/edit/${githubBranch}/${relPath}`;

  const href = slug.length === 0 ? "/docs" : `/docs/${slugStr}`;

  return {
    slug: slugStr,
    href,
    frontmatter,
    content: raw.content,
    mdxSource: compiledContent,
    readingTime,
    wordCount,
    toc,
    prev: prev ? { title: prev.title, href: prev.href } : undefined,
    next: next ? { title: next.title, href: next.href } : undefined,
    breadcrumbs,
    githubPath: relPath,
    githubEditUrl,
    lastModified: gitInfo.date,
    gitInfo,
    firstCommit,
  };
}
