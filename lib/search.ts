import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface SearchDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  slug: string;
  href: string;
  headings: { id: string; title: string; depth: number }[];
  keywords: string[];
}

const DOCS_PATH = path.join(process.cwd(), "content", "docs");

const CATEGORY_NAMES: Record<string, string> = {
  "getting-started": "Getting Started",
  "features": "Core Features",
  "api-reference": "API Reference",
};

export function getSearchIndex(): SearchDocument[] {
  if (!fs.existsSync(/*turbopackIgnore: true*/ DOCS_PATH)) return [];

  const index: SearchDocument[] = [];

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

        let slug = "";
        let href = "/docs";

        if (isRootIndex) {
          slug = "";
          href = "/docs";
        } else if (isSectionIndex) {
          slug = baseSlug;
          href = `/docs/${baseSlug}`;
        } else {
          slug = baseSlug ? `${baseSlug}/${fileSlug}` : fileSlug;
          href = `/docs/${slug}`;
        }

        // Extract headings
        const headings: { id: string; title: string; depth: number }[] = [];
        const headingRegex = /^(#{2,3})\s+(.+)$/gm;
        let match;
        while ((match = headingRegex.exec(content)) !== null) {
          const depth = match[1].length;
          const rawTitle = match[2]
            .replace(/\*\*(.+?)\*\*/g, "$1")
            .replace(/\*(.+?)\*/g, "$1")
            .replace(/`(.+?)`/g, "$1")
            .replace(/\[(.+?)\]\(.+?\)/g, "$1")
            .trim();

          const id = rawTitle
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

          headings.push({ id, title: rawTitle, depth });
        }

        // Extract keywords from frontmatter or text
        const keywords: string[] = Array.isArray(data.keywords)
          ? data.keywords
          : [];

        index.push({
          id: href,
          title: data.title || path.basename(fullPath, ".md").replace(/-/g, " "),
          description: data.description || "",
          category: parentCategory,
          slug,
          href,
          headings,
          keywords,
        });
      }
    }
  }

  processDir(DOCS_PATH);
  return index;
}
