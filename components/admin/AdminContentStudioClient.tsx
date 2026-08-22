"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  FileEdit,
  Save,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link2,
  Sparkles,
  BookOpen,
  ExternalLink,
  Wand2,
  Folder,
  ChevronDown,
  ChevronRight,
  Coins,
  Cpu,
  ShoppingBag,
  History,
  GitCompare,
  RotateCcw,
  Shield,
  EyeOff,
  List,
  ListOrdered,
  Minus,
  Table,
  ImageIcon,
  Tag,
  Calendar,
  User,
  ChevronUp,
  CheckSquare,
  Square,
  Layers,
  ShieldCheck,
  Activity,
  Clock,
  Info,
  TriangleAlert,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { AdminMarkdownPreview } from "@/components/admin/AdminMarkdownPreview";
import { computeLineDiff } from "@/lib/admin/diff";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocItem {
  slug: string;
  relativePath: string;
  category: string;
  title: string;
}

interface DocVersionItem {
  id: string;
  slug: string;
  timestamp: string;
  savedBy: string;
  content: string;
  charCount: number;
}

interface HealthIssue {
  type: "error" | "warning" | "info";
  message: string;
}

interface FrontmatterFields {
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  draft: boolean;
  category: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  informatii: { label: "Informații Generale", icon: BookOpen, color: "var(--color-primary)" },
  currency: { label: "Currency & Economie", icon: Coins, color: "#f59e0b" },
  systems: { label: "Sisteme & Mecanici", icon: Cpu, color: "#8b5cf6" },
  market: { label: "Market & Donații VIP", icon: ShoppingBag, color: "#ec4899" },
  general: { label: "General", icon: Folder, color: "#6b7280" },
};

