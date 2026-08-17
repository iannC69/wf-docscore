import fs from "fs";
import path from "path";
import { hashPassword, verifyPassword, generateRandomToken } from "./crypto";

export interface TeamMemberPermissions {
  canEditDocs: boolean;       // Acces la Content Studio (editare/creare)
  canDeleteDocs: boolean;     // Ștergere articole Markdown
  canManageMedia: boolean;    // Media & Asset Vault
  canViewAnalytics: boolean;  // Search Telemetry
  canViewAudit: boolean;      // Audit Ledger
  canManageSettings: boolean; // Setări platformă, anunțuri & backup
  canManageSecurity: boolean; // Securitate & 2FA
  canManageApiKeys: boolean;  // Chei API
  canTriggerPanic: boolean;   // Panic Lockdown (Strict Root iannC69)
  canManageTeam: boolean;     // Gestiune echipă & permisiuni (Strict Root iannC69)
}

export interface TeamMember {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  role: "root_admin" | "doc_lead" | "content_editor" | "moderator" | "viewer";
  avatarColor: string;
  passwordHash: string;
  salt: string;
  permissions: TeamMemberPermissions;
  status: "active" | "suspended";
  isRoot: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

const TEAM_FILE_PATH = path.join(process.cwd(), "content", "team.json");
const ENV_LOCAL_PATH = path.join(process.cwd(), ".env.local");

const ROOT_PERMISSIONS: TeamMemberPermissions = {
  canEditDocs: true,
  canDeleteDocs: true,
  canManageMedia: true,
  canViewAnalytics: true,
  canViewAudit: true,
  canManageSettings: true,
  canManageSecurity: true,
  canManageApiKeys: true,
  canTriggerPanic: true,
  canManageTeam: true,
};

export const ROLE_PRESETS: Record<string, { label: string; description: string; permissions: TeamMemberPermissions }> = {
  root_admin: {
    label: "Root Super Admin",
    description: "Control absolut peste întregul sistem, Panic Lockdown și gestiunea echipei.",
    permissions: ROOT_PERMISSIONS,
  },
  doc_lead: {
    label: "Documentation Lead",
    description: "Gestionează articolele, fișierele media, setările platformei și backup-urile.",
    permissions: {
      canEditDocs: true,
      canDeleteDocs: true,
      canManageMedia: true,
      canViewAnalytics: true,
      canViewAudit: true,
      canManageSettings: true,
      canManageSecurity: false,
      canManageApiKeys: false,
      canTriggerPanic: false,
      canManageTeam: false,
    },
  },
  content_editor: {
    label: "Content Editor",
    description: "Redactează și actualizează ghiduri Markdown și gestionează resursele media.",
    permissions: {
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
    },
  },
  moderator: {
    label: "Reviewer / Moderator",
    description: "Revizuiește documentația și analizează căutările jucătorilor.",
    permissions: {
      canEditDocs: true,
      canDeleteDocs: false,
      canManageMedia: false,
      canViewAnalytics: true,
      canViewAudit: true,
      canManageSettings: false,
      canManageSecurity: false,
      canManageApiKeys: false,
      canTriggerPanic: false,
      canManageTeam: false,
    },
  },
  viewer: {
    label: "Auditor / Read-Only",
    description: "Acces exclusiv de vizualizare pe documentație și rapoarte de audit.",
    permissions: {
      canEditDocs: false,
      canDeleteDocs: false,
      canManageMedia: false,
      canViewAnalytics: true,
      canViewAudit: true,
      canManageSettings: false,
      canManageSecurity: false,
      canManageApiKeys: false,
      canTriggerPanic: false,
      canManageTeam: false,
    },
  },
};

/**
 * Synchronizes team members and passwords directly to .env.local
 */
export function syncAdminToEnv(username: string, rawPassword?: string, action: "set" | "remove" = "set"): void {
  try {
    let content = fs.existsSync(ENV_LOCAL_PATH) ? fs.readFileSync(ENV_LOCAL_PATH, "utf-8") : "";

    // Normalize root username to iannC69
    if (content.includes("ADMIN_USERNAME=iannC\n") || content.includes("ADMIN_USERNAME=iannC\r\n")) {
      content = content.replace(/ADMIN_USERNAME=iannC/g, "ADMIN_USERNAME=iannC69");
    }

    const envKey = `TEAM_${username.toUpperCase().replace(/[^A-Z0-9_]/g, "_")}_PASS`;

    // Filter out existing line
    const lines = content.split(/\r?\n/).filter((l) => !l.startsWith(`${envKey}=`));

    if (action === "set" && rawPassword) {
      if (!lines.some((l) => l.includes("TEAM PASSWORDS REGISTRY"))) {
        lines.push("");
        lines.push("# ─── TEAM PASSWORDS REGISTRY (AUTO-SYNCED FROM ADMIN) ───");
      }
      lines.push(`${envKey}=${rawPassword}`);
    }

    fs.writeFileSync(ENV_LOCAL_PATH, lines.join("\n").trim() + "\n", "utf-8");
  } catch (err) {
    console.error("Failed to sync admin to .env.local:", err);
  }
}

function initRootMember(): TeamMember {
  const salt = "wf_root_salt_2026";
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || "Parola!123";
  const { hash } = hashPassword(initialPassword, salt);

  // Sync root to .env.local
  syncAdminToEnv("iannC69", initialPassword, "set");

  return {
    id: "user_root_iannc69",
    username: "iannC69",
    displayName: "iannC (Founder & Root)",
    email: "iannc@wildfire.ro",
    role: "root_admin",
    avatarColor: "#ff6b00",
    passwordHash: hash,
    salt,
    permissions: ROOT_PERMISSIONS,
    status: "active",
    isRoot: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
}

export function loadTeamMembers(): TeamMember[] {
  try {
    if (fs.existsSync(TEAM_FILE_PATH)) {
      const raw = fs.readFileSync(TEAM_FILE_PATH, "utf-8");
      const members: TeamMember[] = JSON.parse(raw);
      // Ensure root exists
      const hasRoot = members.some((m) => m.username.toLowerCase() === "iannc69" || m.username.toLowerCase() === "iannc");
      if (!hasRoot) {
        members.unshift(initRootMember());
        saveTeamMembers(members);
      }
      return members;
    }
  } catch (err) {
    console.error("Failed to load team members from disk:", err);
  }

  const initial = [initRootMember()];
  saveTeamMembers(initial);
  return initial;
}

export function saveTeamMembers(members: TeamMember[]): boolean {
  try {
    const dir = path.dirname(TEAM_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TEAM_FILE_PATH, JSON.stringify(members, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save team members to disk:", err);
    return false;
  }
}

export function findTeamMemberByUsername(username: string): TeamMember | null {
  const members = loadTeamMembers();
  const clean = username.trim().toLowerCase();
  return members.find((m) => m.username.toLowerCase() === clean) || null;
}

export function createTeamMember(params: {
  username: string;
  displayName: string;
  email?: string;
  role: "root_admin" | "doc_lead" | "content_editor" | "moderator" | "viewer";
  password: string;
  customPermissions?: Partial<TeamMemberPermissions>;
}): { success: boolean; error?: string; member?: TeamMember } {
  const cleanUsername = params.username.trim();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: "Numele de utilizator trebuie să aibă cel puțin 3 caractere." };
  }

  const members = loadTeamMembers();
  if (members.some((m) => m.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { success: false, error: `Utilizatorul "${cleanUsername}" există deja în echipă.` };
  }

  const salt = `salt_${generateRandomToken(12)}`;
  const { hash } = hashPassword(params.password, salt);
  const basePermissions = ROLE_PRESETS[params.role]?.permissions || ROLE_PRESETS.content_editor.permissions;

  const permissions: TeamMemberPermissions = {
    ...basePermissions,
    ...(params.customPermissions || {}),
    // Only root can ever have canTriggerPanic or canManageTeam
    canTriggerPanic: params.role === "root_admin",
    canManageTeam: params.role === "root_admin",
  };

  const colors = ["#ff6b00", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newMember: TeamMember = {
    id: `user_${generateRandomToken(16)}`,
    username: cleanUsername,
    displayName: params.displayName.trim() || cleanUsername,
    email: params.email?.trim(),
    role: params.role,
    avatarColor,
    passwordHash: hash,
    salt,
    permissions,
    status: "active",
    isRoot: false,
    createdAt: new Date().toISOString(),
  };

  members.push(newMember);
  saveTeamMembers(members);

  // Sync to .env.local
  syncAdminToEnv(cleanUsername, params.password, "set");

  return { success: true, member: newMember };
}

export function updateTeamMember(
  id: string,
  updates: {
    displayName?: string;
    email?: string;
    role?: "root_admin" | "doc_lead" | "content_editor" | "moderator" | "viewer";
    status?: "active" | "suspended";
    permissions?: Partial<TeamMemberPermissions>;
    password?: string;
  }
): { success: boolean; error?: string; member?: TeamMember } {
  const members = loadTeamMembers();
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) {
    return { success: false, error: "Membrul echipei nu a fost găsit." };
  }

  const target = members[idx];

  // Prevent modifying root flags on non-root or demoting root
  if (target.isRoot) {
    if (updates.status === "suspended") {
      return { success: false, error: "Contul Root Super Admin nu poate fi suspendat." };
    }
  }

  if (updates.displayName) target.displayName = updates.displayName.trim();
  if (updates.email !== undefined) target.email = updates.email.trim();
  if (updates.role && !target.isRoot) {
    target.role = updates.role;
    target.permissions = {
      ...ROLE_PRESETS[updates.role].permissions,
      ...(updates.permissions || {}),
      canTriggerPanic: false,
      canManageTeam: false,
    };
  } else if (updates.permissions && !target.isRoot) {
    target.permissions = {
      ...target.permissions,
      ...updates.permissions,
      canTriggerPanic: false,
      canManageTeam: false,
    };
  }

  if (updates.status && !target.isRoot) {
    target.status = updates.status;
  }

  if (updates.password && updates.password.trim()) {
    const salt = `salt_${generateRandomToken(12)}`;
    const { hash } = hashPassword(updates.password.trim(), salt);
    target.passwordHash = hash;
    target.salt = salt;
    // Sync updated password to .env.local
    syncAdminToEnv(target.username, updates.password.trim(), "set");
  }

  members[idx] = target;
  saveTeamMembers(members);

  return { success: true, member: target };
}

export function deleteTeamMember(id: string): { success: boolean; error?: string } {
  const members = loadTeamMembers();
  const target = members.find((m) => m.id === id);
  if (!target) {
    return { success: false, error: "Membrul echipei nu a fost găsit." };
  }
  if (target.isRoot) {
    return { success: false, error: "Contul Root Super Admin (iannC69) este protejat și nu poate fi șters." };
  }

  const filtered = members.filter((m) => m.id !== id);
  saveTeamMembers(filtered);

  // Remove from .env.local
  syncAdminToEnv(target.username, undefined, "remove");

  return { success: true };
}
