"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ImageIcon,
  Sparkles,
  Check,
  X,
  Wand2,
  Eye,
  Sliders,
} from "lucide-react";

export interface StudioGalleryBuilderProps {
  cursorLine: number;
  availableAssets: { filename: string; url: string; sizeFormatted?: string }[];
  onInsert: (markdownGallery: string) => void;
  onClose: () => void;
}

interface GallerySlide {
  id: string;
  url: string;
  title: string;
  caption: string;
}

export function StudioGalleryBuilderModal({
  cursorLine,
  availableAssets,
  onInsert,
  onClose,
}: StudioGalleryBuilderProps) {
  const [layout, setLayout] = useState<"carousel" | "grid-2" | "grid-3">("carousel");
  const [slides, setSlides] = useState<GallerySlide[]>([
    {
      id: "slide_1",
      url: availableAssets[0]?.url || "/media/preview1.png",
      title: "Demonstrație MVP Anthem CS2",
      caption: "Efect vizual și sonor redat la finalul fiecărei runde câștigate.",
    },
    {
      id: "slide_2",
      url: availableAssets[1]?.url || "/media/preview2.png",
      title: "Meniu Interactiv !shop",
      caption: "Interfață intuitivă de achiziție skin-uri și beneficii VIP.",
    },
  ]);

  const addSlide = () => {
    const nextNum = slides.length + 1;
    const randomAsset = availableAssets[slides.length % Math.max(1, availableAssets.length)];
    setSlides([
      ...slides,
      {
        id: `slide_${Date.now()}_${nextNum}`,
        url: randomAsset?.url || `/media/preview${nextNum}.png`,
        title: `Imagine Cadru #${nextNum}`,
        caption: `Descriere detaliată pentru imaginea #${nextNum}`,
      },
    ]);
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) return;
    setSlides(slides.filter((s) => s.id !== id));
  };

  const updateSlide = (id: string, updates: Partial<GallerySlide>) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const generateMarkdown = (): string => {
    if (layout === "carousel") {
      const slideBlocks = slides.map(
        (s) => `![${s.title.trim() || "Slide"}](${s.url.trim()})\n*${s.caption.trim() || s.title.trim()}*`
      );
      return `\`\`\`\`carousel\n${slideBlocks.join("\n<!-- slide -->\n")}\n\`\`\`\``;
    }

    // Grid layout
    const cols = layout === "grid-2" ? "2" : "3";
    const imageItems = slides
      .map((s) => `  <DocCard title="${s.title}" image="${s.url}" description="${s.caption}" />`)
      .join("\n");
    return `<DocGrid cols="${cols}">\n${imageItems}\n</DocGrid>`;
  };

  const handleInsert = () => {
    onInsert(generateMarkdown());
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container studio-gallery-modal-container">
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <div className="studio-modal-badge">
              <Layers size={12} />
              <span>CONSTRUCTOR GALERIE &amp; CAROUSEL</span>
            </div>
            <h3 className="admin-modal-title">Configurare Galerie Imagini Multi-Slide</h3>
          </div>
          <button type="button" className="admin-modal-close-btn" onClick={onClose} title="Închide">
            <X size={16} />
          </button>
        </div>

        {/* Location line indicator pill */}
        <div className="studio-builder-line-indicator">
          <div className="studio-builder-line-pill">
            <span className="studio-builder-pulse-dot" />
            <span>Punct de inserare activ: <strong>Linia {cursorLine}</strong> din document</span>
          </div>
          <div className="studio-builder-dimensions-badge">
            <Layers size={12} />
            <span>{slides.length} Slide-uri ({layout})</span>
          </div>
        </div>

        <div className="admin-modal-body">
          {/* Layout Switcher */}
          <div className="admin-form-group">
            <label className="admin-form-label">Stil Layout Galerie</label>
            <div className="studio-gallery-layouts-grid">
              <button
                type="button"
                className={`studio-gallery-layout-btn ${layout === "carousel" ? "active" : ""}`}
                onClick={() => setLayout("carousel")}
              >
                <Sliders size={15} />
                <strong>Carousel Interactiv (Slide-uri)</strong>
                <span>Comutare fluidă cu butoane Next/Prev</span>
              </button>
              <button
                type="button"
                className={`studio-gallery-layout-btn ${layout === "grid-2" ? "active" : ""}`}
                onClick={() => setLayout("grid-2")}
              >
                <ImageIcon size={15} />
                <strong>Grilă 2 Coloane (Side-by-Side)</strong>
                <span>Comparație două cadre paralele</span>
              </button>
              <button
                type="button"
                className={`studio-gallery-layout-btn ${layout === "grid-3" ? "active" : ""}`}
                onClick={() => setLayout("grid-3")}
              >
                <Layers size={15} />
                <strong>Grilă 3 Coloane (Cards Grid)</strong>
                <span>Vitrină compactă pentru multiple iteme</span>
              </button>
            </div>
          </div>

          {/* Slides List */}
          <div className="studio-gallery-slides-header">
            <label className="admin-form-label mb-0">Imagini &amp; Texte Slide-uri ({slides.length})</label>
            <button type="button" onClick={addSlide} className="studio-table-action-pill studio-table-action-pill--add">
              <Plus size={12} />
              <span>Adaugă Slide Nou</span>
            </button>
          </div>

          <div className="studio-gallery-slides-list">
            {slides.map((slide, idx) => (
              <div key={slide.id} className="studio-gallery-slide-card">
                <div className="studio-gallery-slide-index">#{idx + 1}</div>
                <div className="studio-gallery-slide-thumb">
                  {slide.url ? (
                    <img src={slide.url} alt="Slide Preview" onError={(e) => ((e.target as any).style.display = "none")} />
                  ) : (
                    <ImageIcon size={24} className="text-slate-500" />
                  )}
                </div>

                <div className="studio-gallery-slide-inputs">
                  <div className="studio-gallery-input-row">
                    <input
                      type="text"
                      placeholder="Cale URL Imagine (/media/...)"
                      value={slide.url}
                      onChange={(e) => updateSlide(slide.id, { url: e.target.value })}
                      className="admin-form-input admin-table-mono"
                    />
                    {availableAssets.length > 0 && (
                      <select
                        className="admin-form-input studio-gallery-vault-select"
                        onChange={(e) => {
                          if (e.target.value) updateSlide(slide.id, { url: e.target.value });
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Alege din Vault...
                        </option>
                        {availableAssets.map((asset) => (
                          <option key={asset.url} value={asset.url}>
                            {asset.filename}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="studio-gallery-input-row">
                    <input
                      type="text"
                      placeholder="Titlu Imagine (ex. Meniu Principal)"
                      value={slide.title}
                      onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                      className="admin-form-input"
                    />
                    <input
                      type="text"
                      placeholder="Descriere / Subtitlu Slide"
                      value={slide.caption}
                      onChange={(e) => updateSlide(slide.id, { caption: e.target.value })}
                      className="admin-form-input"
                    />
                  </div>
                </div>

                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlide(slide.id)}
                    className="studio-gallery-slide-del-btn"
                    title="Șterge acest slide"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onClose}>
            Anulează
          </button>
          <button type="button" className="admin-btn admin-btn--primary studio-insert-submit-btn" onClick={handleInsert}>
            <Check size={14} />
            <span>Inserează Galeria la Linia {cursorLine}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
