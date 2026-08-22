"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
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
  ChevronLeft,
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
  Upload,
  Terminal,
  ShieldAlert,
  Check,
  Copy,
  Sliders,
  Maximize2,
  Minimize2,
  Split,
  FileCode,
  ArrowDown,
  ArrowUp,
  X,
  Lock,
  Unlock,
  CornerDownRight,
  Paperclip,
  Trash2,
  Play,
  Film,
  FileCheck,
} from "lucide-react";
import { AdminMarkdownPreview } from "@/components/admin/AdminMarkdownPreview";
import { computeLineDiff } from "@/lib/admin/diff";
import { lintMarkdown, autoFixMarkdown, LintDiagnostic, LintResult } from "@/lib/admin/mdxLinter";
import { StudioTableBuilderModal } from "@/components/admin/studio/StudioTableBuilderModal";
import { StudioCalloutBuilderModal, CalloutType } from "@/components/admin/studio/StudioCalloutBuilderModal";
import { StudioCodeBuilderModal } from "@/components/admin/studio/StudioCodeBuilderModal";
import { StudioGalleryBuilderModal } from "@/components/admin/studio/StudioGalleryBuilderModal";
import { StudioFloatingLineToolbar } from "@/components/admin/studio/StudioFloatingLineToolbar";

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

interface OpenTab {
  slug: string;
  title: string;
  category: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
  cursorLine?: number;
  cursorCol?: number;
}

interface MediaAsset {
  filename: string;
  url: string;
  sizeFormatted?: string;
  extension?: string;
  type?: "image" | "video" | "other";
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

export function AdminContentStudioClient() {
  // ─── Document & Tabs State ───
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabSlug, setActiveTabSlug] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // ─── Search & Sidebar ───
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // ─── Creation Modal ───
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>("informatii");
  const [newSlugName, setNewSlugName] = useState<string>("ghid-nou");
  const [newTitleName, setNewTitleName] = useState<string>("Ghid Nou");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("guide");

  // ─── Editor View Mode (Default: Cod full view) ───
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview" | "diff">("edit");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // ─── Diagnostics & Guardrails ───
  const [lintResult, setLintResult] = useState<LintResult>({
    isValid: true,
    hasErrors: false,
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    diagnostics: [],
    integrityScore: 100,
  });
  const [bypassGuardrail, setBypassGuardrail] = useState<boolean>(false);
  const [bottomDockTab, setBottomDockTab] = useState<"problems" | "diff" | "assets" | "console">("problems");
  const [showBottomDock, setShowBottomDock] = useState<boolean>(true);

