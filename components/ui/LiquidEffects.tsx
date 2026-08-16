"use client";
import { useEffect } from "react";

const STYLE_ID = "liquid-bg-keyframes";

function injectStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes liquidDrift1 {
      0%   { transform: translate(0px, 0px) scale(1); opacity: 0.85; }
      25%  { transform: translate(80px, -40px) scale(1.12); opacity: 0.70; }
      50%  { transform: translate(40px, 60px) scale(0.92); opacity: 0.80; }
      75%  { transform: translate(-50px, 20px) scale(1.08); opacity: 0.72; }
      100% { transform: translate(0px, 0px) scale(1); opacity: 0.85; }
    }
    @keyframes liquidDrift2 {
      0%   { transform: translate(0px, 0px) scale(1); opacity: 0.75; }
      33%  { transform: translate(-70px, 60px) scale(1.15); opacity: 0.60; }
      66%  { transform: translate(80px, -40px) scale(0.90); opacity: 0.80; }
      100% { transform: translate(0px, 0px) scale(1); opacity: 0.75; }
    }
    @keyframes liquidDrift3 {
      0%   { transform: translate(0px, 0px) scale(1); opacity: 0.70; }
      40%  { transform: translate(60px, 90px) scale(1.18); opacity: 0.80; }
      80%  { transform: translate(-80px, -50px) scale(0.85); opacity: 0.55; }
      100% { transform: translate(0px, 0px) scale(1); opacity: 0.70; }
    }
    @keyframes liquidDrift4 {
      0%   { transform: translate(0px, 0px) scale(1); opacity: 0.60; }
      50%  { transform: translate(-50px, -60px) scale(1.10); opacity: 0.75; }
      100% { transform: translate(0px, 0px) scale(1); opacity: 0.60; }
    }

    /* Lava Flow Oscillations */
    @keyframes lavaFlow1 {
      0%, 100% { d: path("M0,100 L0,30 C180,18 360,42 540,28 C720,16 900,38 1080,24 C1260,14 1350,32 1440,25 L1440,100 Z"); }
      50%       { d: path("M0,100 L0,38 C180,26 360,16 540,36 C720,28 900,16 1080,34 C1260,26 1350,18 1440,32 L1440,100 Z"); }
    }
    @keyframes lavaFlow2 {
      0%, 100% { d: path("M0,100 L0,45 C200,32 400,58 600,40 C800,28 1000,52 1200,38 C1320,30 1380,48 1440,40 L1440,100 Z"); }
      50%       { d: path("M0,100 L0,35 C200,50 400,30 600,50 C800,42 1000,28 1200,48 C1320,40 1380,32 1440,46 L1440,100 Z"); }
    }
    @keyframes lavaFlow3 {
      0%, 100% { d: path("M0,100 L0,60 C240,48 480,68 720,54 C960,44 1200,64 1320,52 1400,60 1440,56 L1440,100 Z"); }
      50%       { d: path("M0,100 L0,50 C240,65 480,45 720,62 C960,56 1200,46 1320,60 1400,52 1440,58 L1440,100 Z"); }
    }
    @keyframes lavaFlow4 {
      0%, 100% { d: path("M0,100 L0,74 C300,66 600,80 900,70 C1100,64 1300,76 1440,70 L1440,100 Z"); }
      50%       { d: path("M0,100 L0,68 C300,78 600,65 900,78 C1100,72 1300,66 1440,74 L1440,100 Z"); }
    }

    /* Floating Molten Ember Particles */
    @keyframes emberRise1 {
      0%   { transform: translateY(0px) translateX(0px) scale(0.8); opacity: 0; }
      30%  { opacity: 0.9; }
      80%  { opacity: 0.7; }
      100% { transform: translateY(-65px) translateX(14px) scale(0.3); opacity: 0; }
    }
    @keyframes emberRise2 {
      0%   { transform: translateY(0px) translateX(0px) scale(0.9); opacity: 0; }
      25%  { opacity: 0.95; }
      75%  { opacity: 0.6; }
      100% { transform: translateY(-75px) translateX(-16px) scale(0.2); opacity: 0; }
    }
    @keyframes emberRise3 {
      0%   { transform: translateY(0px) translateX(0px) scale(0.7); opacity: 0; }
      40%  { opacity: 0.9; }
      85%  { opacity: 0.5; }
      100% { transform: translateY(-55px) translateX(10px) scale(0.2); opacity: 0; }
    }

    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    [data-theme="light"] .liquid-vignette {
      opacity: 0.15 !important;
    }
    [data-theme="light"] .liquid-blob-1 {
      opacity: 0.35 !important;
    }
    [data-theme="light"] .liquid-blob-2 {
      opacity: 0.25 !important;
    }
    [data-theme="light"] .liquid-blob-3 {
      opacity: 0.20 !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Full-page dynamic liquid fire background with glowing translucent gradients.
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
      {/* Primary Fire Orange Magma Orb */}
      <div
        className="liquid-blob-1"
        style={{
          animation: "liquidDrift1 20s ease-in-out infinite",
          background:
            "radial-gradient(circle at center, hsl(26 100% 52% / 0.26) 0%, hsl(20 100% 48% / 0.14) 40%, transparent 70%)",
          bottom: "-5%",
          left: "-5%",
          position: "absolute",
          height: "75vh",
          width: "70vw",
          filter: "blur(40px)",
          willChange: "transform",
        }}
      />

      {/* Amber / Golden Incandescent Orb */}
      <div
        className="liquid-blob-2"
        style={{
          animation: "liquidDrift2 26s ease-in-out infinite 2s",
          background:
            "radial-gradient(circle at center, hsl(38 100% 52% / 0.22) 0%, hsl(28 100% 48% / 0.10) 45%, transparent 70%)",
          right: "-5%",
          top: "0%",
          position: "absolute",
          height: "65vh",
          width: "55vw",
          filter: "blur(45px)",
          willChange: "transform",
        }}
      />

      {/* Crimson / Deep Fire Core Orb */}
      <div
        className="liquid-blob-3"
        style={{
          animation: "liquidDrift3 32s ease-in-out infinite 5s",
          background:
            "radial-gradient(circle at center, hsl(6 95% 52% / 0.18) 0%, hsl(16 100% 46% / 0.08) 40%, transparent 68%)",
          left: "25%",
          top: "20%",
          position: "absolute",
          height: "55vh",
          width: "50vw",
          filter: "blur(50px)",
          willChange: "transform",
        }}
      />

      {/* Luminous Center Ambient Highlight */}
      <div
        className="liquid-blob-4"
        style={{
          animation: "liquidDrift4 24s ease-in-out infinite 1s",
          background:
            "radial-gradient(circle at center, hsl(26 100% 56% / 0.15) 0%, transparent 60%)",
          right: "20%",
          bottom: "10%",
          position: "absolute",
          height: "50vh",
          width: "45vw",
          filter: "blur(35px)",
          willChange: "transform",
        }}
      />

      {/* Subtle Depth Vignette */}
      <div
        className="liquid-vignette"
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, hsl(220 20% 5% / 0.5) 100%)",
          inset: 0,
          position: "absolute",
        }}
      />
    </div>
  );
}

