import { AdminTask } from "@/lib/db";
import { getPublicTeamMembers } from "@/lib/security/teamStore";
import { getPlatformSettings } from "@/lib/security/settingsStore";
import { CURRENT_VERSION } from "@/lib/version";

export type DiscordTaskAction = "created" | "assigned" | "completed" | "urgent";

const CATEGORY_NAMES: Record<string, { label: string; icon: string }> = {
  docs_creation: { label: "Ghid Nou", icon: "✨" },
  docs_update:   { label: "Actualizare Ghid", icon: "📝" },
  review:        { label: "Audit & Review", icon: "🔍" },
  media:         { label: "Asset-uri Media", icon: "🎨" },
  system:        { label: "Mentenanță Sistem", icon: "⚙️" },
  bug_fix:       { label: "Corecție Bug", icon: "🛠️" },
};

const PRIORITY_META: Record<string, { label: string; color: number; icon: string }> = {
  urgent: { label: "URGENT", color: 0xf43f5e, icon: "🔴" },
  high:   { label: "RIDICATĂ", color: 0xff6b00, icon: "🟠" },
  medium: { label: "MEDIE", color: 0xf59e0b, icon: "🟡" },
  low:    { label: "SCĂZUTĂ", color: 0x06b6d4, icon: "🔵" },
};

const STATUS_META: Record<string, { label: string; icon: string }> = {
  todo:        { label: "De Făcut", icon: "📋" },
  in_progress: { label: "În Lucru", icon: "⚡" },
  in_review:   { label: "În Review", icon: "🔍" },
  completed:   { label: "Finalizat", icon: "✅" },
};

function resolveWebhookUrl(): string | null {
  const settings = getPlatformSettings();
  return (
    (settings as any).discordWebhookUrl ||
    process.env.DISCORD_NOTIFICATIONS_WEBHOOK_URL ||
    process.env.DISCORD_TASKS_WEBHOOK_URL ||
    process.env.DISCORD_WEBHOOK_URL ||
    process.env.DISCORD_LOGS_WEBHOOK_URL ||
    null
  );
}

/**
 * Dispatches a beautifully formatted Discord webhook notification.
 * Pings ONLY the specific team member(s) assigned to the task via their Discord Snowflake ID (<@DISCORD_ID>).
 */