  // ─── Cursor & Position ───
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number; offset: number }>({ line: 1, col: 1, offset: 0 });

  // ─── Interactive Tool Builders (Line-Aware) ───
  const [showTableBuilder, setShowTableBuilder] = useState<boolean>(false);
  const [showCalloutBuilder, setShowCalloutBuilder] = useState<boolean>(false);
  const [calloutInitialType, setCalloutInitialType] = useState<CalloutType>("NOTE");
  const [showCodeBuilder, setShowCodeBuilder] = useState<boolean>(false);
  const [showGalleryBuilder, setShowGalleryBuilder] = useState<boolean>(false);

  // ─── Find & Replace State ───
  const [showFindBar, setShowFindBar] = useState<boolean>(false);
  const [findText, setFindText] = useState<string>("");
  const [replaceText, setReplaceText] = useState<string>("");
  const [matchCase, setMatchCase] = useState<boolean>(false);
  const [findMatchCount, setFindMatchCount] = useState<number>(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  // ─── Upload & Media Modal State ───
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [uploadingAsset, setUploadingAsset] = useState<boolean>(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [showMediaModal, setShowMediaModal] = useState<boolean>(false);
  const [mediaModalTab, setMediaModalTab] = useState<"upload" | "vault" | "embed">("upload");
  const [mediaTargetFolder, setMediaTargetFolder] = useState<string>("media");
  const [mediaAltTitle, setMediaAltTitle] = useState<string>("");
  const [mediaEmbedUrl, setMediaEmbedUrl] = useState<string>("");
  const [mediaVaultSearch, setMediaVaultSearch] = useState<string>("");
  const [mediaVaultFilter, setMediaVaultFilter] = useState<"all" | "image" | "video" | "gif">("all");
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [mediaFilePreview, setMediaFilePreview] = useState<string | null>(null);
  const [copiedAssetUrl, setCopiedAssetUrl] = useState<string | null>(null);

  // ─── Versions State ───
  const [versions, setVersions] = useState<DocVersionItem[]>([]);
  const [showVersionsMenu, setShowVersionsMenu] = useState<boolean>(false);

  // ─── User Session ───
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isRoot = Boolean(currentUser?.isRoot);

  // ─── Refs ───
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const versionsMenuRef = useRef<HTMLDivElement>(null);

  // ─── Active Tab Content Helper ───
  const activeTab = useMemo(() => {
    return openTabs.find((t) => t.slug === activeTabSlug);
  }, [openTabs, activeTabSlug]);

  const activeContent = activeTab ? activeTab.content : "";
  const activeOriginalContent = activeTab ? activeTab.originalContent : "";

  // ─── Real-Time Linting ───
  useEffect(() => {
    if (!activeTab) {
      setLintResult({
        isValid: true,
        hasErrors: false,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
        diagnostics: [],
        integrityScore: 100,
      });
      return;
    }
    const res = lintMarkdown(activeTab.content);
    setLintResult(res);
  }, [activeTab?.content, activeTab?.slug]);

  // ─── Open Document into Tab ───
  const openDocument = useCallback(async (slug: string) => {
    // If already open, switch to it
    setOpenTabs((prev) => {
      const existing = prev.find((t) => t.slug === slug);
      if (existing) {
        setActiveTabSlug(slug);
        return prev;
      }
      return prev;
    });

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/doc?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error(`Documentul \`${slug}\` nu a putut fi descărcat.`);
      const data = await res.json();

      const newTab: OpenTab = {
        slug: data.slug,
        title: data.title || slug,
        category: data.category || "informatii",
        content: data.content || "",
        originalContent: data.content || "",
        isDirty: false,
        cursorLine: 1,
        cursorCol: 1,
      };

      setOpenTabs((prev) => {
        if (prev.some((t) => t.slug === newTab.slug)) return prev;
        return [...prev, newTab];
      });
      setActiveTabSlug(data.slug);
      loadVersions(data.slug);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Load Document List ───
  const fetchDocsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/doc");
      if (!res.ok) throw new Error("Nu s-a putut încărca lista de documente.");
      const data = await res.json();
      setDocs(data.docs || []);
      if (data.currentUser) setCurrentUser(data.currentUser);

      // Check if URL has ?slug= or open first document
      if (typeof window !== "undefined" && data.docs?.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const urlSlug = params.get("slug");
        const targetSlug = urlSlug && data.docs.some((d: any) => d.slug === urlSlug)
          ? urlSlug
          : data.docs[0].slug;
        openDocument(targetSlug);
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, [openDocument]);

  useEffect(() => {
    fetchDocsList();
  }, [fetchDocsList]);

  // ─── Fetch Media Assets for Gallery ───
  const fetchMediaAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMediaAssets(data.files || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchMediaAssets();
  }, [fetchMediaAssets]);

  // ─── Close Tab ───
  const closeTab = (slugToClose: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const tab = openTabs.find((t) => t.slug === slugToClose);
    if (tab?.isDirty) {
      const confirmClose = window.confirm(`Fișierul "${tab.title}" are modificări nesalvate. Ești sigur că vrei să îl închizi?`);
      if (!confirmClose) return;
    }

    const remaining = openTabs.filter((t) => t.slug !== slugToClose);
    setOpenTabs(remaining);

    if (activeTabSlug === slugToClose) {
      if (remaining.length > 0) {
        setActiveTabSlug(remaining[remaining.length - 1].slug);
      } else {
        setActiveTabSlug("");
      }
    }
  };

  // ─── Update Content in Active Tab (with Scroll Stability Preservation) ───
  const updateActiveContent = (newContent: string) => {
    if (!activeTabSlug) return;
    const currentScrollTop = editorRef.current?.scrollTop ?? 0;

    setOpenTabs((prev) =>
      prev.map((t) => {
        if (t.slug === activeTabSlug) {
          return {
            ...t,
            content: newContent,
            isDirty: newContent !== t.originalContent,
          };
        }
        return t;
      })
    );

    // Ensure scroll position is strictly preserved and never jumps to top
    if (editorRef.current) {
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.scrollTop = currentScrollTop;
        }
        if (gutterRef.current) {
          gutterRef.current.scrollTop = currentScrollTop;
        }
      });
    }
  };

  // ─── Cursor & Scroll Sync ───
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleCursorActivity = () => {
    if (!editorRef.current) return;
    const el = editorRef.current;
    const val = el.value.substring(0, el.selectionStart);
    const lines = val.split("\n");
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentCol, offset: el.selectionStart });
  };

  // ─── Jump to Line Number (from Problems dock) ───
  const jumpToLine = (targetLine: number) => {
    if (!editorRef.current || !activeContent) return;
    const lines = activeContent.split("\n");
    let offset = 0;
    for (let i = 0; i < Math.min(targetLine - 1, lines.length); i++) {
      offset += lines[i].length + 1;
    }
    editorRef.current.focus();
    editorRef.current.setSelectionRange(offset, offset);
    handleCursorActivity();

    // Scroll to line
    const lineHeight = 21; // Approximate line height in pixels
    editorRef.current.scrollTop = Math.max(0, (targetLine - 4) * lineHeight);
  };

  // ─── Save Document (with Guardrails) ───
  const handleSave = async () => {
    if (!activeTab || saving) return;

    // GUARDRAIL CHECK
    if (lintResult.hasErrors && !bypassGuardrail) {
      setShowBottomDock(true);
      setBottomDockTab("problems");
      setStatusMessage({
        type: "error",
        text: `Salvare blocată: Documentul conține ${lintResult.errorCount} eroare(i) de sintaxă. Corectează erorile sau folosește Auto-Fix înainte de a trimite.`,
      });
      return;
    }

    try {
      setSaving(true);
      setStatusMessage(null);

      const res = await fetch("/api/admin/doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: activeTab.slug,
          content: activeTab.content,
          action: "update",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvarea documentului.");

      // Mark tab as pristine
      setOpenTabs((prev) =>
        prev.map((t) => {
          if (t.slug === activeTab.slug) {
            return {
              ...t,
              originalContent: t.content,
              isDirty: false,
            };
          }
          return t;
        })
      );

      setStatusMessage({
        type: "success",
        text: `Documentul \`${activeTab.slug}\` a fost salvat și sincronizat cu succes!${data.commitHash ? ` (Git: ${data.commitHash.substring(0, 7)})` : ""}`,
      });

      loadVersions(activeTab.slug);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ─── Create New Document ───
  const handleCreateNewDoc = async () => {
    const cleanSlug = newSlugName.trim().replace(/^\/+/, "").replace(/\.(md|mdx)$/, "");
    if (!cleanSlug) {
      setStatusMessage({ type: "error", text: "Numele slug-ului este obligatoriu." });
      return;
    }

    const fullSlug = `${newCategory}/${cleanSlug}`;
    const initialContent = TEMPLATES[selectedTemplateKey]?.content(newTitleName || cleanSlug, newCategory) || `# ${newTitleName}\n`;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: fullSlug,
          content: initialContent,
          action: "create",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nu s-a putut crea documentul.");

      setIsCreatingNew(false);
      await fetchDocsList();
      openDocument(fullSlug);
      setStatusMessage({ type: "success", text: `Documentul \`${fullSlug}\` a fost creat!` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ─── Auto-Fix Diagnostics ───
  const handleAutoFix = () => {
    if (!activeTab) return;
    const { fixedContent, appliedFixes } = autoFixMarkdown(activeTab.content);
    updateActiveContent(fixedContent);
    if (appliedFixes.length > 0) {
      setStatusMessage({
        type: "info",
        text: `Auto-Fix aplicat: ${appliedFixes.join(", ")}.`,
      });
    } else {
      setStatusMessage({
        type: "info",
        text: "Nu s-au găsit erori reparabile automat.",
      });
    }
  };

  // ─── Insert Snippet at Cursor / Line ───
  const insertSnippet = (snippet: string, isBlock = false) => {
    if (!editorRef.current) return;
    const el = editorRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = activeContent;

    let prefix = "";
    let suffix = "";

    if (isBlock) {
      if (start > 0 && current[start - 1] !== "\n") {
        prefix = "\n\n";
      } else if (start > 1 && current[start - 2] !== "\n") {
        prefix = "\n";
      }
      if (end < current.length && current[end] !== "\n") {
        suffix = "\n\n";
      } else if (end < current.length - 1 && current[end + 1] !== "\n") {
        suffix = "\n";
      }
    }

    const cleanSnippet = isBlock ? snippet.trim() : snippet;
    const nextContent = current.substring(0, start) + prefix + cleanSnippet + suffix + current.substring(end);
    updateActiveContent(nextContent);

    setTimeout(() => {
      el.focus();
      const newPos = start + prefix.length + cleanSnippet.length + suffix.length;
      el.setSelectionRange(newPos, newPos);
      handleCursorActivity();
    }, 10);
  };

  // ─── Direct File & Media Upload ───
  const uploadFileAndInsert = async (file: File, folder = "media", customTitle = "") => {
    if (!file) return;

    // If Markdown file: load content directly
    if (file.name.endsWith(".md") || file.name.endsWith(".mdx") || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text && activeTab) {
          updateActiveContent(text);
          setStatusMessage({ type: "success", text: `Conținutul din \`${file.name}\` a fost importat!` });
        }
      };
      reader.readAsText(file);
      return;
    }

    const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    const targetFolder = isVideo && folder === "media" ? "videos" : folder;

    try {
      setUploadingAsset(true);
      setStatusMessage({ type: "info", text: `Se încarcă \`${file.name}\` în \`/${targetFolder}/\`...` });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", targetFolder);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload-ul a eșuat.");

      const titleToUse = customTitle.trim() || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
      let tagToInsert = "";

      if (isVideo) {
        tagToInsert = `\n<DocVideo src="${data.url}" title="${titleToUse}" />\n`;
      } else {
        tagToInsert = `\n![${titleToUse}](${data.url})\n`;
      }

      insertSnippet(tagToInsert);
      fetchMediaAssets();

      setStatusMessage({
        type: "success",
        text: `${isVideo ? "Videoclipul" : "Imaginea"} \`${file.name}\` a fost încărcat(ă) și inserat(ă) cu succes!`,
      });
      setShowMediaModal(false);
      setSelectedMediaFile(null);
      setMediaFilePreview(null);
      setMediaAltTitle("");
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Eroare upload: ${err.message}` });
    } finally {
      setUploadingAsset(false);
    }
  };

  // ─── Clipboard Paste (Instant Screenshot Upload) ───
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const now = new Date();
          const timeString = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}_${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
          const ext = file.type.split("/")[1] || "png";
          const customFileName = `screenshot_${timeString}.${ext}`;
          const renamedFile = new File([file], customFileName, { type: file.type });
          uploadFileAndInsert(renamedFile, "media", `Screenshot ${timeString}`);
        }
        return;
      }
    }
  };

  // ─── External Video Embed Handler (YouTube / Streamable) ───
  const handleInsertYouTubeEmbed = () => {
    if (!mediaEmbedUrl.trim()) {
      setStatusMessage({ type: "error", text: "Introdu un link valid de YouTube sau video extern." });
      return;
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = mediaEmbedUrl.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    const titleToUse = mediaAltTitle.trim() || "Demonstrație Video YouTube";

    if (videoId) {
      const embedTag = `\n<DocVideo src="https://www.youtube.com/embed/${videoId}" title="${titleToUse}" />\n`;
      insertSnippet(embedTag);
      setStatusMessage({ type: "success", text: `Player-ul video YouTube a fost inserat!` });
      setShowMediaModal(false);
      setMediaEmbedUrl("");
      setMediaAltTitle("");
    } else {
      const embedTag = `\n<DocVideo src="${mediaEmbedUrl.trim()}" title="${titleToUse}" />\n`;
      insertSnippet(embedTag);
      setStatusMessage({ type: "success", text: `Video-ul a fost inserat!` });
      setShowMediaModal(false);
      setMediaEmbedUrl("");
      setMediaAltTitle("");
    }
  };

  // ─── Copy Asset Link Helper ───
  const handleCopyAssetUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedAssetUrl(url);
    setTimeout(() => setCopiedAssetUrl(null), 2000);
    setStatusMessage({ type: "info", text: `Link copiat în clipboard: \`${url}\`` });
  };

  // ─── Filtered Vault Assets ───
  const filteredVaultAssets = useMemo(() => {
    return mediaAssets.filter((asset) => {
      const matchesSearch =
        !mediaVaultSearch ||
        asset.filename.toLowerCase().includes(mediaVaultSearch.toLowerCase()) ||
        asset.url.toLowerCase().includes(mediaVaultSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (mediaVaultFilter === "image") return asset.type === "image" && !asset.filename.endsWith(".gif");
      if (mediaVaultFilter === "video") return asset.type === "video";
      if (mediaVaultFilter === "gif") return asset.filename.endsWith(".gif");
      return true;
    });
  }, [mediaAssets, mediaVaultSearch, mediaVaultFilter]);

  // ─── Drag & Drop Event Handlers ───
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      uploadFileAndInsert(file);
    }
  };

  // ─── Version Control ───
  const loadVersions = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/doc/versions?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch {}
  };

  const restoreVersion = (v: DocVersionItem) => {
    const confirm = window.confirm(`Restaurezi versiunea din ${new Date(v.timestamp).toLocaleString("ro-RO")} creată de ${v.savedBy}?`);
    if (!confirm) return;
    updateActiveContent(v.content);
    setShowVersionsMenu(false);
    setStatusMessage({ type: "info", text: `Versiunea restaurată în editor. Salvează pentru a aplica definitiv.` });
  };

  // ─── Find & Replace Logic ───
  const executeFind = useCallback(() => {
    if (!findText || !activeContent) {
      setFindMatchCount(0);
      return;
    }
    const flags = matchCase ? "g" : "gi";
    try {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      const matches = activeContent.match(regex);
      setFindMatchCount(matches ? matches.length : 0);
    } catch {
      setFindMatchCount(0);
    }
  }, [findText, activeContent, matchCase]);

  useEffect(() => {
    executeFind();
  }, [executeFind]);

  const handleReplaceCurrent = () => {
    if (!findText || !activeContent) return;
    const flags = matchCase ? "" : "i";
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
    const updated = activeContent.replace(regex, replaceText);
    updateActiveContent(updated);
  };

  const handleReplaceAll = () => {
    if (!findText || !activeContent) return;
    const flags = matchCase ? "g" : "gi";
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
    const updated = activeContent.replace(regex, replaceText);
    updateActiveContent(updated);
    setStatusMessage({ type: "info", text: `Înlocuit toate aparițiile \`${findText}\` cu \`${replaceText}\`.` });
  };

  // ─── Keyboard Shortcuts (IDE) ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setShowFindBar((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        if (e.shiftKey) {
          e.preventDefault();
          setSidebarOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // ─── Format Document (Clean up markdown) ───
  const handleFormatDocument = () => {
    if (!activeContent) return;
    // Normalize newlines, trim trailing whitespace per line
    const formatted = activeContent
      .split(/\r?\n/)
      .map((l) => l.trimEnd())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    updateActiveContent(formatted);
    setStatusMessage({ type: "success", text: "Documentul a fost formatat și optimizat!" });
  };

  // ─── Filtered Tree ───
  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocItem[]> = {};
    Object.keys(CATEGORY_MAP).forEach((cat) => (groups[cat] = []));

    docs.forEach((doc) => {
      const matchSearch =
        !searchQuery ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.slug.toLowerCase().includes(searchQuery.toLowerCase());

      if (matchSearch) {
        const cat = doc.category || "informatii";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(doc);
      }
    });

    return groups;
  }, [docs, searchQuery]);

  const lineCount = useMemo(() => {
    return activeContent ? activeContent.split("\n").length : 1;
  }, [activeContent]);

  const wordCount = useMemo(() => {
    return activeContent.trim() ? activeContent.trim().split(/\s+/).length : 0;
  }, [activeContent]);

  return (
    <div className={`studio-ide-root ${isFullscreen ? "studio-ide-root--fullscreen" : ""}`}>
      {/* ─── TOP CONTROL BAR ─── */}
      <div className="studio-ide-topbar">
        <div className="studio-ide-topbar-left">
          {/* Back to Mission Control */}
          <Link href="/admin" className="studio-ide-back-btn" title="Înapoi la Panoul Principal (Mission Control)">
            <ChevronLeft size={14} />
            <span>Mission Control</span>
          </Link>

          <div className="studio-ide-divider" />

          <button
            type="button"
            className={`studio-ide-btn ${sidebarOpen ? "studio-ide-btn--active" : ""}`}
            onClick={() => setSidebarOpen((p) => !p)}
            title="Toggle File Explorer (Ctrl+Shift+B)"
          >
            <Folder size={14} />
            <span className="studio-ide-btn-label">Explorer</span>
          </button>

          <div className="studio-ide-divider" />

          {/* New Document Button */}
          <button
            type="button"
            className="studio-ide-btn studio-ide-btn--primary"
            onClick={() => setIsCreatingNew(true)}
            title="Creează Document Nou"
          >
            <Plus size={14} />
            <span>Document Nou</span>
          </button>

          {/* Media & Video Vault Button */}
          <button
            type="button"
            className="studio-ide-btn"
            onClick={() => {
              setShowMediaModal(true);
              setMediaModalTab("upload");
            }}
            title="Centru Media & Video (Imagini, GIF-uri, Video-uri & Galerie)"
          >
            <ImageIcon size={14} />
            <span>Media & Video</span>
          </button>
        </div>

        {/* View Switchers */}
        <div className="studio-ide-view-modes">
          <button
            type="button"
            className={`studio-ide-mode-btn ${viewMode === "split" ? "studio-ide-mode-btn--active" : ""}`}
            onClick={() => setViewMode("split")}
            title="Vizualizare Split Editor + Live Preview"
          >
            <Split size={14} />
            <span>Split IDE</span>
          </button>
          <button
            type="button"
            className={`studio-ide-mode-btn ${viewMode === "edit" ? "studio-ide-mode-btn--active" : ""}`}
            onClick={() => setViewMode("edit")}
            title="Doar Editor Cod"
          >
            <Code size={14} />
            <span>Cod</span>
          </button>
          <button
            type="button"
            className={`studio-ide-mode-btn ${viewMode === "preview" ? "studio-ide-mode-btn--active" : ""}`}
            onClick={() => setViewMode("preview")}
            title="Doar Previzualizare"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
          <button
            type="button"
            className={`studio-ide-mode-btn ${viewMode === "diff" ? "studio-ide-mode-btn--active" : ""}`}
            onClick={() => setViewMode("diff")}
            title="Comparație Git Diff"
          >
            <GitCompare size={14} />
            <span>Diff</span>
          </button>
        </div>

        {/* Top Right Actions */}
        <div className="studio-ide-topbar-right">
          {/* Versions Dropdown */}
          {versions.length > 0 && (
            <div className="studio-ide-relative" ref={versionsMenuRef}>
              <button
                type="button"
                className="studio-ide-btn"
                onClick={() => setShowVersionsMenu((p) => !p)}
                title="Istoric Versiuni & Revisions"
              >
                <History size={14} />
                <span>Istoric ({versions.length})</span>
              </button>
              {showVersionsMenu && (
                <div className="studio-ide-dropdown">
                  <div className="studio-ide-dropdown-header">
                    <History size={13} />
                    <span>Versiuni Salvate</span>
                  </div>
                  <div className="studio-ide-dropdown-list">
                    {versions.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className="studio-ide-dropdown-item"
                        onClick={() => restoreVersion(v)}
                      >
                        <div className="studio-ide-version-title">
                          <User size={12} />
                          <strong>{v.savedBy}</strong>
                        </div>
                        <div className="studio-ide-version-time">
                          <Clock size={11} />
                          <span>{new Date(v.timestamp).toLocaleString("ro-RO")}</span>
                          <span>· {v.charCount} chars</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Format Document Button */}
          <button
            type="button"
            className="studio-ide-btn"
            onClick={handleFormatDocument}
            title="Formatează & Curăță Documentul (Alt+Shift+F)"
          >
            <Sparkles size={14} />
            <span>Format</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="studio-ide-btn"
            onClick={() => setIsFullscreen((p) => !p)}
            title={isFullscreen ? "Ieși din Fullscreen" : "Mod Fullscreen Zen (Tot Ecranul)"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="studio-ide-btn-label">{isFullscreen ? "Fereastră" : "Zen"}</span>
          </button>

          {/* Open in Dedicated Window / Tab */}
          <a
            href="/admin/content"
            target="_blank"
            rel="noopener noreferrer"
            className="studio-ide-btn"
            title="Deschide Content Studio în Fereastră / Tab Separat"
          >
            <ExternalLink size={14} />
            <span className="studio-ide-btn-label">Tab Nou</span>
          </a>

          {/* SAVE BUTTON WITH GUARDRAIL ENFORCEMENT */}
          {lintResult.hasErrors && !bypassGuardrail ? (
            <button
              type="button"
              className="studio-ide-save-btn studio-ide-save-btn--blocked"
              onClick={handleSave}
              title={`Salvare Blocată: ${lintResult.errorCount} erori de sintaxă detectate.`}
            >
              <ShieldAlert size={14} />
              <span>Blocat ({lintResult.errorCount} Erori)</span>
            </button>
          ) : (
            <button
              type="button"
              className={`studio-ide-save-btn ${activeTab?.isDirty ? "studio-ide-save-btn--dirty" : ""}`}
              onClick={handleSave}
              disabled={saving || !activeTab}
              title="Salvează & Efectuează Commit (Ctrl+S)"
            >
              {saving ? <RefreshCw size={14} className="studio-spin" /> : <Save size={14} />}
              <span>{saving ? "Se salvează..." : activeTab?.isDirty ? "Salvează Modificări" : "Salvat"}</span>
            </button>
          )}

          {/* Root Super Admin Guardrail Bypass Lock Toggle */}
          {isRoot && lintResult.hasErrors && (
            <button
              type="button"
              className={`studio-ide-bypass-btn ${bypassGuardrail ? "studio-ide-bypass-btn--active" : ""}`}
              onClick={() => setBypassGuardrail((p) => !p)}
              title="Root Override: Comută bypass guardrail pentru salvare forțată"
            >
              {bypassGuardrail ? <Unlock size={12} /> : <Lock size={12} />}
              <span>{bypassGuardrail ? "Bypass Activ" : "Override"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── STATUS NOTIFICATION BANNER ─── */}
      {statusMessage && (
        <div className={`studio-ide-banner studio-ide-banner--${statusMessage.type}`}>
          <div className="studio-ide-banner-content">
            {statusMessage.type === "success" && <CheckCircle2 size={14} />}
            {statusMessage.type === "error" && <AlertCircle size={14} />}
            {statusMessage.type === "info" && <Info size={14} />}
            <span>{statusMessage.text}</span>
          </div>
          <button type="button" onClick={() => setStatusMessage(null)} className="studio-ide-banner-close">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ─── MAIN WORKSPACE (Explorer + Editor + Preview) ─── */}
      <div className="studio-ide-body">
        {/* ── SIDEBAR / FILE EXPLORER ── */}
        {sidebarOpen && (
          <aside className="studio-ide-sidebar">
            <div className="studio-ide-sidebar-search">
              <Search size={13} className="studio-ide-search-icon" />
              <input
                type="text"
                placeholder="Caută în ghiduri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="studio-ide-search-input"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="studio-ide-search-clear">
                  <X size={11} />
                </button>
              )}
            </div>

            <div className="studio-ide-tree">
              {Object.entries(groupedDocs).map(([catKey, catDocs]) => {
                if (catDocs.length === 0 && searchQuery) return null;
                const catMeta = CATEGORY_MAP[catKey] || { label: catKey, icon: Folder, color: "var(--color-primary)" };
                const CatIcon = catMeta.icon;
                const isCollapsed = collapsedCategories[catKey];

                return (
                  <div key={catKey} className="studio-ide-tree-group">
                    <button
                      type="button"
                      className="studio-ide-tree-group-header"
                      onClick={() =>
                        setCollapsedCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }))
                      }
                    >
                      {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                      <CatIcon size={14} style={{ color: catMeta.color }} />
                      <span className="studio-ide-tree-group-title">{catMeta.label}</span>
                      <span className="studio-ide-tree-badge">{catDocs.length}</span>
                    </button>

                    {!isCollapsed && (
                      <div className="studio-ide-tree-items">
                        {catDocs.map((doc) => {
                          const isTabOpen = openTabs.some((t) => t.slug === doc.slug);
                          const isActive = activeTabSlug === doc.slug;
                          const tabObj = openTabs.find((t) => t.slug === doc.slug);

                          return (
                            <button
                              key={doc.slug}
                              type="button"
                              onClick={() => openDocument(doc.slug)}
                              className={`studio-ide-tree-item ${isActive ? "studio-ide-tree-item--active" : ""}`}
                            >
                              <FileCode size={13} className="studio-ide-tree-file-icon" />
                              <span className="studio-ide-tree-file-name">{doc.title || doc.slug}</span>
                              {tabObj?.isDirty && <span className="studio-ide-dirty-dot" title="Modificări nesalvate" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* ── EDITOR & PREVIEW WORKSPACE ── */}
        <div className="studio-ide-main-col">
          {/* TABS HEADER BAR */}
          <div className="studio-ide-tabs-bar">
            <div className="studio-ide-tabs-list">
              {openTabs.map((tab) => {
                const isActive = tab.slug === activeTabSlug;
                return (
                  <div
                    key={tab.slug}
                    onClick={() => setActiveTabSlug(tab.slug)}
                    className={`studio-ide-tab ${isActive ? "studio-ide-tab--active" : ""}`}
                  >
                    <FileText size={13} className="studio-ide-tab-icon" />
                    <span className="studio-ide-tab-title">{tab.title}</span>
                    {tab.isDirty && <span className="studio-ide-tab-dirty-indicator" title="Nesalvat" />}
                    <button
                      type="button"
                      className="studio-ide-tab-close"
                      onClick={(e) => closeTab(tab.slug, e)}
                      title="Închide fișierul"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="studio-ide-new-tab-btn"
              onClick={() => setIsCreatingNew(true)}
              title="Adaugă Document Nou"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* SNIPPET & MARKDOWN TOOLBAR */}
          {activeTab && (
            <div className="studio-ide-toolbar">
              <div className="studio-ide-toolbar-group">
                <button type="button" className="studio-ide-tool-btn" onClick={() => insertSnippet("**text îngroșat**")} title="Bold (Ctrl+B)">
                  <Bold size={13} />
                </button>
                <button type="button" className="studio-ide-tool-btn" onClick={() => insertSnippet("*text cursiv*")} title="Italic (Ctrl+I)">
                  <Italic size={13} />
                </button>
                <button type="button" className="studio-ide-tool-btn" onClick={() => insertSnippet("# Titlu H1\n")} title="Heading 1">
                  <Heading1 size={13} />
                </button>
                <button type="button" className="studio-ide-tool-btn" onClick={() => insertSnippet("## 1.0 Secțiune H2\n")} title="Heading 2">
                  <Heading2 size={13} />
                </button>
                <button type="button" className="studio-ide-tool-btn" onClick={() => insertSnippet("### 1.1 Subsecțiune H3\n")} title="Heading 3">
                  <Heading3 size={13} />
                </button>
              </div>

              <div className="studio-ide-toolbar-divider" />

              <div className="studio-ide-toolbar-group">
                <button
                  type="button"
                  className="studio-ide-tool-btn"
                  onClick={() => {
                    setCalloutInitialType("NOTE");
                    setShowCalloutBuilder(true);
                  }}
                  title="GitHub Alert Note"
                >
                  <Info size={13} />
                  <span className="studio-ide-tool-text">Note</span>
                </button>
                <button
                  type="button"
                  className="studio-ide-tool-btn"
                  onClick={() => {
                    setCalloutInitialType("TIP");
                    setShowCalloutBuilder(true);
                  }}
                  title="GitHub Alert Tip"
                >
                  <Sparkles size={13} />
                  <span className="studio-ide-tool-text">Tip</span>
                </button>
                <button
                  type="button"
                  className="studio-ide-tool-btn"
                  onClick={() => {
                    setCalloutInitialType("IMPORTANT");
                    setShowCalloutBuilder(true);
                  }}
                  title="GitHub Alert Important"
                >
                  <TriangleAlert size={13} />
                  <span className="studio-ide-tool-text">Important</span>
                </button>
                <button
                  type="button"
                  className="studio-ide-tool-btn"
                  onClick={() => setShowCodeBuilder(true)}
                  title="Deschide Generator Bloc de Cod"
                >
                  <Code size={13} />
                  <span className="studio-ide-tool-text">Code</span>
                </button>
                <button
                  type="button"
                  className="studio-ide-tool-btn"
                  onClick={() => setShowTableBuilder(true)}
                  title="Deschide Generator Interactiv de Tabel"
                >
                  <Table size={13} />
                  <span className="studio-ide-tool-text">Tabel</span>
                </button>
              </div>

              <div className="studio-ide-toolbar-divider" />

              <div className="studio-ide-toolbar-group">
                <button
                  type="button"
                  className="studio-ide-tool-btn"
                  onClick={() => {
                    setShowMediaModal(true);
                    setMediaModalTab("upload");
                  }}
                  title="Încarcă sau Inserează Imagine / GIF"
                >
                  <ImageIcon size={13} />
                  <span className="studio-ide-tool-text">Imagine</span>
                </button>
                <button
                  type="button"
                  className="studio-ide-tool-btn"
                  onClick={() => {
                    setShowMediaModal(true);
                    setMediaModalTab("embed");
                  }}
                  title="Încarcă sau Inserează Video MP4 / YouTube"
                >
                  <Play size={13} />
                  <span className="studio-ide-tool-text">Video</span>
                </button>
                <button
                  type="button"
                  className="studio-ide-tool-btn"
                  onClick={() => setShowGalleryBuilder(true)}
                  title="Deschide Constructor Galerie Multi-Slide"
                >
                  <Layers size={13} />
                  <span className="studio-ide-tool-text">Galerie</span>
                </button>
              </div>

              <div className="studio-ide-toolbar-divider" />

              {/* Find Bar Toggle */}
              <button
                type="button"
                className={`studio-ide-tool-btn ${showFindBar ? "studio-ide-tool-btn--active" : ""}`}
                onClick={() => setShowFindBar((p) => !p)}
                title="Căutare și Înlocuire (Ctrl+F)"
              >
                <Search size={13} />
                <span className="studio-ide-tool-text">Find / Replace</span>
              </button>
            </div>
          )}

          {/* FIND & REPLACE BAR */}
          {showFindBar && (
            <div className="studio-ide-findbar">
              <div className="studio-ide-findbar-row">
                <Search size={13} className="studio-ide-find-icon" />
                <input
                  type="text"
                  placeholder="Caută în text..."
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="studio-ide-find-input"
                />
                <button
                  type="button"
                  className={`studio-ide-find-btn ${matchCase ? "studio-ide-find-btn--active" : ""}`}
                  onClick={() => setMatchCase((p) => !p)}
                  title="Match Case (Aa)"
                >
                  Aa
                </button>
                <span className="studio-ide-find-count">
                  {findText ? `${findMatchCount} potriviri` : "0 potriviri"}
                </span>
                <input
                  type="text"
                  placeholder="Înlocuiește cu..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="studio-ide-find-input"
                />
                <button type="button" className="studio-ide-action-btn" onClick={handleReplaceCurrent} disabled={!findMatchCount}>
                  Înlocuiește
                </button>
                <button type="button" className="studio-ide-action-btn" onClick={handleReplaceAll} disabled={!findMatchCount}>
                  Tot
                </button>
                <button type="button" className="studio-ide-findbar-close" onClick={() => setShowFindBar(false)}>
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* EDITOR / PREVIEW / DIFF SPLIT VIEWPORT */}
          <div
            className={`studio-ide-viewport ${isDraggingFile ? "studio-ide-viewport--dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDraggingFile && (
              <div className="studio-ide-drag-overlay">
                <Upload size={36} className="studio-ide-drag-icon" />
                <span className="studio-ide-drag-title">Trage fișierul aici pentru a-l insera</span>
                <span className="studio-ide-drag-subtitle">Imaginile vor fi încărcate în `/media/` și inserate automat</span>
              </div>
            )}

            {!activeTab ? (
              <div className="studio-ide-empty-state">
                <div className="studio-ide-empty-card">
                  <div className="studio-ide-empty-icon-box">
                    <FileCode size={36} className="studio-ide-empty-icon" />
                  </div>
                  <h3 className="studio-ide-empty-title">Niciun Document Selectat</h3>
                  <p className="studio-ide-empty-desc">
                    Alege un ghid din panoul din stânga sau creează un articol nou pentru a începe editarea în Studio IDE.
                  </p>
                  <button
                    type="button"
                    className="studio-ide-btn studio-ide-btn--primary studio-ide-empty-btn"
                    onClick={() => setIsCreatingNew(true)}
                  >
                    <Plus size={14} />
                    <span>Creează Document Nou</span>
                  </button>
                </div>
              </div>
            ) : viewMode === "diff" ? (
              <div className="studio-ide-diff-view">
                <div className="studio-ide-diff-header">
                  <span>Comparație Versiune Modificată față de Versiunea Salvată pe Disc</span>
                </div>
                <div className="studio-ide-diff-body">
                  {computeLineDiff(activeOriginalContent, activeContent).map((chunk, i) => (
                    <div key={i} className={`studio-ide-diff-line studio-ide-diff-line--${chunk.type}`}>
                      <span className="studio-ide-diff-symbol">
                        {chunk.type === "added" ? "+" : chunk.type === "removed" ? "-" : " "}
                      </span>
                      <span className="studio-ide-diff-text">{chunk.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="studio-ide-split-container">
                {/* EDITOR PANE */}
                {(viewMode === "split" || viewMode === "edit") && (
                  <div className={`studio-ide-editor-pane ${viewMode === "edit" ? "studio-ide-editor-pane--full" : ""}`}>
                    {/* GUTTER WITH LINE NUMBERS & ERROR ICONS */}
                    <div className="studio-ide-gutter" ref={gutterRef}>
                      {Array.from({ length: lineCount }).map((_, idx) => {
                        const lineNum = idx + 1;
                        const lineDiagnostic = lintResult.diagnostics.find((d) => d.line === lineNum);
                        const isCurrentLine = cursorPos.line === lineNum;

                        return (
                          <div
                            key={lineNum}
                            className={`studio-ide-gutter-row ${isCurrentLine ? "studio-ide-gutter-row--active" : ""}`}
                            onClick={() => jumpToLine(lineNum)}
                          >
                            <span className="studio-ide-line-num">{lineNum}</span>
                            {lineDiagnostic && (
                              <span
                                className={`studio-ide-gutter-marker studio-ide-gutter-marker--${lineDiagnostic.severity}`}
                                title={`L${lineNum}: ${lineDiagnostic.message}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* MAIN TEXTAREA */}
                    <textarea
                      ref={editorRef}
                      value={activeContent}
                      onChange={(e) => {
                        updateActiveContent(e.target.value);
                        handleCursorActivity();
                      }}
                      onKeyUp={handleCursorActivity}
                      onClick={handleCursorActivity}
                      onScroll={handleEditorScroll}
                      onPaste={handlePaste}
                      className="studio-ide-textarea"
                      placeholder="Scrie documentația în Markdown / MDX..."
                      spellCheck={false}
                    />

                    {/* FLOATING LINE ACTION TOOLBAR TRACKING CARET LINE (ABSOLUTE POSITIONED) */}
                    <StudioFloatingLineToolbar
                      cursorLine={cursorPos.line}
                      onOpenTableBuilder={() => setShowTableBuilder(true)}
                      onOpenCalloutBuilder={() => {
                        setCalloutInitialType("NOTE");
                        setShowCalloutBuilder(true);
                      }}
                      onOpenCodeBuilder={() => setShowCodeBuilder(true)}
                      onOpenMediaModal={(tab) => {
                        setMediaModalTab(tab);
                        setShowMediaModal(true);
                      }}
                      onOpenGalleryBuilder={() => setShowGalleryBuilder(true)}
                      onInsertQuickSnippet={(snippet) => insertSnippet(snippet, true)}
                    />
                  </div>
                )}

                {/* PREVIEW PANE */}
                {(viewMode === "split" || viewMode === "preview") && (
                  <div className={`studio-ide-preview-pane ${viewMode === "preview" ? "studio-ide-preview-pane--full" : ""}`}>
                    <AdminMarkdownPreview
                      rawContent={activeContent}
                      slug={activeTabSlug}
                      onContentChange={(newContent) => updateActiveContent(newContent)}
                      onOpenTableBuilder={() => setShowTableBuilder(true)}
                      onOpenCalloutBuilder={(type) => {
                        setCalloutInitialType(type || "NOTE");
                        setShowCalloutBuilder(true);
                      }}
                      onOpenCodeBuilder={() => setShowCodeBuilder(true)}
                      onOpenMediaModal={() => {
                        setMediaModalTab("upload");
                        setShowMediaModal(true);
                      }}
                      onOpenGalleryBuilder={() => setShowGalleryBuilder(true)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── BOTTOM DOCK (PROBLEMS, LOGS, DIFF, ASSET VAULT) ─── */}
          {activeTab && showBottomDock && (
            <div className="studio-ide-dock">
              <div className="studio-ide-dock-tabs">
                <button
                  type="button"
                  className={`studio-ide-dock-tab ${bottomDockTab === "problems" ? "studio-ide-dock-tab--active" : ""}`}
                  onClick={() => setBottomDockTab("problems")}
                >
                  <AlertCircle size={12} />
                  <span>Problems</span>
                  {lintResult.errorCount > 0 && (
                    <span className="studio-ide-dock-badge studio-ide-dock-badge--error">
                      {lintResult.errorCount}
                    </span>
                  )}
                  {lintResult.warningCount > 0 && (
                    <span className="studio-ide-dock-badge studio-ide-dock-badge--warn">
                      {lintResult.warningCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`studio-ide-dock-tab ${bottomDockTab === "diff" ? "studio-ide-dock-tab--active" : ""}`}
                  onClick={() => setBottomDockTab("diff")}
                >
                  <GitCompare size={12} />
                  <span>Git Diff</span>
                </button>

                <button
                  type="button"
                  className={`studio-ide-dock-tab ${bottomDockTab === "assets" ? "studio-ide-dock-tab--active" : ""}`}
                  onClick={() => setBottomDockTab("assets")}
                >
                  <ImageIcon size={12} />
                  <span>Asset Gallery ({mediaAssets.length})</span>
                </button>

                <button
                  type="button"
                  className={`studio-ide-dock-tab ${bottomDockTab === "console" ? "studio-ide-dock-tab--active" : ""}`}
                  onClick={() => setBottomDockTab("console")}
                >
                  <Terminal size={12} />
                  <span>Integrity Console</span>
                </button>

                {/* Auto-Fix button inside Dock */}
                {lintResult.hasErrors && (
                  <button
                    type="button"
                    className="studio-ide-dock-fix-btn"
                    onClick={handleAutoFix}
                    title="Repară automat problemele de sintaxă reparabile"
                  >
                    <Wand2 size={12} />
                    <span>Auto-Fix Issues</span>
                  </button>
                )}

                <button
                  type="button"
                  className="studio-ide-dock-close"
                  onClick={() => setShowBottomDock(false)}
                  title="Ascunde Dock"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* DOCK CONTENT BODY */}
              <div className="studio-ide-dock-body">
                {bottomDockTab === "problems" && (
                  <div className="studio-ide-problems-list">
                    {lintResult.diagnostics.length === 0 ? (
                      <div className="studio-ide-no-problems">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>Nicio problemă detectată în document. Sintaxa Markdown / MDX este 100% curată și validată.</span>
                      </div>
                    ) : (
                      lintResult.diagnostics.map((diag) => (
                        <div
                          key={diag.id}
                          className={`studio-ide-problem-row studio-ide-problem-row--${diag.severity}`}
                          onClick={() => jumpToLine(diag.line)}
                        >
                          {diag.severity === "error" && <XCircle size={14} className="studio-ide-prob-icon--error" />}
                          {diag.severity === "warning" && <TriangleAlert size={14} className="studio-ide-prob-icon--warn" />}
                          {diag.severity === "info" && <Info size={14} className="studio-ide-prob-icon--info" />}
                          <span className="studio-ide-prob-loc">Ln {diag.line}, Col {diag.column}</span>
                          <span className="studio-ide-prob-msg">{diag.message}</span>
                          <span className="studio-ide-prob-rule">[{diag.rule}]</span>
                          {diag.fixable && <span className="studio-ide-prob-fix-tag">Auto-fixabil</span>}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {bottomDockTab === "diff" && (
                  <div className="studio-ide-diff-mini">
                    {computeLineDiff(activeOriginalContent, activeContent).map((chunk, i) => (
                      <div key={i} className={`studio-ide-diff-line studio-ide-diff-line--${chunk.type}`}>
                        <span className="studio-ide-diff-symbol">{chunk.type === "added" ? "+" : chunk.type === "removed" ? "-" : " "}</span>
                        <span className="studio-ide-diff-text">{chunk.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {bottomDockTab === "assets" && (
                  <div className="studio-ide-assets-grid">
                    {mediaAssets.slice(0, 16).map((asset) => (
                      <div
                        key={asset.url}
                        className="studio-ide-asset-card"
                        onClick={() => insertSnippet(`\n![${asset.filename}](${asset.url})\n`)}
                        title={`Click pentru a insera ![${asset.filename}](${asset.url})`}
                      >
                        <img src={asset.url} alt={asset.filename} className="studio-ide-asset-thumb" />
                        <span className="studio-ide-asset-name">{asset.filename}</span>
                      </div>
                    ))}
                  </div>
                )}

                {bottomDockTab === "console" && (
                  <div className="studio-ide-console-view">
                    <div className="studio-ide-console-line">
                      <span className="studio-ide-console-time">{new Date().toLocaleTimeString()}</span>
                      <span className="studio-ide-console-tag">[AST_VALIDATOR]</span>
                      <span>Scor de Integritate: {lintResult.integrityScore}% ({lintResult.errorCount} erori, {lintResult.warningCount} avertismente)</span>
                    </div>
                    <div className="studio-ide-console-line">
                      <span className="studio-ide-console-time">{new Date().toLocaleTimeString()}</span>
                      <span className="studio-ide-console-tag">[GUARDRAILS]</span>
                      <span>Status: {lintResult.hasErrors ? "BLOCAT (Necesită corectare)" : "VALIDAT & GATA DE PUSH"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── STATUS BAR (IDE BOTTOM) ─── */}
          <div className="studio-ide-statusbar">
            <div className="studio-ide-statusbar-left">
              <button
                type="button"
                className="studio-ide-status-item studio-ide-status-item--button"
                onClick={() => {
                  setShowBottomDock((p) => !p);
                  setBottomDockTab("problems");
                }}
              >
                {lintResult.hasErrors ? (
                  <XCircle size={12} className="studio-ide-status-icon--error" />
                ) : (
                  <CheckCircle2 size={12} className="studio-ide-status-icon--ok" />
                )}
                <span>{lintResult.errorCount} Erori, {lintResult.warningCount} Warnings</span>
              </button>

              <div className="studio-ide-status-divider" />

              <span className="studio-ide-status-item">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Integritate: {lintResult.integrityScore}%</span>
              </span>

              <div className="studio-ide-status-divider" />

              <span className="studio-ide-status-item">
                {bypassGuardrail ? (
                  <span className="text-amber-400 font-bold">Guardrail: Bypass Root</span>
                ) : (
                  <span>Guardrail: Activ & Securizat</span>
                )}
              </span>
            </div>

            <div className="studio-ide-statusbar-right">
              <span className="studio-ide-status-item">
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
              <div className="studio-ide-status-divider" />
              <span className="studio-ide-status-item">{wordCount} cuvinte</span>
              <div className="studio-ide-status-divider" />
              <span className="studio-ide-status-item">UTF-8</span>
              <div className="studio-ide-status-divider" />
              <span className="studio-ide-status-item">Markdown / MDX</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL: CREATE NEW DOCUMENT ─── */}
      {isCreatingNew && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <div>
                <div className="admin-modal-pretitle">CREARE DOCUMENT NOU</div>
                <h3 className="admin-modal-title">Configurare Ghid sau Articol Nou</h3>
              </div>
              <button type="button" className="admin-modal-close-btn" onClick={() => setIsCreatingNew(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Titlu Document</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="ex: Ghid Comenzi VIP CS2"
                  value={newTitleName}
                  onChange={(e) => {
                    setNewTitleName(e.target.value);
                    setNewSlugName(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                    );
                  }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Categorie & Folder</label>
                <select
                  className="admin-form-input"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {Object.entries(CATEGORY_MAP).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.label} ({key}/)
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Slug URL Fișier</label>
                <input
                  type="text"
                  className="admin-form-input admin-table-mono"
                  placeholder="nume-articol"
                  value={newSlugName}
                  onChange={(e) => setNewSlugName(e.target.value)}
                />
                <span className="admin-form-help">
                  Calea generată: <code>content/docs/{newCategory}/{newSlugName}.md</code>
                </span>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Șablon Inițial (Template)</label>
                <div className="studio-ide-templates-grid">
                  {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                    <button
                      key={key}
                      type="button"
                      className={`studio-ide-tmpl-card ${selectedTemplateKey === key ? "studio-ide-tmpl-card--active" : ""}`}
                      onClick={() => setSelectedTemplateKey(key)}
                    >
                      <strong>{tmpl.label}</strong>
                      <span>{tmpl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setIsCreatingNew(false)}>
                Anulează
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={handleCreateNewDoc}
                disabled={saving || !newSlugName.trim()}
              >
                {saving ? <RefreshCw size={14} className="studio-spin" /> : <Plus size={14} />}
                <span>Creează & Deschide în Editor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: MEDIA & VIDEO VAULT INSERTER ─── */}
      {showMediaModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container studio-media-modal-container">
            <div className="admin-modal-header">
              <div>
                <div className="admin-modal-pretitle">CENTRUL DE ASSET-URI & MEDIA</div>
                <h3 className="admin-modal-title">Inserare Imagini, GIF-uri & Videoclipuri</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => {
                  setShowMediaModal(false);
                  setSelectedMediaFile(null);
                  setMediaFilePreview(null);
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="studio-media-modal-tabs">
              <button
                type="button"
                className={`studio-media-modal-tab ${mediaModalTab === "upload" ? "studio-media-modal-tab--active" : ""}`}
                onClick={() => setMediaModalTab("upload")}
              >
                <Upload size={14} />
                <span>Upload Nou (Local)</span>
              </button>
              <button
                type="button"
                className={`studio-media-modal-tab ${mediaModalTab === "vault" ? "studio-media-modal-tab--active" : ""}`}
                onClick={() => setMediaModalTab("vault")}
              >
                <Layers size={14} />
                <span>Galerie Server ({mediaAssets.length})</span>
              </button>
              <button
                type="button"
                className={`studio-media-modal-tab ${mediaModalTab === "embed" ? "studio-media-modal-tab--active" : ""}`}
                onClick={() => setMediaModalTab("embed")}
              >
                <ExternalLink size={14} />
                <span>Video Extern (YouTube)</span>
              </button>
            </div>

            <div className="admin-modal-body">
              {/* ── TAB 1: UPLOAD LOCAL FILE ── */}
              {mediaModalTab === "upload" && (
                <div className="studio-media-upload-view">
                  <div
                    className="studio-media-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedMediaFile ? (
                      <div className="studio-media-preview-box">
                        {mediaFilePreview ? (
                          <img src={mediaFilePreview} alt="Preview" className="studio-media-preview-img" />
                        ) : (
                          <Film size={40} className="text-amber-400" />
                        )}
                        <div className="studio-media-preview-info">
                          <strong>{selectedMediaFile.name}</strong>
                          <span>{(selectedMediaFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    ) : (
                      <div className="studio-media-dropzone-placeholder">
                        <Upload size={32} className="text-amber-400" />
                        <span className="studio-media-dropzone-title">Apasă pentru a alege un fișier sau trage-l aici</span>
                        <span className="studio-media-dropzone-desc">Suportă PNG, JPG, WEBP, GIF, SVG, MP4, WEBM</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*,video/mp4,video/webm,.gif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setSelectedMediaFile(file);
                        if (file.type.startsWith("image/")) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setMediaFilePreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        } else {
                          setMediaFilePreview(null);
                        }
                        if (!mediaAltTitle) {
                          setMediaAltTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "));
                        }
                      }
                    }}
                  />

                  <div className="admin-form-group">
                    <label className="admin-form-label">Folder Destinație pe Server</label>
                    <select
                      className="admin-form-input"
                      value={mediaTargetFolder}
                      onChange={(e) => setMediaTargetFolder(e.target.value)}
                    >
                      <option value="media">/media/ — Imagini & Asset-uri Generale</option>
                      <option value="videos">/videos/ — Demonstrații Video MP4/WebM</option>
                      <option value="crates">/crates/ — Cutii & Case Openings</option>
                      <option value="knives">/knives/ — Skin-uri Cuțite CS2</option>
                      <option value="gloves">/gloves/ — Mănuși CS2</option>
                      <option value="shop">/shop/ — Meniu Shop & Chat Tags</option>
                      <option value="utility">/utility/ — Inventar & HUD</option>
                      <option value="sank">/sank/ — Sunete & Meme-uri</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Titlu / Text Alternativ (Alt Text / Caption)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="ex: Demonstrație MVP Anthem CS2"
                      value={mediaAltTitle}
                      onChange={(e) => setMediaAltTitle(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 2: VAULT GALLERY ── */}
              {mediaModalTab === "vault" && (
                <div className="studio-media-vault-view">
                  <div className="studio-media-vault-toolbar">
                    <div className="studio-media-vault-search">
                      <Search size={13} className="studio-ide-search-icon" />
                      <input
                        type="text"
                        placeholder="Caută în fișierele existente..."
                        value={mediaVaultSearch}
                        onChange={(e) => setMediaVaultSearch(e.target.value)}
                        className="studio-media-vault-search-input"
                      />
                    </div>

                    <div className="studio-media-vault-filters">
                      <button
                        type="button"
                        className={`studio-media-filter-btn ${mediaVaultFilter === "all" ? "studio-media-filter-btn--active" : ""}`}
                        onClick={() => setMediaVaultFilter("all")}
                      >
                        Toate ({mediaAssets.length})
                      </button>
                      <button
                        type="button"
                        className={`studio-media-filter-btn ${mediaVaultFilter === "image" ? "studio-media-filter-btn--active" : ""}`}
                        onClick={() => setMediaVaultFilter("image")}
                      >
                        Imagini
                      </button>
                      <button
                        type="button"
                        className={`studio-media-filter-btn ${mediaVaultFilter === "video" ? "studio-media-filter-btn--active" : ""}`}
                        onClick={() => setMediaVaultFilter("video")}
                      >
                        Video-uri
                      </button>
                      <button
                        type="button"
                        className={`studio-media-filter-btn ${mediaVaultFilter === "gif" ? "studio-media-filter-btn--active" : ""}`}
                        onClick={() => setMediaVaultFilter("gif")}
                      >
                        GIF-uri
                      </button>
                    </div>
                  </div>

                  <div className="studio-media-vault-grid">
                    {filteredVaultAssets.map((asset) => {
                      const isVid = asset.type === "video";
                      return (
                        <div key={asset.url} className="studio-media-vault-card">
                          <div className="studio-media-vault-thumb">
                            {isVid ? (
                              <div className="studio-media-vault-video-badge">
                                <Play size={20} />
                              </div>
                            ) : (
                              <img src={asset.url} alt={asset.filename} loading="lazy" />
                            )}
                            <span className="studio-media-vault-tag">{asset.extension}</span>
                          </div>

                          <div className="studio-media-vault-card-body">
                            <span className="studio-media-vault-filename" title={asset.filename}>
                              {asset.filename}
                            </span>
                            <span className="studio-media-vault-size">{asset.sizeFormatted}</span>
                          </div>

                          <div className="studio-media-vault-card-actions">
                            <button
                              type="button"
                              className="studio-media-vault-insert-btn"
                              onClick={() => {
                                const tag = isVid
                                  ? `\n<DocVideo src="${asset.url}" title="${asset.filename.replace(/\.[^/.]+$/, "")}" />\n`
                                  : `\n![${asset.filename.replace(/\.[^/.]+$/, "")}](${asset.url})\n`;
                                insertSnippet(tag);
                                setShowMediaModal(false);
                                setStatusMessage({ type: "success", text: `Asset-ul \`${asset.filename}\` a fost inserat!` });
                              }}
                            >
                              <Plus size={12} />
                              <span>Inserează</span>
                            </button>
                            <button
                              type="button"
                              className="studio-media-vault-copy-btn"
                              onClick={() => handleCopyAssetUrl(asset.url)}
                              title="Copiază calea URL"
                            >
                              {copiedAssetUrl === asset.url ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredVaultAssets.length === 0 && (
                    <div className="studio-media-vault-empty">
                      <ImageIcon size={32} className="text-slate-500" />
                      <span>Nu s-au găsit asset-uri conform căutării.</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: EMBED EXTERNAL VIDEO ── */}
              {mediaModalTab === "embed" && (
                <div className="studio-media-embed-view">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Link Video YouTube / Streamable</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="https://www.youtube.com/watch?v=... sau https://youtu.be/..."
                      value={mediaEmbedUrl}
                      onChange={(e) => setMediaEmbedUrl(e.target.value)}
                    />
                    <span className="admin-form-help">
                      Platforma va genera automat un player video integrat cu titlu și stilizare responsivă.
                    </span>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Titlu Video / Descriere</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="ex: Prezentare Gameplay WildFire CS2"
                      value={mediaAltTitle}
                      onChange={(e) => setMediaAltTitle(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => {
                  setShowMediaModal(false);
                  setSelectedMediaFile(null);
                  setMediaFilePreview(null);
                }}
              >
                Anulează
              </button>

              {mediaModalTab === "upload" && (
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  disabled={!selectedMediaFile || uploadingAsset}
                  onClick={() => {
                    if (selectedMediaFile) {
                      uploadFileAndInsert(selectedMediaFile, mediaTargetFolder, mediaAltTitle);
                    }
                  }}
                >
                  {uploadingAsset ? <RefreshCw size={14} className="studio-spin" /> : <Upload size={14} />}
                  <span>Încarcă & Inserează în Document</span>
                </button>
              )}

              {mediaModalTab === "embed" && (
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  disabled={!mediaEmbedUrl.trim()}
                  onClick={handleInsertYouTubeEmbed}
                >
                  <Play size={14} />
                  <span>Inserează Player Video</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: INTERACTIVE TABLE BUILDER ─── */}
      {showTableBuilder && (
        <StudioTableBuilderModal
          cursorLine={cursorPos.line}
          onInsert={(md) => {
            insertSnippet(md, true);
            setShowTableBuilder(false);
            setStatusMessage({ type: "success", text: `Tabelul a fost inserat la linia ${cursorPos.line}!` });
          }}
          onClose={() => setShowTableBuilder(false)}
        />
      )}

      {/* ─── MODAL: INTERACTIVE CALLOUT BUILDER ─── */}
      {showCalloutBuilder && (
        <StudioCalloutBuilderModal
          cursorLine={cursorPos.line}
          initialType={calloutInitialType}
          onInsert={(md) => {
            insertSnippet(md, true);
            setShowCalloutBuilder(false);
            setStatusMessage({ type: "success", text: `Alerta a fost inserată la linia ${cursorPos.line}!` });
          }}
          onClose={() => setShowCalloutBuilder(false)}
        />
      )}

      {/* ─── MODAL: INTERACTIVE CODE BUILDER ─── */}
      {showCodeBuilder && (
        <StudioCodeBuilderModal
          cursorLine={cursorPos.line}
          onInsert={(md) => {
            insertSnippet(md, true);
            setShowCodeBuilder(false);
            setStatusMessage({ type: "success", text: `Blocul de cod a fost inserat la linia ${cursorPos.line}!` });
          }}
          onClose={() => setShowCodeBuilder(false)}
        />
      )}

      {/* ─── MODAL: INTERACTIVE GALLERY BUILDER ─── */}
      {showGalleryBuilder && (
        <StudioGalleryBuilderModal
          cursorLine={cursorPos.line}
          availableAssets={mediaAssets}
          onInsert={(md) => {
            insertSnippet(md, true);
            setShowGalleryBuilder(false);
            setStatusMessage({ type: "success", text: `Galeria a fost inserată la linia ${cursorPos.line}!` });
          }}
          onClose={() => setShowGalleryBuilder(false)}
        />
      )}
    </div>
  );
}
