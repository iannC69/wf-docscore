import { NextResponse } from "next/server";
import { getAuditEvents, verifyAuditChainIntegrity } from "@/lib/security/audit";
import { getPlatformSettings } from "@/lib/security/settingsStore";
import { CURRENT_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());
  const auditEvents = getAuditEvents(12);
  const integrity = verifyAuditChainIntegrity();
  const settings = getPlatformSettings();

  const heapUsedMb = (mem.heapUsed / 1024 / 1024).toFixed(1);
  const heapTotalMb = (mem.heapTotal / 1024 / 1024).toFixed(1);
  const rssMb = (mem.rss / 1024 / 1024).toFixed(1);

  // Generate real server-bound terminal stream entries combining system metrics & actual audit trail
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];

  const systemLogs: { time: string; tag: string; text: string }[] = [];

  // Add process info
  systemLogs.push({
    time: timeStr,
    tag: "PROC",
    text: `PID ${process.pid} • Node ${process.version} • Arch ${process.arch} • Platform ${process.platform}`,
  });

  systemLogs.push({
    time: timeStr,
    tag: "V8_MEM",
    text: `Active Heap: ${heapUsedMb} MB / ${heapTotalMb} MB • RSS: ${rssMb} MB`,
  });

  systemLogs.push({
    time: timeStr,
    tag: "CHAIN",
    text: `Cryptographic SHA-256 Audit Chain: ${integrity.isValid ? "100% VALID" : "COMPROMISED"} (${integrity.totalEvents} events logged)`,
  });

  systemLogs.push({
    time: timeStr,
    tag: "STATUS",
    text: `Maintenance Mode: ${settings.maintenance.enabled ? "ACTIVE (LOCKED)" : "ONLINE (OPEN)"} • Banner: ${settings.announcement.enabled ? "ACTIVE" : "OFF"}`,
  });

  // Map real audit events into stream
  auditEvents.slice(0, 8).forEach((ev) => {
    const evTime = new Date(ev.timestamp).toTimeString().split(" ")[0];
    const detailsStr = ev.details ? Object.entries(ev.details).map(([k, v]) => `${k}=${v}`).join(" ") : "";
    systemLogs.push({
      time: evTime,
      tag: ev.action.replace("AUTH_", "").replace("DOC_", "").substring(0, 5),
      text: `${ev.action} by ${ev.actor} from ${ev.ip} ${detailsStr ? `(${detailsStr})` : ""}`,
    });
  });

  return NextResponse.json({
    success: true,
    telemetry: {
      pid: process.pid,
      uptimeSeconds,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      heapUsedMb: Number(heapUsedMb),
      heapTotalMb: Number(heapTotalMb),
      rssMb: Number(rssMb),
      version: CURRENT_VERSION,
      auditChainValid: integrity.isValid,
      totalAuditEvents: integrity.totalEvents,
      totalDocs: 42,
    },
    logs: systemLogs,
    auditEvents,
  });
}
