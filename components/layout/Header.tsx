"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LayoutControls } from "@/components/ui/LayoutControls";
import { MobileMenuToggle } from "@/components/layout/MobileMenuToggle";
import { SearchModal } from "@/components/ui/SearchModal";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const { locale, t } = useLanguage();

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const homeHref = locale === "ro" ? "/docs/ro" : "/docs";

  return (
    <>
      <header className="header" role="banner">
        <div className="header-inner">
          {/* Left: Brand Logo + Mobile toggle */}
          <div className="header-left">
            <MobileMenuToggle />
            <Link href={homeHref} className="header-logo" aria-label={t.navbar.docsHome}>
              <span className="header-logo-icon" aria-hidden="true">
                <img
                  src="/logo.png"
                  alt="Wildfire Logo"
                  className="header-logo-img"
                  width={20}
                  height={20}
                />
              </span>
              <span className="header-logo-text">
                <span className="header-logo-name">WILDFIRE</span>
                <span className="header-logo-badge">DOCS</span>
              </span>
              <span className="header-version-pill" aria-label="Platform Version">
                v1.0
              </span>
            </Link>
          </div>

          {/* Center: Frosted Glass Search Trigger */}
          <div className="header-center">
            <button
              type="button"
              className="header-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label={t.common.searchPlaceholder}
              id="search-trigger"
            >
              <Search size={14} className="header-search-icon" aria-hidden="true" />
              <span className="header-search-text">{t.common.searchPlaceholder}</span>
              <kbd className="header-search-kbd">
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>
          </div>

          {/* Right: Language Switcher + Layout Switcher + Mobile Search + GitHub Link + Theme toggle */}
          <div className="header-right">
            <button
              type="button"
              className="header-mobile-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label={t.common.searchPlaceholder}
              title={t.navbar.search}
            >
              <Search size={16} />
            </button>

            {/* Prominent Language Switcher (🇬🇧 EN / 🇷🇴 RO) */}
            <LanguageSwitcher variant="header" />

            <LayoutControls />

            <div className="header-divider" aria-hidden="true" />

            <a
              href="https://github.com/iannC69/wf-docscore"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon-btn"
              aria-label={t.navbar.githubRepo}
              title={t.navbar.githubRepo}
            >
              <GithubIcon size={16} />
            </a>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal with Locale Support */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
