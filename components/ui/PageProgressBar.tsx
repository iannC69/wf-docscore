"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  // 1. Finish loading cleanly on route / searchParams change
  useEffect(() => {
    clearAllTimers();
    setProgress(100);
    const completeTimer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 250);
    timersRef.current.push(completeTimer);

    return clearAllTimers;
  }, [pathname, searchParams]);

  // 2. Intercept internal link clicks to start progress bar instantly with fail-safe auto-reset
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Skip if click was prevented or modifier keys were pressed (Cmd/Ctrl for new tab)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !href.startsWith("/api/") &&
        !anchor.target &&
        !anchor.hasAttribute("download") &&
        href !== pathname
      ) {
        clearAllTimers();
        setLoading(true);
        setProgress(35);

        // Incremental steps
        const t1 = setTimeout(() => setProgress(65), 150);
        const t2 = setTimeout(() => setProgress(85), 350);

        // Auto-reset fail-safe after 4 seconds if navigation was cancelled or aborted
        const failSafe = setTimeout(() => {
          setProgress(100);
          const finishTimer = setTimeout(() => {
            setLoading(false);
            setProgress(0);
          }, 200);
          timersRef.current.push(finishTimer);
        }, 4000);

        timersRef.current.push(t1, t2, failSafe);
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      clearAllTimers();
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="page-progress-bar-container" aria-hidden="true">
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
