"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Zap,
  Wrench,
  Save,
  Eye,
  Lock,
  Unlock,
  Download,
  Archive,
  FileCode,
  Megaphone,
  Layers,
  Database,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Settings2,
  ToggleLeft,
  ToggleRight,
  Flame,
  Info,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { CURRENT_VERSION, PLATFORM_NAME } from "@/lib/version";

/* ── tiny sub-components ─────────────────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="st-section-divider">
      <span className="st-section-divider-line" />
      <span className="st-section-divider-label">{label}</span>
      <span className="st-section-divider-line" />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={`st-toggle${checked ? " st-toggle--on" : ""}`}
    >
      <span className="st-toggle-thumb" />
    </button>
  );
}

export default function AdminSettingsPage() {
  // ── state ───────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<{ isRoot: boolean; username: string; role: string } | null>(null);
  const [isPanicLocked, setIsPanicLocked] = useState<boolean>(false);
  const [panicModalOpen, setPanicModalOpen] = useState<boolean>(false);
  const [panicProcessing, setPanicProcessing] = useState<boolean>(false);
  const [panicError, setPanicError] = useState<string>("");

  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    "Wildfire Docs is currently undergoing scheduled platform upgrades and engine optimizations. We'll be back online shortly."
  );
  const [maintenanceReason, setMaintenanceReason] = useState<string>(
    "Actualizare structură documentație & optimizare index căutare"
  );
  const [estimatedEndTime, setEstimatedEndTime] = useState<string>("30 minutes");
  const [allowAdmins, setAllowAdmins] = useState<boolean>(true);

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

  const [dbStatus, setDbStatus] = useState<any>(null);

  // ── load ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.status === 401) { window.location.href = "/admin/login"; return; }
        const data = await res.json();
        if (data.maintenance) {
          setMaintenanceEnabled(data.maintenance.enabled || false);
          if (data.maintenance.message)          setMaintenanceMessage(data.maintenance.message);
          if (data.maintenance.reason)           setMaintenanceReason(data.maintenance.reason);
          if (data.maintenance.estimatedEndTime) setEstimatedEndTime(data.maintenance.estimatedEndTime);
          if (data.maintenance.allowAdmins !== undefined) setAllowAdmins(data.maintenance.allowAdmins);
        }
        if (data.announcement) {
          setBannerEnabled(data.announcement.enabled || false);
          if (data.announcement.text)     setBannerText(data.announcement.text);
          if (data.announcement.link)     setBannerLink(data.announcement.link);
          if (data.announcement.linkText) setBannerLinkText(data.announcement.linkText);
          if (data.announcement.type)     setBannerType(data.announcement.type);
          if (data.announcement.dismissible !== undefined) setBannerDismissible(data.announcement.dismissible);
        }
      } catch (err) { console.error("Failed to load settings:", err); }
    }

    async function loadDbStatus() {
      try {
        const res = await fetch("/api/admin/database");
        if (res.ok) {
          const data = await res.json();
          setDbStatus(data.status);
        }
      } catch {}
    }

    loadSettings();
    loadDbStatus();

    fetch("/api/admin/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.authenticated && data.user) setCurrentUser(data.user); })
      .catch(() => {});

    fetch("/api/admin/auth/panic")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setIsPanicLocked(data.locked || false); })
      .catch(() => {});
  }, []);

  // ── handlers ────────────────────────────────────────────────────────
  const handleTriggerPanic = async (action: "trigger" | "release") => {
    setPanicProcessing(true);
    setPanicError("");
    try {
      const res = await fetch("/api/admin/auth/panic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setPanicModalOpen(false);
        setIsPanicLocked(action === "trigger");
        setStatusMessage({
          type: action === "trigger" ? "error" : "success",
          text:
            action === "trigger"
              ? "Panic Lockdown a fost declanșat cu succes! Toate sesiunile active au fost revocate."
              : "Panic Lockdown a fost ridicat. Platforma a revenit la starea normală de funcționare.",
        });
      } else {
        setPanicError(data.error || "Eroare la executarea comenzii Panic Lockdown.");
      }
    } catch { setPanicError("Eroare de conexiune la server."); }
    finally    { setPanicProcessing(false); }
  };

  const saveConfiguration = async (overrides?: {
    maintenanceEnabled?: boolean;
    bannerEnabled?: boolean;
  }) => {
    const maintActive = overrides?.maintenanceEnabled !== undefined ? overrides.maintenanceEnabled : maintenanceEnabled;
    const bannerActive = overrides?.bannerEnabled !== undefined ? overrides.bannerEnabled : bannerEnabled;
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenance: { enabled: maintActive, message: maintenanceMessage, reason: maintenanceReason, estimatedEndTime, allowAdmins },
          announcement: { enabled: bannerActive, text: bannerText, link: bannerLink, linkText: bannerLinkText, type: bannerType, dismissible: bannerDismissible },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: "Configurațiile platformei au fost salvate și aplicate pe disc." });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Salvarea setărilor a eșuat." });
      }
    } catch { setStatusMessage({ type: "error", text: "Eroare de conexiune la server." }); }
    finally   { setSaving(false); }
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
      if (data.success) setStatusMessage({ type: "success", text: "Cache-ul ISR al platformei și rutele statice au fost regenerate." });
    } catch { setStatusMessage({ type: "error", text: "Eroare la invalidarea cache-ului." }); }
    finally   { setRevalidating(false); }
  };

  const BANNER_TYPES = [
    { key: "fire"    as const, label: "Wildfire Ember",    icon: <Flame       size={13} />, cls: "st-banner-type--fire"    },
    { key: "info"    as const, label: "Informativ",        icon: <Info        size={13} />, cls: "st-banner-type--info"    },
    { key: "warning" as const, label: "Atenționare",       icon: <AlertTriangle size={13}/>, cls: "st-banner-type--warning" },
  ];

  return (
    <div className="admin-page-container">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="st-header">
        <div className="st-header-left">
          <div className="st-breadcrumb">
            <Settings2 size={11} />
            <span>PLATFORM CONTROL</span>
            <span className="st-breadcrumb-sep">/</span>
            <span>ENGINE CONFIGURATION</span>
          </div>
          <h1 className="st-title">Setări Globale Platformă</h1>
          <p className="st-subtitle">
            Controlează bannerele publice, modul de mentenanță, cache-ul ISR și securitatea administrației.
          </p>
        </div>
        <div className="st-header-actions">
          <button
            type="button"
            id="settings-save-all-btn"
            onClick={() => saveConfiguration()}
            disabled={saving}
            className="st-save-btn"
          >
            <Save size={13} className={saving ? "st-spin" : ""} />
            <span>{saving ? "Se salvează..." : "Salvează Toate Setările"}</span>
          </button>
        </div>
      </div>

      {/* ── STATUS ALERT ────────────────────────────────────────────── */}
      {statusMessage && (
        <div className={`st-alert st-alert--${statusMessage.type}`}>
          {statusMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── MAIN GRID ───────────────────────────────────────────────── */}
      <div className="st-grid">

        {/* ══ LEFT COLUMN ════════════════════════════════════════════ */}
        <div className="st-col">

          {/* ── ANNOUNCEMENT BANNER CARD ─────────────────────────── */}
          <div className="st-card">
            <div className="st-card-header">
              <div className="st-card-icon st-card-icon--orange">
                <Megaphone size={17} />
              </div>
              <div className="st-card-heading">
                <h3 className="st-card-title">Banner Public de Anunțuri</h3>
                <p className="st-card-sub">Afișează un banner proeminent în antetul tuturor paginilor de documentație</p>
              </div>
              <div className="st-card-toggle-area">
                <span className={`st-card-status-dot ${bannerEnabled ? "st-card-status-dot--on" : ""}`} />
                <span className="st-card-status-text">{bannerEnabled ? "Activ" : "Inactiv"}</span>
                <Toggle
                  checked={bannerEnabled}
                  id="banner-enabled-toggle"
                  onChange={(v) => { setBannerEnabled(v); saveConfiguration({ bannerEnabled: v }); }}
                />
              </div>
            </div>

            <div className="st-card-body">
              {/* Banner type picker */}
              <div className="st-field">
                <label className="st-label">Tip Banner &amp; Culoare</label>
                <div className="st-banner-type-row">
                  {BANNER_TYPES.map(({ key, label, icon, cls }) => (
                    <button
                      key={key}
                      type="button"
                      id={`banner-type-${key}`}
                      onClick={() => setBannerType(key)}
                      className={`st-banner-type-btn ${cls}${bannerType === key ? " st-banner-type-btn--active" : ""}`}
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="st-field">
                <label className="st-label">Mesaj Anunț</label>
                <input
                  type="text"
                  id="banner-text-input"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="Ex: Am actualizat ghidul de Currency..."
                  className="st-input"
                />
              </div>

              <div className="st-field-row">
                <div className="st-field">
                  <label className="st-label">Link Buton</label>
                  <input
                    type="text"
                    id="banner-link-input"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    placeholder="/changelog"
                    className="st-input"
                  />
                </div>
                <div className="st-field">
                  <label className="st-label">Text Buton</label>
                  <input
                    type="text"
                    id="banner-link-text-input"
                    value={bannerLinkText}
                    onChange={(e) => setBannerLinkText(e.target.value)}
                    placeholder="Vezi Noutățile"
                    className="st-input"
                  />
                </div>
              </div>

              <div className="st-toggle-row">
                <div>
                  <span className="st-toggle-row-label">Poate fi închis de vizitator</span>
                  <p className="st-toggle-row-sub">Permite utilizatorilor să ascundă bannerul cu butonul X</p>
                </div>
                <Toggle
                  checked={bannerDismissible}
                  id="banner-dismissible-toggle"
                  onChange={setBannerDismissible}
                />
              </div>
            </div>
          </div>

          {/* ── MAINTENANCE CARD ─────────────────────────────────── */}
          <div className="st-card">
            <div className="st-card-header">
              <div className="st-card-icon st-card-icon--red">
                <Wrench size={17} />
              </div>
              <div className="st-card-heading">
                <h3 className="st-card-title">Mod Mentenanță Platformă Docs</h3>
                <p className="st-card-sub">Blochează temporar accesul public și redirecționează la ecranul de mentenanță</p>
              </div>
              <div className="st-card-toggle-area">
                <span className={`st-card-status-dot ${maintenanceEnabled ? "st-card-status-dot--red" : ""}`} />
                <span className="st-card-status-text">{maintenanceEnabled ? "LIVE" : "Inactiv"}</span>
                <Toggle
                  checked={maintenanceEnabled}
                  id="maintenance-enabled-toggle"
                  onChange={(v) => { setMaintenanceEnabled(v); saveConfiguration({ maintenanceEnabled: v }); }}
                />
              </div>
            </div>

            {maintenanceEnabled && (
              <div className="st-maintenance-warning">
                <AlertTriangle size={13} />
                <span>Platforma este în prezent în modul de mentenanță. Vizitatorii sunt redirecționați.</span>
              </div>
            )}

            <div className="st-card-body">
              <div className="st-field">
                <label className="st-label">Motiv Mentenanță (Intern)</label>
                <input
                  type="text"
                  id="maintenance-reason-input"
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  placeholder="Actualizare regulamente și structură foldere"
                  className="st-input"
                />
              </div>
              <div className="st-field">
                <label className="st-label">Mesaj Public pentru Jucători</label>
                <textarea
                  id="maintenance-message-input"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={2}
                  className="st-input st-textarea"
                />
              </div>
              <div className="st-field">
                <label className="st-label">Timp Estimat Rămas</label>
                <input
                  type="text"
                  id="maintenance-eta-input"
                  value={estimatedEndTime}
                  onChange={(e) => setEstimatedEndTime(e.target.value)}
                  placeholder="15 minute"
                  className="st-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ═══════════════════════════════════════════ */}
        <div className="st-col">

          {/* ── DATABASE HUB CARD ────────────────────────────────── */}
          <div className="st-card">
            <div className="st-card-header">
              <div className="st-card-icon st-card-icon--cyan">
                <Database size={17} />
              </div>
              <div className="st-card-heading">
                <h3 className="st-card-title">Bază de Date &amp; Telemetrie</h3>
                <p className="st-card-sub">Panou dedicat pentru vizualizări pagini, recenzii comunitate și Supabase</p>
              </div>
            </div>
            <div className="st-card-body">
              <div className="st-db-status-row">
                <div className="st-db-status-info">
                  <span className="st-db-status-label">Status Conexiune Live</span>
                  <span className="st-db-online-pill">
                    <span className="st-db-pulse" />
                    Supabase PostgreSQL Cloud
                  </span>
                </div>
                <a href="/admin/database" className="st-db-open-btn" id="open-database-hub-btn">
                  <Database size={12} />
                  <span>Deschide Database Hub</span>
                  <ChevronRight size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* ── BACKUP CARD ──────────────────────────────────────── */}
          <div className="st-card">
            <div className="st-card-header">
              <div className="st-card-icon st-card-icon--green">
                <Archive size={17} />
              </div>
              <div className="st-card-heading">
                <h3 className="st-card-title">Backup &amp; Export Repository</h3>
                <p className="st-card-sub">Descarcă instantaneu arhiva completă cu toate cele 62+ articole Markdown</p>
              </div>
            </div>
            <div className="st-card-body">
              <div className="st-backup-list">
                <a href="/api/admin/backup?format=zip" download className="st-backup-item" id="backup-zip-btn">
                  <div className="st-backup-icon st-backup-icon--green">
                    <Download size={16} />
                  </div>
                  <div className="st-backup-text">
                    <strong>Descarcă Arhivă ZIP (.zip)</strong>
                    <span>Include toate fișierele .md și structura de foldere</span>
                  </div>
                  <ChevronRight size={14} className="st-backup-arrow" />
                </a>

                <a href="/api/admin/backup?format=json" download className="st-backup-item" id="backup-json-btn">
                  <div className="st-backup-icon st-backup-icon--blue">
                    <FileCode size={16} />
                  </div>
                  <div className="st-backup-text">
                    <strong>Export Bază de Date JSON (.json)</strong>
                    <span>Conține toate documentele cu frontmatter structurat</span>
                  </div>
                  <ChevronRight size={14} className="st-backup-arrow" />
                </a>

                <a href="/api/admin/backup?format=bundle" download className="st-backup-item" id="backup-bundle-btn">
                  <div className="st-backup-icon st-backup-icon--orange">
                    <Layers size={16} />
                  </div>
                  <div className="st-backup-text">
                    <strong>Export Markdown Unificat (.md)</strong>
                    <span>Fișier unic concatenat pentru căutare și citire offline</span>
                  </div>
                  <ChevronRight size={14} className="st-backup-arrow" />
                </a>
              </div>
            </div>
          </div>

          {/* ── ENGINE / CACHE CARD ──────────────────────────────── */}
          <div className="st-card">
            <div className="st-card-header">
              <div className="st-card-icon st-card-icon--purple">
                <Server size={17} />
              </div>
              <div className="st-card-heading">
                <h3 className="st-card-title">Optimizare &amp; Cache ISR</h3>
                <p className="st-card-sub">Regenerează paginile statice și indexul de căutare</p>
              </div>
            </div>
            <div className="st-card-body">
              <div className="st-engine-spec-list">
                {[
                  { label: "Engine",     value: PLATFORM_NAME },
                  { label: "Versiune",   value: `v${CURRENT_VERSION}` },
                  { label: "Framework",  value: "Next.js 16 (Turbopack)" },
                  { label: "Runtime",    value: "Node.js Edge Runtime" },
                ].map(({ label, value }) => (
                  <div key={label} className="st-engine-spec-row">
                    <span className="st-engine-spec-key">{label}</span>
                    <span className="st-engine-spec-val">{value}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                id="revalidate-cache-btn"
                onClick={handleRevalidateCache}
                disabled={revalidating}
                className="st-revalidate-btn"
              >
                <RefreshCw size={13} className={revalidating ? "st-spin" : ""} />
                <span>{revalidating ? "Se regenerează cache-ul..." : "Regenerează Cache ISR"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANIC DANGER ZONE ───────────────────────────────────────── */}
      <div className="st-danger-zone">
        <div className="st-danger-zone-header">
          <div className="st-danger-title-group">
            <div className="st-danger-icon">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="st-danger-title-row">
                <h3 className="st-danger-title">Zona de Urgență Super Admin (Root Danger Zone)</h3>
                <span className="st-danger-root-badge">STRICT ROOT ONLY</span>
              </div>
              <p className="st-danger-sub">
                Mecanism de urgență pentru blocarea imediată a întregii platforme și invalidarea tuturor sesiunilor administrative active.
              </p>
            </div>
          </div>
          {isPanicLocked ? (
            <span className="st-panic-status st-panic-status--locked">
              <ShieldAlert size={12} />
              LOCKDOWN ACTIV
            </span>
          ) : (
            <span className="st-panic-status st-panic-status--normal">
              <ShieldCheck size={12} />
              SISTEM NORMAL
            </span>
          )}
        </div>

        <div className="st-danger-zone-body">
          <div className="st-danger-info-box">
            <strong className="st-danger-info-title">Ce face Panic Lockdown?</strong>
            <p className="st-danger-info-text">
              1. <strong>Revocă instantaneu</strong> toate tokenurile de sesiune pentru toți administratorii non-root.<br />
              2. <strong>Blochează</strong> toate modificările de articole, ștergerile și mutațiile din studio.<br />
              3. Doar Super Adminul Root (<code>@iannC69</code>) poate ridica starea de urgență.
            </p>
          </div>

          <div className="st-danger-action-box">
            <div>
              <strong className="st-danger-info-title">Stare Permisiuni &amp; Control</strong>
              {currentUser?.isRoot ? (
                <p className="st-danger-root-ok">Ești autentificat ca Root Super Admin. Ai autoritate absolută de intervenție.</p>
              ) : (
                <p className="st-danger-root-restricted">Acces restricționat: Doar Root Super Admin @iannC69 poate declanșa sau anula starea de panică.</p>
              )}
            </div>
            <div className="st-danger-btn-wrap">
              {isPanicLocked ? (
                <button
                  type="button"
                  id="panic-release-btn"
                  onClick={() => handleTriggerPanic("release")}
                  disabled={!currentUser?.isRoot || panicProcessing}
                  className="st-panic-release-btn"
                >
                  <Unlock size={14} />
                  <span>{panicProcessing ? "Se deblochează..." : "Deblochează Platforma"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="panic-trigger-btn"
                  onClick={() => setPanicModalOpen(true)}
                  disabled={!currentUser?.isRoot || panicProcessing}
                  className="st-panic-trigger-btn"
                >
                  <ShieldAlert size={14} />
                  <span>Declanșează Emergency Panic Lockdown</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PANIC MODAL ─────────────────────────────────────────────── */}
      {panicModalOpen && (
        <div className="st-modal-overlay" role="dialog" aria-modal="true">
          <div className="st-modal">
            <div className="st-modal-header">
              <div className="st-modal-danger-orb">
                <ShieldAlert size={22} />
              </div>
              <h3 className="st-modal-title">Declanșează Emergency Panic Lockdown?</h3>
            </div>
            <p className="st-modal-body">
              Această acțiune va <strong>revoca instantaneu toate sesiunile active</strong> ale administratorilor,
              va deconecta toți membrii echipei și va bloca mutațiile de conținut.
            </p>
            {panicError && (
              <div className="st-alert st-alert--error">
                <AlertCircle size={14} />
                <span>{panicError}</span>
              </div>
            )}
            <div className="st-modal-actions">
              <button type="button" onClick={() => setPanicModalOpen(false)} className="st-modal-cancel-btn">
                Anulează
              </button>
              <button
                type="button"
                id="panic-confirm-btn"
                onClick={() => handleTriggerPanic("trigger")}
                disabled={panicProcessing}
                className="st-modal-confirm-btn"
              >
                <Lock size={13} />
                <span>{panicProcessing ? "Se declanșează..." : "Confirmă Panic Lockdown"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
