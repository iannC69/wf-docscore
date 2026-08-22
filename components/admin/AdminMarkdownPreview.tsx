"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  User,
  Info,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ShieldAlert,
  Terminal,
  Check,
  Copy,
  Play,
  Clock,
  Edit3,
  ArrowRight,
} from "lucide-react";

interface AdminMarkdownPreviewProps {
  rawContent: string;
  slug?: string;
  onContentChange?: (newContent: string) => void;
  onOpenTableBuilder?: () => void;
  onOpenCalloutBuilder?: (type?: "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION") => void;
  onOpenCodeBuilder?: () => void;
  onOpenMediaModal?: () => void;
  onOpenGalleryBuilder?: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  informatii: "Informații Generale",
  currency: "Currency & Economie",
  systems: "Sisteme & Mecanici",
  market: "Market & Donații",
  staff: "Ghiduri Administrative",
  regulamente: "Regulamente Oficiale",
};

interface DocBlock {
  id: number;
  type: "heading" | "paragraph" | "callout" | "code" | "table" | "list" | "cards" | "image" | "video" | "hr";
  level?: number;
  calloutType?: string;
  codeLanguage?: string;
  headers?: string[];
  alignments?: string[];
  rows?: string[][];
  listItems?: { text: string; isTask?: boolean; isChecked?: boolean }[];
  cards?: { title: string; href: string; body: string }[];
  alt?: string;
  url?: string;
  src?: string;
  title?: string;
  text?: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, any>; body: string } {
  if (!raw.trim().startsWith("---")) {
    return { meta: {}, body: raw };
  }

  const lines = raw.split(/\r?\n/);
  if (lines[0].trim() !== "---") {
    return { meta: {}, body: raw };
  }

  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIdx = i;
      break;
    }
  }

  if (endIdx === -1) {
    return { meta: {}, body: raw };
  }

  const yamlLines = lines.slice(1, endIdx);
  const body = lines.slice(endIdx + 1).join("\n");
  const meta: Record<string, any> = {};

  let currentKey = "";
  for (const line of yamlLines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > -1 && !line.startsWith(" ") && !line.startsWith("\t")) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      val = val.replace(/^["'](.*)["']$/, "$1");
      if (val === ">-" || val === ">" || val === "|") {
        currentKey = key;
        meta[key] = "";
      } else if (val.startsWith("[") && val.endsWith("]")) {
        meta[key] = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["'](.*)["']$/, "$1"))
          .filter(Boolean);
        currentKey = "";
      } else {
        meta[key] = val;
        currentKey = "";
      }
    } else if (currentKey && (line.startsWith(" ") || line.startsWith("\t"))) {
      meta[currentKey] = (meta[currentKey] ? meta[currentKey] + " " : "") + line.trim();
    }
  }

  return { meta, body };
}

function rebuildMarkdownWithFrontmatter(meta: Record<string, any>, body: string): string {
  const frontmatterLines: string[] = ["---"];
  for (const [key, val] of Object.entries(meta)) {
    if (val === undefined || val === null || val === "") continue;
    if (Array.isArray(val)) {
      frontmatterLines.push(`${key}: [${val.map((v) => `"${v}"`).join(", ")}]`);
    } else {
      frontmatterLines.push(`${key}: ${val}`);
    }
  }
  frontmatterLines.push("---");
  return `${frontmatterLines.join("\n")}\n\n${body.replace(/^\n+/, "")}`;
}

