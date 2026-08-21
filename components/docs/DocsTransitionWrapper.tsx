"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { usePathname } from "next/navigation";
import { DocSkeleton } from "@/components/ui/DocSkeleton";

interface DocsTransitionWrapperProps {
  children: React.ReactNode;
}

export function DocsTransitionWrapper({ children }: DocsTransitionWrapperProps) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [displayedChildren, setDisplayedChildren] = useState<React.ReactNode>(children);
  const navigationStartTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or incoming children update (navigation finished)
  useEffect(() => {
    const elapsed = Date.now() - navigationStartTimeRef.current;
    const minDisplayTime = 80; // 80ms fast buffer so transitions are snappy
    const remainingTime = Math.max(0, minDisplayTime - elapsed);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isNavigating) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedChildren(children);
        setIsNavigating(false);
      }, remainingTime);
    } else {
      setDisplayedChildren(children);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, children]);

  // Intercept internal doc link clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        href &&
        href.startsWith("/docs") &&
        !href.startsWith("#") &&
        !href.startsWith("/api/") &&
        !anchor.target &&
        !anchor.hasAttribute("download")
      ) {
        // Strip hash / search for path comparison
        const targetPath = href.split("#")[0].split("?")[0];
        const currentPath = window.location.pathname;

        if (targetPath !== currentPath) {
          navigationStartTimeRef.current = Date.now();
          setIsNavigating(true);

          // Fail-safe auto reset after 4s in case navigation was cancelled
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setIsNavigating(false);
          }, 4000);
        }
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="docs-transition-container">
      {isNavigating ? (
        <div className="docs-transition-skeleton animate-fade-in">
          <DocSkeleton />
        </div>
      ) : (
        <div className="docs-transition-content animate-fade-in">
          {displayedChildren}
        </div>
      )}
    </div>
  );
}
