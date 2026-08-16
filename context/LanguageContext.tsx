"use client";
import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { type Locale, type Translations, translations } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  t: Translations;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "wf_docs_locale";
const COOKIE_NAME = "NEXT_LOCALE";

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Detect from pathname (e.g. /docs/ro/...) or localStorage or cookie
    if (pathname.includes("/docs/ro") || pathname.startsWith("/ro")) {
      setLocaleState("ro");
    } else {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && (stored === "en" || stored === "ro")) {
        setLocaleState(stored);
      }
    }
  }, [pathname]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute("lang", newLocale);

    startTransition(() => {
      // If current path has /ro/ or needs switching
      if (newLocale === "ro" && !pathname.includes("/docs/ro")) {
        const nextUrl = pathname.replace("/docs", "/docs/ro");
        router.push(nextUrl);
      } else if (newLocale === "en" && pathname.includes("/docs/ro")) {
        const nextUrl = pathname.replace("/docs/ro", "/docs");
        router.push(nextUrl);
      } else {
        router.refresh();
      }
    });
  };

  const t = translations[locale] || translations.en;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isPending }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
