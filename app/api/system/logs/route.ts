import { NextResponse } from "next/server";
import { getRealLiveTerminalLogs } from "@/lib/admin/realTelemetry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const realData = getRealLiveTerminalLogs();

  return NextResponse.json({
    success: true,
    telemetry: realData.telemetry,
    logs: realData.logs,
    commits: realData.commits,
  });
}
