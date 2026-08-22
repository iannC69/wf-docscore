import { NextResponse } from "next/server";
import { getAuditEvents, verifyAuditChainIntegrity } from "@/lib/security/audit";
import { getActiveSessions, isPanicLockdown } from "@/lib/security/auth";
import { listApiKeys } from "@/lib/security/apiKeys";

export const dynamic = "force-dynamic";

function getDiscordWebhookUrl(): string | null {
  return (
    process.env.DISCORD_LOGS_WEBHOOK_URL ||
    process.env.DISCORD_WEBHOOK_LOGS ||
    process.env.DISCORD_WEBHOOK_AUDIT ||
    process.env.DISCORD_WEBHOOK_SECURITY ||
    process.env.DISCORD_WEBHOOK_URL ||
    null
  );
}

async function dispatchSecuritySnapshot() {
  const webhookUrl = getDiscordWebhookUrl();
  if (!webhookUrl) {
    throw new Error("Webhook-ul Discord nu este configurat (DISCORD_LOGS_WEBHOOK_URL sau DISCORD_WEBHOOK_URL).");
  }

  const isLocked = isPanicLockdown();
  const sessions = getActiveSessions();
  const apiKeys = listApiKeys();
  const chain = verifyAuditChainIntegrity();
  const recentEvents = getAuditEvents(5);

  const eventsText =
    recentEvents
      .map((e) => `🛡️ \`${e.action.replace(/_/g, " ")}\` — **${e.actor}** (\`${e.hash.slice(0, 8)}…\`)`)
      .join("\n") || "_Niciun eveniment recent._";

  const embed = {
    title: "Security Snapshot — WF-DOCSCORE",
    description: `>>> **Raport de securitate generat la ${new Date().toLocaleString("ro-RO")}**`,
    color: isLocked ? 0xef4444 : 0x10b981,
    fields: [
      {
        name: "Panic Lockdown",
        value: isLocked ? "**ACTIV (URGENT)**" : "Clear (Operațional)",
        inline: true,
      },
      {
        name: "Audit Chain",
        value: chain.isValid ? "Verificată (Integritate 100%)" : "**COMPROMISĂ**",
        inline: true,
      },
      {
        name: "Sesiuni Active",
        value: `**${sessions.length}** sesiune/i active`,
        inline: true,
      },
      {
        name: "API Keys Active",
        value: `**${apiKeys.length}** chei active`,
        inline: true,
      },
      {
        name: "Ultimele 5 Evenimente de Audit",
        value: eventsText,
        inline: false,
      },
    ],
    footer: { text: "WF-DOCSCORE Admin · Security Operations" },
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Discord a raspuns cu statusul ${res.status}: ${txt || "Eroare retea"}`);
  }
}

export async function POST() {
  try {
    await dispatchSecuritySnapshot();
    return NextResponse.json({
      success: true,
      message: "Security Snapshot a fost transmis cu succes pe Discord (#logs).",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
