import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getServiceFlow, replaceServiceFlow } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const flow = getServiceFlow();
  return NextResponse.json(flow);
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  replaceServiceFlow(body);
  const updated = getServiceFlow();
  return NextResponse.json(updated);
}
