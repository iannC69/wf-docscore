"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Key,
  FileEdit,
  Trash2,
  Folder,
  Search,
  ScrollText,
  Sliders,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Lock,
  Unlock,
  Eye,
  UserPlus,
  Save,
  AlertTriangle,
  FileText,
  User,
  ExternalLink,
  GitCommit,
  Sparkles,
  BookOpen,
  Activity,
  ListTodo,
  Cpu,
  Database,
  Archive,
  Webhook,
  Palette,
  Wand2,
} from "lucide-react";
import type { TeamMember, TeamMemberPermissions } from "@/lib/security/teamStore";

function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export interface PermissionModuleItem {
  key: keyof TeamMemberPermissions;
  name: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  isRestricted?: boolean;
}

export interface PermissionCategoryGroup {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
  modules: PermissionModuleItem[];
}

export const PERMISSION_GROUPS: PermissionCategoryGroup[] = [
  {
    title: "Conținut, Workspace & Documentație",
    subtitle: "Module de editare ghiduri, verificare integritate, fișiere media și task-uri",
    icon: FileText,
    accent: "#10b981",
    modules: [
      { key: "canEditDocs", name: "Content Studio", desc: "Redactare și publicare ghiduri Markdown", icon: FileEdit, color: "#10b981" },
      { key: "canDeleteDocs", name: "Ștergere Docs", desc: "Permisiune de ștergere definitivă fișiere", icon: Trash2, color: "#f43f5e" },
      { key: "canManageHealth", name: "Doc Health & Linter", desc: "Scanare automată de integritate și erori", icon: Activity, color: "#06b6d4" },
      { key: "canManageMedia", name: "Media & Asset Vault", desc: "Upload și gestiune galerie de imagini", icon: Folder, color: "#3b82f6" },
      { key: "canManageTasks", name: "Task Hub & TODO", desc: "Creare, asignare și bifare sarcini în echipă", icon: ListTodo, color: "#8b5cf6" },
    ],
  },
  {
    title: "Telemetrie, AI & Baze de Date",
    subtitle: "Vizualizare statistici căutare, telemetrie AI, metrici și audit",
    icon: Search,
    accent: "#a855f7",
    modules: [
      { key: "canViewAnalytics", name: "Search Telemetry", desc: "Analiză căutări, termeni populari & trends", icon: Search, color: "#a855f7" },
      { key: "canViewAiStats", name: "AI Engine Telemetry", desc: "Consum tokeni, latență și incidente AI", icon: Cpu, color: "#ec4899" },
      { key: "canManageDb", name: "Database & Metrics", desc: "Monitorizare stocare și sincronizare Supabase", icon: Database, color: "#06b6d4" },
      { key: "canViewAudit", name: "Audit Ledger", desc: "Registru criptografic SHA-256 al acțiunilor", icon: ScrollText, color: "#f59e0b" },
    ],
  },
  {
    title: "Securitate, API & Infrastructură",
    subtitle: "Autentificare 2FA, tokeni de acces, backup-uri și setări platformă",
    icon: ShieldCheck,
    accent: "#3b82f6",
    modules: [
      { key: "canManageSecurity", name: "Securitate 2FA", desc: "Configurare TOTP și revocare forțată sesiuni", icon: ShieldCheck, color: "#3b82f6" },
      { key: "canManageApiKeys", name: "API Tokens", desc: "Generare și revocare chei de acces REST", icon: Key, color: "#6366f1" },
      { key: "canManageSnapshots", name: "Snapshot Vault", desc: "Creare backup-uri și descărcare bundle complet", icon: Archive, color: "#10b981" },
      { key: "canManageWebhooks", name: "Discord Webhooks", desc: "Configurare stream-uri de notificare pe Discord", icon: Webhook, color: "#f97316" },
      { key: "canManageSettings", name: "Engine Settings", desc: "Mod mentenanță, titluri, bannere & config", icon: Sliders, color: "#ff6b00" },
    ],
  },
  {
    title: "Comenzi Restricționate Root Super Admin",
    subtitle: "Privilegii de nivel înalt cu imunitate completă și izolare de securitate",
    icon: ShieldAlert,
    accent: "#ef4444",
    modules: [
      { key: "canManageTeam", name: "Gestiune Echipă & Roluri", desc: "Adăugare, editare și revocare permisiuni administratori", icon: Users, color: "#f59e0b", isRestricted: true },
      { key: "canTriggerPanic", name: "Panic Lockdown", desc: "Blocare instantanee a platformei în caz de urgență", icon: ShieldAlert, color: "#ef4444", isRestricted: true },
    ],
  },
];

