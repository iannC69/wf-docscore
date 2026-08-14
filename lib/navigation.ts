import type { NavItem, NavGroup, ContentConfig } from "@/types/docs";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_PATH = path.join(process.cwd(), "content", "docs");

// ─── Build nav from local file system ─────────────────────────────────────────

function sortByOrder(items: NavItem[]): NavItem[] {
  return items.sort((a, b) => a.order - b.order);
}

function fileToSlug(filePath: string, basePath: string): string {
  return filePath
    .replace(basePath, "")
    .replace(/\\/g, "/")
    .replace(/^\//, "")
    .replace(/\/index\.md$/, "")
    .replace(/\.md$/, "")
    || "index";
}

function readFrontmatterTitle(filePath: string): { title: string; order: number; badge?: string } {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    return {
      title: data.title || path.basename(filePath, ".md"),
      order: data.order ?? 99,
      badge: data.badge,
    };
  } catch {
    return { title: path.basename(filePath, ".md"), order: 99 };
  }
}

function buildNavFromDirectory(dirPath: string, baseSlug: string = ""): NavItem[] {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const items: NavItem[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Directory → section with children
      const indexPath = path.join(fullPath, "index.md");
      const { title, order, badge } = readFrontmatterTitle(indexPath);
      const slug = baseSlug ? `${baseSlug}/${entry.name}` : entry.name;
      const children = buildNavFromDirectory(fullPath, slug);

      items.push({
        title,
        slug,
        href: `/docs/${slug}`,
        order,
        badge,
        children: sortByOrder(children.filter(c => c.slug !== slug)),
      });
    } else if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
      // Regular .md file
      const slug = baseSlug
        ? `${baseSlug}/${entry.name.replace(/\.md$/, "")}`
        : entry.name.replace(/\.md$/, "");
      const { title, order, badge } = readFrontmatterTitle(fullPath);

      items.push({
        title,
        slug,
        href: `/docs/${slug}`,
        order,
        badge,
      });
    }
  }

  return sortByOrder(items);
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the full navigation tree for the docs sidebar.
 * Source: local files (dev) or GitHub API (prod).
 */
export async function getNavigation(): Promise<NavGroup[]> {
  // Local mode (dev)
  const items = buildNavFromDirectory(DOCS_PATH);

  // Group top-level items into a single "Documentation" group
  // In phase 3, this will come from the database navigation table
  return [
    {
      title: "Documentation",
      items,
    },
  ];
}

/**
 * Returns a flat list of all page slugs for generateStaticParams.
 */
export async function getAllSlugs(): Promise<string[][]> {
  const slugs: string[][] = [];

  function collectSlugs(dirPath: string, prefix: string[] = []) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        // index.md of directory
        slugs.push([...prefix, entry.name]);
        collectSlugs(fullPath, [...prefix, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        if (entry.name === "index.md") {
          if (prefix.length > 0) slugs.push(prefix); // already added by parent dir logic
        } else {
          slugs.push([...prefix, entry.name.replace(/\.md$/, "")]);
        }
      }
    }
  }

  // Root index
  slugs.push([]);
  collectSlugs(DOCS_PATH);

  return slugs;
}

/**
 * Returns the raw Markdown + frontmatter for a given slug.
 */
export async function getRawPage(slug: string[]): Promise<{
  content: string;
  path: string;
} | null> {
  const slugPath = slug.join("/");

  // Try direct file first
  const candidates = [
    path.join(DOCS_PATH, `${slugPath}.md`),
    path.join(DOCS_PATH, slugPath, "index.md"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ candidate, "utf-8");
      return { content, path: candidate };
    }
  }

  return null;
}

/**
 * Returns adjacent pages (prev/next) for navigation.
 */
export async function getAdjacentPages(
  currentSlug: string
): Promise<{ prev: NavItem | null; next: NavItem | null }> {
  function flattenNav(items: NavItem[]): NavItem[] {
    const flat: NavItem[] = [];
    for (const item of items) {
      flat.push(item);
      if (item.children?.length) flat.push(...flattenNav(item.children));
    }
    return flat;
  }

  const nav = await getNavigation();
  const flat = nav.flatMap(g => flattenNav(g.items));
  const idx = flat.findIndex(item => item.slug === currentSlug || item.href === `/docs/${currentSlug}`);

  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
