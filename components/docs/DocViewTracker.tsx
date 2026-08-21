"use client";

import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface DocViewTrackerProps {
  slug: string;
  initialViews?: number;
}

export function DocViewTracker({ slug, initialViews = 0 }: DocViewTrackerProps) {
  const [views, setViews] = useState<number>(initialViews);

  useEffect(() => {
    if (!slug) return;

    const sessionKey = `wf_viewed_${slug}`;
    const alreadyTracked = typeof window !== "undefined" && sessionStorage.getItem(sessionKey);

    async function recordView() {
      try {
        if (!alreadyTracked) {
          sessionStorage.setItem(sessionKey, "1");
          const res = await fetch("/api/analytics/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });

          if (res.ok) {
            const data = await res.json();
            if (typeof data.views === "number") {
              setViews(data.views);
            }
          }
        } else {
          // Fetch current views without incrementing
          const res = await fetch(`/api/analytics/view?slug=${encodeURIComponent(slug)}`);
          if (res.ok) {
            const data = await res.json();
            if (typeof data.views === "number") {
              setViews(data.views);
            }
          }
        }
      } catch (err) {
        // silent fail on network glitch
      }
    }

    recordView();
  }, [slug]);

  const formattedViews = views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views;

  return (
    <div className="page-meta-item page-meta-item--views" title={`${views} vizualizări totale`}>
      <Eye size={13} className="text-cyan-400" />
      <span>{formattedViews} {views === 1 ? "vizualizare" : "vizualizări"}</span>
    </div>
  );
}
