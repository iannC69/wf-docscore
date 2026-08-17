"use client";

import React, { useRef, useState } from "react";
import { Film, Play, Maximize2, Sparkles, Volume2 } from "lucide-react";
import { useLightbox } from "./MediaLightbox";

interface DocVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  title?: string;
  badge?: string;
}

export function DocVideo({
  src,
  title,
  badge = "In-Game Preview",
  className = "",
  controls: _controls,
  autoPlay: _autoPlay,
  ...props
}: DocVideoProps) {
  const { openMedia } = useLightbox();
  const [isHovered, setIsHovered] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  if (!src || (typeof src === "string" && src.trim() === "")) return null;

  const videoSrc = typeof src === "string" ? src : "";
  const displayTitle = title || "Previzualizare Video HD";

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openMedia({
      type: "video",
      src: videoSrc,
      title: displayTitle,
    });
  };

  return (
    <figure className="doc-orange-player-figure not-prose">
      <div
        className={`doc-orange-player-card ${isHovered ? "doc-orange-player-card--hover" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOpenModal}
        title="Apasă pentru a deschide videoclipul în mod teatru HD"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleOpenModal(e as unknown as React.MouseEvent);
          }
        }}
      >
        {/* Top Header Bar */}
        <div className="doc-orange-player-header">
          <div className="doc-orange-player-badge">
            <Film size={12} className="text-amber-400" aria-hidden="true" />
            <span>{badge}</span>
          </div>

          <span className="doc-orange-player-title">{displayTitle}</span>

          <div className="doc-orange-player-status">
            <span className="player-status-dot" aria-hidden="true" />
            <span>HD PREVIEW</span>
          </div>
        </div>

        {/* Video Canvas Stage with Center Orange Play Button */}
        <div className="doc-orange-player-stage">
          {/* Background Video Frame (NO native controls so it never covers the UI) */}
          <video
            ref={videoPreviewRef}
            src={videoSrc}
            preload="metadata"
            muted
            playsInline
            className="doc-orange-player-bg-video"
            {...props}
          />

          {/* Dark Glass Vignette Overlay */}
          <div className="doc-orange-player-overlay" />

          {/* Big Glowing Center Orange Play Button */}
          <div className="doc-orange-play-btn-wrap">
            <div className="doc-orange-play-btn-pulse" aria-hidden="true" />
            <div className="doc-orange-play-btn">
              <Play size={28} className="play-icon-fill" aria-hidden="true" />
            </div>
            <span className="doc-orange-play-label">
              <span>Lansează Video</span>
              <Sparkles size={11} className="text-amber-300" aria-hidden="true" />
            </span>
          </div>
        </div>

        {/* Bottom Bar: Action Hint & Fullscreen Icon */}
        <div className="doc-orange-player-footer">
          <div className="player-footer-left">
            <Volume2 size={13} className="text-amber-400/80" aria-hidden="true" />
            <span>Click oriunde pentru a deschide playerul cinematic</span>
          </div>
          <div className="player-footer-right">
            <span className="player-theatre-tag">
              <Maximize2 size={11} aria-hidden="true" />
              <span>Mod Teatru</span>
            </span>
          </div>
        </div>
      </div>

      {title && <figcaption className="doc-orange-player-caption">{title}</figcaption>}
    </figure>
  );
}
