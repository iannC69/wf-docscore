import { AdminTask } from "@/lib/db";
import { getPublicTeamMembers } from "@/lib/security/teamStore";
import { getPlatformSettings } from "@/lib/security/settingsStore";

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

/**
 * Dispatches a beautifully formatted Discord webhook notification.
 * Pings ONLY the specific team member(s) assigned to the task via their Discord Snowflake ID (<@DISCORD_ID>).
 */
export async function sendDiscordTaskNotification(
  task: AdminTask,
  action: DiscordTaskAction = "created"
): Promise<{ success: boolean; pingsCount: number; error?: string }> {
  const settings = getPlatformSettings();
  const webhookUrl =
    (settings as any).discordWebhookUrl ||
    process.env.DISCORD_WEBHOOK_URL;

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
    contentString = `✅ **Sarcină Finalizată cu Succes pe WF-DOCSCORE!**\n> 🎯 **${task.title}** (Rezolvată de ${assignerTag})`;
    embedTitle = `✅ [SARCINĂ FINALIZATĂ] ${task.title}`;
  } else if (action === "urgent" || task.priority === "urgent") {
    embedColor = 0xf43f5e; // Rose Red
    contentString = `🚨 ${pingsHeader} **ALERTĂ: Ai primit o sarcină URGENTĂ pe WF-DOCSCORE!**\n> 🎯 **${task.title}** · *Necesită atenție prioritară imediată.*`;
    embedTitle = `🔴 [SARCINĂ URGENTĂ] ${task.title}`;
  } else if (action === "assigned") {
    contentString = `📌 ${pingsHeader} **Ai fost asignat la o sarcină pe WF-DOCSCORE!**\n> 🎯 **${task.title}** (Prioritate: **${priorityInfo.label}** • Asignat de ${assignerTag})`;
    embedTitle = `📌 [ASIGNARE SARCINĂ] ${task.title}`;
  } else {
    contentString = `📋 ${pingsHeader} **Ai primit o sarcină nouă pe WF-DOCSCORE!**\n> 🎯 **${task.title}** (Prioritate: **${priorityInfo.label}** • Asignat de ${assignerTag})`;
    embedTitle = `📋 [SARCINĂ NOUĂ TODO] ${task.title}`;
  }

  // 4. Format Assignees field representation (Clean tags without wrapping)
  const assigneesFormatted =
    assignedMembers.length > 0
      ? assignedMembers
          .map((m) => (m.discordId ? `<@${m.discordId}>` : `**@${m.displayName}**`))
          .join(" ")
      : "*Neasignat*";

  // 5. Build Checklist Representation
  let checklistFormatted = "";
  if (task.subtasks && task.subtasks.length > 0) {
    const doneCount = task.subtasks.filter((s) => s.completed).length;
    const percent = Math.round((doneCount / task.subtasks.length) * 100);
    const subtaskLines = task.subtasks.map((st, idx) => {
      const mark = st.completed ? "☑️" : "⬜";
      return `${mark} **${idx + 1}.** ${st.title}`;
    });
    checklistFormatted = `**Progres: ${doneCount}/${task.subtasks.length} finalizate (${percent}%)**\n${subtaskLines.join("\n")}`;
  }

  // 6. Build Clean, Unbroken Embed Fields
  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    {
      name: "👤 Responsabil",
      value: assigneesFormatted,
      inline: true,
    },
    {
      name: "⚡ Prioritate",
      value: `${priorityInfo.icon} **${priorityInfo.label}**`,
      inline: true,
    },
    {
      name: "📊 Status",
      value: `${statusInfo.icon} **${statusInfo.label}**`,
      inline: true,
    },
    {
      name: "📁 Categorie",
      value: `${categoryInfo.icon} **${categoryInfo.label}**`,
      inline: true,
    },
    {
      name: "👑 Asignat de",
      value: assignerTag,
      inline: true,
    },
    {
      name: "📅 Termen Limită",
      value: task.dueDate ? `🗓️ **${task.dueDate}**` : "*Fără termen*",
      inline: true,
    },
  ];

  // Attached Doc details
  if (task.targetDoc) {
    fields.push({
      name: "🔗 Ghid Asociat",
      value: `📖 [**Deschide /docs/${task.targetDoc}**](${siteUrl}/docs/${task.targetDoc}) \n\`content/docs/${task.targetDoc}.md\``,
      inline: false,
    });
  }

  // Subtasks field
  if (checklistFormatted) {
    fields.push({
      name: "☑️ Checklist Subtask-uri",
      value: checklistFormatted,
      inline: false,
    });
  }

  // Quick Action Links
  fields.push({
    name: "⚡ Acțiuni Rapide",
    value: `👉 [**Deschide Task Hub & TODO**](${siteUrl}/admin/tasks) • [**Documentație Publică**](${siteUrl}/docs)`,
    inline: false,
  });

  // Description formatted with blockquote
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
      text: `WildFire Docs v1.8.5 • Sistem Notificări Task Hub`,
    },
    timestamp: new Date().toISOString(),
  };

  // 7. Execute POST request to Discord Webhook
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
