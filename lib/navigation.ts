import type { NavItem, NavGroup } from "@/types/docs";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_PATH = path.join(process.cwd(), "content", "docs");

// Group title mappings for top-level folders
const GROUP_TITLE_MAP: Record<string, string> = {
  "getting-started": "Getting Started",
  "features": "Core Features",
  "api-reference": "API Reference",
};

const GROUP_ORDER_MAP: Record<string, number> = {
  "getting-started": 1,
  "features": 2,
  "api-reference": 3,
};

function sortByOrder(items: NavItem[]): NavItem[] {
  return items.sort((a, b) => a.order - b.order);
}

function readFrontmatterTitle(filePath: string): { title: string; order: number; badge?: string } {
  try {
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf-8");
    const { data } = matter(raw);
    return {
      title: data.title || path.basename(filePath, ".md").replace(/-/g, " "),
      order: data.order ?? 99,
      badge: data.badge,
    };
  } catch {
    return { title: path.basename(filePath, ".md").replace(/-/g, " "), order: 99 };
  }
}

function buildNavItemsForDir(dirPath: string, baseSlug: string): NavItem[] {
  if (!fs.existsSync(/*turbopackIgnore: true*/ dirPath)) return [];

  const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });
  const items: NavItem[] = [];

  // Check if there is an index.md for the section root
  const indexPath = path.join(dirPath, "index.md");
  if (fs.existsSync(/*turbopackIgnore: true*/ indexPath)) {
    const { title, order, badge } = readFrontmatterTitle(indexPath);
    items.push({
      title,
      slug: baseSlug,
      href: `/docs/${baseSlug}`,
      order: order ?? 0,
      badge,
    });
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
      const fileSlug = entry.name.replace(/\.md$/, "");
      const slug = `${baseSlug}/${fileSlug}`;
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
 * Returns the full navigation tree organized into named groups.
 */
export async function getNavigation(): Promise<NavGroup[]> {
  if (!fs.existsSync(/*turbopackIgnore: true*/ DOCS_PATH)) return [];

  const entries = fs.readdirSync(/*turbopackIgnore: true*/ DOCS_PATH, { withFileTypes: true });
  const groups: { group: NavGroup; order: number }[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const dirPath = path.join(DOCS_PATH, entry.name);
      const items = buildNavItemsForDir(dirPath, entry.name);
      const groupTitle = GROUP_TITLE_MAP[entry.name] || entry.name.replace(/-/g, " ");
      const groupOrder = GROUP_ORDER_MAP[entry.name] ?? 99;

      if (items.length > 0) {
        groups.push({
          group: {
            title: groupTitle,
            items,
          },
          order: groupOrder,
        });
      }
    }
  }

  groups.sort((a, b) => a.order - b.order);
  return groups.map(g => g.group);
}

/**
 * Returns a flat list of all page slugs for generateStaticParams.
 */
export async function getAllSlugs(): Promise<string[][]> {
  const slugs: string[][] = [];

  function collectSlugs(dirPath: string, prefix: string[] = []) {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dirPath)) return;
    const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        slugs.push([...prefix, entry.name]);
        collectSlugs(fullPath, [...prefix, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        if (entry.name !== "index.md") {
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

  if (slug.length === 0) {
    const rootIndex = path.join(DOCS_PATH, "index.md");
    if (fs.existsSync(/*turbopackIgnore: true*/ rootIndex)) {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ rootIndex, "utf-8");
      return { content, path: rootIndex };
    }
    return null;
  }

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
    next: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
