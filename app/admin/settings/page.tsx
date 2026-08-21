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
  Download,
  Archive,
  FileCode,
  Megaphone,
  Layers,
  ExternalLink,
  Database,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
  Activity,
  Table,
} from "lucide-react";
import { CURRENT_VERSION, PLATFORM_NAME } from "@/lib/version";

export default function AdminSettingsPage() {
  // Maintenance State
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    "Wildfire Docs is currently undergoing scheduled platform upgrades and engine optimizations. We'll be back online shortly."
  );
  const [maintenanceReason, setMaintenanceReason] = useState<string>(
    "Actualizare structură documentație & optimizare index căutare"
  );
  const [estimatedEndTime, setEstimatedEndTime] = useState<string>("30 minutes");
  const [allowAdmins, setAllowAdmins] = useState<boolean>(true);

  // Announcement State
  const [bannerEnabled, setBannerEnabled] = useState<boolean>(false);
  const [bannerText, setBannerText] = useState<string>(
    "Wildfire Docs v1.5.0 este live cu Ghiduri CS2, Media Vault & Sistem de Securitate!"
  );
  const [bannerLink, setBannerLink] = useState<string>("/changelog");
  const [bannerLinkText, setBannerLinkText] = useState<string>("Vezi Noutățile");
  const [bannerType, setBannerType] = useState<"fire" | "info" | "warning">("fire");
  const [bannerDismissible, setBannerDismissible] = useState<boolean>(true);

  const [revalidating, setRevalidating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ─── Database & Analytics Hub State ─────────────────────────────────────────
  const [dbProvider, setDbProvider] = useState<"local" | "supabase">("local");
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>("");
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbViews, setDbViews] = useState<any[]>([]);
  const [dbFeedbacks, setDbFeedbacks] = useState<any[]>([]);
  const [dbTableTab, setDbTableTab] = useState<"views" | "feedbacks" | "config">("views");
  const [testingDb, setTestingDb] = useState<boolean>(false);
  const [testDbResult, setTestDbResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [savingDbConfig, setSavingDbConfig] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

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
          if (data.maintenance.reason) setMaintenanceReason(data.maintenance.reason);
          if (data.maintenance.estimatedEndTime)
            setEstimatedEndTime(data.maintenance.estimatedEndTime);
          if (data.maintenance.allowAdmins !== undefined)
            setAllowAdmins(data.maintenance.allowAdmins);
        }
        if (data.announcement) {
          setBannerEnabled(data.announcement.enabled || false);
          if (data.announcement.text) setBannerText(data.announcement.text);
          if (data.announcement.link) setBannerLink(data.announcement.link);
          if (data.announcement.linkText) setBannerLinkText(data.announcement.linkText);
          if (data.announcement.type) setBannerType(data.announcement.type);
          if (data.announcement.dismissible !== undefined)
            setBannerDismissible(data.announcement.dismissible);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
    loadDatabaseData();
  }, []);

  const loadDatabaseData = async () => {
    try {
      const res = await fetch("/api/admin/database");
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.status);
        setDbViews(data.views || []);
        setDbFeedbacks(data.feedbacks || []);
        if (data.config) {
          setDbProvider(data.config.provider || "local");
          setSupabaseUrl(data.config.supabaseUrl || "");
          setSupabaseAnonKey(data.config.supabaseAnonKey || "");
        }
      }
    } catch (err) {
      console.error("Failed to load database info", err);
    }
  };

  const handleTestDbConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setTestDbResult({ success: false, message: "Te rugăm să introduci Supabase URL și Cheia Anon." });
      return;
    }

    setTestingDb(true);
    setTestDbResult(null);

    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_connection",
          url: supabaseUrl,
          anonKey: supabaseAnonKey,
        }),
      });

      const data = await res.json();
      setTestDbResult(data);
    } catch (err: any) {
      setTestDbResult({ success: false, message: `Eroare de rețea: ${err.message}` });
    } finally {
      setTestingDb(false);
    }
  };

  const handleSaveDbConfig = async () => {
    setSavingDbConfig(true);
    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_config",
          provider: dbProvider,
          supabaseUrl,
          supabaseAnonKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.status);
        setStatusMessage({
          type: "success",
          text: `Configurația bazei de date a fost salvată! (${dbProvider === "supabase" ? "Supabase Cloud" : "Local Engine"})`,
        });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Eșec la salvarea configurației bazei de date." });
    } finally {
      setSavingDbConfig(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_feedback", id }),
      });

      if (res.ok) {
        setDbFeedbacks((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete feedback", err);
    }
  };

  const copySqlScript = () => {
    const sql = `-- WildFire Docs Supabase Migration Schema
create table if not exists doc_views (
  slug text primary key,
  total_views integer default 0,
  today_views integer default 0,
  last_viewed_at timestamp with time zone default now()
);

create table if not exists doc_feedbacks (
  id text primary key,
  slug text not null,
  rating text not null,
  comment text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS) & Public Policies
alter table doc_views enable row level security;
alter table doc_feedbacks enable row level security;

create policy "Allow public read on doc_views" on doc_views for select using (true);
create policy "Allow public insert/update on doc_views" on doc_views for all using (true);

create policy "Allow public read on doc_feedbacks" on doc_feedbacks for select using (true);
create policy "Allow public insert on doc_feedbacks" on doc_feedbacks for insert with check (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

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
            reason: maintenanceReason,
            estimatedEndTime,
            allowAdmins,
          },
          announcement: {
            enabled: bannerActive,
            text: bannerText,
            link: bannerLink,
            linkText: bannerLinkText,
            type: bannerType,
            dismissible: bannerDismissible,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: "Configurațiile platformei au fost salvate și aplicate pe disc.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Salvarea setărilor a eșuat.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Eroare de conexiune la server.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRevalidateCache = async () => {
    setRevalidating(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revalidate" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: "Cache-ul ISR al platformei și rutele statice au fost regenerate.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Eroare la invalidarea cache-ului.",
      });
    } finally {
      setRevalidating(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">ENGINE CONFIGURATION</div>
          <h1 className="admin-page-title">Setări Globale Platformă & Backup</h1>
          <p className="admin-page-description">
            Controlează bannerele publice de anunțuri, modul de mentenanță și descarcă backup-uri complete ale bazei de documentație.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={() => saveConfiguration()}
            disabled={saving}
            className="admin-btn admin-btn--primary"
          >
            <Save size={14} />
            <span>{saving ? "Se salvează..." : "Salvează Toate Setările"}</span>
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

      <div className="admin-settings-layout-grid">
        {/* Left Column: Announcement Banner & Maintenance */}
        <div className="flex flex-col gap-6">
          {/* Global Announcement Banner Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="flex items-center gap-3">
                <div className="admin-card-icon-box text-orange-400">
                  <Megaphone size={16} />
                </div>
                <div>
                  <h3 className="admin-card-title">Banner Public de Anunțuri</h3>
                  <p className="admin-card-subtitle">
                    Afișează un banner proeminent în antetul tuturor paginilor de documentație
                  </p>
                </div>
              </div>

              <label className="admin-toggle-switch">
                <input
                  type="checkbox"
                  checked={bannerEnabled}
                  onChange={(e) => {
                    setBannerEnabled(e.target.checked);
                    saveConfiguration({ bannerEnabled: e.target.checked });
                  }}
                />
                <span className="admin-toggle-slider" />
              </label>
            </div>

            <div className="admin-card-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Tip Banner & Culoare</label>
                <div className="admin-banner-type-picker">
                  <button
                    type="button"
                    onClick={() => setBannerType("fire")}
                    className={`admin-banner-type-btn ${
                      bannerType === "fire" ? "admin-banner-type-btn--fire-active" : ""
                    }`}
                  >
                    <span className="admin-banner-type-dot bg-orange-500" />
                    <span>Wildfire Ember (Portocaliu)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBannerType("info")}
                    className={`admin-banner-type-btn ${
                      bannerType === "info" ? "admin-banner-type-btn--info-active" : ""
                    }`}
                  >
                    <span className="admin-banner-type-dot bg-blue-500" />
                    <span>Informativ (Albastru)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBannerType("warning")}
                    className={`admin-banner-type-btn ${
                      bannerType === "warning" ? "admin-banner-type-btn--warning-active" : ""
                    }`}
                  >
                    <span className="admin-banner-type-dot bg-amber-500" />
                    <span>Atenționare (Chihlimbar)</span>
                  </button>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Mesaj Anunț</label>
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="Ex: Am actualizat ghidul de Currency și regulamentul..."
                  className="admin-form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="admin-form-group">
                  <label className="admin-form-label">Link Buton (Opțional)</label>
                  <input
                    type="text"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    placeholder="/changelog sau https://..."
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Text Buton</label>
                  <input
                    type="text"
                    value={bannerLinkText}
                    onChange={(e) => setBannerLinkText(e.target.value)}
                    placeholder="Vezi Noutățile"
                    className="admin-form-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)]">
                <div>
                  <span className="text-xs font-semibold text-white">Poate fi închis de vizitator</span>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Permite utilizatorilor să ascundă bannerul cu butonul X
                  </p>
                </div>

                <label className="admin-toggle-switch">
                  <input
                    type="checkbox"
                    checked={bannerDismissible}
                    onChange={(e) => setBannerDismissible(e.target.checked)}
                  />
                  <span className="admin-toggle-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Maintenance Mode Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="flex items-center gap-3">
                <div className="admin-card-icon-box text-red-400">
                  <Wrench size={16} />
                </div>
                <div>
                  <h3 className="admin-card-title">Mod Mentenanță Platformă Docs</h3>
                  <p className="admin-card-subtitle">
                    Blochează temporar accesul public și redirecționează către ecranul de mentenanță
                  </p>
                </div>
              </div>

              <label className="admin-toggle-switch">
                <input
                  type="checkbox"
                  checked={maintenanceEnabled}
                  onChange={(e) => {
                    setMaintenanceEnabled(e.target.checked);
                    saveConfiguration({ maintenanceEnabled: e.target.checked });
                  }}
                />
                <span className="admin-toggle-slider" />
              </label>
            </div>

            <div className="admin-card-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Motiv Mentenanță (Intern)</label>
                <input
                  type="text"
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  placeholder="Actualizare regulamente și structură foldere"
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Mesaj Public pentru Jucători</label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={2}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Timp Estimat Rămas</label>
                <input
                  type="text"
                  value={estimatedEndTime}
                  onChange={(e) => setEstimatedEndTime(e.target.value)}
                  placeholder="15 minute"
                  className="admin-form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database Hub + Backup + System Optimization */}
        <div className="flex flex-col gap-6">
          {/* ── Database & Analytics Dedicated Shortcut Card ───────── */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="flex items-center gap-3">
                <div className="admin-card-icon-box text-cyan-400">
                  <Database size={16} />
                </div>
                <div>
                  <h3 className="admin-card-title">Bază de Date & Telemetrie</h3>
                  <p className="admin-card-subtitle">
                    Panou dedicat pentru vizualizări pagini, recenzii comunitate și Supabase
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-card-body">
              <div className="p-3.5 rounded-lg bg-[hsl(220_18%_10%/0.65)] border border-[var(--glass-border)] flex items-center justify-between mb-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Status Conexiune Live</span>
                  <span className="text-[0.7rem] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase PostgreSQL Cloud
                  </span>
                </div>

                <a
                  href="/admin/database"
                  className="admin-btn admin-btn--primary text-xs py-1.5 px-3"
                >
                  <Database size={13} />
                  <span>Deschide Database Hub</span>
                </a>
              </div>
            </div>
          </div>

          {/* One-Click Backup & Export Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="flex items-center gap-3">
                <div className="admin-card-icon-box text-emerald-400">
                  <Archive size={16} />
                </div>
                <div>
                  <h3 className="admin-card-title">Backup & Export Repository</h3>
                  <p className="admin-card-subtitle">
                    Descarcă instantaneu arhiva completă cu toate cele 62+ articole Markdown
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-card-body flex flex-col gap-3">
              {/* ZIP Download */}
              <a
                href="/api/admin/backup?format=zip"
                download
                className="admin-backup-action-card"
              >
                <div className="admin-backup-icon-box text-emerald-400">
                  <Download size={18} />
                </div>
                <div className="admin-backup-text-box">
                  <strong>Descarcă Arhivă ZIP (.zip)</strong>
                  <span>Include toate fișierele .md și structura de foldere intactă</span>
                </div>
              </a>

              {/* JSON Database Export */}
              <a
                href="/api/admin/backup?format=json"
                download
                className="admin-backup-action-card"
              >
                <div className="admin-backup-icon-box text-blue-400">
                  <FileCode size={18} />
                </div>
                <div className="admin-backup-text-box">
                  <strong>Export Bază de Date JSON (.json)</strong>
                  <span>Conține toate documentele cu frontmatter și conținut structurat</span>
                </div>
              </a>

              {/* Single Markdown Bundle */}
              <a
                href="/api/admin/backup?format=bundle"
                download
                className="admin-backup-action-card"
              >
                <div className="admin-backup-icon-box text-orange-400">
                  <Layers size={18} />
                </div>
                <div className="admin-backup-text-box">
                  <strong>Export Markdown Unificat (.md)</strong>
                  <span>Fișier unic concatenat pentru căutare și citire offline</span>
                </div>
              </a>
            </div>
          </div>

          {/* Engine Optimization Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="flex items-center gap-3">
                <div className="admin-card-icon-box text-purple-400">
                  <Server size={16} />
                </div>
                <div>
                  <h3 className="admin-card-title">Optimizare & Cache ISR</h3>
                  <p className="admin-card-subtitle">
                    Regenerează paginile statice și indexul de căutare
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-card-body">
              <div className="admin-engine-spec-list">
                <div className="admin-engine-spec-item">
                  <span>Engine:</span>
                  <strong>{PLATFORM_NAME}</strong>
                </div>
                <div className="admin-engine-spec-item">
                  <span>Versiune:</span>
                  <strong>v{CURRENT_VERSION}</strong>
                </div>
                <div className="admin-engine-spec-item">
                  <span>Framework:</span>
                  <strong>Next.js 16 (Turbopack)</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={handleRevalidateCache}
                  disabled={revalidating}
                  className="admin-btn admin-btn--secondary w-full"
                >
                  <RefreshCw size={14} className={revalidating ? "animate-spin" : ""} />
                  <span>{revalidating ? "Se regenerează cache-ul..." : "Regenerează Cache ISR"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
