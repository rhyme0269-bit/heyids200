import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { listTemplates, createPageFromTemplate } from "@/lib/cms-db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  return NextResponse.json(listTemplates());
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.templateId || !body.slug || !body.title) {
    return NextResponse.json(
      { error: "templateId、slug、title 為必填" },
      { status: 400 }
    );
  }

  try {
    const result = createPageFromTemplate(
      body.templateId,
      body.slug,
      body.title
    );
    if (!result) {
      return NextResponse.json({ error: "模板不存在" }, { status: 404 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("系統保留")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (msg.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "此 slug 已存在" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
