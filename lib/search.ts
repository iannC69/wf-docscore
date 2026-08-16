import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Locale } from "@/lib/i18n";

export interface SearchChunk {
  id: string;
  title: string;
  sectionTitle?: string;
  category: string;
  href: string;
  contentSnippet: string;
  keywords: string[];
  locale?: Locale;
}

const ROOT_DOCS_PATH = path.join(process.cwd(), "content", "docs");

const CATEGORY_NAMES: Record<Locale, Record<string, string>> = {
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

/**
 * Strips markdown syntax to get clean plain text for search indexing
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ") // remove code blocks
    .replace(/<[^>]+>/g, " ")        // remove JSX/HTML tags
    .replace(/`([^`]+)`/g, "$1")     // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/#+\s+/g, "")           // headers
    .replace(/[>*_~]/g, "")          // blockquotes, bold, italic
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds a deep search index containing whole documents and section chunks for a given locale
 */
export function getSearchIndex(locale: Locale = "en"): SearchChunk[] {
  const localizedPath = path.join(ROOT_DOCS_PATH, locale);
  const searchRoot = fs.existsSync(/*turbopackIgnore: true*/ localizedPath)
    ? localizedPath
    : ROOT_DOCS_PATH;

  if (!fs.existsSync(/*turbopackIgnore: true*/ searchRoot)) return [];

  const chunks: SearchChunk[] = [];
  const prefix = locale === "ro" ? "/ro" : "";
  const catMap = CATEGORY_NAMES[locale] || CATEGORY_NAMES.en;

  function processDir(dirPath: string, parentCategory = "General", baseSlug = "") {
    const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory() && entry.name !== "ro" && entry.name !== "en") {
        const catName = catMap[entry.name] || entry.name.replace(/-/g, " ");
        const newBaseSlug = baseSlug ? `${baseSlug}/${entry.name}` : entry.name;
        processDir(fullPath, catName, newBaseSlug);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const fileContent = fs.readFileSync(/*turbopackIgnore: true*/ fullPath, "utf-8");
        const { data, content } = matter(fileContent);

        const isRootIndex = entry.name === "index.md" && baseSlug === "";
        const isSectionIndex = entry.name === "index.md" && baseSlug !== "";
        const fileSlug = entry.name.replace(/\.md$/, "");

        let href = `/docs${prefix}`;
        if (isRootIndex) {
          href = `/docs${prefix}`;
        } else if (isSectionIndex) {
          href = `/docs${prefix}/${baseSlug}`;
        } else {
          href = baseSlug ? `/docs${prefix}/${baseSlug}/${fileSlug}` : `/docs${prefix}/${fileSlug}`;
        }

        const docTitle = data.title || path.basename(fullPath, ".md").replace(/-/g, " ");
        const docDescription = data.description || "";
        const docKeywords: string[] = Array.isArray(data.keywords) ? data.keywords : [];

        // 1. Add primary document chunk
        chunks.push({
          id: href,
          title: docTitle,
          category: parentCategory,
          href,
          contentSnippet: docDescription || cleanMarkdown(content.slice(0, 240)),
          keywords: docKeywords,
          locale,
        });

        // 2. Parse section chunks (split by headings ## or ###)
        const sections = content.split(/(?=^#{2,3}\s+)/m);

        for (const section of sections) {
          const match = section.match(/^(#{2,3})\s+(.+)$/m);
          if (match) {
            const rawHeading = match[2]
              .replace(/\*\*(.+?)\*\*/g, "$1")
              .replace(/`(.+?)`/g, "$1")
              .trim();

            const headingId = rawHeading
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-");

            const sectionBody = section.replace(/^(#{2,3})\s+.+$/m, "");
            const cleanedBody = cleanMarkdown(sectionBody);

            if (cleanedBody.length > 5) {
              chunks.push({
                id: `${href}#${headingId}`,
                title: rawHeading,
                sectionTitle: docTitle,
                category: parentCategory,
                href: `${href}#${headingId}`,
                contentSnippet: cleanedBody.slice(0, 180),
                keywords: docKeywords,
                locale,
              });
            }
          }
        }
      }
    }
  }

  processDir(searchRoot);
  return chunks;
}
