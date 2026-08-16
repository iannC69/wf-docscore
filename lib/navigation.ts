import type { NavItem, NavGroup } from "@/types/docs";
import type { Locale } from "@/lib/i18n";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ROOT_DOCS_PATH = path.join(process.cwd(), "content", "docs");

// Group title mappings for top-level folders per locale
const GROUP_TITLE_MAP: Record<Locale, Record<string, string>> = {
  en: {
    "getting-started": "Getting Started",
    "features": "Core Features",
    "api-reference": "API Reference",
  },
  ro: {
    "getting-started": "Ghid de Pornire",
    "features": "Funcționalități Principale",
    "api-reference": "Referință API",
  },
};

const GROUP_ORDER_MAP: Record<string, number> = {
  "getting-started": 1,
  "features": 2,
  "api-reference": 3,
};

function getLocaleDocsPath(locale: Locale = "en"): string {
  const localizedPath = path.join(ROOT_DOCS_PATH, locale);
  if (fs.existsSync(/*turbopackIgnore: true*/ localizedPath)) {
    return localizedPath;
  }
  return ROOT_DOCS_PATH;
}

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

function buildNavItemsForDir(dirPath: string, baseSlug: string, localePrefix: string = ""): NavItem[] {
  if (!fs.existsSync(/*turbopackIgnore: true*/ dirPath)) return [];

  const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });
  const items: NavItem[] = [];

  const prefix = localePrefix ? `/${localePrefix}` : "";

  // Check if there is an index.md for the section root
  const indexPath = path.join(dirPath, "index.md");
  if (fs.existsSync(/*turbopackIgnore: true*/ indexPath)) {
    const { title, order, badge } = readFrontmatterTitle(indexPath);
    items.push({
      title,
      slug: baseSlug,
      href: `/docs${prefix}/${baseSlug}`,
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

      // Check if there is a companion subfolder with the same name (e.g. installation/)
      const subDirPath = path.join(dirPath, fileSlug);
      let children: NavItem[] | undefined = undefined;
      if (fs.existsSync(/*turbopackIgnore: true*/ subDirPath) && fs.statSync(/*turbopackIgnore: true*/ subDirPath).isDirectory()) {
        const nested = buildNavItemsForDir(subDirPath, slug, localePrefix);
        children = nested.filter(n => n.href !== `/docs${prefix}/${slug}`);
      }

      items.push({
        title,
        slug,
        href: `/docs${prefix}/${slug}`,
        order,
        badge,
        children: children && children.length > 0 ? children : undefined,
      });
    } else if (entry.isDirectory() && entry.name !== "ro" && entry.name !== "en") {
      // Check if not already handled as companion to a .md file
      const companionMd = path.join(dirPath, `${entry.name}.md`);
      if (!fs.existsSync(/*turbopackIgnore: true*/ companionMd)) {
        const slug = `${baseSlug}/${entry.name}`;
        const subItems = buildNavItemsForDir(fullPath, slug, localePrefix);
        const subIndexPath = path.join(fullPath, "index.md");
        const { title, order, badge } = fs.existsSync(/*turbopackIgnore: true*/ subIndexPath)
          ? readFrontmatterTitle(subIndexPath)
          : { title: entry.name.replace(/-/g, " "), order: 99, badge: undefined };

        const children = subItems.filter(n => n.href !== `/docs${prefix}/${slug}`);

        items.push({
          title,
          slug,
          href: `/docs${prefix}/${slug}`,
          order,
          badge,
          children: children.length > 0 ? children : undefined,
        });
      }
    }
  }

  return sortByOrder(items);
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the full navigation tree organized into named groups for the specified locale.
 */
export async function getNavigation(locale: Locale = "en"): Promise<NavGroup[]> {
  const docsPath = getLocaleDocsPath(locale);
  if (!fs.existsSync(/*turbopackIgnore: true*/ docsPath)) return [];

  const entries = fs.readdirSync(/*turbopackIgnore: true*/ docsPath, { withFileTypes: true });
  const groups: { group: NavGroup; order: number }[] = [];
  const localePrefix = locale === "ro" ? "ro" : "";

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== "ro" && entry.name !== "en") {
      const dirPath = path.join(/*turbopackIgnore: true*/ docsPath, entry.name);
      const items = buildNavItemsForDir(dirPath, entry.name, localePrefix);
      const titleMap = GROUP_TITLE_MAP[locale] || GROUP_TITLE_MAP.en;
      const groupTitle = titleMap[entry.name] || entry.name.replace(/-/g, " ");
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
 * Returns a flat list of all page slugs for generateStaticParams covering all locales.
 */
export async function getAllSlugs(): Promise<string[][]> {
  const slugs: string[][] = [];

  function collectSlugs(dirPath: string, prefix: string[] = []) {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dirPath)) return;
    const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory() && entry.name !== "ro" && entry.name !== "en") {
        slugs.push([...prefix, entry.name]);
        collectSlugs(fullPath, [...prefix, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        if (entry.name !== "index.md") {
          slugs.push([...prefix, entry.name.replace(/\.md$/, "")]);
        }
      }
    }
  }

  // English default slugs
  const enPath = getLocaleDocsPath("en");
  slugs.push([]);
  collectSlugs(enPath, []);

  // Romanian slugs (prefixed with 'ro')
  const roPath = getLocaleDocsPath("ro");
  if (fs.existsSync(/*turbopackIgnore: true*/ roPath)) {
    slugs.push(["ro"]);
    collectSlugs(roPath, ["ro"]);
  }

  // Deduplicate slugs
  const seen = new Set<string>();
  const uniqueSlugs: string[][] = [];
  for (const s of slugs) {
    const key = s.join("/");
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSlugs.push(s);
    }
  }

  return uniqueSlugs;
}

