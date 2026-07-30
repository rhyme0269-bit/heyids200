import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { createImageGroup, updateImageGroup, deleteImageGroup } from "@/lib/db";

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { name, description } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "群組名稱不能為空" }, { status: 400 });
  }

  const group = createImageGroup(name.trim(), description?.trim() || "");
  return NextResponse.json(group);
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id, name, description, sortOrder } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "缺少群組 ID" }, { status: 400 });
  }

  const updated = updateImageGroup(id, {
    name: name?.trim(),
    description: description?.trim(),
    sortOrder,
  });

  if (!updated) {
    return NextResponse.json({ error: "群組不存在或無變更" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "缺少群組 ID" }, { status: 400 });
  }

  const result = deleteImageGroup(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
