import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { TocItem, PageFrontmatter } from "@/types/docs";
import { mdxComponents } from "@/components/docs/MDXComponents";

// ─── TOC Extraction ────────────────────────────────────────────────────────────
// Extracts headings (h1, h2, h3, h4) with precise GithubSlugger IDs matching rehype-slug in DOM

export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();

  // Strip code blocks so code comments (e.g. #!/bin/bash, # comment) are never treated as headings
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "");

  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(stripped)) !== null) {
    const depth = match[1].length;
    const rawTitle = match[2];

    // Strip markdown formatting from title (bold, italic, code, links, custom html)
    const title = rawTitle
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (!title) continue;

    // Generate exact slug matching rehype-slug output in DOM
    const id = slugger.slug(title);

    toc.push({ id, title, depth });
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
  // Protect code blocks and inline code from HTML entity replacement
  const codeSnippets: string[] = [];
  const placeholderPrefix = "___WF_MDX_CODE_BLOCK_";

  const protectedText = text
    // Protect fenced code blocks (```...``` or ~~~...~~~)
    .replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, (match) => {
      const idx = codeSnippets.length;
      codeSnippets.push(match);
      return `${placeholderPrefix}${idx}___`;
    })
    // Protect inline code (`...`)
    .replace(/(`[^`\n]+`)/g, (match) => {
      const idx = codeSnippets.length;
      codeSnippets.push(match);
      return `${placeholderPrefix}${idx}___`;
    });

  let sanitized = protectedText
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
    // 5. Escape orphan angle brackets / command placeholders in regular text: <cod> -> &lt;cod&gt;
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
        return `&lt;${tag}&gt;`;
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

  // ── 8. Convert GitHub-style callouts (> [!TYPE] ...) into <Callout type="..."> JSX ──
  // Match a blockquote block that starts with > [!TYPE] — supports multi-line callouts
  sanitized = sanitized.replace(
    /(?:^|\n)((?:>[^\n]*\n?)+)/gm,
    (fullMatch) => {
      const lines = fullMatch.trim().split(/\n/);
      // Strip leading "> " from each line
      const stripped = lines.map((l) => l.replace(/^>\s?/, ""));
      const firstLine = stripped[0] || "";

      // Check if first line is a callout marker
      const markerMatch = firstLine.match(/^\s*\[!(NOTE|TIP|WARNING|DANGER|CAUTION|IMPORTANT)\]\s*(.*)?$/i);
      if (!markerMatch) return fullMatch;

      const calloutType = markerMatch[1].toLowerCase();
      // Content from marker line (if any) + remaining lines
      const restOfFirst = (markerMatch[2] || "").trim();
      const restLines = stripped.slice(1).join("\n").trim();

      const bodyParts = [restOfFirst, restLines].filter(Boolean);
      const body = bodyParts.join("\n\n");

      return `\n<Callout type="${calloutType}">\n${body}\n</Callout>\n`;
    }
  );

  // Restore protected code snippets
  codeSnippets.forEach((snippet, idx) => {
    sanitized = sanitized.replace(`${placeholderPrefix}${idx}___`, snippet);
  });

  return sanitized;
}

export function safeParseFrontmatter(rawContent: string): { data: Record<string, any>; content: string } {

  try {
    return matter(rawContent);
  } catch {
    // If strict YAML parsing fails (e.g. unquoted colons in text), auto-quote values or strip frontmatter from body
    const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (match) {
      const headerLines = match[1].split("\n");
      const sanitizedHeader = headerLines
        .map((line) => {
          const colonIdx = line.indexOf(":");
          if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            const val = line.slice(colonIdx + 1).trim();
            if (
              val &&
              !val.startsWith('"') &&
              !val.startsWith("'") &&
              !val.startsWith("[") &&
              !val.startsWith("{")
            ) {
              return `${key}: ${JSON.stringify(val)}`;
            }
          }
          return line;
        })
        .join("\n");

      try {
        return matter(`---\n${sanitizedHeader}\n---\n${match[2]}`);
      } catch {
        return { data: {}, content: match[2] };
      }
    }
    return { data: {}, content: rawContent };
  }
}

// ─── Compile MDX ──────────────────────────────────────────────────────────────

export async function compileMdxContent(rawContent: string) {
  const { data: frontmatter, content: markdownBody } = safeParseFrontmatter(rawContent);
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
