import { AuditEvent, AuditAction } from "@/lib/security/audit";
import { getPublicTeamMembers } from "@/lib/security/teamStore";
import { resolveIpGeo } from "@/lib/security/geoip";

interface AuditActionMeta {
  title: string;
  category: "security" | "content" | "system" | "auth";
  color: number;
  icon: string;
}

const ACTION_METAS: Record<AuditAction, AuditActionMeta> = {
  // ── Authentication & Security ──
  AUTH_LOGIN_SUCCESS: {
    title: "Autentificare Reușită în Panoul Admin",
    category: "auth",
    color: 0x10b981, // Emerald
    icon: "🟢",
  },
  AUTH_LOGIN_FAILURE: {
    title: "Tentativă de Autentificare Eșuată",
    category: "security",
    color: 0xf43f5e, // Red / Rose
    icon: "🚨",
  },
  AUTH_LOGOUT: {
    title: "Deconectare Sesiune Administrator",
    category: "auth",
    color: 0x94a3b8, // Slate
    icon: "⚪",
  },
  AUTH_2FA_ENABLED: {
    title: "Autentificare 2FA TOTP Activată",
    category: "security",
    color: 0x10b981,
    icon: "🔐",
  },
  AUTH_2FA_DISABLED: {
    title: "Autentificare 2FA TOTP Dezactivată",
    category: "security",
    color: 0xf59e0b, // Amber
    icon: "⚠️",
  },
  SESSION_REVOKED: {
    title: "Sesiune Revocată Forțat",
    category: "security",
    color: 0xf43f5e,
    icon: "⛔",
  },
  PANIC_LOCKDOWN_TRIGGERED: {
    title: "PANIC LOCKDOWN ACTIVAT DE URGENȚĂ",
    category: "security",
    color: 0xf43f5e,
    icon: "🚨",
  },
  PANIC_LOCKDOWN_RELEASED: {
    title: "Panic Lockdown Ridicat",
    category: "security",
    color: 0x10b981,
    icon: "🛡️",
  },

  // ── Content & Documentation ──
  DOC_CREATE: {
    title: "Ghid Nou Creat în Documentație",
    category: "content",
    color: 0x10b981,
    icon: "✨",
  },
  DOC_UPDATE: {
    title: "Ghid Modificat & Salvat",
    category: "content",
    color: 0x06b6d4, // Cyan
    icon: "📝",
  },
  DOC_DELETE: {
    title: "Ghid Șters din Documentație",
    category: "content",
    color: 0xf43f5e,
    icon: "🗑️",
  },
  DOC_ROLLBACK: {
    title: "Rollback Versiune Ghid Executat",
    category: "content",
    color: 0xa855f7, // Purple
    icon: "⏪",
  },
  DOC_VERSION_SAVE: {
    title: "Snapshot Versiune Ghid Salvat",
    category: "content",
    color: 0x3b82f6,
    icon: "📦",
  },

  // ── System & Maintenance ──
  MAINTENANCE_TOGGLED: {
    title: "Stare Mod Mentenanță Comutată",
    category: "system",
    color: 0xff6b00, // Wildfire Orange
    icon: "🚧",
  },
  SETTINGS_UPDATE: {
    title: "Setări Platformă Actualizate",
    category: "system",
    color: 0xf59e0b,
    icon: "⚙️",
  },
  BACKUP_SNAPSHOT_CREATED: {
    title: "Snapshot Backup Generat",
    category: "system",
    color: 0x10b981,
    icon: "💾",
  },
  BACKUP_SNAPSHOT_RESTORED: {
    title: "RESTAURARE DIN BACKUP EXECUTATĂ",
    category: "system",
    color: 0xf43f5e,
    icon: "⚠️",
  },
  BACKUP_EXPORT: {
    title: "Export Arhivă Backup Descărcat",
    category: "system",
    color: 0x3b82f6,
    icon: "📥",
  },
  SYSTEM_INIT: {
    title: "Sistem Inițializat",
    category: "system",
    color: 0x6366f1,
    icon: "🚀",
  },
  CACHE_REVALIDATED: {
    title: "Cache Revalidat & Curățat",
    category: "system",
    color: 0x06b6d4,
    icon: "⚡",
  },

  // ── Community Reports & Requests ──
  DOC_REPORT_SUBMITTED: {
    title: "Raportare Ghid / Cerere Nouă de la Jucător",
    category: "content",
    color: 0x38bdf8,
    icon: "🚩",
  },

  // ── Media & Assets ──
  MEDIA_UPLOAD: {
    title: "Fișier Media Încărcat în Asset Vault",
    category: "content",
    color: 0x10b981,
    icon: "🖼️",
  },
  MEDIA_DELETE: {
    title: "Fișier Media Șters din Asset Vault",
    category: "content",
    color: 0xf43f5e,
    icon: "🗑️",
  },

  // ── AI Helper Telemetry & Security ──
  AI_ABUSE_DETECTED: {
    title: "Activitate Neobișnuită / Alertă AI Helper",
    category: "security",
    color: 0xf59e0b,
    icon: "🤖",
  },

  // ── Team & Permissions ──
  TEAM_MEMBER_CREATED: {
    title: "Membru Nou Înregistrat în Echipă",
    category: "security",
    color: 0x10b981,
    icon: "👤",
  },
  TEAM_MEMBER_UPDATED: {
    title: "Rol / Permisiuni Membru Modificate",
    category: "security",
    color: 0xf59e0b,
    icon: "🔄",
  },
  TEAM_MEMBER_DELETED: {
    title: "Membru Șters / Revocat din Echipă",
    category: "security",
    color: 0xf43f5e,
    icon: "❌",
  },
};

