import React from "react";
import {
  BookOpen,
  Layers,
  Terminal,
  Rocket,
  Sliders,
  Package,
  Cloud,
  Sparkles,
  Code2,
  GitBranch,
  Search,
  Webhook,
  Database,
  FileText,
  Compass,
} from "lucide-react";

export type ColorVariant = "orange" | "yellow" | "purple" | "teal" | "blue" | "green" | "red";

/**
 * Returns a dynamic color accent variant for a given doc route
 */
export function getDocColorVariant(slug: string, title: string): ColorVariant {
  const s = (slug || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (s.includes("deploy") || t.includes("deployment")) return "red";
  if (s.includes("config") || t.includes("configuration")) return "yellow";
  if (s.includes("schema") || s.includes("database") || s.includes("db")) return "green";
  if (s.includes("webhook") || s.includes("api-reference") || t.includes("api") || t.includes("webhook")) return "blue";
  if (s.includes("github") || s.includes("git") || s.includes("search")) return "teal";
  if (s.includes("feature") || s.includes("component") || s.includes("mdx")) return "purple";
  if (s.includes("getting-started") || s.includes("install") || t.includes("getting started") || t.includes("install")) return "orange";

  return "orange";
}

/**
 * Returns a dedicated Lucide icon component based on route slug and title
 */
export function getDocIcon(slug: string, title: string, size: number = 14): React.ReactNode {
  const s = (slug || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if ((s.includes("getting-started") && !s.includes("/")) || t === "getting started") {
    return <Rocket size={size} aria-hidden="true" />;
  }
  if (s.includes("config") || t.includes("configuration")) {
    return <Sliders size={size} aria-hidden="true" />;
  }
  if (s.includes("install") || t.includes("installation")) {
    return <Package size={size} aria-hidden="true" />;
  }
  if (s.includes("deploy") || t.includes("deployment")) {
    return <Cloud size={size} aria-hidden="true" />;
  }
  if (s === "features" || t === "features overview" || t === "core features") {
    return <Sparkles size={size} aria-hidden="true" />;
  }
  if (s.includes("component") || s.includes("mdx")) {
    return <Code2 size={size} aria-hidden="true" />;
  }
  if (s.includes("github") || s.includes("git")) {
    return <GitBranch size={size} aria-hidden="true" />;
  }
  if (s.includes("search")) {
    return <Search size={size} aria-hidden="true" />;
  }
  if (s === "api-reference" || t === "api reference") {
    return <Terminal size={size} aria-hidden="true" />;
  }
  if (s.includes("webhook") || t.includes("webhook")) {
    return <Webhook size={size} aria-hidden="true" />;
  }
  if (s.includes("schema") || s.includes("database") || s.includes("db")) {
    return <Database size={size} aria-hidden="true" />;
  }
  if (s === "" || s === "docs" || t.includes("hub") || t.includes("overview")) {
    return <Compass size={size} aria-hidden="true" />;
  }

  return <FileText size={size} aria-hidden="true" />;
}

/**
 * Returns an icon for a top-level category name
 */
export function getCategoryIcon(category: string, size: number = 12): React.ReactNode {
  const c = (category || "").toLowerCase();

  if (c.includes("getting started")) return <BookOpen size={size} aria-hidden="true" />;
  if (c.includes("feature")) return <Layers size={size} aria-hidden="true" />;
  if (c.includes("api")) return <Terminal size={size} aria-hidden="true" />;

  return <FileText size={size} aria-hidden="true" />;
}
