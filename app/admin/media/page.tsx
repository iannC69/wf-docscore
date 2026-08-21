"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  Film,
  Copy,
  Check,
  Search,
  RefreshCw,
  FolderOpen,
  HardDrive,
  FileWarning,
  ExternalLink,
  Layers,
  Play,
  ArrowUpDown,
  X,
  Database,
  Grid3X3,
  List,
  Clock,
  TrendingUp,
  Archive,
} from "lucide-react";
import type { MediaAsset, MediaScanResult } from "@/lib/admin/mediaScanner";

/* ── constants ──────────────────────────────────────────────────────── */
type FilterKey = "all" | "image" | "video" | "used" | "unused";
type SortKey   = "used" | "name" | "size-desc" | "size-asc";
type ViewMode  = "grid" | "list";

const FILTERS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
  { key: "all",    label: "Toate",       icon: <Database  size={12} /> },
  { key: "image",  label: "Imagini",     icon: <ImageIcon size={12} /> },
  { key: "video",  label: "Video",       icon: <Film      size={12} /> },
  { key: "used",   label: "Utilizate",   icon: <TrendingUp size={12}/> },
  { key: "unused", label: "Neutilizate", icon: <FileWarning size={12}/> },
];

/* ── extension badge color ──────────────────────────────────────────── */
function extColor(ext: string): string {
  const e = ext.toLowerCase().replace(".", "");
  if (["jpg","jpeg","webp","png","avif"].includes(e)) return "mv-ext--img";
  if (["gif"].includes(e)) return "mv-ext--gif";
  if (["svg"].includes(e)) return "mv-ext--svg";
  if (["mp4","webm","mov","avi"].includes(e)) return "mv-ext--video";
  return "mv-ext--other";
}

