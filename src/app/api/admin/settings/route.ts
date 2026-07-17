import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const settings = getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  updateSettings(body);
  const updated = getSettings();
  return NextResponse.json(updated);
}
