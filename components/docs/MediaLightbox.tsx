"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Copy,
  Check,
  Film,
  Image as ImageIcon,
  RotateCw,
} from "lucide-react";

interface LightboxMedia {
  type: "image" | "video";
  src: string;
  title?: string;
  alt?: string;
}

interface LightboxContextType {
  openMedia: (media: LightboxMedia) => void;
  closeLightbox: () => void;
}

const LightboxContext = createContext<LightboxContextType>({
  openMedia: () => {},
  closeLightbox: () => {},
});

export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [activeMedia, setActiveMedia] = useState<LightboxMedia | null>(null);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [rotation, setRotation] = useState(0);

  const openMedia = useCallback((media: LightboxMedia) => {
    setActiveMedia(media);
    setZoom(1);
    setRotation(0);
    setCopied(false);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveMedia(null);
    setZoom(1);
    setRotation(0);
    document.body.style.overflow = "";
  }, []);

  // Keyboard navigation (Escape to close, +/- to zoom)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeMedia) return;
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "+" || e.key === "=") {
        setZoom((prev) => Math.min(prev + 0.25, 3));
      } else if (e.key === "-") {
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
      } else if (e.key === "0") {
        setZoom(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMedia, closeLightbox]);

  const handleCopyLink = () => {
    if (!activeMedia) return;
    const fullUrl = activeMedia.src.startsWith("http")
      ? activeMedia.src
      : `${window.location.origin}${activeMedia.src}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeMedia) return;
    const a = document.createElement("a");
    a.href = activeMedia.src;
    a.download = activeMedia.src.split("/").pop() || "media-download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <LightboxContext.Provider value={{ openMedia, closeLightbox }}>
      {children}

      {/* Lightbox Modal Backdrop & Container */}
      {activeMedia && (
        <div
          className="wf-lightbox-overlay animate-fade-in"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Media Lightbox Preview"
        >
          {/* Lightbox Top Control Toolbar */}
          <div
            className="wf-lightbox-toolbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wf-lightbox-title-wrap">
              <div className="wf-lightbox-badge">
                {activeMedia.type === "video" ? (
                  <Film size={13} className="text-amber-400" />
                ) : (
                  <ImageIcon size={13} className="text-amber-400" />
                )}
                <span>
                  {activeMedia.type === "video" ? "Video HD Preview" : "Image Preview"}
                </span>
              </div>
              {activeMedia.title && (
                <span className="wf-lightbox-title">{activeMedia.title}</span>
              )}
            </div>

            <div className="wf-lightbox-actions">
              {/* Zoom In / Out for Images */}
              {activeMedia.type === "image" && (
                <>
                  <button
                    type="button"
                    className="wf-lightbox-btn"
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                    title="Zoom Out (-)"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="wf-lightbox-zoom-label">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    className="wf-lightbox-btn"
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                    title="Zoom In (+)"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    type="button"
                    className="wf-lightbox-btn"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    title="Rotește imaginea"
                  >
                    <RotateCw size={16} />
                  </button>
                </>
              )}

              {/* Copy URL */}
              <button
                type="button"
                className="wf-lightbox-btn"
                onClick={handleCopyLink}
                title="Copiază link-ul media"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-400" />
                ) : (
                  <Copy size={16} />
                )}
              </button>

              {/* Download */}
              <button
                type="button"
                className="wf-lightbox-btn"
                onClick={handleDownload}
                title="Descarcă fișierul"
              >
                <Download size={16} />
              </button>

              {/* Close Button */}
              <button
                type="button"
                className="wf-lightbox-btn wf-lightbox-btn--close"
                onClick={closeLightbox}
                title="Închide (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Lightbox Content Canvas */}
          <div
            className="wf-lightbox-stage"
            onClick={(e) => e.stopPropagation()}
          >
            {activeMedia.type === "image" ? (
              <img
                src={activeMedia.src}
                alt={activeMedia.alt || activeMedia.title || "Preview"}
                className="wf-lightbox-image"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            ) : (
              <div className="wf-lightbox-video-wrap">
                <video
                  src={activeMedia.src}
                  controls
                  autoPlay
                  playsInline
                  className="wf-lightbox-video"
                />
              </div>
            )}
          </div>

          {/* Bottom Hint */}
          <div className="wf-lightbox-footer">
            <span>Apasă <kbd>Esc</kbd> sau dă click pe fundal pentru a închide</span>
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