const DEFAULT_EDITOR_PERMISSIONS: TeamMemberPermissions = {
  canEditDocs: true,
  canDeleteDocs: false,
  canManageHealth: true,
  canManageMedia: true,
  canManageTasks: true,
  canViewAnalytics: true,
  canViewAiStats: false,
  canManageDb: false,
  canViewAudit: false,
  canManageSecurity: false,
  canManageApiKeys: false,
  canManageSnapshots: false,
  canManageWebhooks: false,
  canManageSettings: false,
  canManageTeam: false,
  canTriggerPanic: false,
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rolePresets, setRolePresets] = useState<Record<string, any>>({});
  const [repoStats, setRepoStats] = useState<Record<string, { totalCommits: number; docsCommits: number }>>({});
  const [githubGraphContributors, setGithubGraphContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Inspector / Edit Modal State
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editUsername, setEditUsername] = useState<string>("");
  const [editDisplayName, setEditDisplayName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("content_editor");
  const [editStatus, setEditStatus] = useState<"active" | "suspended">("active");
  const [editPermissions, setEditPermissions] = useState<TeamMemberPermissions>({ ...DEFAULT_EDITOR_PERMISSIONS });
  const [editNewPassword, setEditNewPassword] = useState<string>("");
  const [editCustomTitle, setEditCustomTitle] = useState<string>("");
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>("");
  const [editBio, setEditBio] = useState<string>("");
  const [editDiscord, setEditDiscord] = useState<string>("");
  const [editSteamId, setEditSteamId] = useState<string>("");
  const [editRespString, setEditRespString] = useState<string>("");
  const [editBadgesString, setEditBadgesString] = useState<string>("");
  const [editDocsModifiedCount, setEditDocsModifiedCount] = useState<number>(0);
  const [editGithubUsername, setEditGithubUsername] = useState<string>("");
  const [steamAvatarPreview, setSteamAvatarPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // Add Member Modal State
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [newDisplayName, setNewDisplayName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("content_editor");
  const [newDiscord, setNewDiscord] = useState<string>("");
  const [newSteamId, setNewSteamId] = useState<string>("");
  const [newGithubUsername, setNewGithubUsername] = useState<string>("");
  const [newPermissions, setNewPermissions] = useState<TeamMemberPermissions>({ ...DEFAULT_EDITOR_PERMISSIONS });
  const [creating, setCreating] = useState<boolean>(false);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const [res, contribRes] = await Promise.allSettled([
        fetch("/api/admin/team"),
        fetch("/api/team/contributors"),
      ]);

      if (res.status === "fulfilled") {
        if (res.value.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        const data = await res.value.json();
        setMembers(data.members || []);
        setCurrentUser(data.currentUser || null);
        setRolePresets(data.rolePresets || {});
      }

      if (contribRes.status === "fulfilled" && contribRes.value.ok) {
        const cData = await contribRes.value.json();
        if (cData?.githubGraphContributors && Array.isArray(cData.githubGraphContributors)) {
          setGithubGraphContributors(cData.githubGraphContributors);
        }
        if (cData?.contributors && Array.isArray(cData.contributors)) {
          const map: Record<string, { totalCommits: number; docsCommits: number }> = {};
          for (const c of cData.contributors) {
            map[c.username.toLowerCase()] = {
              totalCommits: c.stats?.totalCommits || 0,
              docsCommits: c.stats?.docsCommits || c.docsModifiedCount || 0,
            };
          }
          setRepoStats(map);
        }
      }
    } catch (err) {
      console.error("Failed to load team data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // Unified list of contributors (Active GitHub Committers + Registered Team GitHub Profiles)
  const unifiedContributors = useMemo(() => {
    const list = [...githubGraphContributors];
    const presentLogins = new Set(list.map((gc) => (gc.login || "").toLowerCase()));

    // Add team members with GitHub handle that are not yet in the GitHub Graph committer list
    for (const m of members) {
      const gh = ((m as any).githubUsername?.trim() || m.username?.trim() || "");
      if (gh && !presentLogins.has(gh.toLowerCase()) && !presentLogins.has((m.username || "").toLowerCase())) {
        presentLogins.add(gh.toLowerCase());
        list.push({
          login: (m as any).githubUsername || m.username,
          avatarUrl: (m as any).githubUsername ? `https://github.com/${(m as any).githubUsername}.png` : m.avatarUrl || "",
          profileUrl: `https://github.com/${(m as any).githubUsername || m.username}`,
          totalCommits: repoStats[m.username.toLowerCase()]?.totalCommits || 0,
          totalAdditions: 0,
          totalDeletions: 0,
          weeks: [],
          activeWeeksCount: 0,
        });
      }
    }

    return list;
  }, [githubGraphContributors, members, repoStats]);

  const openInspector = (member: TeamMember) => {
    setSelectedMember(member);
    setEditUsername(member.username || "");
    setEditDisplayName(member.displayName || "");
    setEditEmail(member.email || "");
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditPermissions({
      canEditDocs: Boolean(member.permissions?.canEditDocs),
      canDeleteDocs: Boolean(member.permissions?.canDeleteDocs),
      canManageHealth: member.permissions?.canManageHealth ?? Boolean(member.permissions?.canEditDocs),
      canManageMedia: Boolean(member.permissions?.canManageMedia),
      canManageTasks: member.permissions?.canManageTasks ?? true,
      canViewAnalytics: Boolean(member.permissions?.canViewAnalytics),
      canViewAiStats: Boolean(member.permissions?.canViewAiStats),
      canManageDb: Boolean(member.permissions?.canManageDb),
      canViewAudit: Boolean(member.permissions?.canViewAudit),
      canManageSecurity: Boolean(member.permissions?.canManageSecurity),
      canManageApiKeys: Boolean(member.permissions?.canManageApiKeys),
      canManageSnapshots: member.permissions?.canManageSnapshots ?? Boolean(member.permissions?.canManageSettings),
      canManageWebhooks: member.permissions?.canManageWebhooks ?? Boolean(member.permissions?.canManageSettings),
      canManageSettings: Boolean(member.permissions?.canManageSettings),
      canManageTeam: Boolean(member.permissions?.canManageTeam),
      canTriggerPanic: Boolean(member.permissions?.canTriggerPanic),
    });
    setEditNewPassword("");
    setEditCustomTitle(member.customTitle || "");
    setEditAvatarUrl(member.avatarUrl || "");
    setEditBio(member.bio || "");
    setEditDiscord(member.discord || "");
    setEditSteamId(member.steamId || "");
    setEditRespString(member.responsibilities ? member.responsibilities.join(", ") : "");
    setEditBadgesString(member.badges ? member.badges.join(", ") : "");
    setEditDocsModifiedCount(member.docsModifiedCount || 0);
    setEditGithubUsername((member as any).githubUsername || "");
    setStatusMessage(null);
  };

  useEffect(() => {
    if (editSteamId && editSteamId.trim()) {
      fetch(`/api/steam/avatar?id=${encodeURIComponent(editSteamId.trim())}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.avatarUrl) setSteamAvatarPreview(d.avatarUrl);
          else setSteamAvatarPreview(null);
        })
        .catch(() => setSteamAvatarPreview(null));
    } else {
      setSteamAvatarPreview(null);
    }
  }, [editSteamId]);

  const handleRolePresetChange = (roleKey: string, isCreate = false) => {
    const preset = rolePresets[roleKey];
    if (preset) {
      if (isCreate) {
        setNewRole(roleKey);
        setNewPermissions({ ...preset.permissions });
      } else {
        setEditRole(roleKey);
        setEditPermissions({ ...preset.permissions });
      }
    }
  };

  const handleCategorySelectAll = (modules: PermissionModuleItem[], selectAll: boolean, isCreate = false) => {
    const updates: Partial<TeamMemberPermissions> = {};
    modules.forEach((m) => {
      if (!m.isRestricted) {
        updates[m.key] = selectAll;
      }
    });
    if (isCreate) {
      setNewPermissions((prev) => ({ ...prev, ...updates }));
      setNewRole("custom");
    } else {
      setEditPermissions((prev) => ({ ...prev, ...updates }));
      setEditRole("custom");
    }
  };

  const handleSaveMember = async () => {
    if (!selectedMember) return;
    setSavingEdit(true);
    setStatusMessage(null);

    const responsibilities = editRespString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const badges = editBadgesString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMember.id,
          username: editUsername.trim() || undefined,
          displayName: editDisplayName.trim(),
          email: editEmail.trim(),
          role: editRole,
          status: editStatus,
          permissions: editPermissions,
          password: editNewPassword.trim() ? editNewPassword.trim() : undefined,
          customTitle: editCustomTitle.trim(),
          avatarUrl: editAvatarUrl.trim(),
          bio: editBio.trim(),
          discord: editDiscord.trim(),
          steamId: editSteamId.trim(),
          githubUsername: editGithubUsername.trim(),
          responsibilities,
          badges,
          docsModifiedCount: Number(editDocsModifiedCount) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: `Modificările pentru ${editDisplayName || selectedMember.username} au fost salvate cu succes.` });
        fetchTeam();
        setSelectedMember(data.member);
      } else {
        setStatusMessage({ type: "error", text: data.message || "Salvarea a eșuat." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Eroare de conexiune cu serverul." });
    } finally {
      setSavingEdit(false);
    }
  };


  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setStatusMessage({ type: "error", text: "Numele de utilizator și parola sunt obligatorii." });
      return;
    }

    setCreating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          displayName: newDisplayName.trim() || newUsername.trim(),
          email: newEmail.trim(),
          password: newPassword.trim(),
          role: newRole,
          discord: newDiscord.trim(),
          steamId: newSteamId.trim(),
          githubUsername: newGithubUsername.trim() || undefined,
          customPermissions: newPermissions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: `Administratorul ${newUsername} a fost creat cu succes!` });
        setAddModalOpen(false);
        setNewUsername("");
        setNewDisplayName("");
        setNewEmail("");
        setNewPassword("");
        setNewDiscord("");
        setNewSteamId("");
        setNewGithubUsername("");
        fetchTeam();
      } else {
        setStatusMessage({ type: "error", text: data.message || "Crearea administratorului a eșuat." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Eroare de rețea la crearea utilizatorului." });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteMember = async (id: string, username: string) => {
    if (!confirm(`Sigur dorești să ștergi contul administratorului ${username}? Această acțiune este ireversibilă.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/team?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: `Contul ${username} a fost șters din echipă.` });
        setSelectedMember(null);
        fetchTeam();
      } else {
        setStatusMessage({ type: "error", text: data.message || "Ștergerea a eșuat." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Eroare la ștergerea contului." });
    }
  };

  const isRootAdmin = currentUser?.isRoot || currentUser?.username?.toLowerCase() === "iannc69" || currentUser?.username?.toLowerCase() === "iannc";

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.username.toLowerCase().includes(q) ||
      m.displayName.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.email && m.email.toLowerCase().includes(q))
    );
  });

  const activeCount = members.filter((m) => m.status === "active").length;
  const rootCount = members.filter((m) => m.isRoot).length;

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb-tag">ACCESS CONTROL & TEAM MATRIX</div>
          <h1 className="admin-page-title">Echipa Mea & Matricea de Permisiuni</h1>
          <p className="admin-page-description">
            Administrează conturile de acces, atribuie roluri dedicate echipei tale și configurează permisiuni granulare pe fiecare modul din documentație.
          </p>
        </div>

        <div className="admin-header-actions">
          {isRootAdmin && (
            <button
              type="button"
              onClick={() => {
                setAddModalOpen(true);
                setStatusMessage(null);
              }}
              className="admin-btn admin-btn--primary"
            >
              <UserPlus size={14} />
              <span>Adaugă Membru Nou</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchTeam}
            disabled={loading}
            className="admin-btn admin-btn--secondary"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Reîmprospătează</span>
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

      {/* Metrics Row */}
      <div className="admin-team-metrics-grid">
        <div className="admin-team-metric-card">
          <div className="admin-team-metric-header">
            <span className="admin-team-metric-label">TOTAL MEMBRI</span>
            <div className="admin-team-metric-icon-box admin-team-metric-icon-box--orange">
              <Users size={15} />
            </div>
          </div>
          <div className="admin-team-metric-body">
            <div className="admin-team-metric-value">{members.length} Conturi</div>
            <span className="admin-team-metric-badge admin-team-metric-badge--green">{activeCount} ACTIVE</span>
          </div>
          <div className="admin-team-metric-sub">Conturi de acces înregistrate</div>
        </div>

        <div className="admin-team-metric-card">
          <div className="admin-team-metric-header">
            <span className="admin-team-metric-label">ROOT SUPER ADMIN</span>
            <div className="admin-team-metric-icon-box admin-team-metric-icon-box--amber">
              <ShieldCheck size={15} />
            </div>
          </div>
          <div className="admin-team-metric-body">
            <div className="admin-team-metric-value admin-team-metric-value--amber">iannC69</div>
            <span className="admin-team-metric-badge admin-team-metric-badge--amber">ROOT PROFIL</span>
          </div>
          <div className="admin-team-metric-sub">Control absolut & protecție imunitate</div>
        </div>

        <div className="admin-team-metric-card">
          <div className="admin-team-metric-header">
            <span className="admin-team-metric-label">SECURITATE RBAC</span>
            <div className="admin-team-metric-icon-box admin-team-metric-icon-box--cyan">
              <Lock size={15} />
            </div>
          </div>
          <div className="admin-team-metric-body">
            <div className="admin-team-metric-value admin-team-metric-value--cyan">RBAC 2.0</div>
            <span className="admin-team-metric-badge admin-team-metric-badge--cyan">10 MODULI</span>
          </div>
          <div className="admin-team-metric-sub">Permisiuni granulare criptate</div>
        </div>
      </div>

      {/* ── GitHub Contributors Graph Reconciliation Panel ── */}
      {unifiedContributors.length > 0 && (
        <div className="admin-github-sync-panel">
          <div className="admin-github-sync-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="admin-github-sync-icon-box">
                <GithubIcon size={16} className="text-zinc-200" />
              </div>
              <div>
                <h4 className="admin-github-sync-title">
                  <span>Sincronizare GitHub Contributors Graph</span>
                  <span className="admin-perm-tag" style={{ background: "hsl(142 71% 45% / 0.15)", border: "1px solid hsl(142 71% 45% / 0.3)", color: "hsl(142 71% 70%)", fontSize: "0.65rem", padding: "2px 7px" }}>
                    LIVE SYNC ACTIV
                  </span>
                </h4>
                <span style={{ fontSize: "0.72rem", color: "var(--color-text-tertiary)" }}>
                  Reconciliere automată între committerii din repository (graphs/contributors) și membrii din My Team
                </span>
              </div>
            </div>

            <a
              href="https://github.com/iannC69/wf-docscore/graphs/contributors"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-github-sync-link"
              title="Deschide graficul oficial pe GitHub"
            >
              <GithubIcon size={12} />
              <span>Vezi GitHub Contributors Graph</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <div className="admin-github-sync-grid">
            {unifiedContributors.map((gc) => {
              const matchedMember = members.find(
                (m) =>
                  ((m as any).githubUsername && (m as any).githubUsername.toLowerCase() === gc.login.toLowerCase()) ||
                  m.username.toLowerCase() === gc.login.toLowerCase() ||
                  m.displayName.toLowerCase() === gc.login.toLowerCase()
              );

              return (
                <div key={gc.login} className="admin-github-sync-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <img
                      src={gc.avatarUrl || `https://github.com/${gc.login}.png`}
                      alt={gc.login}
                      className="admin-github-sync-avatar"
                      onError={(e) => {
                        if (matchedMember?.avatarUrl) {
                          (e.currentTarget as HTMLImageElement).src = matchedMember.avatarUrl;
                        }
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="admin-github-sync-username">@{gc.login}</span>
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: gc.totalCommits > 0 ? "hsl(215 90% 65%)" : "var(--color-text-muted)", fontFamily: "var(--font-mono, monospace)" }}>
                          {gc.totalCommits} commits
                        </span>
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--color-text-tertiary)" }}>
                        {matchedMember ? (
                          <span style={{ color: "hsl(142 71% 70%)" }}>
                            ✓ Reconciliat cu <strong>@{matchedMember.username}</strong>
                          </span>
                        ) : (
                          <span style={{ color: "hsl(38 92% 65%)" }}>
                            Neasociat în My Team
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono, monospace)", textAlign: "right", flexShrink: 0 }}>
                    {gc.totalAdditions > 0 && (
                      <span style={{ color: "hsl(142 71% 65%)", display: "block" }}>+{gc.totalAdditions.toLocaleString()}</span>
                    )}
                    {gc.totalDeletions > 0 && (
                      <span style={{ color: "hsl(0 84% 65%)", display: "block" }}>-{gc.totalDeletions.toLocaleString()}</span>
                    )}
                    {gc.totalCommits === 0 && (
                      <span style={{ color: "var(--color-text-muted)", fontSize: "0.65rem", display: "block" }}>Profil Conectat</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="admin-team-toolbar">
        <div className="admin-team-search-box">
          <Search size={14} className="admin-search-icon" />
          <input
            type="text"
            name="admin_team_search_query_no_autofill"
            id="admin_team_search_query_no_autofill"
            placeholder="Caută membru după nume, rol sau username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            className="admin-team-search-input"
          />
        </div>

        <div className="admin-current-session-pill">
          <span className="admin-current-session-dot" />
          <span className="admin-current-session-label">Autentificat ca:</span>
          <span className="admin-current-session-name">{currentUser?.displayName || currentUser?.username || "Admin"}</span>
          <span className={`admin-current-session-tag ${isRootAdmin ? "admin-current-session-tag--root" : "admin-current-session-tag--member"}`}>
            {isRootAdmin ? "Root Super Admin" : "Membru Delegat"}
          </span>
        </div>
      </div>


      {/* Members Grid */}
      <div className="admin-team-grid">
        {loading ? (
          <div className="admin-team-loading">
            <RefreshCw size={24} className="animate-spin text-[var(--color-primary)] mb-2" />
            <span>Se încarcă membrii echipei...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="admin-team-empty">
            <Users size={36} className="text-[var(--color-text-tertiary)] mb-2" />
            <p>Niciun membru găsit conform căutării.</p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const activePermCount = Object.values(member.permissions || {}).filter(Boolean).length;
            const isSelected = selectedMember?.id === member.id;

            return (
              <div
                key={member.id}
                onClick={() => openInspector(member)}
                className={`admin-member-card ${isSelected ? "admin-member-card--selected" : ""}`}
              >
                <div className="admin-member-card-header">
                  {/* Avatar */}
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.displayName}
                      className="admin-member-avatar"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="admin-member-avatar"
                      style={{ backgroundColor: member.avatarColor || "#ff6b00" }}
                    >
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="admin-member-title-box">
                    <div className="flex items-center gap-2">
                      <h4 className="admin-member-name">{member.displayName}</h4>
                      {member.isRoot && (
                        <span className="admin-root-badge" title="Root Super Admin (Protejat)">
                          <ShieldCheck size={11} />
                          <span>ROOT</span>
                        </span>
                      )}
                    </div>
                    <span className="admin-member-username">@{member.username}</span>
                  </div>


                  <span
                    className={`admin-status-pill ${
                      member.status === "active"
                        ? "admin-status-pill--active"
                        : "admin-status-pill--suspended"
                    }`}
                  >
                    {member.status === "active" ? "ACTIV" : "SUSPENDAT"}
                  </span>
                </div>

                <div className="admin-member-card-body">
                  <div className={`admin-member-role-badge admin-member-role-badge--${member.role}`}>
                    <span>{rolePresets[member.role]?.label || member.role.replace("_", " ")}</span>
                  </div>

                  {member.email && (
                    <div className="admin-member-email">{member.email}</div>
                  )}

                  {/* Active Permission Badges with Vibrant Colors */}
                  <div className="admin-member-perms-list">
                    {member.permissions.canEditDocs && (
                      <span className="admin-perm-tag admin-perm-tag--studio">Content Studio</span>
                    )}
                    {member.permissions.canDeleteDocs && (
                      <span className="admin-perm-tag admin-perm-tag--delete">Delete Docs</span>
                    )}
                    {member.permissions.canManageHealth && (
                      <span className="admin-perm-tag admin-perm-tag--health">Doc Health</span>
                    )}
                    {member.permissions.canManageMedia && (
                      <span className="admin-perm-tag admin-perm-tag--media">Media Vault</span>
                    )}
                    {member.permissions.canManageTasks && (
                      <span className="admin-perm-tag admin-perm-tag--tasks">Task Hub</span>
                    )}
                    {member.permissions.canViewAnalytics && (
                      <span className="admin-perm-tag admin-perm-tag--telemetry">Telemetry</span>
                    )}
                    {member.permissions.canViewAiStats && (
                      <span className="admin-perm-tag admin-perm-tag--ai">AI Telemetry</span>
                    )}
                    {member.permissions.canManageDb && (
                      <span className="admin-perm-tag admin-perm-tag--db">Database</span>
                    )}
                    {member.permissions.canViewAudit && (
                      <span className="admin-perm-tag admin-perm-tag--audit">Audit Ledger</span>
                    )}
                    {member.permissions.canManageSecurity && (
                      <span className="admin-perm-tag admin-perm-tag--security">Securitate 2FA</span>
                    )}
                    {member.permissions.canManageApiKeys && (
                      <span className="admin-perm-tag admin-perm-tag--api">API Tokens</span>
                    )}
                    {member.permissions.canManageSnapshots && (
                      <span className="admin-perm-tag admin-perm-tag--snapshots">Snapshots</span>
                    )}
                    {member.permissions.canManageWebhooks && (
                      <span className="admin-perm-tag admin-perm-tag--webhooks">Webhooks</span>
                    )}
                    {member.permissions.canManageSettings && (
                      <span className="admin-perm-tag admin-perm-tag--settings">Setări Platformă</span>
                    )}
                    {member.permissions.canManageTeam && (
                      <span className="admin-perm-tag admin-perm-tag--team">Gestiune Echipă</span>
                    )}
                    {member.permissions.canTriggerPanic && (
                      <span className="admin-perm-tag admin-perm-tag--panic">Panic Lockdown</span>
                    )}
                  </div>
                </div>

                <div className="admin-member-card-footer">
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span className="admin-member-perms-count">
                      {activePermCount} / 16 Permisiuni Active
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--color-text-tertiary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {repoStats[member.username.toLowerCase()]?.totalCommits ? (
                        <>
                          <GitCommit size={10} className="text-cyan-400" />
                          <span><strong>{repoStats[member.username.toLowerCase()].totalCommits}</strong> commit-uri repo</span>
                        </>
                      ) : (
                        <>
                          <FileText size={10} className="text-zinc-500" />
                          <span><strong>{repoStats[member.username.toLowerCase()]?.docsCommits ?? 0}</strong> ghiduri modificate</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <a
                      href={`/docs/team/${encodeURIComponent(member.username)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-member-inspect-btn"
                      style={{ textDecoration: "none", background: "hsl(0 0% 100% / 0.04)", display: "inline-flex", alignItems: "center", gap: "5px" }}
                      title="Deschide profilul public"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                    </a>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInspector(member);
                      }}
                      className="admin-member-inspect-btn"
                    >
                      <span>Inspector</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* DEEP PROFILE & PERMISSIONS INSPECTOR MODAL / DRAWER */}
      {/* ========================================================================= */}
      {selectedMember && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container admin-modal-container--large">
            <div className="admin-modal-header">
              <div className="flex items-center gap-3">
                {editAvatarUrl || steamAvatarPreview || selectedMember.avatarUrl ? (
                  <img
                    src={editAvatarUrl || steamAvatarPreview || selectedMember.avatarUrl || ""}
                    alt={selectedMember.displayName}
                    className="admin-member-avatar"
                    style={{ objectFit: "cover" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div
                    className="admin-member-avatar"
                    style={{ backgroundColor: selectedMember.avatarColor || "#ff6b00" }}
                  >
                    {selectedMember.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="admin-modal-title">
                      {selectedMember.displayName}
                    </h3>
                    <span className={`admin-member-role-badge admin-member-role-badge--${selectedMember.role}`}>
                      {rolePresets[selectedMember.role]?.label || selectedMember.role.replace("_", " ")}
                    </span>
                    <span
                      className={`admin-status-pill ${
                        selectedMember.status === "active"
                          ? "admin-status-pill--active"
                          : "admin-status-pill--suspended"
                      }`}
                    >
                      {selectedMember.status === "active" ? "ACTIV" : "SUSPENDAT"}
                    </span>
                  </div>
                  <p className="admin-modal-subtitle">
                    @{selectedMember.username} {selectedMember.email ? `• ${selectedMember.email}` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="admin-modal-close-btn"
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* If Root Super Admin, show editing controls */}
              {isRootAdmin && (
                <div className="admin-modal-glass-section">
                  <div className="admin-modal-section-label">Profil Public &amp; Informații Cont</div>
                  <div className="admin-modal-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Nume Afișat</label>
                      <input
                        type="text"
                        value={editDisplayName}
                        autoComplete="off"
                        data-lpignore="true"
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Username (@login handle)</label>
                      <input
                        type="text"
                        value={editUsername}
                        disabled={selectedMember.isRoot}
                        autoComplete="off"
                        data-lpignore="true"
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Ex: iannc69"
                        className="admin-form-input font-mono"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Email Oficial</label>
                      <input
                        type="email"
                        value={editEmail}
                        autoComplete="off"
                        data-lpignore="true"
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Ex: user@wildfire.ro"
                        className="admin-form-input"
                      />
                    </div>

                    {!selectedMember.isRoot && (
                      <div className="admin-form-group">
                        <label className="admin-form-label">Status Cont</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="admin-form-input"
                        >
                          <option value="active">ACTIV (Acces Complet Permis)</option>
                          <option value="suspended">SUSPENDAT (Acces Blocat Temporar)</option>
                        </select>
                      </div>
                    )}

                    {!selectedMember.isRoot && (
                      <div className="admin-form-group">
                        <label className="admin-form-label">Schimbă Parola</label>
                        <input
                          type="password"
                          value={editNewPassword}
                          autoComplete="new-password"
                          data-lpignore="true"
                          onChange={(e) => setEditNewPassword(e.target.value)}
                          placeholder="Parolă nouă (opțional)..."
                          className="admin-form-input"
                        />
                      </div>
                    )}

                    <div className="admin-form-group">
                      <label className="admin-form-label">Titlu Special / Funcție Card</label>
                      <input
                        type="text"
                        value={editCustomTitle}
                        autoComplete="off"
                        data-lpignore="true"
                        onChange={(e) => setEditCustomTitle(e.target.value)}
                        placeholder="Ex: Lead Docs & Systems Architect"
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Tag / UserID Discord</label>
                      <input
                        type="text"
                        value={editDiscord}
                        autoComplete="off"
                        data-lpignore="true"
                        onChange={(e) => setEditDiscord(e.target.value)}
                        placeholder="Ex: iannc sau 371621920162185216"
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">SteamID / Link Profil Steam</label>
                      <input
                        type="text"
                        value={editSteamId}
                        autoComplete="off"
                        data-lpignore="true"
                        onChange={(e) => setEditSteamId(e.target.value)}
                        placeholder="Ex: 1iannc sau 76561198... sau link complet"
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">GitHub Username (Profil Contribuitor)</label>
                      <input
                        type="text"
                        value={editGithubUsername}
                        autoComplete="off"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        onChange={(e) => setEditGithubUsername(e.target.value)}
                        placeholder="Ex: iannC69"
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label className="admin-form-label">URL Poză Avatar (Imagine Profil)</label>
                        {!editAvatarUrl && steamAvatarPreview && (
                          <span style={{ fontSize: "0.68rem", color: "#60a5fa", fontWeight: 700 }}>
                            ● Preluat automat de pe Steam
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {editAvatarUrl || steamAvatarPreview ? (
                          <img
                            src={editAvatarUrl || steamAvatarPreview || ""}
                            alt="Preview"
                            style={{ width: "34px", height: "34px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--glass-border)", flexShrink: 0 }}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : null}
                        <input
                          type="text"
                          value={editAvatarUrl}
                          autoComplete="off"
                          data-lpignore="true"
                          onChange={(e) => setEditAvatarUrl(e.target.value)}
                          placeholder={steamAvatarPreview ? "Lăsat gol: folosește automat Steam" : "https://... (URL imagine)"}
                          className="admin-form-input text-xs font-mono"
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    {/* Auto-Progression Engine Banner */}
                    <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                      <div
                        style={{
                          padding: "12px 16px",
                          background: "rgba(16, 185, 129, 0.06)",
                          border: "1px solid rgba(16, 185, 129, 0.22)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Sparkles size={16} className="text-emerald-400" />
                          <div>
                            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#10b981", letterSpacing: "0.02em" }}>
                              PROGRES &amp; INSIGNE AUTOMATE
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
                              Contorul de ghiduri, commit-urile Git și insignele sunt calculate 100% automat în timp real.
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span className="admin-perm-tag" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                            <BookOpen size={10} className="inline mr-1" />
                            {selectedMember.docsModifiedCount || 0} Ghiduri
                          </span>
                          <span className="admin-perm-tag" style={{ background: "rgba(6, 182, 212, 0.12)", color: "#06b6d4", borderColor: "rgba(6, 182, 212, 0.3)" }}>
                            <GitCommit size={10} className="inline mr-1" />
                            Auto-Sync Git
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="admin-form-label">Bio / Descriere Publică</label>
                      <input
                        type="text"
                        value={editBio}
                        autoComplete="off"
                        data-lpignore="true"
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Scurtă descriere a activității..."
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="admin-form-label">Responsabilități (Separate prin virgulă)</label>
                      <input
                        type="text"
                        value={editRespString}
                        autoComplete="off"
                        data-lpignore="true"
                        onChange={(e) => setEditRespString(e.target.value)}
                        placeholder="Ex: Arhitectură Sisteme, Ghiduri MVP, Securitate"
                        className="admin-form-input"
                      />
                    </div>
                  </div>

                </div>
              )}



              {/* Role Presets Bar */}
              {isRootAdmin && !selectedMember.isRoot && (
                <div className="admin-form-group mb-4">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label className="admin-form-label" style={{ marginBottom: 0 }}>
                      <Wand2 size={13} className="inline mr-1 text-amber-400" />
                      Șabloane Rapide de Rol &amp; Permisiuni
                    </label>
                    <span style={{ fontSize: "0.68rem", color: "var(--color-text-tertiary)" }}>
                      Selectează un rol predefinit sau configurează manual comutatoarele de mai jos
                    </span>
                  </div>
                  <div className="admin-role-picker-grid">
                    {Object.entries(rolePresets).map(([key, preset]: [string, any]) => {
                      if (key === "root_admin") return null;
                      const isSelected = editRole === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleRolePresetChange(key, false)}
                          className={`admin-role-preset-btn ${
                            isSelected ? "admin-role-preset-btn--active" : ""
                          }`}
                        >
                          <span className="admin-role-preset-name">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORIZED LIQUID GLASS PERMISSIONS MATRIX */}
              <div className="admin-perms-section">
                <div className="admin-perms-header-bar">
                  <span className="admin-perms-header-title">
                    {isRootAdmin && !selectedMember.isRoot ? "MATRICE PERMISIUNI & ACCES MODULE (16 MODULI)" : "PERMISIUNI ACTIVE"}
                  </span>
                  <span className="admin-perms-header-count">
                    {Object.values(isRootAdmin && !selectedMember.isRoot ? editPermissions : (selectedMember.permissions || {})).filter(Boolean).length} / 16 Module Active
                  </span>
                </div>

                <div className="admin-perms-categories-stack">
                  {PERMISSION_GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    const groupActiveCount = group.modules.filter((m) =>
                      Boolean(isRootAdmin && !selectedMember.isRoot ? editPermissions[m.key] : selectedMember.permissions?.[m.key])
                    ).length;

                    return (
                      <div key={group.title} className="admin-perm-category-card">
                        <div className="admin-perm-cat-header">
                          <div className="admin-perm-cat-title-wrap">
                            <div
                              className="admin-perm-cat-badge-icon"
                              style={{ backgroundColor: `${group.accent}18`, color: group.accent }}
                            >
                              <GroupIcon size={12} />
                            </div>
                            <div>
                              <div className="admin-perm-cat-title">{group.title}</div>
                              <div className="admin-perm-cat-sub">{group.subtitle}</div>
                            </div>
                          </div>

                          <div className="admin-perm-cat-actions">
                            <span
                              className="admin-perm-tag"
                              style={{
                                backgroundColor: `${group.accent}15`,
                                color: group.accent,
                                borderColor: `${group.accent}30`,
                                fontSize: "0.65rem",
                                padding: "2px 7px",
                              }}
                            >
                              {groupActiveCount} / {group.modules.length} Active
                            </span>
                            {isRootAdmin && !selectedMember.isRoot && group.modules.some((m) => !m.isRestricted) && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelectAll(group.modules, true, false)}
                                  className="admin-perm-cat-btn"
                                  title="Activează toate permisiunile din această categorie"
                                >
                                  Toate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelectAll(group.modules, false, false)}
                                  className="admin-perm-cat-btn"
                                  title="Dezactivează toate permisiunile din această categorie"
                                >
                                  Niciuna
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="admin-perms-compact-grid">
                          {group.modules.map((item) => {
                            const isGranted = Boolean(selectedMember.permissions?.[item.key]);
                            const editVal = Boolean(editPermissions[item.key]);
                            const IconComp = item.icon;

                            return (
                              <div
                                key={item.key}
                                className={`admin-perm-compact-tile ${
                                  (isRootAdmin && !selectedMember.isRoot ? editVal : isGranted)
                                    ? "admin-perm-compact-tile--active"
                                    : "admin-perm-compact-tile--inactive"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0" style={{ flex: 1 }}>
                                  <div
                                    className="admin-perm-compact-icon"
                                    style={{
                                      color: item.color,
                                      backgroundColor: `${item.color}15`,
                                      borderColor: `${item.color}30`,
                                    }}
                                  >
                                    <IconComp size={14} />
                                  </div>
                                  <div className="admin-perm-tile-text">
                                    <span className="admin-perm-compact-name">{item.name}</span>
                                    <span className="admin-perm-tile-desc" title={item.desc}>
                                      {item.desc}
                                    </span>
                                  </div>
                                </div>

                                {isRootAdmin && !selectedMember.isRoot && !item.isRestricted ? (
                                  <label className="admin-toggle-switch">
                                    <input
                                      type="checkbox"
                                      checked={editVal}
                                      onChange={(e) => {
                                        setEditPermissions((prev) => ({
                                          ...prev,
                                          [item.key]: e.target.checked,
                                        }));
                                        setEditRole("custom");
                                      }}
                                    />
                                    <span className="admin-toggle-slider" />
                                  </label>
                                ) : (
                                  <span
                                    className={`admin-perm-status-pill ${
                                      isGranted ? "admin-perm-status-pill--granted" : "admin-perm-status-pill--denied"
                                    }`}
                                  >
                                    {isGranted ? <Check size={11} /> : <Lock size={11} />}
                                    <span>{isGranted ? "ACTIV" : "BLOCAT"}</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="admin-modal-footer">
              {!selectedMember.isRoot && isRootAdmin && (
                <button
                  type="button"
                  onClick={() => handleDeleteMember(selectedMember.id, selectedMember.username)}
                  className="admin-btn admin-btn--danger"
                >
                  <Trash2 size={14} />
                  <span>Șterge Membru</span>
                </button>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="admin-btn admin-btn--secondary"
                >
                  Închide
                </button>

                {isRootAdmin && (
                  <button
                    type="button"
                    onClick={handleSaveMember}
                    disabled={savingEdit}
                    className="admin-btn admin-btn--primary"
                  >
                    <Save size={14} />
                    <span>{savingEdit ? "Se salvează..." : "Salvează Permisiunile"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD NEW MEMBER MODAL */}
      {/* ========================================================================= */}
      {addModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <div>
                <div className="admin-modal-pretitle">
                  <UserPlus size={11} />
                  <span>ACCESS CONTROL — NOU CONT</span>
                </div>
                <h3 className="admin-modal-title">Adaugă Administrator Nou</h3>
                <p className="admin-modal-subtitle">Configurează rolul, acreditivele și permisiunile granulare.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="admin-modal-close-btn"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMember}>
              <div className="admin-modal-body">
                {/* Credentials section */}
                <div className="admin-modal-glass-section">
                  <div className="admin-modal-section-label">Credențiale Cont</div>
                  <div className="admin-modal-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Username (Cont Logare)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: alex_lead"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Nume Afișat</label>
                      <input
                        type="text"
                        placeholder="Ex: Alex - Doc Lead"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Parolă Inițială</label>
                      <input
                        type="password"
                        required
                        placeholder="Parolă complexă..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Email Oficial</label>
                      <input
                        type="email"
                        placeholder="alex@wildfire.ro"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Tag / UserID Discord (Opțional)</label>
                      <input
                        type="text"
                        placeholder="Ex: alex_wf sau 282937..."
                        value={newDiscord}
                        onChange={(e) => setNewDiscord(e.target.value)}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">SteamID / Link Profil Steam (Opțional)</label>
                      <input
                        type="text"
                        placeholder="Ex: 76561198... sau alex_cs2"
                        value={newSteamId}
                        onChange={(e) => setNewSteamId(e.target.value)}
                        className="admin-form-input"
                      />
                    </div>

                    <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="admin-form-label">GitHub Username (Profil Contribuitor / Auto-Push)</label>
                      <input
                        type="text"
                        placeholder="Ex: alex_dev (username oficial pe GitHub)"
                        value={newGithubUsername}
                        onChange={(e) => setNewGithubUsername(e.target.value)}
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                </div>


                {/* Role Preset */}
                <div className="admin-form-group">
                  <div className="admin-modal-section-label">Rol &amp; Șablon Rapid de Permisiuni</div>
                  <div className="admin-role-picker-grid">
                    {Object.entries(rolePresets).map(([key, preset]: [string, any]) => {
                      if (key === "root_admin") return null;
                      const isSelected = newRole === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleRolePresetChange(key, true)}
                          className={`admin-role-preset-btn ${
                            isSelected ? "admin-role-preset-btn--active" : ""
                          }`}
                        >
                          <div className="admin-role-preset-name">{preset.label}</div>
                          <div className="admin-role-preset-desc">{preset.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categorized Permissions Grid for New Member */}
                <div className="admin-perms-section mt-4">
                  <div className="admin-perms-header-bar">
                    <span className="admin-perms-header-title">COMUTATOARE PERMISIUNI INIȚIALE (16 MODULI)</span>
                    <span className="admin-perms-header-count">
                      {Object.values(newPermissions || {}).filter(Boolean).length} / 16 Active
                    </span>
                  </div>

                  <div className="admin-perms-categories-stack">
                    {PERMISSION_GROUPS.map((group) => {
                      const GroupIcon = group.icon;
                      const groupActiveCount = group.modules.filter((m) => Boolean(newPermissions[m.key])).length;

                      return (
                        <div key={group.title} className="admin-perm-category-card">
                          <div className="admin-perm-cat-header">
                            <div className="admin-perm-cat-title-wrap">
                              <div
                                className="admin-perm-cat-badge-icon"
                                style={{ backgroundColor: `${group.accent}18`, color: group.accent }}
                              >
                                <GroupIcon size={12} />
                              </div>
                              <div>
                                <div className="admin-perm-cat-title">{group.title}</div>
                                <div className="admin-perm-cat-sub">{group.subtitle}</div>
                              </div>
                            </div>

                            <div className="admin-perm-cat-actions">
                              <span
                                className="admin-perm-tag"
                                style={{
                                  backgroundColor: `${group.accent}15`,
                                  color: group.accent,
                                  borderColor: `${group.accent}30`,
                                  fontSize: "0.65rem",
                                  padding: "2px 7px",
                                }}
                              >
                                {groupActiveCount} / {group.modules.length} Active
                              </span>
                              {group.modules.some((m) => !m.isRestricted) && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleCategorySelectAll(group.modules, true, true)}
                                    className="admin-perm-cat-btn"
                                    title="Activează toate permisiunile din această categorie"
                                  >
                                    Toate
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCategorySelectAll(group.modules, false, true)}
                                    className="admin-perm-cat-btn"
                                    title="Dezactivează toate permisiunile din această categorie"
                                  >
                                    Niciuna
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="admin-perms-compact-grid">
                            {group.modules.map((item) => {
                              const isGranted = Boolean(newPermissions[item.key]);
                              const IconComp = item.icon;

                              return (
                                <div
                                  key={item.key}
                                  className={`admin-perm-compact-tile ${
                                    isGranted ? "admin-perm-compact-tile--active" : "admin-perm-compact-tile--inactive"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0" style={{ flex: 1 }}>
                                    <div
                                      className="admin-perm-compact-icon"
                                      style={{
                                        color: item.color,
                                        backgroundColor: `${item.color}15`,
                                        borderColor: `${item.color}30`,
                                      }}
                                    >
                                      <IconComp size={14} />
                                    </div>
                                    <div className="admin-perm-tile-text">
                                      <span className="admin-perm-compact-name">{item.name}</span>
                                      <span className="admin-perm-tile-desc" title={item.desc}>
                                        {item.desc}
                                      </span>
                                    </div>
                                  </div>

                                  {!item.isRestricted ? (
                                    <label className="admin-toggle-switch">
                                      <input
                                        type="checkbox"
                                        checked={isGranted}
                                        onChange={(e) => {
                                          setNewPermissions((prev) => ({
                                            ...prev,
                                            [item.key]: e.target.checked,
                                          }));
                                          setNewRole("custom");
                                        }}
                                      />
                                      <span className="admin-toggle-slider" />
                                    </label>
                                  ) : (
                                    <span className="admin-perm-status-pill admin-perm-status-pill--denied">
                                      <Lock size={11} />
                                      <span>BLOCAT</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="admin-btn admin-btn--secondary"
                >
                  Anulează
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="admin-btn admin-btn--primary"
                >
                  <Plus size={14} />
                  <span>{creating ? "Se creează contul..." : "Creează Administrator"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
