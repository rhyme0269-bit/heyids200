import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getCalculator, updateCalculator, deleteCalculator } from "@/lib/calc-db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const calc = getCalculator(id);
  if (!calc) return NextResponse.json({ error: "計算器不存在" }, { status: 404 });
  return NextResponse.json(calc);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  const calc = updateCalculator(id, {
    title: body.title,
    icon: body.icon,
    description: body.description,
    isVisible: body.isVisible,
    sortOrder: body.sortOrder,
    definition: body.definition,
  });

  if (!calc) return NextResponse.json({ error: "計算器不存在" }, { status: 404 });
  return NextResponse.json(calc);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const result = deleteCalculator(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