/**
 * Rich Molten Lava Tank with flowing liquid layers and floating rising embers.
 * Fills up the lower portion of the sidebar dynamically.
 */
export function LiquidFireWave({
  height = 95,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  useEffect(() => {
    injectStyles();
  }, []);

  return (
    <div
      className={`liquid-lava-tank ${className}`}
      style={{
        width: "100%",
        height,
        position: "relative",
        overflow: "hidden",
        display: "block",
        lineHeight: 0,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {/* Top soft fade mask */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "24px",
          background: "linear-gradient(180deg, var(--sidebar-bg) 0%, transparent 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Floating Ember Particles */}
      <div
        style={{
          position: "absolute",
          bottom: "35px",
          left: "25%",
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: "hsl(44 100% 60%)",
          boxShadow: "0 0 8px hsl(44 100% 60%)",
          animation: "emberRise1 3.5s ease-out infinite 0.2s",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "60%",
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: "hsl(26 100% 55%)",
          boxShadow: "0 0 8px hsl(26 100% 55%)",
          animation: "emberRise2 4.2s ease-out infinite 1.4s",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "28px",
          left: "80%",
          width: "3px",
          height: "3px",
          borderRadius: "50%",
          background: "hsl(38 100% 65%)",
          boxShadow: "0 0 7px hsl(38 100% 65%)",
          animation: "emberRise3 3.8s ease-out infinite 2.1s",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* SVG Multi-Layer Molten Waves */}
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/* Deep Magma Base */}
          <linearGradient id="lava-base-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(8, 90%, 28%)" stopOpacity="0.95" />
            <stop offset="25%"  stopColor="hsl(16, 95%, 36%)" stopOpacity="0.95" />
            <stop offset="65%"  stopColor="hsl(24, 100%, 45%)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="hsl(8, 90%, 28%)" stopOpacity="0.95" />
          </linearGradient>

          {/* Liquid Fire Middle */}
          <linearGradient id="lava-mid-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(20, 100%, 46%)" stopOpacity="0.85" />
            <stop offset="45%"  stopColor="hsl(28, 100%, 52%)" stopOpacity="0.90" />
            <stop offset="85%"  stopColor="hsl(36, 100%, 56%)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(20, 100%, 46%)" stopOpacity="0.85" />
          </linearGradient>

          {/* Molten Amber Crest */}
          <linearGradient id="lava-crest-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(32, 100%, 54%)" stopOpacity="0.70" />
            <stop offset="50%"  stopColor="hsl(44, 100%, 60%)" stopOpacity="0.80" />
            <stop offset="100%" stopColor="hsl(32, 100%, 54%)" stopOpacity="0.70" />
          </linearGradient>

          {/* Incandescent Golden Froth */}
          <linearGradient id="lava-froth-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(44, 100%, 66%)" stopOpacity="0.50" />
            <stop offset="50%"  stopColor="hsl(52, 100%, 78%)" stopOpacity="0.65" />
            <stop offset="100%" stopColor="hsl(44, 100%, 66%)" stopOpacity="0.50" />
          </linearGradient>
        </defs>

        {/* Wave Layer 1 — Deep Bed */}
        <path
          fill="url(#lava-base-grad)"
          style={{ animation: "lavaFlow1 11s ease-in-out infinite" }}
          d="M0,100 L0,30 C180,18 360,42 540,28 C720,16 900,38 1080,24 C1260,14 1350,32 1440,25 L1440,100 Z"
        />

        {/* Wave Layer 2 — Molten Magma */}
        <path
          fill="url(#lava-mid-grad)"
          style={{ animation: "lavaFlow2 8s ease-in-out infinite 0.6s" }}
          d="M0,100 L0,45 C200,32 400,58 600,40 C800,28 1000,52 1200,38 C1320,30 1380,48 1440,40 L1440,100 Z"
        />

        {/* Wave Layer 3 — Amber Swell */}
        <path
          fill="url(#lava-crest-grad)"
          style={{ animation: "lavaFlow3 6s ease-in-out infinite 1.2s" }}
          d="M0,100 L0,60 C240,48 480,68 720,54 C960,44 1200,64 1320,52 1400,60 1440,56 L1440,100 Z"
        />

        {/* Wave Layer 4 — Golden Froth Tip */}
        <path
          fill="url(#lava-froth-grad)"
          style={{ animation: "lavaFlow4 4.5s ease-in-out infinite 0.3s" }}
          d="M0,100 L0,74 C300,66 600,80 900,70 C1100,64 1300,76 1440,70 L1440,100 Z"
        />
      </svg>
    </div>
  );
}
