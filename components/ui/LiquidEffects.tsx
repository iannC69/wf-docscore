"use client";
import { useEffect } from "react";

const STYLE_ID = "liquid-bg-keyframes";

function injectStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes liquidDrift1 {
      0%   { transform: translate(0px, 0px)   scale(1);    opacity: 0.60; }
      25%  { transform: translate(80px, -40px) scale(1.08); opacity: 0.45; }
      50%  { transform: translate(40px,  60px) scale(0.94); opacity: 0.55; }
      75%  { transform: translate(-50px, 20px) scale(1.04); opacity: 0.48; }
      100% { transform: translate(0px, 0px)   scale(1);    opacity: 0.60; }
    }
    @keyframes liquidDrift2 {
      0%   { transform: translate(0px, 0px)    scale(1);    opacity: 0.35; }
      33%  { transform: translate(-60px, 50px)  scale(1.10); opacity: 0.25; }
      66%  { transform: translate(70px, -30px)  scale(0.92); opacity: 0.40; }
      100% { transform: translate(0px, 0px)    scale(1);    opacity: 0.35; }
    }
    @keyframes liquidDrift3 {
      0%   { transform: translate(0px, 0px)    scale(1);    opacity: 0.20; }
      40%  { transform: translate(50px, 80px)  scale(1.12); opacity: 0.28; }
      80%  { transform: translate(-70px, -40px) scale(0.88); opacity: 0.18; }
      100% { transform: translate(0px, 0px)    scale(1);    opacity: 0.20; }
    }
    @keyframes lavaWave1 {
      0%, 100% { d: path("M0,60 L0,35 C120,28 240,42 360,35 C480,28 600,42 720,38 C840,34 960,44 1080,36 C1200,28 1320,40 1440,35 L1440,60 Z"); }
      33%  { d: path("M0,60 L0,42 C120,34 240,48 360,40 C480,46 600,32 720,42 C840,48 960,34 1080,42 C1200,46 1320,34 1440,40 L1440,60 Z"); }
      66%  { d: path("M0,60 L0,38 C120,44 240,30 360,38 C480,32 600,44 720,36 C840,42 960,30 1080,40 C1200,34 1320,46 1440,38 L1440,60 Z"); }
    }
    @keyframes lavaWave2 {
      0%, 100% { d: path("M0,60 L0,44 C160,38 320,50 480,44 C640,38 800,48 960,42 C1120,36 1280,46 1440,42 L1440,60 Z"); }
      50%       { d: path("M0,60 L0,48 C160,42 320,38 480,46 C640,50 800,40 960,48 C1120,44 1280,38 1440,46 L1440,60 Z"); }
    }
    @keyframes lavaWave3 {
      0%, 100% { d: path("M0,60 L0,50 C200,46 400,54 600,50 C800,46 1000,52 1200,48 C1300,46 1370,50 1440,48 L1440,60 Z"); }
      40%       { d: path("M0,60 L0,52 C200,48 400,50 600,54 C800,52 1000,48 1200,52 C1300,50 1370,52 1440,50 L1440,60 Z"); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Full-page liquid fire background.
 * Renders 3 slowly drifting radial blobs + optional bottom wave strip.
 * Positioned fixed behind everything (z-index: 0).
 */
export function LiquidBackground() {
  useEffect(() => {
    injectStyles();
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        position: "fixed",
        zIndex: 0,
      }}
    >
      {/* ── Blob 1 — deep orange, bottom-left anchor ── */}
      <div
        style={{
          animation: "liquidDrift1 22s ease-in-out infinite",
          background:
            "radial-gradient(ellipse 600px 500px at center, hsl(26 100% 52% / 0.09) 0%, transparent 70%)",
          bottom: "-10%",
          left: "-5%",
          position: "absolute",
          height: "80vh",
          width: "70vw",
          willChange: "transform",
        }}
      />

      {/* ── Blob 2 — ember red, top-right anchor ── */}
      <div
        style={{
          animation: "liquidDrift2 30s ease-in-out infinite 4s",
          background:
            "radial-gradient(ellipse 500px 400px at center, hsl(8 90% 40% / 0.07) 0%, transparent 70%)",
          right: "-10%",
          top: "5%",
          position: "absolute",
          height: "60vh",
          width: "50vw",
          willChange: "transform",
        }}
      />

      {/* ── Blob 3 — amber, center ── */}
      <div
        style={{
          animation: "liquidDrift3 40s ease-in-out infinite 8s",
          background:
            "radial-gradient(ellipse 400px 300px at center, hsl(38 100% 52% / 0.05) 0%, transparent 70%)",
          left: "30%",
          top: "30%",
          position: "absolute",
          height: "50vh",
          width: "40vw",
          willChange: "transform",
        }}
      />

      {/* ── Vignette overlay — keeps edges very dark ── */}
      <div
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, hsl(0 0% 7% / 0.6) 100%)",
          inset: 0,
          position: "absolute",
        }}
      />
    </div>
  );
}

/**
 * Bottom liquid fire wave strip.
 * Use inside the sidebar or as a section separator.
 */
export function LiquidFireWave({
  flip = false,
  height = 56,
  className = "",
}: {
  flip?: boolean;
  height?: number;
  className?: string;
}) {
  useEffect(() => {
    injectStyles();
  }, []);

  return (
    <div
      className={`liquid-fire-wave ${className}`}
      style={{
        width: "100%",
        height,
        overflow: "hidden",
        display: "block",
        lineHeight: 0,
        transform: flip ? "scale(1, -1)" : undefined,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 1440 ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lf-g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(8,80%,32%)"  stopOpacity="0.85" />
            <stop offset="30%"  stopColor="hsl(18,98%,44%)" stopOpacity="0.90" />
            <stop offset="60%"  stopColor="hsl(28,100%,50%)" stopOpacity="0.88" />
            <stop offset="100%" stopColor="hsl(8,80%,32%)"  stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="lf-g2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(22,95%,48%)" stopOpacity="0.65" />
            <stop offset="50%"  stopColor="hsl(38,100%,58%)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="hsl(22,95%,48%)" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="lf-g3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(38,100%,62%)" stopOpacity="0.40" />
            <stop offset="50%"  stopColor="hsl(45,100%,68%)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="hsl(38,100%,62%)" stopOpacity="0.40" />
          </linearGradient>
        </defs>

        {/* Layer 1 — deep base */}
        <path
          fill="url(#lf-g1)"
          style={{ animation: "lavaWave1 9s ease-in-out infinite" }}
          d="M0,60 L0,35 C120,28 240,42 360,35 C480,28 600,42 720,38 C840,34 960,44 1080,36 C1200,28 1320,40 1440,35 L1440,60 Z"
        />
        {/* Layer 2 — mid amber */}
        <path
          fill="url(#lf-g2)"
          style={{ animation: "lavaWave2 7s ease-in-out infinite 1s" }}
          d="M0,60 L0,44 C160,38 320,50 480,44 C640,38 800,48 960,42 C1120,36 1280,46 1440,42 L1440,60 Z"
        />
        {/* Layer 3 — bright tip */}
        <path
          fill="url(#lf-g3)"
          style={{ animation: "lavaWave3 5s ease-in-out infinite 0.5s" }}
          d="M0,60 L0,50 C200,46 400,54 600,50 C800,46 1000,52 1200,48 C1300,46 1370,50 1440,48 L1440,60 Z"
        />
      </svg>
    </div>
  );
}
