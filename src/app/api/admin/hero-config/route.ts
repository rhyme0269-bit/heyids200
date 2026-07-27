import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getHeroConfigs, updateHeroConfigs } from "@/lib/db";
import type { HeroConfig } from "@/lib/db";

const ALLOWED_KEYS = [
  "hero_bg",
  "about_bg",
  "services_bg",
  "contact_bg",
  "faq_bg",
  "tools_bg",
];

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  return NextResponse.json(getHeroConfigs());
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = (await request.json()) as Record<string, HeroConfig>;

  // Validate keys
  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.includes(key)) {
      return NextResponse.json({ error: `無效的 key: ${key}` }, { status: 400 });
    }
    const config = body[key];
    if (!["default", "image", "color"].includes(config.mode)) {
      return NextResponse.json({ error: `無效的 mode: ${config.mode}` }, { status: 400 });
    }
    if (config.mode === "color" && !/^#[0-9a-fA-F]{6}$/.test(config.color)) {
      return NextResponse.json({ error: `無效的顏色格式: ${config.color}` }, { status: 400 });
    }
  }

  updateHeroConfigs(body);
  return NextResponse.json({ success: true });
}
