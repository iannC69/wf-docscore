"use client";

import React, { useState } from "react";
import { Maximize2 } from "lucide-react";
import { useLightbox } from "./MediaLightbox";

interface DocImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt?: string;
  src?: string;
}

export function DocImage({ src, alt, className = "", ...props }: DocImageProps) {
  const { openMedia } = useLightbox();
  const [isHovered, setIsHovered] = useState(false);

  if (!src) return null;

  const handleClick = () => {
    openMedia({
      type: "image",
      src,
      title: alt || "Previzualizare Imagine",
      alt,
    });
  };

  return (
    <figure
      className="doc-image-figure not-prose"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      title="Apasă pentru a mări imaginea (Lightbox HD)"
    >
      <div className="doc-image-wrap">
        <img
          src={src}
          alt={alt || "Doc image"}
          className={`doc-image-element ${className}`}
          loading="lazy"
          {...props}
        />

        {/* Hover Zoom Overlay Badge */}
        <div className={`doc-image-zoom-overlay ${isHovered ? "doc-image-zoom-overlay--visible" : ""}`}>
          <span className="doc-image-zoom-pill">
            <Maximize2 size={13} aria-hidden="true" />
            <span>Mărește Imaginea</span>
          </span>
        </div>
      </div>
      {alt && alt.trim() !== "" && alt !== "Doc image" && (
        <figcaption className="doc-image-caption">{alt}</figcaption>
      )}
    </figure>
  );
}
