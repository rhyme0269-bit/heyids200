import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getPageById, updatePage, deletePage, getBlocksForPage } from "@/lib/cms-db";

export async function GET(
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

  const blocks = getBlocksForPage(id);
  return NextResponse.json({ ...page, blocks });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const page = updatePage(id, body);
  if (!page) {
    return NextResponse.json({ error: "頁面不存在" }, { status: 404 });
  }
  return NextResponse.json(page);
}

export async function DELETE(
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
  if (page.isSystem) {
    return NextResponse.json({ error: "系統頁面不可刪除" }, { status: 403 });
  }

  deletePage(id);
  return NextResponse.json({ success: true });
}
