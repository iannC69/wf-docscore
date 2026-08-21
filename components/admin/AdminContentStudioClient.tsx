"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { AdminMarkdownPreview } from "@/components/admin/AdminMarkdownPreview";
import { computeLineDiff, DiffChange } from "@/lib/admin/diff";

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

const CATEGORY_MAP: Record<string, { label: string; icon: any }> = {
  informatii: { label: "Informații Generale", icon: BookOpen },
  currency: { label: "Currency & Economie", icon: Coins },
  systems: { label: "Sisteme & Mecanici", icon: Cpu },
  market: { label: "Market & Donații VIP", icon: ShoppingBag },
  general: { label: "General", icon: Folder },
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

  // Versions State
  const [versions, setVersions] = useState<DocVersionItem[]>([]);
  const [showVersionsMenu, setShowVersionsMenu] = useState<boolean>(false);

  // Creation States
  const [newCategory, setNewCategory] = useState<string>("informatii");
  const [newSlugName, setNewSlugName] = useState<string>("nou-articol");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Read URL query params safely on mount (no useSearchParams needed = no Suspense = no HMR hook errors)
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

  // Load Doc List
  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch("/api/admin/doc");
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
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
  }, [selectedSlug, isCreatingNew]);

  // Load Content & Versions when selectedSlug changes
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
        }

        // Load version history
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

  const isDraft = useMemo(() => {
    return /draft:\s*true/i.test(content);
  }, [content]);

  const toggleDraft = () => {
    if (isDraft) {
      setContent((prev) => prev.replace(/draft:\s*true/i, "draft: false"));
      setStatusMessage({ type: "success", text: "Stare actualizată: Articolul este marcat ca PUBLISHED." });
    } else {
      if (/draft:\s*false/i.test(content)) {
        setContent((prev) => prev.replace(/draft:\s*false/i, "draft: true"));
      } else {
        // Insert into frontmatter
        setContent((prev) => prev.replace(/---([\s\S]*?)---/, "---\n$1draft: true\n---"));
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
      // 1. Save document content
      const res = await fetch("/api/admin/doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugToSave,
          content,
          action: isCreatingNew ? "create" : "update",
        }),
      });

      const data = await res.json();
      if (data.success) {
        // 2. Save revision snapshot
        await fetch("/api/admin/doc/versions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: slugToSave, content }),
        });

        setStatusMessage({ type: "success", text: data.message });
        setOriginalContent(content);

        if (isCreatingNew) {
          setIsCreatingNew(false);
          setSelectedSlug(slugToSave);
        }

        // Refresh doc list & versions
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

  const insertSnippet = (snippet: string) => {
    setContent((prev) => prev + "\n" + snippet);
  };

  const handleAutoSanitize = () => {
    let sanitized = content;
    sanitized = sanitized.replace(/src=["']["']/g, "");
    sanitized = sanitized.replace(/\n{4,}/g, "\n\n\n");
    if (!sanitized.endsWith("\n")) sanitized += "\n";
    setContent(sanitized);
    setStatusMessage({ type: "success", text: "Auto-Sanitize: Structura Markdown a fost normalizată." });
  };

  const handleOpenLiveDocs = () => {
    const slug = isCreatingNew ? computedNewSlug : selectedSlug;
    if (slug) {
      window.open(`/docs/${slug.replace(/^\/+/, "")}`, "_blank");
    }
  };

  // Group docs by category
  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocItem[]> = {};
    const q = searchQuery.toLowerCase().trim();

    docs.forEach((doc) => {
      if (q && !doc.slug.toLowerCase().includes(q) && !doc.title.toLowerCase().includes(q)) {
        return;
      }
      const cat = doc.category || "general";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(doc);
    });

    return groups;
  }, [docs, searchQuery]);

  const activeDoc = docs.find((d) => d.slug === selectedSlug);
  const activeCategoryKey = isCreatingNew ? newCategory : activeDoc?.category || "general";
  const categoryConfig = CATEGORY_MAP[activeCategoryKey] || { label: activeCategoryKey, icon: Folder };
  const CategoryIcon = categoryConfig.icon;

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));
  const charCount = content.length;

  // Compute Diff
  const diffChanges = useMemo(() => {
    if (activeTab !== "diff") return [];
    return computeLineDiff(originalContent, content);
  }, [activeTab, originalContent, content]);

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
            className={`admin-status-toggle-btn ${
              isDraft ? "admin-status-toggle-btn--draft" : "admin-status-toggle-btn--published"
            }`}
            title="Schimbă starea documentului (Draft ascuns / Publicat)"
          >
            {isDraft ? <EyeOff size={13} /> : <CheckCircle2 size={13} />}
            <span>{isDraft ? "DRAFT (ASCUNS)" : "PUBLISHED (PUBLIC)"}</span>
          </button>

          {/* Versions History Dropdown Button */}
          <div className="relative inline-block">
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

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`admin-alert-box ${
            statusMessage.type === "success"
              ? "admin-alert-box--success"
              : "admin-alert-box--danger"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Split-Screen Studio Layout */}
      <div className="admin-studio-grid">
        {/* Left Panel: Categorized Tree & Search Filter */}
        <aside className="admin-studio-sidebar">
          <div className="admin-sidebar-repo-header">
            <span className="admin-repo-title">REPOSITORY DOCS</span>
            <span className="admin-repo-badge">{docs.length} articole</span>
          </div>

          <div className="admin-studio-search-box">
            <Search size={14} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Caută în cele 62 articole..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-studio-search-input"
            />
          </div>

          {/* Categorized Accordion Tree */}
          <div className="admin-studio-doc-list">
            {Object.keys(groupedDocs).length === 0 ? (
              <div className="admin-sidebar-empty-state">
                <span>Niciun articol găsit pentru "{searchQuery}".</span>
              </div>
            ) : (
              Object.entries(groupedDocs).map(([catKey, catDocs]) => {
                const isCollapsed = !searchQuery && collapsedCategories[catKey];
                const catInfo = CATEGORY_MAP[catKey] || { label: catKey.toUpperCase(), icon: Folder };
                const IconComponent = catInfo.icon;

                return (
                  <div key={catKey} className="admin-category-group">
                    {/* Category Header Button */}
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
                          <IconComponent size={14} />
                        </span>
                        <span className="admin-cat-toggle-text">{catInfo.label}</span>
                      </div>
                      <span className="admin-cat-toggle-badge">{catDocs.length}</span>
                    </button>

                    {/* Category Document List */}
                    {!isCollapsed && (
                      <div className="admin-cat-items-list">
                        {catDocs.map((doc) => {
                          const isSelected = !isCreatingNew && selectedSlug === doc.slug;
                          return (
                            <button
                              key={doc.slug}
                              type="button"
                              onClick={() => {
                                setIsCreatingNew(false);
                                setSelectedSlug(doc.slug);
                              }}
                              className={`admin-doc-list-item ${
                                isSelected ? "admin-doc-list-item--active" : ""
                              }`}
                            >
                              <FileText size={13} className="admin-doc-item-icon" />
                              <div className="admin-doc-item-info">
                                <span className="admin-doc-item-title">{doc.title}</span>
                                <span className="admin-doc-item-subslug">{doc.slug}</span>
                              </div>
                            </button>
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

        {/* Right Panel: Editor, Diff & Live Preview */}
        <div className="admin-studio-editor-pane">
          {/* Top Bar: Category Pill + Slug Builder */}
          <div className="admin-editor-toolbar">
            <div className="admin-editor-slug-box">
              {/* Category Badge Pill */}
              <div className="admin-editor-cat-pill">
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

            {/* Quick Formatting Helpers */}
            <div className="admin-editor-tools-wrapper">
              <div className="admin-editor-format-bar">
                <button
                  type="button"
                  onClick={() => insertSnippet("## Secțiune Nouă")}
                  className="admin-format-btn"
                  title="Titlu H2"
                >
                  <Heading2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("### Subsecțiune")}
                  className="admin-format-btn"
                  title="Titlu H3"
                >
                  <Heading3 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("**Text Îngroșat**")}
                  className="admin-format-btn"
                  title="Bold"
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("*Text Cursiv*")}
                  className="admin-format-btn"
                  title="Italic"
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("```bash\n# comenzi aici\n```")}
                  className="admin-format-btn"
                  title="Bloc de Cod"
                >
                  <Code size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("> [!NOTE]\n> Informație importantă.")}
                  className="admin-format-btn"
                  title="Alert Callout"
                >
                  <Quote size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("[Nume Link](https://...)")}
                  className="admin-format-btn"
                  title="Link Markdown"
                >
                  <Link2 size={13} />
                </button>
              </div>

              {/* Action Buttons Group */}
              <div className="admin-editor-action-buttons">
                {/* Template Preset Dropdown */}
                <select
                  onChange={(e) => {
                    if (e.target.value) handleApplyTemplate(e.target.value);
                  }}
                  defaultValue=""
                  className="admin-template-select"
                  title="Aplică un șablon structurat"
                >
                  <option value="" disabled>
                    Șabloane Predefinite...
                  </option>
                  <option value="guide">Ghid Standard</option>
                  <option value="system">Sistem Tehnic</option>
                  <option value="market">Pachet VIP & Shop</option>
                </select>

                <button
                  type="button"
                  onClick={handleAutoSanitize}
                  className="admin-action-pill-btn admin-action-pill-btn--sanitize"
                  title="Auto-Sanitize & Normalisează Markdown"
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

            {/* Mode Switcher: Markdown vs Diff vs Live Preview */}
            <div className="admin-editor-mode-toggle">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`admin-tab-btn ${
                  activeTab === "edit" ? "admin-tab-btn--active" : ""
                }`}
              >
                <Code size={13} />
                <span>Markdown</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("diff")}
                className={`admin-tab-btn ${
                  activeTab === "diff" ? "admin-tab-btn--active" : ""
                }`}
              >
                <GitCompare size={13} />
                <span>Visual Diff</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`admin-tab-btn ${
                  activeTab === "preview" ? "admin-tab-btn--active" : ""
                }`}
              >
                <Eye size={13} />
                <span>Live Preview</span>
              </button>
            </div>
          </div>

          {/* Main Textarea / Visual Diff / Real Markdown Preview */}
          {activeTab === "edit" ? (
            <textarea
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
                    <div
                      key={idx}
                      className={`admin-diff-line admin-diff-line--${change.type}`}
                    >
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
              <span>Timp de citire:</span>
              <strong>~{readingTimeMin} min</strong>
            </div>
            <div className="admin-editor-status-item">
              <span>Stare:</span>
              <strong className={isDraft ? "text-amber-400" : "text-emerald-400"}>
                {isDraft ? "DRAFT" : "PUBLISHED"}
              </strong>
            </div>
            <div className="admin-editor-status-item admin-editor-status-item--right">
              <span>Categorie activă:</span>
              <strong className="text-[var(--color-primary)] uppercase">{activeCategoryKey}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