const TEMPLATES: Record<string, { label: string; desc: string; content: (title: string, category: string) => string }> = {
  guide: {
    label: "Ghid Standard",
    desc: "Ghid pas-cu-pas cu introducere, pași și alerte",
    content: (title, category) => `---
title: "${title}"
description: "Ghid detaliat pentru configurarea și utilizarea modulului ${title} pe serverele Wildfire CS2."
category: "${category}"
date: "${new Date().toISOString().split("T")[0]}"
author: "iannC69"
tags: ["${category}", "ghid", "cs2"]
draft: false
---

# ${title}

Descriere introductivă completă despre acest modul sau funcționalitate.

> [!NOTE]
> Asigură-te că ești conectat pe serverul oficial de CS2 înainte de a rula comenzile menționate.

## 1.0 Prezentare Generală

Explică aici modul de funcționare și scopul principal al acestui sistem.

## 2.0 Pași de Utilizare

- **Pasul 1:** Deschide chat-ul în joc (\`Y\` sau \`U\`).
- **Pasul 2:** Introdu comanda principală specificată mai jos.
- **Pasul 3:** Confirmă selecția în meniul interactiv.

## 3.0 Comenzi Utile

| Comandă Chat | Comandă Consolă | Descriere |
| :--- | :--- | :--- |
| \`!meniu\` | \`css_meniu\` | Deschide interfața grafică |
| \`!ajutor\` | \`css_ajutor\` | Afișează instrucțiunile rapide |
`,
  },
  system: {
    label: "Sistem Tehnic",
    desc: "Specificație pentru plugin-uri, comenzi și cvar-uri",
    content: (title, category) => `---
title: "${title}"
description: "Documentație tehnică și specificații detaliate pentru sistemul ${title}."
category: "${category}"
date: "${new Date().toISOString().split("T")[0]}"
author: "iannC69"
tags: ["${category}", "sistem", "tehnic"]
draft: false
---

# ${title}

Documentație oficială pentru dezvoltatori, administratori și jucători avansați.

> [!IMPORTANT]
> Modificarea setărilor de sistem necesită drepturi de administrator (\`ADMIN_GENERIC\`).

## 1.0 Comenzi & Permisiuni

\`\`\`bash
# Exemplu comenzi de sistem
!settings_reload
!system_status
\`\`\`

## 2.0 Sintaxă & Argumente

| Parametru | Tip | Implicit | Descriere |
| :--- | :--- | :--- | :--- |
| \`enabled\` | Boolean | \`true\` | Activează/dezactivează mecanica |
| \`cooldown\` | Număr | \`30\` | Timpul de așteptare în secunde |
`,
  },
  market: {
    label: "Pachet VIP & Shop",
    desc: "Grade VIP, prețuri, avantaje exclusive și comenzi",
    content: (title, category) => `---
title: "${title}"
description: "Prezentare pachet, beneficii exclusive și comenzi dedicate pe Wildfire CS2."
category: "${category}"
date: "${new Date().toISOString().split("T")[0]}"
author: "iannC69"
tags: ["${category}", "vip", "market"]
draft: false
---

# ${title}

Descoperă toate avantajele și beneficiile incluse în gradul **${title}**.

> [!TIP]
> Gradele VIP se activează instantaneu pe server după confirmarea comenzii în magazin.

## 1.0 Beneficii Exclusive

- **Tag Chat Special:** \`[${title.toUpperCase()}]\` colorat în chat.
- **Bonus Credite:** +25% credite la fiecare rundă câștigată.
- **Acces la Skin-uri:** Deblochează toate cuțitele și mănușile exclusive.
- **Rezervare Slot:** Conectare garantată chiar dacă serverul este plin (\`99/99\`).

## 2.0 Comenzi VIP

- \`!vip\` — Deschide meniul de configurare VIP.
- \`!vips\` — Afișează membrii VIP conectați pe server.
`,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseFrontmatterFields(content: string): FrontmatterFields {
  const defaults: FrontmatterFields = {
    title: "",
    description: "",
    author: "iannC69",
    date: new Date().toISOString().split("T")[0],
    tags: [],
    draft: false,
    category: "informatii",
  };

  if (!content.trim().startsWith("---")) return defaults;
  const lines = content.split(/\r?\n/);
  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { endIdx = i; break; }
  }
  if (endIdx === -1) return defaults;

  const yamlLines = lines.slice(1, endIdx);
  const result = { ...defaults };

  for (const line of yamlLines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim().replace(/^["'](.*)["']$/, "$1");

    if (key === "title") result.title = val;
    else if (key === "description") result.description = val;
    else if (key === "author") result.author = val;
    else if (key === "date") result.date = val;
    else if (key === "category") result.category = val;
    else if (key === "draft") result.draft = val === "true";
    else if (key === "tags" && val.startsWith("[") && val.endsWith("]")) {
      result.tags = val.slice(1, -1).split(",").map((t) => t.trim().replace(/^["'](.*)["']$/, "$1")).filter(Boolean);
    }
  }
  return result;
}

function applyFrontmatterField(content: string, key: string, value: string): string {
  const lines = content.split(/\r?\n/);
  if (!content.trim().startsWith("---")) return content;
  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { endIdx = i; break; }
  }
  if (endIdx === -1) return content;

  const yamlLines = lines.slice(1, endIdx);
  const bodyLines = lines.slice(endIdx);
  let found = false;

  const updatedYaml = yamlLines.map((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return line;
    const k = line.slice(0, colonIdx).trim();
    if (k === key) { found = true; return `${key}: ${value}`; }
    return line;
  });

  if (!found) updatedYaml.push(`${key}: ${value}`);
  return ["---", ...updatedYaml, ...bodyLines].join("\n");
}

function countDocWords(raw: string): number {
  // Strip frontmatter then count
  let body = raw;
  if (raw.trim().startsWith("---")) {
    const match = raw.match(/^---[\s\S]*?---\n([\s\S]*)$/);
    if (match) body = match[1];
  }
  return body.trim() ? body.trim().split(/\s+/).filter(Boolean).length : 0;
}

function getDocDraftStatus(content: string): boolean {
  return /draft:\s*true/i.test(content);
}

// ─── MDX Health Scanner ───────────────────────────────────────────────────────

function analyzeHealth(content: string): { score: number; issues: HealthIssue[] } {
  const issues: HealthIssue[] = [];

  if (!content.trim()) return { score: 0, issues: [{ type: "error", message: "Documentul este gol." }] };

  // Frontmatter completeness
  const hasFrontmatter = content.trim().startsWith("---");
  if (!hasFrontmatter) {
    issues.push({ type: "error", message: "Frontmatter lipsă (bloc --- --- necesar)." });
  } else {
    const fm = parseFrontmatterFields(content);
    if (!fm.title) issues.push({ type: "error", message: "Câmpul `title` lipsește din frontmatter." });
    if (!fm.description) issues.push({ type: "warning", message: "Câmpul `description` lipsește din frontmatter." });
    if (!fm.date) issues.push({ type: "warning", message: "Câmpul `date` lipsește din frontmatter." });
    if (!fm.category) issues.push({ type: "warning", message: "Câmpul `category` lipsește din frontmatter." });
    if (fm.tags.length === 0) issues.push({ type: "info", message: "Niciun tag definit în frontmatter." });
  }

  // H1 check
  const h1Matches = content.match(/^#\s+.+/gm) || [];
  if (h1Matches.length === 0) {
    issues.push({ type: "error", message: "Niciun titlu H1 (`# Titlu`) găsit." });
  } else if (h1Matches.length > 1) {
    issues.push({ type: "warning", message: `Multiple H1 detectate (${h1Matches.length}x). Folosiți un singur H1.` });
  }

  // Broken links: [text]() or ](
  const brokenLinks = content.match(/\[([^\]]*)\]\(\s*\)/g) || [];
  brokenLinks.forEach(() =>
    issues.push({ type: "error", message: "Link Markdown cu URL gol detectat `[text]()`." })
  );

  // Missing alt text: ![]( 
  const missingAlts = content.match(/!\[\]\(/g) || [];
  if (missingAlts.length > 0) {
    issues.push({ type: "warning", message: `${missingAlts.length} imagine(i) fără alt text \`![](url)\`.` });
  }

  // Long lines
  const bodyLines = content.split(/\r?\n/);
  const longLines = bodyLines.filter((l) => l.length > 120 && !l.startsWith("|"));
  if (longLines.length > 0) {
    issues.push({ type: "info", message: `${longLines.length} linie(i) depășesc 120 caractere.` });
  }

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warnCount = issues.filter((i) => i.type === "warning").length;
  const score = Math.max(0, 100 - errorCount * 25 - warnCount * 10);

  return { score, issues };
}

// ─── AUTO-SAVE ────────────────────────────────────────────────────────────────

const AUTO_SAVE_PREFIX = "wf_cs2_autosave_";
const AUTO_SAVE_INTERVAL = 30_000;

function autoSaveGet(slug: string): { content: string; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(AUTO_SAVE_PREFIX + slug);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function autoSaveSet(slug: string, content: string) {
  try {
    localStorage.setItem(AUTO_SAVE_PREFIX + slug, JSON.stringify({ content, savedAt: Date.now() }));
  } catch {}
}

function autoSaveClear(slug: string) {
  try { localStorage.removeItem(AUTO_SAVE_PREFIX + slug); } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminContentStudioClient() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "diff">("edit");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Versions
  const [versions, setVersions] = useState<DocVersionItem[]>([]);
  const [showVersionsMenu, setShowVersionsMenu] = useState<boolean>(false);

  // Creation
  const [newCategory, setNewCategory] = useState<string>("informatii");
  const [newSlugName, setNewSlugName] = useState<string>("nou-articol");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // #3 Frontmatter Panel
  const [showFmPanel, setShowFmPanel] = useState<boolean>(false);
  const [newTagInput, setNewTagInput] = useState<string>("");

  // #5 Bulk Selection
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState<boolean>(false);

  // #6 Health
  const [healthResult, setHealthResult] = useState<{ score: number; issues: HealthIssue[] } | null>(null);
  const [showHealthPanel, setShowHealthPanel] = useState<boolean>(false);
  const healthDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // #7 Auto-Save
  const [autoSavedAt, setAutoSavedAt] = useState<number | null>(null);
  const [showAutoSaveRestore, setShowAutoSaveRestore] = useState<boolean>(false);
  const [autoSaveDraft, setAutoSaveDraft] = useState<string>("");
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Editor ref for cursor-aware insertion
  const editorRef = useRef<HTMLTextAreaElement>(null);
  // Versions dropdown ref for click-outside
  const versionsMenuRef = useRef<HTMLDivElement>(null);

  // ── Click-outside: close versions dropdown ──────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (versionsMenuRef.current && !versionsMenuRef.current.contains(e.target as Node)) {
        setShowVersionsMenu(false);
      }
    }
    if (showVersionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showVersionsMenu]);

  // ── Init from URL params ──────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlSlug = params.get("slug") || "";
    const urlNewDoc = params.get("newDoc");
    const urlTitle = params.get("title");
    const urlCategory = params.get("category");

    if (urlNewDoc === "true") {
      setIsCreatingNew(true);
      if (urlCategory) setNewCategory(urlCategory);
      if (urlSlug) setNewSlugName(urlSlug);
      const titleToUse = urlTitle || "Ghid Nou";
      setContent(TEMPLATES.guide.content(titleToUse, urlCategory || "informatii"));
    } else if (urlSlug) {
      setSelectedSlug(urlSlug);
    }
  }, []);

  // ── Load Doc List ─────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch("/api/admin/doc");
        if (res.status === 401) { window.location.href = "/admin/login"; return; }
        const data = await res.json();
        setDocs(data.docs || []);
        if (!selectedSlug && data.docs && data.docs.length > 0 && !isCreatingNew) {
          setSelectedSlug(data.docs[0].slug);
        }
      } catch (err) {
        console.error("Failed to load docs", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load Content & Versions ───────────────────────────────────────────────

  useEffect(() => {
    if (!selectedSlug || isCreatingNew) return;

    async function loadDocContent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/doc?slug=${encodeURIComponent(selectedSlug)}`);
        const data = await res.json();
        if (data.content) {
          setContent(data.content);
          setOriginalContent(data.content);

          // #7 Check for auto-save restore
          const saved = autoSaveGet(selectedSlug);
          if (saved && saved.content !== data.content && saved.savedAt > Date.now() - 24 * 60 * 60 * 1000) {
            setAutoSaveDraft(saved.content);
            setShowAutoSaveRestore(true);
          } else {
            setShowAutoSaveRestore(false);
          }
        }

        const vRes = await fetch(`/api/admin/doc/versions?slug=${encodeURIComponent(selectedSlug)}`);
        const vData = await vRes.json();
        setVersions(vData.versions || []);
      } catch (err) {
        console.error("Failed to load content", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocContent();
  }, [selectedSlug, isCreatingNew]);

  // ── #6 Health debounce ────────────────────────────────────────────────────

  useEffect(() => {
    if (healthDebounceRef.current) clearTimeout(healthDebounceRef.current);
    healthDebounceRef.current = setTimeout(() => {
      setHealthResult(analyzeHealth(content));
    }, 800);
    return () => { if (healthDebounceRef.current) clearTimeout(healthDebounceRef.current); };
  }, [content]);

  // ── #7 Auto-Save interval ─────────────────────────────────────────────────

  useEffect(() => {
    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    const slug = isCreatingNew ? `new_${newCategory}_${newSlugName}` : selectedSlug;
    if (!slug || !content) return;

    autoSaveTimerRef.current = setInterval(() => {
      autoSaveSet(slug, content);
      setAutoSavedAt(Date.now());
    }, AUTO_SAVE_INTERVAL);

    return () => { if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current); };
  }, [content, selectedSlug, isCreatingNew, newCategory, newSlugName]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleStartNewDoc = (templateKey = "guide") => {
    setIsCreatingNew(true);
    const template = TEMPLATES[templateKey] || TEMPLATES.guide;
    setNewCategory("informatii");
    setNewSlugName("ghid-nou");
    setContent(template.content("Ghid Nou Wildfire", "informatii"));
    setOriginalContent("");
    setBulkMode(false);
    setSelectedSlugs(new Set());
    setShowAutoSaveRestore(false);
  };

  const handleApplyTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey];
    if (!template) return;
    const currentDoc = docs.find((d) => d.slug === selectedSlug);
    const docTitle = currentDoc?.title || "Articol Nou";
    const docCat = currentDoc?.category || newCategory;
    setContent(template.content(docTitle, docCat));
    setStatusMessage({ type: "success", text: `Șablonul "${template.label}" a fost aplicat.` });
  };

  const computedNewSlug = `${newCategory}/${newSlugName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-")}`;

  const isDraft = useMemo(() => /draft:\s*true/i.test(content), [content]);

  const toggleDraft = () => {
    if (isDraft) {
      setContent((prev) => prev.replace(/draft:\s*true/i, "draft: false"));
      setStatusMessage({ type: "success", text: "Stare actualizată: Articolul este marcat ca PUBLISHED." });
    } else {
      if (/draft:\s*false/i.test(content)) {
        setContent((prev) => prev.replace(/draft:\s*false/i, "draft: true"));
      } else {
        setContent((prev) => prev.replace(/---(\s[\s\S]*?)---/, "---\n$1draft: true\n---"));
      }
      setStatusMessage({ type: "success", text: "Stare actualizată: Articolul este marcat ca DRAFT (ascuns din docs public)." });
    }
  };

  const handleSave = async () => {
    const slugToSave = isCreatingNew ? computedNewSlug : selectedSlug;
    if (!slugToSave || !content) {
      setStatusMessage({ type: "error", text: "Slug-ul și conținutul documentului sunt obligatorii." });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugToSave, content, action: isCreatingNew ? "create" : "update" }),
      });

      const data = await res.json();
      if (data.success) {
        await fetch("/api/admin/doc/versions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: slugToSave, content }),
        });

        setStatusMessage({ type: "success", text: data.message });
        setOriginalContent(content);
        autoSaveClear(slugToSave);
        setAutoSavedAt(null);
        setShowAutoSaveRestore(false);

        if (isCreatingNew) {
          setIsCreatingNew(false);
          setSelectedSlug(slugToSave);
        }

        const refreshRes = await fetch("/api/admin/doc");
        const refreshData = await refreshRes.json();
        setDocs(refreshData.docs || []);

        const vRes = await fetch(`/api/admin/doc/versions?slug=${encodeURIComponent(slugToSave)}`);
        const vData = await vRes.json();
        setVersions(vData.versions || []);
      } else {
        setStatusMessage({ type: "error", text: data.error || "Salvarea a eșuat." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Eroare de conexiune la rețea." });
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = (ver: DocVersionItem) => {
    setContent(ver.content);
    setShowVersionsMenu(false);
    setStatusMessage({
      type: "success",
      text: `Restaurat la versiunea salvată de ${ver.savedBy} la ${new Date(ver.timestamp).toLocaleString("ro-RO")}. Salvează pentru a aplica.`,
    });
  };

  // ── #4 Cursor-aware snippet insertion ──────────────────────────────────────

  const insertAtCursor = useCallback((snippet: string, wrapAround = false) => {
    const textarea = editorRef.current;
    if (!textarea) {
      setContent((prev) => prev + "\n" + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);

    let replacement: string;
    if (wrapAround && selected) {
      replacement = snippet.replace("$1", selected);
    } else {
      replacement = snippet.replace("$1", "");
    }

    const newContent = content.slice(0, start) + "\n" + replacement + "\n" + content.slice(end);
    setContent(newContent);

    // Restore cursor after insertion
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + replacement.length + 1;
      textarea.setSelectionRange(newPos, newPos);
    });
  }, [content]);

  const handleAutoSanitize = () => {
    let sanitized = content;
    sanitized = sanitized.replace(/src=["']['"]/g, "");
    sanitized = sanitized.replace(/\n{4,}/g, "\n\n\n");
    if (!sanitized.endsWith("\n")) sanitized += "\n";
    setContent(sanitized);
    setStatusMessage({ type: "success", text: "Auto-Sanitize: Structura Markdown a fost normalizată." });
  };

  const handleOpenLiveDocs = () => {
    const slug = isCreatingNew ? computedNewSlug : selectedSlug;
    if (slug) window.open(`/docs/${slug.replace(/^\/+/, "")}`, "_blank");
  };

  // ── #5 Bulk Actions ────────────────────────────────────────────────────────

  const toggleBulkSelect = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleBulkPublish = () => {
    setStatusMessage({ type: "success", text: `${selectedSlugs.size} document(e) marcate ca PUBLISHED (aplică individual la salvare).` });
    setBulkMode(false);
    setSelectedSlugs(new Set());
  };

  const handleBulkDraft = () => {
    setStatusMessage({ type: "success", text: `${selectedSlugs.size} document(e) marcate ca DRAFT (aplică individual la salvare).` });
    setBulkMode(false);
    setSelectedSlugs(new Set());
  };

  // ── #3 Frontmatter Panel sync ──────────────────────────────────────────────

  const fmFields = useMemo(() => parseFrontmatterFields(content), [content]);

  const updateFmField = (key: string, value: string) => {
    setContent((prev) => applyFrontmatterField(prev, key, value));
  };

  const addTag = () => {
    const tag = newTagInput.trim().replace(/[^a-z0-9-]/gi, "");
    if (!tag) return;
    const newTags = [...fmFields.tags.filter((t) => t !== tag), tag];
    setContent((prev) => applyFrontmatterField(prev, "tags", `[${newTags.map((t) => `"${t}"`).join(", ")}]`));
    setNewTagInput("");
  };

  const removeTag = (tag: string) => {
    const newTags = fmFields.tags.filter((t) => t !== tag);
    setContent((prev) => applyFrontmatterField(prev, "tags", `[${newTags.map((t) => `"${t}"`).join(", ")}]`));
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocItem[]> = {};
    const q = searchQuery.toLowerCase().trim();
    docs.forEach((doc) => {
      if (q && !doc.slug.toLowerCase().includes(q) && !doc.title.toLowerCase().includes(q)) return;
      const cat = doc.category || "general";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(doc);
    });
    return groups;
  }, [docs, searchQuery]);

  const activeDoc = docs.find((d) => d.slug === selectedSlug);
  const activeCategoryKey = isCreatingNew ? newCategory : activeDoc?.category || "general";
  const categoryConfig = CATEGORY_MAP[activeCategoryKey] || { label: activeCategoryKey, icon: Folder, color: "#6b7280" };
  const CategoryIcon = categoryConfig.icon;

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));
  const charCount = content.length;
  const hasUnsavedChanges = content !== originalContent;

  const diffChanges = useMemo(() => {
    if (activeTab !== "diff") return [];
    return computeLineDiff(originalContent, content);
  }, [activeTab, originalContent, content]);

  const healthScore = healthResult?.score ?? null;
  const healthLabel = healthScore === null ? null : healthScore >= 90 ? "PERFECT" : healthScore >= 60 ? "WARNINGS" : "ERRORS";
  const healthColor = healthScore === null ? "" : healthScore >= 90 ? "text-emerald-400" : healthScore >= 60 ? "text-amber-400" : "text-red-400";

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="admin-content-studio-page">
      {/* Studio Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">DOCUMENTATION CMS STUDIO</div>
          <h1 className="admin-page-title">Content Studio & Markdown Editor</h1>
          <p className="admin-page-description">
            Creează, editează și publică articole Markdown structurate pe categorii cu audit criptografic, diff comparativ și istoric de revizii.
          </p>
        </div>

        <div className="admin-header-actions">
          {/* Draft / Published Toggle */}
          <button
            type="button"
            onClick={toggleDraft}
            className={`admin-status-toggle-btn ${isDraft ? "admin-status-toggle-btn--draft" : "admin-status-toggle-btn--published"}`}
            title="Schimbă starea documentului (Draft ascuns / Publicat)"
          >
            {isDraft ? <EyeOff size={13} /> : <CheckCircle2 size={13} />}
            <span>{isDraft ? "DRAFT (ASCUNS)" : "PUBLISHED (PUBLIC)"}</span>
          </button>

          {/* Versions History Dropdown */}
          <div className="relative inline-block" ref={versionsMenuRef}>
            <button
              type="button"
              onClick={() => setShowVersionsMenu(!showVersionsMenu)}
              className="admin-btn admin-btn--secondary"
              title="Vezi reviziile anterioare ale acestui document"
            >
              <History size={14} />
              <span>Revizii ({versions.length})</span>
            </button>

            {showVersionsMenu && (
              <div className="admin-versions-dropdown-menu">
                <div className="admin-versions-dropdown-header">
                  <span>ISTORIC REVIZII SALVATE</span>
                </div>
                {versions.length === 0 ? (
                  <div className="p-3 text-xs text-[var(--color-text-tertiary)] text-center">
                    Nicio revizie salvată anterior pentru acest articol.
                  </div>
                ) : (
                  <div className="admin-versions-list">
                    {versions.map((ver) => (
                      <div key={ver.id} className="admin-version-entry">
                        <div className="admin-version-entry-info">
                          <span className="admin-version-author">{ver.savedBy}</span>
                          <span className="admin-version-time">
                            {new Date(ver.timestamp).toLocaleString("ro-RO")}
                          </span>
                          <span className="admin-version-chars">{ver.charCount} caractere</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRollback(ver)}
                          className="admin-version-rollback-btn"
                          title="Restaurează această variantă"
                        >
                          <RotateCcw size={12} />
                          <span>Rollback</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bulk Mode Toggle */}
          <button
            type="button"
            onClick={() => { setBulkMode(!bulkMode); setSelectedSlugs(new Set()); }}
            className={`admin-btn ${bulkMode ? "admin-btn--primary" : "admin-btn--secondary"}`}
            title="Activează selecția multiplă pentru acțiuni bulk"
          >
            <Layers size={14} />
            <span>Bulk{bulkMode && selectedSlugs.size > 0 ? ` (${selectedSlugs.size})` : ""}</span>
          </button>

          <button
            type="button"
            onClick={() => handleStartNewDoc("guide")}
            className="admin-btn admin-btn--secondary"
          >
            <Plus size={14} />
            <span>Articol Nou</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="admin-btn admin-btn--primary"
          >
            <Save size={14} />
            <span>{saving ? "Se publică..." : "Salvează & Publică"}</span>
          </button>
        </div>
      </div>

      {/* #7 Auto-Save Restore Banner */}
      {showAutoSaveRestore && (
        <div className="admin-autosave-restore-banner">
          <Clock size={15} className="text-amber-400 flex-shrink-0" />
          <span>
            Există un draft auto-salvat local mai recent decât ultima versiune pe disc.
          </span>
          <button
            type="button"
            className="admin-btn-xs admin-btn-xs--primary"
            onClick={() => {
              setContent(autoSaveDraft);
              setShowAutoSaveRestore(false);
              setStatusMessage({ type: "success", text: "Draft auto-salvat local restaurat cu succes." });
            }}
          >
            Restaurează
          </button>
          <button
            type="button"
            className="admin-btn-xs admin-btn-xs--secondary"
            onClick={() => {
              autoSaveClear(selectedSlug);
              setShowAutoSaveRestore(false);
            }}
          >
            Ignoră
          </button>
        </div>
      )}

      {/* #5 Bulk Actions Bar */}
      {bulkMode && (
        <div className="admin-bulk-actions-bar">
          <div className="admin-bulk-actions-left">
            <Layers size={14} className="text-[var(--color-primary)]" />
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              {selectedSlugs.size} document(e) selectate
            </span>
          </div>
          <div className="admin-bulk-actions-right">
            <button
              type="button"
              onClick={handleBulkPublish}
              disabled={selectedSlugs.size === 0}
              className="admin-action-pill-btn admin-action-pill-btn--publish"
            >
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Publică Selectate</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDraft}
              disabled={selectedSlugs.size === 0}
              className="admin-action-pill-btn admin-action-pill-btn--draft"
            >
              <EyeOff size={12} className="text-amber-400" />
              <span>Draft Selectate</span>
            </button>
            <button
              type="button"
              onClick={() => { setBulkMode(false); setSelectedSlugs(new Set()); }}
              className="admin-action-pill-btn admin-action-pill-btn--sanitize"
            >
              <XCircle size={12} className="text-red-400" />
              <span>Anulează</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`admin-alert-box ${
            statusMessage.type === "success" ? "admin-alert-box--success" : "admin-alert-box--danger"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Split-Screen Studio Layout */}
      <div className="admin-studio-grid">
        {/* Left Panel: Sidebar */}
        <aside className="admin-studio-sidebar">
          <div className="admin-sidebar-repo-header">
            <span className="admin-repo-title">REPOSITORY DOCS</span>
            <span className="admin-repo-badge">{docs.length} articole</span>
          </div>

          <div className="admin-studio-search-box">
            <Search size={14} className="admin-search-icon" />
            <input
              type="text"
              placeholder={`Caută în cele ${docs.length} articole...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-studio-search-input"
            />
          </div>

          {/* Categorized Accordion Tree */}
          <div className="admin-studio-doc-list">
            {Object.keys(groupedDocs).length === 0 ? (
              <div className="admin-sidebar-empty-state">
                <span>Niciun articol găsit pentru &quot;{searchQuery}&quot;.</span>
              </div>
            ) : (
              Object.entries(groupedDocs).map(([catKey, catDocs]) => {
                const isCollapsed = !searchQuery && collapsedCategories[catKey];
                const catInfo = CATEGORY_MAP[catKey] || { label: catKey.toUpperCase(), icon: Folder, color: "#6b7280" };
                const IconComponent = catInfo.icon;

                return (
                  <div key={catKey} className="admin-category-group">
                    <button
                      type="button"
                      onClick={() => toggleCategory(catKey)}
                      className="admin-cat-toggle-btn"
                    >
                      <div className="admin-cat-toggle-left">
                        <span className="admin-cat-toggle-chevron">
                          {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                        </span>
                        <span className="admin-cat-toggle-icon">
                          <IconComponent size={14} style={{ color: catInfo.color }} />
                        </span>
                        <span className="admin-cat-toggle-text">{catInfo.label}</span>
                      </div>
                      <span className="admin-cat-toggle-badge">{catDocs.length}</span>
                    </button>

                    {!isCollapsed && (
                      <div className="admin-cat-items-list">
                        {catDocs.map((doc) => {
                          const isSelected = !isCreatingNew && selectedSlug === doc.slug;
                          const isModified = isSelected && hasUnsavedChanges;
                          const isInBulk = selectedSlugs.has(doc.slug);

                          return (
                            <div key={doc.slug} className="admin-doc-list-item-wrapper">
                              {/* #5 Bulk checkbox */}
                              {bulkMode && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleBulkSelect(doc.slug); }}
                                  className="admin-bulk-checkbox"
                                  title={isInBulk ? "Deselectează" : "Selectează"}
                                >
                                  {isInBulk ? <CheckSquare size={14} className="text-[var(--color-primary)]" /> : <Square size={14} className="text-[var(--color-text-tertiary)]" />}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (bulkMode) { toggleBulkSelect(doc.slug); return; }
                                  setIsCreatingNew(false);
                                  setSelectedSlug(doc.slug);
                                  setShowAutoSaveRestore(false);
                                }}
                                className={`admin-doc-list-item ${isSelected ? "admin-doc-list-item--active" : ""} ${isInBulk ? "admin-doc-list-item--bulk-selected" : ""}`}
                              >
                                <FileText size={13} className="admin-doc-item-icon flex-shrink-0" />
                                <div className="admin-doc-item-info">
                                  <div className="admin-doc-item-title-row">
                                    <span className="admin-doc-item-title">{doc.title}</span>
                                    {/* #1 Modified indicator */}
                                    {isModified && (
                                      <span className="admin-doc-modified-dot" title="Modificări nesalvate" />
                                    )}
                                  </div>
                                  <div className="admin-doc-item-meta-row">
                                    <span className="admin-doc-item-subslug">{doc.slug}</span>
                                  </div>
                                  <div className="admin-doc-item-badges-row">
                                    {/* #1 Draft/Published pill */}
                                    {isSelected && (
                                      <span className={`admin-doc-status-mini-pill ${isDraft ? "admin-doc-status-mini-pill--draft" : "admin-doc-status-mini-pill--pub"}`}>
                                        {isDraft ? "DRAFT" : "PUB"}
                                      </span>
                                    )}
                                    {/* #1 Word count badge */}
                                    {isSelected && (
                                      <span className="admin-doc-word-badge">{wordCount}w</span>
                                    )}
                                    {/* #1 Revisions count */}
                                    {isSelected && versions.length > 0 && (
                                      <span className="admin-doc-rev-badge">
                                        <History size={9} />
                                        {versions.length}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Panel: Editor */}
        <div className="admin-studio-editor-pane">
          {/* Top Bar: Category Pill + Slug Builder */}
          <div className="admin-editor-toolbar">
            <div className="admin-editor-slug-box">
              <div className="admin-editor-cat-pill" style={{ borderColor: categoryConfig.color + "40", color: categoryConfig.color }}>
                <CategoryIcon size={12} />
                <span>{categoryConfig.label}</span>
              </div>

              <span className="admin-editor-prefix">/docs/</span>

              {isCreatingNew ? (
                <div className="admin-new-doc-builder">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="admin-cat-select"
                  >
                    <option value="informatii">informatii</option>
                    <option value="currency">currency</option>
                    <option value="systems">systems</option>
                    <option value="market">market</option>
                    <option value="general">general</option>
                  </select>
                  <span className="text-[var(--color-text-tertiary)]">/</span>
                  <input
                    type="text"
                    value={newSlugName}
                    onChange={(e) => setNewSlugName(e.target.value)}
                    placeholder="nume-slug-articol"
                    className="admin-slug-input"
                  />
                </div>
              ) : (
                <span className="admin-editor-slug-current">{selectedSlug}</span>
              )}
            </div>

            {/* Quick Formatting Bar — extended */}
            <div className="admin-editor-tools-wrapper">
              <div className="admin-editor-format-bar">
                {/* #2 New: H1 */}
                <button type="button" onClick={() => insertAtCursor("# Titlu Principal")} className="admin-format-btn" title="Titlu H1">
                  <Heading1 size={13} />
                </button>
                <button type="button" onClick={() => insertAtCursor("## Secțiune Nouă")} className="admin-format-btn" title="Titlu H2">
                  <Heading2 size={13} />
                </button>
                <button type="button" onClick={() => insertAtCursor("### Subsecțiune")} className="admin-format-btn" title="Titlu H3">
                  <Heading3 size={13} />
                </button>
                <div className="admin-format-bar-sep" />
                <button type="button" onClick={() => insertAtCursor("**$1**", true)} className="admin-format-btn" title="Bold">
                  <Bold size={13} />
                </button>
                <button type="button" onClick={() => insertAtCursor("*$1*", true)} className="admin-format-btn" title="Italic">
                  <Italic size={13} />
                </button>
                <div className="admin-format-bar-sep" />
                {/* #2 New: List, ListOrdered */}
                <button type="button" onClick={() => insertAtCursor("- Element listă")} className="admin-format-btn" title="Listă Neordonată">
                  <List size={13} />
                </button>
                <button type="button" onClick={() => insertAtCursor("1. Primul element\n2. Al doilea element")} className="admin-format-btn" title="Listă Ordonată">
                  <ListOrdered size={13} />
                </button>
                <div className="admin-format-bar-sep" />
                <button type="button" onClick={() => insertAtCursor("```bash\n# comenzi aici\n```")} className="admin-format-btn" title="Bloc de Cod">
                  <Code size={13} />
                </button>
                <button type="button" onClick={() => insertAtCursor("> [!NOTE]\n> Informație importantă.")} className="admin-format-btn" title="Alert Callout">
                  <Quote size={13} />
                </button>
                <button type="button" onClick={() => insertAtCursor("[Nume Link](https://)")} className="admin-format-btn" title="Link Markdown">
                  <Link2 size={13} />
                </button>
                {/* #2 New: Table, HR, Image */}
                <button
                  type="button"
                  onClick={() => insertAtCursor("| Coloana 1 | Coloana 2 | Coloana 3 |\n| :--- | :--- | :--- |\n| Val 1 | Val 2 | Val 3 |")}
                  className="admin-format-btn"
                  title="Tabel Markdown"
                >
                  <Table size={13} />
                </button>
                <button type="button" onClick={() => insertAtCursor("---")} className="admin-format-btn" title="Separator Orizontal">
                  <Minus size={13} />
                </button>
                <button type="button" onClick={() => insertAtCursor("![Descriere imagine](https://url-imagine.com/img.png)")} className="admin-format-btn" title="Imagine">
                  <ImageIcon size={13} />
                </button>
              </div>

              {/* Action Buttons Group */}
              <div className="admin-editor-action-buttons">
                <select
                  onChange={(e) => { if (e.target.value) handleApplyTemplate(e.target.value); }}
                  defaultValue=""
                  className="admin-template-select"
                  title="Aplică un șablon structurat"
                >
                  <option value="" disabled>Șabloane...</option>
                  <option value="guide">Ghid Standard</option>
                  <option value="system">Sistem Tehnic</option>
                  <option value="market">Pachet VIP & Shop</option>
                </select>

                {/* #3 Frontmatter Panel Toggle */}
                <button
                  type="button"
                  onClick={() => setShowFmPanel(!showFmPanel)}
                  className={`admin-action-pill-btn ${showFmPanel ? "admin-action-pill-btn--active" : "admin-action-pill-btn--sanitize"}`}
                  title="Editează Frontmatter vizual"
                >
                  <FileEdit size={12} className={showFmPanel ? "text-[var(--color-primary)]" : "text-purple-400"} />
                  <span>Frontmatter</span>
                </button>

                {/* #6 Health Toggle */}
                <button
                  type="button"
                  onClick={() => setShowHealthPanel(!showHealthPanel)}
                  className={`admin-action-pill-btn ${showHealthPanel ? "admin-action-pill-btn--active" : "admin-action-pill-btn--sanitize"}`}
                  title="Analizează sănătatea documentului"
                >
                  <Activity size={12} className={
                    healthScore === null ? "text-[var(--color-text-tertiary)]" :
                    healthScore >= 90 ? "text-emerald-400" :
                    healthScore >= 60 ? "text-amber-400" : "text-red-400"
                  } />
                  <span>
                    Health{healthScore !== null ? ` ${healthScore}` : ""}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoSanitize}
                  className="admin-action-pill-btn admin-action-pill-btn--sanitize"
                  title="Auto-Sanitize & Normalizează Markdown"
                >
                  <Wand2 size={12} className="text-amber-400" />
                  <span>Sanitize</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenLiveDocs}
                  className="admin-action-pill-btn admin-action-pill-btn--preview"
                  title="Deschide pagina live în portal"
                >
                  <ExternalLink size={12} />
                  <span>Open Live</span>
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="admin-editor-mode-toggle">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`admin-tab-btn ${activeTab === "edit" ? "admin-tab-btn--active" : ""}`}
              >
                <Code size={13} />
                <span>Markdown</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("diff")}
                className={`admin-tab-btn ${activeTab === "diff" ? "admin-tab-btn--active" : ""}`}
              >
                <GitCompare size={13} />
                <span>Visual Diff</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`admin-tab-btn ${activeTab === "preview" ? "admin-tab-btn--active" : ""}`}
              >
                <Eye size={13} />
                <span>Live Preview</span>
              </button>
            </div>
          </div>

          {/* #3 Frontmatter Studio Panel */}
          {showFmPanel && (
            <div className="admin-fm-panel">
              <div className="admin-fm-panel-header">
                <FileEdit size={14} className="text-purple-400" />
                <span>Frontmatter Studio</span>
                <button type="button" onClick={() => setShowFmPanel(false)} className="admin-fm-panel-close">
                  <ChevronUp size={14} />
                </button>
              </div>
              <div className="admin-fm-panel-grid">
                {/* Title */}
                <div className="admin-fm-field">
                  <label className="admin-fm-label">
                    <FileText size={11} />
                    <span>Titlu</span>
                  </label>
                  <input
                    type="text"
                    value={fmFields.title}
                    onChange={(e) => updateFmField("title", `"${e.target.value}"`)}
                    className="admin-fm-input"
                    placeholder="Titlul articolului..."
                  />
                </div>
                {/* Description */}
                <div className="admin-fm-field admin-fm-field--wide">
                  <label className="admin-fm-label">
                    <Info size={11} />
                    <span>Descriere</span>
                  </label>
                  <input
                    type="text"
                    value={fmFields.description}
                    onChange={(e) => updateFmField("description", `"${e.target.value}"`)}
                    className="admin-fm-input"
                    placeholder="Meta descriere scurtă..."
                  />
                </div>
                {/* Author */}
                <div className="admin-fm-field">
                  <label className="admin-fm-label">
                    <User size={11} />
                    <span>Author</span>
                  </label>
                  <input
                    type="text"
                    value={fmFields.author}
                    onChange={(e) => updateFmField("author", `"${e.target.value}"`)}
                    className="admin-fm-input"
                  />
                </div>
                {/* Date */}
                <div className="admin-fm-field">
                  <label className="admin-fm-label">
                    <Calendar size={11} />
                    <span>Data</span>
                  </label>
                  <input
                    type="date"
                    value={fmFields.date}
                    onChange={(e) => updateFmField("date", `"${e.target.value}"`)}
                    className="admin-fm-input"
                  />
                </div>
                {/* Draft toggle */}
                <div className="admin-fm-field admin-fm-field--toggle">
                  <label className="admin-fm-label">
                    <Shield size={11} />
                    <span>Draft</span>
                  </label>
                  <button
                    type="button"
                    onClick={toggleDraft}
                    className={`admin-fm-toggle-btn ${isDraft ? "admin-fm-toggle-btn--on" : "admin-fm-toggle-btn--off"}`}
                  >
                    <span className="admin-fm-toggle-knob" />
                    <span className="admin-fm-toggle-label">{isDraft ? "DRAFT" : "PUBLIC"}</span>
                  </button>
                </div>
                {/* Tags */}
                <div className="admin-fm-field admin-fm-field--wide admin-fm-field--tags">
                  <label className="admin-fm-label">
                    <Tag size={11} />
                    <span>Tags</span>
                  </label>
                  <div className="admin-fm-tags-row">
                    {fmFields.tags.map((tag) => (
                      <span key={tag} className="admin-fm-tag-pill">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="admin-fm-tag-remove">×</button>
                      </span>
                    ))}
                    <div className="admin-fm-tag-add-row">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="Adaugă tag..."
                        className="admin-fm-tag-input"
                      />
                      <button type="button" onClick={addTag} className="admin-fm-tag-add-btn">
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* #6 Health Scanner Panel */}
          {showHealthPanel && healthResult && (
            <div className="admin-health-panel">
              <div className="admin-health-panel-header">
                <Activity size={14} className={healthColor} />
                <span>MDX Health Scanner</span>
                <div className="admin-health-score-badge" style={{
                  background: healthScore! >= 90 ? "rgba(52,211,153,0.15)" : healthScore! >= 60 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                  color: healthScore! >= 90 ? "#34d399" : healthScore! >= 60 ? "#f59e0b" : "#ef4444",
                  border: `1px solid ${healthScore! >= 90 ? "#34d39940" : healthScore! >= 60 ? "#f59e0b40" : "#ef444440"}`,
                }}>
                  {healthScore}/100 — {healthLabel}
                </div>
                <button type="button" onClick={() => setShowHealthPanel(false)} className="admin-fm-panel-close">
                  <ChevronUp size={14} />
                </button>
              </div>
              {healthResult.issues.length === 0 ? (
                <div className="admin-health-perfect">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Nicio problemă detectată. Documentul este perfect structurat.</span>
                </div>
              ) : (
                <div className="admin-health-issues-list">
                  {healthResult.issues.map((issue, idx) => (
                    <div key={idx} className={`admin-health-issue admin-health-issue--${issue.type}`}>
                      {issue.type === "error" ? <XCircle size={12} /> : issue.type === "warning" ? <TriangleAlert size={12} /> : <Info size={12} />}
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Editor / Diff / Preview */}
          {activeTab === "edit" ? (
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Introdu conținutul documentului în GitHub Flavored Markdown..."
              className="admin-markdown-editor"
              spellCheck={false}
            />
          ) : activeTab === "diff" ? (
            <div className="admin-diff-viewer-pane">
              <div className="admin-diff-header-bar">
                <div className="admin-diff-stat-item">
                  <span className="admin-diff-dot admin-diff-dot--add" />
                  <span>Linii Adăugate: {diffChanges.filter((c) => c.type === "added").length}</span>
                </div>
                <div className="admin-diff-stat-item">
                  <span className="admin-diff-dot admin-diff-dot--del" />
                  <span>Linii Șterse: {diffChanges.filter((c) => c.type === "removed").length}</span>
                </div>
                <span className="text-xs text-[var(--color-text-tertiary)] ml-auto">
                  Comparat cu ultima versiune salvată pe disc
                </span>
              </div>
              <div className="admin-diff-lines-container">
                {diffChanges.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--color-text-tertiary)]">
                    Nicio modificare detectată față de fișierul salvat.
                  </div>
                ) : (
                  diffChanges.map((change, idx) => (
                    <div key={idx} className={`admin-diff-line admin-diff-line--${change.type}`}>
                      <span className="admin-diff-prefix">
                        {change.type === "added" ? "+" : change.type === "removed" ? "-" : " "}
                      </span>
                      <span className="admin-diff-line-number">
                        {change.lineNew || change.lineOld || ""}
                      </span>
                      <span className="admin-diff-code-text">{change.value || " "}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="admin-markdown-preview-pane">
              <AdminMarkdownPreview
                rawContent={content}
                slug={isCreatingNew ? computedNewSlug : selectedSlug}
              />
            </div>
          )}

          {/* Editor Status Bar */}
          <div className="admin-editor-status-bar">
            <div className="admin-editor-status-item">
              <span>Cuvinte:</span>
              <strong>{wordCount}</strong>
            </div>
            <div className="admin-editor-status-item">
              <span>Caractere:</span>
              <strong>{charCount}</strong>
            </div>
            <div className="admin-editor-status-item">
              <span>Timp citire:</span>
              <strong>~{readingTimeMin} min</strong>
            </div>
            <div className="admin-editor-status-item">
              <span>Stare:</span>
              <strong className={isDraft ? "text-amber-400" : "text-emerald-400"}>
                {isDraft ? "DRAFT" : "PUBLISHED"}
              </strong>
            </div>
            {/* #1 Modified indicator in status bar */}
            {hasUnsavedChanges && (
              <div className="admin-editor-status-item">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <span className="admin-doc-modified-dot" />
                  Modificat
                </span>
              </div>
            )}
            {/* #7 Auto-save indicator */}
            {autoSavedAt && !hasUnsavedChanges && (
              <div className="admin-editor-status-item">
                <Clock size={10} className="text-[var(--color-text-tertiary)]" />
                <span className="text-[var(--color-text-tertiary)]">
                  Auto-saved {new Date(autoSavedAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
            {autoSavedAt && hasUnsavedChanges && (
              <div className="admin-editor-status-item">
                <Clock size={10} className="text-amber-400" />
                <span className="text-amber-400 text-xs">
                  Auto-saving...
                </span>
              </div>
            )}
            <div className="admin-editor-status-item admin-editor-status-item--right">
              <span>Categorie:</span>
              <strong className="text-[var(--color-primary)] uppercase">{activeCategoryKey}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
