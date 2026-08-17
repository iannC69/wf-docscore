"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import type { TeamMember, TeamMemberPermissions } from "@/lib/security/teamStore";

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rolePresets, setRolePresets] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Inspector / Edit Modal State
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editDisplayName, setEditDisplayName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("content_editor");
  const [editStatus, setEditStatus] = useState<"active" | "suspended">("active");
  const [editPermissions, setEditPermissions] = useState<TeamMemberPermissions>({
    canEditDocs: true,
    canDeleteDocs: false,
    canManageMedia: true,
    canViewAnalytics: true,
    canViewAudit: false,
    canManageSettings: false,
    canManageSecurity: false,
    canManageApiKeys: false,
    canTriggerPanic: false,
    canManageTeam: false,
  });
  const [editNewPassword, setEditNewPassword] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // Add Member Modal State
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [newDisplayName, setNewDisplayName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("content_editor");
  const [newPermissions, setNewPermissions] = useState<TeamMemberPermissions>({
    canEditDocs: true,
    canDeleteDocs: false,
    canManageMedia: true,
    canViewAnalytics: true,
    canViewAudit: false,
    canManageSettings: false,
    canManageSecurity: false,
    canManageApiKeys: false,
    canTriggerPanic: false,
    canManageTeam: false,
  });
  const [creating, setCreating] = useState<boolean>(false);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setMembers(data.members || []);
      setCurrentUser(data.currentUser || null);
      setRolePresets(data.rolePresets || {});
    } catch (err) {
      console.error("Failed to load team data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openInspector = (member: TeamMember) => {
    setSelectedMember(member);
    setEditDisplayName(member.displayName);
    setEditEmail(member.email || "");
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditPermissions({ ...member.permissions });
    setEditNewPassword("");
    setStatusMessage(null);
  };

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

  const handleSaveMember = async () => {
    if (!selectedMember) return;
    setSavingEdit(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMember.id,
          displayName: editDisplayName,
          email: editEmail,
          role: editRole,
          status: editStatus,
          permissions: editPermissions,
          password: editNewPassword.trim() ? editNewPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: `Modificările pentru ${selectedMember.username} au fost salvate.` });
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

      {/* Search & Filter Toolbar */}
      <div className="admin-team-toolbar">
        <div className="admin-team-search-box">
          <Search size={14} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Caută membru după nume, rol sau username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                  <div
                    className="admin-member-avatar"
                    style={{ backgroundColor: member.avatarColor || "#ff6b00" }}
                  >
                    {member.displayName.slice(0, 2).toUpperCase()}
                  </div>

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
                    {member.permissions.canManageMedia && (
                      <span className="admin-perm-tag admin-perm-tag--media">Media Vault</span>
                    )}
                    {member.permissions.canManageSettings && (
                      <span className="admin-perm-tag admin-perm-tag--settings">Setări Platformă</span>
                    )}
                    {member.permissions.canViewAnalytics && (
                      <span className="admin-perm-tag admin-perm-tag--telemetry">Telemetry</span>
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
                    {member.permissions.canTriggerPanic && (
                      <span className="admin-perm-tag admin-perm-tag--panic">Panic Lockdown</span>
                    )}
                  </div>
                </div>

                <div className="admin-member-card-footer">
                  <span className="admin-member-perms-count">
                    {activePermCount} / 10 Permisiuni Active
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInspector(member);
                    }}
                    className="admin-member-inspect-btn"
                  >
                    <span>Vezi Profil</span>
                  </button>
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
                <div
                  className="admin-member-avatar"
                  style={{ backgroundColor: selectedMember.avatarColor || "#ff6b00" }}
                >
                  {selectedMember.displayName.slice(0, 2).toUpperCase()}
                </div>
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
              {isRootAdmin && !selectedMember.isRoot && (
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Redenumește Afișat</label>
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="admin-form-input"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Schimbă Parola</label>
                    <input
                      type="password"
                      value={editNewPassword}
                      onChange={(e) => setEditNewPassword(e.target.value)}
                      placeholder="Parolă nouă..."
                      className="admin-form-input"
                    />
                  </div>
                </div>
              )}

              {/* Role Presets (Only for Root Admin) */}
              {isRootAdmin && !selectedMember.isRoot && (
                <div className="admin-form-group mb-4">
                  <label className="admin-form-label">Aplică Șablon Rapid de Rol</label>
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

              {/* COMPACT 2-COLUMN PERMISSIONS MATRIX */}
              <div className="admin-perms-section">
                <div className="admin-perms-header-bar">
                  <span className="admin-perms-header-title">
                    {isRootAdmin && !selectedMember.isRoot ? "COMUTATOARE PERMISIUNI (10 MODULI)" : "PERMISIUNI ACTIVE"}
                  </span>
                  <span className="admin-perms-header-count">
                    {Object.values(selectedMember.permissions || {}).filter(Boolean).length} / 10 Active
                  </span>
                </div>

                <div className="admin-perms-compact-grid">
                  {[
                    { key: "canEditDocs" as keyof TeamMemberPermissions, name: "Content Studio", icon: FileEdit, color: "#10b981" },
                    { key: "canDeleteDocs" as keyof TeamMemberPermissions, name: "Ștergere Docs", icon: Trash2, color: "#f43f5e" },
                    { key: "canManageMedia" as keyof TeamMemberPermissions, name: "Media Vault", icon: Folder, color: "#06b6d4" },
                    { key: "canViewAnalytics" as keyof TeamMemberPermissions, name: "Search Telemetry", icon: Search, color: "#a855f7" },
                    { key: "canViewAudit" as keyof TeamMemberPermissions, name: "Audit Ledger", icon: ScrollText, color: "#f59e0b" },
                    { key: "canManageSettings" as keyof TeamMemberPermissions, name: "Setări & Backup", icon: Sliders, color: "#ff6b00" },
                    { key: "canManageSecurity" as keyof TeamMemberPermissions, name: "Securitate 2FA", icon: ShieldCheck, color: "#3b82f6" },
                    { key: "canManageApiKeys" as keyof TeamMemberPermissions, name: "API Tokens", icon: Key, color: "#6366f1" },
                    { key: "canTriggerPanic" as keyof TeamMemberPermissions, name: "Panic Lockdown", icon: ShieldAlert, color: "#ef4444", isRestricted: true },
                    { key: "canManageTeam" as keyof TeamMemberPermissions, name: "Gestiune Echipă", icon: Users, color: "#f59e0b", isRestricted: true },
                  ].map((item) => {
                    const isGranted = Boolean(selectedMember.permissions?.[item.key]);
                    const editVal = Boolean(editPermissions[item.key]);
                    const IconComp = item.icon;

                    return (
                      <div
                        key={item.key}
                        className={`admin-perm-compact-tile ${isGranted ? "admin-perm-compact-tile--active" : "admin-perm-compact-tile--inactive"}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="admin-perm-compact-icon"
                            style={{ color: item.color, backgroundColor: `${item.color}15`, borderColor: `${item.color}35` }}
                          >
                            <IconComp size={13} />
                          </div>
                          <span className="admin-perm-compact-name">{item.name}</span>
                        </div>

                        {isRootAdmin && !selectedMember.isRoot && !item.isRestricted ? (
                          <label className="admin-toggle-switch">
                            <input
                              type="checkbox"
                              checked={editVal}
                              onChange={(e) =>
                                setEditPermissions({ ...editPermissions, [item.key]: e.target.checked })
                              }
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
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-orange-400" />
                <h3 className="admin-modal-title">Adaugă Administrator Nou</h3>
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
                <div className="grid grid-cols-2 gap-3 mb-4">
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
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
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
                </div>

                {/* Role Preset */}
                <div className="admin-form-group mb-4">
                  <label className="admin-form-label">Rol & Permisiuni Inițiale</label>
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
