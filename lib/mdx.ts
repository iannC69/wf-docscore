import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { TocItem, PageFrontmatter } from "@/types/docs";

// ─── MDX Components ────────────────────────────────────────────────────────────
// Imported lazily to avoid circular deps
import { mdxComponents } from "@/components/docs/MDXComponents";

// ─── TOC Extraction ────────────────────────────────────────────────────────────

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const depth = match[1].length;
    const rawTitle = match[2];
    // Strip markdown formatting from title (bold, italic, code, links)
    const title = rawTitle
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .trim();

    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (depth <= 3) {
      toc.push({ id, title, depth });
    }
  }

  return toc;
}

// ─── Rehype Pretty Code options ────────────────────────────────────────────────

const prettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  keepBackground: false,
  onVisitLine(node: any) {
    // Prevent empty lines from collapsing
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
};

// ─── Compile MDX ──────────────────────────────────────────────────────────────

export async function compileMdxContent(rawContent: string) {
  const { data: frontmatter, content: markdownBody } = matter(rawContent);

  const { content } = await compileMDX<PageFrontmatter>({
    source: markdownBody,
    components: mdxComponents,
    options: {
      parseFrontmatter: false, // We already parsed it with gray-matter
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: ["heading-anchor"],
                ariaLabel: "Link to section",
              },
              content: {
                type: "element",
                tagName: "span",
                properties: { ariaHidden: true },
                children: [{ type: "text", value: "#" }],
              },
            },
          ],
          [rehypePrettyCode, prettyCodeOptions],
        ],
      },
    },
  });

  const stats = readingTime(markdownBody);
  const toc = extractToc(markdownBody);

  return {
    content,
    frontmatter: frontmatter as PageFrontmatter,
    readingTime: Math.ceil(stats.minutes),
    wordCount: stats.words,
    toc,
  };
}
