import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { TocItem, PageFrontmatter } from "@/types/docs";
import { mdxComponents } from "@/components/docs/MDXComponents";

// ─── TOC Extraction ────────────────────────────────────────────────────────────
// Extracts only h2 and h3 headings (skipping h1 so page title isn't duplicated)

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
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

    if (depth === 2 || depth === 3) {
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

// ─── MDX Source Sanitizer ───────────────────────────────────────────────────

export function sanitizeMdxSource(text: string): string {
  return text
    // 1. Remove HTML comments which break JSX/MDX parser: <!-- ... -->
    .replace(/<!--[\s\S]*?-->/g, "")
    // 2. Remove orphan VitePress header tags
    .replace(/<CaseHeader[\s\S]*?\/>/gi, "")
    .replace(/<CaseHeader[\s\S]*?<\/CaseHeader>/gi, "")
    .replace(/<DocHeader[\s\S]*?\/>/gi, "")
    .replace(/<DocHeader[\s\S]*?<\/DocHeader>/gi, "")
    .replace(/<Icon\s+[^>]*?\/>/gi, "")
    .replace(/<iconify-icon[^>]*?>[\s\S]*?<\/iconify-icon>/gi, "")
    .replace(/<iconify-icon[^>]*?\/>/gi, "")
    .replace(/<Badge\s+[^>]*?\/>/gi, "")
    // 4. Ensure void tags are closed if any remain: <br> -> \n, <hr> -> \n---\n
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n---\n")
    // 5. Escape orphan angle brackets / command placeholders: <cod> -> &lt;cod&gt;
    .replace(/<([a-zA-Z0-9_-]+)>/g, (match, tag) => {
      const lower = tag.toLowerCase();
      const validTags = [
        "div", "p", "span", "a", "h1", "h2", "h3", "h4", "h5", "h6",
        "table", "thead", "tbody", "tr", "th", "td", "ul", "ol", "li",
        "code", "pre", "em", "strong", "b", "i", "video", "img", "details",
        "summary", "blockquote", "aside", "header", "footer", "section", "article",
        "callout", "steps", "step", "tabs", "tab", "cards", "card"
      ];
      if (!validTags.includes(lower)) {
        return `\`<${tag}>\``;
      }
      return match;
    })
    // 6. Strip stray unmatching closing tags: </li>, </ul>, </p>, </div>, </span>
    .replace(/<\/(?:li|ul|ol|p|div|span)>/gi, "")
    // 7. Transform <video ...> into <DocVideo ... />
    .replace(/<video\s+([^>]*?)(?:\s*\/>|>(?:<\/video>)?)/gi, (_match, attrs) => {
      const cleanAttrs = attrs.replace(/\bcontrols\b/gi, "").trim();
      return `<DocVideo ${cleanAttrs} />`;
    });
}

// ─── Compile MDX ──────────────────────────────────────────────────────────────

export async function compileMdxContent(rawContent: string) {
  const { data: frontmatter, content: markdownBody } = matter(rawContent);
  const sanitizedSource = sanitizeMdxSource(markdownBody);

  const { content } = await compileMDX<PageFrontmatter>({
    source: sanitizedSource,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              test: ["h2", "h3", "h4"],
              properties: {
                className: ["heading-anchor"],
                ariaLabel: "Link to section",
              },
              content: {
                type: "element",
                tagName: "span",
                properties: { ariaHidden: "true", className: ["anchor-icon"] },
                children: [{ type: "text", value: "#" }],
              },
            },
          ],
          [rehypePrettyCode, prettyCodeOptions],
        ],
      },
    },
  });

  const stats = readingTime(sanitizedSource);
  const toc = extractToc(sanitizedSource);

  return {
    content,
    frontmatter: frontmatter as PageFrontmatter,
    readingTime: Math.ceil(stats.minutes),
    wordCount: stats.words,
    toc,
  };
}
