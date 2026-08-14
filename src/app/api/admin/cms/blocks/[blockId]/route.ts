import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { updateBlock, deleteBlock } from "@/lib/cms-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { blockId } = await params;
  const body = await request.json();
  const block = updateBlock(blockId, body);
  if (!block) {
    return NextResponse.json({ error: "區塊不存在" }, { status: 404 });
  }
  return NextResponse.json(block);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { blockId } = await params;
  const deleted = deleteBlock(blockId);
  if (!deleted) {
    return NextResponse.json({ error: "區塊不存在" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
