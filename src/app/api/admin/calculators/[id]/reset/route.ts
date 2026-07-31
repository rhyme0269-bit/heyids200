import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { resetCalculatorToSeed } from "@/lib/calc-db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const result = resetCalculatorToSeed(id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
