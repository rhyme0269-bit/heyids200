import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getBlocksForPage, createBlock, reorderBlocks } from "@/lib/cms-db";
import type { BlockType } from "@/lib/cms-types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  return NextResponse.json(getBlocksForPage(id));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  if (!body.blockType) {
    return NextResponse.json({ error: "blockType 為必填" }, { status: 400 });
  }

  const block = createBlock({
    pageId: id,
    blockType: body.blockType as BlockType,
    sortOrder: body.sortOrder,
    data: body.data,
    config: body.config,
  });

  return NextResponse.json(block, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  if (!body.blockIds || !Array.isArray(body.blockIds)) {
    return NextResponse.json({ error: "blockIds 為必填陣列" }, { status: 400 });
  }

  reorderBlocks(id, body.blockIds);
  return NextResponse.json({ success: true });
}