/**
 * Dispatches an automated, rich Discord Audit Log Embed to the dedicated #logs channel.
 */
export async function dispatchDiscordAuditLog(event: AuditEvent): Promise<{ success: boolean; error?: string }> {
  // Uses dedicated logs webhook URL if set, or falls back to general webhook URL
  const webhookUrl =
    process.env.DISCORD_LOGS_WEBHOOK_URL ||
    process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    return { success: false, error: "No Discord webhook URL configured" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const members = getPublicTeamMembers();
  const geo = await resolveIpGeo(event.ip);

  // Resolve Actor
  const actorMember = members.find(
    (m) =>
      m.username.toLowerCase() === (event.actor || "").toLowerCase() ||
      m.displayName.toLowerCase() === (event.actor || "").toLowerCase()
  );

  const actorDiscordId = actorMember?.discord && /^\d+$/.test(actorMember.discord.trim())
    ? actorMember.discord.trim()
    : null;

  const actorTag = actorDiscordId
    ? `<@${actorDiscordId}>`
    : `**@${event.actor || "System"}**`;

  const meta = ACTION_METAS[event.action] || {
    title: `Eveniment Audit: ${event.action}`,
    category: "system",
    color: 0xff6b00,
    icon: "📌",
  };

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [];
  let contentMention: string | undefined = undefined;
  let customDescription: string | undefined = undefined;

  // ── SPECIAL TAILORED FORMATTING: LOGIN FAILURE ──
  if (event.action === "AUTH_LOGIN_FAILURE") {
    const d = event.details || {};
    const targetedUser = d.targetedAccount || event.actor || "nespecificat";
    const attemptNumber = Number(d.attemptNumber) || 1;
    const maxAttempts = Number(d.maxAttemptsAllowed) || 5;
    const remainingAttempts = Number(d.remainingAttempts) ?? (maxAttempts - attemptNumber);
    const isLockout = Boolean(d.isLockoutActive) || remainingAttempts <= 0;
    const lockoutSec = Number(d.lockoutRemainingSeconds) || 900;

    // Ping ONLY after 3+ consecutive failed attempts or upon lockout!
    if (attemptNumber >= 3 || isLockout) {
      if (isLockout) {
        contentMention = `🚨 <@371621920162185216> **ALERTA SECURITATE:** Accesul a fost **BLOCAT TEMPORAR (15 MIN)** după 5 încercări eșuate pe contul \`${targetedUser}\` (${geo.countryCityString})!`;
      } else {
        contentMention = `⚠️ <@371621920162185216> **AVERTISMENT:** ${attemptNumber} încercări consecutive eșuate de autentificare pe contul \`${targetedUser}\` (${geo.countryCityString})!`;
      }
    }

    customDescription = isLockout
      ? `>>> ⛔ **ACCESUL A FOST BLOCAT TEMPORAR (15 MINUTE)**\nS-a depășit limita maximă de ${maxAttempts} încercări eșuate pentru această conexiune.`
      : `>>> ⚠️ **Tentativă eșuată de autentificare detectată în sistem.**\nÎncercarea **#${attemptNumber}** din maxim **${maxAttempts}** permise.`;

    const attemptText = remainingAttempts === 1 ? "1 rămasă" : `${remainingAttempts} rămase`;

    fields.push(
      {
        name: "🎯 Cont Vizat (Username Încercat)",
        value: `\`${targetedUser}\``,
        inline: true,
      },
      {
        name: "🔍 Stare Cont în Sistem",
        value: d.accountStatus || (actorMember ? `🟢 Existent (${actorMember.displayName})` : "🔴 Cont Inexistent"),
        inline: true,
      },
      {
        name: "🔢 Încercare & Rată",
        value: isLockout
          ? `⛔ **BLOCAT (${Math.round(lockoutSec / 60)} min)**`
          : `⚠️ **Încercarea ${attemptNumber}/${maxAttempts}** (${attemptText})`,
        inline: true,
      },
      {
        name: "📍 Locație (Țară & Oraș)",
        value: `**${geo.countryCityString}**`,
        inline: true,
      },
      {
        name: "💻 Client / Browser",
        value: `\`${d.clientBrowser || event.userAgent || "Browser Nespecificat"}\``,
        inline: true,
      },
      {
        name: "📋 Motiv Eșec",
        value: `\`${d.reason || "Parolă sau utilizator incorect"}\``,
        inline: true,
      }
    );

  // ── SPECIAL TAILORED FORMATTING: LOGIN SUCCESS ──
  } else if (event.action === "AUTH_LOGIN_SUCCESS") {
    fields.push(
      {
        name: "👤 Administrator",
        value: actorTag,
        inline: true,
      },
      {
        name: "👑 Rol / Rang",
        value: actorMember ? `\`${actorMember.role.toUpperCase()}\`` : "`ADMIN`",
        inline: true,
      },
      {
        name: "📍 Locație (Țară & Oraș)",
        value: `**${geo.countryCityString}**`,
        inline: true,
      },
      {
        name: "💻 Dispozitiv / Browser",
        value: `\`${event.userAgent ? event.userAgent.slice(0, 90) : "Web Browser"}\``,
        inline: false,
      }
    );

  // ── SPECIAL TAILORED FORMATTING: PANIC LOCKDOWN ──
  } else if (event.action === "PANIC_LOCKDOWN_TRIGGERED") {
    contentMention = `🚨 <@371621920162185216> **ALERTA DE URGENȚĂ: PANIC LOCKDOWN A FOST ACTIVAT DE ${actorTag}!**`;
    customDescription = `>>> 🚨 **SISTEMUL A FOST BLOCAT DE URGENȚĂ!**\nToate sesiunile administrative au fost suspendate și accesul este restricționat exclusiv la Root Admin.`;
    fields.push(
      { name: "👤 Declanșat de", value: actorTag, inline: true },
      { name: "📍 Locație (Țară & Oraș)", value: `**${geo.countryCityString}**`, inline: true },
      { name: "⚡ Stare Sistem", value: "🔴 **LOCKDOWN ACTIV**", inline: true }
    );

  // ── SPECIAL TAILORED FORMATTING: DOC OPERATIONS ──
  } else if (event.action === "DOC_CREATE" || event.action === "DOC_UPDATE" || event.action === "DOC_DELETE" || event.action === "DOC_ROLLBACK") {
    const d = event.details || {};
    const cleanSlug = d.slug || d.path || "general";
    const actionLabel =
      event.action === "DOC_CREATE" ? "Ghid Nou Creat" :
      event.action === "DOC_DELETE" ? "Ghid ȘTERS" :
      event.action === "DOC_ROLLBACK" ? "Rollback Versiune" : "Ghid Modificat & Salvat";

    customDescription = `>>> 📖 **${actionLabel}:** \`/docs/${cleanSlug}\``;

    fields.push(
      { name: "👤 Autor / Editor", value: actorTag, inline: true },
      { name: "📂 Cale Document", value: `\`${d.path || `content/docs/${cleanSlug}.md`}\``, inline: true },
      { name: "📍 Locație (Țară & Oraș)", value: `**${geo.countryCityString}**`, inline: true },
      {
        name: "🔗 Link Direct Ghid",
        value: event.action === "DOC_DELETE" ? "*Documentul a fost șters din fișiere.*" : `📖 [**Deschide /docs/${cleanSlug}**](${siteUrl}/docs/${cleanSlug})`,
        inline: false,
      }
    );

  // ── SPECIAL TAILORED FORMATTING: COMMUNITY DOC REPORTS ──
  } else if (event.action === "DOC_REPORT_SUBMITTED") {
    const d = event.details || {};
    customDescription = `>>> 🚩 **${d.reportType || "Raport Problemă Ghid"}:** \`/docs/${d.targetSlug || "general"}\`\n${d.description ? `*„${d.description.slice(0, 300)}”*` : ""}`;

    fields.push(
      { name: "👤 Raportat de", value: d.contactDiscord ? `\`${d.contactDiscord}\`` : `*Jucător Anonim*`, inline: true },
      { name: "⚡ Tip Problemă", value: `\`${d.issueType || "Feedback"}\``, inline: true },
      { name: "📍 Locație (Țară & Oraș)", value: `**${geo.countryCityString}**`, inline: true },
      {
        name: "📖 Ghid Vizat",
        value: `[**Deschide /docs/${d.targetSlug || "general"}**](${siteUrl}/docs/${d.targetSlug || "general"})`,
        inline: true,
      },
      {
        name: "📊 Gestiune Raport",
        value: `👉 [**Deschide Panoul de Rapoarte**](${siteUrl}/admin/database)`,
        inline: true,
      }
    );

  // ── SPECIAL TAILORED FORMATTING: TEAM MANAGEMENT ──
  } else if (event.action === "TEAM_MEMBER_CREATED" || event.action === "TEAM_MEMBER_UPDATED" || event.action === "TEAM_MEMBER_DELETED") {
    const d = event.details || {};
    fields.push(
      { name: "👑 Modificat de", value: actorTag, inline: true },
      { name: "👤 Membru Vizat", value: `\`${d.createdUser || d.targetUser || d.targetId || "Nespecificat"}\``, inline: true },
      { name: "⚡ Rol / Rang", value: `\`${(d.role || d.updatedRole || "STAFF").toUpperCase()}\``, inline: true },
      { name: "📍 Locație (Țară & Oraș)", value: `**${geo.countryCityString}**`, inline: true }
    );

  // ── SPECIAL TAILORED FORMATTING: MAINTENANCE & SETTINGS ──
  } else if (event.action === "MAINTENANCE_TOGGLED" || event.action === "SETTINGS_UPDATE") {
    const d = event.details || {};
    fields.push(
      { name: "👤 Administrator", value: actorTag, inline: true },
      { name: "⚙️ Acțiune", value: `\`${event.action}\``, inline: true },
      { name: "📍 Locație (Țară & Oraș)", value: `**${geo.countryCityString}**`, inline: true }
    );
    if (d.reason || d.event) {
      fields.push({
        name: "📋 Detalii Modificare",
        value: `• **Eveniment:** \`${d.event || d.action || "Update"}\`\n• **Motiv:** \`${d.reason || "Optimizare platformă"}\``,
        inline: false,
      });
    }

  // ── SPECIAL TAILORED FORMATTING: BACKUPS ──
  } else if (event.action === "BACKUP_SNAPSHOT_CREATED" || event.action === "BACKUP_SNAPSHOT_RESTORED" || event.action === "BACKUP_EXPORT") {
    const d = event.details || {};
    fields.push(
      { name: "👤 Administrator", value: actorTag, inline: true },
      { name: "💾 Snapshot / Arhivă", value: `\`${d.snapshotId || d.filename || "Backup Curent"}\``, inline: true },
      { name: "📍 Locație (Țară & Oraș)", value: `**${geo.countryCityString}**`, inline: true }
    );

  // ── SPECIAL TAILORED FORMATTING: AI HELPER ALERTS ──
  } else if (event.action === "AI_ABUSE_DETECTED") {
    const d = event.details || {};
    customDescription = `>>> 🤖 **Incident Detectat la Asistentul AI:** \`${d.reason || "Activitate Neobișnuită"}\`${d.querySnippet ? `\n*„${d.querySnippet.slice(0, 180)}”*` : ""}`;
    fields.push(
      { name: "⚡ Tip Alertă", value: `\`${d.reason || "Prompt Abuse"}\``, inline: true },
      { name: "📍 Locație (Țară & Oraș)", value: `**${geo.countryCityString}**`, inline: true },
      { name: "📊 Consum Tokeni", value: d.tokensConsumed ? `\`${d.tokensConsumed.toLocaleString()} tokeni\`` : "`Nespecificat`", inline: true },
      { name: "🛡️ Modul Protecție", value: "`Guardrail Integrity Engine`", inline: true },
      { name: "⚡ Panou Telemetrie", value: `👉 [**Deschide Telemetrie AI (/admin/ai-stats)**](${siteUrl}/admin/ai-stats)`, inline: false }
    );

  // ── SPECIAL TAILORED FORMATTING: ASSET VAULT MEDIA ──
  } else if (event.action === "MEDIA_UPLOAD" || event.action === "MEDIA_DELETE") {
    const d = event.details || {};
    const isDel = event.action === "MEDIA_DELETE";
    customDescription = `>>> 🖼️ **Asset Vault:** Fișierul \`${d.filename || "media"}\` a fost **${isDel ? "ȘTERS" : "ÎNCĂRCAT"}** de ${actorTag}.`;
    fields.push(
      { name: "👤 Administrator", value: actorTag, inline: true },
      { name: "📁 Nume Fișier", value: `\`${d.filename || "media"}\``, inline: true },
      { name: "💾 Mărime & Format", value: `\`${d.sizeFormatted || d.extension || "Nespecificat"}\``, inline: true },
      { name: "📍 Locație (Țară & Oraș)", value: `**${geo.countryCityString}**`, inline: true },
      { name: "⚡ Galerie Media", value: `👉 [**Deschide Asset Vault (/admin/media)**](${siteUrl}/admin/media)`, inline: false }
    );

  // ── GENERAL EVENT FORMATTING ──
  } else {
    fields.push(
      {
        name: "👤 Actor / Admin",
        value: actorTag,
        inline: true,
      },
      {
        name: "📍 Locație (Țară & Oraș)",
        value: `**${geo.countryCityString}**`,
        inline: true,
      }
    );

    if (event.details && Object.keys(event.details).length > 0) {
      const detailsLines = Object.entries(event.details).map(([k, v]) => {
        const formattedVal = typeof v === "object" ? JSON.stringify(v) : String(v);
        return `• **${k}:** \`${formattedVal}\``;
      });
      fields.push({
        name: "📋 Parametri Eveniment",
        value: detailsLines.join("\n").slice(0, 1000),
        inline: false,
      });
    }
  }

  // Cryptographic audit link field
  fields.push({
    name: "🔐 Trasabilitate Criptografică SHA-256",
    value: `\`ID:\` \`${event.id}\` • \`Hash:\` \`${event.hash.slice(0, 16)}...\``,
    inline: false,
  });

  fields.push({
    name: "⚡ Acces Rapid",
    value: `👉 [**Deschide Registrul de Audit (/admin/audit)**](${siteUrl}/admin/audit)`,
    inline: false,
  });

  const embed = {
    title: `${meta.icon} ${meta.title}`,
    url: `${siteUrl}/admin/audit`,
    description: customDescription,
    color: meta.color,
    fields,
    author: {
      name: "WF-DOCSCORE • Security & Admin Audit Stream",
      url: `${siteUrl}/admin/audit`,
      icon_url: "https://avatars.fastly.steamstatic.com/f9a2171998ee2677dae87089953177799dbf7dc1_full.jpg",
    },
    footer: {
      text: `WildFire Docs v1.8.5 • Security Audit Stream`,
    },
    timestamp: event.timestamp || new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: contentMention,
        embeds: [embed],
        allowed_mentions: {
          parse: ["users"],
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[Discord Audit Webhook] Error response (${res.status}):`, errText);
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Discord Audit Webhook] Dispatch error:", err);
    return { success: false, error: err.message };
  }
}
