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

async function resolveFallbackAvatar(avatarUrl?: string, steamId?: string, discord?: string): Promise<string | undefined> {
  if (avatarUrl && avatarUrl.trim()) {
    return avatarUrl.trim();
  }

  // Fallback 1: Resolve Steam Avatar
  if (steamId && steamId.trim()) {
    const clean = steamId.trim();
    let xmlUrl = "";
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      try {
        const urlObj = new URL(clean);
        xmlUrl = `${urlObj.origin}${urlObj.pathname.replace(/\/+$/, "")}/?xml=1`;
      } catch {
        xmlUrl = `${clean.replace(/\/+$/, "")}/?xml=1`;
      }
    } else if (/^7656119\d{10}$/.test(clean)) {
      xmlUrl = `https://steamcommunity.com/profiles/${clean}/?xml=1`;
    } else {
      xmlUrl = `https://steamcommunity.com/id/${clean}/?xml=1`;
    }

    try {
      const res = await fetch(xmlUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      if (res.ok) {
        const text = await res.text();
        const match =
          text.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/) ||
          text.match(/<avatarMedium><!\[CDATA\[(.*?)\]\]><\/avatarMedium>/) ||
          text.match(/<avatarIcon><!\[CDATA\[(.*?)\]\]><\/avatarIcon>/);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch {}
  }

  // Fallback 2: Resolve Discord Avatar (if numeric User ID)
  if (discord && /^\d{17,20}$/.test(discord.trim())) {
    return `https://dcdn.dstn.to/avatars/${discord.trim()}`;
  }

  return undefined;
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
    const { username, displayName, email, role, password, customPermissions, customTitle, avatarUrl, discord, steamId, githubUsername, bio, responsibilities } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Numele de utilizator și parola sunt obligatorii." },
        { status: 400 }
      );
    }

    const resolvedAvatarUrl = await resolveFallbackAvatar(avatarUrl, steamId, discord);

    const result = createTeamMember({
      username,
      displayName: displayName || username,
      email,
      role: role || "content_editor",
      password,
      customPermissions,
      customTitle,
      avatarUrl: resolvedAvatarUrl,
      discord,
      steamId,
      githubUsername,
      bio,
      responsibilities,
    });

    if (!result.success || !result.member) {
      return NextResponse.json({ error: "CREATE_FAILED", message: result.error }, { status: 400 });
    }

    recordAuditEvent({
      action: "TEAM_MEMBER_CREATED",
      actor: session.username,
      ip: session.ip,
      details: {
        createdUser: result.member.username,
        displayName: result.member.displayName,
        role: result.member.role,
        customTitle: result.member.customTitle || "Membru Staff",
        discordId: result.member.discord || "Nespecificat",
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
    const {
      id,
      username,
      displayName,
      email,
      role,
      status,
      permissions,
      password,
      customTitle,
      avatarUrl,
      avatarColor,
      bio,
      discord,
      steamId,
      githubUsername,
      responsibilities,
      badges,
      docsModifiedCount,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "ID-ul este obligatoriu." }, { status: 400 });
    }

    const resolvedAvatarUrl = await resolveFallbackAvatar(avatarUrl, steamId, discord);

    const result = updateTeamMember(id, {
      username,
      displayName,
      email,
      role,
      status,
      permissions,
      password,
      customTitle,
      avatarUrl: resolvedAvatarUrl,
      avatarColor,
      bio,
      discord,
      steamId,
      githubUsername,
      responsibilities,
      badges,
      docsModifiedCount: typeof docsModifiedCount === "number" ? docsModifiedCount : undefined,
    });

    if (!result.success || !result.member) {
      return NextResponse.json({ error: "UPDATE_FAILED", message: result.error }, { status: 400 });
    }

    recordAuditEvent({
      action: "TEAM_MEMBER_UPDATED",
      actor: session.username,
      ip: session.ip,
      details: {
        targetUser: result.member.username,
        displayName: result.member.displayName,
        updatedRole: result.member.role,
        status: result.member.status,
        permissionsUpdated: Boolean(permissions),
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
    action: "TEAM_MEMBER_DELETED",
    actor: session.username,
    ip: session.ip,
    details: { targetId: id },
  });

  return NextResponse.json({ success: true });
}
