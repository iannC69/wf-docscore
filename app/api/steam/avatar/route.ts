import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("id") || "";

  if (!rawId) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  let xmlUrl = "";
  const clean = rawId.trim();
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
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Steam user not found" }, { status: 404 });
    }
    const text = await res.text();
    const match =
      text.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/) ||
      text.match(/<avatarMedium><!\[CDATA\[(.*?)\]\]><\/avatarMedium>/) ||
      text.match(/<avatarIcon><!\[CDATA\[(.*?)\]\]><\/avatarIcon>/);

    if (match && match[1]) {
      return NextResponse.json({ avatarUrl: match[1] });
    }
    return NextResponse.json({ error: "Avatar not found in profile XML" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch Steam avatar" }, { status: 500 });
  }
}
