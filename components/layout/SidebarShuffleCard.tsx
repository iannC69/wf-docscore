"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Shuffle,
} from "lucide-react";

interface ShuffleSlide {
  id: string;
  dotColor: string;
  dotGlow: string;
  category: string;
  title: string;
  description: string;
  badge: string;
  badgeColor?: string;
  actionType: "open-ai" | "link" | "next-tip";
  actionLabel: string;
  actionHref?: string;
}

const PRO_TIPS = [
  "Folosește comanda !ws în chat pentru a alege orice skin de armă în meci.",
  "Tastează !knife sau !gloves pentru a-ți schimba gratuit cuțitul și mănușile.",
  "Comanda !shop îți permite să cumperi efecte, tag-uri și titluri personalizate.",
  "Câștigă Credite jucând pe server sau participând la jocurile !dice și !roulette.",
  "Găsești orice ghid sau comandă de CS2 căutând în Docs cu scurtătura Ctrl+K.",
];

export function SidebarShuffleCard() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides: ShuffleSlide[] = [
    // 1. AI Assistant Launcher
    {
      id: "ai-assistant",
      dotColor: "#fb923c",
      dotGlow: "rgba(251, 146, 60, 0.6)",
      category: "ASISTENT AI",
      title: "WildFire AI Docs",
      description: "Întreabă orice despre comenzi CS2, credite, skin-uri sau VIP.",
      badge: "Online 24/7",
      badgeColor: "#fb923c",
      actionType: "open-ai",
      actionLabel: "Deschide Chat",
    },
    // 2. CS2 Skins & Knives Guide
    {
      id: "skins-guide",
      dotColor: "#38bdf8",
      dotGlow: "rgba(56, 189, 248, 0.6)",
      category: "SKINURI & CUȚITE",
      title: "Sistemul !ws & !knife",
      description: "Personalizează-ți armele cu !ws, !knife, !gloves și !agents.",
      badge: "!ws / !knife",
      badgeColor: "#38bdf8",
      actionType: "link",
      actionLabel: "Vezi Ghid",
      actionHref: "/docs/systems/skins",
    },
    // 3. Economy & Gambling
    {
      id: "economy-guide",
      dotColor: "#34d399",
      dotGlow: "rgba(52, 211, 153, 0.6)",
      category: "ECONOMIE & CREDITE",
      title: "Credite & Mini-Game-uri",
      description: "Acumulează credite și testează-ți norocul la !dice și !roulette.",
      badge: "!credits",
      badgeColor: "#34d399",
      actionType: "link",
      actionLabel: "Vezi Sistem",
      actionHref: "/docs/currency",
    },
    // 4. Discord Community
    {
      id: "discord-hub",
      dotColor: "#818cf8",
      dotGlow: "rgba(129, 140, 248, 0.6)",
      category: "COMUNITATE CS2",
      title: "Discord-ul Oficial",
      description: "2.860+ jucători de CS2. Anunțuri, update-uri și suport.",
      badge: "discord.gg",
      badgeColor: "#a5b4fc",
      actionType: "link",
      actionLabel: "Conectează-te",
      actionHref: "https://discord.gg/wildfire",
    },
    // 5. Pro Tip
    {
      id: "pro-tip",
      dotColor: "#facc15",
      dotGlow: "rgba(250, 204, 21, 0.6)",
      category: "PRO TIP CS2",
      title: "Sfat de la Comunitate",
      description: PRO_TIPS[tipIndex],
      badge: `Tip #${tipIndex + 1}`,
      badgeColor: "#fde047",
      actionType: "next-tip",
      actionLabel: "Alt Sfat",
    },
  ];

  const currentSlide = slides[currentIndex];

  // Auto shuffle timer
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleOpenAi = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-ai-helper"));
    }
  };

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % PRO_TIPS.length);
  };

  return (
    <div
      className="sidebar-liquid-card sidebar-shuffle-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="WildFire Community Spotlight"
    >
      {/* Top micro progress bar */}
      <div className="shuffle-card-progress" key={currentIndex} />

      {/* Header row with status dot, category & manual nav arrows */}
      <div className="liquid-card-header shuffle-card-header">
        <div className="shuffle-header-left">
          <span
            className="liquid-card-dot"
            style={{
              background: currentSlide.dotColor,
              boxShadow: `0 0 6px ${currentSlide.dotGlow}`,
            }}
            aria-hidden="true"
          />
          <span className="shuffle-category-label">{currentSlide.category}</span>
        </div>

        {/* Dots & Nav buttons */}
        <div className="shuffle-nav-controls">
          <button
            type="button"
            onClick={handlePrev}
            className="shuffle-ctrl-btn"
            title="Anterior"
            aria-label="Anterior"
          >
            <ChevronLeft size={11} />
          </button>
          
          <div className="shuffle-dots-wrap">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`shuffle-dot ${currentIndex === idx ? "shuffle-dot--active" : ""}`}
                title={`Mergi la slide ${idx + 1}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="shuffle-ctrl-btn"
            title="Următor"
            aria-label="Următor"
          >
            <ChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* Slide Title */}
      <div className="shuffle-title-row">
        <span className="liquid-card-title">{currentSlide.title}</span>
      </div>

      {/* Slide Description */}
      <p className="liquid-card-desc shuffle-desc">{currentSlide.description}</p>

      {/* Footer Row: Action Button + Badge */}
      <div className="liquid-card-footer shuffle-card-footer">
        {/* Action Button */}

        {currentSlide.actionType === "open-ai" && (
          <button
            type="button"
            onClick={handleOpenAi}
            className="shuffle-action-btn shuffle-action-btn--ai"
          >
            <Sparkles size={10} />
            <span>{currentSlide.actionLabel}</span>
          </button>
        )}

        {currentSlide.actionType === "link" && currentSlide.actionHref && (
          currentSlide.actionHref.startsWith("http") ? (
            <a
              href={currentSlide.actionHref}
              target="_blank"
              rel="noopener noreferrer"
              className="shuffle-action-btn"
            >
              <ExternalLink size={10} />
              <span>{currentSlide.actionLabel}</span>
            </a>
          ) : (
            <Link href={currentSlide.actionHref} className="shuffle-action-btn">
              <ChevronRight size={10} />
              <span>{currentSlide.actionLabel}</span>
            </Link>
          )
        )}

        {currentSlide.actionType === "next-tip" && (
          <button
            type="button"
            onClick={handleNextTip}
            className="shuffle-action-btn"
          >
            <Shuffle size={10} />
            <span>{currentSlide.actionLabel}</span>
          </button>
        )}

        {/* Right Badge */}
        <span
          className="shuffle-badge"
          style={{
            color: currentSlide.badgeColor || "var(--color-primary)",
            borderColor: `${currentSlide.dotColor}40`,
            backgroundColor: `${currentSlide.dotColor}14`,
          }}
        >
          {currentSlide.badge}
        </span>
      </div>
    </div>
  );
}
