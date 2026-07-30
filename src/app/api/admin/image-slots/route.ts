import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { createImageSlot, updateImageSlot, deleteImageSlot } from "@/lib/db";

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { key, groupId, label, hint, aspectRatio, slotType } = await request.json();
  if (!key || !groupId || !label) {
    return NextResponse.json({ error: "缺少必要欄位（key, groupId, label）" }, { status: 400 });
  }

  const result = createImageSlot({
    key: key.trim().toLowerCase(),
    groupId,
    label: label.trim(),
    hint: hint?.trim(),
    aspectRatio,
    slotType,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.slot);
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { key, label, hint, aspectRatio, slotType } = await request.json();
  if (!key) {
    return NextResponse.json({ error: "缺少 key" }, { status: 400 });
  }

  const updated = updateImageSlot(key, {
    label: label?.trim(),
    hint: hint?.trim(),
    aspectRatio,
    slotType,
  });

  if (!updated) {
    return NextResponse.json({ error: "欄位不存在或無變更" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { key } = await request.json();
  if (!key) {
    return NextResponse.json({ error: "缺少 key" }, { status: 400 });
  }

  const result = deleteImageSlot(key);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