function parseMarkdownToBlocks(body: string, frontmatterTitle = ""): DocBlock[] {
  const lines = body.split("\n");
  const blocks: DocBlock[] = [];
  let inCodeBlock = false;
  let codeLanguage = "";
  let codeBuffer: string[] = [];
  let listBuffer: { text: string; isChecked?: boolean; isTask?: boolean }[] = [];
  let blockId = 0;
  let seenFirstHeading = false;

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({
        id: blockId++,
        type: "list",
        listItems: [...listBuffer],
      });
      listBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ── Code Block Start / End ──
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        flushList();
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim() || "bash";
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        blocks.push({
          id: blockId++,
          type: "code",
          codeLanguage,
          text: codeBuffer.join("\n"),
        });
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // ── Cards Grid (<Cards> ... </Cards>) ──
    if (line.trim().startsWith("<Cards>")) {
      flushList();
      const cardMatches: { title: string; href: string; body: string }[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().includes("</Cards>")) {
        const cardLine = lines[i];
        const match = cardLine.match(/<Card\s+title=["'](.*?)["'](?:\s+href=["'](.*?)["'])?/i);
        if (match) {
          const cTitle = match[1];
          const cHref = match[2] || "#";
          const cBodyLines: string[] = [];
          i++;
          while (i < lines.length && !lines[i].trim().includes("</Card>") && !lines[i].trim().includes("</Cards>")) {
            if (lines[i].trim()) cBodyLines.push(lines[i].trim());
            i++;
          }
          cardMatches.push({ title: cTitle, href: cHref, body: cBodyLines.join(" ") });
        }
        i++;
      }

      blocks.push({
        id: blockId++,
        type: "cards",
        cards: cardMatches,
      });
      continue;
    }

    // ── Markdown Table ──
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList();
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      i--;

      if (tableLines.length >= 2) {
        const rawHeaders = tableLines[0].split("|").slice(1, -1).map((c) => c.trim());
        const rawAlignments = (tableLines[1] || "").split("|").slice(1, -1).map((c) => {
          const trimmed = c.trim();
          if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
          if (trimmed.endsWith(":")) return "right";
          return "left";
        });
        const rawDataRows = tableLines.slice(2).map((rowLine) =>
          rowLine.split("|").slice(1, -1).map((c) => c.trim())
        );

        blocks.push({
          id: blockId++,
          type: "table",
          headers: rawHeaders,
          alignments: rawAlignments,
          rows: rawDataRows,
        });
        continue;
      }
    }

    // ── Headings ──
    if (line.startsWith("# ")) {
      flushList();
      const titleText = line.slice(2).trim();
      if (!seenFirstHeading && frontmatterTitle && titleText.toLowerCase() === frontmatterTitle.trim().toLowerCase()) {
        seenFirstHeading = true;
        continue;
      }
      seenFirstHeading = true;
      blocks.push({ id: blockId++, type: "heading", level: 1, text: titleText });
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      seenFirstHeading = true;
      blocks.push({ id: blockId++, type: "heading", level: 2, text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      seenFirstHeading = true;
      blocks.push({ id: blockId++, type: "heading", level: 3, text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith("#### ")) {
      flushList();
      seenFirstHeading = true;
      blocks.push({ id: blockId++, type: "heading", level: 4, text: line.slice(5).trim() });
      continue;
    }

    // ── Callouts ──
    if (line.startsWith("> [!")) {
      flushList();
      const alertTypeMatch = line.match(/^>\s*\[!([A-Z]+)\]\s*(.*)?$/i);
      const type = alertTypeMatch ? alertTypeMatch[1].toUpperCase() : "NOTE";
      const firstLineRest = alertTypeMatch?.[2]?.trim() || "";
      const alertLines: string[] = [];

      if (firstLineRest) alertLines.push(firstLineRest);

      while (i + 1 < lines.length && lines[i + 1].startsWith(">")) {
        i++;
        alertLines.push(lines[i].replace(/^>\s?/, ""));
      }

      blocks.push({
        id: blockId++,
        type: "callout",
        calloutType: type,
        text: alertLines.join("\n"),
      });
      continue;
    }

    // ── Images ──
    const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      flushList();
      blocks.push({
        id: blockId++,
        type: "image",
        alt: imgMatch[1],
        url: imgMatch[2],
      });
      continue;
    }

    // ── Video Tags ──
    const videoMatch = line.trim().match(/<DocVideo\s+src=["'](.*?)["'](?:\s+title=["'](.*?)["'])?/i);
    if (videoMatch) {
      flushList();
      blocks.push({
        id: blockId++,
        type: "video",
        src: videoMatch[1],
        title: videoMatch[2] || "Video Player",
      });
      continue;
    }

    // ── Lists & Checklists ──
    const taskMatch = line.trim().match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (taskMatch) {
      const isChecked = taskMatch[1].toLowerCase() === "x";
      listBuffer.push({ text: taskMatch[2], isChecked, isTask: true });
      continue;
    }

    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      listBuffer.push({ text: line.trim().slice(2), isTask: false });
      continue;
    }

    // ── Horizontal Rules ──
    if (line.trim() === "---" || line.trim() === "***") {
      flushList();
      blocks.push({ id: blockId++, type: "hr" });
      continue;
    }

    // ── Regular Paragraph ──
    if (line.trim()) {
      flushList();
      blocks.push({
        id: blockId++,
        type: "paragraph",
        text: line.trim(),
      });
    }
  }

  flushList();
  return blocks;
}

function serializeBlocksToMarkdown(blocks: DocBlock[]): string {
  const parts: string[] = [];

  for (const b of blocks) {
    if (b.type === "heading") {
      parts.push(`${"#".repeat(b.level || 2)} ${b.text || ""}`);
    } else if (b.type === "paragraph") {
      parts.push(b.text || "");
    } else if (b.type === "callout") {
      const type = (b.calloutType || "NOTE").toUpperCase();
      const lines = (b.text || "").split("\n");
      parts.push(`> [!${type}]\n` + lines.map((l) => `> ${l}`).join("\n"));
    } else if (b.type === "code") {
      parts.push(`\`\`\`${b.codeLanguage || "bash"}\n${b.text || ""}\n\`\`\``);
    } else if (b.type === "table") {
      const headers = b.headers || [];
      const alignments = b.alignments || [];
      const rows = b.rows || [];
      const headerLine = `| ${headers.join(" | ")} |`;
      const alignLine = `| ${alignments
        .map((a) => (a === "center" ? ":---:" : a === "right" ? "---:" : ":---"))
        .join(" | ")} |`;
      const rowLines = rows.map((r) => `| ${r.join(" | ")} |`);
      parts.push([headerLine, alignLine, ...rowLines].join("\n"));
    } else if (b.type === "list") {
      const listLines = (b.listItems || []).map((item) => {
        if (item.isTask) {
          return `- [${item.isChecked ? "x" : " "}] ${item.text}`;
        }
        return `- ${item.text}`;
      });
      parts.push(listLines.join("\n"));
    } else if (b.type === "cards") {
      const cardLines = (b.cards || []).map(
        (c) => `  <Card title="${c.title}" href="${c.href}">\n    ${c.body}\n  </Card>`
      );
      parts.push(`<Cards>\n${cardLines.join("\n")}\n</Cards>`);
    } else if (b.type === "image") {
      parts.push(`![${b.alt || ""}](${b.url || ""})`);
    } else if (b.type === "video") {
      parts.push(`<DocVideo src="${b.src || ""}" title="${b.title || ""}" />`);
    } else if (b.type === "hr") {
      parts.push("---");
    }
  }

  return parts.join("\n\n");
}

function CopyableCodeBlock({
  code,
  language,
  onCodeChange,
}: {
  code: string;
  language: string;
  onCodeChange?: (newCode: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="admin-preview-codeblock not-prose">
      <div className="admin-preview-code-header">
        <div className="admin-preview-code-lang">
          <Terminal size={13} style={{ color: "hsl(26 100% 55%)" }} />
          <span>{language || "bash"}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="admin-preview-copy-btn"
          title="Copiază codul"
        >
          {copied ? <Check size={12} style={{ color: "#10b981" }} /> : <Copy size={12} />}
          <span>{copied ? "Copiat" : "Copy"}</span>
        </button>
      </div>
      <pre
        className="admin-preview-code-pre"
        contentEditable={Boolean(onCodeChange)}
        suppressContentEditableWarning
        onBlur={(e) => {
          if (onCodeChange) onCodeChange(e.currentTarget.textContent || "");
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Clean, Realistic, and Direct Click-to-Edit Markdown Preview with Full Bidirectional Sync
 */
export function AdminMarkdownPreview({
  rawContent,
  slug = "",
  onContentChange,
  onOpenTableBuilder,
}: AdminMarkdownPreviewProps) {
  const { meta, body } = useMemo(() => parseFrontmatter(rawContent), [rawContent]);
  const [blocks, setBlocks] = useState<DocBlock[]>([]);

  // Parse blocks whenever rawContent changes from editor
  useEffect(() => {
    const parsed = parseMarkdownToBlocks(body, meta.title || "");
    setBlocks(parsed);
  }, [body, meta.title]);

  const syncBlocksToParent = useCallback(
    (newBlocks: DocBlock[]) => {
      setBlocks(newBlocks);
      if (onContentChange) {
        const serializedBody = serializeBlocksToMarkdown(newBlocks);
        const fullMarkdown = rebuildMarkdownWithFrontmatter(meta, serializedBody);
        onContentChange(fullMarkdown);
      }
    },
    [meta, onContentChange]
  );

  const totalWords = useMemo(() => {
    return body.trim() ? body.trim().split(/\s+/).length : 0;
  }, [body]);

  const estimatedReadingTime = useMemo(() => {
    return Math.max(1, Math.ceil(totalWords / 200));
  }, [totalWords]);

  const categoryLabel = useMemo(() => {
    if (meta.category) {
      const cat = String(meta.category).toLowerCase();
      return CATEGORY_NAMES[cat] || meta.category;
    }
    if (slug) {
      const root = slug.split("/").filter(Boolean)[0] || "";
      return CATEGORY_NAMES[root] || (root ? root.replace(/-/g, " ") : "Documentație");
    }
    return "Documentație";
  }, [meta.category, slug]);

  const authorName = meta.author || meta.authors?.[0] || "iannC69";

  // ─── Inline Updates for Header (Title & Description) ───
  const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
    const newTitle = e.currentTarget.textContent?.trim() || "";
    if (newTitle !== meta.title && onContentChange) {
      const updatedMeta = { ...meta, title: newTitle };
      const serializedBody = serializeBlocksToMarkdown(blocks);
      const fullMarkdown = rebuildMarkdownWithFrontmatter(updatedMeta, serializedBody);
      onContentChange(fullMarkdown);
    }
  };

  const handleDescBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    const newDesc = e.currentTarget.textContent?.trim() || "";
    if (newDesc !== meta.description && onContentChange) {
      const updatedMeta = { ...meta, description: newDesc };
      const serializedBody = serializeBlocksToMarkdown(blocks);
      const fullMarkdown = rebuildMarkdownWithFrontmatter(updatedMeta, serializedBody);
      onContentChange(fullMarkdown);
    }
  };

  // ─── Inline Updates for Blocks (Heading, Paragraph, Table, Callout, List) ───
  const handleBlockTextBlur = (blockId: number, newText: string) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId) {
        return { ...b, text: newText.trim() };
      }
      return b;
    });
    syncBlocksToParent(updated);
  };

  const handleTableCellBlur = (blockId: number, rowIdx: number, colIdx: number, newText: string) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId && b.rows) {
        const nextRows = b.rows.map((r, rI) => {
          if (rI === rowIdx) {
            const nextCols = [...r];
            nextCols[colIdx] = newText.trim();
            return nextCols;
          }
          return r;
        });
        return { ...b, rows: nextRows };
      }
      return b;
    });
    syncBlocksToParent(updated);
  };

  const handleTableHeaderBlur = (blockId: number, colIdx: number, newText: string) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId && b.headers) {
        const nextHeaders = [...b.headers];
        nextHeaders[colIdx] = newText.trim();
        return { ...b, headers: nextHeaders };
      }
      return b;
    });
    syncBlocksToParent(updated);
  };

  const handleTaskToggle = (blockId: number, itemIdx: number) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId && b.listItems) {
        const nextItems = b.listItems.map((it, i) => {
          if (i === itemIdx) {
            return { ...it, isChecked: !it.isChecked };
          }
          return it;
        });
        return { ...b, listItems: nextItems };
      }
      return b;
    });
    syncBlocksToParent(updated);
  };

  const handleListItemBlur = (blockId: number, itemIdx: number, newText: string) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId && b.listItems) {
        const nextItems = b.listItems.map((it, i) => {
          if (i === itemIdx) {
            return { ...it, text: newText.trim() };
          }
          return it;
        });
        return { ...b, listItems: nextItems };
      }
      return b;
    });
    syncBlocksToParent(updated);
  };

  const formatInline = (text: string): string => {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: var(--color-text);">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: var(--color-text-secondary);">$1</em>')
      .replace(
        /`([^`]+)`/g,
        '<code style="font-family: var(--font-mono); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; background: hsl(26 100% 52% / 0.12); color: hsl(26 100% 55%); border: 1px solid hsl(26 100% 52% / 0.25); font-weight: 600;">$1</code>'
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: hsl(26 100% 55%); text-decoration: underline; text-underline-offset: 3px; font-weight: 500;">$1</a>'
      );
    return formatted;
  };

  return (
    <div className="admin-preview-root">
      <article className="docs-content" id="main-content">
        <div className="docs-content-inner">
          {/* Top Row: Breadcrumbs & Path Badge */}
          <div className="admin-preview-breadcrumbs-row">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div className="admin-preview-cat-pill">
                <span className="admin-preview-pill-dot" aria-hidden="true" />
                <span>{categoryLabel}</span>
              </div>
              {meta.badge && (
                <span className={`badge badge--${String(meta.badge).toLowerCase()} page-tag-badge`}>
                  {meta.badge}
                </span>
              )}
            </div>

            {slug && (
              <span className="admin-preview-path-pill">
                /docs/{slug.replace(/^\/+/, "")}
              </span>
            )}
          </div>

          {/* Page Header: Directly Editable Title & Description (Syncs to frontmatter) */}
          <header className="admin-preview-header">
            <h1
              className="admin-preview-title"
              contentEditable={Boolean(onContentChange)}
              suppressContentEditableWarning
              onBlur={handleTitleBlur}
              title="Fă click pentru a edita titlul (se salvează direct în cod)"
              style={{ outline: "none", cursor: "text" }}
            >
              {meta.title || "Ghid Fără Titlu"}
            </h1>

            <p
              className="admin-preview-desc"
              contentEditable={Boolean(onContentChange)}
              suppressContentEditableWarning
              onBlur={handleDescBlur}
              title="Fă click pentru a edita descrierea (se salvează direct în cod)"
              style={{ outline: "none", cursor: "text" }}
            >
              {meta.description || "Adaugă o descriere scurtă pentru acest ghid..."}
            </p>

            {/* Comprehensive Metadata: Author, Commit, Read Time, Word Count */}
            <div className="admin-preview-meta-bar">
              {/* Author Card / Updated By */}
              <div className="admin-preview-author-chip">
                <img
                  src={`https://github.com/${authorName}.png`}
                  alt={authorName}
                  className="admin-preview-author-avatar"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "var(--color-text-tertiary)" }}>Updated by</span>
                  <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{authorName}</span>
                </span>
                <span style={{ color: "var(--color-text-tertiary)" }}>·</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>Live Preview</span>
              </div>

              {/* Read Time & Word Count */}
              <div className="admin-preview-read-chip">
                <Clock size={12} style={{ color: "hsl(26 100% 55%)" }} />
                <span>{estimatedReadingTime} min read · {totalWords} cuvinte</span>
              </div>

              {/* Frontmatter Tags */}
              {meta.tags && Array.isArray(meta.tags) && (
                <div className="admin-preview-tags-wrap">
                  {meta.tags.map((t: string, i: number) => (
                    <span key={i} className="admin-preview-tag-pill">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Rendered Markdown Body with Direct Click-to-Edit & Real-Time Code Sync */}
          <div className="prose" style={{ maxWidth: "100%" }}>
            {blocks.length === 0 ? (
              <div className="admin-preview-empty">
                <FileText size={42} style={{ color: "var(--color-text-tertiary)", margin: "0 auto 12px" }} />
                <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--color-text)", margin: "0 0 6px" }}>Documentul este gol</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", margin: 0 }}>Introdu conținut în editorul Cod sau folosește instrumentele de inserare.</p>
              </div>
            ) : (
              blocks.map((b) => {
                // ── 1. Heading ──
                if (b.type === "heading") {
                  const HeadingTag = b.level === 1 ? "h1" : b.level === 2 ? "h2" : b.level === 3 ? "h3" : "h4";
                  const headingStyles =
                    b.level === 1
                      ? { fontSize: "1.85rem", fontWeight: 800, marginTop: "28px", marginBottom: "14px" }
                      : b.level === 2
                      ? { fontSize: "1.45rem", fontWeight: 750, marginTop: "28px", marginBottom: "12px", paddingBottom: "6px", borderBottom: "1px solid var(--glass-border)" }
                      : b.level === 3
                      ? { fontSize: "1.2rem", fontWeight: 700, marginTop: "22px", marginBottom: "8px" }
                      : { fontSize: "1.02rem", fontWeight: 700, marginTop: "18px", marginBottom: "6px" };

                  return (
                    <HeadingTag
                      key={b.id}
                      style={{ ...headingStyles, color: "var(--color-text)", outline: "none", cursor: "text" }}
                      contentEditable={Boolean(onContentChange)}
                      suppressContentEditableWarning
                      onBlur={(e) => handleBlockTextBlur(b.id, e.currentTarget.textContent || "")}
                    >
                      {b.text}
                    </HeadingTag>
                  );
                }

                // ── 2. Paragraph ──
                if (b.type === "paragraph") {
                  return (
                    <p
                      key={b.id}
                      style={{ margin: "12px 0", color: "var(--color-text-secondary)", lineHeight: 1.65, fontSize: "0.92rem", outline: "none", cursor: "text" }}
                      contentEditable={Boolean(onContentChange)}
                      suppressContentEditableWarning
                      onBlur={(e) => handleBlockTextBlur(b.id, e.currentTarget.textContent || "")}
                      dangerouslySetInnerHTML={{ __html: formatInline(b.text || "") }}
                    />
                  );
                }

                // ── 3. Callout Alert ──
                if (b.type === "callout") {
                  const type = (b.calloutType || "NOTE").toUpperCase();
                  const calloutTypeKey = type.toLowerCase();
                  let IconComp = Info;
                  let defaultLabel = "NOTĂ INFORMATIVĂ";

                  if (type === "TIP") {
                    IconComp = CheckCircle2;
                    defaultLabel = "SFAT PRACTIC";
                  } else if (type === "IMPORTANT") {
                    IconComp = Flame;
                    defaultLabel = "IMPORTANT";
                  } else if (type === "WARNING") {
                    IconComp = AlertTriangle;
                    defaultLabel = "ATENȚIE";
                  } else if (type === "CAUTION" || type === "DANGER") {
                    IconComp = ShieldAlert;
                    defaultLabel = "PRECAUȚIE";
                  }

                  return (
                    <div key={b.id} className={`callout callout--${calloutTypeKey}`} style={{ margin: "20px 0" }} role="note">
                      <div className="callout-icon-wrapper" aria-hidden="true">
                        <IconComp size={16} />
                      </div>
                      <div className="callout-content">
                        <div className="callout-title">{defaultLabel}</div>
                        <div
                          className="callout-body"
                          contentEditable={Boolean(onContentChange)}
                          suppressContentEditableWarning
                          onBlur={(e) => handleBlockTextBlur(b.id, e.currentTarget.textContent || "")}
                          dangerouslySetInnerHTML={{ __html: formatInline(b.text || "") }}
                          style={{ outline: "none", cursor: "text" }}
                        />
                      </div>
                    </div>
                  );
                }

                // ── 4. Code Block ──
                if (b.type === "code") {
                  return (
                    <CopyableCodeBlock
                      key={b.id}
                      code={b.text || ""}
                      language={b.codeLanguage || "bash"}
                      onCodeChange={(newCode) => handleBlockTextBlur(b.id, newCode)}
                    />
                  );
                }

                // ── 5. Table (Editable matrix with live sync) ──
                if (b.type === "table") {
                  return (
                    <div key={b.id} className="admin-preview-table-wrapper not-prose">
                      {onOpenTableBuilder && (
                        <button
                          type="button"
                          onClick={onOpenTableBuilder}
                          className="admin-preview-table-btn"
                          title="Deschide generatorul de tabele"
                        >
                          <Edit3 size={11} />
                          <span>Editează Tabel</span>
                        </button>
                      )}
                      <table className="admin-preview-table">
                        <thead>
                          <tr>
                            {(b.headers || []).map((h, colIdx) => (
                              <th
                                key={colIdx}
                                style={{ textAlign: (b.alignments?.[colIdx] as any) || "left", outline: "none", cursor: "text" }}
                                contentEditable={Boolean(onContentChange)}
                                suppressContentEditableWarning
                                onBlur={(e) => handleTableHeaderBlur(b.id, colIdx, e.currentTarget.textContent || "")}
                                dangerouslySetInnerHTML={{ __html: formatInline(h) }}
                              />
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(b.rows || []).map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              {row.map((cell, colIdx) => (
                                <td
                                  key={colIdx}
                                  style={{ textAlign: (b.alignments?.[colIdx] as any) || "left", outline: "none", cursor: "text" }}
                                  contentEditable={Boolean(onContentChange)}
                                  suppressContentEditableWarning
                                  onBlur={(e) => handleTableCellBlur(b.id, rowIdx, colIdx, e.currentTarget.textContent || "")}
                                  dangerouslySetInnerHTML={{ __html: formatInline(cell) }}
                                />
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                // ── 6. List & Checklist ──
                if (b.type === "list") {
                  return (
                    <ul key={b.id} style={{ margin: "14px 0", paddingLeft: "24px", listStyleType: "disc" }}>
                      {(b.listItems || []).map((item, i) => {
                        if (item.isTask) {
                          return (
                            <li key={i} style={{ listStyleType: "none", marginLeft: "-20px", display: "flex", alignItems: "flex-start", gap: "8px", color: "var(--color-text-secondary)" }}>
                              <input
                                type="checkbox"
                                checked={item.isChecked}
                                onChange={() => handleTaskToggle(b.id, i)}
                                style={{ marginTop: "4px", accentColor: "hsl(26 100% 52%)", cursor: "pointer" }}
                              />
                              <span
                                contentEditable={Boolean(onContentChange)}
                                suppressContentEditableWarning
                                onBlur={(e) => handleListItemBlur(b.id, i, e.currentTarget.textContent || "")}
                                style={{ outline: "none", cursor: "text" }}
                                dangerouslySetInnerHTML={{ __html: formatInline(item.text) }}
                              />
                            </li>
                          );
                        }
                        return (
                          <li
                            key={i}
                            style={{ color: "var(--color-text-secondary)", marginBottom: "4px" }}
                          >
                            <span
                              contentEditable={Boolean(onContentChange)}
                              suppressContentEditableWarning
                              onBlur={(e) => handleListItemBlur(b.id, i, e.currentTarget.textContent || "")}
                              style={{ outline: "none", cursor: "text" }}
                              dangerouslySetInnerHTML={{ __html: formatInline(item.text) }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                // ── 7. Cards ──
                if (b.type === "cards") {
                  return (
                    <div key={b.id} className="admin-preview-cards-grid not-prose">
                      {(b.cards || []).map((c, cIdx) => (
                        <div key={cIdx} className="admin-preview-card">
                          <div>
                            <div className="admin-preview-card-top">
                              <span className="admin-preview-card-title">{c.title}</span>
                              <ArrowRight size={14} style={{ color: "var(--color-text-tertiary)" }} />
                            </div>
                            {c.body && <p className="admin-preview-card-desc">{c.body}</p>}
                          </div>
                          {c.href && <span className="admin-preview-card-link">{c.href}</span>}
                        </div>
                      ))}
                    </div>
                  );
                }

                // ── 8. Image ──
                if (b.type === "image") {
                  return (
                    <figure key={b.id} style={{ margin: "20px 0" }} className="not-prose">
                      <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid var(--glass-border)", background: "hsl(220 22% 7%)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                        <img src={b.url} alt={b.alt} style={{ width: "100%", height: "auto", display: "block" }} loading="lazy" />
                      </div>
                      {b.alt && (
                        <figcaption style={{ textAlign: "center", fontSize: "0.74rem", color: "var(--color-text-tertiary)", marginTop: "8px", fontWeight: 500 }}>
                          {b.alt}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                // ── 9. Video ──
                if (b.type === "video") {
                  const isYouTube = (b.src || "").includes("youtube.com") || (b.src || "").includes("youtu.be");
                  return (
                    <div key={b.id} style={{ margin: "20px 0", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.6)" }} className="not-prose">
                      {isYouTube ? (
                        <iframe
                          src={b.src}
                          style={{ width: "100%", aspectRatio: "16/9", border: "none" }}
                          allowFullScreen
                          title={b.title || "Video Player"}
                        />
                      ) : (
                        <video src={b.src} controls style={{ width: "100%", aspectRatio: "16/9", display: "block" }} />
                      )}
                      <div style={{ padding: "10px 14px", background: "hsl(220 22% 9%)", fontSize: "0.74rem", color: "var(--color-text-secondary)", fontWeight: 600, borderTop: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Play size={12} style={{ color: "hsl(26 100% 55%)" }} />
                        <span>{b.title || "Video Player"}</span>
                      </div>
                    </div>
                  );
                }

                // ── 10. Horizontal Rule ──
                if (b.type === "hr") {
                  return <hr key={b.id} style={{ margin: "28px 0", border: "none", borderTop: "1px solid var(--glass-border)" }} />;
                }

                return null;
              })
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
