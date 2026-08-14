"use client";
import { useEffect } from "react";

// Inject CSS keyframes once into <head>
const STYLE_ID = "liquid-fire-keyframes";

function injectKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
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
    @keyframes emberFloat {
      0%   { transform: translateY(0px)   translateX(0px)  scale(1);   opacity: 0.8; }
      25%  { transform: translateY(-12px) translateX(3px)  scale(0.9); opacity: 1; }
      50%  { transform: translateY(-20px) translateX(-4px) scale(1.1); opacity: 0.6; }
      75%  { transform: translateY(-28px) translateX(2px)  scale(0.8); opacity: 0.3; }
      100% { transform: translateY(-40px) translateX(-2px) scale(0.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

interface LiquidFireWaveProps {
  /** Flip the wave upside-down (for top placement) */
  flip?: boolean;
  /** Height of the SVG container */
  height?: number;
  className?: string;
}

export function LiquidFireWave({
  flip = false,
  height = 60,
  className = "",
}: LiquidFireWaveProps) {
  useEffect(() => {
    injectKeyframes();
  }, []);

  const transform = flip ? "scale(1, -1)" : undefined;

  return (
    <div
      className={`liquid-fire-wave ${className}`}
      style={{
        width: "100%",
        height,
        overflow: "hidden",
        display: "block",
        lineHeight: 0,
        transform,
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
          {/* Deep ember → bright fire gradient */}
          <linearGradient id="lf-grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(8,80%,35%)"  stopOpacity="0.90" />
            <stop offset="30%"  stopColor="hsl(18,95%,45%)" stopOpacity="0.95" />
            <stop offset="60%"  stopColor="hsl(28,98%,52%)" stopOpacity="0.90" />
            <stop offset="100%" stopColor="hsl(8,80%,35%)"  stopOpacity="0.90" />
          </linearGradient>
          {/* Mid amber layer */}
          <linearGradient id="lf-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(22,95%,50%)" stopOpacity="0.70" />
            <stop offset="50%"  stopColor="hsl(38,98%,58%)" stopOpacity="0.80" />
            <stop offset="100%" stopColor="hsl(22,95%,50%)" stopOpacity="0.70" />
          </linearGradient>
          {/* Bright tip */}
          <linearGradient id="lf-grad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="hsl(38,100%,62%)" stopOpacity="0.50" />
            <stop offset="50%"  stopColor="hsl(45,100%,68%)" stopOpacity="0.60" />
            <stop offset="100%" stopColor="hsl(38,100%,62%)" stopOpacity="0.50" />
          </linearGradient>
        </defs>

        {/* Layer 1 — deep base */}
        <path
          fill="url(#lf-grad1)"
          style={{ animation: "lavaWave1 9s ease-in-out infinite" }}
          d="M0,60 L0,35 C120,28 240,42 360,35 C480,28 600,42 720,38 C840,34 960,44 1080,36 C1200,28 1320,40 1440,35 L1440,60 Z"
        />
        {/* Layer 2 — mid amber */}
        <path
          fill="url(#lf-grad2)"
          style={{ animation: "lavaWave2 7s ease-in-out infinite 1s" }}
          d="M0,60 L0,44 C160,38 320,50 480,44 C640,38 800,48 960,42 C1120,36 1280,46 1440,42 L1440,60 Z"
        />
        {/* Layer 3 — bright tip */}
        <path
          fill="url(#lf-grad3)"
          style={{ animation: "lavaWave3 5s ease-in-out infinite 0.5s" }}
          d="M0,60 L0,50 C200,46 400,54 600,50 C800,46 1000,52 1200,48 C1300,46 1370,50 1440,48 L1440,60 Z"
        />
      </svg>
    </div>
  );
}
