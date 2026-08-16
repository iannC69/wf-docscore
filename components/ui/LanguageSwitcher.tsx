"use client";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LOCALES, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  variant?: "header" | "sidebar" | "compact";
}

export function LanguageSwitcher({ variant = "header" }: LanguageSwitcherProps) {
  const { locale, setLocale, isPending } = useLanguage();

  return (
    <div
      className={`lang-switcher lang-switcher--${variant} ${isPending ? "lang-switcher--pending" : ""}`}
      role="group"
      aria-label="Language selector"
    >
      {LOCALES.map((l) => {
        const isActive = locale === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code)}
            className={`lang-switcher-btn ${isActive ? "lang-switcher-btn--active" : ""}`}
            aria-pressed={isActive}
            aria-label={`Switch language to ${l.name}`}
            title={`Switch to ${l.name}`}
          >
            <span className="lang-flag" aria-hidden="true">
              {l.flag}
            </span>
            <span className="lang-code">{l.code.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
