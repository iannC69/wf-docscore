import { NextRequest, NextResponse } from "next/server";
import {
  submitDocReport,
  getAllDocReports,
  updateDocReportStatus,
  deleteDocReport,
  localCreateNotification,
  DocReportRecord,
} from "@/lib/db";
import { recordAuditEvent } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

// Discord Webhook Dispatcher for Reports & Guide Requests
async function sendDiscordReportNotification(report: DocReportRecord) {
  const webhookUrl =
    process.env.DISCORD_LOGS_WEBHOOK_URL ||
    process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isRequest = report.type === "new_guide_request";

  const color = isRequest
    ? 0x38bdf8 // Sky / Cyan
    : report.severity === "high"
    ? 0xf43f5e // Rose / Red
    : report.severity === "medium"
    ? 0xf59e0b // Amber
    : 0x10b981; // Emerald

  const title = isRequest
    ? `[CERERE GHID NOU] ${report.title || "Ghid Solicitat de Jucător"}`
    : `[RAPORT EROARE GHID] ${report.issueType || "Problemă Semnalată"}`;

  const fields = [
    {
      name: "Document / Slug",
      value: `\`${report.slug || "General"}\`\n[Deschide Ghidul](${siteUrl}/docs/${report.slug})`,
      inline: true,
    },
    {
      name: isRequest ? "Categorie Solicitată" : "Severitate",
      value: isRequest
        ? `\`${report.category || "General"}\``
        : `\`${report.severity?.toUpperCase() || "NORMAL"}\``,
      inline: true,
    },
  ];

  if (report.contactDiscord) {
    fields.push({
      name: "Contact Discord",
      value: `\`${report.contactDiscord}\``,
      inline: true,
    });
  }

  const embed = {
    title,
    description: `**Descriere:**\n${report.description}`,
    color,
    fields,
    footer: {
      text: `WildFire Docs Reporting Engine · ID: ${report.id}`,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
  } catch (err) {
    console.error("[Discord Webhook] Failed to send report embed:", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type");
    const statusFilter = searchParams.get("status");

    let reports = await getAllDocReports();

    if (typeFilter) {
      reports = reports.filter((r) => r.type === typeFilter);
    }
    if (statusFilter) {
      reports = reports.filter((r) => r.status === statusFilter);
    }

    return NextResponse.json({ reports }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, slug, issueType, category, severity, title, description, contactDiscord } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: "Missing required fields (type, description)" },
        { status: 400 }
      );
    }

    const ipHash =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anon";

    const report = await submitDocReport({
      type: type === "new_guide_request" ? "new_guide_request" : "issue",
      slug: slug || "general",
      issueType: issueType || (type === "issue" ? "unclear_command" : undefined),
      category: category || undefined,
      severity: severity || "normal",
      title: title?.trim() || undefined,
      description: description.trim(),
      contactDiscord: contactDiscord?.trim() || undefined,
      ip_hash: ipHash,
    });

    // Send Discord notification asynchronously in background
    sendDiscordReportNotification(report).catch(() => {});

    // Create system notification for all staff
    try {
      localCreateNotification({
        isGlobal: true,
        title:
          report.type === "new_guide_request"
            ? `Cerere Ghid Nou: ${report.title || "Ghid Propus de Jucător"}`
            : `Raport Eroare Ghid: /docs/${report.slug}`,
        message:
          report.description.slice(0, 160) +
          (report.description.length > 160 ? "..." : ""),
        category: "report",
        severity:
          report.severity === "high"
            ? "urgent"
            : report.severity === "medium"
            ? "warning"
            : "info",
        link: "/admin/database",
        metadata: { reportId: report.id, slug: report.slug, type: report.type },
      });
    } catch {}

    return NextResponse.json({ success: true, report });

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to submit report" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, resolvedBy } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const updated = await updateDocReportStatus(id, status, resolvedBy);
    if (!updated) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const deleted = await deleteDocReport(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete report" },
      { status: 500 }
    );
  }
}
