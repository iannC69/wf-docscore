import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface SearchChunk {
  id: string;
  title: string;
  sectionTitle?: string;
  category: string;
  href: string;
  contentSnippet: string;
  keywords: string[];
}

const DOCS_PATH = path.join(process.cwd(), "content", "docs");

const CATEGORY_NAMES: Record<string, string> = {
  "getting-started": "Getting Started",
  "features": "Core Features",
  "api-reference": "API Reference",
};

/**
 * Strips markdown syntax to get clean plain text for search indexing
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ") // remove code blocks or keep words
    .replace(/`([^`]+)`/g, "$1")     // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/#+\s+/g, "")           // headers
    .replace(/[>*_~]/g, "")          // blockquotes, bold, italic
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds a deep search index containing whole documents and section chunks
 */
export function getSearchIndex(): SearchChunk[] {
  if (!fs.existsSync(/*turbopackIgnore: true*/ DOCS_PATH)) return [];

  const chunks: SearchChunk[] = [];

  function processDir(dirPath: string, parentCategory = "General", baseSlug = "") {
    const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const catName = CATEGORY_NAMES[entry.name] || entry.name.replace(/-/g, " ");
        const newBaseSlug = baseSlug ? `${baseSlug}/${entry.name}` : entry.name;
        processDir(fullPath, catName, newBaseSlug);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const fileContent = fs.readFileSync(/*turbopackIgnore: true*/ fullPath, "utf-8");
        const { data, content } = matter(fileContent);

        const isRootIndex = entry.name === "index.md" && baseSlug === "";
        const isSectionIndex = entry.name === "index.md" && baseSlug !== "";
        const fileSlug = entry.name.replace(/\.md$/, "");

        let href = "/docs";
        if (isRootIndex) {
          href = "/docs";
        } else if (isSectionIndex) {
          href = `/docs/${baseSlug}`;
        } else {
          href = baseSlug ? `/docs/${baseSlug}/${fileSlug}` : `/docs/${fileSlug}`;
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
              });
            }
          }
        }
      }
    }
  }

  processDir(DOCS_PATH);
  return chunks;
}
