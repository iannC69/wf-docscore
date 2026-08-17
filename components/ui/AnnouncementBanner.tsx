"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, Sparkles, AlertTriangle, Info } from "lucide-react";
import type { PlatformSettings } from "@/lib/security/settingsStore";

interface AnnouncementBannerProps {
  initialSettings?: PlatformSettings["announcement"];
}

export function AnnouncementBanner({ initialSettings }: AnnouncementBannerProps) {
  const [settings, setSettings] = useState<PlatformSettings["announcement"] | null>(
    initialSettings || null
  );
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    async function loadAnnouncement() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.announcement && data.announcement.enabled) {
            const isDismissed = sessionStorage.getItem(
              `wf_announcement_${data.announcement.text}`
            );
            if (!isDismissed) {
              setSettings(data.announcement);
              document.documentElement.style.setProperty(
                "--announcement-height",
                "38px"
              );
            } else {
              setDismissed(true);
              document.documentElement.style.setProperty(
                "--announcement-height",
                "0px"
              );
            }
          } else {
            setSettings(null);
            document.documentElement.style.setProperty(
              "--announcement-height",
              "0px"
            );
          }
        }
      } catch {}
    }
    loadAnnouncement();

    return () => {
      document.documentElement.style.setProperty("--announcement-height", "0px");
    };
  }, []);

  const handleDismiss = () => {
    if (settings) {
      sessionStorage.setItem(`wf_announcement_${settings.text}`, "true");
    }
    document.documentElement.style.setProperty("--announcement-height", "0px");
    setDismissed(true);
  };

  if (!settings || !settings.enabled || dismissed) return null;

  const type = settings.type || "fire";

  return (
    <div
      className={`announcement-banner announcement-banner--${type}`}
      role="region"
      aria-label="Platform Announcement"
    >
      <div className="announcement-banner-inner">
        {/* Left/Center Content */}
        <div className="announcement-banner-content">
          {/* Badge Pill */}
          <div className="announcement-banner-badge">
            <span className="announcement-banner-dot" />
            <span>
              {type === "fire" ? "WILDFIRE" : type === "warning" ? "ATENȚIE" : "INFO"}
            </span>
          </div>

          {/* Announcement Message */}
          <span className="announcement-banner-text">{settings.text}</span>

          {/* Action Link Button */}
          {settings.link && (
            <Link href={settings.link} className="announcement-banner-link-pill">
              <span>{settings.linkText || "Află Mai Multe"}</span>
              <ArrowRight size={11} className="announcement-banner-arrow" />
            </Link>
          )}
        </div>

        {/* Dismiss Button */}
        {settings.dismissible !== false && (
          <button
            type="button"
            onClick={handleDismiss}
            className="announcement-banner-close-btn"
            aria-label="Închide anunțul"
            title="Închide anunțul"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
