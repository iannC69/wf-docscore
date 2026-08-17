import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/security/auth";
import {
  loadTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  ROLE_PRESETS,
  type TeamMember,
} from "@/lib/security/teamStore";
import { recordAuditEvent } from "@/lib/security/audit";

function sanitizeMember(m: TeamMember) {
  const { passwordHash, salt, ...safe } = m;
  return safe;
}

export async function GET() {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const members = loadTeamMembers();
  return NextResponse.json({
    currentUser: {
      username: session.username,
      displayName: session.displayName,
      role: session.role,
      isRoot: session.isRoot,
      permissions: session.permissions,
    },
    members: members.map(sanitizeMember),
    rolePresets: ROLE_PRESETS,
  });
}

export async function POST(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageTeam) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Doar Root Super Admin (iannC69) poate adăuga administratori noi." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { username, displayName, email, role, password, customPermissions } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Numele de utilizator și parola sunt obligatorii." },
        { status: 400 }
      );
    }

    const result = createTeamMember({
      username,
      displayName: displayName || username,
      email,
      role: role || "content_editor",
      password,
      customPermissions,
    });

    if (!result.success || !result.member) {
      return NextResponse.json({ error: "CREATE_FAILED", message: result.error }, { status: 400 });
    }

    recordAuditEvent({
      action: "SETTINGS_UPDATE",
      actor: session.username,
      ip: session.ip,
      details: {
        action: "CREATE_TEAM_MEMBER",
        createdUser: result.member.username,
        role: result.member.role,
      },
    });

    return NextResponse.json({ success: true, member: sanitizeMember(result.member) });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageTeam) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Doar Root Super Admin (iannC69) poate modifica permisiunile echipei." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { id, displayName, email, role, status, permissions, password } = body;

    if (!id) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "ID-ul este obligatoriu." }, { status: 400 });
    }

    const result = updateTeamMember(id, {
      displayName,
      email,
      role,
      status,
      permissions,
      password,
    });

    if (!result.success || !result.member) {
      return NextResponse.json({ error: "UPDATE_FAILED", message: result.error }, { status: 400 });
    }

    recordAuditEvent({
      action: "SETTINGS_UPDATE",
      actor: session.username,
      ip: session.ip,
      details: {
        action: "UPDATE_TEAM_MEMBER",
        targetUser: result.member.username,
        updatedRole: result.member.role,
        status: result.member.status,
      },
    });

    return NextResponse.json({ success: true, member: sanitizeMember(result.member) });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthenticatedAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageTeam) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Doar Root Super Admin (iannC69) poate șterge administratori." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "ID-ul este obligatoriu." }, { status: 400 });
  }

  const result = deleteTeamMember(id);
  if (!result.success) {
    return NextResponse.json({ error: "DELETE_FAILED", message: result.error }, { status: 400 });
  }

  recordAuditEvent({
    action: "SETTINGS_UPDATE",
    actor: session.username,
    ip: session.ip,
    details: { action: "DELETE_TEAM_MEMBER", targetId: id },
  });

  return NextResponse.json({ success: true });
}
