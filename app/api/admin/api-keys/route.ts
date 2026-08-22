import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { generateApiKey, listApiKeys, revokeApiKey } from "@/lib/security/apiKeys";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageApiKeys) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Acces Refuzat: Nu ai permisiunea canManageApiKeys pentru a vizualiza cheile API." },
      { status: 403 }
    );
  }

  const keys = listApiKeys();
  return NextResponse.json({ total: keys.length, keys });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? validateSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!session.isRoot && !session.permissions?.canManageApiKeys) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Acces Refuzat: Nu ai permisiunea canManageApiKeys pentru a modifica cheile API." },
      { status: 403 }
    );
  }

  try {
    const { action, name, scope, keyId } = await req.json();

    if (action === "create") {
      if (!name) {
        return NextResponse.json({ error: "Token name is required." }, { status: 400 });
      }

      const { rawToken, record } = generateApiKey({
        name,
        scope: scope || "read_only",
        actor: session.username,
      });

      return NextResponse.json({
        success: true,
        message: "API Key generated successfully. Make sure to copy it now as it won't be shown again.",
        rawToken,
        record,
      });
    }

    if (action === "revoke") {
      if (!keyId) {
        return NextResponse.json({ error: "keyId is required." }, { status: 400 });
      }

      const success = revokeApiKey(keyId, session.username);
      return NextResponse.json({
        success,
        message: "API Key revoked successfully.",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
