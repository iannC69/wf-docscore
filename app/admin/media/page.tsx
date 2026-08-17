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
} from "lucide-react";
import type { MediaAsset, MediaScanResult } from "@/lib/admin/mediaScanner";

export default function AdminMediaVaultPage() {
  const [data, setData] = useState<MediaScanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "used" | "unused">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"used" | "name" | "size-desc" | "size-asc">("used");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(36);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load media", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopyMarkdown = (asset: MediaAsset) => {
    const snippet =
      asset.type === "video"
        ? `<video src="${asset.url}" controls className="docs-video-player" />`
        : `![${asset.filename.replace(/\.[^/.]+$/, "")}](${asset.url})`;

    navigator.clipboard.writeText(snippet);
    setCopiedId(asset.url);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const assets = data?.assets || [];

  const filteredAssets = useMemo(() => {
    let result = assets.filter((asset) => {
      if (filter === "image" && asset.type !== "image") return false;
      if (filter === "video" && asset.type !== "video") return false;
      if (filter === "unused" && asset.usageCount > 0) return false;
      if (filter === "used" && asset.usageCount === 0) return false;

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

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "used") {
        if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
        return a.filename.localeCompare(b.filename);
      }
      if (sortBy === "name") {
        return a.filename.localeCompare(b.filename);
      }
      if (sortBy === "size-desc") {
        return b.sizeBytes - a.sizeBytes;
      }
      if (sortBy === "size-asc") {
        return a.sizeBytes - b.sizeBytes;
      }
      return 0;
    });

    return result;
  }, [assets, filter, searchQuery, sortBy]);

  const visibleAssets = filteredAssets.slice(0, displayLimit);

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">MEDIA & ASSET VAULT</div>
          <h1 className="admin-page-title">Manager Imagini, Video & Resurse Docs</h1>
          <p className="admin-page-description">
            Explorează, verifică utilizarea în cele 62+ de articole și copiază instantaneu sintaxa Markdown pentru orice resursă media din platformă.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={fetchMedia}
            disabled={loading}
            className="admin-btn admin-btn--primary"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Se scanează..." : "Rescanează Fișiere"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-media-metrics-grid">
        <div className="admin-media-metric-card">
          <div className="admin-media-metric-header">
            <span>TOTAL ASSETS</span>
            <FolderOpen size={16} className="text-[var(--color-primary)]" />
          </div>
          <div className="admin-media-metric-value">{data?.totalAssets ?? 0} fișiere</div>
          <div className="admin-media-metric-sub">
            {data?.imagesCount ?? 0} imagini, {data?.videosCount ?? 0} videoclipuri
          </div>
        </div>

        <div className="admin-media-metric-card">
          <div className="admin-media-metric-header">
            <span>DIMENSIUNE TOTALĂ</span>
            <HardDrive size={16} className="text-blue-400" />
          </div>
          <div className="admin-media-metric-value text-blue-400">
            {data?.totalSizeFormatted ?? "0 B"}
          </div>
          <div className="admin-media-metric-sub">Stocare ocupată în public/</div>
        </div>

        <div className="admin-media-metric-card">
          <div className="admin-media-metric-header">
            <span>RESURSE NEUTILIZATE</span>
            <FileWarning size={16} className="text-amber-400" />
          </div>
          <div className="admin-media-metric-value text-amber-400">
            {data?.unusedCount ?? 0}
          </div>
          <div className="admin-media-metric-sub">Fără referințe în articole Markdown</div>
        </div>
      </div>

      {/* Media Filter & Search Toolbar */}
      <div className="admin-media-toolbar">
        <div className="admin-media-filter-group">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`admin-filter-pill ${filter === "all" ? "admin-filter-pill--active" : ""}`}
          >
            Toate ({data?.totalAssets ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setFilter("image")}
            className={`admin-filter-pill ${filter === "image" ? "admin-filter-pill--active" : ""}`}
          >
            Imagini ({data?.imagesCount ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setFilter("video")}
            className={`admin-filter-pill ${filter === "video" ? "admin-filter-pill--active" : ""}`}
          >
            Video ({data?.videosCount ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setFilter("used")}
            className={`admin-filter-pill ${filter === "used" ? "admin-filter-pill--active" : ""}`}
          >
            Utilizate ({data?.usedCount ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unused")}
            className={`admin-filter-pill ${filter === "unused" ? "admin-filter-pill--active" : ""}`}
          >
            Neutilizate ({data?.unusedCount ?? 0})
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort Selector */}
          <div className="admin-media-sort-box">
            <ArrowUpDown size={13} className="text-[var(--color-text-tertiary)]" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="admin-media-sort-select"
            >
              <option value="used">Cele Mai Folosite</option>
              <option value="name">Nume (A - Z)</option>
              <option value="size-desc">Dimensiune (Mari)</option>
              <option value="size-asc">Dimensiune (Mici)</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="admin-media-search-box">
            <Search size={14} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Caută după nume sau extensie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-media-search-input"
            />
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="admin-media-grid">
        {loading ? (
          <div className="admin-media-loading">
            <RefreshCw size={24} className="animate-spin text-[var(--color-primary)] mb-2" />
            <span>Se scanează și se încarcă cele {data?.totalAssets || 193} fișiere media...</span>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="admin-media-empty">
            <ImageIcon size={36} className="text-[var(--color-text-tertiary)] mb-2" />
            <p>Niciun fișier media găsit pentru filtrul curent.</p>
          </div>
        ) : (
          visibleAssets.map((asset) => {
            const isCopied = copiedId === asset.url;
            return (
              <div key={asset.url} className="admin-asset-card">
                {/* Asset Preview Frame with Live Video Preview */}
                <div className="admin-asset-preview-box">
                  {asset.type === "image" ? (
                    <img
                      src={asset.url}
                      alt={asset.filename}
                      className="admin-asset-img-preview"
                      loading="lazy"
                    />
                  ) : asset.type === "video" ? (
                    <div className="admin-asset-video-wrap">
                      <video
                        src={`${asset.url}#t=0.1`}
                        preload="metadata"
                        muted
                        playsInline
                        className="admin-asset-video-element"
                        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                      <div className="admin-asset-video-play-indicator">
                        <Play size={12} fill="currentColor" />
                        <span>HOVER PLAY</span>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-asset-other-placeholder">
                      <Layers size={28} className="text-blue-400" />
                      <span>{asset.extension}</span>
                    </div>
                  )}

                  {/* Usage Badge */}
                  <span
                    className={`admin-asset-usage-badge ${
                      asset.usageCount > 0
                        ? "admin-asset-usage-badge--used"
                        : "admin-asset-usage-badge--unused"
                    }`}
                  >
                    {asset.usageCount > 0 ? `În ${asset.usageCount} docs` : "Neutilizat"}
                  </span>
                </div>

                {/* Asset Info & Actions */}
                <div className="admin-asset-info">
                  <div className="admin-asset-name-row" title={asset.filename}>
                    <span className="admin-asset-name">{asset.filename}</span>
                    <span className="admin-asset-ext-badge">{asset.extension}</span>
                  </div>

                  <div className="admin-asset-meta-row">
                    <span>{asset.sizeFormatted}</span>
                    <span className="truncate max-w-[140px]" title={asset.relativePath}>
                      {asset.relativePath}
                    </span>
                  </div>

                  {asset.usedInDocs.length > 0 && (
                    <div className="admin-asset-used-list">
                      <span>Docs: </span>
                      {asset.usedInDocs.slice(0, 2).map((slug, idx) => (
                        <span key={idx} className="admin-asset-doc-tag" title={slug}>
                          {slug}
                        </span>
                      ))}
                      {asset.usedInDocs.length > 2 && (
                        <span className="text-[var(--color-text-tertiary)]">
                          +{asset.usedInDocs.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="admin-asset-card-actions">
                    <button
                      type="button"
                      onClick={() => handleCopyMarkdown(asset)}
                      className={`admin-asset-copy-btn ${
                        isCopied ? "admin-asset-copy-btn--copied" : ""
                      }`}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? "Copiat în Clipboard!" : "Copiază Markdown"}</span>
                    </button>

                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-asset-open-btn"
                      title="Deschide resursa originală"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Show More Pagination Button */}
      {filteredAssets.length > displayLimit && (
        <div className="flex justify-center mt-8 pb-10">
          <button
            type="button"
            onClick={() => setDisplayLimit((prev) => prev + 36)}
            className="admin-btn admin-btn--secondary"
          >
            <span>Încarcă mai multe ({filteredAssets.length - displayLimit} rămase)</span>
          </button>
        </div>
      )}
    </div>
  );
}
