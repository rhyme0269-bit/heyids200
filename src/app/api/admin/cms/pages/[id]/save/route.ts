import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getPageById, savePageWithBlocks } from "@/lib/cms-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const page = getPageById(id);
  if (!page) {
    return NextResponse.json({ error: "頁面不存在" }, { status: 404 });
  }

  const body = await request.json();
  const result = savePageWithBlocks(id, body.page ?? {}, body.blocks ?? []);
  return NextResponse.json(result);
}
