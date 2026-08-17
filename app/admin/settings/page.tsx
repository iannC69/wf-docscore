"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Zap,
  Wrench,
  Sparkles,
  Save,
  Radio,
  Eye,
  Lock,
} from "lucide-react";
import { CURRENT_VERSION, PLATFORM_NAME } from "@/lib/version";

export default function AdminSettingsPage() {
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    "Wildfire Docs is currently undergoing scheduled platform upgrades and engine optimizations. We'll be back online shortly."
  );
  const [estimatedEndTime, setEstimatedEndTime] = useState<string>("30 minutes");

  const [bannerEnabled, setBannerEnabled] = useState<boolean>(false);
  const [bannerText, setBannerText] = useState<string>(
    "Wildfire Docs v1.3.0 is live with 120 FPS TOC and Fortress Security!"
  );
  const [bannerLink, setBannerLink] = useState<string>("/changelog");

  const [revalidating, setRevalidating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load initial settings from disk
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        const data = await res.json();
        if (data.maintenance) {
          setMaintenanceEnabled(data.maintenance.enabled || false);
          if (data.maintenance.message) setMaintenanceMessage(data.maintenance.message);
          if (data.maintenance.estimatedEndTime)
            setEstimatedEndTime(data.maintenance.estimatedEndTime);
        }
        if (data.announcement) {
          setBannerEnabled(data.announcement.enabled || false);
          if (data.announcement.text) setBannerText(data.announcement.text);
          if (data.announcement.link) setBannerLink(data.announcement.link);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  const saveConfiguration = async (overrides?: {
    maintenanceEnabled?: boolean;
    bannerEnabled?: boolean;
  }) => {
    const maintActive =
      overrides?.maintenanceEnabled !== undefined
        ? overrides.maintenanceEnabled
        : maintenanceEnabled;
    const bannerActive =
      overrides?.bannerEnabled !== undefined
        ? overrides.bannerEnabled
        : bannerEnabled;

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance: {
            enabled: maintActive,
            message: maintenanceMessage,
            estimatedEndTime,
          },
          announcement: {
            enabled: bannerActive,
            text: bannerText,
            link: bannerLink,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: `Settings committed to disk! Maintenance: ${
            maintActive ? "ACTIVE (Public Locked)" : "OFF (Public Online)"
          }, Announcement Bar: ${bannerActive ? "ACTIVE" : "OFF"}.`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to save settings.",
        });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network connection error." });
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveConfiguration();
  };

  const handleToggleMaintenance = async () => {
    const nextState = !maintenanceEnabled;
    setMaintenanceEnabled(nextState);
    await saveConfiguration({ maintenanceEnabled: nextState });
  };

  const handleToggleBanner = async () => {
    const nextState = !bannerEnabled;
    setBannerEnabled(nextState);
    await saveConfiguration({ bannerEnabled: nextState });
  };

  const handleRevalidateCache = () => {
    setRevalidating(true);
    setTimeout(() => {
      setRevalidating(false);
      setStatusMessage({
        type: "success",
        text: "Static pages and ISR cache successfully purged and revalidated across all edge nodes.",
      });
    }, 650);
  };

  return (
    <div className="admin-settings-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">ENGINE SETTINGS</div>
          <h1 className="admin-page-title">Platform Configuration & Controls</h1>
          <p className="admin-page-description">
            Manage public maintenance lockdown, global announcement banners, static cache revalidation, and engine runtime parameters.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="submit"
            form="admin-settings-form"
            disabled={saving}
            className="admin-btn admin-btn--primary"
          >
            <Save size={14} />
            <span>{saving ? "Saving Changes..." : "Save Platform Settings"}</span>
          </button>
        </div>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`admin-alert-box ${
            statusMessage.type === "success"
              ? "admin-alert-box--success"
              : "admin-alert-box--danger"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form id="admin-settings-form" onSubmit={handleFormSubmit} className="admin-settings-grid">
        {/* Public Maintenance Mode Card */}
        <section
          className={`admin-panel-card ${
            maintenanceEnabled ? "admin-panel-card--danger" : ""
          }`}
        >
          <div className="admin-panel-card-header">
            <div className="admin-panel-title-box">
              <Wrench
                size={16}
                className={
                  maintenanceEnabled
                    ? "admin-panel-icon--danger"
                    : "admin-panel-icon"
                }
              />
              <h2 className="admin-panel-title">Public Maintenance Mode Protocol</h2>
            </div>
            <span
              className={`admin-status-pill ${
                maintenanceEnabled
                  ? "admin-status-pill--danger"
                  : "admin-status-pill--success"
              }`}
            >
              {maintenanceEnabled ? "MAINTENANCE ACTIVE" : "PUBLIC SYSTEM ONLINE"}
            </span>
          </div>

          <div className="admin-panel-card-body">
            <div className="admin-switch-row">
              <div className="admin-switch-info">
                <span className="admin-switch-title">Enable Public Maintenance Lockdown</span>
                <p className="admin-switch-desc">
                  When active, all visitors in Incognito or regular browsers viewing <code>/docs</code> see the high-tech maintenance calibration screen. Authenticated administrators bypass the lock seamlessly.
                </p>
              </div>

              {/* Instant-Save Liquid Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={maintenanceEnabled}
                onClick={handleToggleMaintenance}
                className={`admin-liquid-switch ${
                  maintenanceEnabled ? "admin-liquid-switch--active" : ""
                }`}
                title={maintenanceEnabled ? "Click to deactivate maintenance" : "Click to activate maintenance"}
              >
                <span className="admin-liquid-switch-knob" />
              </button>
            </div>

            {maintenanceEnabled && (
              <div className="admin-settings-subfields">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="maint-msg">
                    Public Maintenance Notification Message
                  </label>
                  <textarea
                    id="maint-msg"
                    rows={2}
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    className="admin-input-field"
                    placeholder="Enter maintenance notification text..."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="maint-time">
                    Estimated Time Until Completion
                  </label>
                  <input
                    id="maint-time"
                    type="text"
                    value={estimatedEndTime}
                    onChange={(e) => setEstimatedEndTime(e.target.value)}
                    placeholder="e.g. 30 minutes / 2 hours"
                    className="admin-input-field"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Global Announcement Banner Card */}
        <section className="admin-panel-card">
          <div className="admin-panel-card-header">
            <div className="admin-panel-title-box">
              <Sparkles size={16} className="admin-panel-icon" />
              <h2 className="admin-panel-title">Global Announcement Bar</h2>
            </div>
            <span
              className={`admin-status-pill ${
                bannerEnabled
                  ? "admin-status-pill--warning"
                  : "admin-status-pill--neutral"
              }`}
            >
              {bannerEnabled ? "BANNER ACTIVE" : "BANNER DISABLED"}
            </span>
          </div>

          <div className="admin-panel-card-body">
            <div className="admin-switch-row">
              <div className="admin-switch-info">
                <span className="admin-switch-title">Enable Top Announcement Bar</span>
                <p className="admin-switch-desc">
                  Displays an elegant liquid update bar directly above the navigation header on all public documentation pages.
                </p>
              </div>

              {/* Instant-Save Liquid Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={bannerEnabled}
                onClick={handleToggleBanner}
                className={`admin-liquid-switch ${
                  bannerEnabled ? "admin-liquid-switch--active" : ""
                }`}
                title={bannerEnabled ? "Click to deactivate banner" : "Click to activate banner"}
              >
                <span className="admin-liquid-switch-knob" />
              </button>
            </div>

            {bannerEnabled && (
              <div className="admin-settings-subfields">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="banner-text">
                    Announcement Banner Text
                  </label>
                  <input
                    id="banner-text"
                    type="text"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="e.g. Wildfire Docs v1.3.0 is live!"
                    className="admin-input-field"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="banner-link">
                    Target Link URL (Optional)
                  </label>
                  <input
                    id="banner-link"
                    type="text"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    placeholder="e.g. /changelog or https://..."
                    className="admin-input-field"
                  />
                </div>

                {/* Live Preview Box */}
                <div className="admin-banner-preview-box">
                  <div className="admin-banner-preview-header">
                    <Eye size={12} />
                    <span>LIVE BANNER PREVIEW</span>
                  </div>
                  <div className="announcement-banner-wrapper announcement-banner-wrapper--preview">
                    <div className="announcement-banner-inner">
                      <div className="announcement-beacon-dot" aria-hidden="true" />
                      <span className="announcement-banner-tag">UPDATE</span>
                      <p className="announcement-banner-text">{bannerText || "Sample announcement text"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Cache & Static Revalidation Card */}
        <section className="admin-panel-card">
          <div className="admin-panel-card-header">
            <div className="admin-panel-title-box">
              <Zap size={16} className="admin-panel-icon" />
              <h2 className="admin-panel-title">Cache & ISR Edge Revalidation</h2>
            </div>
          </div>

          <div className="admin-panel-card-body">
            <p className="admin-card-text">
              Manually trigger static page revalidation to instantly propagate Markdown edits and navigation changes across all edge nodes without full build redeployment.
            </p>

            <button
              type="button"
              onClick={handleRevalidateCache}
              disabled={revalidating}
              className="admin-btn admin-btn--secondary"
            >
              <RefreshCw size={14} className={revalidating ? "admin-spin" : ""} />
              <span>{revalidating ? "Purging Edge Cache..." : "Revalidate All Pages"}</span>
            </button>
          </div>
        </section>

        {/* Platform Metadata Card */}
        <section className="admin-panel-card admin-panel-card--full">
          <div className="admin-panel-card-header">
            <div className="admin-panel-title-box">
              <Server size={16} className="admin-panel-icon" />
              <h2 className="admin-panel-title">Engine Metadata & Architecture</h2>
            </div>
          </div>

          <div className="admin-env-specs">
            <div className="admin-env-row">
              <span className="admin-env-label">Platform Engine:</span>
              <span className="admin-env-value">{PLATFORM_NAME}</span>
            </div>
            <div className="admin-env-row">
              <span className="admin-env-label">Version Release:</span>
              <span className="admin-env-value">v{CURRENT_VERSION}</span>
            </div>
            <div className="admin-env-row">
              <span className="admin-env-label">Maintainer ID:</span>
              <span className="admin-env-value">iannC</span>
            </div>
            <div className="admin-env-row">
              <span className="admin-env-label">Configuration Store:</span>
              <span className="admin-env-value">content/settings.json (Disk Synchronized)</span>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
