import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { listPages, createPage } from "@/lib/cms-db";
import type { HeroMode, PageStatus } from "@/lib/cms-types";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  return NextResponse.json(listPages());
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.slug || !body.title) {
    return NextResponse.json({ error: "slug 和 title 為必填" }, { status: 400 });
  }

  try {
    const page = createPage({
      slug: body.slug as string,
      title: body.title as string,
      subtitle: body.subtitle as string | undefined,
      metaDescription: body.metaDescription as string | undefined,
      templateId: body.templateId as string | undefined,
      heroMode: body.heroMode as HeroMode | undefined,
      heroColor: body.heroColor as string | undefined,
      showInNav: body.showInNav as boolean | undefined,
      navOrder: body.navOrder as number | undefined,
      status: body.status as PageStatus | undefined,
    });
    return NextResponse.json(page, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "此 slug 已存在" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
