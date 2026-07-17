import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getServices, replaceServices } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const services = getServices();
  return NextResponse.json(services);
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  replaceServices(body);
  const updated = getServices();
  return NextResponse.json(updated);
}