export async function sendDiscordTaskNotification(
  task: AdminTask,
  action: DiscordTaskAction = "created"
): Promise<{ success: boolean; pingsCount: number; error?: string }> {
  const webhookUrl = resolveWebhookUrl();

  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    console.log("[Discord Task Webhook] No valid webhook URL configured in env or settings.");
    return { success: false, pingsCount: 0, error: "No webhook URL configured" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const members = getPublicTeamMembers();

  // 1. Resolve assignees and their Discord Snowflake IDs
  const assignedMembers = (task.assignees || []).map((assigneeName) => {
    const found = members.find(
      (m) =>
        m.username.toLowerCase() === assigneeName.toLowerCase() ||
        m.displayName.toLowerCase() === assigneeName.toLowerCase()
    );
    return {
      username: assigneeName,
      displayName: found?.displayName || assigneeName,
      customTitle: found?.customTitle || found?.role || "Membru Echipă",
      avatarUrl: found?.avatarUrl || null,
      discordId: found?.discord && /^\d+$/.test(found.discord.trim()) ? found.discord.trim() : null,
    };
  });

  // 2. Resolve creator / assigner
  const assignerMember = members.find(
    (m) =>
      m.username.toLowerCase() === (task.assignedBy || "").toLowerCase() ||
      m.displayName.toLowerCase() === (task.assignedBy || "").toLowerCase()
  );
  const assignerDiscordId = assignerMember?.discord && /^\d+$/.test(assignerMember.discord.trim())
    ? assignerMember.discord.trim()
    : null;

  const assignerTag = assignerDiscordId
    ? `<@${assignerDiscordId}>`
    : `**@${task.assignedBy || "Admin"}**`;

  // 3. Build Discord mention strings for notification header (<@DISCORD_ID>)
  const discordPings = assignedMembers
    .filter((m) => m.discordId)
    .map((m) => `<@${m.discordId}>`);

  const pingsHeader =
    discordPings.length > 0
      ? discordPings.join(" ")
      : assignedMembers.map((m) => `@${m.displayName}`).join(", ");

  const priorityInfo = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const statusInfo = STATUS_META[task.status] || STATUS_META.todo;
  const categoryInfo = CATEGORY_NAMES[task.category] || { label: task.category, icon: "📁" };

  let embedColor = priorityInfo.color;
  let contentString = "";
  let embedTitle = "";

  if (action === "completed") {
    embedColor = 0x10b981; // Emerald Green
    embedTitle = `✅ Sarcină Finalizată cu Succes • ${task.title}`;
    contentString = `🎉 Felicitări ${pingsHeader}! Sarcina **"${task.title}"** a fost finalizată și marcată ca gata în platformă.`;
  } else if (action === "urgent") {
    embedColor = 0xf43f5e; // Rose Red
    embedTitle = `🚨 [URGENT] Atenție Imediată Necesară • ${task.title}`;
    contentString = `🔥 **ATENȚIE URGENTĂ** ${pingsHeader}! Ai fost asignat de ${assignerTag} la o sarcină cu prioritate maximă.`;
  } else {
    embedColor = 0xff6b00; // WildFire Orange
    embedTitle = `📋 Sarcină Nouă Asignată • ${task.title}`;
    contentString = `👋 Salut ${pingsHeader}! ${assignerTag} ți-a asignat o nouă sarcină în panoul administrativ.`;
  }

  const fields: Array<{ name: string; value: string; inline: boolean }> = [
    {
      name: "🏷️ Categorie",
      value: `${categoryInfo.icon} **${categoryInfo.label}**`,
      inline: true,
    },
    {
      name: "⚡ Prioritate",
      value: `${priorityInfo.icon} **${priorityInfo.label}**`,
      inline: true,
    },
    {
      name: "📊 Status Curent",
      value: `${statusInfo.icon} **${statusInfo.label}**`,
      inline: true,
    },
    {
      name: "👤 Asignat De",
      value: assignerTag,
      inline: true,
    },
    {
      name: "👥 Responsabili",
      value: assignedMembers.length > 0
        ? assignedMembers.map((m) => (m.discordId ? `<@${m.discordId}>` : `@${m.displayName}`)).join(", ")
        : "_Neasignat_",
      inline: true,
    },
    {
      name: "📅 Termen Limită (Due Date)",
      value: task.dueDate ? `🗓️ **${task.dueDate}**` : "_Fără termen specificat_",
      inline: true,
    },
  ];

  if (task.targetDoc) {
    fields.push({
      name: "📖 Ghid Asociat",
      value: `🔗 [**/docs/${task.targetDoc}**](${siteUrl}/docs/${task.targetDoc})`,
      inline: false,
    });
  }

  // Subtasks progress breakdown
  if (task.subtasks && task.subtasks.length > 0) {
    const completedCount = task.subtasks.filter((s) => s.completed).length;
    const checklistFormatted = task.subtasks
      .map((s) => `${s.completed ? "✅" : "⬜"} ${s.title}`)
      .join("\n");

    fields.push({
      name: `☑️ Checklist Progres (${completedCount}/${task.subtasks.length})`,
      value: checklistFormatted,
      inline: false,
    });
  }

  // Quick Action Links
  fields.push({
    name: "⚡ Acțiuni Rapide",
    value: `👉 [**Deschide Task Hub & Răspunde**](${siteUrl}/admin/tasks) • [**Documentație Publică**](${siteUrl}/docs)`,
    inline: false,
  });

  const descriptionText = task.description && task.description.trim()
    ? `>>> 📝 **Instrucțiuni & Cerințe:**\n${task.description.slice(0, 1000)}`
    : "*Nicio instrucțiune suplimentară specificată.*";

  const mainAvatar = assignedMembers.find((m) => m.avatarUrl)?.avatarUrl || "https://avatars.fastly.steamstatic.com/f9a2171998ee2677dae87089953177799dbf7dc1_full.jpg";

  const embed = {
    title: embedTitle,
    url: `${siteUrl}/admin/tasks`,
    description: descriptionText,
    color: embedColor,
    fields,
    thumbnail: {
      url: mainAvatar,
    },
    author: {
      name: "WF-DOCSCORE • Task Hub & Team TODO",
      url: `${siteUrl}/admin/tasks`,
      icon_url: "https://avatars.fastly.steamstatic.com/f9a2171998ee2677dae87089953177799dbf7dc1_full.jpg",
    },
    footer: {
      text: `WildFire Docs v${CURRENT_VERSION} • Sistem Notificări Task Hub`,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: contentString,
        embeds: [embed],
        allowed_mentions: {
          parse: ["users"],
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[Discord Task Webhook] Error response (${res.status}):`, errText);
      return { success: false, pingsCount: discordPings.length, error: `HTTP ${res.status}: ${errText}` };
    }

    return { success: true, pingsCount: discordPings.length };
  } catch (err: any) {
    console.error("[Discord Task Webhook] Dispatch network error:", err);
    return { success: false, pingsCount: 0, error: err.message };
  }
}

/**
 * Dispatches an instant, rich Discord webhook notification when a team member adds a comment / chat note.
 * Pings the assigned admin(s) and task creator with their Discord Snowflake ID (<@DISCORD_ID>).
 */
export async function sendDiscordTaskCommentNotification(
  task: AdminTask,
  comment: { author: string; text: string; avatarUrl?: string }
): Promise<{ success: boolean; pingsCount: number; error?: string }> {
  const webhookUrl = resolveWebhookUrl();

  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    return { success: false, pingsCount: 0, error: "No webhook URL configured" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const members = getPublicTeamMembers();

  // 1. Extract @mentions from comment text (e.g. @Yakuza, @V1ccX, @iannC69)
  const textMentions = (comment.text.match(/@([a-zA-Z0-9_-]+)/g) || []).map((m) =>
    m.replace("@", "").trim()
  );

  // 2. Resolve recipients: assignees + creator + explicitly tagged members, excluding comment author
  const recipientUsernames = Array.from(
    new Set([
      ...(task.assignees || []),
      task.assignedBy,
      ...textMentions,
    ])
  ).filter((u) => u && u.toLowerCase() !== comment.author.toLowerCase());

  const recipientMembers = recipientUsernames.map((username) => {
    const found = members.find(
      (m) =>
        m.username.toLowerCase() === username.toLowerCase() ||
        m.displayName.toLowerCase() === username.toLowerCase()
    );
    return {
      username,
      displayName: found?.displayName || username,
      discordId: found?.discord && /^\d+$/.test(found.discord.trim()) ? found.discord.trim() : null,
      avatarUrl: found?.avatarUrl || null,
    };
  });

  const discordPings = recipientMembers
    .filter((m) => m.discordId)
    .map((m) => `<@${m.discordId}>`);

  const authorMember = members.find(
    (m) =>
      m.username.toLowerCase() === comment.author.toLowerCase() ||
      m.displayName.toLowerCase() === comment.author.toLowerCase()
  );

  const authorDiscordId = authorMember?.discord && /^\d+$/.test(authorMember.discord.trim())
    ? authorMember.discord.trim()
    : null;

  const authorTag = authorDiscordId ? `<@${authorDiscordId}>` : `**@${comment.author}**`;

  const recipientTags = recipientMembers.map((m) =>
    m.discordId ? `<@${m.discordId}>` : `**@${m.displayName}**`
  );
  const recipientTagsStr = recipientTags.length > 0 ? recipientTags.join(", ") : "_Toată echipa_";

  const pingsHeader = discordPings.join(" ");

  const contentString = discordPings.length > 0
    ? `💬 ${pingsHeader} — ${authorTag} ți-a trimis un mesaj nou pe sarcina **"${task.title}"**!`
    : `💬 ${authorTag} a trimis un update în chat-ul sarcinii **"${task.title}"**!`;

  const authorAvatar =
    comment.avatarUrl ||
    authorMember?.avatarUrl ||
    "https://avatars.fastly.steamstatic.com/f9a2171998ee2677dae87089953177799dbf7dc1_full.jpg";

  const embed = {
    title: `💬 Mesaj Nou pe Sarcină • ${task.title}`,
    url: `${siteUrl}/admin/tasks`,
    description: `>>> 📝 ${authorTag} a scris în discuție:\n\n"${comment.text.slice(0, 1000)}"`,
    color: 0xa855f7, // Purple Accent
    fields: [
      {
        name: "📋 Sarcină",
        value: `[**${task.title}**](${siteUrl}/admin/tasks)`,
        inline: true,
      },
      {
        name: "👤 Autor Notă",
        value: authorTag,
        inline: true,
      },
      {
        name: "👥 Destinatari Notificați",
        value: recipientTagsStr,
        inline: true,
      },
      {
        name: "⚡ Răspunde în Panoul Admin",
        value: `👉 [**Deschide Chat & Răspunde pe Sarcină**](${siteUrl}/admin/tasks)`,
        inline: false,
      },
    ],
    thumbnail: {
      url: authorAvatar,
    },
    author: {
      name: `WF-DOCSCORE • @${comment.author}`,
      url: `${siteUrl}/admin/tasks`,
      icon_url: authorAvatar,
    },
    footer: {
      text: `WildFire Docs v${CURRENT_VERSION} • Task Discussion Thread`,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: contentString,
        embeds: [embed],
        allowed_mentions: {
          parse: ["users"],
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[Discord Task Comment Webhook] Error (${res.status}):`, errText);
      return { success: false, pingsCount: discordPings.length, error: `HTTP ${res.status}: ${errText}` };
    }

    return { success: true, pingsCount: discordPings.length };
  } catch (err: any) {
    console.error("[Discord Task Comment Webhook] Network error:", err);
    return { success: false, pingsCount: 0, error: err.message };
  }
}