/**
 * Returns the raw Markdown + frontmatter for a given slug and locale.
 */
export async function getRawPage(slug: string[]): Promise<{
  content: string;
  path: string;
  locale: Locale;
  isFallback?: boolean;
} | null> {
  let locale: Locale = "en";
  let targetSlug = [...slug];

  if (slug.length > 0 && slug[0] === "ro") {
    locale = "ro";
    targetSlug = slug.slice(1);
  } else if (slug.length > 0 && slug[0] === "en") {
    locale = "en";
    targetSlug = slug.slice(1);
  }

  const slugPath = targetSlug.join("/");
  const localizedDir = getLocaleDocsPath(locale);
  const fallbackDir = getLocaleDocsPath("en");

  // Root doc
  if (targetSlug.length === 0) {
    const localizedRoot = path.join(localizedDir, "index.md");
    if (fs.existsSync(/*turbopackIgnore: true*/ localizedRoot)) {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ localizedRoot, "utf-8");
      return { content, path: localizedRoot, locale };
    }
    const fallbackRoot = path.join(fallbackDir, "index.md");
    if (fs.existsSync(/*turbopackIgnore: true*/ fallbackRoot)) {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ fallbackRoot, "utf-8");
      return { content, path: fallbackRoot, locale: "en", isFallback: locale === "ro" };
    }
    return null;
  }

  const candidates = [
    path.join(localizedDir, `${slugPath}.md`),
    path.join(localizedDir, slugPath, "index.md"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ candidate, "utf-8");
      return { content, path: candidate, locale };
    }
  }

  // Fallback to English if requested in Romanian but not yet created
  if (locale === "ro") {
    const fallbackCandidates = [
      path.join(fallbackDir, `${slugPath}.md`),
      path.join(fallbackDir, slugPath, "index.md"),
    ];
    for (const candidate of fallbackCandidates) {
      if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
        const content = fs.readFileSync(/*turbopackIgnore: true*/ candidate, "utf-8");
        return { content, path: candidate, locale: "en", isFallback: true };
      }
    }
  }

  return null;
}

/**
 * Returns adjacent pages (prev/next) for navigation.
 */
export async function getAdjacentPages(
  currentSlug: string,
  locale: Locale = "en"
): Promise<{ prev: NavItem | null; next: NavItem | null }> {
  function flattenNav(items: NavItem[]): NavItem[] {
    const flat: NavItem[] = [];
    for (const item of items) {
      flat.push(item);
      if (item.children?.length) flat.push(...flattenNav(item.children));
    }
    return flat;
  }

  const nav = await getNavigation(locale);
  const flat = nav.flatMap(g => flattenNav(g.items));
  const prefix = locale === "ro" ? "/ro" : "";
  const idx = flat.findIndex(
    item => item.slug === currentSlug || item.href === `/docs${prefix}/${currentSlug}` || item.href === `/docs/${currentSlug}`
  );

  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
