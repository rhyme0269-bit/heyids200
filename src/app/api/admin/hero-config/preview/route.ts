import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { updateHeroConfigsPreview, applyHeroConfigsPreview } from "@/lib/db";
import type { HeroConfig } from "@/lib/db";

const ALLOWED_KEYS = [
  "hero_bg",
  "about_bg",
  "services_bg",
  "contact_bg",
  "faq_bg",
  "tools_bg",
];

// PUT: save preview config (temporary)
export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = (await request.json()) as Record<string, HeroConfig>;

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

  updateHeroConfigsPreview(body);
  return NextResponse.json({ success: true });
}

// POST: apply preview → actual
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  applyHeroConfigsPreview();
  return NextResponse.json({ success: true });
}
