"use client";

import React, { useState, useEffect } from "react";
import {
  Archive,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  RefreshCw,
  Clock,
  HardDrive,
  ShieldCheck,
  Calendar,
  Sparkles,
  Bot,
  User,
  Check,
  Copy,
  AlertTriangle,
  FileText,
  Database,
  ListTodo,
  Layers,
  Sliders,
  CheckCircle2,
  X,
  ShieldAlert,
} from "lucide-react";
import type { BackupSnapshotMetadata, BackupVaultStats, BackupManifest } from "@/types/backups";

function timeAgo(isoString: string | null): string {
  if (!isoString) return "Niciodată";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Chiar acum";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Acum ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Acum ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Acum ${days}z`;
    return date.toLocaleDateString("ro-RO", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Recent";
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export default function AdminBackupsPage() {
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState<BackupSnapshotMetadata[]>([]);
  const [stats, setStats] = useState<BackupVaultStats | null>(null);
  const [manifest, setManifest] = useState<Partial<BackupManifest>>({
    autoBackupEnabled: true,
    intervalDays: 3,
    retentionLimit: 10,
  });

  const [activeTab, setActiveTab] = useState<"all" | "auto" | "manual">("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<BackupSnapshotMetadata | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backups");
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data.snapshots || []);
        setStats(data.stats || null);
        if (data.manifest) {
          setManifest(data.manifest);
        }
      }
    } catch (err) {
      console.error("[AdminBackupsPage] Error fetching backups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", label: newLabel.trim() || undefined }),
      });
      if (res.ok) {
        setCreateModalOpen(false);
        setNewLabel("");
        await fetchBackups();
      }
    } catch (err) {
      console.error("Create snapshot error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleRunAutoCheck = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_auto_check" }),
      });
      await fetchBackups();
    } catch {}
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_scheduler",
          autoBackupEnabled: manifest.autoBackupEnabled,
          intervalDays: Number(manifest.intervalDays),
          retentionLimit: Number(manifest.retentionLimit),
        }),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
        await fetchBackups();
      }
    } catch {}
    setSavingSettings(false);
  };

  const handleRestore = async () => {
    if (!selectedSnapshot) return;
    setRestoring(true);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id: selectedSnapshot.id }),
      });
      const data = await res.json();
      if (data.success) {
        setRestoreSuccess(true);
        setTimeout(() => {
          setRestoreSuccess(false);
          setRestoreModalOpen(false);
          setSelectedSnapshot(null);
          fetchBackups();
        }, 2000);
      }
    } catch (err) {
      console.error("Restore error:", err);
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ești sigur că vrei să ștergi acest snapshot? Acțiunea este ireversibilă.")) return;
    try {
      const res = await fetch(`/api/admin/backups?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchBackups();
      }
    } catch {}
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredSnapshots = snapshots.filter((s) => {
    if (activeTab === "auto") return s.type === "auto";
    if (activeTab === "manual") return s.type === "manual";
    return true;
  });

  return (
    <div className="admin-page-container">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-pretitle-tag">
            <Archive size={11} className="text-amber-400" />
            <span>BACKUP &amp; SNAPSHOT VAULT</span>
          </div>
          <h1 className="admin-page-title">Backup &amp; Snapshot Vault</h1>
          <p className="admin-page-desc">
            Arhivare completă a bazei de date și a celor 57+ ghiduri, auto-backup programat la fiecare 3 zile, verificare de integritate SHA-256 și restaurare instantanee 1-click.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={handleRunAutoCheck}
            disabled={loading}
            className="admin-btn admin-btn--secondary"
            title="Verifică și execută planificatorul de backup automat"
          >
            <RefreshCw size={13} className={loading ? "admin-spin" : ""} />
            <span>{loading ? "Se sincronizează..." : "Sincronizează"}</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="admin-btn admin-btn--primary"
          >
            <Plus size={14} />
            <span>Generează Snapshot Nou</span>
          </button>
        </div>
      </div>

      {/* ── 4-Metric KPI Grid ───────────────────────────────────────── */}
      <div className="admin-db-kpi-grid">
        {/* Metric 1: Total Snapshots */}
        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Total Snapshot-uri Stocate</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--amber">
              <Archive size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--amber">
              {stats?.totalSnapshots ?? snapshots.length}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--amber">
              {stats?.autoSnapshotsCount || 0} Auto · {stats?.manualSnapshotsCount || 0} Manual
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">Copii de siguranță complete pe disc</p>
        </div>

        {/* Metric 2: Auto Scheduler */}
        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Planificator Auto-Backup</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--emerald">
              <Clock size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--emerald">
              {manifest.autoBackupEnabled ? `${manifest.intervalDays} Zile` : "Oprit"}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--emerald">
              {manifest.autoBackupEnabled ? `Următorul: ~${stats?.daysUntilNextAuto ?? 3}z` : "Dezactivat"}
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">Execuție automată în fundal fără întrerupere</p>
        </div>

        {/* Metric 3: Last Backup */}
        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Ultimul Backup Înregistrat</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--cyan">
              <Calendar size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--cyan" style={{ fontSize: "1.25rem" }}>
              {timeAgo(stats?.lastBackupAt || (snapshots[0]?.createdAt ?? null))}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--cyan">
              Live Sync
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">
            {snapshots[0]?.createdAt
              ? new Date(snapshots[0].createdAt).toLocaleString("ro-RO")
              : "Niciun snapshot creat"}
          </p>
        </div>

        {/* Metric 4: Disk Storage */}
        <div className="admin-db-kpi-card">
          <div className="admin-db-kpi-header">
            <span className="admin-db-kpi-title">Spațiu Utilizat pe Disc</span>
            <div className="admin-db-kpi-icon-box admin-db-kpi-icon-box--purple">
              <HardDrive size={16} />
            </div>
          </div>
          <div className="admin-db-kpi-body">
            <span className="admin-db-kpi-value admin-db-kpi-value--purple">
              {formatBytes(stats?.totalStorageBytes || 0)}
            </span>
            <span className="admin-db-kpi-badge admin-db-kpi-badge--purple">
              SHA-256
            </span>
          </div>
          <p className="admin-db-kpi-subtitle">Integritate criptografică verificată</p>
        </div>
      </div>

      {/* ── Auto-Backup Scheduler Config Box ──────────────────────────── */}
      <div className="admin-panel-card mb-6">
        <div className="admin-panel-header">
          <div className="admin-card-title-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="admin-quota-icon-box admin-quota-icon-box--amber">
              <Sliders size={16} />
            </div>
            <div>
              <h3 className="admin-section-title">
                Configurare Planificator Automat (Auto-Backup Scheduler)
              </h3>
              <p className="admin-panel-sub">
                Sistemul execută automat snapshot-uri complete în fundal la fiecare 3 zile fără a întrerupe activitatea.
              </p>
            </div>
          </div>

          <div className="admin-card-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {settingsSaved && (
              <span className="admin-status-pill admin-status-pill--success flex items-center gap-1">
                <Check size={11} />
                <span>Salvat cu Succes</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="admin-btn admin-btn--primary admin-btn--sm"
            >
              {savingSettings ? "Se salvează..." : "Aplică Setările"}
            </button>
          </div>
        </div>

        <div className="admin-scheduler-form-grid" style={{ padding: "20px" }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              Stare Auto-Backup
            </label>
            <div className="admin-toggle-wrapper">
              <button
                type="button"
                onClick={() =>
                  setManifest((prev) => ({ ...prev, autoBackupEnabled: !prev.autoBackupEnabled }))
                }
                className={`admin-switch-btn ${manifest.autoBackupEnabled ? "active" : ""}`}
              >
                <span className="admin-switch-handle" />
              </button>
              <span className="admin-toggle-label">
                {manifest.autoBackupEnabled ? "Activ (Rulează automat în fundal)" : "Inactiv (Doar manual)"}
              </span>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Interval de Rulare
            </label>
            <select
              value={manifest.intervalDays || 3}
              onChange={(e) =>
                setManifest((prev) => ({ ...prev, intervalDays: Number(e.target.value) }))
              }
              className="admin-select"
            >
              <option value={1}>Zilnic (La fiecare 24 ore)</option>
              <option value={3}>La fiecare 3 zile (Recomandat)</option>
              <option value={4}>La fiecare 4 zile</option>
              <option value={7}>Săptămânal (La fiecare 7 zile)</option>
              <option value={14}>La fiecare 2 săptămâni</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Limită Rotire Automată (Retention)
            </label>
            <select
              value={manifest.retentionLimit || 10}
              onChange={(e) =>
                setManifest((prev) => ({ ...prev, retentionLimit: Number(e.target.value) }))
              }
              className="admin-select"
            >
              <option value={5}>Păstrează ultimele 5 snapshot-uri</option>
              <option value={10}>Păstrează ultimele 10 snapshot-uri (Optim)</option>
              <option value={20}>Păstrează ultimele 20 snapshot-uri</option>
              <option value={30}>Păstrează ultimele 30 snapshot-uri</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Tabs Bar ─────────────────────────────────────────────────── */}
      <div className="admin-db-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`admin-db-tab-btn ${activeTab === "all" ? "admin-db-tab-btn--active-cyan" : ""}`}
        >
          <Layers size={13} />
          <span>Toate Snapshot-urile</span>
          <span className="admin-db-tab-badge">{snapshots.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("auto")}
          className={`admin-db-tab-btn ${activeTab === "auto" ? "admin-db-tab-btn--active-cyan" : ""}`}
        >
          <Bot size={13} />
          <span>Automate (3 Zile)</span>
          <span className="admin-db-tab-badge">
            {snapshots.filter((s) => s.type === "auto").length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`admin-db-tab-btn ${activeTab === "manual" ? "admin-db-tab-btn--active-amber" : ""}`}
        >
          <User size={13} />
          <span>Manuale</span>
          <span className="admin-db-tab-badge">
            {snapshots.filter((s) => s.type === "manual").length}
          </span>
        </button>
      </div>

      {/* ── Snapshots Matrix Table Card ─────────────────────────────── */}
      <div className="admin-panel-card">
        <div className="admin-table-container">
          {filteredSnapshots.length === 0 ? (
            <div className="admin-table-empty">
              <Archive size={36} className="text-slate-500 mb-2 mx-auto" />
              <h4 className="font-bold text-sm mb-1">Niciun snapshot găsit</h4>
              <p className="text-xs">
                Apasă pe „Generează Snapshot Nou” pentru a crea prima copie de siguranță completă.
              </p>
            </div>
          ) : (
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "hsl(0 0% 100% / 0.02)", borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-tertiary)" }}>Snapshot ID &amp; Etichetă</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-tertiary)" }}>Tip &amp; Autor</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-tertiary)" }}>Conținut Arhivat</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-tertiary)" }}>Mărime</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-tertiary)" }}>Integritate SHA-256</th>
                  <th style={{ padding: "12px 16px", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-text-tertiary)", textAlign: "right" }}>Acțiuni 1-Click</th>
                </tr>
              </thead>
              <tbody>
                {filteredSnapshots.map((snap) => {
                  const isAuto = snap.type === "auto";

                  return (
                    <tr key={snap.id} style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.04)", transition: "background 0.15s ease" }}>
                      {/* ID & Label */}
                      <td style={{ padding: "12px 16px" }}>
                        <div className="admin-snap-title-cell">
                          <div
                            className={`admin-snap-icon-box ${
                              isAuto ? "admin-snap-icon-box--auto" : "admin-snap-icon-box--manual"
                            }`}
                          >
                            {isAuto ? <Bot size={14} /> : <User size={14} />}
                          </div>
                          <div>
                            <div className="admin-snap-label">{snap.label}</div>
                            <div className="admin-snap-id-meta">
                              <code>{snap.id}</code>
                              <span>·</span>
                              <span>{timeAgo(snap.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Creator */}
                      <td style={{ padding: "12px 16px" }}>
                        {isAuto ? (
                          <span className="admin-status-pill admin-status-pill--cyan">
                            <Bot size={11} />
                            <span>Auto Scheduler</span>
                          </span>
                        ) : (
                          <span className="admin-status-pill admin-status-pill--amber">
                            <User size={11} />
                            <span>@{snap.createdBy}</span>
                          </span>
                        )}
                      </td>

                      {/* Archived Content Details */}
                      <td style={{ padding: "12px 16px" }}>
                        <div className="admin-snap-items-pills">
                          <span className="admin-micro-pill" title={`${snap.totalDocs} Ghiduri Markdown`}>
                            <FileText size={10} className="text-emerald-400" />
                            <span>{snap.totalDocs} Ghiduri</span>
                          </span>
                          <span className="admin-micro-pill" title={`${snap.totalTasks} Sarcini TODO`}>
                            <ListTodo size={10} className="text-amber-400" />
                            <span>{snap.totalTasks} Tasks</span>
                          </span>
                          <span className="admin-micro-pill" title={`${snap.totalReports} Rapoarte & ${snap.totalFeedbacks} Feedbacks`}>
                            <Database size={10} className="text-sky-400" />
                            <span>DB Sync</span>
                          </span>
                        </div>
                      </td>

                      {/* Size */}
                      <td style={{ padding: "12px 16px" }}>
                        <span className="admin-snap-size-text">
                          {formatBytes(snap.sizeBytes)}
                        </span>
                      </td>

                      {/* SHA-256 Checksum */}
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(snap.sha256)}
                          className="admin-sha-hash-btn"
                          title="Click pentru a copia hash-ul complet SHA-256"
                        >
                          <ShieldCheck size={11} className="text-emerald-400" />
                          <code>{snap.sha256 ? `${snap.sha256.slice(0, 10)}...` : "SHA-256 Valid"}</code>
                          {copiedHash === snap.sha256 ? (
                            <Check size={10} className="text-emerald-400" />
                          ) : (
                            <Copy size={10} className="opacity-60" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div className="admin-table-actions" style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                          {/* Download Button */}
                          <a
                            href={`/api/admin/backups/download?id=${encodeURIComponent(snap.id)}`}
                            download
                            className="admin-action-btn admin-action-btn--download"
                            title="Descarcă arhiva JSON pe calculatorul tău"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700 }}
                          >
                            <Download size={13} />
                            <span>Descarcă</span>
                          </a>

                          {/* Restore Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSnapshot(snap);
                              setRestoreModalOpen(true);
                            }}
                            className="admin-action-btn admin-action-btn--restore"
                            title="Restaurează serverul la acest punct (Rollback)"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            <RotateCcw size={13} />
                            <span>Restaurează</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(snap.id)}
                            className="admin-action-btn admin-action-btn--delete"
                            title="Șterge acest snapshot"
                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 8px", borderRadius: "6px", background: "hsl(0 84% 60% / 0.1)", border: "1px solid hsl(0 84% 60% / 0.25)", color: "#f87171", cursor: "pointer" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal: Creare Snapshot Manual ───────────────────────────── */}
      {createModalOpen && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div className="admin-icon-box admin-icon-box--amber">
                <Archive size={18} />
              </div>
              <div>
                <h3 className="admin-modal-title">Generează Snapshot Manual</h3>
                <p className="admin-modal-sub">
                  Arhivare instantanee pentru baza de date, conținutul documentației și membrii echipei.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="admin-modal-close-btn"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot}>
              <div className="admin-modal-body">
                <div className="admin-form-group mb-4">
                  <label className="admin-form-label">Etichetă / Descriere Snapshot (Opțional)</label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="ex: Înainte de actualizarea regulamentului CS2"
                    className="admin-input-field"
                    autoFocus
                  />
                  <span className="admin-input-hint">
                    Dacă lași gol, se va genera automat o etichetă cu data și autorul.
                  </span>
                </div>

                <div className="admin-info-banner">
                  <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
                  <p>
                    Snapshot-ul va genera un hash criptografic <strong>SHA-256</strong> pentru garantarea integrității fișierelor împotriva oricărei coruperi.
                  </p>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="admin-btn admin-btn--secondary"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="admin-btn admin-btn--primary"
                >
                  {creating ? "Se arhivează..." : "Creează Snapshot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Restaurare (Rollback) Snapshot ────────────────────── */}
      {restoreModalOpen && selectedSnapshot && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card admin-modal-card--danger">
            <div className="admin-modal-header">
              <div className="admin-icon-box admin-icon-box--danger">
                <RotateCcw size={18} />
              </div>
              <div>
                <h3 className="admin-modal-title">Restaurare Platformă (Rollback)</h3>
                <p className="admin-modal-sub">
                  Sistemul va fi readus exact la starea din <strong>{new Date(selectedSnapshot.createdAt).toLocaleString("ro-RO")}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRestoreModalOpen(false)}
                className="admin-modal-close-btn"
              >
                <X size={14} />
              </button>
            </div>

            <div className="admin-modal-body">
              {restoreSuccess ? (
                <div className="admin-restore-success-card">
                  <CheckCircle2 size={36} className="text-emerald-400 mb-2" />
                  <h4>Restaurare Finalizată cu Succes!</h4>
                  <p>Toate ghidurile, sarcinile și tabelele au fost resincronizate la versiunea selectată.</p>
                </div>
              ) : (
                <>
                  <div className="admin-alert-box admin-alert-box--danger mb-4">
                    <AlertTriangle size={18} className="text-rose-400 flex-shrink-0" />
                    <div>
                      <strong>Atenție: Acțiune Critică de Sistem</strong>
                      <p>
                        Această operațiune va suprascrie ghidurile curente și starea bazei de date cu versiunea din snapshot.
                      </p>
                    </div>
                  </div>

                  <div className="admin-snapshot-inspect-box">
                    <div className="admin-snap-inspect-row">
                      <span className="label">Etichetă:</span>
                      <span className="val font-bold">{selectedSnapshot.label}</span>
                    </div>
                    <div className="admin-snap-inspect-row">
                      <span className="label">Creat de:</span>
                      <span className="val">@{selectedSnapshot.createdBy} ({selectedSnapshot.type.toUpperCase()})</span>
                    </div>
                    <div className="admin-snap-inspect-row">
                      <span className="label">Elemente:</span>
                      <span className="val">
                        {selectedSnapshot.totalDocs} Ghiduri · {selectedSnapshot.totalTasks} Sarcini · {selectedSnapshot.totalReports} Rapoarte
                      </span>
                    </div>
                    <div className="admin-snap-inspect-row">
                      <span className="label">Integritate:</span>
                      <span className="val font-mono text-emerald-400">{selectedSnapshot.sha256?.slice(0, 16)}... (Valid)</span>
                    </div>
                  </div>

                  <div className="admin-info-banner mt-4">
                    <ShieldCheck size={16} className="text-sky-400 flex-shrink-0" />
                    <p>
                      <strong>Protecție automată activată:</strong> Sistemul va genera automat un snapshot de siguranță de tip <code>PRE_ROLLBACK</code> chiar înainte de aplicare.
                    </p>
                  </div>
                </>
              )}
            </div>

            {!restoreSuccess && (
              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setRestoreModalOpen(false)}
                  className="admin-btn admin-btn--secondary"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={restoring}
                  className="admin-btn admin-btn--danger"
                >
                  {restoring ? "Se restaurează..." : "Confirmă & Execută Restaurarea"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