/* ── main component ─────────────────────────────────────────────────── */
export default function AdminMediaVaultPage() {
  const [data,         setData]         = useState<MediaScanResult | null>(null);
  const [loading,      setLoading]      = useState<boolean>(true);
  const [filter,       setFilter]       = useState<FilterKey>("all");
  const [searchQuery,  setSearchQuery]  = useState<string>("");
  const [sortBy,       setSortBy]       = useState<SortKey>("used");
  const [copiedId,     setCopiedId]     = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(48);
  const [viewMode,     setViewMode]     = useState<ViewMode>("grid");

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load media", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleCopyMarkdown = (asset: MediaAsset) => {
    const snippet =
      asset.type === "video"
        ? `<video src="${asset.url}" controls className="docs-video-player" />`
        : `![${asset.filename.replace(/\.[^/.]+$/, "")}](${asset.url})`;
    navigator.clipboard.writeText(snippet);
    setCopiedId(asset.url);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const assets = data?.assets || [];

  const filteredAssets = useMemo(() => {
    let result = assets.filter((asset) => {
      if (filter === "image"  && asset.type !== "image") return false;
      if (filter === "video"  && asset.type !== "video") return false;
      if (filter === "unused" && asset.usageCount > 0)   return false;
      if (filter === "used"   && asset.usageCount === 0) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          asset.filename.toLowerCase().includes(q) ||
          asset.relativePath.toLowerCase().includes(q) ||
          asset.extension.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "used")      return b.usageCount !== a.usageCount ? b.usageCount - a.usageCount : a.filename.localeCompare(b.filename);
      if (sortBy === "name")      return a.filename.localeCompare(b.filename);
      if (sortBy === "size-desc") return b.sizeBytes - a.sizeBytes;
      if (sortBy === "size-asc")  return a.sizeBytes - b.sizeBytes;
      return 0;
    });

    return result;
  }, [assets, filter, searchQuery, sortBy]);

  const visibleAssets = filteredAssets.slice(0, displayLimit);

  /* ── filter counts ──────────────────────────────────────────────── */
  const counts = useMemo(() => ({
    all:    assets.length,
    image:  assets.filter(a => a.type === "image").length,
    video:  assets.filter(a => a.type === "video").length,
    used:   assets.filter(a => a.usageCount > 0).length,
    unused: assets.filter(a => a.usageCount === 0).length,
  }), [assets]);

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="admin-page-container">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="mv-header">
        <div className="mv-header-left">
          <div className="mv-breadcrumb">
            <Archive size={11} />
            <span>CONTENT MANAGEMENT</span>
            <span className="mv-breadcrumb-sep">/</span>
            <span>MEDIA &amp; ASSET VAULT</span>
          </div>
          <h1 className="mv-title">Media &amp; Asset Vault</h1>
          <p className="mv-subtitle">
            Explorează, verifică utilizarea în cele {data?.totalAssets ?? "0"}+ resurse și copiază
            instantaneu sintaxa Markdown pentru orice fișier media din platformă.
          </p>
        </div>

        <div className="mv-header-actions">
          <button
            type="button"
            id="media-rescan-btn"
            onClick={fetchMedia}
            disabled={loading}
            className="mv-scan-btn"
          >
            <RefreshCw size={13} className={loading ? "mv-spin" : ""} />
            <span>{loading ? "Se scanează..." : "Rescanează"}</span>
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ───────────────────────────────────────────────── */}
      <div className="mv-kpi-strip">
        <div className="mv-kpi-cell mv-kpi-cell--primary">
          <div className="mv-kpi-icon mv-kpi-icon--orange">
            <FolderOpen size={20} />
          </div>
          <div className="mv-kpi-body">
            <span className="mv-kpi-number">{loading ? "—" : (data?.totalAssets ?? 0)}</span>
            <span className="mv-kpi-label">Total Assets</span>
            <span className="mv-kpi-desc">
              {data?.imagesCount ?? 0} imagini · {data?.videosCount ?? 0} video
            </span>
          </div>
        </div>

        <div className="mv-kpi-sep" />

        <div className="mv-kpi-cell">
          <div className="mv-kpi-icon mv-kpi-icon--blue">
            <HardDrive size={20} />
          </div>
          <div className="mv-kpi-body">
            <span className="mv-kpi-number mv-kpi-number--blue">{loading ? "—" : (data?.totalSizeFormatted ?? "0 B")}</span>
            <span className="mv-kpi-label">Stocare Ocupată</span>
            <span className="mv-kpi-desc">Directorul public/</span>
          </div>
        </div>

        <div className="mv-kpi-sep" />

        <div className="mv-kpi-cell">
          <div className="mv-kpi-icon mv-kpi-icon--green">
            <TrendingUp size={20} />
          </div>
          <div className="mv-kpi-body">
            <span className="mv-kpi-number mv-kpi-number--green">{loading ? "—" : (data?.usedCount ?? 0)}</span>
            <span className="mv-kpi-label">Assets Utilizate</span>
            <span className="mv-kpi-desc">Referențiate în docs</span>
          </div>
        </div>

        <div className="mv-kpi-sep" />

        <div className="mv-kpi-cell">
          <div className="mv-kpi-icon mv-kpi-icon--amber">
            <FileWarning size={20} />
          </div>
          <div className="mv-kpi-body">
            <span className="mv-kpi-number mv-kpi-number--amber">{loading ? "—" : (data?.unusedCount ?? 0)}</span>
            <span className="mv-kpi-label">Neutilizate</span>
            <span className="mv-kpi-desc">Fără referințe Markdown</span>
          </div>
          {(data?.unusedCount ?? 0) === 0 && !loading && (
            <Check size={13} className="mv-kpi-ok" />
          )}
        </div>
      </div>

      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="mv-toolbar">
        {/* Filter tabs */}
        <div className="mv-filter-tabs">
          {FILTERS.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              id={`media-filter-${key}`}
              onClick={() => { setFilter(key); setDisplayLimit(48); }}
              className={`mv-filter-tab${filter === key ? " mv-filter-tab--active" : ""}`}
            >
              {icon}
              <span>{label}</span>
              <span className={`mv-filter-count${filter === key ? " mv-filter-count--active" : ""}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        <div className="mv-toolbar-right">
          {/* Sort */}
          <div className="mv-sort-wrap">
            <ArrowUpDown size={12} className="mv-sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="mv-sort-select"
              id="media-sort-select"
            >
              <option value="used">Cele Mai Folosite</option>
              <option value="name">Nume (A–Z)</option>
              <option value="size-desc">Dimensiune (Mari)</option>
              <option value="size-asc">Dimensiune (Mici)</option>
            </select>
          </div>

          {/* Search */}
          <div className="mv-search-wrap">
            <Search size={13} className="mv-search-icon" />
            <input
              type="text"
              id="media-search-input"
              placeholder="Caută fișier, cale, extensie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mv-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="mv-search-clear">
                <X size={12} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="mv-view-toggle">
            <button
              type="button"
              id="media-view-grid"
              onClick={() => setViewMode("grid")}
              className={`mv-view-btn${viewMode === "grid" ? " mv-view-btn--active" : ""}`}
              title="Grid view"
            >
              <Grid3X3 size={14} />
            </button>
            <button
              type="button"
              id="media-view-list"
              onClick={() => setViewMode("list")}
              className={`mv-view-btn${viewMode === "list" ? " mv-view-btn--active" : ""}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── RESULTS META ────────────────────────────────────────────── */}
      {!loading && filteredAssets.length > 0 && (
        <div className="mv-results-meta">
          <span>
            Afișând <strong>{Math.min(visibleAssets.length, filteredAssets.length)}</strong> din{" "}
            <strong>{filteredAssets.length}</strong> assets
            {searchQuery && <> pentru „<em>{searchQuery}</em>"</>}
          </span>
        </div>
      )}

      {/* ── GRID / LIST ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="mv-loading">
          <div className="mv-loading-orb">
            <RefreshCw size={22} className="mv-spin" />
          </div>
          <p className="mv-loading-text">Se scanează {data?.totalAssets || "193"} fișiere media...</p>
          <p className="mv-loading-sub">Imaginile, videoclipurile și metadatele se încarcă</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="mv-empty">
          <div className="mv-empty-orb">
            <ImageIcon size={26} />
          </div>
          <p className="mv-empty-title">Niciun fișier media găsit</p>
          <p className="mv-empty-sub">
            {searchQuery ? `Nu există rezultate pentru „${searchQuery}".` : "Schimbă filtrul sau adaugă fișiere media în public/."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ──────────────────────────────────────────────── */
        <div className="mv-grid">
          {visibleAssets.map((asset) => {
            const isCopied = copiedId === asset.url;
            return (
              <div key={asset.url} className="mv-card">
                {/* Preview */}
                <div className="mv-card-preview">
                  {asset.type === "image" ? (
                    <img
                      src={asset.url}
                      alt={asset.filename}
                      className="mv-card-img"
                      loading="lazy"
                    />
                  ) : asset.type === "video" ? (
                    <div className="mv-card-video-wrap">
                      <video
                        src={`${asset.url}#t=0.1`}
                        preload="metadata"
                        muted
                        playsInline
                        className="mv-card-video"
                        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                      <div className="mv-card-video-overlay">
                        <Play size={14} fill="currentColor" />
                        <span>HOVER</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mv-card-other">
                      <Layers size={26} />
                      <span>{asset.extension}</span>
                    </div>
                  )}

                  {/* Usage badge */}
                  <span className={`mv-usage-badge ${asset.usageCount > 0 ? "mv-usage-badge--used" : "mv-usage-badge--unused"}`}>
                    {asset.usageCount > 0 ? `${asset.usageCount} docs` : "Neutilizat"}
                  </span>

                  {/* Type badge */}
                  <span className={`mv-type-badge ${asset.type === "video" ? "mv-type-badge--video" : "mv-type-badge--image"}`}>
                    {asset.type === "video" ? <Film size={10} /> : <ImageIcon size={10} />}
                  </span>
                </div>

                {/* Info */}
                <div className="mv-card-info">
                  <div className="mv-card-name-row">
                    <span className="mv-card-name" title={asset.filename}>{asset.filename}</span>
                    <span className={`mv-ext-badge ${extColor(asset.extension)}`}>{asset.extension}</span>
                  </div>

                  <div className="mv-card-meta">
                    <span className="mv-card-size">{asset.sizeFormatted}</span>
                    {asset.usedInDocs.length > 0 && (
                      <div className="mv-card-doc-tags">
                        {asset.usedInDocs.slice(0, 1).map((slug, i) => (
                          <span key={i} className="mv-doc-chip" title={slug}>{slug}</span>
                        ))}
                        {asset.usedInDocs.length > 1 && (
                          <span className="mv-doc-more">+{asset.usedInDocs.length - 1}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mv-card-actions">
                    <button
                      type="button"
                      onClick={() => handleCopyMarkdown(asset)}
                      className={`mv-copy-btn${isCopied ? " mv-copy-btn--copied" : ""}`}
                      title="Copiază sintaxa Markdown"
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? "Copiat!" : "Copiază MD"}</span>
                    </button>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mv-open-btn"
                      title="Deschide resursa"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── LIST VIEW ──────────────────────────────────────────────── */
        <div className="mv-list">
          <div className="mv-list-header">
            <span className="mv-list-col-preview">Preview</span>
            <span className="mv-list-col-name">Fișier</span>
            <span className="mv-list-col-size">Dimensiune</span>
            <span className="mv-list-col-usage">Utilizare</span>
            <span className="mv-list-col-path">Cale</span>
            <span className="mv-list-col-actions">Acțiuni</span>
          </div>
          {visibleAssets.map((asset) => {
            const isCopied = copiedId === asset.url;
            return (
              <div key={asset.url} className="mv-list-row">
                <div className="mv-list-col-preview">
                  {asset.type === "image" ? (
                    <img src={asset.url} alt="" className="mv-list-thumb" loading="lazy" />
                  ) : asset.type === "video" ? (
                    <div className="mv-list-thumb mv-list-thumb--video">
                      <Film size={16} />
                    </div>
                  ) : (
                    <div className="mv-list-thumb mv-list-thumb--other">
                      <Layers size={16} />
                    </div>
                  )}
                </div>
                <div className="mv-list-col-name">
                  <span className="mv-list-filename" title={asset.filename}>{asset.filename}</span>
                  <span className={`mv-ext-badge ${extColor(asset.extension)}`}>{asset.extension}</span>
                </div>
                <div className="mv-list-col-size">
                  <span className="mv-list-size">{asset.sizeFormatted}</span>
                </div>
                <div className="mv-list-col-usage">
                  <span className={`mv-usage-pill ${asset.usageCount > 0 ? "mv-usage-pill--used" : "mv-usage-pill--unused"}`}>
                    {asset.usageCount > 0 ? `${asset.usageCount} doc${asset.usageCount > 1 ? "s" : ""}` : "Neutilizat"}
                  </span>
                </div>
                <div className="mv-list-col-path">
                  <span className="mv-list-path" title={asset.relativePath}>{asset.relativePath}</span>
                </div>
                <div className="mv-list-col-actions">
                  <button
                    type="button"
                    onClick={() => handleCopyMarkdown(asset)}
                    className={`mv-copy-btn${isCopied ? " mv-copy-btn--copied" : ""}`}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? "Copiat!" : "Markdown"}</span>
                  </button>
                  <a href={asset.url} target="_blank" rel="noopener noreferrer" className="mv-open-btn">
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LOAD MORE ───────────────────────────────────────────────── */}
      {filteredAssets.length > displayLimit && !loading && (
        <div className="mv-load-more-wrap">
          <button
            type="button"
            id="media-load-more-btn"
            onClick={() => setDisplayLimit((p) => p + 48)}
            className="mv-load-more-btn"
          >
            <span>Încarcă mai multe</span>
            <span className="mv-load-more-count">{filteredAssets.length - displayLimit} rămase</span>
          </button>
        </div>
      )}

    </div>
  );
}
