import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { listCalculators, createCalculator, reorderCalculators } from "@/lib/calc-db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;
  return NextResponse.json(listCalculators());
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "title 為必填" }, { status: 400 });
  }

  const calc = createCalculator({
    title: body.title,
    icon: body.icon,
    description: body.description,
    definition: body.definition,
  });
  return NextResponse.json(calc, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.ids || !Array.isArray(body.ids)) {
    return NextResponse.json({ error: "ids 為必填陣列" }, { status: 400 });
  }

  reorderCalculators(body.ids);
  return NextResponse.json({ success: true });
}
