import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getAbout, updateAbout } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const about = getAbout();
  return NextResponse.json(about);
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  updateAbout(body);
  const updated = getAbout();
  return NextResponse.json(updated);
}
