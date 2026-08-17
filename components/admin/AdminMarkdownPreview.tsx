"use client";

import React, { useMemo } from "react";
import {
  FileText,
  Calendar,
  User,
  Tag,
  Info,
  AlertTriangle,
  Flame,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface AdminMarkdownPreviewProps {
  rawContent: string;
  slug?: string;
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

/**
 * Lightweight client-side Markdown to React Elements converter
 */
export function AdminMarkdownPreview({ rawContent, slug }: AdminMarkdownPreviewProps) {
  const { meta, body } = useMemo(() => parseFrontmatter(rawContent), [rawContent]);

  const renderedElements = useMemo(() => {
    if (!body.trim()) {
      return (
        <div className="admin-preview-empty">
          <FileText size={32} className="text-[var(--color-text-tertiary)] mb-2" />
          <p>Documentul este gol. Introdu conținut în tab-ul Markdown.</p>
        </div>
      );
    }

    const lines = body.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];
    let listBuffer: string[] = [];
    let keyIdx = 0;

    const flushList = () => {
      if (listBuffer.length > 0) {
        elements.push(
          <ul key={`list-${keyIdx++}`} className="admin-preview-list">
            {listBuffer.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        );
        listBuffer = [];
      }
    };

    const formatInline = (text: string) => {
      let formatted = text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="admin-preview-inline-code">$1</code>')
        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer" class="admin-preview-link">$1</a>'
        );
      return formatted;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code Block Start/End
      if (line.trim().startsWith("```")) {
        if (!inCodeBlock) {
          flushList();
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim() || "text";
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <div key={`code-${keyIdx++}`} className="admin-preview-codeblock">
              <div className="admin-preview-code-header">
                <span>{codeLanguage}</span>
              </div>
              <pre>
                <code>{codeBuffer.join("\n")}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Headings
      if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1 key={`h1-${keyIdx++}`} className="admin-preview-h1">
            {line.slice(2)}
          </h1>
        );
        continue;
      }
      if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={`h2-${keyIdx++}`} className="admin-preview-h2">
            {line.slice(3)}
          </h2>
        );
        continue;
      }
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={`h3-${keyIdx++}`} className="admin-preview-h3">
            {line.slice(4)}
          </h3>
        );
        continue;
      }

      // Callout Alerts (> [!NOTE], etc.)
      if (line.startsWith("> [!")) {
        flushList();
        const alertTypeMatch = line.match(/^>\s*\[!([A-Z]+)\]/i);
        const type = alertTypeMatch ? alertTypeMatch[1].toUpperCase() : "NOTE";
        const alertLines: string[] = [];

        // Collect following quote lines
        while (i + 1 < lines.length && lines[i + 1].startsWith(">")) {
          i++;
          alertLines.push(lines[i].replace(/^>\s?/, ""));
        }

        elements.push(
          <div key={`alert-${keyIdx++}`} className={`admin-preview-alert admin-preview-alert--${type.toLowerCase()}`}>
            <div className="admin-preview-alert-header">
              {type === "NOTE" && <Info size={14} className="text-blue-400" />}
              {type === "TIP" && <CheckCircle2 size={14} className="text-emerald-400" />}
              {type === "WARNING" && <AlertTriangle size={14} className="text-amber-400" />}
              {type === "IMPORTANT" && <Flame size={14} className="text-orange-500" />}
              {type === "CAUTION" && <AlertTriangle size={14} className="text-red-400" />}
              <span className="font-bold text-xs uppercase tracking-wider">{type}</span>
            </div>
            <div
              className="admin-preview-alert-content"
              dangerouslySetInnerHTML={{ __html: formatInline(alertLines.join(" ")) }}
            />
          </div>
        );
        continue;
      }

      // Unordered Lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        listBuffer.push(line.trim().slice(2));
        continue;
      }

      // Horizontal Rules
      if (line.trim() === "---" || line.trim() === "***") {
        flushList();
        elements.push(<hr key={`hr-${keyIdx++}`} className="admin-preview-hr" />);
        continue;
      }

      // Regular Paragraphs
      if (line.trim()) {
        flushList();
        elements.push(
          <p
            key={`p-${keyIdx++}`}
            className="admin-preview-p"
            dangerouslySetInnerHTML={{ __html: formatInline(line) }}
          />
        );
      }
    }

    flushList();
    return elements;
  }, [body]);

  return (
    <div className="admin-preview-container">
      {/* Frontmatter Metadata Pill Header */}
      {Object.keys(meta).length > 0 && (
        <div className="admin-preview-meta-card">
          <div className="admin-preview-meta-title-row">
            <span className="admin-preview-meta-badge">FRONTMATTER CONFIG</span>
            {slug && (
              <span className="admin-preview-meta-slug">
                /docs/{slug.replace(/^\/+/, "")}
              </span>
            )}
          </div>

          <div className="admin-preview-meta-grid">
            {meta.title && (
              <div className="admin-meta-item">
                <span className="admin-meta-label">Titlu:</span>
                <span className="admin-meta-val font-semibold">{meta.title}</span>
              </div>
            )}
            {meta.description && (
              <div className="admin-meta-item">
                <span className="admin-meta-label">Descriere:</span>
                <span className="admin-meta-val">{meta.description}</span>
              </div>
            )}
            {meta.author && (
              <div className="admin-meta-item">
                <span className="admin-meta-label">Autor:</span>
                <span className="admin-meta-val flex items-center gap-1">
                  <User size={12} /> {meta.author}
                </span>
              </div>
            )}
            {meta.tags && Array.isArray(meta.tags) && (
              <div className="admin-meta-item">
                <span className="admin-meta-label">Tag-uri:</span>
                <div className="flex flex-wrap gap-1">
                  {meta.tags.map((t: string, i: number) => (
                    <span key={i} className="admin-meta-tag">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rendered Markdown Body */}
      <div className="admin-preview-rendered-body">{renderedElements}</div>
    </div>
  );
}
