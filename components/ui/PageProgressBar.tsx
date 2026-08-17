"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Finish loading on pathname change
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 280);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on links to start progress bar instantly
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;
      const href = anchor.getAttribute("href");

      // Check if it's an internal route navigation (starts with / and not hash only)
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !anchor.target &&
        href !== pathname
      ) {
        setLoading(true);
        setProgress(30);

        // Progressively increment
        const step1 = setTimeout(() => setProgress(65), 120);
        const step2 = setTimeout(() => setProgress(88), 350);

        return () => {
          clearTimeout(step1);
          clearTimeout(step2);
        };
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="page-progress-bar-container"
      aria-hidden="true"
    >
      <div
        className="page-progress-bar-fill"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
