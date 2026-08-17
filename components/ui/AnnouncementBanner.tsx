"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Flame, X } from "lucide-react";

interface AnnouncementBannerProps {
  text: string;
  link?: string;
}

export function AnnouncementBanner({ text, link }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissed && text) {
      document.documentElement.style.setProperty("--announcement-height", "38px");
    } else {
      document.documentElement.style.setProperty("--announcement-height", "0px");
    }
    return () => {
      document.documentElement.style.setProperty("--announcement-height", "0px");
    };
  }, [dismissed, text]);

  if (dismissed || !text) return null;

  return (
    <aside className="wildfire-topbar-broadcast" aria-label="Wildfire News Broadcast">
      <div className="wildfire-topbar-inner">
        {/* News Badge with animated Flame */}
        <div className="topbar-badge">
          <Flame size={12} className="topbar-flame-icon" />
          <span>DISPATCH</span>
        </div>

        {/* Centered News Headline */}
        <div className="topbar-headline-wrap">
          <span className="topbar-headline">{text}</span>
        </div>

        {/* Action Link */}
        {link && (
          <Link href={link} className="topbar-action-link">
            <span>Explore</span>
            <ArrowRight size={11} />
          </Link>
        )}

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="topbar-dismiss-btn"
          aria-label="Dismiss announcement"
          title="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </aside>
  );
}
